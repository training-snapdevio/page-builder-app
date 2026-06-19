// @ts-nocheck
// ─── StarRatingComponent ───

import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { usePuck } from "@my-app/puck-editor";
import {
  AlignField,
  ToggleField,
  StackedTextField,
  ColorPickerField,
  BlockTabBar,
  TabSection,
  FourSideField,
  InlineSelect,
  SliderNumberField,
  StackedTextareaField,
  EditorHideOverlay,
} from "@/puck-blocks/shared";

const StarRatingComponent = {
  label: "Star Rating",
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
        const bgType = props.advBgType ?? "none";
        return (
          <BlockTabBar blockKey="StarRating">
            {(tab) => (
              <>
                {tab === "content" && (
                  <>
                    <SliderNumberField label="Rating Value" value={props.ratingValue ?? 4} onChange={(v) => set("ratingValue", Math.round(v * 10) / 10)} min={0} max={5} step={0.5} unit="" />
                    <ToggleField label="Show Number" value={props.showNumber !== false} onChange={(v) => set("showNumber", v)} />
                    <InlineSelect label="Number Position" value={props.numberPosition ?? "after"} onChange={(v) => set("numberPosition", v)} options={[{ value: "before", label: "Before Stars" }, { value: "after", label: "After Stars" }]} />
                    <StackedTextField label="Review Count" value={String(props.reviewCount ?? "")} onChange={(v) => set("reviewCount", v)} placeholder="e.g. 128" />
                  </>
                )}
                {tab === "style" && (
                  <>
                    <TabSection title="Stars" />
                    <SliderNumberField label="Star Size (px)" value={typeof props.starSize === "number" ? props.starSize : parseInt(props.starSize ?? "24") || 24} onChange={(v) => set("starSize", `${v}px`)} min={8} max={96} step={1} unit="px" />
                    <ColorPickerField label="Filled Color" value={props.filledColor ?? "#f59e0b"} onChange={(v) => set("filledColor", v)} />
                    <ColorPickerField label="Empty Color" value={props.emptyColor ?? "#d1d5db"} onChange={(v) => set("emptyColor", v)} />
                    <SliderNumberField label="Gap Between Stars (px)" value={typeof props.starGap === "number" ? props.starGap : parseInt(props.starGap ?? "4") || 4} onChange={(v) => set("starGap", `${v}px`)} min={0} max={32} step={1} unit="px" />
                    <TabSection title="Number" />
                    <SliderNumberField label="Font Size (px)" value={typeof props.numFontSize === "number" ? props.numFontSize : parseInt(props.numFontSize ?? "16") || 16} onChange={(v) => set("numFontSize", `${v}px`)} min={8} max={72} step={1} unit="px" />
                    <InlineSelect label="Font Weight" value={props.numFontWeight ?? "700"} onChange={(v) => set("numFontWeight", v)} options={[{ value: "400", label: "Normal" }, { value: "700", label: "Bold" }]} />
                    <ColorPickerField label="Color" value={props.numColor ?? ""} onChange={(v) => set("numColor", v)} />
                    <TabSection title="Alignment" />
                    <AlignField label="Alignment" value={props.alignment ?? "left"} onChange={(v) => set("alignment", v)} options={[{ value: "left", icon: <AlignLeft size={15} />, title: "Left" }, { value: "center", icon: <AlignCenter size={15} />, title: "Center" }, { value: "right", icon: <AlignRight size={15} />, title: "Right" }]} />
                  </>
                )}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 8, right: 0, bottom: 8, left: 0 }} onChange={(v) => set("advPadding", v)} />
                    <TabSection title="Background" />
                    <InlineSelect label="Type" value={bgType} onChange={(v) => set("advBgType", v)} options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }]} />
                    {bgType === "color" && <ColorPickerField label="Color" value={props.advBgColor ?? ""} onChange={(v) => set("advBgColor", v)} />}
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
    ratingValue: 4, showNumber: true, numberPosition: "after", reviewCount: "",
    starSize: "24px", filledColor: "#f59e0b", emptyColor: "#d1d5db", starGap: "4px",
    numFontSize: "16px", numFontWeight: "700", numColor: "",
    alignment: "left",
    advBgType: "none", advBgColor: "", advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 8, right: 0, bottom: 8, left: 0 },
    hideDesktop: false, hideTablet: false, hideMobile: false, cssId: "", cssClass: "", zIndex: null,
  },
  render: ({ ratingValue, showNumber, numberPosition, reviewCount, starSize, filledColor, emptyColor, starGap, numFontSize, numFontWeight, numColor, alignment, advBgType, advBgColor, advMargin, advPadding, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex }) => {
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const max = 5;
    const val = Math.min(ratingValue ?? 4, max);
    const stars = Array.from({ length: max }, (_, i) => {
      const filled = i < Math.floor(val);
      const partial = !filled && i < val;
      const pct = partial ? Math.round((val - Math.floor(val)) * 100) : 0;
      const id = `star-grad-${cssId || "r"}-${i}`;
      return (
        <svg key={i} width={starSize || "24px"} height={starSize || "24px"} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          {partial && (
            <defs>
              <linearGradient id={id}>
                <stop offset={`${pct}%`} stopColor={filledColor || "#f59e0b"} />
                <stop offset={`${pct}%`} stopColor={emptyColor || "#d1d5db"} />
              </linearGradient>
            </defs>
          )}
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={filled ? (filledColor || "#f59e0b") : partial ? `url(#${id})` : (emptyColor || "#d1d5db")} />
        </svg>
      );
    });
    const reviewCountStr = String(reviewCount ?? "").trim();
    const numEl = showNumber && (
      <span style={{ fontSize: numFontSize || "16px", fontWeight: numFontWeight || "700", color: numColor || "var(--text-color)", whiteSpace: "nowrap" }}>
        {val.toFixed(1)}{reviewCountStr ? ` (${reviewCountStr} reviews)` : ""}
      </span>
    );
    return (
      <div id={cssId || undefined} className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined} style={{ position: "relative", textAlign: alignment as any, paddingTop: advPadding?.top ?? 8, paddingRight: advPadding?.right ?? 0, paddingBottom: advPadding?.bottom ?? 8, paddingLeft: advPadding?.left ?? 0, marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0, marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0, zIndex: zIndex ?? undefined, ...(advBgType === "color" && advBgColor ? { backgroundColor: advBgColor } : {}) }}>
        <EditorHideOverlay hideDesktop={hideDesktop} hideTablet={hideTablet} hideMobile={hideMobile} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: starGap || "4px", flexWrap: "wrap", justifyContent: alignment === "center" ? "center" : alignment === "right" ? "flex-end" : "flex-start" }}>
          {numberPosition === "before" && numEl}
          {stars}
          {numberPosition !== "before" && numEl}
        </div>
      </div>
    );
  },
};

export { StarRatingComponent };
