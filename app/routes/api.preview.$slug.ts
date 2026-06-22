/**
 * GET /api/preview/:slug
 *
 * Returns the server-rendered HTML for a page so you can inspect or
 * preview what will appear in the Shopify page body ({{ page.content }}).
 *
 * Open this URL in any browser tab while the dev server is running:
 *   https://<tunnel>/api/preview/<slug>
 */

import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { verifyPreviewToken } from "../lib/preview-token.server";
import { getPageBySlug } from "../lib/pages.server";
import { isValidPuckData } from "../lib/page-schema";
import { renderPreviewBody } from "../lib/puck-renderer";
import { resolvePageBlocks } from "../lib/resolve-blocks";
import { getAllGlobalBlocks } from "../lib/global-blocks.server";
import { getSavedBlocks } from "../lib/saved-blocks.server";
import { getGlobalSettings, settingsToCSSString, buildGoogleFontsImport } from "../lib/settings.server";
import { collectBlockFonts } from "../lib/puck-renderer";
import { DEFAULT_GLOBAL_SETTINGS } from "../lib/settings.defaults";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const slug = params.slug!;

  // The preview opens in a top-level tab (so refresh/screenshots/extensions all
  // work on a real URL), which doesn't carry the embedded-app admin session.
  // Authorize via a signed token in the URL; if absent, fall back to the admin
  // session so the route still works when opened directly inside the app.
  const url = new URL(request.url);
  const tokenShop = verifyPreviewToken(url.searchParams.get("token"));
  let shop: string;
  if (tokenShop) {
    shop = tokenShop;
  } else {
    const { session } = await authenticate.admin(request);
    shop = session.shop;
  }

  const page = await getPageBySlug(shop, slug);
  if (!page) {
    return new Response("<h1>Page not found</h1>", {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  }

  let data: unknown;
  try {
    data = JSON.parse(page.data);
  } catch {
    return new Response("<h1>Stored page data is corrupt</h1>", {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }

  if (!isValidPuckData(data)) {
    return new Response("<h1>Invalid PuckData structure</h1>", {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }

  let settings = DEFAULT_GLOBAL_SETTINGS;
  try {
    settings = await getGlobalSettings(shop);
  } catch {
    // fall through to defaults
  }

  // Expand GlobalBlock / SavedBlock references into their real items before
  // rendering — otherwise the string renderer (which only knows concrete
  // component types) drops them and the preview comes out blank.
  let resolved = data;
  try {
    const [globalBlocks, savedBlocks] = await Promise.all([
      getAllGlobalBlocks(shop),
      getSavedBlocks(shop),
    ]);
    const globalBlocksMap = Object.fromEntries(globalBlocks.map((b) => [b.id, b]));
    const savedBlocksMap = Object.fromEntries(savedBlocks.map((b) => [b.name, b]));
    resolved = resolvePageBlocks(data, globalBlocksMap, savedBlocksMap);
  } catch {
    // If block lookup fails, fall back to rendering the unresolved data.
  }

  let body: string;
  try {
    body = renderPreviewBody(resolved, settings);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(`<h1>Render error</h1><pre>${escHtml(msg)}</pre>`, {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }

  // Inject the same design tokens the storefront uses so the preview matches
  // the Puck editor canvas. The block markup references var(--primary-color),
  // var(--heading-font), etc.; without this :root block they fall back to
  // hardcoded defaults and the preview ignores the merchant's settings.
  const fontsImport = buildGoogleFontsImport([
    settings.fontFamily ?? "",
    settings.headingFont ?? "",
    ...collectBlockFonts(resolved),
  ]);
  const tokenCss = settingsToCSSString(settings);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!-- Never cache the preview: a hard or soft refresh must always re-fetch the
       latest saved page data so editor changes show up immediately. -->
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
  <title>Preview: ${escHtml(page.title)}</title>
  <style>
    ${fontsImport}
    ${tokenCss}
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: var(--font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif); }
    /* Default responsive images, but never override a block that sets its own
       explicit width/height inline (e.g. Photo Collage grid/brick/carousel cells
       use width:100%;height:100% with aspect-ratio). */
    img:not([style*="height"]) { max-width: 100%; height: auto; }
    html, body { overflow-x: hidden; }
  </style>
</head>
<body>
${body}
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      // Hard no-cache so refreshes always hit the loader and re-render fresh data.
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
};

function escHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
