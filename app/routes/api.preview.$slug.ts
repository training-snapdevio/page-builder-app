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
import { getPageBySlug } from "../lib/pages.server";
import { isValidPuckData } from "../lib/page-schema";
import { renderPreviewBody } from "../lib/puck-renderer";
import { resolvePageBlocks } from "../lib/resolve-blocks";
import { getAllGlobalBlocks } from "../lib/global-blocks.server";
import { getSavedBlocks } from "../lib/saved-blocks.server";
import { getGlobalSettings } from "../lib/settings.server";
import { DEFAULT_GLOBAL_SETTINGS } from "../lib/settings.defaults";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const slug = params.slug!;

  const page = await getPageBySlug(session.shop, slug);
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
    settings = await getGlobalSettings(session.shop);
  } catch {
    // fall through to defaults
  }

  // Expand GlobalBlock / SavedBlock references into their real items before
  // rendering — otherwise the string renderer (which only knows concrete
  // component types) drops them and the preview comes out blank.
  let resolved = data;
  try {
    const [globalBlocks, savedBlocks] = await Promise.all([
      getAllGlobalBlocks(session.shop),
      getSavedBlocks(session.shop),
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

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview: ${escHtml(page.title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
${body}
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
};

function escHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
