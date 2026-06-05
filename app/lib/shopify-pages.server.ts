/**
 * shopify-pages.server.ts
 *
 * Shopify Admin GraphQL helpers for:
 *   - Finding (or creating) a Shopify Online Store Page by handle
 *   - Saving Puck data to a metafield (namespace: page_builder / key: content)
 *   - Reading that metafield back
 *
 * Server-only — never import from client bundles.
 */

import type { PuckData, PageMetafieldValue } from "./page-schema";
import { buildMetafieldValue, isValidPageMetafieldValue } from "./page-schema";
import { renderChromeBundle, renderPageWithChrome, SHOPIFY_PAGE_BODY_LIMIT } from "./puck-renderer";
import type { GlobalSettings } from "./settings.defaults";
import { DEFAULT_GLOBAL_SETTINGS } from "./settings.defaults";
import { getGlobalSettings, settingsToCSSString } from "./settings.server";
import { resolvePageBlocks } from "./resolve-blocks";
import { getAllGlobalBlocks } from "./global-blocks.server";
import { getSavedBlocks } from "./saved-blocks.server";

// ─── Constants ────────────────────────────────────────────────────────────────

const MF_NAMESPACE = "page_builder";
const MF_KEY = "content";
/** Shop-level metafields consumed by the Page Builder theme app embed block. */
const SHOP_CHROME_NAMESPACE = "page_builder";
const SHOP_CHROME_KEY = "global_chrome";
const SHOP_STYLES_KEY = "global_styles";
/** Boolean flags so the embed liquid can render hide-CSS without parsing HTML. */
const SHOP_HIDE_HEADER_KEY = "hide_native_header";
const SHOP_HIDE_FOOTER_KEY = "hide_native_footer";

// ─── Internal type ────────────────────────────────────────────────────────────

interface AdminClient {
  graphql(
    query: string,
    options?: { variables?: Record<string, unknown> },
  ): Promise<Response>;
}

// ─── GraphQL documents ────────────────────────────────────────────────────────

const FIND_PAGE_QUERY = `#graphql
  query FindPageByHandle($query: String!) {
    pages(first: 1, query: $query) {
      edges {
        node {
          id
          handle
          title
        }
      }
    }
  }
`;

const GET_PAGE_METAFIELD_QUERY = `#graphql
  query GetPageMetafield($id: ID!, $namespace: String!, $key: String!) {
    page(id: $id) {
      id
      handle
      title
      metafield(namespace: $namespace, key: $key) {
        id
        value
        updatedAt
      }
    }
  }
`;

const CREATE_PAGE_MUTATION = `#graphql
  mutation PageCreate($page: PageCreateInput!) {
    pageCreate(page: $page) {
      page {
        id
        handle
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const METAFIELDS_SET_MUTATION = `#graphql
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        namespace
        key
        value
        updatedAt
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

const PAGE_UPDATE_BODY_MUTATION = `#graphql
  mutation PageUpdateBody($id: ID!, $page: PageUpdateInput!) {
    pageUpdate(id: $id, page: $page) {
      page {
        id
        body
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip a leading "/" so "home" and "/home" both map to handle "home". */
function toHandle(slug: string): string {
  return slug.replace(/^\/+/, "");
}

/**
 * Fallback markup written to `page.body` when the rendered HTML is too large
 * for Shopify's 512 KB cap. Themes with the Page Builder app block enabled
 * see the real content (rendered client-side from the page metafield by
 * `extensions/page-builder-renderer/assets/builder.js`). Themes without it
 * see this notice — actionable rather than a save failure.
 */
const PAGE_BODY_OVERFLOW_FALLBACK =
  `<div class="pb-body-fallback" style="padding:48px 24px;text-align:center;color:#6b7280;font-family:system-ui,-apple-system,sans-serif">` +
  `<p style="margin:0;font-size:14px">This page is rendered by the Page Builder app block.</p>` +
  `<p style="margin:8px 0 0;font-size:13px;opacity:.7">If you see this notice on the storefront, enable the Page Builder block in your theme's page template.</p>` +
  `</div>`;

/**
 * Write rendered HTML into the Shopify page body so `{{ page.content }}` renders
 * it. When the body exceeds Shopify's 512 KB cap we degrade to a tiny notice
 * instead of failing the save — the metafield write (above this in
 * savePageToShopify) holds the full data, and the theme app block renders it.
 */
