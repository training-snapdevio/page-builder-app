import { lazy, Suspense, useEffect, useState } from "react";
import type { HeadersFunction, LinksFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";

import { authenticate } from "../shopify.server";
import { getGlobalSettings } from "../lib/settings.server";
import { DEFAULT_GLOBAL_SETTINGS, buildFooterData } from "../lib/settings.defaults";
import editorStyles from "../styles/editor.css?url";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

const GlobalLayoutEditor = lazy(() => import("../puck-splat/GlobalLayoutEditor"));

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: polarisStyles },
  { rel: "stylesheet", href: editorStyles },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const settings = (await getGlobalSettings(session.shop)) ?? DEFAULT_GLOBAL_SETTINGS;

  return {
    initialData: buildFooterData(settings.footer),
    initialEnabled: settings.useCustomFooter ?? false,
    globalSettings: settings,
    // eslint-disable-next-line no-undef
    apiKey: process.env.SHOPIFY_API_KEY || "",
  };
};

export default function FooterEditRoute() {
  const { initialData, initialEnabled, globalSettings, apiKey } =
    useLoaderData<typeof loader>();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const fallback = (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        color: "#666",
        fontSize: 14,
      }}
    >
      Loading footer editor…
    </div>
  );

  return (
    <AppProvider embedded apiKey={apiKey}>
      <PolarisAppProvider i18n={enTranslations}>
        <div style={{ height: "100vh", overflow: "hidden" }}>
          {mounted ? (
            <Suspense fallback={fallback}>
              <GlobalLayoutEditor
                kind="footer"
                initialData={initialData}
                initialEnabled={initialEnabled}
                globalSettings={globalSettings}
              />
            </Suspense>
          ) : (
            fallback
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
