import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { Data } from "@my-app/puck-editor";
import { ActionBar, Puck, Render, usePuck } from "@my-app/puck-editor";
import { WalletCards, Trash2, LayoutGrid, Layers, Globe, BookOpen, LogOut, Undo2, Redo2, Settings, FileText, MousePointer2 } from "lucide-react";
import { Button, InlineStack, Text } from "@shopify/polaris";

// Compact input style for right-panel fieldTypes overrides.
// Sized to match the left sidebar (Global Settings) FORM_INPUT_STYLE:
// padding-driven height with 13px text, not a fixed 28px box.
const COMPACT_FIELD: React.CSSProperties = {
  width: "100%",
  padding: "5px 8px",
  fontSize: "var(--p-font-size-325, 13px)",
  lineHeight: "1.4",
  border: "1px solid var(--p-color-border)",
  borderRadius: "var(--p-border-radius-100, 4px)",
  background: "var(--p-color-bg-surface)",
  color: "var(--p-color-text)",
  boxSizing: "border-box",
  outline: "none",
  fontFamily: "inherit",
};

// Keep editor labels visually stable regardless of theme/state.
// Scoped to Puck sidebars so content canvas text is unaffected.
const FORCE_BLACK_EDITOR_LABELS_STYLES = `
.Puck [class*="Sidebar"] [class*="FieldLabel"] label,
.Puck [class*="Sidebar"] [class*="FieldLabel-label"],
.Puck [class*="Sidebar"] [class*="FieldLabel-title"],
.Puck [class*="Sidebar"] [class*="FieldLabel"] > span {
  color: #000000 !important;
  font-weight: 400 !important;
}

.Puck [class*="Sidebar"] [class*="SidebarSection-title"],
.Puck [class*="Sidebar"] [class*="FieldsPlugin-header"] {
  color: #000000 !important;
  font-weight: 600 !important;
}
`;

import { config, previewConfig } from "@/puck.config";
import type { GlobalSettings } from "@/lib/settings.server";
import type { SavedBlock } from "@/puck-splat/types";
import { SaveAsGlobalBlockModal } from "@/puck-splat/components/SaveAsGlobalBlockModal";
import {
  CANVAS_SCROLL_STYLES,
  COMPONENT_ICONS,
  COMPONENT_LABELS,
  DRAWER_GRID_STYLES,
  DRAWER_ITEM_CARD_STYLE,
  FALLBACK_ICON,
  GLOBAL_BLOCKS_REFRESH_EVENT,
  IFRAME_SCROLLBAR_CSS,
  PARALLAX_DRAG_STYLES,
  SAVED_BLOCKS_REFRESH_EVENT,
} from "@/puck-splat/constants";
import {
  createGlobalBlockComponents,
  createSavedBlockComponents,
  savedBlockItemIds,
} from "@/puck-splat/utils";
import { createGlobalSettingsPlugin } from "@/puck-splat/plugins/GlobalSettingsPlugin";
import { GlobalSettingsProvider, useGlobalSettings } from "@/puck-splat/context/GlobalSettingsContext";
import { IframeThemeInjector } from "@/puck-splat/components/IframeThemeInjector";
import { SaveBlockModal } from "@/puck-splat/components/SaveBlockModal";
import { EditGlobalBlockModal } from "@/puck-splat/components/EditGlobalBlockModal";
import { PublishGuidelineModal } from "@/puck-splat/components/PublishGuidelineModal";
import { ComponentsPanelWithTabs } from "@/puck-splat/components/ComponentsPanelWithTabs";
import { GlobalLayoutPanel } from "@/puck-splat/components/GlobalLayoutPanel";
import { useSavePage } from "@/puck-splat/hooks/useSavePage";
import { computeContentSize } from "@/puck-splat/hooks/useContentSize";
import type { PuckData } from "@/lib/page-schema";
import ConfirmModal from "@/components/confirm-modal";

// ─── Right-panel close button ─────────────────────────────────────────────────
// Rendered via the `fields` override. Puck can mount more than one `Fields`
// tree at once, so this uses a single shared DOM button instead of rendering
// one React button per instance. That guarantees exactly one close control in
// the right-panel header.

let fieldsCloseButtonMountCount = 0;

function FieldsCloseButton() {
  const { dispatch } = usePuck();

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    fieldsCloseButtonMountCount += 1;

    const buttonId = "pb-fields-close-button";
    const selectors = [
      ". _Sidebar--right_o396p_25 ._FieldsPlugin-header_nd930_7",
      "._Sidebar--right_o396p_25 ._SidebarSection-title_5otpt_12",
    ].map((selector) => selector.replace(". ", "."));

    const ensureButton = () => {
      const target = selectors
        .map((selector) => document.querySelector(selector))
        .find((node): node is HTMLElement => node instanceof HTMLElement);

      const existingButton = document.getElementById(buttonId) as HTMLButtonElement | null;

      if (!target) {
        existingButton?.remove();
        return;
      }

      const button = existingButton ?? document.createElement("button");

      if (!existingButton) {
        button.id = buttonId;
        button.type = "button";
        button.setAttribute("aria-label", "Close properties panel");
        button.textContent = "✕";
        Object.assign(button.style, {
          height: "20px",
          width: "20px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          top: "50%",
          right: "12px",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--puck-color-grey-04)",
          fontSize: "14px",
          lineHeight: "1",
          borderRadius: "4px",
          padding: "0",
          flexShrink: "0",
          zIndex: "1",
        } satisfies Partial<CSSStyleDeclaration>);

        button.onmouseenter = () => {
          button.style.color = "var(--puck-color-grey-01)";
          button.style.background = "var(--puck-color-grey-10)";
        };
        button.onmouseleave = () => {
          button.style.color = "var(--puck-color-grey-04)";
          button.style.background = "none";
        };
      }

      button.onclick = () => {
        (dispatch as any)({ type: "setUi", ui: { itemSelector: null } });
      };

      if (button.parentElement !== target) {
        target.appendChild(button);
      }
    };

    ensureButton();

    const observer = new MutationObserver(ensureButton);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      fieldsCloseButtonMountCount -= 1;

      if (fieldsCloseButtonMountCount === 0) {
        document.getElementById(buttonId)?.remove();
      }
    };
  }, [dispatch]);

  return null;
}

