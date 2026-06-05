import { useState } from "react";
import { Globe, Trash2 } from "lucide-react";
import type { GlobalBlock } from "../types";
import { useGlobalBlocks } from "../hooks/useGlobalBlocks";
import ConfirmModal from "@/components/confirm-modal";

// ─── Sub-components ───────────────────────────────────────────────────────────

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
          Loading global blocks…
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
          <Globe size={22} color="var(--p-color-icon-emphasis, #005bd3)" />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--p-color-text)", margin: 0 }}>
            No global blocks yet.
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
            <strong style={{ color: "var(--p-color-text-emphasis)" }}>
              Save as Global Block
            </strong>{" "}
            in the toolbar.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Panel shown in the "Global Blocks" tab of the components drawer.
 * Lists all global blocks; each card lets the user insert a reference or edit
 * the block content (changes apply to every page using it).
 */
export function GlobalBlocksPanel() {
  const { blocks, loading, deleting, insertBlock, deleteBlock } = useGlobalBlocks();
  const [pendingDelete, setPendingDelete] = useState<GlobalBlock | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
              onMouseEnter={() => setHoveredId(block.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Block card — click to insert */}
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
                  <Globe size={16} color="var(--p-color-text-brand-on-bg-fill, #fff)" />
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
                  GLOBAL BLOCK
                </span>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPendingDelete(block);
                }}
                disabled={deleting === block.id}
                title="Delete global block"
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
            </div>
          );
        })}
      </div>

      <ConfirmModal
        open={!!pendingDelete}
        title="Delete global block?"
        message={`"${pendingDelete?.name}" will be permanently deleted. Any pages that already have this block inserted will show an empty placeholder in its place.`}
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
