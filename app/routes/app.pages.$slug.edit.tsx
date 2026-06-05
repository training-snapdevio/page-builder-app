import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getPageBySlug } from "../lib/pages.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const slug = params.slug!;
  const page = await getPageBySlug(session.shop, slug);
  if (!page) throw new Response("Page not found", { status: 404 });
  return { page };
};

export default function PageEditor() {
  const { page } = useLoaderData<typeof loader>();

  return (
    <s-page heading={page.title}>
      <s-button slot="primary-action" href="/app" variant="secondary">
        ← Back to Pages
      </s-button>

      <s-section heading="Page Editor">
        <s-paragraph>
          Editor loading for <strong>{page.slug}</strong>. Puck integration coming next.
        </s-paragraph>
        <s-stack direction="block" gap="small">
          <s-paragraph>
            <s-text color="subdued">Slug:</s-text> /{page.slug}
          </s-paragraph>
          <s-paragraph>
            <s-text color="subdued">Created:</s-text>{" "}
            {new Date(page.createdAt).toLocaleString()}
          </s-paragraph>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
