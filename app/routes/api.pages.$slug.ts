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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data } = body as { data: unknown };

  // Normalise: puck sometimes omits zones on simple pages
  const normalised = data && typeof data === "object" && !Array.isArray(data)
    ? { zones: {}, ...(data as object) }
    : data;

  if (!isValidPuckData(normalised)) {
    return new Response(JSON.stringify({ error: "Invalid page data" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1. Save to Prisma (primary editor storage).
  let updated: Awaited<ReturnType<typeof updatePage>>;
  try {
    updated = await updatePage(session.shop, slug, normalised);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[publish] prisma updatePage failed for ${slug}:`, err);
    return new Response(JSON.stringify({ error: `Save failed: ${msg}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Sync to Shopify metafield (storefront source of truth).
  //    Fire-and-forget so a Shopify API hiccup never blocks the editor.
  savePageToShopify({
    admin,
    shop: session.shop,
    slug,
    title: updated.title,
    data: normalised,
  })
    .then(() => markPageExported(session.shop, slug))
    .catch((err) => {
      console.error(`[publish] shopify metafield sync failed for ${slug}:`, err);
    });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
