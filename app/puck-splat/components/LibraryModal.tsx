import { useCallback, useEffect, useRef, useState, memo } from "react";
import { createPortal } from "react-dom";
import { usePuck, Render } from "@my-app/puck-editor";
import type { LibraryItem, LibraryTab } from "@/lib/library.types";
import { deepCloneWithIds } from "../utils";
import { previewConfig } from "@/puck.config";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = { id: string; name: string; icon: string };

type ApiResponse = {
  tab: LibraryTab;
  items: LibraryItem[];
  categories: Category[];
};

type Props = {
  onClose: () => void;
};

// ─── Thumbnail placeholder colours per category ───────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  hero: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
  about: "linear-gradient(135deg,#f093fb 0%,#f5576c 100%)",
  services: "linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)",
  testimonial: "linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)",
  gallery: "linear-gradient(135deg,#fa709a 0%,#fee140 100%)",
  contact: "linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)",
  cta: "linear-gradient(135deg,#f6d365 0%,#fda085 100%)",
  landing: "linear-gradient(135deg,#0fd850 0%,#f9f047 100%)",
  header: "linear-gradient(135deg,#0158ad 0%,#0284c7 100%)",
  footer: "linear-gradient(135deg,#1F2937 0%,#374151 100%)",
};

const DEFAULT_THUMB = "linear-gradient(135deg,#e0e7ff 0%,#c7d2fe 100%)";

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category.toLowerCase()] ?? DEFAULT_THUMB;
}

// ─── Layout options per block category ───────────────────────────────────────

type LayoutOption = { tag: string; label: string };

const LAYOUT_OPTIONS: Record<string, LayoutOption[]> = {
  hero: [
    { tag: "", label: "All" },
    { tag: "lyt-split-right", label: "↔ Split Right" },
    { tag: "lyt-split-left", label: "↔ Split Left" },
    { tag: "lyt-overlay", label: "🖼 Full BG" },
    { tag: "lyt-minimal", label: "▭ Minimal" },
  ],
  about: [
    { tag: "", label: "All" },
    { tag: "lyt-image-left", label: "◀ Image Left" },
    { tag: "lyt-image-right", label: "▶ Image Right" },
    { tag: "lyt-stats", label: "📊 Stats Grid" },
  ],
  services: [
    { tag: "", label: "All" },
    { tag: "lyt-image-top", label: "⬆ Image Top" },
    { tag: "lyt-image-side", label: "◀ Image Side" },
    { tag: "lyt-icon-only", label: "✦ Icon Only" },
    { tag: "lyt-2col", label: "▌▌ 2 Column" },
  ],
  gallery: [
    { tag: "", label: "All" },
    { tag: "lyt-2col", label: "▌▌ 2 Col" },
    { tag: "lyt-3col", label: "▌▌▌ 3 Col" },
    { tag: "lyt-4col", label: "▌▌▌▌ 4 Col" },
  ],
  testimonial: [
    { tag: "", label: "All" },
    { tag: "lyt-standard", label: "◻ Standard" },
    { tag: "lyt-centered", label: "⬛ Centered" },
    { tag: "lyt-avatar-top", label: "👤 Avatar Top" },
    { tag: "lyt-minimal", label: "▭ Minimal" },
  ],
  contact: [
    { tag: "", label: "All" },
    { tag: "lyt-split", label: "↔ Split" },
    { tag: "lyt-centered", label: "⬛ Centered" },
    { tag: "lyt-minimal", label: "▭ Minimal" },
  ],
  cta: [
    { tag: "", label: "All" },
    { tag: "lyt-centered", label: "⬛ Centered" },
    { tag: "lyt-split", label: "↔ Split" },
    { tag: "lyt-bold", label: "⚡ Bold" },
  ],
  header: [
    { tag: "", label: "All" },
    { tag: "lyt-default", label: "☰ Default" },
    { tag: "lyt-cta", label: "⚡ With CTA" },
    { tag: "lyt-split", label: "↔ Split" },
    { tag: "lyt-centered", label: "⬛ Centered" },
    { tag: "lyt-minimal", label: "▭ Minimal" },
    { tag: "lyt-dark", label: "◼ Dark" },
  ],
  footer: [
    { tag: "", label: "All" },
    { tag: "lyt-classic", label: "☰ Classic" },
    { tag: "lyt-newsletter", label: "✉ Newsletter" },
    { tag: "lyt-light", label: "◻ Light" },
    { tag: "lyt-minimal", label: "▭ Minimal" },
    { tag: "lyt-bold", label: "⚡ Bold" },
  ],
};

