// @ts-nocheck
// ─────────────────────────────────────────────────────────────────────────────
// Section block + section templates.
//
// SectionBlockComponent is the unified Container+Grid section. The remaining
// helpers (makeSectionFields/SectionStyleFields/SectionCanvasWrap/…) and the
// sectionTemplateConfig map build the pre-designed "Sections" that appear in the
// editor drawer. Exported sectionTemplateConfig is also consumed by
// app/puck-splat/section-templates.tsx.
// ─────────────────────────────────────────────────────────────────────────────

import type * as React from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { DropZone, usePuck } from "@my-app/puck-editor";
import { loadGoogleFont } from "@/puck-splat/utils";

import {
  AlignField,
  BlockTabBar,
  ColorPickerField,
  EditorHideOverlay,
  FourSideField,
  buildResponsiveSpacingCss,
  InlineSelect,
  SliderNumberField,
  StackedNumberField,
  StackedTextField,
  StackedTextareaField,
  TabSection,
  ToggleField,
} from "@/puck-blocks/shared";

import {
  ImageField,
  LinkUrlField,
  VideoUploadField,
} from "@/puck-blocks/block-fields";

// ─── Section Block (Container + Grid combined) ────────────────────────────────
// One drag gives a full-width section wrapper (Container styling) with a
// columned inner grid (Grid layout). All Container and Grid settings unified.

const SectionBlockComponent = {
  label: "Section",
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
          <BlockTabBar blockKey="SectionBlock">
            {(tab) => (
              <>
                {/* ── LAYOUT TAB ── */}
                {tab === "content" && (
                  <>
                    <TabSection title="Section" />
                    <InlineSelect
                      label="Content Width"
                      value={props.contentWidth ?? "boxed"}
                      onChange={(v) => set("contentWidth", v)}
                      options={[{ value: "boxed", label: "Boxed" }, { value: "full", label: "Full Width" }]}
                    />
                    {props.contentWidth === "boxed" && (
                      <SliderNumberField label="Max Width" value={props.containerWidth ?? 1140} onChange={(v) => set("containerWidth", v)} min={320} max={1920} step={10} unit="PX" />
                    )}
                    <SliderNumberField label="Min Height" value={props.minHeightPx ?? 0} onChange={(v) => set("minHeightPx", v)} min={0} max={1200} step={10} unit="PX" />
                  </>
                )}

                {/* ── STYLE TAB (background, border, shadow, dividers) ── */}
                {tab === "style" && (
                  <>
                    <TabSection title="Background" />
                    <InlineSelect label="Type" value={props.bgType ?? "none"} onChange={(v) => set("bgType", v)} options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }, { value: "gradient", label: "Gradient" }, { value: "image", label: "Image" }, { value: "video", label: "Video" }]} />
                    {props.bgType === "color" && <ColorPickerField label="Color" value={props.bgColor ?? ""} onChange={(v) => set("bgColor", v)} />}
                    {props.bgType === "gradient" && (
                      <>
                        <ColorPickerField label="Start Color" value={props.bgGrad1 ?? ""} onChange={(v) => set("bgGrad1", v)} />
                        <ColorPickerField label="End Color" value={props.bgGrad2 ?? ""} onChange={(v) => set("bgGrad2", v)} />
                        <InlineSelect label="Direction" value={props.bgGradDir ?? "to bottom"} onChange={(v) => set("bgGradDir", v)} options={[{ value: "to bottom", label: "Top → Bottom" }, { value: "to right", label: "Left → Right" }, { value: "to bottom right", label: "Diagonal ↘" }, { value: "to top", label: "Bottom → Top" }]} />
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
                            <ColorPickerField label="Gradient Start" value={props.overlayGrad1 ?? "rgba(0,0,0,0.8)"} onChange={(v) => set("overlayGrad1", v)} />
                            <ColorPickerField label="Gradient End" value={props.overlayGrad2 ?? "rgba(0,0,0,0)"} onChange={(v) => set("overlayGrad2", v)} />
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
                    <InlineSelect label="Border Type" value={props.borderStyle ?? "none"} onChange={(v) => set("borderStyle", v)} options={[{ value: "none", label: "None" }, { value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }, { value: "dotted", label: "Dotted" }]} />
                    {props.borderStyle !== "none" && (
                      <>
                        <FourSideField label="Border Width (px)" value={props.borderWidth4 ?? { top: 1, right: 1, bottom: 1, left: 1 }} onChange={(v) => set("borderWidth4", v)} />
                        <ColorPickerField label="Border Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
                      </>
                    )}
                    <FourSideField label="Border Radius (px)" value={props.borderRadius4 ?? { top: 0, right: 0, bottom: 0, left: 0 }} onChange={(v) => set("borderRadius4", v)} />


                    <TabSection title="Shape Divider" />
                    <InlineSelect label="Top" value={props.dividerTop ?? "none"} onChange={(v) => set("dividerTop", v)} options={[{ value: "none", label: "None" }, { value: "triangle", label: "Triangle" }, { value: "curve", label: "Curve" }, { value: "wave", label: "Wave" }]} />
                    {props.dividerTop !== "none" && (
                      <>
                        <ColorPickerField label="Top Color" value={props.dividerTopColor ?? "#fff"} onChange={(v) => set("dividerTopColor", v)} />
                        <SliderNumberField label="Top Height" value={props.dividerTopHeight ?? 50} onChange={(v) => set("dividerTopHeight", v)} min={10} max={300} step={5} unit="PX" />
                        <ToggleField label="Flip Horizontal" value={!!props.dividerTopFlip} onChange={(v) => set("dividerTopFlip", v)} />
                      </>
                    )}
                    <InlineSelect label="Bottom" value={props.dividerBottom ?? "none"} onChange={(v) => set("dividerBottom", v)} options={[{ value: "none", label: "None" }, { value: "triangle", label: "Triangle" }, { value: "curve", label: "Curve" }, { value: "wave", label: "Wave" }]} />
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
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 60, right: 0, bottom: 60, left: 0 }} onChange={(v) => set("advPadding", v)} />
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
    // Section / container
    contentWidth: "boxed", containerWidth: 1140, minHeightPx: 0,
    // Grid
    columns: 2, columnsTablet: 1, columnsMobile: 1,
    columnGapPx: 24, rowGapPx: 24, alignItems: "stretch",
    // Background
    bgType: "none", bgColor: "", bgGrad1: "", bgGrad2: "", bgGradDir: "to bottom", bgGradAngle: 180,
    bgImage: "", bgSize: "cover", bgPos: "center center", bgRepeat: "no-repeat", bgFixed: false,
    overlayType: "none", overlayColor: "#000000", overlayOpacity: 50,
    overlayGrad1: "rgba(0,0,0,0.8)", overlayGrad2: "rgba(0,0,0,0)",
    bgVideo: "", bgVideoLoop: true, bgVideoMute: true,
    // Border
    borderStyle: "none", borderWidth4: { top: 1, right: 1, bottom: 1, left: 1 }, borderColor: "",
    borderRadius4: { top: 0, right: 0, bottom: 0, left: 0 },
    // Shadow
    // Dividers
    dividerTop: "none", dividerTopColor: "#fff", dividerTopHeight: 50, dividerTopFlip: false,
    dividerBottom: "none", dividerBottomColor: "#fff", dividerBottomHeight: 50, dividerBottomFlip: false,
    // Spacing / visibility
    advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 60, right: 0, bottom: 60, left: 0 },
    hideDesktop: false, hideTablet: false, hideMobile: false, responsiveSpacing: {},
    // Animation
    animation: "none", animDuration: 600, animDelay: 0,
    // Custom
    cssId: "", cssClass: "", customCss: "", zIndex: null,
  },

  render: ({
    id: puckId,
    contentWidth, containerWidth, minHeightPx,
    bgType, bgColor, bgGrad1, bgGrad2, bgGradDir: _bgGradDir, bgGradAngle,
    bgImage, bgSize, bgPos, bgRepeat, bgFixed,
    overlayType, overlayColor, overlayOpacity, overlayGrad1, overlayGrad2,
    bgVideo, bgVideoLoop, bgVideoMute,
    borderStyle, borderWidth4, borderColor, borderRadius4,
    dividerTop, dividerTopColor, dividerTopHeight, dividerTopFlip,
    dividerBottom, dividerBottomColor, dividerBottomHeight, dividerBottomFlip,
    advMargin, advPadding, hideDesktop, hideTablet, hideMobile, responsiveSpacing,
    animation, animDuration, animDelay,
    cssId, cssClass, customCss, zIndex,
  }: any) => {
    const uid = cssId || `pb-section-${puckId || "s"}`;
    const hideClasses = [
      hideDesktop ? "puck-hide-desktop" : "",
      hideTablet  ? "puck-hide-tablet"  : "",
      hideMobile  ? "puck-hide-mobile"  : "",
    ].filter(Boolean).join(" ");

    const br = borderRadius4 ?? { top: 0, right: 0, bottom: 0, left: 0 };
    const bw = borderWidth4  ?? { top: 1, right: 1, bottom: 1, left: 1 };

    // ── outer section wrapper (background / border / shadow) ──
    const outerStyle: React.CSSProperties = {
      position: "relative",
      overflow: "hidden",
      backgroundColor: bgType === "color" ? (bgColor || undefined) : bgType === "video" ? (bgColor || "#000") : undefined,
      background: bgType === "gradient" ? `linear-gradient(${bgGradAngle ?? 180}deg, ${bgGrad1 || "transparent"}, ${bgGrad2 || "transparent"})` : undefined,
      backgroundImage: bgType === "image" && bgImage ? `url("${bgImage}")` : undefined,
      backgroundSize: bgType === "image" ? (bgSize || "cover") : undefined,
      backgroundPosition: bgType === "image" ? (bgPos || "center center") : undefined,
      backgroundRepeat: bgType === "image" ? (bgRepeat || "no-repeat") : undefined,
      backgroundAttachment: bgType === "image" && bgFixed ? "fixed" : undefined,
      borderStyle: borderStyle !== "none" ? borderStyle : undefined,
      borderTopWidth:    borderStyle !== "none" ? (bw.top    ?? 1) : 0,
      borderRightWidth:  borderStyle !== "none" ? (bw.right  ?? 1) : 0,
      borderBottomWidth: borderStyle !== "none" ? (bw.bottom ?? 1) : 0,
      borderLeftWidth:   borderStyle !== "none" ? (bw.left   ?? 1) : 0,
      borderColor: borderStyle !== "none" ? (borderColor || "transparent") : undefined,
      borderTopLeftRadius:     br.top    ?? 0,
      borderTopRightRadius:    br.right  ?? 0,
      borderBottomRightRadius: br.bottom ?? 0,
      borderBottomLeftRadius:  br.left   ?? 0,
      minHeight: (minHeightPx && minHeightPx > 0) ? minHeightPx : undefined,
      paddingTop:    advPadding?.top    ?? 60,
      paddingRight:  advPadding?.right  ?? 0,
      paddingBottom: advPadding?.bottom ?? 60,
      paddingLeft:   advPadding?.left   ?? 0,
      marginTop:    advMargin?.top    ?? 0,
      marginRight:  advMargin?.right  ?? 0,
      marginBottom: advMargin?.bottom ?? 0,
      marginLeft:   advMargin?.left   ?? 0,
      zIndex: zIndex ?? undefined,
      boxSizing: "border-box",
    };

    // ── boxed inner wrapper ──
    const innerWrapStyle: React.CSSProperties = {
      position: "relative", zIndex: 2,
      width: "100%",
      maxWidth: contentWidth === "boxed" ? `${containerWidth || 1140}px` : undefined,
      marginLeft:  contentWidth === "boxed" ? "auto" : undefined,
      marginRight: contentWidth === "boxed" ? "auto" : undefined,
      boxSizing: "border-box",
    };

    // ── shape divider renderer ──
    const renderDivider = (type: string, color: string, height: number, flip: boolean, pos: "top" | "bottom") => {
      const paths: Record<string, string> = {
        triangle: "M0,0 L50,100 L100,0 Z",
        curve:    "M0,100 Q50,0 100,100 Z",
        wave:     "M0,60 C20,100 40,0 60,60 C80,120 100,20 100,60 L100,100 L0,100 Z",
      };
      if (!paths[type]) return null;
      return (
        <div style={{ position: "absolute", [pos]: 0, left: 0, right: 0, zIndex: 3, height: height || 50, overflow: "hidden", transform: flip ? "scaleX(-1)" : undefined }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
            <path d={paths[type]} fill={color || "#fff"} />
          </svg>
        </div>
      );
    };

    // ── animation keyframes ──
    const fromMap: Record<string, string> = {
      fadeIn:      "opacity:0",
      fadeInUp:    "opacity:0;transform:translateY(30px)",
      fadeInDown:  "opacity:0;transform:translateY(-30px)",
      slideInLeft: "opacity:0;transform:translateX(-40px)",
      slideInRight:"opacity:0;transform:translateX(40px)",
      zoomIn:      "opacity:0;transform:scale(0.9)",
    };
    const animCss = (animation && animation !== "none" && fromMap[animation]) ? `
      @keyframes puck-sec-${animation} { from{${fromMap[animation]}} to{opacity:1;transform:none} }
      #${uid}{animation:puck-sec-${animation} ${animDuration ?? 600}ms ease ${animDelay ?? 0}ms both;}
    ` : "";

    return (
      <div
        id={uid}
        data-pb-rs={uid}
        className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined}
        style={outerStyle}
      >
        <EditorHideOverlay hideDesktop={hideDesktop} hideTablet={hideTablet} hideMobile={hideMobile} />
        {/* CSS */}
        {(animCss || customCss) && (
          <style>{`${animCss}${customCss || ""}`}</style>
        )}
        {(() => { const rsCss = buildResponsiveSpacingCss(`[data-pb-rs="${uid}"]`, responsiveSpacing); return rsCss ? <style>{rsCss}</style> : null; })()}

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
        {dividerTop    !== "none" && renderDivider(dividerTop,    dividerTopColor,    dividerTopHeight,    !!dividerTopFlip,    "top")}
        {dividerBottom !== "none" && renderDivider(dividerBottom, dividerBottomColor, dividerBottomHeight, !!dividerBottomFlip, "bottom")}

        {/* Boxed inner → free-flow drop zone */}
        <div style={innerWrapStyle}>
          <DropZone zone={`section-${uid}-content`} />
        </div>
      </div>
    );
  },
};

// ─── Shared section field helpers ────────────────────────────────────────────

function makeSectionSet(dispatch: any, selectedItem: any, appState: any) {
  return (key: string, val: any) => {
    if (!selectedItem) return;
    const state = appState.data;
    let destinationZone = "root:default-zone", destinationIndex = 0;
    const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
    for (const [zone, items] of Object.entries(zones)) {
      const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
      if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
    }
    dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...selectedItem.props, [key]: val } } });
  };
}

