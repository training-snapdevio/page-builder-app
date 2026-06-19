// @ts-nocheck
// ─── LayoutBlockComponent ───

import type * as React from "react";
import { DropZone, usePuck } from "@my-app/puck-editor";
import {
  ToggleField,
  ColorPickerField,
  BlockTabBar,
  TabSection,
  FourSideField,
  InlineSelect,
  SliderNumberField,
  IconButtonGroup,
  DIR_ICONS,
  JUSTIFY_ICONS,
  ALIGN_ICONS,
  WRAP_ICONS,
  EditorHideOverlay,
} from "@/puck-blocks/shared";
import {
  ImageField,
  VideoUploadField,
} from "@/puck-blocks/block-fields";

const LayoutBlockComponent = {
  label: "Container",
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

        const direction = props.direction ?? "row";
        const isRow = direction === "row" || direction === "row-reverse";

        return (
          <BlockTabBar blockKey="LayoutBlock">
            {(tab) => (
              <>
                {/* ── LAYOUT TAB ── */}
                {tab === "content" && (
                  <>
                    <TabSection title="Container" />
                    <InlineSelect
                      label="Content Width"
                      value={props.contentWidth ?? "boxed"}
                      onChange={(v) => set("contentWidth", v)}
                      options={[{ value: "boxed", label: "Boxed" }, { value: "full", label: "Full Width" }]}
                    />
                    {props.contentWidth === "boxed" && (
                      <SliderNumberField label="Width" value={props.containerWidth ?? 1140} onChange={(v) => set("containerWidth", v)} min={200} max={1600} step={10} unit="PX" />
                    )}
                    <SliderNumberField label="Min Height" value={props.minHeightPx ?? 0} onChange={(v) => set("minHeightPx", v)} min={0} max={1200} step={10} unit="PX" />
                    <div style={{ fontSize: 11, color: "var(--p-color-text-secondary)", marginTop: -6 }}>To achieve full height Container use 100vh.</div>

                    <TabSection title="Items" />
                    <IconButtonGroup
                      label="Direction"
                      value={direction}
                      onChange={(v) => set("direction", v)}
                      options={[
                        { value: "row", title: "Row (→)", icon: DIR_ICONS.row },
                        { value: "column", title: "Column (↓)", icon: DIR_ICONS.column },
                        { value: "row-reverse", title: "Row Reverse (←)", icon: DIR_ICONS["row-reverse"] },
                        { value: "column-reverse", title: "Column Reverse (↑)", icon: DIR_ICONS["column-reverse"] },
                      ]}
                    />
                    <IconButtonGroup
                      label="Justify Content"
                      value={props.justifyContent ?? "flex-start"}
                      onChange={(v) => set("justifyContent", v)}
                      options={[
                        { value: "flex-start", title: "Start", icon: JUSTIFY_ICONS["flex-start"] },
                        { value: "center", title: "Center", icon: JUSTIFY_ICONS.center },
                        { value: "flex-end", title: "End", icon: JUSTIFY_ICONS["flex-end"] },
                        { value: "space-between", title: "Space Between", icon: JUSTIFY_ICONS["space-between"] },
                        { value: "space-around", title: "Space Around", icon: JUSTIFY_ICONS["space-around"] },
                        { value: "space-evenly", title: "Space Evenly", icon: JUSTIFY_ICONS["space-evenly"] },
                      ]}
                    />
                    <IconButtonGroup
                      label="Align Items"
                      value={props.alignItems ?? "stretch"}
                      onChange={(v) => set("alignItems", v)}
                      options={[
                        { value: "flex-start", title: "Top / Start", icon: ALIGN_ICONS["flex-start"] },
                        { value: "center", title: "Center", icon: ALIGN_ICONS.center },
                        { value: "flex-end", title: "Bottom / End", icon: ALIGN_ICONS["flex-end"] },
                        { value: "stretch", title: "Stretch", icon: ALIGN_ICONS.stretch },
                      ]}
                    />
                    <SliderNumberField label="Gap between elements" value={props.gap ?? 0} onChange={(v) => set("gap", v)} min={0} max={200} step={1} unit="PX" />
                    <IconButtonGroup
                      label="Wrap"
                      value={props.wrap ?? "nowrap"}
                      onChange={(v) => set("wrap", v)}
                      options={[
                        { value: "nowrap", title: "No Wrap", icon: WRAP_ICONS.nowrap },
                        { value: "wrap", title: "Wrap", icon: WRAP_ICONS.wrap },
                      ]}
                    />
                    {props.wrap === "wrap" && (
                      <div style={{ fontSize: 11, color: "var(--p-color-text-secondary)", marginTop: -6 }}>
                        Items within the container can stay in a single line (No wrap), or break into multiple lines (Wrap).
                      </div>
                    )}
                  </>
                )}

                {/* ── STYLE TAB ── */}
                {tab === "style" && (
                  <>
                    <TabSection title="Background" />
                    <InlineSelect label="Type" value={props.bgType ?? "none"} onChange={(v) => set("bgType", v)} options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }, { value: "gradient", label: "Gradient" }, { value: "image", label: "Image" }, { value: "video", label: "Video" }]} />
                    {props.bgType === "color" && <ColorPickerField label="Color" value={props.bgColor ?? ""} onChange={(v) => set("bgColor", v)} />}
                    {props.bgType === "gradient" && (
                      <>
                        <ColorPickerField label="Start Color" value={props.bgGrad1 ?? ""} onChange={(v) => set("bgGrad1", v)} />
                        <ColorPickerField label="End Color" value={props.bgGrad2 ?? ""} onChange={(v) => set("bgGrad2", v)} />
                        <InlineSelect label="Direction" value={props.bgGradDir ?? "to bottom"} onChange={(v) => set("bgGradDir", v)} options={[{ value: "to bottom", label: "Top → Bottom" }, { value: "to right", label: "Left → Right" }, { value: "to bottom right", label: "Diagonal" }, { value: "to top", label: "Bottom → Top" }]} />
                        <SliderNumberField label="Angle" value={props.bgGradAngle ?? 180} onChange={(v) => set("bgGradAngle", v)} min={0} max={360} step={1} unit="°" />
                      </>
                    )}
                    {props.bgType === "image" && (
                      <>
                        <ImageField label="Image" value={props.bgImage ?? ""} onChange={(v) => set("bgImage", v)} />
                        <InlineSelect label="Size" value={props.bgSize ?? "cover"} onChange={(v) => set("bgSize", v)} options={[{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "auto", label: "Auto" }]} />
                        <InlineSelect label="Position" value={props.bgPos ?? "center center"} onChange={(v) => set("bgPos", v)} options={[{ value: "center center", label: "Center" }, { value: "top center", label: "Top" }, { value: "bottom center", label: "Bottom" }, { value: "center left", label: "Left" }, { value: "center right", label: "Right" }]} />
                        <InlineSelect label="Repeat" value={props.bgRepeat ?? "no-repeat"} onChange={(v) => set("bgRepeat", v)} options={[{ value: "no-repeat", label: "No Repeat" }, { value: "repeat", label: "Repeat" }, { value: "repeat-x", label: "Repeat X" }, { value: "repeat-y", label: "Repeat Y" }]} />
                        <ToggleField label="Fixed (Parallax)" value={!!props.bgFixed} onChange={(v) => set("bgFixed", v)} />
                        <TabSection title="Overlay" />
                        <InlineSelect label="Overlay Type" value={props.overlayType ?? "none"} onChange={(v) => set("overlayType", v)} options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }, { value: "gradient", label: "Gradient" }]} />
                        {props.overlayType === "color" && (
                          <>
                            <ColorPickerField label="Color" value={props.overlayColor ?? "#000000"} onChange={(v) => set("overlayColor", v)} />
                            <SliderNumberField label="Opacity" value={props.overlayOpacity ?? 50} onChange={(v) => set("overlayOpacity", v)} min={0} max={100} step={1} unit="%" />
                          </>
                        )}
                        {props.overlayType === "gradient" && (
                          <>
                            <ColorPickerField label="Start Color" value={props.overlayGrad1 ?? "rgba(0,0,0,0.8)"} onChange={(v) => set("overlayGrad1", v)} />
                            <ColorPickerField label="End Color" value={props.overlayGrad2 ?? "rgba(0,0,0,0)"} onChange={(v) => set("overlayGrad2", v)} />
                          </>
                        )}
                      </>
                    )}
                    {props.bgType === "video" && (
                      <>
                        <VideoUploadField value={props.bgVideo ?? ""} onChange={(v) => set("bgVideo", v)} />
                        <ToggleField label="Loop" value={props.bgVideoLoop !== false} onChange={(v) => set("bgVideoLoop", v)} />
                        <ToggleField label="Mute" value={props.bgVideoMute !== false} onChange={(v) => set("bgVideoMute", v)} />
                        <ColorPickerField label="Fallback Color" value={props.bgColor ?? "#000"} onChange={(v) => set("bgColor", v)} />
                      </>
                    )}

                    <TabSection title="Border" />
                    <InlineSelect label="Border Type" value={props.borderStyle ?? "none"} onChange={(v) => set("borderStyle", v)} options={[{ value: "none", label: "None" }, { value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }, { value: "dotted", label: "Dotted" }, { value: "double", label: "Double" }]} />
                    {props.borderStyle !== "none" && (
                      <>
                        <FourSideField label="Border Width (px)" value={props.borderWidth4 ?? { top: 1, right: 1, bottom: 1, left: 1 }} onChange={(v) => set("borderWidth4", v)} />
                        <ColorPickerField label="Border Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
                      </>
                    )}
                    <FourSideField label="Border Radius (px)" value={props.borderRadius4 ?? { top: 0, right: 0, bottom: 0, left: 0 }} onChange={(v) => set("borderRadius4", v)} />


                    <TabSection title="Shape Divider" />
                    <InlineSelect label="Top Divider" value={props.dividerTop ?? "none"} onChange={(v) => set("dividerTop", v)} options={[{ value: "none", label: "None" }, { value: "triangle", label: "Triangle" }, { value: "curve", label: "Curve" }, { value: "wave", label: "Wave" }]} />
                    {props.dividerTop !== "none" && (
                      <>
                        <ColorPickerField label="Top Color" value={props.dividerTopColor ?? "#fff"} onChange={(v) => set("dividerTopColor", v)} />
                        <SliderNumberField label="Top Height" value={props.dividerTopHeight ?? 50} onChange={(v) => set("dividerTopHeight", v)} min={10} max={300} step={5} unit="PX" />
                        <ToggleField label="Flip Horizontal" value={!!props.dividerTopFlip} onChange={(v) => set("dividerTopFlip", v)} />
                      </>
                    )}
                    <InlineSelect label="Bottom Divider" value={props.dividerBottom ?? "none"} onChange={(v) => set("dividerBottom", v)} options={[{ value: "none", label: "None" }, { value: "triangle", label: "Triangle" }, { value: "curve", label: "Curve" }, { value: "wave", label: "Wave" }]} />
                    {props.dividerBottom !== "none" && (
                      <>
                        <ColorPickerField label="Bottom Color" value={props.dividerBottomColor ?? "#fff"} onChange={(v) => set("dividerBottomColor", v)} />
                        <SliderNumberField label="Bottom Height" value={props.dividerBottomHeight ?? 50} onChange={(v) => set("dividerBottomHeight", v)} min={10} max={300} step={5} unit="PX" />
                        <ToggleField label="Flip Horizontal" value={!!props.dividerBottomFlip} onChange={(v) => set("dividerBottomFlip", v)} />
                      </>
                    )}
                  </>
                )}

                {/* ── ADVANCED TAB ── */}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 24, right: 24, bottom: 24, left: 24 }} onChange={(v) => set("advPadding", v)} />
                    <TabSection title="Responsive" />
                    <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                    <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
                    <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />
                    <TabSection title="Motion Effects" />
                    <InlineSelect label="Entrance Animation" value={props.animation ?? "none"} onChange={(v) => set("animation", v)} options={[{ value: "none", label: "None" }, { value: "fadeIn", label: "Fade In" }, { value: "fadeInUp", label: "Fade In Up" }, { value: "fadeInDown", label: "Fade In Down" }, { value: "slideInLeft", label: "Slide In Left" }, { value: "slideInRight", label: "Slide In Right" }, { value: "zoomIn", label: "Zoom In" }]} />
                    {props.animation && props.animation !== "none" && (
                      <>
                        <SliderNumberField label="Duration (ms)" value={props.animDuration ?? 600} onChange={(v) => set("animDuration", v)} min={100} max={3000} step={100} unit="ms" />
                        <SliderNumberField label="Delay (ms)" value={props.animDelay ?? 0} onChange={(v) => set("animDelay", v)} min={0} max={3000} step={100} unit="ms" />
                      </>
                    )}
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
    contentWidth: "boxed", containerWidth: 1140, minHeightPx: 0,
    direction: "row", justifyContent: "flex-start", alignItems: "stretch", gap: 0, wrap: "nowrap",
    bgType: "none", bgColor: "", bgGrad1: "", bgGrad2: "", bgGradDir: "to bottom", bgGradAngle: 180,
    bgImage: "", bgSize: "cover", bgPos: "center center", bgRepeat: "no-repeat", bgFixed: false,
    overlayType: "none", overlayColor: "#000000", overlayOpacity: 50, overlayGrad1: "rgba(0,0,0,0.8)", overlayGrad2: "rgba(0,0,0,0)",
    bgVideo: "", bgVideoLoop: true, bgVideoMute: true,
    borderStyle: "none", borderWidth4: { top: 1, right: 1, bottom: 1, left: 1 }, borderColor: "",
    borderRadius4: { top: 0, right: 0, bottom: 0, left: 0 },
    dividerTop: "none", dividerTopColor: "#fff", dividerTopHeight: 50, dividerTopFlip: false,
    dividerBottom: "none", dividerBottomColor: "#fff", dividerBottomHeight: 50, dividerBottomFlip: false,
    advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 24, right: 24, bottom: 24, left: 24 },
    hideDesktop: false, hideTablet: false, hideMobile: false,
    animation: "none", animDuration: 600, animDelay: 0,
    cssId: "", cssClass: "", customCss: "", zIndex: null,
  },
  render: ({
    id: puckId,
    contentWidth, containerWidth, minHeightPx,
    direction, justifyContent, alignItems, gap, wrap,
    bgType, bgColor, bgGrad1, bgGrad2, bgGradDir, bgGradAngle,
    bgImage, bgSize, bgPos, bgRepeat, bgFixed,
    overlayType, overlayColor, overlayOpacity, overlayGrad1, overlayGrad2,
    bgVideo, bgVideoLoop, bgVideoMute,
    borderStyle, borderWidth4, borderColor, borderRadius4,
    dividerTop, dividerTopColor, dividerTopHeight, dividerTopFlip,
    dividerBottom, dividerBottomColor, dividerBottomHeight, dividerBottomFlip,
    advMargin, advPadding, hideDesktop, hideTablet, hideMobile,
    animation, animDuration, animDelay,
    cssId, cssClass, customCss, zIndex,
  }: any) => {
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    // Use Puck's stable auto-assigned id — never Math.random() which re-runs every render
    const uid = cssId || `pb-container-${puckId || "c"}`;

    const resolvedBg =
      bgType === "color" ? (bgColor || undefined)
      : bgType === "gradient" ? `linear-gradient(${bgGradAngle ?? 180}deg, ${bgGrad1 || "transparent"}, ${bgGrad2 || "transparent"})`
      : bgType === "image" && bgImage ? bgImage
      : bgType === "video" ? (bgColor || undefined)
      : undefined;

    const br = borderRadius4 ?? { top: 0, right: 0, bottom: 0, left: 0 };
    const bw = borderWidth4 ?? { top: 1, right: 1, bottom: 1, left: 1 };

    const outerStyle: React.CSSProperties = {
      position: "relative",
      overflow: "hidden",
      backgroundColor: bgType === "color" ? (bgColor || undefined) : bgType === "video" ? (bgColor || "#000") : undefined,
      background: bgType === "gradient" ? resolvedBg : undefined,
      backgroundImage: bgType === "image" && bgImage ? `url("${bgImage}")` : undefined,
      backgroundSize: bgType === "image" ? (bgSize || "cover") : undefined,
      backgroundPosition: bgType === "image" ? (bgPos || "center center") : undefined,
      backgroundRepeat: bgType === "image" ? (bgRepeat || "no-repeat") : undefined,
      backgroundAttachment: bgType === "image" && bgFixed ? "fixed" : undefined,
      borderStyle: borderStyle !== "none" ? borderStyle : undefined,
      borderTopWidth: borderStyle !== "none" ? (bw.top ?? 1) : 0,
      borderRightWidth: borderStyle !== "none" ? (bw.right ?? 1) : 0,
      borderBottomWidth: borderStyle !== "none" ? (bw.bottom ?? 1) : 0,
      borderLeftWidth: borderStyle !== "none" ? (bw.left ?? 1) : 0,
      borderColor: borderStyle !== "none" ? (borderColor || "transparent") : undefined,
      borderTopLeftRadius: br.top ?? 0,
      borderTopRightRadius: br.right ?? 0,
      borderBottomRightRadius: br.bottom ?? 0,
      borderBottomLeftRadius: br.left ?? 0,
      minHeight: (minHeightPx && minHeightPx > 0) ? minHeightPx : undefined,
      paddingTop: advPadding?.top ?? 24, paddingRight: advPadding?.right ?? 24,
      paddingBottom: advPadding?.bottom ?? 24, paddingLeft: advPadding?.left ?? 24,
      marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0,
      marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0,
      zIndex: zIndex ?? undefined,
      boxSizing: "border-box",
    };

    const innerStyle: React.CSSProperties = {
      position: "relative", zIndex: 2,
      display: "flex",
      flexDirection: (direction as any) || "row",
      justifyContent: justifyContent || "flex-start",
      alignItems: alignItems || "stretch",
      gap: gap ? `${gap}px` : undefined,
      flexWrap: (wrap as any) || "nowrap",
      width: "100%",
      maxWidth: contentWidth === "boxed" ? `${containerWidth || 1140}px` : undefined,
      marginLeft: contentWidth === "boxed" ? "auto" : undefined,
      marginRight: contentWidth === "boxed" ? "auto" : undefined,
      boxSizing: "border-box",
    };

    // Shape divider SVG paths
    const renderDivider = (type: string, color: string, height: number, flip: boolean, position: "top" | "bottom") => {
      const shapes: Record<string, string> = {
        triangle: "M0,0 L50,100 L100,0 Z",
        curve: "M0,100 Q50,0 100,100 Z",
        wave: "M0,60 C20,100 40,0 60,60 C80,120 100,20 100,60 L100,100 L0,100 Z",
      };
      const d = shapes[type];
      if (!d) return null;
      return (
        <div style={{
          position: "absolute", [position]: 0, left: 0, right: 0, zIndex: 3,
          height: height || 50, overflow: "hidden",
          transform: flip ? "scaleX(-1)" : undefined,
        }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
            <path d={d} fill={color || "#fff"} />
          </svg>
        </div>
      );
    };

    const animCss = (animation && animation !== "none") ? `
      @keyframes puck-${animation} {
        from { ${animation === "fadeIn" ? "opacity:0" : animation === "fadeInUp" ? "opacity:0;transform:translateY(30px)" : animation === "fadeInDown" ? "opacity:0;transform:translateY(-30px)" : animation === "slideInLeft" ? "opacity:0;transform:translateX(-40px)" : animation === "slideInRight" ? "opacity:0;transform:translateX(40px)" : "opacity:0;transform:scale(0.9)"} }
        to { opacity:1;transform:none }
      }
      #${uid} { animation: puck-${animation} ${animDuration ?? 600}ms ease ${animDelay ?? 0}ms both; }
    ` : "";

    return (
      <div id={uid} className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined} style={outerStyle}>
        <EditorHideOverlay hideDesktop={hideDesktop} hideTablet={hideTablet} hideMobile={hideMobile} />
        {(animCss || customCss) && <style>{animCss}{customCss}</style>}
        {/* Background video */}
        {bgType === "video" && bgVideo && (
          <video autoPlay loop={bgVideoLoop !== false} muted={bgVideoMute !== false} playsInline
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
            src={bgVideo}
          />
        )}
        {/* Overlay */}
        {bgType === "image" && overlayType === "color" && overlayOpacity > 0 && (
          <div style={{ position: "absolute", inset: 0, zIndex: 1, backgroundColor: overlayColor || "#000", opacity: (overlayOpacity || 0) / 100 }} />
        )}
        {bgType === "image" && overlayType === "gradient" && (
          <div style={{ position: "absolute", inset: 0, zIndex: 1, background: `linear-gradient(to bottom, ${overlayGrad1 || "rgba(0,0,0,0.8)"}, ${overlayGrad2 || "rgba(0,0,0,0)"})` }} />
        )}
        {/* Shape dividers */}
        {dividerTop !== "none" && renderDivider(dividerTop, dividerTopColor, dividerTopHeight, !!dividerTopFlip, "top")}
        {dividerBottom !== "none" && renderDivider(dividerBottom, dividerBottomColor, dividerBottomHeight, !!dividerBottomFlip, "bottom")}
        {/* Content — zone name is unique per block instance via uid */}
        <div style={innerStyle}>
          <DropZone zone={`container-content-${uid}`} />
        </div>
      </div>
    );
  },
};

export { LayoutBlockComponent };