// ─── Inspector-disabled placeholder ───────────────────────────────────────────
// Shown in the right sidebar when the inspector is OFF. The panel stays open
// (so the layout doesn't collapse) but appears disabled, prompting the user to
// re-enable the inspector to edit blocks.
function InspectorDisabledNotice() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 12,
        padding: "48px 24px",
        height: "100%",
        color: "var(--puck-color-grey-05, #9ca3af)",
        userSelect: "none",
      }}
    >
      <MousePointer2 size={26} strokeWidth={1.75} />
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--puck-color-grey-04, #6b7280)" }}>
        Inspector is off
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.5, maxWidth: 220 }}>
        Links and buttons are live for preview. Turn the inspector back on to
        select and edit blocks.
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type GlobalBlock = {
  id: string;
  name: string;
  content: unknown[];
  zones?: Record<string, unknown[]>;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type EditorOverrideContextValue = {
  globalBlocksRef: React.RefObject<GlobalBlock[]>;
  savedBlocks: SavedBlock[];
  globalBlocks: GlobalBlock[];
  deletingSaved: string | null;
  deletingGlobal: string | null;
  onDeleteSaved: (block: SavedBlock) => void;
  onDeleteGlobal: (block: GlobalBlock) => void;
};

const EditorOverrideContext = createContext<EditorOverrideContextValue | null>(null);

// ─── DrawerItemOverride ───────────────────────────────────────────────────────

function DrawerItemOverride({ name }: { name: string }) {
  const ctx = useContext(EditorOverrideContext)!;
  const [hoverPos, setHoverPos] = useState<{ top: number; left: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const { globalBlocksRef, savedBlocks, deletingSaved, deletingGlobal, onDeleteSaved, onDeleteGlobal } = ctx;

  const isSaved = name.startsWith("SavedBlock_");
  const isGlobal = name.startsWith("GlobalBlock_");

  const icon = isSaved
    ? <WalletCards />
    : isGlobal
      ? "🌐"
      : (COMPONENT_ICONS[name] ?? FALLBACK_ICON);

  const globalBlocksNow = globalBlocksRef.current ?? [];
  const displayName = isSaved
    ? name.replace("SavedBlock_", "")
    : isGlobal
      ? (globalBlocksNow.find((b) => `GlobalBlock_${b.id}` === name)?.name ?? name.replace("GlobalBlock_", ""))
      : name;

  const savedBlock = isSaved ? savedBlocks.find((b) => `SavedBlock_${b.name}` === name) ?? null : null;
  const globalBlock = isGlobal ? globalBlocksNow.find((b) => `GlobalBlock_${b.id}` === name) ?? null : null;

  const isItemDeleting = isSaved
    ? deletingSaved === savedBlock?.id
    : isGlobal
      ? deletingGlobal === globalBlock?.id
      : false;

  const formatDisplayName = (n: string) =>
    n.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();

  const formattedName = COMPONENT_LABELS[displayName] ?? formatDisplayName(displayName);

  return (
    <div
      className="elementor-block-card"
      onMouseEnter={(e) => {
        setIsHovered(true);
        const rect = e.currentTarget.getBoundingClientRect();
        setHoverPos({ top: rect.top + rect.height / 2, left: rect.right + 10 });
      }}
      onMouseLeave={() => { setIsHovered(false); setHoverPos(null); }}
      style={{
        ...DRAWER_ITEM_CARD_STYLE,
        position: "relative",
        borderColor: isHovered ? "#0073aa" : "#d5d5d5",
        boxShadow: isHovered ? "0 0 0 1px #0073aa" : "none",
      }}
    >
      <div style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--p-color-icon)", flexShrink: 0 }}>
        <span style={{ fontSize: "17px", lineHeight: 1, display: "flex" }}>{icon}</span>
      </div>
      <span style={{ fontSize: "12px", lineHeight: 1.2, color: "var(--p-color-text)", wordBreak: "break-word", maxWidth: "100%", padding: "0 2px", fontWeight: 500 }}>
        {formattedName}
      </span>

      {isSaved && savedBlock && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onDeleteSaved(savedBlock); }}
          disabled={isItemDeleting}
          style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "rgba(0,0,0,0.06)", border: "none", cursor: isItemDeleting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, opacity: isItemDeleting ? 0.5 : 1 }}>
          {isItemDeleting ? <span style={{ fontSize: 10 }}>⋯</span> : <Trash2 size={11} strokeWidth={2} />}
        </button>
      )}

      {isGlobal && globalBlock && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onDeleteGlobal(globalBlock); }} disabled={isItemDeleting}
          style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "rgba(0,0,0,0.06)", border: "none", cursor: isItemDeleting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, opacity: isItemDeleting ? 0.5 : 1 }}>
          {isItemDeleting ? <span style={{ fontSize: 10 }}>⋯</span> : <Trash2 size={11} strokeWidth={2} />}
        </button>
      )}

      {isSaved && savedBlock && hoverPos && createPortal(
        <div style={{ position: "fixed", zIndex: 99999, top: hoverPos.top, left: hoverPos.left, transform: "translateY(-50%)", width: "320px", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", background: "white", overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9", padding: "8px 12px", fontSize: "11px", fontWeight: 600, color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
            <WalletCards size={14} /> Preview: {displayName}
          </div>
          <div style={{ maxHeight: "240px", overflow: "hidden" }}>
            <div style={{ width: "1280px", transform: "scale(0.25)", transformOrigin: "top left" }}>
              <Render config={config} data={{ content: savedBlock.content as never[], root: { props: { title: "Preview", theme: "light" } as never }, zones: {} }} />
            </div>
          </div>
        </div>,
        document.body,
      )}

      {isGlobal && globalBlock && hoverPos && createPortal(
        <div style={{ position: "fixed", zIndex: 99999, top: hoverPos.top, left: hoverPos.left, transform: "translateY(-50%)", width: "320px", border: "1px solid #dbeafe", borderRadius: "12px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", background: "white", overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ background: "#eff6ff", borderBottom: "1px solid #dbeafe", padding: "8px 12px", fontSize: "11px", fontWeight: 600, color: "#0158ad", display: "flex", alignItems: "center", gap: "6px" }}>
            🌐 Preview: {displayName}
          </div>
          <div style={{ maxHeight: "240px", overflow: "hidden" }}>
            <div style={{ width: "1280px", transform: "scale(0.25)", transformOrigin: "top left" }}>
              <Render config={config} data={{ content: globalBlock.content as never[], root: { props: { title: "Preview", theme: "light" } as never }, zones: (globalBlock.zones ?? {}) as Record<string, never[]> }} />
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

// ─── PuckContextModal ─────────────────────────────────────────────────────────

function PuckContextModal({ onClose }: { onClose: () => void }) {
  return (
    <SaveBlockModal
      onClose={onClose}
      onSaved={() => window.dispatchEvent(new Event(SAVED_BLOCKS_REFRESH_EVENT))}
    />
  );
}

// ─── PuckCategorySync ─────────────────────────────────────────────────────────

function PuckCategorySync({ globalBlocks, savedBlocks }: { globalBlocks: { id: string }[]; savedBlocks: SavedBlock[] }) {
  const { dispatch } = usePuck();

  useEffect(() => {
    const globalComponentNames = globalBlocks.map((b) => `GlobalBlock_${b.id}`);
    const savedBlockItems = savedBlocks.filter((b) => b.blockType !== "section");
    const savedSectionItems = savedBlocks.filter((b) => b.blockType === "section");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (dispatch as any)({
      type: "setUi",
      ui: (prev: any) => {
        const { global: prevGlobal, savedBlocks: prevSaved, mySections: prevSections, ...restComponentList } = prev.componentList ?? {};
        return {
          componentList: {
            ...restComponentList,
            ...(globalComponentNames.length > 0
              ? {
                  global: {
                    title: "Global Blocks",
                    components: globalComponentNames,
                    expanded: prevGlobal?.expanded ?? true,
                    visible: true,
                  },
                }
              : {}),
            ...(savedBlockItems.length > 0
              ? {
                  savedBlocks: {
                    title: "Saved Blocks",
                    components: savedBlockItems.map((b) => `SavedBlock_${b.name}`),
                    expanded: prevSaved?.expanded ?? true,
                    visible: true,
                  },
                }
              : {}),
            ...(savedSectionItems.length > 0
              ? {
                  mySections: {
                    title: "My Sections",
                    components: savedSectionItems.map((b) => `SavedBlock_${b.name}`),
                    expanded: prevSections?.expanded ?? true,
                    visible: true,
                  },
                }
              : {}),
          },
        };
      },
    });
  }, [globalBlocks, savedBlocks, dispatch]);

  return null;
}

// ─── SelectionTracker ────────────────────────────────────────────────────────
// Resets global-layout select mode whenever the user clicks a real component.
// Also controls right-sidebar visibility: visible only when a block is selected
// or the global-layout panel is open.

function SelectionTracker({
  onSelect,
  globalSelect,
  inspectorEnabled,
}: {
  onSelect: () => void;
  globalSelect: string | null;
  inspectorEnabled: boolean;
}) {
  const { appState, dispatch } = usePuck();
  const prevRef = useRef(appState.ui.itemSelector);

  useEffect(() => {
    if (appState.ui.itemSelector && !prevRef.current) {
      onSelect();
    }
    prevRef.current = appState.ui.itemSelector;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState.ui.itemSelector]);

  useEffect(() => {
    // Inspector OFF keeps the right sidebar open (it renders a disabled state via
    // the `fields` override) so the panel doesn't collapse when toggling it.
    const shouldShow =
      !inspectorEnabled || !!appState.ui.itemSelector || !!globalSelect;
    (dispatch as any)({ type: "setUi", ui: { rightSideBarVisible: shouldShow } });
  }, [appState.ui.itemSelector, globalSelect, dispatch, inspectorEnabled]);

  // Inspector OFF = interactive preview mode: no block selection interception,
  // links/buttons behave like a live page for functional testing.
  useEffect(() => {
    (dispatch as any)({
      type: "setUi",
      ui: {
        previewMode: inspectorEnabled ? "edit" : "interactive",
        ...(inspectorEnabled ? {} : { itemSelector: null }),
      },
    });
  }, [inspectorEnabled, dispatch]);

  // Stamp data-pb-preview on the Puck root when inspector is OFF.
  // CSS uses this to suppress any remaining editor affordances on the canvas.
  useEffect(() => {
    const el = document.querySelector(".Puck");
    if (!el) return;
    if (!inspectorEnabled) {
      el.setAttribute("data-pb-preview", "true");
    } else {
      el.removeAttribute("data-pb-preview");
    }
    return () => el.removeAttribute("data-pb-preview");
  }, [inspectorEnabled]);

  // When GlobalLayoutPanel is open, stamp a data attribute on the Puck root so
  // CSS can hide Puck's own "Page" title and let our header appear at the top.
  useEffect(() => {
    const el = document.querySelector(".Puck");
    if (!el) return;
    if (globalSelect) {
      el.setAttribute("data-pb-global-select", globalSelect);
    } else {
      el.removeAttribute("data-pb-global-select");
    }
    return () => el.removeAttribute("data-pb-global-select");
  }, [globalSelect]);

  return null;
}

// ─── Dirty tracking + toast ───────────────────────────────────────────────────

/** Stable, comparable fingerprint of the meaningful page data — content, zones
 *  and title. Runtime-only root props (headerData/footerData/isGlobalEditor)
 *  are excluded so they never read as user edits. */
function fingerprint(data: Data, pageTitle: string): string {
  return JSON.stringify({
    content: data?.content ?? [],
    zones: data?.zones ?? {},
    title: data?.root?.props?.title ?? pageTitle,
  });
}

/** Shared unsaved-changes state. Driven by Puck's top-level onChange (which
 *  fires reliably on every edit) and consumed by both action buttons so they
 *  stay in sync — saving via either one clears the other's dirty flag. */
type DirtyContextValue = {
  isDirty: boolean;
  /** Reset the "no unsaved changes" baseline to the data just persisted. */
  markClean: (snapshot: string) => void;
};

const DirtyContext = createContext<DirtyContextValue>({
  isDirty: false,
  markClean: () => {},
});

// ─── LibraryContext ───────────────────────────────────────────────────────────

export const LibraryContext = createContext<{
  showLibrary: boolean;
  setShowLibrary: (v: boolean) => void;
}>({ showLibrary: false, setShowLibrary: () => {} });

// ─── HeaderNavIcons ───────────────────────────────────────────────────────────
// Icon-only tab switchers placed in the editor header beside "← All Pages".
// Delegates to Puck's native (visually-hidden) nav via programmatic click.

const NAV_TABS: { icon: React.ReactNode; label: string }[] = [
  { icon: <LayoutGrid size={15} strokeWidth={1.75} />, label: "Blocks" },
  { icon: <Layers size={15} strokeWidth={1.75} />,    label: "Outline" },
  {
    // Globe + gear badge — the standard "global settings" icon
    icon: (
      <span style={{ position: "relative", display: "inline-flex", width: 16, height: 16 }}>
        <Globe size={14} strokeWidth={1.75} />
        <span style={{
          position: "absolute", bottom: -2, right: -3,
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 8, height: 8, borderRadius: "50%",
          // White/surface background punches the gear out of the globe lines
          background: "var(--p-color-bg-surface, #fff)",
        }}>
          <Settings size={7} strokeWidth={2.5} />
        </span>
      </span>
    ),
    label: "Global Settings",
  },
];

function NavIconButton({
  icon,
  label,
  active,
  disabled = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

  return (
    <>
      <button
        ref={ref}
        disabled={disabled}
        onClick={disabled ? undefined : onClick}
        onMouseEnter={() => {
          const r = ref.current?.getBoundingClientRect();
          if (r) setTip({ x: r.left + r.width / 2, y: r.bottom + 6 });
        }}
        onMouseLeave={() => setTip(null)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 30,
          height: 30,
          borderRadius: 6,
          border: active ? "1px solid rgba(0,91,211,0.25)" : "1px solid transparent",
          cursor: disabled ? "default" : "pointer",
          background: active ? "rgba(0,91,211,0.08)" : "transparent",
          color: disabled
            ? "var(--p-color-text-disabled, #c9cccf)"
            : active
              ? "#005BD3"
              : "var(--p-color-text-secondary, #6d7175)",
          opacity: disabled ? 0.45 : 1,
          transition: "background 0.12s, color 0.12s, border-color 0.12s, opacity 0.12s",
          padding: 0,
          flexShrink: 0,
        }}
      >
        {icon}
      </button>
      {/* Don't show tooltip when disabled */}
      {tip && !disabled && createPortal(
        <div style={{
          position: "fixed",
          top: tip.y,
          left: tip.x,
          transform: "translateX(-50%)",
          background: "#1a1a1f",
          color: "#fff",
          fontSize: 11,
          fontWeight: 500,
          padding: "4px 8px",
          borderRadius: 6,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 99999,
          boxShadow: "0 2px 8px rgba(0,0,0,0.22)",
          fontFamily: "var(--p-font-family-sans, 'Inter', sans-serif)",
        }}>
          {label}
        </div>,
        document.body,
      )}
    </>
  );
}

function HeaderNavIcons() {
  // -1 = sidebar closed / not yet synced. Synced from DOM, not hard-coded.
  const [activeTab, setActiveTab] = useState(-1);
  const { setShowLibrary } = useContext(LibraryContext);

  // Read the tab that Puck's DOM currently considers active.
  // Puck adds ._NavItem--active_1tvxq_94 to the active nav-item's <li>.
  const syncActiveTab = useCallback(() => {
    const sidebar = document.querySelector<HTMLElement>("._Sidebar--left_o396p_13");
    if (!sidebar) return;
    const w = sidebar.getBoundingClientRect().width;
    if (w === 0) {
      setActiveTab(-1);
      return;
    }
    // All nav-item <li> wrappers, in DOM order = same order as NAV_TABS.
    const allItems = Array.from(
      document.querySelectorAll<HTMLElement>("._NavItem_1tvxq_38"),
    );
    const idx = allItems.findIndex((el) =>
      Array.from(el.classList).some((c) => c.includes("--active")),
    );
    if (idx >= 0) setActiveTab(idx);
  }, []);

  useEffect(() => {
    let resizeObs: ResizeObserver | null = null;
    let mutObs: MutationObserver | null = null;

    const attach = () => {
      const sidebar = document.querySelector<HTMLElement>("._Sidebar--left_o396p_13");
      if (!sidebar) return false;

      // Sidebar open/close — also re-sync on reopen so we know which tab is showing.
      resizeObs = new ResizeObserver((entries) => {
        const w = entries[0]?.contentRect.width ?? 1;
        if (w === 0) {
          setActiveTab(-1);
        } else {
          // Sidebar just reopened (e.g., after Puck toggles it during drag).
          // Re-read which tab Puck has active so the icon matches reality.
          syncActiveTab();
        }
      });
      resizeObs.observe(sidebar);

      // Detect Puck internally changing the active nav tab (e.g., during or
      // after a drag-and-drop, Puck may switch to a different section).
      // Puck does this by toggling ._NavItem--active_... on the <li> elements.
      mutObs = new MutationObserver((mutations) => {
        const navClassChanged = mutations.some(
          (m) =>
            m.type === "attributes" &&
            m.attributeName === "class" &&
            Array.from((m.target as Element).classList).some((c) =>
              c.includes("_NavItem"),
            ),
        );
        if (navClassChanged) syncActiveTab();
      });
      mutObs.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });

      syncActiveTab(); // initial sync on mount
      return true;
    };

    if (!attach()) {
      const id = setInterval(() => {
        if (attach()) clearInterval(id);
      }, 200);
      return () => clearInterval(id);
    }
    return () => {
      resizeObs?.disconnect();
      mutObs?.disconnect();
    };
  }, [syncActiveTab]);

  const clickTab = (index: number) => {
    const sidebar = document.querySelector<HTMLElement>("._Sidebar--left_o396p_13");
    const sidebarOpen = (sidebar?.getBoundingClientRect().width ?? 0) > 0;

    if (activeTab === index && sidebarOpen) {
      // Same tab + sidebar open → collapse.
      setActiveTab(-1);
      document
        .querySelector<HTMLElement>("._PuckHeader-leftSideBarToggle_63pti_48")
        ?.click();
      return;
    }

    // Different tab, or sidebar was closed → switch / open.
    setActiveTab(index);
    document.querySelectorAll<HTMLElement>("._NavItem-link_1tvxq_38")[index]?.click();
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {NAV_TABS.map((tab, i) => (
        <NavIconButton
          key={tab.label}
          icon={tab.icon}
          label={tab.label}
          active={activeTab === i}
          onClick={() => clickTab(i)}
        />
      ))}
      <div style={{ width: 1, height: 20, background: "var(--p-color-border)", margin: "0 4px" }} />
      <NavIconButton
        icon={<BookOpen size={15} strokeWidth={1.75} />}
        label="Section Library"
        active={false}
        onClick={() => setShowLibrary(true)}
      />
    </div>
  );
}

/** Fire an App Bridge toast. No-op (caught) when App Bridge isn't present. */
function showToast(message: string, isError = false) {
  try {
    const sh = (
      window as unknown as {
        shopify?: {
          toast?: {
            show: (m: string, o?: { duration?: number; isError?: boolean }) => void;
          };
        };
      }
    ).shopify;
    sh?.toast?.show(message, { duration: 3000, isError });
  } catch {
    /* App Bridge toast unavailable in this context */
  }
}

// ─── UndoRedoButtons ─────────────────────────────────────────────────────────

function UndoRedoButtons() {
  const { history } = usePuck();

  // Puck exposes histories[] and index so we can tell whether
  // there is anything to undo or redo without an extra state layer.
  const canUndo = (history.index ?? 0) > 0;
  const canRedo = (history.index ?? 0) < ((history.histories?.length ?? 1) - 1);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      <NavIconButton
        icon={<Undo2 size={15} strokeWidth={2.25} />}
        label="Undo"
        active={false}
        disabled={!canUndo}
        onClick={() => history.back()}
      />
      <NavIconButton
        icon={<Redo2 size={15} strokeWidth={2.25} />}
        label="Redo"
        active={false}
        disabled={!canRedo}
        onClick={() => history.forward()}
      />
    </div>
  );
}

function InspectorToggleButton({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <NavIconButton
      icon={<MousePointer2 size={15} strokeWidth={2} />}
      label={enabled ? "Inspector: on — click blocks to edit" : "Inspector: off — links & buttons are live"}
      active={enabled}
      onClick={onToggle}
    />
  );
}

// ─── SaveButton ──────────────────────────────────────────────────────────────

function SaveButton({
  slug,
  pageTitle,
}: {
  slug: string;
  pageTitle: string;
}) {
  const { appState } = usePuck();
  const { settings } = useGlobalSettings();
  const { isDirty, markClean } = useContext(DirtyContext);
  const { status, error, save } = useSavePage(slug, pageTitle, { settings });

  const label =
    status === "saving" ? "Saving…" :
    status === "saved"  ? "✓ Saved" :
    status === "error"  ? "✗ Error" :
    "Save to Shopify";

  const tone = status === "error" ? "critical" : undefined;

  // Disable when there's nothing new to save (clean state) OR mid-save.
  // Errors stay clickable so the user can retry.
  const disabled = status === "saving" || (!isDirty && status !== "error");

  const handleSave = async () => {
    const snapshot = fingerprint(appState.data, pageTitle);
    const ok = await save(appState.data);
    if (ok) {
      markClean(snapshot);
      showToast("Changes saved successfully");
    }
  };

  return (
    <InlineStack gap="200" align="center">
      {status === "error" && error && (
        <Text as="span" variant="bodySm" tone="critical">{error}</Text>
      )}
      <Button
        variant="primary"
        tone={tone}
        loading={status === "saving"}
        disabled={disabled}
        onClick={handleSave}
      >
        {label}
      </Button>
    </InlineStack>
  );
}

// ─── PublishButton ────────────────────────────────────────────────────────────

function PublishButton({
  onPublish,
  onPublishSuccess,
  pageTitle,
}: {
  onPublish: (data: Data) => Promise<void>;
  onPublishSuccess?: () => void;
  pageTitle: string;
}) {
  const { appState } = usePuck();
  const { settings } = useGlobalSettings();
  const { isDirty, markClean } = useContext(DirtyContext);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const handlePublish = async () => {
    setPublishError(null);

    // Block validation: Image blocks must have an image set.
    const allBlocks = [
      ...(appState.data.content ?? []),
      ...Object.values(appState.data.zones ?? {}).flat(),
    ] as any[];
    const emptyImages = allBlocks.filter(
      (b) => b.type === "Image" && !b.props?.imageUrl
    );
    if (emptyImages.length > 0) {
      window.dispatchEvent(new CustomEvent("pb:image-validation-failed"));
      return;
    }

    // About section: a Button URL with no Button Label is incomplete. Block the
    // publish silently — the error is surfaced inline at the Button Label field
    // in the left sidebar (see Section_About content fields), not here.
    const aboutMissingLabel = allBlocks.some(
      (b) => b.type === "Section_About"
        && !!(b.props?.buttonUrl ?? "").trim()
        && !(b.props?.buttonLabel ?? "").trim()
    );
    if (aboutMissingLabel) {
      return;
    }

    // Client-side preflight using the same renderer the server uses so the
    // user never sees the raw "pageUpdate body failed: Content is too big"
    // GraphQL error.
    try {
      const size = computeContentSize(appState.data as unknown as PuckData, settings);
      if (size.isOver) {
        setPublishError(
          `Page is too large to publish (${size.kb} KB / ${size.limitKb} KB). Remove some content and try again.`,
        );
        setTimeout(() => setPublishError(null), 5000);
        return;
      }
    } catch {
      // Fall through — server preflight will still catch it.
    }

    const snapshot = fingerprint(appState.data, pageTitle);
    setPublishing(true);
    try {
      const cleanData: Data = {
        ...appState.data,
        root: {
          ...appState.data.root,
          props: { title: appState.data.root?.props?.title ?? pageTitle },
        },
      };
      await onPublish(cleanData);
      markClean(snapshot);
      showToast("Page published successfully");
      onPublishSuccess?.();
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Publish failed");
      setTimeout(() => setPublishError(null), 5000);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <Button
        variant="primary"
        loading={publishing}
        disabled={publishing || !isDirty}
        onClick={handlePublish}
      >
        Publish
      </Button>
      {publishError && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          background: "#fff",
          border: "1px solid #fca5a5",
          borderRadius: 6,
          padding: "8px 12px",
          fontSize: 12,
          color: "#d72c0d",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          zIndex: 9999,
          maxWidth: 300,
          lineHeight: 1.4,
          whiteSpace: "normal" as any,
        }}>
          {publishError}
        </div>
      )}
    </div>
  );
}