// ─── Loading skeletons ────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      style={{
        borderRadius: "var(--p-border-radius-200, 8px)",
        overflow: "hidden",
        border: "1px solid var(--p-color-border-subdued)",
        background: "var(--p-color-bg-surface)",
      }}
    >
      <div
        style={{
          height: 160,
          background: "var(--p-color-bg-surface-secondary)",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <div style={{ padding: "10px 12px" }}>
        <div
          style={{
            height: 12,
            width: "60%",
            borderRadius: "var(--p-border-radius-100, 4px)",
            background: "var(--p-color-bg-surface-secondary)",
          }}
        />
      </div>
    </div>
  );
}

// ─── Category Dropdown ────────────────────────────────────────────────────────

function CategoryDropdown({
  categories,
  selected,
  onChange,
}: {
  categories: Category[];
  selected: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedCat = categories.find((c) => c.id === selected);

  return (
    <div ref={ref} style={{ position: "relative", zIndex: 20 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 12px",
          border: "1px solid var(--p-color-border)",
          borderRadius: "var(--p-border-radius-100, 4px)",
          background: "var(--p-color-bg-surface)",
          cursor: "pointer",
          fontSize: 13,
          color: "var(--p-color-text)",
          minWidth: 160,
          justifyContent: "space-between",
        }}
      >
        <span>
          {selectedCat ? `${selectedCat.icon} ${selectedCat.name}` : "Category"}
        </span>
        <span style={{ fontSize: 10, color: "var(--p-color-text-secondary)" }}>▼</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            minWidth: "100%",
            background: "var(--p-color-bg-surface)",
            border: "1px solid var(--p-color-border)",
            borderRadius: "var(--p-border-radius-200, 8px)",
            boxShadow: "var(--p-shadow-300, 0 8px 24px rgba(0,0,0,0.12))",
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "8px 14px",
              fontSize: 13,
              border: "none",
              background:
                selected === ""
                  ? "var(--p-color-bg-surface-secondary)"
                  : "transparent",
              cursor: "pointer",
              color: "var(--p-color-text)",
            }}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onChange(cat.id);
                setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                textAlign: "left",
                padding: "8px 14px",
                fontSize: 13,
                border: "none",
                background:
                  selected === cat.id
                    ? "var(--p-color-bg-surface-selected)"
                    : "transparent",
                color:
                  selected === cat.id
                    ? "var(--p-color-text-emphasis)"
                    : "var(--p-color-text)",
                cursor: "pointer",
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// LivePreview 
function LivePreview({ data, category }: { data: any; category: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);

  const BASE_WIDTH = 1280;

  useEffect(() => {
    function updateScale() {
      if (!containerRef.current) return;
      setScale(containerRef.current.offsetWidth / BASE_WIDTH);
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const previewData = data?.content
    ? { content: data.content, root: { props: {} }, zones: data.zones || {} }
    : { content: [data], root: { props: {} }, zones: {} };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: 160,
        overflow: "hidden",
        position: "relative",
        background: "#F3F6FB",
      }}
    >
      <div
        style={{
          width: BASE_WIDTH,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
          pointerEvents: "none",
        }}
      >
        <Render config={previewConfig} data={previewData as any} />
      </div>
    </div>
  );
}

// ─── Library Card ─────────────────────────────────────────────────────────────
const LibraryCard = memo(function LibraryCard({
  item,
  isFav,
  onInsert,
  onToggleFavorite,
  onView,
}: {
  item: LibraryItem;
  isFav: boolean;
  onInsert: (item: LibraryItem) => void;
  onToggleFavorite: (item: LibraryItem) => void;
  onView: (item: LibraryItem) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        borderRadius: "var(--p-border-radius-200, 8px)",
        overflow: "hidden",
        border: `1.5px solid ${
          hovered ? "var(--p-color-border-focus, #005bd3)" : "var(--p-color-border-subdued)"
        }`,
        background: "var(--p-color-bg-surface)",
        cursor: "pointer",
        transition: "all 0.15s",
        boxShadow: hovered
          ? "var(--p-shadow-300, 0 4px 20px rgba(0,0,0,0.12))"
          : "var(--p-shadow-100, 0 1px 4px rgba(0,0,0,0.06))",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Live Preview */}
      <div style={{ position: "relative" }}>
        <LivePreview data={item.data} category={item.category} />

        {/* PRO badge */}
        {item.isPremium && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "var(--p-color-bg-fill-warning)",
              color: "var(--p-color-text-warning-on-bg-fill, #fff)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.05em",
              padding: "2px 7px",
              borderRadius: "var(--p-border-radius-100, 4px)",
              boxShadow: "var(--p-shadow-100, 0 1px 4px rgba(0,0,0,0.2))",
            }}
          >
            PRO
          </div>
        )}

        {/* Favorite heart — zIndex keeps it above the hover overlay */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(item);
          }}
          title={isFav ? "Remove from favorites" : "Add to favorites"}
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 10,
            background: "none",
            border: "none",
            borderRadius: "50%",
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 18,
            transition: "all 0.15s",
            boxShadow: "none",
            padding: 0,
          }}
        >
          {isFav ? "❤️" : "🤍"}
        </button>

        {/* Hover overlay — Preview + Insert */}
        {hovered && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.40)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {/* Preview button */}
            <button
              onClick={(e) => { e.stopPropagation(); onView(item); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "rgba(255,255,255,0.95)",
                color: "var(--p-color-text, #303030)",
                padding: "7px 13px",
                borderRadius: "var(--p-border-radius-100, 6px)",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.03em",
                boxShadow: "var(--p-shadow-200, 0 2px 8px rgba(0,0,0,0.18))",
                border: "none",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 13 }}>👁</span> Preview
            </button>

            {/* Insert button */}
            <button
              onClick={(e) => { e.stopPropagation(); onInsert(item); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "var(--p-color-bg-fill-brand, #005bd3)",
                color: "var(--p-color-text-brand-on-bg-fill, #fff)",
                padding: "7px 13px",
                borderRadius: "var(--p-border-radius-100, 6px)",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.03em",
                boxShadow: "var(--p-shadow-200, 0 2px 8px rgba(0,91,211,0.4))",
                border: "none",
                cursor: "pointer",
              }}
            >
              + Insert
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--p-color-text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.name}
        </span>
        {item.rating > 0 && (
          <span style={{ fontSize: 11, color: "var(--p-color-icon-warning, #b15c00)", flexShrink: 0 }}>
            ★ {item.rating.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
});

// ─── Empty States ─────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 300,
        color: "var(--p-color-text-secondary)",
        gap: 12,
      }}
    >
      <span style={{ fontSize: 48 }}>🔍</span>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--p-color-text)" }}>
        {message}
      </p>
      <p style={{ margin: 0, fontSize: 12 }}>Try adjusting your filters</p>
    </div>
  );
}

