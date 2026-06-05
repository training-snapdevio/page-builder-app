import { useState } from "react";
import { createPortal } from "react-dom";
import { Bookmark, Trash2 } from "lucide-react";
import type { SavedBlock } from "../types";
import { useSavedBlocks } from "../hooks/useSavedBlocks";
import { COMPONENT_ICONS, FALLBACK_ICON } from "../constants";
import { Render } from "@my-app/puck-editor";
import { config } from "@/puck.config";
import ConfirmModal from "@/components/confirm-modal";

// ─── Sub-components ────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div style={{ padding: 16, textAlign: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            border: "2px solid var(--p-color-border-subdued)",
            borderTopColor: "var(--p-color-border-emphasis, #005bd3)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ fontSize: 12, color: "var(--p-color-text-secondary)", fontWeight: 500, margin: 0 }}>
          Loading saved blocks…
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ padding: 16, textAlign: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "var(--p-color-bg-surface-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Bookmark size={22} color="var(--p-color-icon-emphasis, #005bd3)" />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--p-color-text)", margin: 0 }}>
            No saved blocks yet.
          </p>
          <p
            style={{
              fontSize: 12,
              color: "var(--p-color-text-secondary)",
              marginTop: 8,
              lineHeight: 1.5,
              margin: "8px 0 0",
            }}
          >
            Select a component on the canvas, then click{" "}
            <strong style={{ color: "var(--p-color-text-emphasis)" }}>Save as Block</strong> in
            the toolbar.
          </p>
        </div>
      </div>
    </div>
  );
}

function getBlockIcon(block: SavedBlock): React.ReactNode {
  const type = block.content?.[0]?.type;
  return COMPONENT_ICONS[type ?? ""] ?? FALLBACK_ICON;
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function SavedBlocksPanel() {
  const { blocks, loading, deleting, insertBlock, deleteBlock } = useSavedBlocks();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ top: number; left: number } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SavedBlock | null>(null);

  if (loading) return <LoadingState />;
  if (!blocks.length) return <EmptyState />;

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
          padding: 12,
        }}
      >
        {blocks.map((block) => {
          const hovered = hoveredId === block.id;
          return (
            <div
              key={block.id}
              style={{ position: "relative", width: "calc(50% - 6px)" }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredId(block.id);
                setHoverPos({ top: rect.top + rect.height / 2, left: rect.right + 16 });
              }}
              onMouseLeave={() => {
                setHoveredId(null);
                setHoverPos(null);
              }}
            >
              {/* Block card */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => insertBlock(block)}
                onKeyDown={(e) => e.key === "Enter" && insertBlock(block)}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px 16px 32px",
                  border: `1px solid ${
                    hovered
                      ? "var(--p-color-border-emphasis, #005bd3)"
                      : "var(--p-color-border-subdued)"
                  }`,
                  borderRadius: "var(--p-border-radius-300, 12px)",
                  fontSize: 12,
                  textAlign: "center",
                  gap: 8,
                  cursor: "pointer",
                  background: hovered
                    ? "var(--p-color-bg-surface-hover)"
                    : "var(--p-color-bg-surface)",
                  boxShadow: hovered
                    ? "var(--p-shadow-200, 0 2px 8px rgba(0,0,0,0.08))"
                    : "var(--p-shadow-100, 0 1px 0 rgba(0,0,0,0.05))",
                  transition: "all 200ms ease",
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                {/* Icon container */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "var(--p-color-bg-fill-brand, #005bd3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "var(--p-shadow-100, 0 1px 0 rgba(0,0,0,0.05))",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <span style={{ fontSize: 18, color: "var(--p-color-text-brand-on-bg-fill, #fff)" }}>
                    {getBlockIcon(block)}
                  </span>
                </div>

                {/* Block name */}
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--p-color-text)",
                    fontSize: 12,
                    lineHeight: 1.3,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {block.name}
                </span>

                {/* Subtitle */}
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--p-color-text-secondary)",
                    fontWeight: 500,
                    letterSpacing: "0.05em",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  SAVED BLOCK
                </span>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPendingDelete(block);
                }}
                disabled={deleting === block.id}
                title="Delete block"
                style={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  height: 24,
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "var(--p-color-bg-surface)",
                  border: "1px solid var(--p-color-border-critical-subdued, #fadcdc)",
                  borderRadius: "var(--p-border-radius-200, 8px)",
                  color: "var(--p-color-text-critical, #d72c0d)",
                  fontSize: 10,
                  fontWeight: 500,
                  cursor: deleting === block.id ? "not-allowed" : "pointer",
                  boxShadow: "var(--p-shadow-100, 0 1px 0 rgba(0,0,0,0.05))",
                  transition: "all 200ms ease",
                  zIndex: 2,
                }}
              >
                {deleting === block.id ? (
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      border: "1px solid var(--p-color-border-critical-subdued, #fadcdc)",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                ) : (
                  <>
                    <Trash2 size={10} />
                    <span>Delete</span>
                  </>
                )}
              </button>

              {/* Hover Preview via Portal */}
              {hoveredId === block.id &&
                hoverPos &&
                createPortal(
                  <div
                    className="hide-scrollbar"
                    style={{
                      position: "fixed",
                      zIndex: 99999,
                      top: hoverPos.top,
                      left: hoverPos.left,
                      transform: "translateY(-50%)",
                      width: "340px",
                      border: "1px solid var(--p-color-border-subdued)",
                      borderRadius: "var(--p-border-radius-400, 16px)",
                      boxShadow: "var(--p-shadow-600, 0 25px 50px -12px rgba(0,0,0,0.25))",
                      background: "var(--p-color-bg-surface)",
                      overflow: "hidden",
                      pointerEvents: "none",
                    }}
                  >
                    {/* Preview header */}
                    <div
                      style={{
                        background: "var(--p-color-bg-fill-brand, #005bd3)",
                        borderBottom: "1px solid var(--p-color-border-subdued)",
                        padding: "12px 16px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--p-color-text-brand-on-bg-fill, #fff)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span style={{ fontSize: 12 }}>{getBlockIcon(block)}</span>
                        </div>
                        <span>Preview: {block.name}</span>
                      </div>
                    </div>

                    {/* Preview content */}
                    <div
                      style={{
                        maxHeight: 260,
                        overflow: "hidden",
                        background: "var(--p-color-bg-surface-secondary)",
                      }}
                    >
                      <div
                        style={{
                          width: 1280,
                          transform: "scale(0.265)",
                          transformOrigin: "top left",
                        }}
                      >
                        <Render
                          config={config}
                          data={{
                            content: block.content,
                            root: { props: { title: "Preview", theme: "light" } as any },
                            zones: {},
                          }}
                        />
                      </div>
                    </div>
                  </div>,
                  document.body,
                )}
            </div>
          );
        })}
      </div>

      <ConfirmModal
        open={!!pendingDelete}
        title="Delete saved block?"
        message={`"${pendingDelete?.name}" will be permanently deleted and can't be recovered.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (pendingDelete) deleteBlock(pendingDelete.id);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
