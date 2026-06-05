/**
 * GET /api/get-page?slug=<slug>
 *
 * Fetches Puck page data from a Shopify metafield.
 * Falls back to Prisma if the Shopify metafield is not yet populated.
 *
 * Query params: slug (string)
 * Response: { source: "shopify" | "prisma"; slug: string; title: string; data: PuckData }
 */

import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getPageBySlug } from "../lib/pages.server";
import { getPageFromShopify } from "../lib/shopify-pages.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return json({ error: "slug query parameter is required" }, 400);
  }

  // Try Shopify metafield first (this is the authoritative storefront source).
  try {
    const shopifyResult = await getPageFromShopify(admin, slug);
    if (shopifyResult) {
      return json({
        source: "shopify",
        shopifyPageId: shopifyResult.shopifyPageId,
        slug: shopifyResult.payload.slug,
        title: shopifyResult.payload.title,
        updatedAt: shopifyResult.payload.updatedAt,
        data: shopifyResult.payload.data,
      });
    }
  } catch {
    // Non-fatal: fall through to Prisma fallback.
  }

  // Fall back to Prisma (local draft storage).
  const page = await getPageBySlug(session.shop, slug);
  if (!page) {
    return json({ error: "Page not found" }, 404);
  }

  let data: unknown;
  try {
    data = JSON.parse(page.data);
  } catch {
    return json({ error: "Stored page data is corrupt" }, 500);
  }

  return json({
    source: "prisma",
    slug: page.slug,
    title: page.title,
    updatedAt: page.updatedAt,
    data,
  });
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