// Shared Style tab (Background / Border / Shadow) — same controls used by Section block
function SectionStyleFields({ props, set }: { props: any; set: (k: string, v: any) => void }) {
  return (
    <>
      <TabSection title="Background" />
      <InlineSelect label="Type" value={props.bgType ?? "none"} onChange={(v) => set("bgType", v)}
        options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }, { value: "gradient", label: "Gradient" }, { value: "image", label: "Image" }, { value: "video", label: "Video" }]} />
      {props.bgType === "color" && <ColorPickerField label="Color" value={props.bgColor ?? ""} onChange={(v) => set("bgColor", v)} />}
      {props.bgType === "gradient" && (
        <>
          <ColorPickerField label="Start Color" value={props.bgGrad1 ?? ""} onChange={(v) => set("bgGrad1", v)} />
          <ColorPickerField label="End Color" value={props.bgGrad2 ?? ""} onChange={(v) => set("bgGrad2", v)} />
          <InlineSelect label="Direction" value={props.bgGradDir ?? "to bottom"} onChange={(v) => set("bgGradDir", v)}
            options={[{ value: "to bottom", label: "Top → Bottom" }, { value: "to right", label: "Left → Right" }, { value: "to bottom right", label: "Diagonal ↘" }, { value: "to top", label: "Bottom → Top" }]} />
          <SliderNumberField label="Angle" value={props.bgGradAngle ?? 180} onChange={(v) => set("bgGradAngle", v)} min={0} max={360} step={1} unit="°" />
        </>
      )}
      {props.bgType === "image" && (
        <>
          <ImageField label="Background Image" value={props.bgImage ?? ""} onChange={(v) => set("bgImage", v)} />
          <InlineSelect label="Size" value={props.bgSize ?? "cover"} onChange={(v) => set("bgSize", v)}
            options={[{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "auto", label: "Auto" }]} />
          <InlineSelect label="Position" value={props.bgPos ?? "center center"} onChange={(v) => set("bgPos", v)}
            options={[{ value: "center center", label: "Center" }, { value: "top center", label: "Top" }, { value: "bottom center", label: "Bottom" }]} />
          <ToggleField label="Fixed (Parallax)" value={!!props.bgFixed} onChange={(v) => set("bgFixed", v)} />
          <TabSection title="Overlay" />
          <InlineSelect label="Overlay" value={props.overlayType ?? "none"} onChange={(v) => set("overlayType", v)}
            options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }]} />
          {props.overlayType === "color" && (
            <>
              <ColorPickerField label="Overlay Color" value={props.overlayColor ?? "#000000"} onChange={(v) => set("overlayColor", v)} />
              <SliderNumberField label="Opacity" value={props.overlayOpacity ?? 50} onChange={(v) => set("overlayOpacity", v)} min={0} max={100} step={1} unit="%" />
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
      <InlineSelect label="Style" value={props.borderStyle ?? "none"} onChange={(v) => set("borderStyle", v)}
        options={[{ value: "none", label: "None" }, { value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }, { value: "dotted", label: "Dotted" }]} />
      {props.borderStyle !== "none" && (
        <>
          <SliderNumberField label="Width (px)" value={props.borderWidth ?? 1} onChange={(v) => set("borderWidth", v)} min={1} max={20} step={1} unit="px" />
          <ColorPickerField label="Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
          <SliderNumberField label="Radius (px)" value={props.borderRadius ?? 0} onChange={(v) => set("borderRadius", v)} min={0} max={100} step={1} unit="px" />
        </>
      )}
    </>
  );
}

// Shared Advanced tab (Layout / Spacing / Columns / Responsive / Animation / Custom)
function SectionAdvancedFields({ props, set }: { props: any; set: (k: string, v: any) => void }) {
  return (
    <>
      <TabSection title="Layout" />
      <InlineSelect label="Content Width" value={props.contentWidth ?? "boxed"} onChange={(v) => set("contentWidth", v)}
        options={[{ value: "boxed", label: "Boxed" }, { value: "full", label: "Full Width" }]} />
      {props.contentWidth === "boxed" && <SliderNumberField label="Max Width" value={props.containerWidth ?? 1140} onChange={(v) => set("containerWidth", v)} min={320} max={1920} step={10} unit="PX" />}
      <SliderNumberField label="Min Height" value={props.minHeightPx ?? 0} onChange={(v) => set("minHeightPx", v)} min={0} max={1200} step={10} unit="PX" />
      <TabSection title="Spacing" />
      <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 60, right: 0, bottom: 60, left: 0 }} onChange={(v) => set("advPadding", v)} />
      <FourSideField label="Margin (px)" value={props.advMargin ?? { top: 0, right: 0, bottom: 0, left: 0 }} onChange={(v) => set("advMargin", v)} />
      <TabSection title="Responsive" />
      <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
      <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
      <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />
      <TabSection title="Animation" />
      <InlineSelect label="Entrance" value={props.animation ?? "none"} onChange={(v) => set("animation", v)}
        options={[{ value: "none", label: "None" }, { value: "fadeIn", label: "Fade In" }, { value: "fadeInUp", label: "Fade In Up" }, { value: "fadeInDown", label: "Fade In Down" }, { value: "slideInLeft", label: "Slide In Left" }, { value: "slideInRight", label: "Slide In Right" }, { value: "zoomIn", label: "Zoom In" }]} />
      {props.animation && props.animation !== "none" && (
        <>
          <SliderNumberField label="Duration (ms)" value={props.animDuration ?? 600} onChange={(v) => set("animDuration", v)} min={100} max={3000} step={100} unit="ms" />
          <SliderNumberField label="Delay (ms)" value={props.animDelay ?? 0} onChange={(v) => set("animDelay", v)} min={0} max={3000} step={100} unit="ms" />
        </>
      )}
    </>
  );
}

// Builds the fields object for any section template
function makeSectionFields(blockKey: string, contentRender: (props: any, set: (k: string, v: any) => void) => React.ReactNode) {
  return {
    _tabs: {
      type: "custom" as const,
      label: "",
      render: (_: any) => {
        const { selectedItem, appState, dispatch } = usePuck();
        const props = selectedItem?.props ?? {};
        const set = makeSectionSet(dispatch, selectedItem, appState);
        return (
          <BlockTabBar blockKey={blockKey}>
            {(tab) => (
              <>
                {tab === "content" && (
                  <>{contentRender(props, set)}</>
                )}
                {tab === "style" && (
                  <SectionStyleFields props={props} set={set} />
                )}
                {tab === "advanced" && (
                  <SectionAdvancedFields props={props} set={set} />
                )}
              </>
            )}
          </BlockTabBar>
        );
      },
    },
  };
}

// ─── Section canvas render helpers ───────────────────────────────────────────

// SectionCanvasWrap — renders the outer section shell and passes the stable
// uid down via React context so every SectionDZ inside can derive a unique,
// per-instance zone name.
const SectionUidCtx = createContext<string>("x");

function SectionCanvasWrap({ props, children }: { props: any; children: React.ReactNode }) {
  // Derive a stable uid from the Puck-assigned block id (never Math.random).
  const uid = props.cssId || `st-${(props.id || "x").slice(-8)}`;
  const bgType = props.bgType ?? "none";
  // Gradient: prefer the named Direction, fall back to the numeric angle.
  const gradDir = props.bgGradDir || `${props.bgGradAngle ?? 180}deg`;
  const gradient = bgType === "gradient"
    ? `linear-gradient(${gradDir}, ${props.bgGrad1 || "transparent"}, ${props.bgGrad2 || "transparent"})`
    : undefined;
  // Border (matches SectionStyleFields keys).
  const border = props.borderStyle && props.borderStyle !== "none"
    ? `${props.borderWidth ?? 1}px ${props.borderStyle} ${props.borderColor || "#e5e7eb"}`
    : undefined;
  // Background is rendered as a dedicated absolutely-positioned layer (like the
  // video/image layers) rather than via the container's own backgroundColor/
  // background inline styles. This keeps color/gradient behaving identically to
  // image/video across re-renders (the previous approach could lose the inline
  // background on the editor canvas after a publish-triggered re-render).
  let bgLayerStyle: React.CSSProperties | null = null;
  if (bgType === "color" && props.bgColor) {
    bgLayerStyle = { backgroundColor: props.bgColor };
  } else if (bgType === "gradient") {
    bgLayerStyle = { background: gradient };
  } else if (bgType === "image" && props.bgImage) {
    bgLayerStyle = {
      backgroundImage: `url("${props.bgImage}")`,
      backgroundSize: props.bgSize || "cover",
      backgroundPosition: props.bgPos || "center center",
      backgroundRepeat: props.bgRepeat || "no-repeat",
      backgroundAttachment: props.bgFixed ? "fixed" : undefined,
    };
  } else if (bgType === "video") {
    bgLayerStyle = { backgroundColor: props.bgColor || "#000" };
  }

  return (
    <SectionUidCtx.Provider value={uid}>
      <div id={uid} style={{
        position: "relative", overflow: "hidden",
        border,
        borderRadius: props.borderRadius ? props.borderRadius : undefined,
        minHeight: props.minHeightPx > 0 ? props.minHeightPx : undefined,
        paddingTop: props.advPadding?.top ?? 60, paddingBottom: props.advPadding?.bottom ?? 60,
        paddingLeft: props.advPadding?.left ?? 0, paddingRight: props.advPadding?.right ?? 0,
        marginTop: props.advMargin?.top ?? 0, marginBottom: props.advMargin?.bottom ?? 0,
        boxSizing: "border-box",
      }}>
        {bgLayerStyle && (
          <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", ...bgLayerStyle }} />
        )}
        <EditorHideOverlay hideDesktop={props.hideDesktop} hideTablet={props.hideTablet} hideMobile={props.hideMobile} />
        {bgType === "video" && props.bgVideo && (
          <video autoPlay loop={props.bgVideoLoop !== false} muted={props.bgVideoMute !== false} playsInline
            src={props.bgVideo} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
        )}
        {bgType === "image" && props.overlayType === "color" && (
          <div style={{ position: "absolute", inset: 0, background: props.overlayColor || "#000000", opacity: (props.overlayOpacity ?? 50) / 100, zIndex: 0, pointerEvents: "none" }} />
        )}
        <div style={{ position: "relative", zIndex: 1, maxWidth: props.contentWidth === "boxed" ? `${props.containerWidth || 1140}px` : undefined, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
          {children}
        </div>
      </div>
    </SectionUidCtx.Provider>
  );
}

// SectionDZ — slot is a stable numeric index (0,1,2…) unique within each
// section template render. The zone name combines the block uid + slot so
// every instance on the page has completely independent DropZones.
function SectionDZ({ slot, label, icon, hint, minH = 80 }: { slot: number; label: string; icon?: string; hint?: string; minH?: number }) {
  const uid = useContext(SectionUidCtx);
  const zone = `${uid}-s${slot}`;
  return (
    <div style={{ position: "relative", minHeight: minH }}>
      <div style={{ position: "absolute", inset: 0, border: "2px dashed #d1d5db", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "10px 8px", background: "rgba(248,250,252,0.9)", color: "#9ca3af", pointerEvents: "none", zIndex: 0, boxSizing: "border-box" }}>
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
        <span style={{ fontSize: 11, fontWeight: 700, textAlign: "center", color: "#6b7280" }}>{label}</span>
        {hint && <span style={{ fontSize: 10, textAlign: "center", color: "#9ca3af", lineHeight: 1.3 }}>{hint}</span>}
      </div>
      <div style={{ position: "relative", zIndex: 1, minHeight: minH }}><DropZone zone={zone} /></div>
    </div>
  );
}

function SecGrid({ cols, gap = 32, children }: { cols: number; gap?: number; children: React.ReactNode }) {
  return <div className="pb-sec-cards" style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap, alignItems: "stretch" }}>{children}</div>;
}

// ─── Reusable section content helpers ────────────────────────────────────────

// Centered section heading (badge / title / subtitle) used by most templates.
function SectionHeading({ title, subtitle, titleColor, subtitleColor, align = "center" }: {
  title?: string; subtitle?: string; titleColor?: string; subtitleColor?: string; align?: "left" | "center";
}) {
  if (!title && !subtitle) return null;
  return (
    <div style={{ textAlign: align, maxWidth: align === "center" ? 720 : undefined, margin: align === "center" ? "0 auto 40px" : "0 0 32px" }}>
      {title && <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.25rem)", fontWeight: 800, color: titleColor || "#111827", lineHeight: 1.2, margin: "0 0 12px" }}>{title}</h2>}
      {subtitle && <p style={{ fontSize: "1.05rem", color: subtitleColor || "#6b7280", lineHeight: 1.6, margin: 0 }}>{subtitle}</p>}
    </div>
  );
}

// SectionItemsField — a lightweight repeatable-list editor for use INSIDE a
// section's custom `_tabs` render (where native Puck array fields can't be
// nested). `items` is the current array; `onChange` replaces the whole array.
// `fields` describes each editable property of an item.
function SectionItemsField({ label, items, onChange, fields, newItem, max = 12 }: {
  label: string;
  items: any[];
  onChange: (next: any[]) => void;
  fields: { key: string; label: string; type?: "text" | "textarea" | "image" | "url"; placeholder?: string }[];
  newItem: () => any;
  max?: number;
}) {
  const list = Array.isArray(items) ? items : [];
  const update = (i: number, key: string, val: any) => {
    const next = list.map((it, idx) => (idx === i ? { ...it, [key]: val } : it));
    onChange(next);
  };
  const remove = (i: number) => onChange(list.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => onChange([...list, newItem()]);

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--p-color-text)", marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.map((item, i) => (
          <div key={i} style={{ border: "1px solid var(--p-color-border)", borderRadius: 8, padding: 10, background: "var(--p-color-bg-surface-secondary, #f6f6f7)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--p-color-text-secondary)" }}>#{i + 1}</span>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => move(i, -1)} disabled={i === 0} title="Move up" style={miniBtn}>↑</button>
                <button onClick={() => move(i, 1)} disabled={i === list.length - 1} title="Move down" style={miniBtn}>↓</button>
                <button onClick={() => remove(i)} title="Remove" style={{ ...miniBtn, color: "#d72c0d" }}>✕</button>
              </div>
            </div>
            {fields.map((f) => {
              const v = item[f.key] ?? "";
              if (f.type === "image") return <ImageField key={f.key} label={f.label} value={v} onChange={(val) => update(i, f.key, val)} />;
              if (f.type === "url") return <LinkUrlField key={f.key} label={f.label} value={v} onChange={(val) => update(i, f.key, val)} />;
              if (f.type === "textarea") return <StackedTextareaField key={f.key} label={f.label} value={v} onChange={(val) => update(i, f.key, val)} placeholder={f.placeholder} />;
              return <StackedTextField key={f.key} label={f.label} value={v} onChange={(val) => update(i, f.key, val)} placeholder={f.placeholder} />;
            })}
          </div>
        ))}
      </div>
      {list.length < max && (
        <button onClick={add} style={{ marginTop: 8, width: "100%", padding: "8px 10px", fontSize: 12, fontWeight: 600, border: "1px dashed var(--p-color-border)", borderRadius: 8, background: "var(--p-color-bg-surface)", color: "var(--p-color-text)", cursor: "pointer" }}>
          + Add {label.replace(/s$/, "")}
        </button>
      )}
    </div>
  );
}

