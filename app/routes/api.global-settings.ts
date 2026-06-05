import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getGlobalSettings, saveGlobalSettings } from "../lib/settings.server";
import { getAllPages } from "../lib/pages.server";
import { savePageToShopify, saveShopChromeMetafield } from "../lib/shopify-pages.server";
import { isValidPuckData } from "../lib/page-schema";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const settings = await getGlobalSettings(session.shop);
  return new Response(JSON.stringify(settings), {
    headers: { "Content-Type": "application/json" },
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { globalSettings, republish } = (await request.json()) as {
    globalSettings: Parameters<typeof saveGlobalSettings>[1];
    republish?: boolean;
  };

  await saveGlobalSettings(session.shop, globalSettings);

  // Mirror the rendered chrome bundle to a shop-level metafield. The Page
  // Builder theme app embed block reads this and renders it on every
  // storefront page (home, products, collections) — not just builder pages.
  // Non-blocking: even if this fails, builder pages still get the chrome
  // via {{ page.content }}.
  saveShopChromeMetafield(admin, globalSettings).catch((err) => {
    console.error(`[global-settings] chrome metafield save failed for ${session.shop}:`, err);
  });

  // When the global header/footer (or any chrome-affecting setting) changes
  // we re-publish every page so the storefront picks up the new HTML. This
  // is fire-and-forget — Shopify rate limits + many-page shops mean we don't
  // want the editor's save UI blocked on it.
  if (republish) {
    republishAllPages(admin, session.shop, globalSettings).catch((err) => {
      console.error(`[global-settings] bulk republish failed for ${session.shop}:`, err);
    });
  }

  return new Response(JSON.stringify({ ok: true, republishing: !!republish }), {
    headers: { "Content-Type": "application/json" },
  });
};

/**
 * Re-render and re-publish every page on this shop with the new global
 * settings baked in (header, footer, CSS tokens, etc.).
 *
 * Runs sequentially to stay safely under Shopify Admin GraphQL rate limits
 * even on shops with many pages.
 */
async function republishAllPages(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  shop: string,
  settings: Parameters<typeof saveGlobalSettings>[1],
): Promise<void> {
  const pages = await getAllPages(shop);
  for (const page of pages) {
    try {
      const data = JSON.parse(page.data);
      if (!isValidPuckData(data)) continue;
      await savePageToShopify({
        admin,
        shop,
        slug: page.slug,
        title: page.title,
        data,
        settings,
      });
    } catch (err) {
      console.error(`[global-settings] republish ${page.slug} failed:`, err);
    }
  }
}
