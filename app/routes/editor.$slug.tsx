import { lazy, Suspense, useEffect, useState } from "react";
import type { HeadersFunction, LinksFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import { authenticate } from "../shopify.server";
import { getPageBySlug } from "../lib/pages.server";
import { getSavedBlocks } from "../lib/saved-blocks.server";
import { getAllGlobalBlocks } from "../lib/global-blocks.server";
import { getGlobalSettings } from "../lib/settings.server";
import { DEFAULT_GLOBAL_SETTINGS, buildHeaderData, buildFooterData } from "../lib/settings.defaults";
import editorStyles from "../styles/editor.css?url";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

// Lazy-load the editor + the 13k-line puck.config so the server never has
// to import/serialize them. Combined with the `mounted` guard below, the
// import only fires on the client, eliminating SSR hangs and hydration drift.
const PuckSplatEditor = lazy(() => import("../puck-splat/PuckSplatEditor"));

const LOADER_TIPS = [
  "Drag blocks from the left panel onto the canvas.",
  "Save any section as a reusable block.",
  "Edit your header & footer once — they apply to every page.",
  "Exporting publishes your page to your online store theme.",
];

/** Branded, animated loading screen shown while the editor bundle loads. */
function EditorLoader() {
  const [tip, setTip] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setTip((t) => (t + 1) % LOADER_TIPS.length),
      2600,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pb-loader">
      <div className="pb-loader__grid" aria-hidden="true">
        {Array.from({ length: 16 }).map((_, i) => (
          <span
            key={i}
            className="pb-loader__cell"
            style={{
              animationDelay: `${((i % 4) + Math.floor(i / 4)) * 0.1}s`,
            }}
          />
        ))}
      </div>
      <div className="pb-loader__title">Page Builder App</div>
      {/* key forces the fade-in animation to replay on each tip change */}
      <div className="pb-loader__tip" key={tip} role="status">
        💡 Tip: {LOADER_TIPS[tip]}
      </div>
    </div>
  );
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: polarisStyles },
  { rel: "stylesheet", href: editorStyles },
];

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const slug = params.slug!;

  const [page, savedBlocks, globalBlocks, globalSettings] = await Promise.all([
    getPageBySlug(session.shop, slug),
    getSavedBlocks(session.shop),
    getAllGlobalBlocks(session.shop),
    getGlobalSettings(session.shop),
  ]);

  if (!page) throw new Response("Page not found", { status: 404 });

  const settings = globalSettings ?? DEFAULT_GLOBAL_SETTINGS;

  return {
    slug,
    pageTitle: page.title,
    data: JSON.parse(page.data),
    savedBlocks,
    globalBlocks,
    globalSettings: settings,
    headerData: buildHeaderData(settings.header),
    footerData: buildFooterData(settings.footer),
    // eslint-disable-next-line no-undef
    apiKey: process.env.SHOPIFY_API_KEY || "",
  };
};

export default function EditorRoute() {
  const { slug, pageTitle, data, savedBlocks, globalBlocks, globalSettings, headerData, footerData, apiKey } =
    useLoaderData<typeof loader>();

  // Puck editor uses many browser-only APIs (ResizeObserver, drag-and-drop,
  // iframe manipulation). Rendering it on the server causes a hydration mismatch.
  // Only mount it after the component has mounted on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const loadingFallback = <EditorLoader />;

  return (
    <AppProvider embedded apiKey={apiKey}>
      <PolarisAppProvider i18n={enTranslations}>
      <div style={{ height: "100vh", overflow: "hidden" }}>
        {mounted ? (
          <Suspense fallback={loadingFallback}>
            <PuckSplatEditor
              path={`/${slug}`}
              pageTitle={pageTitle}
              data={data}
              globalSettings={globalSettings}
              savedBlocks={savedBlocks as never}
              globalBlocks={globalBlocks as never}
              headerData={headerData}
              footerData={footerData}
            />
          </Suspense>
        ) : (
          loadingFallback
        )}
      </div>
      </PolarisAppProvider>
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
