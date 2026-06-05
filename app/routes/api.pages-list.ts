/**
 * GET /api/pages-list
 *
 * Returns a minimal list of all builder pages for the current shop.
 * Used by the nav-link picker in the Global Layout editor so merchants
 * can select a page from a dropdown instead of typing URLs manually.
 *
 * Response: { pages: Array<{ slug: string; title: string }> }
 */

import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getAllPages } from "../lib/pages.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const pages = await getAllPages(session.shop);
  return new Response(
    JSON.stringify({
      pages: pages.map((p) => ({ slug: p.slug, title: p.title })),
    }),
    { headers: { "Content-Type": "application/json" } },
  );
};