// ─── Detail Preview (full-width, height-adaptive live render) ────────────────

function DetailPreview({ data }: { data: any }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef   = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [wrapperHeight, setWrapperHeight] = useState(420);
  const BASE_WIDTH = 1280;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const inner   = innerRef.current;
    if (!wrapper || !inner) return;
    function measure() {
      if (!wrapper || !inner) return;
      const containerW = wrapper.offsetWidth;
      const s = containerW / BASE_WIDTH;
      const naturalH = inner.offsetHeight;
      setScale(s);
      setWrapperHeight(Math.max(240, naturalH * s));
    }
    const t = setTimeout(measure, 80);
    const ro = new ResizeObserver(measure);
    ro.observe(inner);
    ro.observe(wrapper);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, [data]);

  const previewData = data?.content
    ? { content: data.content, root: { props: {} }, zones: data.zones ?? {} }
    : { content: [data], root: { props: {} }, zones: {} };

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        height: wrapperHeight,
        position: "relative",
        overflow: "hidden",
        background: "#F3F6FB",
        borderRadius: "var(--p-border-radius-200, 8px)",
        border: "1px solid var(--p-color-border-subdued)",
        transition: "height 0.25s ease",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          width: BASE_WIDTH,
          transform: `translate(-50%, 0) scale(${scale})`,
          transformOrigin: "top center",
          pointerEvents: "none",
        }}
      >
        <div ref={innerRef}>
          <Render config={previewConfig} data={previewData as any} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 8,
          right: 10,
          background: "rgba(0,0,0,0.45)",
          color: "#fff",
          fontSize: 10,
          fontWeight: 600,
          padding: "2px 8px",
          borderRadius: "var(--p-border-radius-100, 4px)",
          letterSpacing: "0.04em",
          pointerEvents: "none",
        }}
      >
        1280 px desktop
      </div>
    </div>
  );
}

