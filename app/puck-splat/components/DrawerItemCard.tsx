import { useState } from "react";
import { COMPONENT_ICONS, FALLBACK_ICON } from "../constants";

type DrawerItemCardProps = {
  /** The component type name shown in the Puck drawer. */
  name: string;
  /** Optional display label; falls back to `name`. */
  displayName?: string;
  /** Optional icon override; resolved from COMPONENT_ICONS when omitted. */
  icon?: React.ReactNode;
};

/**
 * Presentational card rendered for every item in the Puck components drawer.
 */
export function DrawerItemCard({ name, displayName, icon }: DrawerItemCardProps) {
  const resolvedIcon = icon ?? COMPONENT_ICONS[name] ?? FALLBACK_ICON;
  const label = displayName ?? name;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 4px 8px",
        border: `1px solid ${
          hovered
            ? "var(--p-color-border-emphasis, #005bd3)"
            : "var(--p-color-border-subdued)"
        }`,
        borderRadius: "var(--p-border-radius-200, 8px)",
        fontSize: 10,
        fontWeight: 500,
        textAlign: "center",
        gap: 6,
        cursor: "grab",
        background: hovered
          ? "var(--p-color-bg-surface-hover)"
          : "var(--p-color-bg-surface)",
        boxShadow: "none",
        transition: "border-color 0.15s ease, background 0.15s ease",
        userSelect: "none",
        color: "var(--p-color-text)",
        minHeight: 80,
        minWidth: 0,
        maxWidth: "100%",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "var(--p-border-radius-200, 8px)",
          background: hovered
            ? "var(--p-color-bg-surface-selected)"
            : "var(--p-color-bg-surface-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--p-color-text)",
          transition: "background 0.15s ease, color 0.15s ease",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1, display: "flex" }}>
          {resolvedIcon}
        </span>
      </div>
      <span style={{ lineHeight: 1.3, wordBreak: "break-word", maxWidth: "100%", padding: "0 2px" }}>
        {label}
      </span>
    </div>
  );
}