const miniBtn: React.CSSProperties = {
  width: 24, height: 24, border: "1px solid var(--p-color-border)", borderRadius: 4,
  background: "var(--p-color-bg-surface)", cursor: "pointer", fontSize: 12, lineHeight: 1,
  display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--p-color-text)",
};

// AccordionItemsField — collapsible repeatable-list editor (the Photo Collage /
// Gallery accordion UI): each row is a thumbnail + title + chevron that expands to
// reveal the per-item fields, with an inline delete confirmation. The thumbnail,
// header title and subtitle are derived per item so the same component drives image
// galleries (photo thumb) and content cards (e.g. Services — emoji thumb).
function AccordionItemsField({ items, onChange, fields, newItem, max = 12, singular = "Item", getThumb, getTitle, getSubtitle, removeNote }: {
  items: any[];
  onChange: (next: any[]) => void;
  fields: { key: string; label: string; type?: "text" | "textarea" | "image" | "url"; placeholder?: string }[];
  newItem: () => any;
  max?: number;
  singular?: string;
  getThumb?: (item: any) => React.ReactNode;
  getTitle?: (item: any, i: number) => string;
  getSubtitle?: (item: any) => string;
  removeNote?: string;
}) {
  const list = Array.isArray(items) ? items : [];
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [confirmIdx, setConfirmIdx] = useState<number | null>(null);

  const update = (i: number, key: string, val: any) => {
    onChange(list.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)));
  };
  const remove = (i: number) => {
    onChange(list.filter((_, idx) => idx !== i));
    setConfirmIdx(null);
    setOpenIdx(null);
  };
  const add = () => { onChange([...list, newItem()]); setOpenIdx(list.length); };

  const placeholderThumb = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--p-color-icon-subdued, #8c9196)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {list.map((item: any, i: number) => {
        const open = openIdx === i;
        const confirm = confirmIdx === i;
        const headerTitle = getTitle ? getTitle(item, i) : `${singular} ${i + 1}`;
        const headerSub = getSubtitle ? getSubtitle(item) : "";
        const thumb = getThumb ? getThumb(item) : null;
        return (
          <div key={i} style={{ border: "1px solid var(--p-color-border, #e1e3e5)", borderRadius: 8, background: "var(--p-color-bg-surface, #fff)", overflow: "hidden" }}>
            {/* Header row */}
            <div
              onClick={() => { if (!confirm) setOpenIdx(open ? null : i); }}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", cursor: confirm ? "default" : "pointer", userSelect: "none", background: open ? "var(--p-color-bg-surface-secondary, #f6f6f7)" : "transparent", borderBottom: (open || confirm) ? "1px solid var(--p-color-border, #e1e3e5)" : "none" }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 5, overflow: "hidden", background: "var(--p-color-bg-surface-secondary, #f3f4f6)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--p-color-border, #e1e3e5)", fontSize: 20, lineHeight: 1 }}>
                {thumb ?? placeholderThumb}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--p-color-text, #202223)", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{headerTitle}</div>
                <div style={{ fontSize: 11, color: "var(--p-color-text-subdued, #6d7175)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>
                  {headerSub}
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--p-color-icon-subdued, #8c9196)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
                <path d="m6 9 6 6 6-6"/>
              </svg>
              <button
                onClick={(e: any) => { e.stopPropagation(); setConfirmIdx(i); setOpenIdx(null); }}
                title={`Remove ${singular.toLowerCase()}`}
                style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 5, border: "1px solid var(--p-color-border, #e1e3e5)", background: "var(--p-color-bg-surface, #fff)", color: "var(--p-color-text-critical, #d72c0d)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </div>
            {/* Delete confirmation */}
            {confirm && (
              <div style={{ padding: "12px 12px 14px", background: "#fff8f8", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#d72c0d" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#202223", marginBottom: 2 }}>Remove {singular} {i + 1}?</div>
                    <div style={{ fontSize: 11, color: "#6d7175", lineHeight: 1.5 }}>{removeNote ?? `This ${singular.toLowerCase()} will be removed. This action cannot be undone.`}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={(e: any) => { e.stopPropagation(); setConfirmIdx(null); }} style={{ flex: 1, padding: "6px 0", fontSize: 12, fontWeight: 600, borderRadius: 6, border: "1px solid var(--p-color-border, #e1e3e5)", background: "var(--p-color-bg-surface, #fff)", color: "var(--p-color-text, #202223)", cursor: "pointer" }}>Cancel</button>
                  <button onClick={(e: any) => { e.stopPropagation(); remove(i); }} style={{ flex: 1, padding: "6px 0", fontSize: 12, fontWeight: 600, borderRadius: 6, border: "none", background: "#d72c0d", color: "#fff", cursor: "pointer" }}>Remove</button>
                </div>
              </div>
            )}
            {/* Expanded fields */}
            {open && !confirm && (
              <div style={{ padding: "10px 10px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
                {fields.map((f) => {
                  const v = item[f.key] ?? "";
                  if (f.type === "image") return <ImageField key={f.key} label={f.label} value={v} onChange={(val: any) => update(i, f.key, val)} />;
                  if (f.type === "url") return <LinkUrlField key={f.key} label={f.label} value={v} onChange={(val: any) => update(i, f.key, val)} />;
                  if (f.type === "textarea") return <StackedTextareaField key={f.key} label={f.label} value={v} onChange={(val: any) => update(i, f.key, val)} placeholder={f.placeholder} />;
                  return <StackedTextField key={f.key} label={f.label} value={v} onChange={(val: any) => update(i, f.key, val)} placeholder={f.placeholder} />;
                })}
              </div>
            )}
          </div>
        );
      })}
      {list.length < max && (
        <button
          onClick={add}
          style={{ marginTop: 2, width: "100%", padding: "8px 0", border: "1.5px dashed var(--p-color-border-interactive, #0158ad)", borderRadius: 8, color: "var(--p-color-text-interactive, #0158ad)", background: "transparent", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add {singular}
        </button>
      )}
    </div>
  );
}

// Collapsible image-items editor for the Gallery — thin wrapper over the shared
// AccordionItemsField (photo thumbnail + alt/caption fields).
function GalleryItemsField({ items, onChange, max = 36 }: {
  items: any[];
  onChange: (next: any[]) => void;
  max?: number;
}) {
  return (
    <AccordionItemsField
      items={items}
      onChange={onChange}
      max={max}
      singular="Image"
      newItem={() => ({ url: "", alt: "", caption: "" })}
      fields={[
        { key: "url", label: "Image", type: "image" },
        { key: "alt", label: "Alt Text", placeholder: "Describe the image…" },
        { key: "caption", label: "Caption (optional)", placeholder: "Image caption" },
      ]}
      getThumb={(img: any) => (img.url ? <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : null)}
      getTitle={(_img: any, i: number) => `Image ${i + 1}`}
      getSubtitle={(img: any) => img.alt || img.caption || (img.url ? "No alt text" : "No image selected")}
      removeNote="This image will be removed from the gallery. This action cannot be undone."
    />
  );
}

// ─── About section — pre-filled, directly editable content ───────────────────
// Renders the section's own fields (heading/text/button/image) as real content,
// so users customise it from the settings panel instead of dragging blocks in.
// The storefront equivalent lives in puck-renderer.ts (renderSectionAbout) and
// must be kept visually in sync with this component.

// Card-grid sections (Services / Features / Team / Pricing) — heading + a
// responsive grid of editable cards. Storefront equivalent: renderSectionCards.
function SectionCardsContent({ p, variant }: { p: any; variant: "services" | "features" | "team" | "pricing" }) {
  const items: any[] = Array.isArray(p.items) ? p.items : [];
  const accent = p.accentColor || "#005bd3";
  const cols = variant === "team" ? (p.memberCount ?? 4)
    : variant === "pricing" ? (p.tierCount ?? 3)
    : variant === "features" ? (p.featureCount ?? 3)
    : (p.serviceCount ?? 3);
  const gap = variant === "features" ? 32 : variant === "team" ? 24 : variant === "pricing" ? 24 : 28;

  const card = (it: any, i: number) => {
    if (variant === "team") {
      return (
        <div key={i} style={{ textAlign: "center" }}>
          {it.imageUrl
            ? <img src={it.imageUrl} alt={it.name || ""} style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", margin: "0 auto 14px", display: "block" }} />
            : <div style={{ width: 120, height: 120, borderRadius: "50%", background: "#e5e7eb", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>👤</div>}
          <div style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>{it.name || "Name"}</div>
          <div style={{ fontSize: 14, color: accent, fontWeight: 600, marginTop: 2 }}>{it.role || "Role"}</div>
          {it.bio && <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, margin: "8px 0 0" }}>{it.bio}</p>}
        </div>
      );
    }
    if (variant === "pricing") {
      const featured = !!it.featured && String(it.featured).trim() !== "";
      const features = String(it.features || "").split("\n").filter(Boolean);
      return (
        <div key={i} style={{ border: featured ? `2px solid ${accent}` : "1px solid #e5e7eb", borderRadius: 12, padding: 28, background: "#fff", position: "relative", boxShadow: featured ? "0 10px 30px rgba(0,0,0,0.08)" : "none" }}>
          {featured && <span style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: accent, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 999 }}>POPULAR</span>}
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8 }}>{it.name || "Plan"}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 16 }}>
            <span style={{ fontSize: 18, color: "#6b7280" }}>{p.currency || "$"}</span>
            <span style={{ fontSize: 40, fontWeight: 800, color: "#111827", lineHeight: 1 }}>{it.price || "0"}</span>
            <span style={{ fontSize: 14, color: "#6b7280" }}>{it.period || "/mo"}</span>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
            {features.map((f, fi) => <li key={fi} style={{ fontSize: 14, color: "#374151", display: "flex", gap: 8 }}><span style={{ color: accent }}>✓</span>{f}</li>)}
          </ul>
          {it.buttonLabel && <a href={it.buttonUrl || "#"} style={{ display: "block", textAlign: "center", background: featured ? accent : "transparent", color: featured ? "#fff" : accent, border: `2px solid ${accent}`, padding: "10px 0", borderRadius: 6, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>{it.buttonLabel}</a>}
        </div>
      );
    }
    return (
      <div key={i} style={{ background: "#fff", border: "1px solid #eef2f7", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ width: 48, height: 48, borderRadius: 10, background: `${accent}1a`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 14 }}>{it.icon || "⭐"}</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{it.title || "Title"}</div>
        {it.text && <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>{it.text}</p>}
      </div>
    );
  };

  return (
    <SectionCanvasWrap props={p}>
      <SectionHeading title={p.sectionTitle} subtitle={p.sectionSubtitle} />
      <SecGrid cols={cols} gap={gap}>
        {items.length ? items.map(card) : <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#9ca3af", fontSize: 13, padding: 24 }}>Add items in the settings panel →</div>}
      </SecGrid>
    </SectionCanvasWrap>
  );
}

// Testimonial: heading + grid of quote cards (quote, author, role, rating).
function SectionTestimonialContent({ p }: { p: any }) {
  const items: any[] = Array.isArray(p.items) ? p.items : [];
  const cols = Math.min(p.reviewCount ?? 3, 4);
  return (
    <SectionCanvasWrap props={p}>
      <SectionHeading title={p.sectionTitle} subtitle={p.sectionSubtitle} />
      <SecGrid cols={cols} gap={24}>
        {items.map((it, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #eef2f7", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ color: "#f59e0b", fontSize: 15, letterSpacing: 1 }}>{"★".repeat(Math.max(0, Math.min(5, Number(it.rating) || 5)))}</div>
            <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>“{it.quote || "Great experience!"}”</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "auto" }}>
              {it.avatar ? <img src={it.avatar} alt={it.author || ""} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} /> : <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>}
              <div><div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{it.author || "Customer"}</div>{it.role && <div style={{ fontSize: 12, color: "#6b7280" }}>{it.role}</div>}</div>
            </div>
          </div>
        ))}
      </SecGrid>
    </SectionCanvasWrap>
  );
}

// FAQ: heading + native <details> accordion list (q / a).
function SectionFAQContent({ p }: { p: any }) {
  const items: any[] = Array.isArray(p.items) ? p.items : [];
  const accent = p.accentColor || "#005bd3";
  return (
    <SectionCanvasWrap props={p}>
      <SectionHeading title={p.sectionTitle} subtitle={p.sectionSubtitle} />
      <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((it, i) => (
          <details key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "14px 18px", background: "#fff" }}>
            <summary style={{ fontSize: 15, fontWeight: 600, color: "#111827", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", gap: 12 }}>{it.q || "Question"}<span style={{ color: accent }}>＋</span></summary>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, margin: "12px 0 0" }}>{it.a || ""}</p>
          </details>
        ))}
      </div>
    </SectionCanvasWrap>
  );
}