async function setPageBody(
  admin: AdminClient,
  pageId: string,
  html: string,
): Promise<void> {
  let body = html;
  const byteLength = new TextEncoder().encode(html).length;
  if (byteLength > SHOPIFY_PAGE_BODY_LIMIT) {
    body = PAGE_BODY_OVERFLOW_FALLBACK;
    const usedKb = Math.round(byteLength / 1024);
    const limitKb = Math.round(SHOPIFY_PAGE_BODY_LIMIT / 1024);
    console.warn(
      `[page-builder] page body ${usedKb} KB exceeds ${limitKb} KB — wrote fallback to page.body; rendering will come from the page metafield via the theme app block.`,
    );
  }

  const res = await admin.graphql(PAGE_UPDATE_BODY_MUTATION, {
    variables: { id: pageId, page: { body } },
  });
  const json = (await res.json()) as {
    data?: {
      pageUpdate?: {
        userErrors?: { field: string; message: string }[];
      };
    };
  };
  const errors = json.data?.pageUpdate?.userErrors ?? [];
  if (errors.length) {
    throw new Error(`pageUpdate body failed: ${errors.map((e) => e.message).join(", ")}`);
  }
}

/** Find a Shopify Page GID by its URL handle. Returns null if not found. */
async function findShopifyPageId(
  admin: AdminClient,
  handle: string,
): Promise<string | null> {
  const res = await admin.graphql(FIND_PAGE_QUERY, {
    variables: { query: `handle:${handle}` },
  });
  const json = (await res.json()) as {
    data?: { pages?: { edges?: { node: { id: string } }[] } };
  };
  return json.data?.pages?.edges?.[0]?.node?.id ?? null;
}

/**
 * Find an existing Shopify Page or create one if it doesn't exist yet.
 * Returns the Shopify GID (e.g. "gid://shopify/OnlineStorePage/123").
 */
async function findOrCreateShopifyPage(
  admin: AdminClient,
  handle: string,
  title: string,
): Promise<string> {
  const existing = await findShopifyPageId(admin, handle);
  if (existing) return existing;

  const res = await admin.graphql(CREATE_PAGE_MUTATION, {
    variables: { page: { title, handle, isPublished: true } },
  });
  const json = (await res.json()) as {
    data?: {
      pageCreate?: {
        page?: { id: string };
        userErrors?: { field: string; message: string }[];
      };
    };
  };

  const errors = json.data?.pageCreate?.userErrors ?? [];
  if (errors.length) {
    throw new Error(`pageCreate failed: ${errors.map((e) => e.message).join(", ")}`);
  }

  const pageId = json.data?.pageCreate?.page?.id;
  if (!pageId) throw new Error("pageCreate returned no page id");
  return pageId;
}

const SHOP_ID_QUERY = `#graphql
  query ShopId {
    shop {
      id
    }
  }
`;

/**
 * Write the rendered chrome bundle (style + script + header + footer HTML)
 * to a shop-level metafield so the theme app embed block can render it on
 * every storefront page — including home, products, collections, and any
 * page not built by Page Builder.
 *
 * When chrome is disabled (neither toggle on) we write an empty string so
 * the embed renders nothing.
 *
 * Best-effort: failures are logged but never thrown, since chrome on the
 * page body itself is the primary delivery path.
 */
