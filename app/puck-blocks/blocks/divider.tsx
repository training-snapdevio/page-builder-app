// @ts-nocheck
// ─── DividerComponent ───

import type * as React from "react";
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
  SliderUnitField,
  EditorHideOverlay,
} from "@/puck-blocks/shared";
import {
  ImageField,
} from "@/puck-blocks/block-fields";

const DividerComponent = {
  label: "Divider",
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

        const hasElement = !!props.showElement;

        return (
          <BlockTabBar blockKey="Divider">
            {(tab) => (
              <>
                {/* ── CONTENT TAB ── */}
                {tab === "content" && (
                  <>
                    <InlineSelect
                      label="Style"
                      value={props.lineStyle ?? "solid"}
                      onChange={(v) => set("lineStyle", v)}
                      options={[
                        { value: "solid", label: "Solid" },
                        { value: "dashed", label: "Dashed" },
                        { value: "dotted", label: "Dotted" },
                        { value: "double", label: "Double" },
                        { value: "gradient", label: "Gradient" },
                        { value: "wave", label: "Wave" },
                        { value: "zigzag", label: "Zigzag" },
                        { value: "shadow", label: "Shadow" },
                      ]}
                    />
                    <ToggleField label="Add Icon / Text" value={hasElement} onChange={(v) => set("showElement", v)} />
                    {hasElement && (
                      <>
                        <InlineSelect
                          label="Element Type"
                          value={props.elementType ?? "icon"}
                          onChange={(v) => set("elementType", v)}
                          options={[
                            { value: "icon", label: "Icon / Emoji" },
                            { value: "text", label: "Text" },
                            { value: "image", label: "Image" },
                          ]}
                        />
                        {props.elementType === "text"
                          ? <StackedTextField label="Text" value={props.elementText ?? ""} onChange={(v) => set("elementText", v)} placeholder="OR" />
                          : props.elementType === "image"
                            ? <ImageField label="Image" value={props.elementImage ?? ""} onChange={(v) => set("elementImage", v)} />
                            : <StackedTextField label="Icon (emoji or char)" value={props.elementIcon ?? "✦"} onChange={(v) => set("elementIcon", v)} placeholder="e.g. ✦ ★ •" />
                        }
                        <InlineSelect
                          label="Element Position"
                          value={props.elementPosition ?? "center"}
                          onChange={(v) => set("elementPosition", v)}
                          options={[
                            { value: "left", label: "Left" },
                            { value: "center", label: "Center" },
                            { value: "right", label: "Right" },
                          ]}
                        />
                        <SliderNumberField
                          label="Width"
                          value={props.lineWidthVal ?? 100}
                          onChange={(v) => set("lineWidthVal", v)}
                          min={0}
                          max={2000}
                          step={1}
                          unit="px"
                        />
                        <AlignField
                          label="Alignment"
                          value={props.alignment ?? "center"}
                          onChange={(v) => set("alignment", v)}
                          options={[
                            { value: "left", icon: <AlignLeft size={15} />, title: "Left" },
                            { value: "center", icon: <AlignCenter size={15} />, title: "Center" },
                            { value: "right", icon: <AlignRight size={15} />, title: "Right" },
                          ]}
                        />
                      </>
                    )}
                  </>
                )}

                {/* ── STYLE TAB ── */}
                {tab === "style" && (
                  <>
                    <TabSection title="Line" />
                    <SliderNumberField label="Thickness (px)" value={props.thickness ?? 1} onChange={(v) => set("thickness", v)} min={1} max={20} step={1} unit="px" />
                    <SliderNumberField label="Border Radius (px)" value={props.borderRadius ?? 0} onChange={(v) => set("borderRadius", v)} min={0} max={50} step={1} unit="px" />
                    {(props.lineStyle ?? "solid") !== "gradient" && (
                      <ColorPickerField label="Color" value={props.lineColor ?? ""} onChange={(v) => set("lineColor", v)} />
                    )}
                    {(props.lineStyle ?? "solid") === "gradient" && (
                      <>
                        <ColorPickerField label="Start Color" value={props.gradientStart ?? "#e5e7eb"} onChange={(v) => set("gradientStart", v)} />
                        <ColorPickerField label="End Color" value={props.gradientEnd ?? "#e5e7eb"} onChange={(v) => set("gradientEnd", v)} />
                      </>
                    )}
                    <SliderNumberField label="Gap (px)" value={props.gap ?? 16} onChange={(v) => set("gap", v)} min={0} max={120} step={1} unit="px" />

                    {hasElement && (
                      <>
                        <TabSection title="Icon / Text Style" />
                        {(props.elementType ?? "icon") !== "image" && (
                          <>
                            <SliderNumberField label="Icon Size (px)" value={props.iconSize ?? 20} onChange={(v) => set("iconSize", v)} min={10} max={80} step={1} unit="px" />
                            <ColorPickerField label="Icon Color" value={props.iconColor ?? ""} onChange={(v) => set("iconColor", v)} />
                            <ColorPickerField label="Text Color" value={props.elementTextColor ?? ""} onChange={(v) => set("elementTextColor", v)} />
                            <SliderNumberField label="Text Font Size (px)" value={props.elementFontSize ?? 14} onChange={(v) => set("elementFontSize", v)} min={10} max={48} step={1} unit="px" />
                          </>
                        )}
                        {(props.elementType ?? "icon") === "image" && (
                          <>
                            <SliderNumberField label="Image Width (px)" value={props.elementImageWidth ?? 40} onChange={(v) => set("elementImageWidth", v)} min={8} max={300} step={1} unit="px" />
                            <SliderNumberField label="Image Height (px)" value={props.elementImageHeight ?? 40} onChange={(v) => set("elementImageHeight", v)} min={8} max={300} step={1} unit="px" />
                          </>
                        )}
                        <SliderNumberField label="Spacing from Line (px)" value={props.elementSpacing ?? 12} onChange={(v) => set("elementSpacing", v)} min={0} max={60} step={1} unit="px" />
                      </>
                    )}
                  </>
                )}

                {/* ── ADVANCED TAB ── */}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />

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
    lineStyle: "solid",
    lineWidthVal: 100,
    lineWidthUnit: "px",
    alignment: "center",
    showElement: false,
    elementType: "icon",
    elementText: "OR",
    elementIcon: "✦",
    elementImage: "",
    elementImageWidth: 40,
    elementImageHeight: 40,
    elementPosition: "center",
    thickness: 1,
    borderRadius: 0,
    lineColor: "",
    gradientStart: "#e5e7eb",
    gradientEnd: "#e5e7eb",
    gap: 16,
    iconSize: 20,
    iconColor: "",
    elementTextColor: "",
    elementFontSize: 14,
    elementSpacing: 12,
    advMargin: { top: 0, right: 0, bottom: 0, left: 0 },
    hideDesktop: false,
    hideTablet: false,
    hideMobile: false,
    cssId: "",
    cssClass: "",
    zIndex: null,
  },

  render: ({
    lineStyle,
    lineWidthVal,
    lineWidthUnit,
    alignment,
    showElement,
    elementType,
    elementText,
    elementIcon,
    elementImage,
    elementImageWidth,
    elementImageHeight,
    elementPosition,
    thickness,
    borderRadius: dividerBorderRadius,
    lineColor,
    gradientStart,
    gradientEnd,
    gap,
    iconSize,
    iconColor,
    elementTextColor,
    elementFontSize,
    elementSpacing,
    advMargin,
    hideDesktop,
    hideTablet,
    hideMobile,
    cssId,
    cssClass,
    zIndex,
  }: any) => {
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const color = lineColor || "#e5e7eb";
    const th = Number(thickness) || 1;
    const br = Number(dividerBorderRadius ?? 0);
    const brPx = br > 0 ? `${br}px` : undefined;

    // inFlex=true when this line segment sits inside a flex row (beside an icon/text element)
    const lineEl = (inFlex: boolean, widthOverride?: string) => {
      const baseStyle: React.CSSProperties = inFlex
        ? { flex: 1, minWidth: 0, alignSelf: "center" }
        : { display: "block", width: widthOverride ?? "100%", alignSelf: "center" };

      if (lineStyle === "gradient") {
        const c1 = gradientStart || "#e5e7eb";
        const c2 = gradientEnd || "#e5e7eb";
        return <div style={{ ...baseStyle, height: th, minHeight: th, background: `linear-gradient(90deg, ${c1}, ${c2})`, borderRadius: brPx }} />;
      }
      if (lineStyle === "shadow") {
        const h = Math.max(th * 4, 4);
        return <div style={{ ...baseStyle, height: h, minHeight: h, background: `radial-gradient(ellipse at 50% 0%, ${color} 0%, transparent 70%)`, borderRadius: brPx }} />;
      }
      if (lineStyle === "wave") {
        const h = Math.max(th * 6, 12);
        const mid = h / 2;
        const amp = mid * 0.8;
        return (
          <div style={{ ...baseStyle, height: h, minHeight: h, overflow: "visible" }}>
            <svg width="100%" height={h} viewBox={`0 0 600 ${h}`} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", overflow: "visible" }}>
              <path d={`M0,${mid} C15,${mid - amp} 15,${mid + amp} 30,${mid} S45,${mid - amp} 60,${mid} S75,${mid + amp} 90,${mid} S105,${mid - amp} 120,${mid} S135,${mid + amp} 150,${mid} S165,${mid - amp} 180,${mid} S195,${mid + amp} 210,${mid} S225,${mid - amp} 240,${mid} S255,${mid + amp} 270,${mid} S285,${mid - amp} 300,${mid} S315,${mid + amp} 330,${mid} S345,${mid - amp} 360,${mid} S375,${mid + amp} 390,${mid} S405,${mid - amp} 420,${mid} S435,${mid + amp} 450,${mid} S465,${mid - amp} 480,${mid} S495,${mid + amp} 510,${mid} S525,${mid - amp} 540,${mid} S555,${mid + amp} 570,${mid} S585,${mid - amp} 600,${mid}`} fill="none" stroke={color} strokeWidth={th} vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        );
      }
      if (lineStyle === "zigzag") {
        const h = Math.max(th * 6, 12);
        const pts = Array.from({ length: 61 }, (_, i) => `${i * 10},${i % 2 === 0 ? h : 0}`).join(" ");
        return (
          <div style={{ ...baseStyle, height: h, minHeight: h, overflow: "visible" }}>
            <svg width="100%" height={h} viewBox={`0 0 600 ${h}`} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", overflow: "visible" }}>
              <polyline points={pts} fill="none" stroke={color} strokeWidth={th} vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        );
      }
      if (lineStyle === "double") {
        const gap2 = Math.max(th, 2);
        return (
          <div style={{ ...baseStyle, display: "flex", flexDirection: "column", gap: gap2, borderRadius: brPx }}>
            <div style={{ height: th, minHeight: th, background: color, borderRadius: brPx }} />
            <div style={{ height: th, minHeight: th, background: color, borderRadius: brPx }} />
          </div>
        );
      }
      // solid / dashed / dotted — render as a real height div so it's always visible
      const bStyle = lineStyle === "dashed" ? "dashed" : lineStyle === "dotted" ? "dotted" : "solid";
      return (
        <div style={{
          ...baseStyle, height: th, minHeight: th, borderRadius: brPx, overflow: "hidden",
          background: bStyle === "solid" ? color : "transparent",
          borderTop: bStyle !== "solid" ? `${th}px ${bStyle} ${color}` : undefined,
          boxSizing: "content-box" as const,
        }} />
      );
    };

    const iconVal = (elementIcon as string) || "";
    const hasIconContent = elementType === "text" ? true : elementType === "image" ? !!(elementImage as string) : !!iconVal.trim();
    const elementContent = showElement && hasIconContent
      ? (
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0, padding: `0 ${elementSpacing ?? 12}px` }}>
          {elementType === "text"
            ? <span style={{ fontSize: elementFontSize || 14, color: elementTextColor || color, whiteSpace: "nowrap" }}>{elementText || "OR"}</span>
            : elementType === "image"
              ? <img src={elementImage as string} alt="" style={{ width: elementImageWidth || 40, height: elementImageHeight || 40, objectFit: "contain", display: "block" }} />
              : <span style={{ fontSize: iconSize || 20, color: iconColor || color, lineHeight: 1 }}>{iconVal}</span>
          }
        </div>
      )
      : null;

    const lineWidthCss = `${lineWidthVal ?? 100}px`;
    const outerJustify = showElement
      ? (alignment === "right" ? "flex-end" : alignment === "left" ? "flex-start" : "center")
      : "center";

    const lineWrap = showElement && elementContent
      ? (
        <div style={{ display: "flex", alignItems: "center", width: lineWidthCss }}>
          {elementPosition === "center" || elementPosition === "right" ? lineEl(true) : null}
          {elementContent}
          {elementPosition === "center" || elementPosition === "left" ? lineEl(true) : null}
        </div>
      )
      : lineEl(false, lineWidthCss);

    return (
      <div
        id={cssId || undefined}
        className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined}
        style={{
          position: "relative",
          paddingTop: gap ?? 16,
          paddingBottom: gap ?? 16,
          marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0,
          marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0,
          display: "flex",
          justifyContent: outerJustify,
          zIndex: zIndex ?? undefined,
        }}
      >
        <EditorHideOverlay hideDesktop={hideDesktop} hideTablet={hideTablet} hideMobile={hideMobile} />
        {lineWrap}
      </div>
    );
  },
};

export { DividerComponent };
