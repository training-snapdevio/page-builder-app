// @ts-nocheck
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { usePuck } from "@my-app/puck-editor";
import {
  AlignField,
  ToggleField,
  StackedTextField,
  ColorPickerField,
  BlockTabBar,
  TabSection,
  InlineSelect,
  SliderNumberField,
  EditorHideOverlay,
  buildResponsiveSpacingCss,
} from "@/puck-blocks/shared";

export const MarqueeBarComponent = {
  label: "Info Bar",
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
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } , ui: appState.ui });
        };
        return (
          <BlockTabBar blockKey="MarqueeBar">
            {(tab) => (
              <>
                {tab === "content" && (
                  <>
                    <TabSection title="Text" />
                    <StackedTextField label="Announcement Text" value={props.text ?? ""} onChange={(v) => set("text", v)} placeholder="Free Shipping · Sale Now On ·" />
                    <SliderNumberField label="Repeat Count" value={props.repeat ?? 10} onChange={(v) => set("repeat", v)} min={1} max={30} step={1} unit="" />
                    <TabSection title="Scroll" />
                    <AlignField
                      label="Direction"
                      value={props.direction ?? "left"}
                      onChange={(v) => set("direction", v)}
                      options={[
                        { value: "left",  icon: <ArrowLeft  size={15} />, title: "Left"  },
                        { value: "right", icon: <ArrowRight size={15} />, title: "Right" },
                      ]}
                    />
                    <SliderNumberField label="Speed (s)" value={props.speed ?? 20} onChange={(v) => set("speed", v)} min={2} max={120} step={1} unit="S" />
                    <ToggleField label="Pause on Hover" value={props.pauseOnHover !== false} onChange={(v) => set("pauseOnHover", v)} />
                  </>
                )}
                {tab === "style" && (
                  <>
                    <TabSection title="Colors" />
                    <ColorPickerField label="Background Color" value={props.backgroundColor ?? "#000000"} onChange={(v) => set("backgroundColor", v)} />
                    <ColorPickerField label="Text Color" value={props.textColor ?? "#ffffff"} onChange={(v) => set("textColor", v)} />
                    <TabSection title="Typography" />
                    <SliderNumberField label="Font Size (px)" value={props.fontSize ?? 14} onChange={(v) => set("fontSize", v)} min={10} max={36} step={1} unit="PX" />
                    <InlineSelect
                      label="Font Weight"
                      value={String(props.fontWeight ?? "500")}
                      onChange={(v) => set("fontWeight", v)}
                      options={[
                        { value: "400", label: "Normal" },
                        { value: "500", label: "Medium" },
                        { value: "600", label: "Semi Bold" },
                        { value: "700", label: "Bold" },
                      ]}
                    />
                    <InlineSelect
                      label="Text Transform"
                      value={props.textTransform ?? "uppercase"}
                      onChange={(v) => set("textTransform", v)}
                      options={[
                        { value: "capitalize", label: "Capitalize" },
                        { value: "uppercase",  label: "Uppercase"  },
                        { value: "lowercase",  label: "Lowercase"  },
                      ]}
                    />
                    <TabSection title="Spacing" />
                    <SliderNumberField label="Padding (px)" value={props.padding ?? 10} onChange={(v) => set("padding", v)} min={0} max={60} step={2} unit="PX" />
                    <SliderNumberField label="Item Gap (px)" value={props.itemGap ?? 40} onChange={(v) => set("itemGap", v)} min={8} max={200} step={4} unit="PX" />
                  </>
                )}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Responsive" />
                    <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                    <ToggleField label="Hide on Tablet"  value={!!props.hideTablet}  onChange={(v) => set("hideTablet", v)} />
                    <ToggleField label="Hide on Mobile"  value={!!props.hideMobile}  onChange={(v) => set("hideMobile", v)} />
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
    text: "🔥 Free Shipping on All Orders | 30 Days Return | COD Available 🔥",
    speed: 20,
    direction: "left",
    pauseOnHover: true,
    backgroundColor: "#000000",
    textColor: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
    textTransform: "uppercase",
    padding: 10,
    itemGap: 40,
    repeat: 10,
    hideDesktop: false, responsiveSpacing: {},
    hideTablet: false,
    hideMobile: false,
  },

  render: ({ text, speed, direction, pauseOnHover, backgroundColor, textColor, fontSize, fontWeight, textTransform, padding, itemGap, repeat, hideDesktop, hideTablet, hideMobile, id, responsiveSpacing }: any) => {
    const [hovered, setHovered] = useState(false);
    const animationName = direction === "right" ? "mqRight" : "mqLeft";
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const repeatedText = Array.from({ length: repeat ?? 10 }).map((_, i) => (
      <span key={i} style={{ marginRight: itemGap ?? 40 }}>{text}</span>
    ));
    return (
      <div
        className={hideClasses || undefined}
        data-pb-rs={id}
        onMouseEnter={() => pauseOnHover && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ position: "relative", width: "100%", overflow: "hidden", whiteSpace: "nowrap", backgroundColor, color: textColor, fontSize, fontWeight, textTransform: textTransform as any, padding: `${padding ?? 10}px 0`, boxSizing: "border-box" }}
      >
        <EditorHideOverlay hideDesktop={hideDesktop} hideTablet={hideTablet} hideMobile={hideMobile} />
        {(() => { const rsCss = buildResponsiveSpacingCss(`[data-pb-rs="${id}"]`, responsiveSpacing); return rsCss ? <style>{rsCss}</style> : null; })()}
        <div style={{ display: "inline-block", animation: `${animationName} ${speed}s linear infinite`, animationPlayState: pauseOnHover && hovered ? "paused" : "running" }}>
          {repeatedText}
        </div>
        <style>{`
          @keyframes mqLeft  { 0% { transform:translateX(0) }  100% { transform:translateX(-50%) } }
          @keyframes mqRight { 0% { transform:translateX(-50%) } 100% { transform:translateX(0) } }
        `}</style>
      </div>
    );
  },
};