// ─── Detail View (two-column: preview panel + metadata sidebar) ───────────────

function DetailView({
  item,
  activeTab,
  isFav,
  onBack,
  onInsert,
  onToggleFavorite,
}: {
  item: LibraryItem;
  activeTab: "blocks" | "pages";
  isFav: boolean;
  onBack: () => void;
  onInsert: (item: LibraryItem) => void;
  onToggleFavorite: (item: LibraryItem) => void;
}) {
  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      {/* Left panel — preview */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          borderRight: "1px solid var(--p-color-border-subdued)",
        }}
      >
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={onBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--p-color-text-secondary)",
              fontSize: 13,
              padding: "4px 0",
            }}
          >
            ← Back
          </button>
          <span style={{ fontSize: 12, color: "var(--p-color-text-disabled, #8c9196)" }}>/</span>
          <span style={{ fontSize: 13, color: "var(--p-color-text)", fontWeight: 500 }}>
            {item.name}
          </span>
        </div>

        {/* Live preview */}
        <DetailPreview data={item.data} />

        {/* Description */}
        {item.description && (
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "var(--p-color-text-secondary)",
              lineHeight: 1.6,
            }}
          >
            {item.description}
          </p>
        )}
      </div>

      {/* Right panel — metadata + actions */}
      <div
        style={{
          width: 272,
          flexShrink: 0,
          overflowY: "auto",
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          background: "var(--p-color-bg-surface-secondary)",
        }}
      >
        {/* Category chip */}
        <div>
          <span
            style={{
              display: "inline-block",
              background: "var(--p-color-bg-surface-selected)",
              color: "var(--p-color-text-emphasis)",
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 999,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {item.category}
          </span>
        </div>

        {/* Name + PRO badge */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              color: "var(--p-color-text)",
              lineHeight: 1.35,
            }}
          >
            {item.name}
          </h2>
          {item.isPremium && (
            <span
              style={{
                flexShrink: 0,
                background: "var(--p-color-bg-fill-warning)",
                color: "var(--p-color-text-warning-on-bg-fill, #fff)",
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "var(--p-border-radius-100, 4px)",
                letterSpacing: "0.06em",
              }}
            >
              PRO
            </span>
          )}
        </div>

        {/* Star rating */}
        {item.rating > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "var(--p-color-icon-warning, #b15c00)", fontSize: 15 }}>
              {"★".repeat(Math.round(item.rating))}{"☆".repeat(5 - Math.round(item.rating))}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--p-color-text)" }}>
              {item.rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Difficulty */}
        {item.difficulty && (
          <div>
            <p
              style={{
                margin: "0 0 4px",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--p-color-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Difficulty
            </p>
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color:
                  item.difficulty === "beginner"
                    ? "var(--p-color-text-success, #108043)"
                    : item.difficulty === "intermediate"
                    ? "var(--p-color-text-warning, #b15c00)"
                    : "var(--p-color-text-critical, #d72c0d)",
              }}
            >
              {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
            </span>
          </div>
        )}

        {/* Usage count */}
        {item.usageCount > 0 && (
          <div>
            <p
              style={{
                margin: "0 0 4px",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--p-color-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Used by
            </p>
            <span style={{ fontSize: 13, color: "var(--p-color-text)" }}>
              {item.usageCount.toLocaleString()} stores
            </span>
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div>
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--p-color-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Tags
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "var(--p-color-bg-surface)",
                    border: "1px solid var(--p-color-border-subdued)",
                    color: "var(--p-color-text-secondary)",
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 999,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Favorite toggle */}
        <button
          onClick={() => onToggleFavorite(item)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            padding: "9px 16px",
            border: `1px solid ${isFav ? "var(--p-color-border-critical, #d72c0d)" : "var(--p-color-border)"}`,
            borderRadius: "var(--p-border-radius-100, 6px)",
            background: isFav
              ? "var(--p-color-bg-surface-critical-subdued, #fff4f4)"
              : "var(--p-color-bg-surface)",
            color: isFav
              ? "var(--p-color-text-critical, #d72c0d)"
              : "var(--p-color-text)",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {isFav ? "❤️ Remove Favorite" : "🤍 Add to Favorites"}
        </button>

        {/* Insert / Use button */}
        <button
          onClick={() => onInsert(item)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            padding: "11px 16px",
            border: "none",
            borderRadius: "var(--p-border-radius-100, 6px)",
            background: "var(--p-color-bg-fill-brand, #005bd3)",
            color: "var(--p-color-text-brand-on-bg-fill, #fff)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "var(--p-shadow-200, 0 2px 8px rgba(0,91,211,0.35))",
          }}
        >
          {activeTab === "pages" ? "📄 Use This Page" : "+ Insert Block"}
        </button>

        {/* Helper note */}
        <p
          style={{
            margin: 0,
            fontSize: 11,
            color: "var(--p-color-text-disabled, #8c9196)",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          {activeTab === "pages"
            ? "Replaces current page content"
            : "Added to the bottom of the current page"}
        </p>
      </div>
    </div>
  );
}

// ─── Main Library Modal ───────────────────────────────────────────────────────

export function LibraryModal({ onClose }: Props) {
  const { appState, dispatch } = usePuck();

  const [activeTab, setActiveTab] = useState<"blocks" | "pages">("blocks");
  const [category, setCategory] = useState("");
  const [themeTag, setThemeTag] = useState("");
  const [layoutTag, setLayoutTag] = useState("");
  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favoritesDropdownOpen, setFavoritesDropdownOpen] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [insertedId, setInsertedId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<LibraryItem | null>(null);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // favoritesRef is the single source of truth — updated synchronously before
  // setState so it is always current when handleToggleFavorite reads it, even
  // in rapid successive clicks. This mirrors the globalSettings pattern.
  const favoritesRef = useRef<string[]>([]);
  const activeTabRef = useRef(activeTab);
  useEffect(() => { activeTabRef.current = activeTab; });

  // Debounce search input
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [search]);

  // Load favorites on mount — update ref + state together
  useEffect(() => {
    fetch("/api/library/favorites")
      .then((r) => r.json())
      .then((fav) => {
        const ids = [...(fav.blocks ?? []), ...(fav.pages ?? [])];
        favoritesRef.current = ids;
        setFavorites(ids);
      })
      .catch(() => {});
  }, []);

  // Fetch library items whenever server-side filters change.
  // favoritesOnly is handled client-side so it never triggers a re-fetch.
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ tab: activeTab });
    if (category) params.set("category", category);
    if (themeTag) params.set("tag", themeTag);
    if (layoutTag) params.set("layout", layoutTag);
    if (debouncedSearch) params.set("search", debouncedSearch);

    fetch(`/api/library?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeTab, category, themeTag, layoutTag, debouncedSearch]);

  // Reset filters when tab changes
  useEffect(() => {
    setCategory("");
    setThemeTag("");
    setLayoutTag("");
    setSearch("");
    setDebouncedSearch("");
  }, [activeTab]);

  // Reset layout when category changes
  useEffect(() => {
    setLayoutTag("");
  }, [category]);

  // Close on Escape — navigate back from detail view first, then close modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (viewingItem) setViewingItem(null);
      else onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, viewingItem]);

  // Puck requires every content item to have a unique props.id.
  // Library blocks are stored without one, so we inject a fresh UUID on insert.
  const withPuckId = (block: any): any => ({
    ...block,
    props: { id: crypto.randomUUID(), ...(block.props ?? {}) },
  });

  const handleInsert = useCallback(
    (item: LibraryItem) => {
      let newContent: any[];

      if (activeTab === "pages") {
        // Replace entire page content — give each block its own id
        newContent = (item.data?.content ?? []).map((block: any) =>
          withPuckId(deepCloneWithIds(block)),
        );
      } else {
        // Append single block at the bottom with a fresh id
        newContent = [withPuckId(deepCloneWithIds(item.data))];
      }

      const updatedContent = activeTab === "pages"
        ? newContent
        : [...appState.data.content, ...newContent];

      dispatch({
        type: "setData",
        data: {
          ...appState.data,
          content: updatedContent,
        },
      });

      setInsertedId(item.id);
      setTimeout(() => setInsertedId(null), 1500);
      onClose();

      // Scroll to bottom after insertion (single block mode)
      if (activeTab !== "pages") {
        setTimeout(() => {
          // Try multiple possible canvas selectors
          const canvas =
            document.querySelector('[class*="_PuckPreview-frame"]') ||
            document.querySelector('[class*="PuckPreview-frame"]') ||
            document.querySelector('[class*="_PuckPreview"]') ||
            document.querySelector('iframe[title*="preview"]')?.ownerDocument?.body;

          if (canvas) {
            canvas.scrollTo({ top: canvas.scrollHeight, behavior: "smooth" });
          }

          // Also scroll the window/document as fallback
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });

          // Find the last inserted element and scroll to it
          const lastSection = document.querySelector('[data-puck-component]:last-child');
          if (lastSection) {
            lastSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 300);
      }
    },
    [activeTab, appState.data, dispatch, onClose],
  );

  /**
   * Toggle a favourite — mirrors the GlobalSettings pattern:
   *  1. Update the ref synchronously (instant, no stale-closure risk)
   *  2. Call setState with the new ref value  → only the toggled card re-renders
   *  3. Fire-and-forget fetch  → no await, no async, UI never blocks/flickers
   *  4. Revert ref + state if the server call fails
   */
  const handleToggleFavorite = useCallback((item: LibraryItem) => {
    const isFav = favoritesRef.current.includes(item.id);

    // 1. Mutate ref synchronously — always current on rapid clicks
    favoritesRef.current = isFav
      ? favoritesRef.current.filter((id) => id !== item.id)
      : [...favoritesRef.current, item.id];

    // 2. Trigger targeted UI re-render (memo on LibraryCard means only this
    //    card re-renders because it's the only one whose isFav value changed)
    setFavorites(favoritesRef.current);

    // 3. Background save — fire and forget, no await
    fetch("/api/library/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: isFav ? "remove" : "add",
        tab: activeTabRef.current,
        itemId: item.id,
      }),
    }).catch(() => {
      // Revert on network error
      favoritesRef.current = isFav
        ? [...favoritesRef.current, item.id]
        : favoritesRef.current.filter((id) => id !== item.id);
      setFavorites(favoritesRef.current);
    });
  }, []); // stable — all volatile values accessed via refs

  const tabs: { id: "blocks" | "pages"; label: string; icon: string }[] = [
    { id: "blocks", label: "Blocks", icon: "🧩" },
    { id: "pages", label: "Pages", icon: "📄" },
  ];

  const modal = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--p-color-backdrop-bg, rgba(0,0,0,0.5))",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: "92vw",
          height: "92vh",
          background: "var(--p-color-bg-surface)",
          borderRadius: "var(--p-border-radius-300, 12px)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--p-shadow-600, 0 25px 60px rgba(0,0,0,0.3))",
        }}
      >
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            borderBottom: "1px solid var(--p-color-border-subdued)",
            flexShrink: 0,
            background: "var(--p-color-bg-surface)",
          }}
        >
          {/* Brand mark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 20px",
              borderRight: "1px solid var(--p-color-border-subdued)",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "var(--p-border-radius-100, 4px)",
                background: "var(--p-color-bg-fill-brand, #005bd3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  color: "var(--p-color-text-brand-on-bg-fill, #fff)",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                ⊞
              </span>
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "var(--p-color-text)",
                textTransform: "uppercase",
              }}
            >
              LIBRARY
            </span>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", flex: 1, padding: "0 8px" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setFavoritesOnly(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "16px 18px",
                  fontSize: 13,
                  fontWeight: activeTab === tab.id && !favoritesOnly ? 600 : 400,
                  color: activeTab === tab.id && !favoritesOnly
                    ? "var(--p-color-text-emphasis)"
                    : "var(--p-color-text-secondary)",
                  background: "none",
                  border: "none",
                  borderBottom: `2px solid ${
                    activeTab === tab.id && !favoritesOnly
                      ? "var(--p-color-border-emphasis, #005bd3)"
                      : "transparent"
                  }`,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  marginBottom: -1,
                }}
              >
                <span style={{ fontSize: 15 }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}

            {/* ♥ My Favorites — dropdown tab */}
            <div style={{ position: "relative", alignSelf: "stretch", display: "flex", alignItems: "center" }}>
              <button
                onClick={() => setFavoritesDropdownOpen((o) => !o)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "16px 18px",
                  fontSize: 13,
                  fontWeight: favoritesOnly ? 600 : 400,
                  color: favoritesOnly
                    ? "var(--p-color-text-critical, #d72c0d)"
                    : "var(--p-color-text-secondary)",
                  background: "none",
                  border: "none",
                  borderBottom: `2px solid ${favoritesOnly ? "var(--p-color-border-critical, #d72c0d)" : "transparent"}`,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  marginBottom: -1,
                  whiteSpace: "nowrap",
                }}
              >
                ♥ My Favorites
                <span style={{ fontSize: 9, opacity: 0.55 }}>▼</span>
              </button>

              {favoritesDropdownOpen && (
                <>
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: 99 }}
                    onClick={() => setFavoritesDropdownOpen(false)}
                  />
                  <div style={{
                    position: "absolute",
                    top: "calc(100% + 2px)",
                    left: 0,
                    background: "var(--p-color-bg-surface)",
                    border: "1px solid var(--p-color-border)",
                    borderRadius: "var(--p-border-radius-200, 8px)",
                    boxShadow: "var(--p-shadow-300, 0 4px 16px rgba(0,0,0,0.12))",
                    zIndex: 100,
                    minWidth: 170,
                    overflow: "hidden",
                  }}>
                    {tabs.map((tab, i) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setFavoritesOnly(true);
                          setFavoritesDropdownOpen(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          width: "100%",
                          padding: "10px 16px",
                          background: favoritesOnly && activeTab === tab.id
                            ? "var(--p-color-bg-surface-critical-subdued, #fff4f4)"
                            : "none",
                          border: "none",
                          borderBottom: i < tabs.length - 1
                            ? "1px solid var(--p-color-border-subdued)"
                            : "none",
                          cursor: "pointer",
                          fontSize: 13,
                          color: favoritesOnly && activeTab === tab.id
                            ? "var(--p-color-text-critical, #d72c0d)"
                            : "var(--p-color-text)",
                          fontWeight: favoritesOnly && activeTab === tab.id ? 600 : 400,
                          textAlign: "left",
                        }}
                      >
                        <span style={{ fontSize: 15 }}>{tab.icon}</span>
                        {tab.label} Favorites
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            title="Close library"
            style={{
              padding: "14px 20px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              color: "var(--p-color-text-secondary)",
              lineHeight: 1,
              borderLeft: "1px solid var(--p-color-border-subdued)",
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Detail view (shown when a card's Preview button is clicked) ──── */}
        {viewingItem && (
          <DetailView
            item={viewingItem}
            activeTab={activeTab}
            isFav={favorites.includes(viewingItem.id)}
            onBack={() => setViewingItem(null)}
            onInsert={handleInsert}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* ── Browse UI (hidden while a detail view is open) ─────────────── */}
        {!viewingItem && <>

        {/* ── Filter bar ────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 20px",
            borderBottom: "1px solid var(--p-color-border-subdued)",
            background: "var(--p-color-bg-surface-secondary)",
            flexShrink: 0,
            flexWrap: "wrap",
          }}
        >
          {/* Category dropdown — only for blocks/pages */}
          {data?.categories && data.categories.length > 0 && (
            <CategoryDropdown
              categories={data.categories}
              selected={category}
              onChange={setCategory}
            />
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Search */}
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 14,
                color: "var(--p-color-text-secondary)",
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                paddingLeft: 32,
                paddingRight: 12,
                paddingTop: 7,
                paddingBottom: 7,
                border: "1px solid var(--p-color-border)",
                borderRadius: "var(--p-border-radius-100, 4px)",
                fontSize: 13,
                color: "var(--p-color-text)",
                background: "var(--p-color-bg-surface)",
                outline: "none",
                width: 200,
              }}
            />
          </div>

          {/* Item count */}
          {!loading && data && (
            <span style={{ fontSize: 12, color: "var(--p-color-text-secondary)" }}>
              {data.items.length} {data.items.length === 1 ? "item" : "items"}
            </span>
          )}
        </div>


        {/* ── Layout filter pills (shown when a block category is selected) ── */}
        {activeTab === "blocks" && category && LAYOUT_OPTIONS[category] && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 20px",
              borderBottom: "1px solid var(--p-color-border-subdued)",
              background: "var(--p-color-bg-surface-secondary)",
              flexShrink: 0,
              overflowX: "auto",
              scrollbarWidth: "none",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--p-color-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                whiteSpace: "nowrap",
                marginRight: 4,
              }}
            >
              Layout:
            </span>
            {LAYOUT_OPTIONS[category].map(({ tag, label }) => {
              const active = layoutTag === tag;
              return (
                <button
                  key={tag || "__all-lyt__"}
                  onClick={() => setLayoutTag(tag)}
                  style={{
                    padding: "3px 11px",
                    borderRadius: 999,
                    border: `1.5px solid ${
                      active
                        ? "var(--p-color-border-emphasis, #005bd3)"
                        : "var(--p-color-border-subdued)"
                    }`,
                    background: active
                      ? "var(--p-color-bg-surface-selected)"
                      : "var(--p-color-bg-surface)",
                    color: active
                      ? "var(--p-color-text-emphasis)"
                      : "var(--p-color-text-secondary)",
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.12s ease",
                    lineHeight: "1.4",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Grid ──────────────────────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 20,
          }}
        >
          {loading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : !data ? (
            <EmptyState message="No sections available" />
          ) : (() => {
            // Filter client-side so toggling favoritesOnly never triggers a
            // server re-fetch or loading skeleton.
            const displayItems = favoritesOnly
              ? data.items.filter((item) => favorites.includes(item.id))
              : data.items;

            if (displayItems.length === 0) {
              return (
                <EmptyState
                  message={
                    favoritesOnly
                      ? "No favorites yet — click ♥ on a card to save it"
                      : debouncedSearch
                        ? `No results for "${debouncedSearch}"`
                        : "No sections available"
                  }
                />
              );
            }

            return (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              {displayItems.map((item) => (
                <LibraryCard
                  key={item.id}
                  item={item}
                  isFav={favorites.includes(item.id)}
                  onInsert={handleInsert}
                  onToggleFavorite={handleToggleFavorite}
                  onView={setViewingItem}
                />
              ))}
            </div>
            );
          })()}
        </div>

        {/* end browse UI */}
        </>}

        {/* ── Flash message ─────────────────────────────────────────────────── */}
        {insertedId && (
          <div
            style={{
              position: "absolute",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              background: "var(--p-color-bg-fill-success, #15803d)",
              color: "var(--p-color-text-success-on-bg-fill, #fff)",
              padding: "10px 20px",
              borderRadius: "var(--p-border-radius-200, 8px)",
              fontSize: 13,
              fontWeight: 500,
              boxShadow: "var(--p-shadow-300, 0 4px 16px rgba(0,0,0,0.2))",
              zIndex: 10,
            }}
          >
            ✓ Section inserted into page
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

