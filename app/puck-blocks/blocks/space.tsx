// @ts-nocheck
// ─── SpaceComponent ───

import { usePuck } from "@my-app/puck-editor";
import {
  ToggleField,
  ColorPickerField,
  BlockTabBar,
  TabSection,
  SliderNumberField,
  EditorHideOverlay,
} from "@/puck-blocks/shared";

const SpaceComponent = {
  label: "Spacer",
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
          let destinationZone = "root:default-zone";
          let destinationIndex = 0;
          const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
          for (const [zone, items] of Object.entries(zones)) {
            const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
            if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
          }
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
        };

        return (
          <BlockTabBar blockKey="Space">
            {(tab) => (
              <>
                {/* ── CONTENT TAB ── */}
                {tab === "content" && (
                  <>
                    <SliderNumberField label="Height Desktop (px)" value={props.heightDesktop ?? 32} onChange={(v) => set("heightDesktop", v)} min={0} max={500} step={4} unit="PX" />
                    <SliderNumberField label="Height Tablet (px)"  value={props.heightTablet  ?? 0}  onChange={(v) => set("heightTablet", v)}  min={0} max={500} step={4} unit="PX" />
                    <SliderNumberField label="Height Mobile (px)"  value={props.heightMobile  ?? 0}  onChange={(v) => set("heightMobile", v)}  min={0} max={500} step={4} unit="PX" />
                  </>
                )}

                {/* ── STYLE TAB ── */}
                {tab === "style" && (
                  <>
                    <ColorPickerField label="Background Color" value={props.backgroundColor ?? ""} onChange={(v) => set("backgroundColor", v)} />
                  </>
                )}

                {/* ── ADVANCED TAB ── */}
                {tab === "advanced" && (
                  <>
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
    heightDesktop: 32,
    heightDesktopUnit: "px",
    heightTablet: 0,
    heightTabletUnit: "px",
    heightMobile: 0,
    heightMobileUnit: "px",
    backgroundColor: "",
    hideDesktop: false,
    hideTablet: false,
    hideMobile: false,
    cssId: "",
    cssClass: "",
    zIndex: null,
  },

  render: ({ id, heightDesktop, heightDesktopUnit, heightTablet, heightTabletUnit, heightMobile, heightMobileUnit, backgroundColor, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex, puck }: any) => {
    // "Hide on desktop/tablet/mobile" must only affect the storefront and page
    // preview — inside the editor canvas the spacer should always be visible so
    // it remains selectable/editable. Puck's preview iframe doesn't carry the
    // outer canvas-override CSS, so gate the classes on edit mode here.
    const hideClasses = puck?.isEditing
      ? ""
      : [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const toCssLen = (val: any, unit: any, fallback: string): string => {
      if (val == null || val === "") return fallback;
      const s = String(val);
      if (/[a-z%]+$/i.test(s)) return s;
      return `${s}${unit || "px"}`;
    };
    const hD = toCssLen(heightDesktop, heightDesktopUnit, "32px");
    const hT = toCssLen(heightTablet,  heightTabletUnit,  hD);
    const hM = toCssLen(heightMobile,  heightMobileUnit,  hT);
    const uid = `sp-${id || "x"}`;
    // Use padding-top as primary height mechanism — matches the Shopify renderer.
    // Shopify themes reset height/min-height with !important so padding-top is more reliable.
    const responsiveCss = `
      .${uid} { padding-top: ${hD} !important; height: 0 !important; }
      @media (max-width: 1024px) { .${uid} { padding-top: ${hT} !important; } }
      @media (max-width: 640px)  { .${uid} { padding-top: ${hM} !important; } }
    `;
    return (
      <div
        id={cssId || undefined}
        className={[uid, hideClasses, cssClass].filter(Boolean).join(" ") || undefined}
        style={{ position: "relative", backgroundColor: backgroundColor || undefined, zIndex: zIndex ?? undefined, display: "block", height: 0, paddingTop: hD, minHeight: 0, width: "100%", boxSizing: "border-box", fontSize: 0, lineHeight: 0 }}
      >
        <EditorHideOverlay hideDesktop={hideDesktop} hideTablet={hideTablet} hideMobile={hideMobile} />
        <style>{responsiveCss}</style>
      </div>
    );
  },
};

export { SpaceComponent };
