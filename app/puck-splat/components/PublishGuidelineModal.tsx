import { useState } from "react";
import { Button, InlineStack, Text } from "@shopify/polaris";
import { CheckIcon } from "@shopify/polaris-icons";

interface PublishGuidelineModalProps {
  pageTitle: string;
  pageId: string;
  pageSlug: string;
  onClose: () => void;
}

export function PublishGuidelineModal({
  pageTitle,
  pageSlug,
  onClose,
}: PublishGuidelineModalProps) {
  const [copied, setCopied] = useState(false);

  const copySlug = () => {
    navigator.clipboard.writeText(pageSlug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "32px",
          maxWidth: "560px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Header */}
          <div>
            <Text as="h2" variant="headingMd">
              Page published
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              <strong>{pageTitle}</strong> is live at{" "}
              <code style={{ fontFamily: "monospace", background: "#f3f4f6", padding: "1px 5px", borderRadius: "3px" }}>
                /pages/{pageSlug}
              </code>
              . You can also embed it anywhere in your theme using the widget block
              and the Block ID below.
            </Text>
          </div>

          {/* Block ID */}
          <div
            style={{
              backgroundColor: "#f3f4f6",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              padding: "16px",
            }}
          >
            <Text as="p" variant="bodySm" fontWeight="semibold">
              Your Block ID
            </Text>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
              <div
                style={{
                  flex: 1,
                  backgroundColor: "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  padding: "10px 12px",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  wordBreak: "break-all",
                }}
              >
                {pageSlug}
              </div>
              <Button
                variant="primary"
                size="slim"
                icon={copied ? CheckIcon : undefined}
                onClick={copySlug}
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Steps */}
          <div>
            <Text as="p" variant="bodySm" fontWeight="semibold">
              How to add this page to your storefront
            </Text>
            <ol style={{ margin: "12px 0 0 0", padding: "0 0 0 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <li>
                <Text as="p" variant="bodySm">
                  Go to <strong>Shopify Admin → Online Store → Themes</strong> and click{" "}
                  <strong>Customize</strong>.
                </Text>
              </li>
              <li>
                <Text as="p" variant="bodySm">
                  Navigate to the page or template where you want to show this content.
                </Text>
              </li>
              <li>
                <Text as="p" variant="bodySm">
                  Click <strong>Add section</strong> and select{" "}
                  <strong>Page Builder Widget</strong> (listed under <em>Apps</em>).
                </Text>
              </li>
              <li>
                <Text as="p" variant="bodySm">
                  In the block settings sidebar, paste your Block ID{" "}
                  <code
                    style={{
                      fontFamily: "monospace",
                      background: "#f3f4f6",
                      padding: "1px 5px",
                      borderRadius: "3px",
                    }}
                  >
                    {pageSlug}
                  </code>{" "}
                  into the <strong>Block ID</strong> field.
                </Text>
              </li>
              <li>
                <Text as="p" variant="bodySm">
                  Click <strong>Save</strong>. The page builder content will render on your storefront.
                </Text>
              </li>
            </ol>
          </div>

          {/* Info note */}
          <div
            style={{
              backgroundColor: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "6px",
              padding: "12px",
            }}
          >
            <Text as="p" variant="bodySm" tone="subdued">
              <strong>How it works:</strong> Your page content is served through the
              Page Builder app — even though the Shopify page is a draft, the widget
              block fetches and displays the content via the app proxy. Visitors only
              see it where you place the widget block.
            </Text>
          </div>

          <InlineStack gap="200">
            <Button variant="secondary" onClick={onClose}>
              Done
            </Button>
          </InlineStack>
        </div>
      </div>
    </div>
  );
}
