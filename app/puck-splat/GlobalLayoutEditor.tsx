import { useCallback, useState } from "react";
import { Puck, type Data } from "@my-app/puck-editor";
import { Banner, Button, Text } from "@shopify/polaris";

import { config } from "@/puck.config";
import type { GlobalSettings, HeaderSettings, FooterSettings } from "@/lib/settings.defaults";
import { GlobalSettingsProvider } from "@/puck-splat/context/GlobalSettingsContext";
import { IframeThemeInjector } from "@/puck-splat/components/IframeThemeInjector";

type Kind = "header" | "footer";

/**
 * Lightweight Puck-based editor for the single GlobalHeader / GlobalFooter
 * component stored in shop GlobalSettings.
 *
 * Unlike the page editor, this writes to GlobalSettings (not Page records)
 * and — when the toggle is on — re-publishes every page so the storefront
 * picks up the new layout chrome.
 */
export default function GlobalLayoutEditor({
  kind,
  initialData,
  initialEnabled,
  globalSettings,
}: {
  kind: Kind;
  initialData: Data;
  initialEnabled: boolean;
  globalSettings: GlobalSettings;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [message, setMessage] = useState<{ tone: "success" | "critical" | "info"; text: string } | null>(null);

  const labelTitle = kind === "header" ? "Global Header" : "Global Footer";
  const componentType = kind === "header" ? "GlobalHeader" : "GlobalFooter";
  const settingsKey: "header" | "footer" = kind;
  const toggleKey: "useCustomHeader" | "useCustomFooter" =
    kind === "header" ? "useCustomHeader" : "useCustomFooter";

  const goBack = useCallback(() => {
    const target = window !== window.parent ? window.parent : window;
    target.location.href = "/app";
  }, []);

  const handlePublish = useCallback(
    async (data: Data) => {
      try {
        setMessage(null);

        // Extract the single GlobalHeader / GlobalFooter component's props.
        const block = (data.content ?? []).find((b) => b.type === componentType);
        if (!block) {
          throw new Error(
            `No ${componentType} on canvas. Drag the "${labelTitle}" block from the left panel before publishing.`,
          );
        }
        const props = block.props as Record<string, unknown>;

        // Merge into the matching settings sub-object so we preserve any
        // fields the Puck component doesn't expose.
        const existing = globalSettings[settingsKey] as unknown as Record<string, unknown>;
        const merged = { ...existing, ...props } as unknown as HeaderSettings | FooterSettings;

        const nextSettings: GlobalSettings = {
          ...globalSettings,
          [settingsKey]: merged,
          [toggleKey]: enabled,
        };

        const res = await fetch("/api/global-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ globalSettings: nextSettings, republish: true }),
        });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Save failed (${res.status}): ${body}`);
        }

        setMessage({
          tone: "success",
          text: enabled
            ? `${labelTitle} saved. All pages are being re-published so the new ${kind} appears on the storefront.`
            : `${labelTitle} saved. It's currently disabled — toggle "Show on storefront" to apply it.`,
        });
      } catch (err) {
        setMessage({
          tone: "critical",
          text: err instanceof Error ? err.message : "Failed to save.",
        });
      }
    },
    [componentType, enabled, globalSettings, kind, labelTitle, settingsKey, toggleKey],
  );

  return (
    <GlobalSettingsProvider initialSettings={globalSettings} onSave={async () => {}}>
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* App-level top bar (sits above Puck's built-in header) */}
        <div
          style={{
            borderBottom: "1px solid var(--p-color-border)",
            background: "var(--p-color-bg-surface)",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          <Button variant="plain" onClick={goBack}>
            ← All Pages
          </Button>
          <Text as="span" variant="bodyMd" fontWeight="semibold">
            Editing: {labelTitle}
          </Text>

          <div style={{ flex: 1 }} />

          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            <span>
              Show on storefront <small style={{ opacity: 0.7 }}>(applies to all pages)</small>
            </span>
          </label>
        </div>

        {message && (
          <div style={{ padding: 12, flexShrink: 0 }}>
            <Banner tone={message.tone}>{message.text}</Banner>
          </div>
        )}

        {!enabled && (
          <div style={{ padding: "0 12px 8px", flexShrink: 0 }}>
            <Banner tone="info">
              This {kind} is currently <strong>disabled</strong>. Your storefront uses the merchant theme&apos;s {kind}.
              Toggle &ldquo;Show on storefront&rdquo; above and click <strong>Publish</strong> to apply this custom {kind}.
            </Banner>
          </div>
        )}

        {/* Puck editor — its native top header gives us undo/redo + Publish */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <Puck
            config={config}
            data={initialData}
            onPublish={handlePublish}
            overrides={{
              iframe: ({ children }) => (
                <>
                  <IframeThemeInjector />
                  {children}
                </>
              ),
            }}
          />
        </div>
      </div>
    </GlobalSettingsProvider>
  );
}
