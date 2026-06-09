/**
 * GET /api/proxy-block/:blockId
 *
 * Proxy endpoint that returns the React block code for a specific page/block.
 * This is called from the Shopify storefront to inject the page builder content
 * into the theme dynamically.
 *
 * Query params:
 *   - shop: Shopify store domain (e.g., example.myshopify.com)
 *   - theme_id: Shopify theme ID (optional, for theme-specific rendering)
 *
 * Response:
 *   - Returns JavaScript that renders the page content
 *   - Sets up necessary styles and dependencies
 *   - Can be injected into any page template
 */

import type { LoaderFunctionArgs } from "react-router";
import { getPageBySlug } from "../lib/pages.server";

function json(data: unknown, init?: ResponseInit | number) {
  const status = typeof init === "number" ? init : (init as ResponseInit)?.status ?? 200;
  const headers = typeof init === "object" ? (init as ResponseInit)?.headers : {};
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { blockId } = params;

  if (!blockId) {
    return json({ error: "Block ID is required" }, { status: 400 });
  }

  // Extract shop and theme info from query params
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const themeId = url.searchParams.get("theme_id");

  if (!shop) {
    return json({ error: "Shop parameter is required" }, { status: 400 });
  }

  try {
    // Fetch the page using the block ID as slug
    // In your app, blockId might be different from slug - adjust accordingly
    const page = await getPageBySlug(shop, blockId);

    if (!page) {
      return json({ error: "Block not found" }, { status: 404 });
    }

    // Parse the page data
    let pageData = {};
    try {
      pageData = typeof page.data === "string" ? JSON.parse(page.data) : page.data;
    } catch {
      return json({ error: "Invalid page data" }, { status: 500 });
    }

    // Generate the JavaScript code to inject into Shopify
    const injectionCode = generateBlockInjectionCode({
      blockId,
      pageData,
      pageTitle: page.title,
      shop,
      themeId: themeId || undefined,
    });

    // Return as JavaScript with proper cache headers
    return new Response(injectionCode, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Access-Control-Allow-Origin": `https://${shop}`,
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[proxy-block] Error loading block ${blockId}:`, message);

    return json(
      { error: "Failed to load block", details: message },
      { status: 500 }
    );
  }
};

/**
 * Generate the JavaScript injection code that will be executed on the Shopify storefront.
 * This includes the React component rendering and necessary styling.
 */
function generateBlockInjectionCode({
  blockId,
  pageData,
  pageTitle,
  shop,
  themeId,
}: {
  blockId: string;
  pageData: unknown;
  pageTitle: string;
  shop: string;
  themeId?: string;
}): string {
  // Safely serialize the page data
  const pageDataJson = JSON.stringify(pageData).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

  return `
(function() {
  // Page Builder Block Injection - ${pageTitle}
  const blockId = "${blockId}";
  const pageData = ${pageDataJson};
  const shop = "${shop}";
  const themeId = "${themeId || ""}";

  // Find the mount point
  const mountPoint = document.querySelector('[data-block-id="${blockId}"]');
  if (!mountPoint) {
    console.warn("[Page Builder] Mount point not found for block: " + blockId);
    return;
  }

  // Add loading class
  mountPoint.classList.add("pb-block-loading");
  mountPoint.setAttribute("data-status", "loading");

  // Inject styles
  const style = document.createElement("style");
  style.textContent = \`
    .pb-block-container {
      width: 100%;
      min-height: 200px;
    }
    .pb-block-error {
      padding: 20px;
      border: 1px solid #ff6b6b;
      background-color: #ffe0e0;
      border-radius: 4px;
      color: #c92a2a;
    }
  \`;
  document.head.appendChild(style);

  // Create a container div for the React component
  const container = document.createElement("div");
  container.className = "pb-block-container";
  container.setAttribute("data-block-id", blockId);
  mountPoint.appendChild(container);

  // Load the Puck renderer library
  const script = document.createElement("script");
  script.src = "/cdn/puck-renderer.js"; // Update this to your actual CDN path
  script.onload = function() {
    try {
      // Assuming window.PuckRenderer is available after loading
      if (window.PuckRenderer && window.PuckRenderer.render) {
        window.PuckRenderer.render({
          container: container,
          data: pageData,
          shop: shop,
          themeId: themeId,
        });
        mountPoint.setAttribute("data-status", "ready");
        mountPoint.classList.remove("pb-block-loading");
      } else {
        throw new Error("PuckRenderer not available");
      }
    } catch (error) {
      console.error("[Page Builder] Error rendering block:", error);
      container.innerHTML = '<div class="pb-block-error">Failed to load page builder block. Please refresh the page.</div>';
      mountPoint.setAttribute("data-status", "error");
      mountPoint.classList.remove("pb-block-loading");
    }
  };
  script.onerror = function() {
    console.error("[Page Builder] Failed to load renderer library");
    container.innerHTML = '<div class="pb-block-error">Failed to load page builder library. Please contact support.</div>';
    mountPoint.setAttribute("data-status", "error");
    mountPoint.classList.remove("pb-block-loading");
  };
  document.head.appendChild(script);

  // Emit event for custom integrations
  window.dispatchEvent(new CustomEvent("pb:block-loaded", {
    detail: { blockId, pageData, shop }
  }));
})();
`;
}
