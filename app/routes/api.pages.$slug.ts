import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getPageBySlug, updatePage, markPageExported } from "../lib/pages.server";
import { savePageToShopify } from "../lib/shopify-pages.server";
import { isValidPuckData } from "../lib/page-schema";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const page = await getPageBySlug(session.shop, params.slug!);
  if (!page) return new Response("Not found", { status: 404 });
  return new Response(JSON.stringify({ data: JSON.parse(page.data) }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { admin, session } = await authenticate.admin(request);
  const slug = params.slug!;
  const { data } = await request.json();

  if (!isValidPuckData(data)) {
    return new Response(JSON.stringify({ error: "Invalid page data" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1. Save to Prisma (primary editor storage).
  const updated = await updatePage(session.shop, slug, data);

  // 2. Sync to Shopify metafield (storefront source of truth).
  //    Fire-and-forget with error logging so a Shopify API hiccup never
  //    blocks the editor's publish response.
  savePageToShopify({
    admin,
    shop: session.shop,
    slug,
    title: updated.title,
    data,
  })
    .then(() => markPageExported(session.shop, slug))
    .catch((err) => {
      console.error(`[publish] shopify metafield sync failed for ${slug}:`, err);
    });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
