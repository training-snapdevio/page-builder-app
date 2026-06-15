/**
 * GET /apps/pb-widget
 *
 * Shopify App Proxy endpoint.
 * Shopify forwards storefront requests:
 *   https://{shop}/apps/pb-widget?block_id=my-slug
 * to this route, appending shop + HMAC params for verification.
 *
 * The route reads from the Prisma DB (not from the Shopify page), so it works
 * even when the page is saved as a draft on Shopify.
 *
 * Response shape consumed by pb-widget-loader.js:
 *   { blockId, pageTitle, widgetConfig: { type: "page", html: "..." } }
 */

import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getPageBySlug } from "../lib/pages.server";
import { getGlobalSettings } from "../lib/settings.server";
import { DEFAULT_GLOBAL_SETTINGS } from "../lib/settings.defaults";
import { getAllGlobalBlocks } from "../lib/global-blocks.server";
import { getSavedBlocks } from "../lib/saved-blocks.server";
import { resolvePageBlocks } from "../lib/resolve-blocks";
import { renderPageContentOnly, renderGlobalStyleCss, collectBlockFonts } from "../lib/puck-renderer";
import { settingsToCSSString, buildGoogleFontsImport } from "../lib/settings.server";
import type { PuckData } from "../lib/page-schema";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Accept, Content-Type",
};

/**
 * Reset stylesheet for "Use Shopify theme styles" mode.
 *
 * The rendered block HTML carries hardcoded inline styles (colors, font-family,
 * padding, border-radius). Inline styles beat normal CSS, so the only way to let
 * the host theme's styling win is to override those declarations with !important
 * and reset them to `inherit` / `revert`, which makes the theme cascade apply.
 *
 * Every selector is anchored on `:root` so the loader can rewrite it to the
 * widget container id — these rules stay scoped to the widget and never leak.
 *
 * Scope covered (per the merchant's request): colors, fonts, and spacing.
 */
function buildThemeResetCss(): string {
  return [
    // --- Typography: inherit the theme's font + text color everywhere ---
    `:root, :root *{`,
    `  font-family:inherit!important;`,
    `  color:inherit!important;`,
    `  letter-spacing:inherit!important;`,
    `}`,
    // Headings: let the theme define their own size/weight/line-height
    `:root h1, :root h2, :root h3, :root h4, :root h5, :root h6{`,
    `  font-size:revert!important;`,
    `  font-weight:revert!important;`,
    `  line-height:revert!important;`,
    `}`,
    // Body text size/line-height follows the theme
    `:root, :root p, :root span, :root li, :root a{`,
    `  font-size:revert!important;`,
    `  line-height:inherit!important;`,
    `}`,

    // --- Colors: drop baked-in backgrounds/borders so the theme shows through.
    // Buttons + links keep their interactive look from the theme, not the app. ---
    `:root .pb-btn, :root button, :root a.pb-btn{`,
    `  background:revert!important;`,
    `  color:revert!important;`,
    `  border-color:revert!important;`,
    `  border-radius:revert!important;`,
    `}`,

    // --- Spacing: neutralize hardcoded padding/margin/radius on layout wrappers.
    // We DON'T touch grid/flex containers' structural gaps — only visual spacing
    // that the theme would otherwise own. Scoped to the content wrapper. ---
    `:root .pb-page-content > *{`,
    `  border-radius:revert!important;`,
    `}`,
  ].join("\n");
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      // Cache 5 min on CDN; the loader re-fetches on each page load
      "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
      ...CORS_HEADERS,
    },
  });
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const blockId = url.searchParams.get("block_id")?.trim();

  if (!blockId) {
    return jsonResponse({ error: "block_id is required" }, 400);
  }

  // Verify the Shopify App Proxy HMAC signature. This THROWS a Response (401)
  // if the signature is missing or invalid, so requests that don't originate
  // from Shopify's proxy are rejected — no insecure ?shop= fallback.
  const { session } = await authenticate.public.appProxy(request);

  // The shop is trustworthy ONLY because the HMAC above passed. Shopify appends
  // it to the forwarded request; the `session` is present when the app is
  // installed on that shop.
  const shop = session?.shop ?? url.searchParams.get("shop") ?? "";
  if (!shop) {
    return jsonResponse({ error: "Could not determine shop" }, 400);
  }

  try {
    const page = await getPageBySlug(shop, blockId);
    if (!page) {
      return jsonResponse({ error: "Block not found", blockId }, 404);
    }

    // Only serve pages the merchant has explicitly published. Drafts and
    // in-progress (generating) pages must not be readable on the storefront.
    if (page.status !== "exported") {
      return jsonResponse({ error: "Block not published", blockId }, 404);
    }

    let puckData: PuckData;
    try {
      puckData = (typeof page.data === "string" ? JSON.parse(page.data) : page.data) as PuckData;
    } catch {
      return jsonResponse({ error: "Invalid page data" }, 500);
    }

    // Resolve GlobalBlock / SavedBlock references (same as the publish path)
    const settings = (await getGlobalSettings(shop)) ?? DEFAULT_GLOBAL_SETTINGS;
    let resolved = puckData;
    try {
      const [globalBlocks, savedBlocks] = await Promise.all([
        getAllGlobalBlocks(shop),
        getSavedBlocks(shop),
      ]);
      const globalMap = Object.fromEntries(globalBlocks.map((b) => [b.id, b]));
      const savedMap  = Object.fromEntries(savedBlocks.map((b) => [b.name, b]));
      resolved = resolvePageBlocks(puckData, globalMap, savedMap);
    } catch {
      // Non-fatal — render with unresolved references
    }

    // Content markup is always the same — styling is what the toggle controls.
    const html = renderPageContentOnly(resolved);

    const useThemeStyles = url.searchParams.get("theme_styles") === "1";

    // Toggle OFF (default): render exactly like the Puck editor canvas. The block
    // markup references design tokens via var(--primary-color) etc., and we inject
    // the same :root token block the editor injects (settingsToCSSString) so the
    // storefront output is visually identical to what the merchant designed.
    //
    // Toggle ON: hand styling to the host Shopify theme. The block markup still
    // carries token-based inline styles, so we inject a scoped RESET that strips
    // those tokens (color/font/spacing) and lets the surrounding theme cascade in.
    //
    // The loader rewrites every `:root` selector to `#<container-id>`, so all
    // rules stay scoped to this widget and never leak into the theme.
    const styleCss = useThemeStyles
      ? buildThemeResetCss()
      : buildGoogleFontsImport([settings.fontFamily ?? "", settings.headingFont ?? "", ...collectBlockFonts(resolved)])
        + settingsToCSSString(settings) + "\n" + renderGlobalStyleCss(settings);

    return jsonResponse({
      blockId,
      pageTitle: page.title,
      widgetConfig: {
        type: "page",
        html,
        styleCss,
        useThemeStyles,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[apps.pb-widget] error for block "${blockId}":`, message);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
};
