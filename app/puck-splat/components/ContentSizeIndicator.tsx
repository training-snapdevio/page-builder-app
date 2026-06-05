/**
 * ContentSizeIndicator
 *
 * Live page-size badge for the editor header. Shopify caps the page body at
 * 512 KB; this gives merchants real-time feedback so they don't discover
 * they've blown past the limit only after clicking Publish.
 *
 * Renders three states:
 *   ok       — under 85 % of the limit, neutral colour
 *   warning  — 85–99 %, amber
 *   over     — ≥ 100 %, red + descriptive label so the user knows what to fix
 */
import { Text } from "@shopify/polaris";
import type { ContentSize } from "@/puck-splat/hooks/useContentSize";

const PALETTE = {
  ok: { bg: "#F1F8F5", fg: "#0F5132", border: "#A3D9B8" },
  warning: { bg: "#FFF5E6", fg: "#8A4B00", border: "#FFD79D" },
  over: { bg: "#FEEAEA", fg: "#8E1F1F", border: "#F5B5B5" },
} as const;

export function ContentSizeIndicator({ size }: { size: ContentSize }) {
  const colors = PALETTE[size.status];
  const label =
    size.status === "over"
      ? `Too large: ${size.kb} KB / ${size.limitKb} KB`
      : `${size.kb} KB / ${size.limitKb} KB`;

  return (
    <div
      title={
        size.status === "over"
          ? `Page body is ${size.kb} KB — Shopify rejects pages over ${size.limitKb} KB. Remove or shorten some content to publish.`
          : `Estimated Shopify page body size`
      }
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.fg,
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: colors.fg,
          flexShrink: 0,
        }}
      />
      <Text as="span" variant="bodySm">
        {label}
      </Text>
    </div>
  );
}