export async function saveShopChromeMetafield(
  admin: AdminClient,
  settings: GlobalSettings,
): Promise<void> {
  try {
    const idRes = await admin.graphql(SHOP_ID_QUERY);
    const idJson = (await idRes.json()) as { data?: { shop?: { id: string } } };
    const shopId = idJson.data?.shop?.id;
    if (!shopId) {
      console.warn("[page-builder] saveShopChromeMetafield: shop ID lookup failed");
      return;
    }

    const chromeHtml = renderChromeBundle(settings);
    const globalStylesCss = settingsToCSSString(settings);
    const hideHeader = settings.useCustomHeader ? "true" : "false";
    const hideFooter = settings.useCustomFooter ? "true" : "false";

    const res = await admin.graphql(METAFIELDS_SET_MUTATION, {
      variables: {
        metafields: [
          {
            ownerId: shopId,
            namespace: SHOP_CHROME_NAMESPACE,
            key: SHOP_CHROME_KEY,
            // multi_line_text_field lets liquid emit the raw HTML via
            // `shop.metafields.page_builder.global_chrome` without escape.
            type: "multi_line_text_field",
            value: chromeHtml,
          },
          {
            ownerId: shopId,
            namespace: SHOP_CHROME_NAMESPACE,
            key: SHOP_STYLES_KEY,
            // Exposed in liquid as shop.metafields.page_builder.global_styles
            // and emitted in <style data-page-builder="settings">...</style>
            type: "multi_line_text_field",
            value: globalStylesCss,
          },
          {
            ownerId: shopId,
            namespace: SHOP_CHROME_NAMESPACE,
            key: SHOP_HIDE_HEADER_KEY,
            type: "single_line_text_field",
            value: hideHeader,
          },
          {
            ownerId: shopId,
            namespace: SHOP_CHROME_NAMESPACE,
            key: SHOP_HIDE_FOOTER_KEY,
            type: "single_line_text_field",
            value: hideFooter,
          },
        ],
      },
    });

    const json = (await res.json()) as {
      data?: {
        metafieldsSet?: {
          userErrors?: { field: string; message: string; code: string }[];
        };
      };
    };
    const errors = json.data?.metafieldsSet?.userErrors ?? [];
    if (errors.length) {
      console.warn(
        `[page-builder] saveShopChromeMetafield userErrors: ${errors.map((e) => e.message).join(", ")}`,
      );
    }
  } catch (err) {
    console.warn("[page-builder] saveShopChromeMetafield failed (non-fatal):", err);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface SavePageToShopifyParams {
  admin: AdminClient;
  shop: string;
  slug: string;
  title: string;
  data: PuckData;
  /**
   * Optional pre-fetched global settings. When omitted we look them up by
   * shop. Pass them explicitly during bulk re-publishes to avoid N+1 DB hits.
   */
  settings?: GlobalSettings;
}

/**
 * Persist Puck page data to a Shopify metafield.
 * Creates the Shopify page if it doesn't exist yet.
 */
export async function savePageToShopify({
  admin,
  shop,
  slug,
  title,
  data,
  settings,
}: SavePageToShopifyParams): Promise<{ shopifyPageId: string }> {
  const handle = toHandle(slug);
  const shopifyPageId = await findOrCreateShopifyPage(admin, handle, title);

  const payload: PageMetafieldValue = buildMetafieldValue(slug, title, data);

  const res = await admin.graphql(METAFIELDS_SET_MUTATION, {
    variables: {
      metafields: [
        {
          ownerId: shopifyPageId,
          namespace: MF_NAMESPACE,
          key: MF_KEY,
          type: "json",
          value: JSON.stringify(payload),
        },
      ],
    },
  });

  // Metafield save is best-effort — Shopify enforces a 10 MB combined limit
  // across all metafields. If the page data exceeds that we log a warning but
  // still continue so the rendered HTML is always written to the page body.
  try {
    const mfJson = (await res.json()) as {
      data?: {
        metafieldsSet?: {
          userErrors?: { field: string; message: string; code: string }[];
        };
      };
    };
    const mfErrors = mfJson.data?.metafieldsSet?.userErrors ?? [];
    if (mfErrors.length) {
      console.warn(`[page-builder] metafield sync skipped: ${mfErrors.map((e) => e.message).join(", ")}`);
    }
  } catch (err) {
    console.warn("[page-builder] metafield sync failed (non-fatal):", err);
  }

  // Resolve GlobalBlock / SavedBlock references into real content before
  // rendering — same step the preview route does. Without this, any block
  // whose content lives in a DropZone (Section templates, Container, Grid,
  // GlobalBlock, SavedBlock) renders blank on the Shopify storefront.
  const effectiveSettings = settings ?? (await getGlobalSettings(shop)) ?? DEFAULT_GLOBAL_SETTINGS;
  let resolvedData = data;
  try {
    const [globalBlocks, savedBlocks] = await Promise.all([
      getAllGlobalBlocks(shop),
      getSavedBlocks(shop),
    ]);
    const globalBlocksMap = Object.fromEntries(globalBlocks.map((b) => [b.id, b]));
    const savedBlocksMap  = Object.fromEntries(savedBlocks.map((b) => [b.name, b]));
    resolvedData = resolvePageBlocks(data, globalBlocksMap, savedBlocksMap);
  } catch (err) {
    console.warn("[page-builder] block resolution failed — rendering unresolved data:", err);
  }
  const html = renderPageWithChrome(resolvedData, effectiveSettings);
  await setPageBody(admin, shopifyPageId, html);

  return { shopifyPageId };
}

export interface GetPageFromShopifyResult {
  shopifyPageId: string;
  payload: PageMetafieldValue;
}

/**
 * Read Puck page data from a Shopify metafield.
 * Returns null if the page or metafield doesn't exist.
 */
export async function getPageFromShopify(
  admin: AdminClient,
  slug: string,
): Promise<GetPageFromShopifyResult | null> {
  const handle = toHandle(slug);
  const shopifyPageId = await findShopifyPageId(admin, handle);
  if (!shopifyPageId) return null;

  const res = await admin.graphql(GET_PAGE_METAFIELD_QUERY, {
    variables: { id: shopifyPageId, namespace: MF_NAMESPACE, key: MF_KEY },
  });

  const json = (await res.json()) as {
    data?: {
      page?: {
        id: string;
        metafield?: { value: string } | null;
      };
    };
  };

  const raw = json.data?.page?.metafield?.value;
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isValidPageMetafieldValue(parsed)) return null;

  return { shopifyPageId, payload: parsed };
}