// ─── PolarisEditorHeader ──────────────────────────────────────────────────────

function PolarisEditorHeader({
  pageTitle,
  slug,
  onPublish,
  onPublishSuccess,
  inspectorEnabled,
  onToggleInspector,
  children,
}: {
  pageTitle: string;
  slug: string;
  onPublish: (data: Data) => Promise<void>;
  onPublishSuccess?: () => void;
  inspectorEnabled: boolean;
  onToggleInspector: () => void;
  children: React.ReactNode;
}) {
  const goBack = () => {
    // BroadcastChannel reaches the "All Pages" panel regardless of whether
    // the s-app-window iframe is a child of our frame or a sibling created by
    // App Bridge at the Shopify-admin level (cross-origin parent).
    try {
      const ch = new BroadcastChannel("pb-editor");
      ch.postMessage({ type: "pb:close-editor" });
      ch.close();
      return;
    } catch {
      // BroadcastChannel unavailable — fall back to direct navigation.
    }
    window.location.href = "/app";
  };

  return (
    <div style={{
      height: 56,
      borderBottom: "1px solid var(--p-color-border)",
      background: "var(--p-color-bg-surface)",
      display: "flex",
      alignItems: "center",
      padding: "0 12px",
      gap: 8,
      boxShadow: "var(--p-shadow-100)",
      flexShrink: 0,
      zIndex: 10,
    }}>
      {/* Left: back + sidebar tab icons */}
      <InlineStack gap="200" blockAlign="center">
        <NavIconButton
          icon={<LogOut size={18} strokeWidth={2} style={{ transform: "scaleX(-1)" }} />}
          label="All Pages"
          active={false}
          onClick={goBack}
        />
        <div style={{ width: 1, height: 20, background: "var(--p-color-border)", flexShrink: 0 }} />
        <HeaderNavIcons />
      </InlineStack>

      {/* Center: page icon + page name only */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FileText size={15} strokeWidth={1.75} color="var(--p-color-text-secondary, #6d7175)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--p-color-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 240 }}>
            {pageTitle}
          </span>
        </div>
        {/* Keep Puck's children in DOM (hidden) so its internal state stays intact */}
        <div style={{ display: "none" }}>{children}</div>
      </div>

      {/* Right: undo/redo + inspector + publish */}
      <InlineStack gap="200" blockAlign="center">
        <UndoRedoButtons />
        <InspectorToggleButton enabled={inspectorEnabled} onToggle={onToggleInspector} />
        <div style={{ width: 1, height: 20, background: "var(--p-color-border)", flexShrink: 0 }} />
        <PublishButton
          onPublish={onPublish}
          onPublishSuccess={onPublishSuccess}
          pageTitle={pageTitle}
        />
      </InlineStack>
    </div>
  );
}

// ─── PuckSplatEditor ─────────────────────────────────────────────────────────

export default function PuckSplatEditor({
  path,
  pageTitle,
  data,
  globalSettings,
  savedBlocks: initialSavedBlocks,
  globalBlocks: initialGlobalBlocks,
  headerData,
  footerData,
}: {
  path: string;
  pageTitle: string;
  data: Data;
  globalSettings: GlobalSettings;
  savedBlocks: SavedBlock[];
  globalBlocks: GlobalBlock[];
  headerData?: unknown;
  footerData?: unknown;
}) {
  const [showLibrary, setShowLibrary] = useState(false);
  const [showGuidelineModal, setShowGuidelineModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSaveAsGlobalModal, setShowSaveAsGlobalModal] = useState(false);
  const [editingGlobalBlock, setEditingGlobalBlock] = useState<GlobalBlock | null>(null);
  const [pendingDeleteSaved, setPendingDeleteSaved] = useState<SavedBlock | null>(null);
  const [pendingDeleteGlobal, setPendingDeleteGlobal] = useState<GlobalBlock | null>(null);
  const [deletingSaved, setDeletingSaved] = useState<string | null>(null);
  const [deletingGlobal, setDeletingGlobal] = useState<string | null>(null);
  const [inspectorEnabled, setInspectorEnabled] = useState(true);
  const [savedBlocks, setSavedBlocks] = useState<SavedBlock[]>(initialSavedBlocks);
  const [globalBlocks, setGlobalBlocks] = useState<GlobalBlock[]>(initialGlobalBlocks);
  const globalBlocksRef = useRef(globalBlocks);
  useEffect(() => { globalBlocksRef.current = globalBlocks; }, [globalBlocks]);

  // ── Global layout (header/footer) click-to-edit ───────────────────────────
  const [globalSelect, setGlobalSelect] = useState<"header" | "footer" | null>(null);

  // ── Hero block appearance field visibility ──────────────────────────────────
  // Track the selected backgroundType so we can show/hide related fields via dynamicConfig

  useEffect(() => {
    const handler = (e: Event) => {
      const zone = (e as CustomEvent<{ zone: "header" | "footer" }>).detail?.zone;
      if (zone === "header" || zone === "footer") setGlobalSelect(zone);
    };
    window.addEventListener("puck:global-select", handler);
    return () => window.removeEventListener("puck:global-select", handler);
  }, []);

  const slug = path.replace(/^\//, "");

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const res = await fetch("/api/saved-blocks");
        setSavedBlocks(await res.json());
      } catch { setSavedBlocks([]); }
    };
    fetchBlocks();
    window.addEventListener(SAVED_BLOCKS_REFRESH_EVENT, fetchBlocks);
    return () => window.removeEventListener(SAVED_BLOCKS_REFRESH_EVENT, fetchBlocks);
  }, []);

  useEffect(() => {
    const fetchGlobal = async () => {
      try {
        const res = await fetch("/api/global-blocks");
        setGlobalBlocks(await res.json());
      } catch { /* keep existing */ }
    };
    fetchGlobal();
    window.addEventListener(GLOBAL_BLOCKS_REFRESH_EVENT, fetchGlobal);
    return () => window.removeEventListener(GLOBAL_BLOCKS_REFRESH_EVENT, fetchGlobal);
  }, []);

  // Stamp data-add-label (hover tooltip) and auto-expand on Puck's array add
  // buttons. Puck renders these internally; we observe the DOM to find them.
  useEffect(() => {
    const stamp = () => {
      document.querySelectorAll("[class*='_ArrayField-addButton_']").forEach((btn) => {
        // ── Tooltip ─────────────────────────────────────────────────────────
        if (!btn.hasAttribute("data-add-label")) {
          const field = btn.closest("[class*='_ArrayField_']");
          const labelEl =
            field?.closest("[class*='_SidebarSection_']")?.querySelector("[class*='_Label_']") ??
            field?.previousElementSibling;
          const labelText = labelEl?.textContent?.trim().toLowerCase() ?? "";
          const addLabel = labelText.includes("button") ? "Add Button"
            : labelText.includes("feature") ? "Add Feature"
            : labelText.includes("slide") ? "Add Slide"
            : labelText.includes("link") ? "Add Link"
            : "Add Item";
          btn.setAttribute("data-add-label", addLabel);
        }

        // ── Auto-expand new item ─────────────────────────────────────────────
        if (!btn.hasAttribute("data-expand-bound")) {
          btn.setAttribute("data-expand-bound", "true");
          btn.addEventListener("click", () => {
            // Wait one tick for React to flush the new item into the DOM
            setTimeout(() => {
              const field = btn.closest("[class*='_ArrayField_']");
              if (!field) return;
              const items = field.querySelectorAll("[class*='_ArrayFieldItem_']");
              const lastItem = items[items.length - 1] as HTMLElement | undefined;
              if (lastItem && !lastItem.className.includes("isExpanded")) {
                const summary = lastItem.querySelector("[class*='_ArrayFieldItem-summary_']") as HTMLElement | null;
                summary?.click();
              }
            }, 0);
          });
        }
      });
    };

    const observer = new MutationObserver(stamp);
    observer.observe(document.body, { childList: true, subtree: true });
    stamp();
    return () => observer.disconnect();
  }, []);

  const globalSettingsPlugin = useMemo(() => createGlobalSettingsPlugin(), []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dynamicConfig: any = useMemo(() => {
    const globalComponentNames = globalBlocks.map((b) => `GlobalBlock_${b.id}`);
    const allDynamicComponentNames = [
      ...Object.keys(config.components),
      ...savedBlocks.map((b) => `SavedBlock_${b.name}`),
    ];

    const savedBlockItems = savedBlocks.filter((b) => b.blockType !== "section");
    const savedSectionItems = savedBlocks.filter((b) => b.blockType === "section");

    const BLOCK_KEYS = [
      "MarqueeBar", "HeadingBlock", "Text", "Article", "PhotoCollage",
      "FeaturedProduct",
      "Image", "Space", "Button", "Divider", "Video", "BlockQuote",
      "StarRating", "ProgressBar", "Alert", "SocialIcons", "ShareButtons",
      "Section_Logos",
    ];

    const SECTION_KEYS = [
      "GlobalHeader", "GlobalFooter",
      "Section_Hero", "Section", "LayoutBlock", "GridBlock",
      "Section_About", "Section_Gallery", "Section_Testimonial", "Section_Carousel",
      "Section_Form", "Section_Countdown", "Section_MediaCarousel", "Section_Services",
      "Section_Pricing", "Section_CTA", "Section_FAQ", "Section_Team",
      "Section_Features", "Section_Newsletter", "Section_Video",
    ];

    return {
      ...config,
      categories: {
        blocks: {
          title: "Blocks",
          components: BLOCK_KEYS.filter((k) => allDynamicComponentNames.includes(k)),
          defaultExpanded: true,
        },
        sections: {
          title: "Sections",
          components: SECTION_KEYS.filter((k) => allDynamicComponentNames.includes(k)),
          defaultExpanded: false,
        },
        ...(globalComponentNames.length > 0
          ? { global: { title: "Global Blocks", components: globalComponentNames, defaultExpanded: true } }
          : {}),
        ...(savedBlockItems.length > 0
          ? { savedBlocks: { title: "Saved Blocks", components: savedBlockItems.map((b) => `SavedBlock_${b.name}`), defaultExpanded: true } }
          : {}),
        ...(savedSectionItems.length > 0
          ? { mySections: { title: "My Sections", components: savedSectionItems.map((b) => `SavedBlock_${b.name}`), defaultExpanded: true } }
          : {}),
        _internal: { title: "Internal", components: ["GlobalBlock"], visible: false, defaultExpanded: false },
      },
      components: {
        ...config.components,
        GlobalBlock: {
          ...config.components.GlobalBlock,
          fields: {},
          render: ({ globalBlockId, _name }: { globalBlockId: string; _name?: string }) => {
            const block = globalBlocks.find((b) => b.id === globalBlockId);
            if (!block?.content?.length) {
              return (
                <div style={{ border: "2px dashed #0158ad", borderRadius: 8, padding: "20px 16px", background: "#eff6ff", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 24 }}>🌐</span>
                  <span style={{ fontWeight: 600, fontSize: 14, color: "#0158ad" }}>{_name || "Global Block"}</span>
                  <span style={{ fontSize: 11, color: "#6b7280" }}>Block not found or has no content</span>
                </div>
              );
            }
            return (
              <Render
                config={previewConfig}
                data={{ content: block.content as never[], root: { props: { title: "" } } as never, zones: (block.zones ?? {}) as Record<string, never[]> }}
              />
            );
          },
        },
        ...createSavedBlockComponents(savedBlocks, config),
        ...createGlobalBlockComponents(globalBlocks as never, config),
      },
    };
  }, [savedBlocks, globalBlocks]);

  const overrideContextValue: EditorOverrideContextValue = useMemo(
    () => ({
      globalBlocksRef: globalBlocksRef as React.RefObject<GlobalBlock[]>,
      savedBlocks,
      globalBlocks,
      deletingSaved,
      deletingGlobal,
      onDeleteSaved: setPendingDeleteSaved,
      onDeleteGlobal: setPendingDeleteGlobal,
    }),
    [savedBlocks, globalBlocks, deletingSaved, deletingGlobal],
  );

  // Merge headerData / footerData into root props so the canvas renders them.
  // useMemo with [] ensures this only runs once on mount — Puck treats `data`
  // as initial state and manages it internally after that.
  const editorData: Data = useMemo(() => ({
    ...data,
    root: {
      ...data.root,
      props: {
        ...data.root?.props,
        headerData,
        footerData,
        isGlobalEditor: false,
      },
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  // ── Unsaved-changes tracking ───────────────────────────────────────────────
  // Driven by Puck's onChange (fires on every edit) rather than a usePuck read
  // inside the header override, which doesn't re-render reliably. Shared with
  // both action buttons through DirtyContext so they enable/disable together.
  const baselineRef = useRef<string>(fingerprint(editorData, pageTitle));
  const latestRef = useRef<string>(baselineRef.current);
  const [isDirty, setIsDirty] = useState(false);

  const handlePuckChange = useCallback(
    (next: Data) => {
      const fp = fingerprint(next, pageTitle);
      latestRef.current = fp;
      setIsDirty(fp !== baselineRef.current);
    },
    [pageTitle],
  );

  const markClean = useCallback((snapshot: string) => {
    baselineRef.current = snapshot;
    setIsDirty(latestRef.current !== snapshot);
  }, []);

  const dirtyValue = useMemo(
    () => ({ isDirty, markClean }),
    [isDirty, markClean],
  );

  return (
    <LibraryContext.Provider value={{ showLibrary, setShowLibrary }}>
    <DirtyContext.Provider value={dirtyValue}>
    <GlobalSettingsProvider
      initialSettings={globalSettings}
      onSave={async (settings) => {
        await fetch("/api/global-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ globalSettings: settings }),
        });
      }}
    >
      <EditorOverrideContext.Provider value={overrideContextValue}>
        <style>{DRAWER_GRID_STYLES}</style>
        <style>{PARALLAX_DRAG_STYLES}</style>
        <style>{FORCE_BLACK_EDITOR_LABELS_STYLES}</style>
        <style>{CANVAS_SCROLL_STYLES}</style>

        <Puck
          plugins={[globalSettingsPlugin]}
          config={dynamicConfig}
          data={editorData}
          onChange={handlePuckChange}
          onPublish={async () => { /* handled by PublishButton via PolarisEditorHeader */ }}
          overrides={{
            header: ({ children }) => (
              <PolarisEditorHeader
                pageTitle={pageTitle}
                slug={slug}
                inspectorEnabled={inspectorEnabled}
                onToggleInspector={() => setInspectorEnabled((prev) => !prev)}
                onPublish={async (cleanData) => {
                  let res: Response;
                  try {
                    res = await fetch(`/api/pages/${slug}`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ data: cleanData }),
                    });
                  } catch {
                    // Network/tunnel error — request never reached the server.
                    throw new Error("Publish failed: could not reach the server. Check your connection and try again.");
                  }
                  if (!res.ok) {
                    // Prefer a structured { error } JSON message; otherwise fall
                    // back to status-specific guidance (a non-JSON body usually
                    // means an expired session redirect or a server crash).
                    let msg = "";
                    const ct = res.headers.get("content-type") || "";
                    if (ct.includes("application/json")) {
                      try {
                        const body = await res.json();
                        if (body?.error) msg = body.error;
                      } catch { /* fall through */ }
                    }
                    if (!msg) {
                      if (res.status === 401 || res.status === 403 || res.status === 302) {
                        msg = "Publish failed: your session expired. Reload the page and try again.";
                      } else {
                        msg = `Publish failed (HTTP ${res.status}). Please try again.`;
                      }
                    }
                    throw new Error(msg);
                  }
                }}
                onPublishSuccess={() => setShowGuidelineModal(true)}
              >
                {children}
              </PolarisEditorHeader>
            ),
            drawer: ({ children }) => (
              <ComponentsPanelWithTabs>{children}</ComponentsPanelWithTabs>
            ),

            fieldTypes: {
              text: ({ id, value, onChange, readOnly }) => (
                <input
                  id={id}
                  type="text"
                  value={(value as string) ?? ""}
                  onChange={(e) => onChange(e.target.value)}
                  readOnly={readOnly}
                  style={COMPACT_FIELD}
                />
              ),
              textarea: ({ id, value, onChange, readOnly }) => (
                <textarea
                  id={id}
                  value={(value as string) ?? ""}
                  onChange={(e) => onChange(e.target.value)}
                  readOnly={readOnly}
                  rows={3}
                  style={{ ...COMPACT_FIELD, height: "auto", padding: "6px 8px", resize: "vertical", lineHeight: 1.5 }}
                />
              ),
              number: ({ id, value, onChange, readOnly }) => (
                <input
                  id={id}
                  type="number"
                  value={(value as number) ?? 0}
                  onChange={(e) => onChange(Number(e.target.value))}
                  readOnly={readOnly}
                  style={COMPACT_FIELD}
                />
              ),
              select: ({ id, value, onChange, field, readOnly }) => (
                <select
                  id={id}
                  value={(value as string) ?? ""}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={readOnly}
                  style={{ ...COMPACT_FIELD, appearance: "auto" }}
                >
                  {((field as any).options ?? []).map(
                    (opt: { value: string; label: string }) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    )
                  )}
                </select>
              ),
            },

            fields: ({ children, itemSelector }) => {
              // Inspector OFF: keep the sidebar mounted but show a disabled
              // placeholder instead of editable fields.
              if (!inspectorEnabled) {
                return <InspectorDisabledNotice />;
              }
              if (!itemSelector && globalSelect) {
                return (
                  <GlobalLayoutPanel
                    zone={globalSelect}
                    onClose={() => setGlobalSelect(null)}
                  />
                );
              }
              // When a block is selected, inject the ✕ close button into the
              // title bar via absolute positioning (SidebarSection is position:relative).
              if (itemSelector) {
                return (
                  <>
                    <FieldsCloseButton />
                    {children}
                  </>
                );
              }
              return <>{children}</>;
            },

            puck: ({ children }) => (
              <>
                {children}
                <PuckCategorySync globalBlocks={globalBlocks} savedBlocks={savedBlocks} />
                <SelectionTracker
                  onSelect={() => setGlobalSelect(null)}
                  globalSelect={globalSelect}
                  inspectorEnabled={inspectorEnabled}
                />
                {showSaveModal && <PuckContextModal onClose={() => setShowSaveModal(false)} />}
                {showSaveAsGlobalModal && <SaveAsGlobalBlockModal onClose={() => setShowSaveAsGlobalModal(false)} />}
                {showGuidelineModal && (
                  <PublishGuidelineModal
                    pageTitle={pageTitle}
                    pageId={slug}
                    pageSlug={slug}
                    onClose={() => setShowGuidelineModal(false)}
                  />
                )}
                {editingGlobalBlock && (
                  <EditGlobalBlockModal
                    block={editingGlobalBlock as never}
                    theme={globalSettings.theme}
                    onClose={() => setEditingGlobalBlock(null)}
                  />
                )}
                <ConfirmModal
                  open={!!pendingDeleteSaved}
                  title="Delete saved block?"
                  message={`"${pendingDeleteSaved?.name}" will be permanently deleted.`}
                  confirmLabel="Delete"
                  onConfirm={async () => {
                    if (!pendingDeleteSaved) return;
                    setDeletingSaved(pendingDeleteSaved.id);
                    setPendingDeleteSaved(null);
                    await fetch("/api/saved-blocks", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: pendingDeleteSaved.id }) });
                    setDeletingSaved(null);
                    window.dispatchEvent(new Event(SAVED_BLOCKS_REFRESH_EVENT));
                  }}
                  onCancel={() => setPendingDeleteSaved(null)}
                />
                <ConfirmModal
                  open={!!pendingDeleteGlobal}
                  title="Delete global block?"
                  message={`"${pendingDeleteGlobal?.name}" will be deleted. Pages using it will show a placeholder.`}
                  confirmLabel="Delete"
                  onConfirm={async () => {
                    if (!pendingDeleteGlobal) return;
                    setDeletingGlobal(pendingDeleteGlobal.id);
                    setPendingDeleteGlobal(null);
                    await fetch("/api/global-blocks", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: pendingDeleteGlobal.id }) });
                    setDeletingGlobal(null);
                    window.dispatchEvent(new Event(GLOBAL_BLOCKS_REFRESH_EVENT));
                  }}
                  onCancel={() => setPendingDeleteGlobal(null)}
                />
              </>
            ),

            iframe: ({ children }) => (
              <>
                <IframeThemeInjector />
                {/* Page scrolls inside the iframe — scrollbar appears inside the
                    white page area, not in the outer gray canvas gutter. */}
                <style>{IFRAME_SCROLLBAR_CSS}</style>
                {/* When inspector is OFF, disable the header/footer click-intercept
                    overlays so links and nav items are fully interactive. */}
                {!inspectorEnabled && (
                  <style>{`
                    .pb-global-overlay {
                      pointer-events: none !important;
                      background: transparent !important;
                      border-color: transparent !important;
                      cursor: default !important;
                    }
                  `}</style>
                )}
                {children}
              </>
            ),

            componentOverlay: ({ isSelected }) => {
              // In preview mode (inspector OFF) render nothing — no selection
              // borders, no hover affordances. The canvas behaves like a live page.
              if (!inspectorEnabled) return <></>;
              return (
                <div style={{ width: "100%", height: "100%", border: isSelected ? "2px solid #0158ad" : "none", opacity: 0.8 }} />
              );
            },

            drawerItem: ({ name }) => <DrawerItemOverride name={name} />,

            actionBar: ({ children }) => {
              if (!inspectorEnabled) return <></>;

              const { selectedItem } = usePuck();
              const label = selectedItem?.type ?? "No block selected";
              const isGlobalBlockItem = label === "GlobalBlock" || label.startsWith("GlobalBlock_");
              const isSavedBlockItem =
                (!!(selectedItem as never as { id?: string })?.id &&
                  savedBlockItemIds.has((selectedItem as never as { id?: string })?.id ?? "")) ||
                label.startsWith("SavedBlock_");

              const displayLabel = isSavedBlockItem
                ? label.replace("SavedBlock_", "")
                : isGlobalBlockItem
                  ? (globalBlocksRef.current.find((b) => b.id === (selectedItem as never as { props?: { globalBlockId?: string } })?.props?.globalBlockId)?.name ?? "Global Block")
                  : label;

              const selectedGlobalBlock = isGlobalBlockItem
                ? (globalBlocks.find((b) => b.id === (selectedItem as never as { props?: { globalBlockId?: string } })?.props?.globalBlockId) ?? null)
                : null;

              return (
                <ActionBar label={displayLabel}>
                  <ActionBar.Group>{children}</ActionBar.Group>
                  {isGlobalBlockItem && selectedGlobalBlock && (
                    <ActionBar.Group>
                      <Button
                        variant="plain"
                        onClick={() => setEditingGlobalBlock(selectedGlobalBlock)}
                      >
                        ✎ Edit Global Block
                      </Button>
                    </ActionBar.Group>
                  )}
                  {!isSavedBlockItem && !isGlobalBlockItem && (
                    <ActionBar.Group>
                      <Button
                        variant="plain"
                        disabled={!selectedItem}
                        onClick={() => setShowSaveModal(true)}
                      >
                        Save Block
                      </Button>
                      <Button
                        variant="plain"
                        disabled={!selectedItem}
                        onClick={() => setShowSaveAsGlobalModal(true)}
                      >
                        🌐 Global
                      </Button>
                    </ActionBar.Group>
                  )}
                </ActionBar>
              );
            },
          }}
        />
      </EditorOverrideContext.Provider>
    </GlobalSettingsProvider>
    </DirtyContext.Provider>
    </LibraryContext.Provider>
  );
}
