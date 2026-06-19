// @ts-nocheck
// ─── GridBlockComponent ───

import { DropZone, usePuck } from "@my-app/puck-editor";
import {
  ToggleField,
  StackedTextField,
  ColorPickerField,
  BlockTabBar,
  TabSection,
  FourSideField,
  ResponsiveSpacingField,
  InlineSelect,
  EditorHideOverlay,
  buildResponsiveSpacingCss,
} from "@/puck-blocks/shared";

const GridBlockComponent = {
  label: "Grid",
  fields: {
    _tabs: {
      type: "custom",
      label: "",
      render: ({ value: _v, onChange: _onChange }: any) => {
        const { selectedItem, appState, dispatch } = usePuck();
        const props = selectedItem?.props ?? {};
        const set = (key: string, val: any) => {
          if (!selectedItem) return;
          const state = appState.data;
          let destinationZone = "root:default-zone", destinationIndex = 0;
          const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
          for (const [zone, items] of Object.entries(zones)) {
            const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
            if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
          }
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
        };
        return (
          <BlockTabBar blockKey="GridBlock">
            {(tab) => (
              <>
                {tab === "content" && (
                  <>
                    <TabSection title="Columns" />
                    <InlineSelect label="Columns (Desktop)" value={String(props.columns ?? 2)} onChange={(v) => set("columns", Number(v))} options={[{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "6", label: "6" }]} />
                    <InlineSelect label="Columns (Tablet)" value={String(props.columnsTablet ?? 2)} onChange={(v) => set("columnsTablet", Number(v))} options={[{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }]} />
                    <InlineSelect label="Columns (Mobile)" value={String(props.columnsMobile ?? 1)} onChange={(v) => set("columnsMobile", Number(v))} options={[{ value: "1", label: "1" }, { value: "2", label: "2" }]} />
                    <TabSection title="Gap" />
                    <StackedTextField label="Column Gap" value={props.columnGap ?? "16px"} onChange={(v) => set("columnGap", v)} placeholder="e.g. 16px or 1rem" />
                    <StackedTextField label="Row Gap" value={props.rowGap ?? "16px"} onChange={(v) => set("rowGap", v)} placeholder="e.g. 16px or 1rem" />
                  </>
                )}
                {tab === "style" && (
                  <>
                    <TabSection title="Alignment" />
                    <InlineSelect label="Vertical Align" value={props.alignItems ?? "stretch"} onChange={(v) => set("alignItems", v)} options={[{ value: "stretch", label: "Stretch" }, { value: "flex-start", label: "Top" }, { value: "center", label: "Center" }, { value: "flex-end", label: "Bottom" }]} />
                    <TabSection title="Background" />
                    <ColorPickerField label="Background Color" value={props.bgColor ?? ""} onChange={(v) => set("bgColor", v)} />
                    <StackedTextField label="Border Radius" value={props.borderRadius ?? "0px"} onChange={(v) => set("borderRadius", v)} placeholder="e.g. 8px" />
                  </>
                )}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 0, right: 0, bottom: 0, left: 0 }} onChange={(v) => set("advPadding", v)} />
                    <TabSection title="Responsive Spacing" />
                    <ResponsiveSpacingField value={props.responsiveSpacing} onChange={(v) => set("responsiveSpacing", v)} />
                    <TabSection title="Responsive" />
                    <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                    <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
                    <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />
                  </>
                )}
              </>
            )}
          </BlockTabBar>
        );
      },
    },
  },
  defaultProps: {
    columns: 2, columnsTablet: 2, columnsMobile: 1,
    columnGap: "16px", rowGap: "16px",
    alignItems: "stretch", bgColor: "", borderRadius: "0px",
    advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 0, right: 0, bottom: 0, left: 0 },
    hideDesktop: false, responsiveSpacing: {}, hideTablet: false, hideMobile: false, cssId: "", cssClass: "", zIndex: null,
  },
  render: ({ id: puckId, columns, columnsTablet, columnsMobile, columnGap, rowGap, alignItems, bgColor, borderRadius, advMargin, advPadding, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex, responsiveSpacing }: any) => {
    // Use Puck's stable block id so the CSS selector and DropZone names are
    // unique per instance and never change across re-renders.
    const uid = cssId || `pb-grid-${puckId || "g"}`;
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const cols = Math.max(1, columns || 2);
    return (
      <div
        id={uid}
        data-pb-rs={uid}
        className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined}
        style={{
          paddingTop: advPadding?.top ?? 0, paddingRight: advPadding?.right ?? 0,
          paddingBottom: advPadding?.bottom ?? 0, paddingLeft: advPadding?.left ?? 0,
          marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0,
          marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0,
          zIndex: zIndex ?? undefined,
          backgroundColor: bgColor || undefined,
          borderRadius: borderRadius || undefined,
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        <EditorHideOverlay hideDesktop={hideDesktop} hideTablet={hideTablet} hideMobile={hideMobile} />
        {(() => { const rsCss = buildResponsiveSpacingCss(`[data-pb-rs="${uid}"]`, responsiveSpacing); return rsCss ? <style>{rsCss}</style> : null; })()}
        <style>{`
          #${uid} > .puck-grid-inner {
            display: grid;
            grid-template-columns: repeat(${cols}, 1fr);
            gap: ${rowGap || "16px"} ${columnGap || "16px"};
            align-items: ${alignItems || "stretch"};
          }
          @media (max-width: 768px) {
            #${uid} > .puck-grid-inner { grid-template-columns: repeat(${Math.min(cols, columnsTablet || 2)}, 1fr); }
          }
          @media (max-width: 480px) {
            #${uid} > .puck-grid-inner { grid-template-columns: repeat(${Math.min(cols, columnsMobile || 1)}, 1fr); }
          }
        `}</style>
        <div className="puck-grid-inner">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} style={{ minHeight: 60, boxSizing: "border-box" }}>
              {/* Zone name includes uid so each Grid instance has its own slots */}
              <DropZone zone={`grid-${uid}-col-${i}`} />
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export { GridBlockComponent };
