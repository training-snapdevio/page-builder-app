import { useState } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { redirect, useNavigation } from "react-router";
import { Form } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { createPage } from "../lib/pages.server";
import { slugify } from "../lib/slug";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const rawTitle = (formData.get("title") as string)?.trim();
  const title = rawTitle
    ? rawTitle.replace(/\b\w/g, (c) => c.toUpperCase())
    : rawTitle;
  const brandName = (formData.get("brandName") as string)?.trim() || null;
  if (!title) return { error: "Title is required" };

  const page = await createPage(session.shop, title, brandName);
  return redirect(`/app?edit=${page.slug}`);
};

export default function NewPage() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [title, setTitle] = useState("");
  const [brandName, setBrandName] = useState("");
  const previewSlug = slugify(title);

  return (
    <s-page heading="New Page">
      <s-button slot="primary-action" href="/app" variant="tertiary">
        ← Back to Pages
      </s-button>

      <s-section heading="Page details">
        <Form method="post">
          <s-stack direction="block" gap="base">
            <div>
              <s-text-field
                id="title"
                name="title"
                label="Page Title"
                value={title}
                onInput={(e: Event) =>
                  setTitle((e.target as HTMLInputElement).value)
                }
                placeholder="e.g. About Us"
              />
            </div>

            <div>
              <s-text-field
                id="brandName"
                name="brandName"
                label="Brand Name (optional)"
                value={brandName}
                onInput={(e: Event) =>
                  setBrandName((e.target as HTMLInputElement).value)
                }
                placeholder="e.g. Onyx Dial"
              />
            </div>

            {previewSlug && (
              <s-paragraph>
                URL: <strong>/{previewSlug}</strong>{" "}
                <s-text color="subdued">
                  (auto-generated — a suffix is added if already taken)
                </s-text>
              </s-paragraph>
            )}

            <s-stack direction="inline" gap="small">
              <s-button
                variant="primary"
                type="submit"
                {...(isSubmitting ? { loading: true } : {})}
                {...(!title.trim() ? { disabled: true } : {})}
              >
                {isSubmitting ? "Creating…" : "Create Page"}
              </s-button>
              <s-button href="/app" variant="tertiary">
                Cancel
              </s-button>
            </s-stack>
          </s-stack>
        </Form>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