// Gallery: heading + responsive image grid with lightbox, hover effects, carousel, and full controls.
function SectionGalleryContent({ p }: { p: any }) {
  const items: any[] = Array.isArray(p.items) ? p.items : [];
  const cols = p.galleryColumns ?? 3;
  const colsTablet = p.galleryColumnsTablet ?? Math.min(cols, 3);
  const colsMobile = p.galleryColumnsMobile ?? Math.min(cols, 2);
  const gap = p.gap ?? 12;
  const rowGap = p.rowGap != null ? p.rowGap : gap;
  const colGap = p.colGap != null ? p.colGap : gap;
  const ar = p.aspectRatio ?? "square";
  const fit = p.objectFit ?? "cover";
  const br = p.imageBorderRadius != null ? p.imageBorderRadius : 8;
  const shadow = p.imageShadow ? "0 4px 16px rgba(0,0,0,0.12)" : undefined;
  const hoverEffect = p.hoverEffect ?? "none";
  const layoutType = p.layoutType ?? "grid";
  const isMasonry = layoutType === "masonry";
  const showCaption = !!p.showCaption;
  const captionColor = p.captionColor ?? "#6b7280";
  const align = (p.textAlign ?? "text-center").replace("text-", "") as "left" | "center" | "right";
  const showDesc = p.showDescription !== false && !!p.sectionDescription;

  const aspectMap: Record<string, string> = { square: "1/1", portrait: "3/4", landscape: "4/3", original: "auto" };
  const aspectRatioCss = aspectMap[ar] ?? "1/1";
  // Masonry keeps natural image height, so it ignores the aspect ratio.
  const effectiveAR = isMasonry ? "auto" : aspectRatioCss;

  const uid = `gal-${(p.id || "x").slice(-6)}`;

  const imgStyle: React.CSSProperties = {
    width: "100%",
    aspectRatio: effectiveAR === "auto" ? undefined : effectiveAR,
    objectFit: fit as any,
    display: "block",
    transition: hoverEffect !== "none" ? "transform 0.3s ease, filter 0.3s ease, opacity 0.3s ease" : undefined,
  };

  const headingFF = fontFam(p.headingFontFamily);
  const descFF = fontFam(p.descFontFamily);

  return (
    <SectionCanvasWrap props={p}>
      <style>{`
        #${uid} .pb-gal-item { position:relative; overflow:hidden; border-radius:${br}px; box-shadow:${shadow || "none"}; }
        #${uid} .pb-gal-item img { transition: transform .3s ease, filter .3s ease, opacity .3s ease; }
        ${hoverEffect === "zoom" ? `#${uid} .pb-gal-item:hover img { transform:scale(1.08); }` : ""}
        ${hoverEffect === "fade" ? `#${uid} .pb-gal-item:hover img { opacity:0.75; }` : ""}
        ${isMasonry
          ? `#${uid} .pb-gal-grid { column-count:${cols}; column-gap:${colGap}px; }
             #${uid} .pb-gal-cell { break-inside:avoid; margin-bottom:${rowGap}px; }
             @media(max-width:767px){ #${uid} .pb-gal-grid { column-count:${colsMobile}; } }
             @media(min-width:768px) and (max-width:1023px){ #${uid} .pb-gal-grid { column-count:${colsTablet}; } }`
          : `@media(max-width:767px){ #${uid} .pb-gal-grid { grid-template-columns:repeat(${colsMobile},1fr)!important; } }
             @media(min-width:768px) and (max-width:1023px){ #${uid} .pb-gal-grid { grid-template-columns:repeat(${colsTablet},1fr)!important; } }`}
      `}</style>
      <div id={uid}>
        {p.showHeading !== false && p.sectionTitle && (
          <h2 style={{ textAlign: align, fontSize: p.headingFontSize ? `${p.headingFontSize}px` : "clamp(1.5rem,3vw,2.25rem)", fontWeight: Number(p.headingFontWeight ?? 800), fontFamily: headingFF, color: p.headingColor || "#111827", lineHeight: 1.2, margin: "0 0 8px" }}>
            {p.sectionTitle}
          </h2>
        )}
        {showDesc && (
          <p style={{ textAlign: align, fontSize: p.descFontSize ? `${p.descFontSize}px` : "1rem", fontWeight: Number(p.descFontWeight ?? 400), fontFamily: descFF, lineHeight: 1.6, color: p.descriptionColor || "#6b7280", margin: "0 0 28px", maxWidth: align === "center" ? 720 : undefined, marginLeft: align === "center" ? "auto" : undefined, marginRight: align === "center" ? "auto" : undefined }}>
            {p.sectionDescription}
          </p>
        )}
        <div className="pb-gal-grid" style={isMasonry ? {} : { display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, rowGap, columnGap: colGap }}>
          {items.map((it, i) => it.url
            ? (
              <div key={i} className="pb-gal-cell">
                <div className="pb-gal-item">
                  <img src={it.url} alt={it.alt || ""} style={imgStyle} />
                </div>
                {showCaption && it.caption && (
                  <div style={{ fontSize: 13, color: captionColor, marginTop: 6, textAlign: align }}>{it.caption}</div>
                )}
              </div>
            )
            : (
              <div key={i} className="pb-gal-cell pb-gal-item" style={{ width: "100%", aspectRatio: effectiveAR === "auto" ? "1/1" : effectiveAR, background: "#f1f5f9", border: "2px dashed #cbd5e1", borderRadius: br, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
            )
          )}
        </div>
      </div>
    </SectionCanvasWrap>
  );
}

// Carousel: optional marquee bar + heading + product/card grid.
// Supports two data sources: "manual" (hand-crafted items) and "shopify" (live products).
function SectionCarouselContent({ p }: { p: any }) {
  const items: any[] = Array.isArray(p.items) ? p.items : [];
  const cols = p.cardCount ?? 3;
  const accentColor = p.accentColor || "#005bd3";
  const showPrice   = p.showPrice !== false;
  const showBadge   = p.showBadge !== false;
  const cardRadius  = p.cardRadius ?? 12;
  const imgRatio    = p.imgRatio || "4/3";
  return (
    <div>
      {p.showMarquee !== false && (
        <div style={{ background: p.marqueeBg || "#1a1a1a", padding: "10px 0", overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 40, color: p.marqueeColor || "#fff", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", padding: "0 24px" }}>
            {Array.from({ length: 3 }).map((_, i) => <span key={i}>{p.marqueeText || "Announcement · "}</span>)}
          </div>
        </div>
      )}
      <SectionCanvasWrap props={p}>
        {p.sectionTitle && <SectionHeading title={p.sectionTitle} />}
        <SecGrid cols={cols} gap={20}>
          {items.map((it, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #eef2f7", borderRadius: cardRadius, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", position: "relative" }}>
              {showBadge && it.badge && (
                <span style={{ position: "absolute", top: 10, left: 10, zIndex: 1, background: accentColor, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>{it.badge}</span>
              )}
              {it.imageUrl
                ? <img src={it.imageUrl} alt={it.imageAlt || it.title || ""} style={{ width: "100%", aspectRatio: imgRatio, objectFit: "cover", display: "block" }} />
                : <div style={{ width: "100%", aspectRatio: imgRatio, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                  </div>}
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{it.title || "Card title"}</div>
                {showPrice && it.price && (
                  <div style={{ fontSize: 14, fontWeight: 600, color: accentColor, marginBottom: 8 }}>
                    {it.currency || "$"}{it.price}
                  </div>
                )}
                {it.text && <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5, margin: "0 0 12px" }}>{it.text}</p>}
                {it.buttonLabel && <a href={it.buttonUrl || "#"} style={{ display: "inline-block", color: accentColor, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>{it.buttonLabel} →</a>}
              </div>
            </div>
          ))}
        </SecGrid>
      </SectionCanvasWrap>
    </div>
  );
}

// Product picker sub-component used inside the Carousel section fields.
function ProductPicker({ items, onChange, cardCount, accentColor }: { items: any[]; onChange: (v: any[]) => void; cardCount: number; accentColor: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedIds = new Set(items.map((it: any) => it.id).filter(Boolean));

  const search = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?first=20&q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setResults(json.products || []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { search(""); }, []);

  const toggle = (prod: any) => {
    if (selectedIds.has(prod.id)) {
      onChange(items.filter((it: any) => it.id !== prod.id));
    } else {
      onChange([...items, {
        id: prod.id,
        title: prod.title,
        imageUrl: prod.imageUrl,
        imageAlt: prod.imageAlt,
        price: prod.price,
        currency: prod.currency,
        buttonLabel: "Shop Now",
        buttonUrl: `/products/${prod.handle}`,
        text: "",
        badge: "",
      }]);
    }
  };

  const moveUp = (i: number) => { if (i === 0) return; const next = [...items]; [next[i-1], next[i]] = [next[i], next[i-1]]; onChange(next); };
  const moveDown = (i: number) => { if (i >= items.length-1) return; const next = [...items]; [next[i], next[i+1]] = [next[i+1], next[i]]; onChange(next); };
  const remove = (i: number) => onChange(items.filter((_: any, idx: number) => idx !== i));

  const inputStyle: React.CSSProperties = { width: "100%", padding: "7px 10px", fontSize: 12, border: "1px solid #d1d5db", borderRadius: 6, outline: "none", boxSizing: "border-box", marginBottom: 8 };
  const chipStyle = (selected: boolean): React.CSSProperties => ({ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6, border: `1px solid ${selected ? accentColor : "#e5e7eb"}`, background: selected ? `${accentColor}10` : "#fff", cursor: "pointer", marginBottom: 6, fontSize: 12 });

  return (
    <div>
      {/* Selected products list */}
      {items.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Selected ({items.length})</div>
          {items.map((it: any, i: number) => (
            <div key={it.id || i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#f9fafb", marginBottom: 4 }}>
              {it.imageUrl && <img src={it.imageUrl} alt="" style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />}
              <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.title}</span>
              {it.price && <span style={{ fontSize: 11, color: "#6b7280", flexShrink: 0 }}>{it.currency}{it.price}</span>}
              <button onClick={() => moveUp(i)} title="Move up" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#6b7280", padding: "0 2px" }}>↑</button>
              <button onClick={() => moveDown(i)} title="Move down" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#6b7280", padding: "0 2px" }}>↓</button>
              <button onClick={() => remove(i)} title="Remove" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#ef4444", padding: "0 2px", lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Add Products</div>
      <input
        style={inputStyle}
        placeholder="Search products…"
        value={query}
        onChange={(e: any) => { setQuery(e.target.value); search(e.target.value); }}
      />
      {loading && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Searching…</div>}
      <div style={{ maxHeight: 220, overflowY: "auto", borderRadius: 6, border: "1px solid #e5e7eb", padding: 6 }}>
        {results.length === 0 && !loading && <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: 12 }}>No products found</div>}
        {(results as any[]).map((prod: any) => {
          const selected = selectedIds.has(prod.id);
          return (
            <div key={prod.id} style={chipStyle(selected)} onClick={() => toggle(prod)}>
              {prod.imageUrl
                ? <img src={prod.imageUrl} alt="" style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                : <div style={{ width: 32, height: 32, background: "#f1f5f9", borderRadius: 4, flexShrink: 0 }} />}
              <span style={{ flex: 1, fontWeight: selected ? 700 : 400, color: selected ? accentColor : "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prod.title}</span>
              {prod.price && <span style={{ fontSize: 11, color: "#6b7280", flexShrink: 0 }}>{prod.currency}{prod.price}</span>}
              <span style={{ fontSize: 14, color: selected ? accentColor : "#9ca3af", flexShrink: 0 }}>{selected ? "✓" : "+"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Media Carousel: heading + large main image + thumbnail strip.
function SectionMediaCarouselContent({ p }: { p: any }) {
  const items: any[] = Array.isArray(p.items) ? p.items : [];
  const main = items.find((it) => it.url) || items[0] || {};
  return (
    <SectionCanvasWrap props={p}>
      {p.showHeading !== false && <SectionHeading title={p.sectionTitle} subtitle={p.sectionSubtitle} />}
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {main.url
          ? <img src={main.url} alt={main.alt || ""} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: 12, display: "block" }} />
          : <div style={{ width: "100%", aspectRatio: "16/9", background: "#f1f5f9", border: "2px dashed #cbd5e1", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 36 }}>🎞</div>}
        {p.showDots !== false && items.length > 1 && (
          <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {items.map((it, i) => (
              <div key={i} style={{ width: 64, height: 44, borderRadius: 6, overflow: "hidden", border: "1px solid #e5e7eb", background: "#f1f5f9", flexShrink: 0 }}>
                {it.url ? <img src={it.url} alt={it.alt || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionCanvasWrap>
  );
}

function SectionAboutContent({ p }: { p: any }) {
  const imageRight = p.imagePosition === "right";
  const align = (p.textAlign ?? "text-left").replace("text-", "") as "left" | "center" | "right";
  const itemsAlign = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";

  const textCol = (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: itemsAlign, textAlign: align }}>
      {p.badge && (
        <span style={{ display: "inline-block", background: p.badgeBg || p.buttonBg || "#005bd3", color: p.badgeColor || "#fff", fontSize: p.badgeFontSize ?? 12, fontWeight: Number(p.badgeFontWeight ?? 700), fontFamily: fontFam(p.badgeFontFamily), padding: "3px 12px", borderRadius: 4, marginBottom: 16, letterSpacing: "0.04em" }}>
          {p.badge}
        </span>
      )}
      {p.subtitle && (
        <p style={{ fontSize: p.subtitleFontSize ?? 13, fontWeight: Number(p.subtitleFontWeight ?? 700), fontFamily: fontFam(p.subtitleFontFamily), textTransform: "uppercase", letterSpacing: "0.06em", color: p.subtitleColor || p.buttonBg || "#005bd3", margin: "0 0 8px" }}>
          {p.subtitle}
        </p>
      )}
      {p.title && (
        <h2 style={{ fontSize: p.titleFontSize ? `${p.titleFontSize}px` : "clamp(1.5rem,3vw,2.25rem)", fontWeight: Number(p.titleFontWeight ?? 800), fontFamily: fontFam(p.titleFontFamily), color: p.titleColor || "#111827", lineHeight: 1.2, margin: "0 0 16px" }}>
          {p.title}
        </h2>
      )}
      {p.description && (
        <div style={{ fontSize: p.descFontSize ? `${p.descFontSize}px` : "1rem", fontWeight: Number(p.descFontWeight ?? 400), fontFamily: fontFam(p.descFontFamily), color: p.textColor || "#6b7280", lineHeight: 1.7, margin: "0 0 24px" }}>
          {String(p.description).split(/\n\n+/).map((para: string, i: number) => (
            // Weight repeated on the <p> so a theme/global `p` rule can't override it.
            <p key={i} style={{ margin: i === 0 ? "0 0 1em" : "1em 0", fontWeight: Number(p.descFontWeight ?? 400) }}>
              {para.split(/\n/).map((line: string, j: number, arr: string[]) => (
                <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
              ))}
            </p>
          ))}
        </div>
      )}
      {p.buttonLabel && (
        <a href={p.buttonUrl || "#"} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", background: p.buttonBg || "#005bd3", color: p.buttonTextColor || "#fff", padding: "12px 28px", borderRadius: 6, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
          {p.buttonLabel}
        </a>
      )}
    </div>
  );

  const imageCol = p.imageUrl ? (
    <img src={p.imageUrl} alt={p.imageAlt || ""} style={{ width: "100%", borderRadius: 8, objectFit: "cover", maxHeight: 420, display: "block" }} />
  ) : (
    <div style={{ width: "100%", minHeight: 280, background: "#f1f5f9", borderRadius: 8, border: "2px dashed #cbd5e1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#94a3b8" }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      <span style={{ fontSize: 13, fontWeight: 600 }}>Upload image</span>
      <span style={{ fontSize: 11 }}>Set in Content → Image</span>
    </div>
  );

  // On mobile the grid stacks to one column; control whether the image sits
  // above (Top) or below (Bottom) the text via flex order on the mobile layout.
  const mobileImageBottom = (p.imagePositionMobile ?? "top") === "bottom";
  const gridClass = "pb-sec-about-grid" + (mobileImageBottom ? " pb-about-img-bottom" : "");

  return (
    <SectionCanvasWrap props={p}>
      <div className={gridClass} style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "clamp(24px,4vw,48px)", alignItems: "center" }}>
        {imageRight
          ? <><div className="pb-about-text">{textCol}</div><div className="pb-about-img">{imageCol}</div></>
          : <><div className="pb-about-img">{imageCol}</div><div className="pb-about-text">{textCol}</div></>}
      </div>
    </SectionCanvasWrap>
  );
}

// ─── Base defaultProps shared by section templates ────────────────────────────

function baseSectionProps(overrides: Record<string, unknown> = {}) {
  return {
    contentWidth: "boxed", containerWidth: 1140, minHeightPx: 0,
    columns: 1, columnsTablet: 1, columnsMobile: 1, columnGapPx: 32, rowGapPx: 32,
    bgType: "none", bgColor: "", bgGrad1: "", bgGrad2: "", bgGradDir: "to bottom", bgGradAngle: 180,
    bgImage: "", bgSize: "cover", bgPos: "center center", bgRepeat: "no-repeat", bgFixed: false,
    overlayType: "none", overlayColor: "#000000", overlayOpacity: 50,
    bgVideo: "", bgVideoLoop: true, bgVideoMute: true,
    borderStyle: "none", borderWidth: 1, borderColor: "", borderRadius: 0,
    advMargin: { top: 0, right: 0, bottom: 0, left: 0 },
    advPadding: { top: 60, right: 0, bottom: 60, left: 0 },
    hideDesktop: false, hideTablet: false, hideMobile: false, responsiveSpacing: {},
    animation: "none", animDuration: 600, animDelay: 0,
    cssId: "", cssClass: "", zIndex: null,
    ...overrides,
  };
}

// ─── Typography option lists (shared by About template) ──────────────────────
const FONT_FAMILY_OPTIONS = [
  { value: "inherit", label: "Theme Default" },
  { value: "Arial, Helvetica, sans-serif", label: "Arial" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Courier New', monospace", label: "Courier New" },
  { value: "Impact, sans-serif", label: "Impact" },
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Poppins, sans-serif", label: "Poppins" },
  { value: "'Roboto Serif', serif", label: "Roboto Serif" },
  { value: "'New York', 'New York Small', 'Times New Roman', serif", label: "New York" },
  { value: "'Open Sans', sans-serif", label: "Open Sans" },
];
const FONT_WEIGHT_OPTIONS = [
  { value: "300", label: "Light" },
  { value: "400", label: "Normal" },
  { value: "600", label: "Semi Bold" },
  { value: "700", label: "Bold" },
  { value: "900", label: "Black" },
];

// Resolve a font-family prop to a CSS value (inherit → undefined so it cascades).
function fontFam(v: any): string | undefined {
  return v && v !== "inherit" ? v : undefined;
}

// ─── Section Template Components ─────────────────────────────────────────────

export const sectionTemplateConfig: Record<string, any> = {

  // ── Hero ──────────────────────────────────────────────────────────────────
  Section_Hero: {
    label: "Hero",
    fields: makeSectionFields("Section_Hero", (p, set) => (
      <>
        <TabSection title="Content" />
        <StackedTextField label="Badge" value={p.badge ?? ""} onChange={(v) => set("badge", v)} placeholder="e.g. New · Sale · Featured" />
        <StackedTextField label="Headline" value={p.title ?? ""} onChange={(v) => set("title", v)} placeholder="Your Page Headline" />
        <StackedTextField label="Subtext" value={p.subtitle ?? ""} onChange={(v) => set("subtitle", v)} placeholder="Short supporting tagline" />
        <TabSection title="Primary Button" />
        <StackedTextField label="Label" value={p.primaryLabel ?? ""} onChange={(v) => set("primaryLabel", v)} placeholder="Get Started" />
        <LinkUrlField label="URL" value={p.primaryUrl ?? ""} onChange={(v) => set("primaryUrl", v)} />
        <TabSection title="Secondary Button" />
        <StackedTextField label="Label" value={p.secondaryLabel ?? ""} onChange={(v) => set("secondaryLabel", v)} placeholder="Learn More (leave blank to hide)" />
        <LinkUrlField label="URL" value={p.secondaryUrl ?? ""} onChange={(v) => set("secondaryUrl", v)} />
        <TabSection title="Image" />
        <ImageField label="Hero Image" value={p.imageUrl ?? ""} onChange={(v) => set("imageUrl", v)} />
        <StackedTextField label="Alt Text" value={p.imageAlt ?? ""} onChange={(v) => set("imageAlt", v)} placeholder="Describe the image" />
        <TabSection title="Layout" />
        <InlineSelect label="Layout" value={p.heroLayout ?? "split"} onChange={(v) => set("heroLayout", v)}
          options={[{ value: "split", label: "Text + Image" }, { value: "centered", label: "Centered" }, { value: "image-bg", label: "Image Background" }]} />
        <AlignField label="Text Align" value={p.alignment ?? "text-left"} onChange={(v) => set("alignment", v)} />
        {p.heroLayout === "image-bg" && (
          <SliderNumberField label="Overlay Opacity" value={p.overlayOpacity ?? 40} onChange={(v) => set("overlayOpacity", v)} min={0} max={90} step={5} unit="%" />
        )}
      </>
    )),
    defaultProps: baseSectionProps({
      columns: 1, columnsTablet: 1,
      advPadding: { top: 80, right: 0, bottom: 80, left: 0 },
      badge: "",
      title: "Your Headline Here",
      subtitle: "A short tagline that explains your value proposition",
      primaryLabel: "Get Started",  primaryUrl: "#",
      secondaryLabel: "Learn More", secondaryUrl: "#",
      imageUrl: "", imageAlt: "Hero image",
      alignment: "text-left",
      heroLayout: "split",
      overlayOpacity: 40,
    }),
    render: (p: any) => {
      const layout = p.heroLayout ?? "split";
      const align = (p.alignment ?? "text-left").replace("text-", "") as "left" | "center" | "right";
      const justifyContent = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
      const isCentered = layout === "centered";
      const isBg = layout === "image-bg" && !!p.imageUrl;

      const outerStyle: React.CSSProperties = {
        position: "relative",
        overflow: "hidden",
        padding: `${p.advPadding?.top ?? 80}px ${p.advPadding?.right ?? 0}px ${p.advPadding?.bottom ?? 80}px ${p.advPadding?.left ?? 0}px`,
        backgroundColor: isBg ? "#111827" : (p.bgType === "color" ? p.bgColor || "#ffffff" : "#ffffff"),
        backgroundImage: isBg ? `url("${p.imageUrl}")` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxSizing: "border-box" as const,
        minHeight: p.minHeightPx > 0 ? p.minHeightPx : undefined,
      };

      const overlayStyle: React.CSSProperties = isBg ? {
        position: "absolute", inset: 0,
        backgroundColor: `rgba(0,0,0,${(p.overlayOpacity ?? 40) / 100})`,
        zIndex: 0,
      } : {};

      const textColor = isBg ? "#ffffff" : "#111827";
      const subtitleColor = isBg ? "rgba(255,255,255,0.85)" : "#6b7280";

      const textBlock = (
        <div style={{ position: "relative", zIndex: 1, textAlign: align, maxWidth: isCentered ? 720 : "100%", margin: isCentered ? "0 auto" : undefined }}>
          {p.badge && (
            <span style={{ display: "inline-block", background: "#005bd3", color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 4, marginBottom: 16, letterSpacing: "0.04em" }}>
              {p.badge}
            </span>
          )}
          <h1 style={{ fontSize: "clamp(1.75rem,4vw,3rem)", fontWeight: 800, color: textColor, lineHeight: 1.2, margin: "0 0 16px" }}>
            {p.title || "Your Headline Here"}
          </h1>
          {p.subtitle && (
            <p style={{ fontSize: "1.1rem", color: subtitleColor, lineHeight: 1.6, margin: "0 0 32px", maxWidth: 560, marginLeft: align === "center" ? "auto" : undefined, marginRight: align === "right" || align === "center" ? "auto" : undefined }}>
              {p.subtitle}
            </p>
          )}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent }}>
            {p.primaryLabel && (
              <a href={p.primaryUrl || "#"} style={{ display: "inline-block", background: "#005bd3", color: "#fff", padding: "12px 28px", borderRadius: 6, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
                {p.primaryLabel}
              </a>
            )}
            {p.secondaryLabel && (
              <a href={p.secondaryUrl || "#"} style={{ display: "inline-block", background: "transparent", color: isBg ? "#fff" : "#005bd3", padding: "12px 28px", borderRadius: 6, fontWeight: 600, fontSize: 15, textDecoration: "none", border: `2px solid ${isBg ? "rgba(255,255,255,0.6)" : "#005bd3"}` }}>
                {p.secondaryLabel}
              </a>
            )}
          </div>
        </div>
      );

      const imageBlock = p.imageUrl && !isBg ? (
        <div style={{ position: "relative", zIndex: 1, flex: "0 0 auto" }}>
          <img src={p.imageUrl} alt={p.imageAlt || ""} style={{ width: "100%", maxWidth: 520, borderRadius: 12, objectFit: "cover", display: "block" }} />
        </div>
      ) : null;

      const imagePlaceholder = !p.imageUrl && layout === "split" ? (
        <div style={{ flex: "0 0 auto", width: "100%", maxWidth: 520, minHeight: 300, background: "#f1f5f9", borderRadius: 12, border: "2px dashed #cbd5e1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#94a3b8" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Upload hero image</span>
          <span style={{ fontSize: 11 }}>Set in Content → Hero Image</span>
        </div>
      ) : null;

      if (isBg) {
        return (
          <div style={outerStyle}>
            <div style={overlayStyle} />
            <div style={{ position: "relative", zIndex: 1, maxWidth: 1140, margin: "0 auto", padding: "0 24px", boxSizing: "border-box" }}>
              {textBlock}
            </div>
          </div>
        );
      }

      if (isCentered) {
        return (
          <div style={outerStyle}>
            <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px", boxSizing: "border-box" }}>
              {textBlock}
            </div>
          </div>
        );
      }

      // Split layout
      return (
        <div style={outerStyle}>
          <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px", boxSizing: "border-box", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            {textBlock}
            {imageBlock || imagePlaceholder}
          </div>
        </div>
      );
    },
  },

  // ── About ─────────────────────────────────────────────────────────────────
  Section_About: {
    label: "About",
    fields: {
      _tabs: {
        type: "custom" as const,
        label: "",
        render: (_: any) => {
          const { selectedItem, appState, dispatch } = usePuck();
          const p = selectedItem?.props ?? {};
          const set = makeSectionSet(dispatch, selectedItem, appState);
          return (
            <BlockTabBar blockKey="Section_About">
              {(tab) => (
                <>
                  {/* ── CONTENT TAB ── */}
                  {tab === "content" && (
                    <>
                      <TabSection title="Content" />
                      <StackedTextField label="Badge" value={p.badge ?? ""} onChange={(v) => set("badge", v)} placeholder="About Us (leave blank to hide)" />
                      <StackedTextField label="Heading" value={p.title ?? ""} onChange={(v) => set("title", v)} placeholder="Who We Are" />
                      <StackedTextField label="Subheading" value={p.subtitle ?? ""} onChange={(v) => set("subtitle", v)} placeholder="Our story and mission" />
                      <StackedTextareaField label="Description" value={p.description ?? ""} onChange={(v) => set("description", v)} placeholder="A few sentences about your company…" />
                      <StackedTextField label="Button Label" value={p.buttonLabel ?? ""} onChange={(v) => set("buttonLabel", v)} placeholder="Learn More" />
                      {!(p.buttonLabel ?? "").trim() && (p.buttonUrl ?? "").trim() && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "-2px 0 8px", color: "#d72c0d", fontSize: 12, fontWeight: 500 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          Button label is empty
                        </div>
                      )}
                      <LinkUrlField label="Button URL" value={p.buttonUrl ?? ""} onChange={(v) => set("buttonUrl", v)} />
                      <ImageField label="Image" value={p.imageUrl ?? ""} onChange={(v) => set("imageUrl", v)} />
                      <StackedTextField label="Alt Text" value={p.imageAlt ?? ""} onChange={(v) => set("imageAlt", v)} placeholder="About image" />
                      <InlineSelect label="Image Position (Desktop)" value={p.imagePosition ?? "left"} onChange={(v) => set("imagePosition", v)}
                        options={[{ value: "left", label: "Left" }, { value: "right", label: "Right" }]} />
                      <InlineSelect label="Image Position (Mobile)" value={p.imagePositionMobile ?? "top"} onChange={(v) => set("imagePositionMobile", v)}
                        options={[{ value: "top", label: "Top" }, { value: "bottom", label: "Bottom" }]} />
                    </>
                  )}

                  {/* ── STYLE TAB ── */}
                  {tab === "style" && (
                    <>
                      <TabSection title="Badge" />
                      <ColorPickerField label="Text Color" value={p.badgeColor ?? ""} onChange={(v) => set("badgeColor", v)} />
                      <ColorPickerField label="Badge Color" value={p.badgeBg ?? ""} onChange={(v) => set("badgeBg", v)} />
                      <SliderNumberField label="Font Size" value={p.badgeFontSize ?? 12} onChange={(v) => set("badgeFontSize", v)} min={8} max={48} step={1} unit="px" />
                      <InlineSelect label="Font Family" value={p.badgeFontFamily ?? "inherit"} onChange={(v) => { set("badgeFontFamily", v); loadGoogleFont(v); }} options={FONT_FAMILY_OPTIONS} />
                      <InlineSelect label="Font Weight" value={String(p.badgeFontWeight ?? "700")} onChange={(v) => set("badgeFontWeight", v)} options={FONT_WEIGHT_OPTIONS} />

                      <TabSection title="Heading" />
                      <ColorPickerField label="Color" value={p.titleColor ?? ""} onChange={(v) => set("titleColor", v)} />
                      <SliderNumberField label="Font Size" value={p.titleFontSize ?? 36} onChange={(v) => set("titleFontSize", v)} min={10} max={120} step={1} unit="px" />
                      <InlineSelect label="Font Family" value={p.titleFontFamily ?? "inherit"} onChange={(v) => { set("titleFontFamily", v); loadGoogleFont(v); }} options={FONT_FAMILY_OPTIONS} />
                      <InlineSelect label="Font Weight" value={String(p.titleFontWeight ?? "800")} onChange={(v) => set("titleFontWeight", v)} options={FONT_WEIGHT_OPTIONS} />

                      <TabSection title="Subheading" />
                      <ColorPickerField label="Color" value={p.subtitleColor ?? ""} onChange={(v) => set("subtitleColor", v)} />
                      <SliderNumberField label="Font Size" value={p.subtitleFontSize ?? 13} onChange={(v) => set("subtitleFontSize", v)} min={8} max={48} step={1} unit="px" />
                      <InlineSelect label="Font Family" value={p.subtitleFontFamily ?? "inherit"} onChange={(v) => { set("subtitleFontFamily", v); loadGoogleFont(v); }} options={FONT_FAMILY_OPTIONS} />
                      <InlineSelect label="Font Weight" value={String(p.subtitleFontWeight ?? "700")} onChange={(v) => set("subtitleFontWeight", v)} options={FONT_WEIGHT_OPTIONS} />

                      <TabSection title="Description" />
                      <ColorPickerField label="Color" value={p.textColor ?? ""} onChange={(v) => set("textColor", v)} />
                      <SliderNumberField label="Font Size" value={p.descFontSize ?? 16} onChange={(v) => set("descFontSize", v)} min={10} max={48} step={1} unit="px" />
                      <InlineSelect label="Font Family" value={p.descFontFamily ?? "inherit"} onChange={(v) => { set("descFontFamily", v); loadGoogleFont(v); }} options={FONT_FAMILY_OPTIONS} />
                      <InlineSelect label="Font Weight" value={String(p.descFontWeight ?? "400")} onChange={(v) => set("descFontWeight", v)} options={FONT_WEIGHT_OPTIONS} />

                      <TabSection title="Text" />
                      <AlignField label="Alignment" value={p.textAlign ?? "text-left"} onChange={(v) => set("textAlign", v)} />

                      <SectionStyleFields props={p} set={set} />
                    </>
                  )}

                  {/* ── ADVANCED TAB ── */}
                  {tab === "advanced" && (
                    <>
                      <TabSection title="Layout" />
                      <InlineSelect label="Content Width" value={p.contentWidth ?? "boxed"} onChange={(v) => set("contentWidth", v)}
                        options={[{ value: "boxed", label: "Boxed" }, { value: "full", label: "Full Width" }]} />
                      {p.contentWidth === "boxed" && <SliderNumberField label="Max Width" value={p.containerWidth ?? 1140} onChange={(v) => set("containerWidth", v)} min={320} max={1920} step={10} unit="PX" />}
                      <SliderNumberField label="Min Height" value={p.minHeightPx ?? 0} onChange={(v) => set("minHeightPx", v)} min={0} max={1200} step={10} unit="PX" />

                      <TabSection title="Spacing" />
                      <FourSideField label="Padding (px)" value={p.advPadding ?? { top: 80, right: 0, bottom: 80, left: 0 }} onChange={(v) => set("advPadding", v)} />

                      <TabSection title="Responsive" />
                      <ToggleField label="Hide on Desktop" value={!!p.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                      <ToggleField label="Hide on Tablet" value={!!p.hideTablet} onChange={(v) => set("hideTablet", v)} />
                      <ToggleField label="Hide on Mobile" value={!!p.hideMobile} onChange={(v) => set("hideMobile", v)} />

                      <TabSection title="Animation" />
                      <InlineSelect label="Entrance" value={p.animation ?? "none"} onChange={(v) => set("animation", v)}
                        options={[{ value: "none", label: "None" }, { value: "fadeIn", label: "Fade In" }, { value: "fadeInUp", label: "Fade In Up" }, { value: "fadeInDown", label: "Fade In Down" }, { value: "slideInLeft", label: "Slide In Left" }, { value: "slideInRight", label: "Slide In Right" }, { value: "zoomIn", label: "Zoom In" }]} />
                    </>
                  )}
                </>
              )}
            </BlockTabBar>
          );
        },
      },
    },
    defaultProps: baseSectionProps({
      columns: 2, columnsTablet: 1, advPadding: { top: 80, right: 0, bottom: 80, left: 0 },
      badge: "About Us", title: "Who We Are", subtitle: "Our story and mission",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.",
      buttonLabel: "Learn More", buttonUrl: "",
      imageUrl: "", imageAlt: "About image", imagePosition: "left", imagePositionMobile: "top",
      // Badge typography
      badgeColor: "#ffffff", badgeBg: "#005bd3", badgeFontSize: 12, badgeFontFamily: "inherit", badgeFontWeight: "700",
      // Heading typography
      titleColor: "#111827", titleFontSize: 36, titleFontFamily: "inherit", titleFontWeight: "800",
      // Subheading typography
      subtitleColor: "#005bd3", subtitleFontSize: 13, subtitleFontFamily: "inherit", subtitleFontWeight: "700",
      // Description typography
      textColor: "#6b7280", descFontSize: 16, descFontFamily: "inherit", descFontWeight: "400",
      textAlign: "text-left",
      buttonBg: "#005bd3", buttonTextColor: "#ffffff",
    }),
    render: (p: any) => <SectionAboutContent p={p} />,
  },

  // ── Gallery ───────────────────────────────────────────────────────────────
  Section_Gallery: {
    label: "Gallery",
    fields: {
      _tabs: {
        type: "custom" as const,
        label: "",
        render: (_: any) => {
          const { selectedItem, appState, dispatch } = usePuck();
          const p = selectedItem?.props ?? {};
          const set = makeSectionSet(dispatch, selectedItem, appState);
          return (
            <BlockTabBar blockKey="Section_Gallery">
              {(tab) => (
                <>
                  {/* ── CONTENT TAB ── */}
                  {tab === "content" && (
                    <>
                      <TabSection title="Title" />
                      <ToggleField label="Show Title" value={p.showHeading !== false} onChange={(v) => set("showHeading", v)} />
                      {p.showHeading !== false && (
                        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Our Gallery" />
                      )}

                      <TabSection title="Description" />
                      <ToggleField label="Show Description" value={!!p.showDescription} onChange={(v) => set("showDescription", v)} />
                      {!!p.showDescription && (
                        <StackedTextareaField label="Description" value={p.sectionDescription ?? ""} onChange={(v) => set("sectionDescription", v)} placeholder="A short paragraph about the gallery…" />
                      )}

                      <TabSection title="Text" />
                      <AlignField label="Alignment" value={p.textAlign ?? "text-center"} onChange={(v) => set("textAlign", v)} />

                      <TabSection title="Gallery Items" />
                      <GalleryItemsField
                        items={p.items}
                        onChange={(v) => set("items", v)}
                        max={36}
                      />
                    </>
                  )}

                  {/* ── STYLE TAB ── */}
                  {tab === "style" && (
                    <>
                      <TabSection title="Heading" />
                      <ColorPickerField label="Color" value={p.headingColor ?? ""} onChange={(v) => set("headingColor", v)} />
                      <SliderNumberField label="Font Size" value={p.headingFontSize ?? 36} onChange={(v) => set("headingFontSize", v)} min={14} max={80} step={1} unit="px" />
                      <InlineSelect label="Font Family" value={p.headingFontFamily ?? "inherit"} onChange={(v) => { set("headingFontFamily", v); loadGoogleFont(v); }} options={FONT_FAMILY_OPTIONS} />
                      <InlineSelect label="Font Weight" value={String(p.headingFontWeight ?? "800")} onChange={(v) => set("headingFontWeight", v)} options={FONT_WEIGHT_OPTIONS} />

                      <TabSection title="Description" />
                      <ColorPickerField label="Color" value={p.descriptionColor ?? ""} onChange={(v) => set("descriptionColor", v)} />
                      <SliderNumberField label="Font Size" value={p.descFontSize ?? 16} onChange={(v) => set("descFontSize", v)} min={12} max={40} step={1} unit="px" />
                      <InlineSelect label="Font Family" value={p.descFontFamily ?? "inherit"} onChange={(v) => { set("descFontFamily", v); loadGoogleFont(v); }} options={FONT_FAMILY_OPTIONS} />
                      <InlineSelect label="Font Weight" value={String(p.descFontWeight ?? "400")} onChange={(v) => set("descFontWeight", v)} options={FONT_WEIGHT_OPTIONS} />

                      <TabSection title="Gallery" />
                      <InlineSelect label="Layout" value={p.layoutType ?? "grid"} onChange={(v) => set("layoutType", v)}
                        options={[{ value: "grid", label: "Grid" }, { value: "masonry", label: "Masonry" }]} />
                      <InlineSelect label="Aspect Ratio" value={p.aspectRatio ?? "square"} onChange={(v) => set("aspectRatio", v)}
                        options={[{ value: "square", label: "Square" }, { value: "landscape", label: "Landscape" }, { value: "portrait", label: "Portrait" }, { value: "original", label: "Auto" }]} />
                      <InlineSelect label="Object Fit" value={p.objectFit ?? "cover"} onChange={(v) => set("objectFit", v)}
                        options={[{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "fill", label: "Fill" }]} />
                      <InlineSelect label="Hover Effect" value={p.hoverEffect ?? "none"} onChange={(v) => set("hoverEffect", v)}
                        options={[{ value: "none", label: "None" }, { value: "zoom", label: "Zoom" }, { value: "fade", label: "Fade" }]} />
                      <ToggleField label="Show Caption" value={!!p.showCaption} onChange={(v) => set("showCaption", v)} />
                      {!!p.showCaption && (
                        <ColorPickerField label="Caption Color" value={p.captionColor ?? "#6b7280"} onChange={(v) => set("captionColor", v)} />
                      )}
                      <SliderNumberField label="Border Radius" value={p.imageBorderRadius ?? 8} onChange={(v) => set("imageBorderRadius", v)} min={0} max={60} step={1} unit="px" />
                      <ToggleField label="Image Shadow" value={!!p.imageShadow} onChange={(v) => set("imageShadow", v)} />

                      <SectionStyleFields props={p} set={set} />
                    </>
                  )}

                  {/* ── ADVANCED TAB ── */}
                  {tab === "advanced" && (
                    <>
                      <TabSection title="Layout" />
                      <InlineSelect label="Content Width" value={p.contentWidth ?? "boxed"} onChange={(v) => set("contentWidth", v)}
                        options={[{ value: "boxed", label: "Boxed" }, { value: "full", label: "Full Width" }]} />
                      {p.contentWidth === "boxed" && <SliderNumberField label="Max Width" value={p.containerWidth ?? 1140} onChange={(v) => set("containerWidth", v)} min={320} max={1920} step={10} unit="PX" />}
                      <SliderNumberField label="Min Height" value={p.minHeightPx ?? 0} onChange={(v) => set("minHeightPx", v)} min={0} max={1200} step={10} unit="PX" />

                      <TabSection title="Spacing" />
                      <FourSideField label="Padding (px)" value={p.advPadding ?? { top: 60, right: 0, bottom: 60, left: 0 }} onChange={(v) => set("advPadding", v)} />

                      <TabSection title="Responsive" />
                      <ToggleField label="Hide on Desktop" value={!!p.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                      <ToggleField label="Hide on Tablet" value={!!p.hideTablet} onChange={(v) => set("hideTablet", v)} />
                      <ToggleField label="Hide on Mobile" value={!!p.hideMobile} onChange={(v) => set("hideMobile", v)} />

                      <TabSection title="Animation" />
                      <InlineSelect label="Entrance" value={p.animation ?? "none"} onChange={(v) => set("animation", v)}
                        options={[{ value: "none", label: "None" }, { value: "fadeIn", label: "Fade In" }, { value: "fadeInUp", label: "Fade In Up" }, { value: "fadeInDown", label: "Fade In Down" }, { value: "slideInLeft", label: "Slide In Left" }, { value: "slideInRight", label: "Slide In Right" }, { value: "zoomIn", label: "Zoom In" }]} />
                    </>
                  )}
                </>
              )}
            </BlockTabBar>
          );
        },
      },
    },
    defaultProps: baseSectionProps({
      advPadding: { top: 60, right: 0, bottom: 60, left: 0 },
      sectionTitle: "Our Gallery",
      showHeading: true,
      showDescription: false,
      sectionDescription: "",
      textAlign: "text-center",
      galleryColumns: 3,
      galleryColumnsTablet: 2,
      galleryColumnsMobile: 1,
      gap: 12,
      rowGap: 12,
      colGap: 12,
      layoutType: "grid",
      aspectRatio: "square",
      objectFit: "cover",
      hoverEffect: "none",
      showCaption: false,
      captionColor: "#6b7280",
      imageBorderRadius: 8,
      imageShadow: false,
      // Heading typography
      headingColor: "", headingFontSize: 36, headingFontFamily: "inherit", headingFontWeight: "800",
      // Description typography
      descriptionColor: "", descFontSize: 16, descFontFamily: "inherit", descFontWeight: "400",
      items: [
        { url: "", alt: "", caption: "" },
        { url: "", alt: "", caption: "" },
        { url: "", alt: "", caption: "" },
        { url: "", alt: "", caption: "" },
        { url: "", alt: "", caption: "" },
        { url: "", alt: "", caption: "" },
      ],
    }),
    render: (p: any) => <SectionGalleryContent p={p} />,
  },

  // ── Testimonial ───────────────────────────────────────────────────────────
  Section_Testimonial: {
    label: "Testimonial",
    fields: makeSectionFields("Section_Testimonial", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="What Our Customers Say" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="Real reviews from real customers" />
        <TabSection title="Reviews" />
        <AccordionItemsField items={p.items} onChange={(v) => set("items", v)} max={12} singular="Review"
          newItem={() => ({ quote: "Great experience!", author: "Customer", role: "", rating: "5", avatar: "" })}
          fields={[{ key: "quote", label: "Quote", type: "textarea", placeholder: "Their feedback…" }, { key: "author", label: "Author", placeholder: "Jane Doe" }, { key: "role", label: "Role / Company", placeholder: "CEO, Acme" }, { key: "rating", label: "Stars (1-5)", placeholder: "5" }, { key: "avatar", label: "Avatar", type: "image" }]}
          getThumb={(it: any) => (it.avatar ? <img src={it.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : <span>{"👤"}</span>)}
          getTitle={(it: any, i: number) => (it.author || "").trim() || `Review ${i + 1}`}
          getSubtitle={(it: any) => it.role || it.quote || "No quote"}
          removeNote="This review will be removed. This action cannot be undone." />
        <TabSection title="Layout" />
        <InlineSelect label="Columns" value={String(p.reviewCount ?? 3)} onChange={(v) => set("reviewCount", Number(v))} options={[{ value: "1", label: "1 (Single)" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 1, bgType: "color", bgColor: "#f8fafc", advPadding: { top: 60, right: 0, bottom: 60, left: 0 }, sectionTitle: "What Our Customers Say", sectionSubtitle: "Real reviews from real customers", reviewCount: 3,
      items: [
        { quote: "Absolutely love it. Setup was effortless and the results speak for themselves.", author: "Jamie Carter", role: "Marketing Lead", rating: "5", avatar: "" },
        { quote: "The best decision we made this year. Support is incredibly responsive.", author: "Priya Nair", role: "Founder, Bloom", rating: "5", avatar: "" },
        { quote: "Simple, powerful, and reliable. Highly recommended to any team.", author: "Marcus Hill", role: "CTO", rating: "5", avatar: "" },
      ] }),
    render: (p: any) => <SectionTestimonialContent p={p} />,
  },

  // ── Carousel ──────────────────────────────────────────────────────────────
  Section_Carousel: {
    label: "Carousel",
    fields: makeSectionFields("Section_Carousel", (p, set) => (
      <>
        <TabSection title="Marquee Bar" />
        <ToggleField label="Show Marquee Bar" value={p.showMarquee !== false} onChange={(v) => set("showMarquee", v)} />
        {p.showMarquee !== false && <><StackedTextField label="Text" value={p.marqueeText ?? ""} onChange={(v) => set("marqueeText", v)} placeholder="Announcement · " /><ColorPickerField label="Background" value={p.marqueeBg ?? "#1a1a1a"} onChange={(v) => set("marqueeBg", v)} /><ColorPickerField label="Text Color" value={p.marqueeColor ?? "#ffffff"} onChange={(v) => set("marqueeColor", v)} /></>}
        <TabSection title="Products" />
        <StackedTextField label="Section Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Featured" />
        <InlineSelect label="Data Source" value={p.dataSource ?? "shopify"} onChange={(v) => set("dataSource", v)}
          options={[{ value: "shopify", label: "Shopify Products" }, { value: "manual", label: "Manual Cards" }]} />
        <InlineSelect label="Cards Per Row" value={String(p.cardCount ?? 3)} onChange={(v) => set("cardCount", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
        {(p.dataSource ?? "shopify") === "shopify"
          ? <ProductPicker items={p.items ?? []} onChange={(v) => set("items", v)} cardCount={p.cardCount ?? 3} accentColor={p.accentColor || "#005bd3"} />
          : <SectionItemsField label="Cards" items={p.items} onChange={(v) => set("items", v)}
              newItem={() => ({ imageUrl: "", title: "New Card", text: "", buttonLabel: "Shop Now", buttonUrl: "#", badge: "" })}
              fields={[{ key: "imageUrl", label: "Image", type: "image" }, { key: "title", label: "Title", placeholder: "Card title" }, { key: "text", label: "Text", type: "textarea", placeholder: "Short text" }, { key: "buttonLabel", label: "Button Label", placeholder: "Shop Now" }, { key: "buttonUrl", label: "Button URL", type: "url" }, { key: "badge", label: "Badge", placeholder: "New · Sale" }]} />}
        <TabSection title="Card Style" />
        <ColorPickerField label="Accent Color" value={p.accentColor ?? "#005bd3"} onChange={(v) => set("accentColor", v)} />
        <SliderNumberField label="Card Corner Radius (px)" value={p.cardRadius ?? 12} onChange={(v) => set("cardRadius", v)} min={0} max={32} step={1} unit="px" />
        <InlineSelect label="Image Ratio" value={p.imgRatio ?? "4/3"} onChange={(v) => set("imgRatio", v)}
          options={[{ value: "1/1", label: "Square" }, { value: "4/3", label: "4:3" }, { value: "3/4", label: "3:4 (Portrait)" }, { value: "16/9", label: "16:9" }]} />
        <ToggleField label="Show Price" value={p.showPrice !== false} onChange={(v) => set("showPrice", v)} />
        <ToggleField label="Show Badge" value={p.showBadge !== false} onChange={(v) => set("showBadge", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 2, advPadding: { top: 60, right: 0, bottom: 60, left: 0 }, sectionTitle: "Featured", showMarquee: true, marqueeText: "Free shipping · New arrivals · Special offers · ", marqueeBg: "#1a1a1a", marqueeColor: "#ffffff", cardCount: 3, dataSource: "shopify", accentColor: "#005bd3", cardRadius: 12, imgRatio: "4/3", showPrice: true, showBadge: true,
      items: [] }),
    render: (p: any) => <SectionCarouselContent p={p} />,
  },

  // ── Contact Form ─────────────────────────────────────────────────────────
  Section_Form: {
    label: "Contact Form",
    fields: makeSectionFields("Section_Form", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Get In Touch" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="We'd love to hear from you" />
        <TabSection title="Contact Info" />
        <StackedTextField label="Address" value={p.address ?? ""} onChange={(v) => set("address", v)} placeholder="123 Main St, City" />
        <StackedTextField label="Phone" value={p.phone ?? ""} onChange={(v) => set("phone", v)} placeholder="+1 (555) 000-0000" />
        <StackedTextField label="Email" value={p.email ?? ""} onChange={(v) => set("email", v)} placeholder="hello@company.com" />
        <TabSection title="Form" />
        <StackedTextField label="Submit Button" value={p.submitLabel ?? ""} onChange={(v) => set("submitLabel", v)} placeholder="Send Message" />
        <StackedTextField label="Success Message" value={p.successMessage ?? ""} onChange={(v) => set("successMessage", v)} placeholder="Thanks! We'll be in touch." />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 2, columnsTablet: 1, advPadding: { top: 80, right: 0, bottom: 80, left: 0 }, sectionTitle: "Get In Touch", sectionSubtitle: "", address: "", phone: "", email: "", submitLabel: "Send Message", successMessage: "Thanks! We'll be in touch shortly." }),
    render: (p: any) => {
      const inputStyle: React.CSSProperties = { width: "100%", padding: "11px 13px", fontSize: 14, border: "1px solid #d1d5db", borderRadius: 6, outline: "none", boxSizing: "border-box", marginBottom: 12, background: "#fff" };
      return (
        <SectionCanvasWrap props={p}>
          <SectionHeading title={p.sectionTitle || "Get In Touch"} subtitle={p.sectionSubtitle} />
          <div className="pb-sec-about-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "clamp(24px,4vw,48px)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}>
              {p.address && <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}><span style={{ fontSize: 18 }}>📍</span><span style={{ color: "#374151", fontSize: 15 }}>{p.address}</span></div>}
              {p.phone && <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}><span style={{ fontSize: 18 }}>📞</span><a href={`tel:${p.phone}`} style={{ color: "#374151", fontSize: 15, textDecoration: "none" }}>{p.phone}</a></div>}
              {p.email && <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}><span style={{ fontSize: 18 }}>✉️</span><a href={`mailto:${p.email}`} style={{ color: "#374151", fontSize: 15, textDecoration: "none" }}>{p.email}</a></div>}
            </div>
            <form onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Your name" style={inputStyle} />
              <input type="email" placeholder="Your email" style={inputStyle} />
              <textarea placeholder="Your message" rows={4} style={{ ...inputStyle, resize: "vertical" }} />
              <button type="submit" style={{ background: "#005bd3", color: "#fff", padding: "12px 28px", borderRadius: 6, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>{p.submitLabel || "Send Message"}</button>
            </form>
          </div>
        </SectionCanvasWrap>
      );
    },
  },

  // ── Countdown ─────────────────────────────────────────────────────────────
  Section_Countdown: {
    label: "Countdown",
    fields: makeSectionFields("Section_Countdown", (p, set) => (
      <>
        <TabSection title="Headline" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Sale Ends In" />
        <StackedTextField label="Subtext" value={p.subtext ?? ""} onChange={(v) => set("subtext", v)} placeholder="Don't miss our biggest sale" />
        <TabSection title="CTA Button" />
        <StackedTextField label="Label" value={p.ctaLabel ?? ""} onChange={(v) => set("ctaLabel", v)} placeholder="Shop Now" />
        <StackedTextField label="URL" value={p.ctaUrl ?? ""} onChange={(v) => set("ctaUrl", v)} placeholder="#" />
        <TabSection title="Progress Bar" />
        <ToggleField label="Show Progress Bar" value={p.showProgress !== false} onChange={(v) => set("showProgress", v)} />
        {p.showProgress !== false && <>
          <StackedTextField label="Label" value={p.progressLabel ?? ""} onChange={(v) => set("progressLabel", v)} placeholder="73% sold — only 27 left" />
          <SliderNumberField label="Value (%)" value={p.progressValue ?? 73} onChange={(v) => set("progressValue", v)} min={0} max={100} step={1} unit="%" />
          <ColorPickerField label="Bar Color" value={p.progressColor ?? "#ef4444"} onChange={(v) => set("progressColor", v)} />
        </>}
      </>
    )),
    defaultProps: baseSectionProps({ columns: 1, bgType: "color", bgColor: "#0f172a", advPadding: { top: 80, right: 0, bottom: 80, left: 0 }, sectionTitle: "Sale Ends In", subtext: "Don't miss our biggest sale of the year", ctaLabel: "Shop Now", ctaUrl: "#", showProgress: true, progressLabel: "73% sold — only 27 left", progressValue: 73, progressColor: "#ef4444" }),
    render: (p: any) => {
      const onDark = p.bgType !== "color" || !p.bgColor || /^#(0|1|2|3)/.test(String(p.bgColor));
      const titleC = onDark ? "#ffffff" : "#111827";
      const subC = onDark ? "rgba(255,255,255,0.8)" : "#6b7280";
      const boxes = [["12", "Days"], ["08", "Hours"], ["45", "Mins"], ["30", "Secs"]];
      return (
        <SectionCanvasWrap props={p}>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.25rem)", fontWeight: 800, color: titleC, margin: "0 0 8px" }}>{p.sectionTitle || "Sale Ends In"}</h2>
              {p.subtext && <p style={{ fontSize: "1.05rem", color: subC, margin: 0 }}>{p.subtext}</p>}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              {boxes.map(([n, l]) => (
                <div key={l} style={{ minWidth: 78, background: onDark ? "rgba(255,255,255,0.1)" : "#f1f5f9", borderRadius: 10, padding: "14px 18px" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: titleC, lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 12, color: subC, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{l}</div>
                </div>
              ))}
            </div>
            {p.ctaLabel && <a href={p.ctaUrl || "#"} style={{ display: "inline-block", background: p.progressColor || "#ef4444", color: "#fff", padding: "12px 32px", borderRadius: 6, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>{p.ctaLabel}</a>}
            {p.showProgress !== false && <div style={{ width: "100%", maxWidth: 420, background: onDark ? "rgba(255,255,255,0.1)" : "#f1f5f9", borderRadius: 8, padding: "12px 16px" }}><div style={{ fontSize: 12, color: subC, marginBottom: 6 }}>{p.progressLabel || "73% sold"}</div><div style={{ background: onDark ? "rgba(255,255,255,0.15)" : "#e2e8f0", borderRadius: 999, height: 8, overflow: "hidden" }}><div style={{ height: "100%", width: `${p.progressValue ?? 73}%`, background: p.progressColor || "#ef4444", borderRadius: 999 }} /></div></div>}
          </div>
        </SectionCanvasWrap>
      );
    },
  },

  // ── Media Carousel ────────────────────────────────────────────────────────
  Section_MediaCarousel: {
    label: "Media Carousel",
    fields: makeSectionFields("Section_MediaCarousel", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Featured Media" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="Short description" />
        <TabSection title="Slides" />
        <AccordionItemsField items={p.items} onChange={(v) => set("items", v)} max={10} singular="Slide"
          newItem={() => ({ url: "", alt: "" })}
          fields={[{ key: "url", label: "Image", type: "image" }, { key: "alt", label: "Alt Text", placeholder: "Describe the image" }]}
          getThumb={(it: any) => (it.url ? <img src={it.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : null)}
          getTitle={(_it: any, i: number) => `Slide ${i + 1}`}
          getSubtitle={(it: any) => it.alt || (it.url ? "No alt text" : "No image selected")}
          removeNote="This slide will be removed. This action cannot be undone." />
        <ToggleField label="Show Thumbnails" value={p.showDots !== false} onChange={(v) => set("showDots", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 1, advPadding: { top: 60, right: 0, bottom: 60, left: 0 }, sectionTitle: "Featured Media", sectionSubtitle: "", showArrows: true, showDots: true,
      items: [{ url: "", alt: "" }, { url: "", alt: "" }, { url: "", alt: "" }, { url: "", alt: "" }] }),
    render: (p: any) => <SectionMediaCarouselContent p={p} />,
  },

  // ── Services ──────────────────────────────────────────────────────────────
  Section_Services: {
    label: "Services",
    fields: makeSectionFields("Section_Services", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Our Services" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="What we offer" />
        <TabSection title="Services" />
        <AccordionItemsField items={p.items} onChange={(v) => set("items", v)} max={8} singular="Service"
          newItem={() => ({ icon: "⭐", title: "New Service", text: "Describe this service." })}
          fields={[{ key: "icon", label: "Icon (emoji)", placeholder: "🔧" }, { key: "title", label: "Title", placeholder: "Service name" }, { key: "text", label: "Description", type: "textarea", placeholder: "Short description" }]}
          getThumb={(it: any) => <span>{it.icon || "⭐"}</span>}
          getTitle={(it: any, i: number) => (it.title || "").trim() || `Service ${i + 1}`}
          getSubtitle={(it: any) => it.text || "No description"}
          removeNote="This service will be removed. This action cannot be undone." />
        <TabSection title="Layout" />
        <InlineSelect label="Per Row" value={String(p.serviceCount ?? 3)} onChange={(v) => set("serviceCount", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
        <ColorPickerField label="Accent Color" value={p.accentColor ?? "#005bd3"} onChange={(v) => set("accentColor", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 1, advPadding: { top: 70, right: 0, bottom: 70, left: 0 }, sectionTitle: "Our Services", sectionSubtitle: "What we offer", serviceCount: 3, accentColor: "#005bd3",
      items: [
        { icon: "🚀", title: "Fast Delivery", text: "Get your products delivered quickly and reliably." },
        { icon: "🛡️", title: "Secure Payments", text: "Your transactions are protected with bank-level security." },
        { icon: "💬", title: "24/7 Support", text: "Our team is here to help you any time, any day." },
      ] }),
    render: (p: any) => <SectionCardsContent p={p} variant="services" />,
  },

  // ── Pricing ───────────────────────────────────────────────────────────────
  Section_Pricing: {
    label: "Pricing",
    fields: makeSectionFields("Section_Pricing", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Simple, Transparent Pricing" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="No hidden fees" />
        <TabSection title="Tiers" />
        <AccordionItemsField items={p.items} onChange={(v) => set("items", v)} max={8} singular="Tier"
          newItem={() => ({ name: "New Plan", price: "0", period: "/mo", features: "Feature one\nFeature two", buttonLabel: "Choose Plan", buttonUrl: "#", featured: "" })}
          fields={[{ key: "name", label: "Plan Name", placeholder: "Pro" }, { key: "price", label: "Price (number)", placeholder: "29" }, { key: "period", label: "Period", placeholder: "/mo" }, { key: "features", label: "Features (one per line)", type: "textarea", placeholder: "Feature one\nFeature two" }, { key: "buttonLabel", label: "Button Label", placeholder: "Choose Plan" }, { key: "buttonUrl", label: "Button URL", type: "url" }, { key: "featured", label: "Featured? (yes/blank)", placeholder: "yes" }]}
          getThumb={() => <span>{"💳"}</span>}
          getTitle={(it: any, i: number) => (it.name || "").trim() || `Tier ${i + 1}`}
          getSubtitle={(it: any) => `${it.price || "0"}${it.period || ""}`}
          removeNote="This tier will be removed. This action cannot be undone." />
        <TabSection title="Layout" />
        <InlineSelect label="Per Row" value={String(p.tierCount ?? 3)} onChange={(v) => set("tierCount", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
        <StackedTextField label="Currency" value={p.currency ?? "$"} onChange={(v) => set("currency", v)} placeholder="$" />
        <ColorPickerField label="Accent Color" value={p.accentColor ?? "#005bd3"} onChange={(v) => set("accentColor", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 1, advPadding: { top: 80, right: 0, bottom: 80, left: 0 }, sectionTitle: "Simple, Transparent Pricing", sectionSubtitle: "No hidden fees, cancel anytime", tierCount: 3, currency: "$", accentColor: "#005bd3",
      items: [
        { name: "Starter", price: "9", period: "/mo", features: "1 user\n10 projects\nEmail support", buttonLabel: "Get Started", buttonUrl: "#", featured: "" },
        { name: "Pro", price: "29", period: "/mo", features: "5 users\nUnlimited projects\nPriority support\nAdvanced analytics", buttonLabel: "Get Started", buttonUrl: "#", featured: "yes" },
        { name: "Enterprise", price: "99", period: "/mo", features: "Unlimited users\nDedicated manager\n24/7 phone support\nCustom integrations", buttonLabel: "Contact Sales", buttonUrl: "#", featured: "" },
      ] }),
    render: (p: any) => <SectionCardsContent p={p} variant="pricing" />,
  },

  // ── CTA ───────────────────────────────────────────────────────────────────
  Section_CTA: {
    label: "CTA",
    fields: makeSectionFields("Section_CTA", (p, set) => (
      <>
        <TabSection title="Content" />
        <StackedTextField label="Headline" value={p.headline ?? ""} onChange={(v) => set("headline", v)} placeholder="Ready to Get Started?" />
        <StackedTextField label="Subtext" value={p.subtext ?? ""} onChange={(v) => set("subtext", v)} placeholder="Supporting line" />
        <TabSection title="Primary Button" />
        <StackedTextField label="Label" value={p.primaryLabel ?? ""} onChange={(v) => set("primaryLabel", v)} placeholder="Start Free Trial" />
        <LinkUrlField label="URL" value={p.primaryUrl ?? ""} onChange={(v) => set("primaryUrl", v)} />
        <TabSection title="Secondary Button" />
        <StackedTextField label="Label" value={p.secondaryLabel ?? ""} onChange={(v) => set("secondaryLabel", v)} placeholder="Learn More" />
        <LinkUrlField label="URL" value={p.secondaryUrl ?? ""} onChange={(v) => set("secondaryUrl", v)} />
        <TabSection title="Layout" />
        <AlignField label="Alignment" value={p.alignment ?? "text-center"} onChange={(v) => set("alignment", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 1, bgType: "color", bgColor: "#005bd3", advPadding: { top: 80, right: 0, bottom: 80, left: 0 }, headline: "Ready to Get Started?", subtext: "Join thousands of happy customers today.", primaryLabel: "Start Free Trial", primaryUrl: "#", secondaryLabel: "Learn More", secondaryUrl: "#", alignment: "text-center" }),
    render: (p: any) => {
      const align = (p.alignment ?? "text-center").replace("text-", "") as "left" | "center" | "right";
      const justify = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
      const onColor = p.bgType === "color" && p.bgColor && p.bgColor !== "#ffffff";
      const titleC = onColor ? "#ffffff" : "#111827";
      const subC = onColor ? "rgba(255,255,255,0.9)" : "#6b7280";
      return (
        <SectionCanvasWrap props={p}>
          <div style={{ textAlign: align }}>
            <h2 style={{ fontSize: "clamp(1.6rem,3.2vw,2.4rem)", fontWeight: 800, color: titleC, lineHeight: 1.2, margin: "0 0 12px" }}>{p.headline || "Ready to Get Started?"}</h2>
            {p.subtext && <p style={{ fontSize: "1.1rem", color: subC, lineHeight: 1.6, margin: "0 0 28px" }}>{p.subtext}</p>}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: justify }}>
              {p.primaryLabel && <a href={p.primaryUrl || "#"} style={{ display: "inline-block", background: onColor ? "#ffffff" : "#005bd3", color: onColor ? (p.bgColor || "#005bd3") : "#ffffff", padding: "12px 28px", borderRadius: 6, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>{p.primaryLabel}</a>}
              {p.secondaryLabel && <a href={p.secondaryUrl || "#"} style={{ display: "inline-block", background: "transparent", color: onColor ? "#ffffff" : "#005bd3", padding: "12px 28px", borderRadius: 6, fontWeight: 600, fontSize: 15, textDecoration: "none", border: `2px solid ${onColor ? "rgba(255,255,255,0.6)" : "#005bd3"}` }}>{p.secondaryLabel}</a>}
            </div>
          </div>
        </SectionCanvasWrap>
      );
    },
  },

  // ── FAQ ───────────────────────────────────────────────────────────────────
  Section_FAQ: {
    label: "FAQ",
    fields: makeSectionFields("Section_FAQ", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Frequently Asked Questions" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="Everything you need to know" />
        <TabSection title="Questions" />
        <AccordionItemsField items={p.items} onChange={(v) => set("items", v)} max={20} singular="Question"
          newItem={() => ({ q: "New question?", a: "The answer." })}
          fields={[{ key: "q", label: "Question", placeholder: "How does it work?" }, { key: "a", label: "Answer", type: "textarea", placeholder: "Explain the answer…" }]}
          getThumb={() => <span>{"❓"}</span>}
          getTitle={(it: any, i: number) => (it.q || "").trim() || `Question ${i + 1}`}
          getSubtitle={(it: any) => it.a || "No answer"}
          removeNote="This question will be removed. This action cannot be undone." />
        <TabSection title="Style" />
        <ColorPickerField label="Accent Color" value={p.accentColor ?? "#005bd3"} onChange={(v) => set("accentColor", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 1, advPadding: { top: 70, right: 0, bottom: 70, left: 0 }, sectionTitle: "Frequently Asked Questions", sectionSubtitle: "Everything you need to know", accentColor: "#005bd3",
      items: [
        { q: "How do I get started?", a: "Sign up and follow the quick onboarding — it takes less than five minutes." },
        { q: "Can I cancel anytime?", a: "Yes, you can cancel your plan at any time with no penalties." },
        { q: "Do you offer support?", a: "Absolutely. Our team is available 24/7 to help you out." },
        { q: "Is there a free trial?", a: "Yes, every plan comes with a 14-day free trial — no card required." },
      ] }),
    render: (p: any) => <SectionFAQContent p={p} />,
  },

  // ── Team ──────────────────────────────────────────────────────────────────
  Section_Team: {
    label: "Team",
    fields: makeSectionFields("Section_Team", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Meet Our Team" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="The people behind the product" />
        <TabSection title="Members" />
        <AccordionItemsField items={p.items} onChange={(v) => set("items", v)} max={12} singular="Member"
          newItem={() => ({ imageUrl: "", name: "New Member", role: "Role", bio: "" })}
          fields={[{ key: "imageUrl", label: "Photo", type: "image" }, { key: "name", label: "Name", placeholder: "Jane Doe" }, { key: "role", label: "Role", placeholder: "Founder" }, { key: "bio", label: "Bio", type: "textarea", placeholder: "Short bio (optional)" }]}
          getThumb={(it: any) => (it.imageUrl ? <img src={it.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : <span>{"👤"}</span>)}
          getTitle={(it: any, i: number) => (it.name || "").trim() || `Member ${i + 1}`}
          getSubtitle={(it: any) => it.role || it.bio || "No role"}
          removeNote="This member will be removed. This action cannot be undone." />
        <TabSection title="Layout" />
        <InlineSelect label="Members Per Row" value={String(p.memberCount ?? 4)} onChange={(v) => set("memberCount", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 4, columnsTablet: 2, advPadding: { top: 70, right: 0, bottom: 70, left: 0 }, sectionTitle: "Meet Our Team", sectionSubtitle: "The people behind the product", memberCount: 4,
      items: [
        { imageUrl: "", name: "Alex Morgan", role: "Founder & CEO", bio: "" },
        { imageUrl: "", name: "Sam Rivera", role: "Head of Product", bio: "" },
        { imageUrl: "", name: "Jordan Lee", role: "Lead Designer", bio: "" },
        { imageUrl: "", name: "Taylor Kim", role: "Engineering", bio: "" },
      ] }),
    render: (p: any) => <SectionCardsContent p={p} variant="team" />,
  },

  // ── Features ──────────────────────────────────────────────────────────────
  Section_Features: {
    label: "Features",
    fields: makeSectionFields("Section_Features", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Why Choose Us" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="What makes us different" />
        <TabSection title="Features" />
        <AccordionItemsField items={p.items} onChange={(v) => set("items", v)} max={12} singular="Feature"
          newItem={() => ({ icon: "✅", title: "New Feature", text: "Describe this feature." })}
          fields={[{ key: "icon", label: "Icon (emoji)", placeholder: "✅" }, { key: "title", label: "Title", placeholder: "Feature name" }, { key: "text", label: "Description", type: "textarea", placeholder: "Short description" }]}
          getThumb={(it: any) => <span>{it.icon || "✅"}</span>}
          getTitle={(it: any, i: number) => (it.title || "").trim() || `Feature ${i + 1}`}
          getSubtitle={(it: any) => it.text || "No description"}
          removeNote="This feature will be removed. This action cannot be undone." />
        <TabSection title="Layout" />
        <InlineSelect label="Per Row" value={String(p.featureCount ?? 3)} onChange={(v) => set("featureCount", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
        <ColorPickerField label="Accent Color" value={p.accentColor ?? "#005bd3"} onChange={(v) => set("accentColor", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 1, bgType: "color", bgColor: "#f8fafc", advPadding: { top: 70, right: 0, bottom: 70, left: 0 }, sectionTitle: "Why Choose Us", sectionSubtitle: "What makes us different", featureCount: 3, accentColor: "#005bd3",
      items: [
        { icon: "⚡", title: "Lightning Fast", text: "Built for speed so your customers never wait." },
        { icon: "🎨", title: "Fully Customizable", text: "Tailor every detail to match your brand." },
        { icon: "📱", title: "Mobile Ready", text: "Looks perfect on every screen size." },
      ] }),
    render: (p: any) => <SectionCardsContent p={p} variant="features" />,
  },

  // ── Newsletter ────────────────────────────────────────────────────────────
  Section_Newsletter: {
    label: "Newsletter",
    fields: makeSectionFields("Section_Newsletter", (p, set) => (
      <>
        <TabSection title="Content" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Stay in the Loop" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="Get the latest updates" />
        <TabSection title="Form" />
        <StackedTextField label="Input Placeholder" value={p.placeholder ?? ""} onChange={(v) => set("placeholder", v)} placeholder="Enter your email address" />
        <StackedTextField label="Button Label" value={p.buttonLabel ?? ""} onChange={(v) => set("buttonLabel", v)} placeholder="Subscribe" />
        <StackedTextField label="Disclaimer" value={p.disclaimer ?? ""} onChange={(v) => set("disclaimer", v)} placeholder="No spam. Unsubscribe anytime." />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 1, bgType: "color", bgColor: "#eff6ff", advPadding: { top: 60, right: 0, bottom: 60, left: 0 }, sectionTitle: "Stay in the Loop", sectionSubtitle: "Get the latest updates delivered to your inbox.", placeholder: "Enter your email address", buttonLabel: "Subscribe", disclaimer: "" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: "clamp(1.4rem,2.8vw,2rem)", fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>{p.sectionTitle || "Stay in the Loop"}</h2>
            {p.sectionSubtitle && <p style={{ fontSize: "1rem", color: "#6b7280", margin: 0 }}>{p.sectionSubtitle}</p>}
          </div>
          <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input type="email" placeholder={p.placeholder || "Enter your email address"} style={{ flex: "1 1 200px", minWidth: 0, padding: "12px 14px", fontSize: 14, border: "1px solid #d1d5db", borderRadius: 6, outline: "none" }} />
            <button type="submit" style={{ background: "#005bd3", color: "#fff", padding: "12px 24px", borderRadius: 6, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>{p.buttonLabel || "Subscribe"}</button>
          </form>
          {p.disclaimer && <div style={{ fontSize: 12, color: "#6b7280" }}>{p.disclaimer}</div>}
        </div>
      </SectionCanvasWrap>
    ),
  },

  // ── Video Section ─────────────────────────────────────────────────────────
  Section_Video: {
    label: "Video Section",
    fields: makeSectionFields("Section_Video", (p, set) => (
      <>
        <TabSection title="Heading" />
        <ToggleField label="Show Heading" value={p.showHeading !== false} onChange={(v) => set("showHeading", v)} />
        {p.showHeading !== false && <><StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="See It In Action" /><StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="Short intro" /></>}
        <TabSection title="Video" />
        <InlineSelect label="Source" value={p.sourceType ?? "youtube"} onChange={(v) => set("sourceType", v)} options={[{ value: "youtube", label: "YouTube" }, { value: "vimeo", label: "Vimeo" }, { value: "upload", label: "Upload / Self-hosted" }]} />
        <StackedTextField label="Video URL" value={p.videoUrl ?? ""} onChange={(v) => set("videoUrl", v)} placeholder="https://youtube.com/watch?v=…" />
        <ImageField label="Thumbnail" value={p.thumbnailUrl ?? ""} onChange={(v) => set("thumbnailUrl", v)} />
        <ToggleField label="Autoplay" value={!!p.autoplay} onChange={(v) => set("autoplay", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 1, advPadding: { top: 60, right: 0, bottom: 60, left: 0 }, sectionTitle: "See It In Action", sectionSubtitle: "", videoUrl: "", sourceType: "youtube", thumbnailUrl: "", autoplay: false, showHeading: true }),
    render: (p: any) => {
      const ytId = p.videoUrl ? (String(p.videoUrl).match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/)?.[1] ?? "") : "";
      return (
        <SectionCanvasWrap props={p}>
          {p.showHeading !== false && <SectionHeading title={p.sectionTitle || "See It In Action"} subtitle={p.sectionSubtitle} />}
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            {p.videoUrl
              ? <div style={{ aspectRatio: "16/9", background: "#000", borderRadius: 12, overflow: "hidden" }}><iframe title="Video" src={p.sourceType === "vimeo" ? `https://player.vimeo.com/video/${String(p.videoUrl).match(/(\d+)/)?.[1] ?? ""}` : `https://www.youtube.com/embed/${ytId}`} style={{ width: "100%", height: "100%", border: "none" }} allowFullScreen /></div>
              : <div style={{ aspectRatio: "16/9", background: "#f1f5f9", borderRadius: 12, border: "2px dashed #cbd5e1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#94a3b8" }}><span style={{ fontSize: 40 }}>🎬</span><span style={{ fontSize: 13, fontWeight: 600 }}>Add a video</span><span style={{ fontSize: 11 }}>Set the Video URL in Content → Video</span></div>}
          </div>
        </SectionCanvasWrap>
      );
    },
  },

};

export { SectionBlockComponent };
// sectionTemplateConfig is already exported above via `export const`.
