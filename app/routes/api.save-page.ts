/**
 * POST /api/save-page
 *
 * Persists Puck page data to a Shopify metafield.
 * Also updates the local Prisma record so both stores stay in sync.
 *
 * Body: { slug: string; data: PuckData }
 * Response: { ok: true; shopifyPageId: string }
 */

import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getPageBySlug, updatePage, markPageExported } from "../lib/pages.server";
import { savePageToShopify } from "../lib/shopify-pages.server";
import { isValidPuckData } from "../lib/page-schema";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { admin, session } = await authenticate.admin(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { slug, data } = body as { slug?: string; data?: unknown };

  if (typeof slug !== "string" || !slug) {
    return json({ error: "slug is required" }, 400);
  }
  if (!isValidPuckData(data)) {
    return json({ error: "data must be a valid PuckData object" }, 400);
  }

  try {
    // Fetch the page title from Prisma so we can mirror it in Shopify.
    const page = await getPageBySlug(session.shop, slug);
    const title = page?.title ?? slug;

    // Save to local DB (keep Prisma as the fast read-source for the editor).
    await updatePage(session.shop, slug, data);

    // Sync to Shopify: save metafield + render HTML into page body.
    const { shopifyPageId } = await savePageToShopify({
      admin,
      shop: session.shop,
      slug,
      title,
      data,
    });

    // Publishing succeeded — mark the page exported so the list reflects it.
    await markPageExported(session.shop, slug);

    return json({ ok: true, shopifyPageId });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ ok: false, error: message }, 500);
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
