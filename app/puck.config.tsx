// @ts-nocheck

import {
  DropZone,
  FieldLabel,
  registerOverlayPortal,
  Render,
  usePuck,
  type Config,
} from "@my-app/puck-editor";

import { cloneElement, createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  PanelLeft,
  PanelRight,
  Image as ImageIcon,
  Layers,
  Settings2,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Square,
  Copy,
  Minus,
  LayoutGrid,
  Circle,
  Sparkles,
  Type,
  Video,
} from "lucide-react";

import Modal from "@/components/modal";
import { loadGoogleFont } from "@/puck-splat/utils";

import type { GlobalSettings } from "@/lib/settings.server";

// ─── Shared editor field primitives (extracted to ./puck-blocks/shared) ──────
import {
  AlignField,
  ToggleField,
  ColumnsField,
  StackedTextField,
  StackedDateField,
  StackedNumberField,
  NumberUnitField,
  StackedTextareaField,
  ColorPickerField,
  StackedField,
  SettingsSectionHeader,
  TAB_LABELS,
  useBlockTab,
  BlockTabBar,
  TabSection,
  EditorHideOverlay,
  FourSideField,
  InlineSelect,
  type BlockTab,
  SliderNumberField,
  SliderUnitField,
  IconButtonGroup,
  DIR_ICONS,
  JUSTIFY_ICONS,
  ALIGN_ICONS,
  WRAP_ICONS,
} from "@/puck-blocks/shared";

// ─────────────────────────────────────────────────────────────────────────────

// ─── Shared prop types (extracted to ./puck-blocks/types) ────────────────────
import type { RootProps, Props } from "@/puck-blocks/types";
export type { RootProps };

// ─── Block-local field helpers (extracted to ./puck-blocks/block-fields) ─────
import {
  imageUploadField,
  ImageField,
  videoUploadField,
  ConditionalZone,
  URL_PATTERN,
  LinkUrlField,
  ImageLinkUrlField,
  VideoUploadField,
} from "@/puck-blocks/block-fields";

// ─── Standalone block components (extracted to ./puck-blocks/blocks) ─────────
import { ImageComponent } from "@/puck-blocks/blocks/image";
import { SpaceComponent } from "@/puck-blocks/blocks/space";
import { ButtonComponent } from "@/puck-blocks/blocks/button";
import { DividerComponent } from "@/puck-blocks/blocks/divider";
import { VideoComponent } from "@/puck-blocks/blocks/video";
import { SocialIconsComponent } from "@/puck-blocks/blocks/social-icons";
import { ShareButtonsComponent } from "@/puck-blocks/blocks/share-buttons";
import { StarRatingComponent } from "@/puck-blocks/blocks/star-rating";
import { ProgressBarComponent } from "@/puck-blocks/blocks/progress-bar";
import { AlertComponent } from "@/puck-blocks/blocks/alert";
import { BlockQuoteComponent } from "@/puck-blocks/blocks/blockquote";
import { LayoutBlockComponent } from "@/puck-blocks/blocks/layout";
import { GridBlockComponent } from "@/puck-blocks/blocks/grid";

// ─── Common content components (extracted to ./puck-blocks/blocks/common) ────
import { commonComponents } from "@/puck-blocks/blocks/common";




const headerData = {
  root: {
    props: { title: "" },
  },

  content: [
    {
      type: "GlobalHeader",

      props: {
        id: "global-header-default",

        height: "64px",

        backgroundColor: "#0158ad",

        textColor: "#FFFFFF",

        siteTitle: "My Page Builder",

        showShadow: true,

        showNavigation: true,

        navigationLinks: [
          { id: "1", label: "Home", url: "/", isActive: false },

          { id: "2", label: "Pages", url: "/admin/pages", isActive: false },

          { id: "3", label: "Admin", url: "/admin", isActive: false },
        ],
      },
    },
  ],

  zones: {},
};

const footerData = {
  root: {
    props: { title: "" },
  },

  content: [
    {
      type: "GlobalFooter",

      props: {
        id: "global-footer-default",

        height: "300px",

        backgroundColor: "#1F2937",

        textColor: "#F3F4F6",

        companyName: "My Page Builder",

        companyDescription: "Build beautiful pages without coding",

        showSocialLinks: true,

        socialLinks: {
          facebook: "https://facebook.com",

          twitter: "https://twitter.com",

          instagram: "https://instagram.com",

          linkedin: "https://linkedin.com",

          github: "https://github.com",
        },

        quickLinks: [
          { id: "1", label: "Home", url: "/", isActive: false },

          { id: "2", label: "Admin", url: "/admin", isActive: false },

          { id: "3", label: "Pages", url: "/admin/pages", isActive: false },
        ],

        copyrightText: "© 2026 My Page Builder. All rights reserved.",
      },
    },
  ],

  zones: {},
};


export const previewConfig: Config<Props, RootProps> = {
  root: {
    render: ({ children }) => <>{children}</>,
  },

  components: commonComponents,
};

// ─── Image Component ──────────────────────────────────────────────────────


// ─── Spacer Component ────────────────────────────────────────────────────────


// ─── Button Component ─────────────────────────────────────────────────────────


// ─── Divider Component ────────────────────────────────────────────────────────


// ─── Video Upload Field ───────────────────────────────────────────────────────


// ─── Video Component ──────────────────────────────────────────────────────────


// ─── Social Icons Component ───────────────────────────────────────────────────


// ─── Share Buttons Component ──────────────────────────────────────────────────


// ─── Star Rating Component ────────────────────────────────────────────────────


// ─── Progress Bar Component ───────────────────────────────────────────────────


// ─── Alert Component ──────────────────────────────────────────────────────────


// ─── Block Quote Component ────────────────────────────────────────────────────


// ─── Layout Block ─────────────────────────────────────────────────────────────

// ─── Container Block (Elementor-style) ────────────────────────────────────────


// ─── Grid Block ───────────────────────────────────────────────────────────────


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
    hideDesktop: false, hideTablet: false, hideMobile: false,
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
    advMargin, advPadding, hideDesktop, hideTablet, hideMobile,
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
        className={[cssClass].filter(Boolean).join(" ") || undefined}
        style={outerStyle}
      >
        {/* CSS */}
        {(animCss || customCss) && (
          <style>{`${animCss}${customCss || ""}`}</style>
        )}

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
      <TabSection title="Columns" />
      <InlineSelect label="Desktop" value={String(props.columns ?? 1)} onChange={(v) => set("columns", Number(v))}
        options={[{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "6", label: "6" }]} />
      <InlineSelect label="Tablet" value={String(props.columnsTablet ?? 1)} onChange={(v) => set("columnsTablet", Number(v))}
        options={[{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }]} />
      <InlineSelect label="Mobile" value={String(props.columnsMobile ?? 1)} onChange={(v) => set("columnsMobile", Number(v))}
        options={[{ value: "1", label: "1" }, { value: "2", label: "2" }]} />
      <SliderNumberField label="Column Gap" value={props.columnGapPx ?? 32} onChange={(v) => set("columnGapPx", v)} min={0} max={120} step={4} unit="PX" />
      <SliderNumberField label="Row Gap" value={props.rowGapPx ?? 32} onChange={(v) => set("rowGapPx", v)} min={0} max={120} step={4} unit="PX" />
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
  const bg =
    props.bgType === "gradient" && props.bgGrad1 && props.bgGrad2
      ? `linear-gradient(${props.bgGradAngle ?? 180}deg, ${props.bgGrad1}, ${props.bgGrad2})`
      : undefined;
  return (
    <SectionUidCtx.Provider value={uid}>
      <div id={uid} style={{
        position: "relative", overflow: "hidden",
        backgroundColor: props.bgType === "color" ? props.bgColor || undefined : undefined,
        background: bg,
        backgroundImage: props.bgType === "image" && props.bgImage ? `url("${props.bgImage}")` : undefined,
        backgroundSize: "cover", backgroundPosition: "center center",
        minHeight: props.minHeightPx > 0 ? props.minHeightPx : undefined,
        paddingTop: props.advPadding?.top ?? 60, paddingBottom: props.advPadding?.bottom ?? 60,
        paddingLeft: props.advPadding?.left ?? 0, paddingRight: props.advPadding?.right ?? 0,
        marginTop: props.advMargin?.top ?? 0, marginBottom: props.advMargin?.bottom ?? 0,
        boxSizing: "border-box",
      }}>
        {props.bgType === "video" && props.bgVideo && (
          <video autoPlay loop={props.bgVideoLoop !== false} muted={props.bgVideoMute !== false} playsInline
            src={props.bgVideo} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
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
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap, alignItems: "stretch" }}>{children}</div>;
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
    hideDesktop: false, hideTablet: false, hideMobile: false,
    animation: "none", animDuration: 600, animDelay: 0,
    cssId: "", cssClass: "", zIndex: null,
    ...overrides,
  };
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
    fields: makeSectionFields("Section_About", (p, set) => (
      <>
        <TabSection title="Content" />
        <StackedTextField label="Badge" value={p.badge ?? ""} onChange={(v) => set("badge", v)} placeholder="About Us" />
        <StackedTextField label="Heading" value={p.title ?? ""} onChange={(v) => set("title", v)} placeholder="Who We Are" />
        <StackedTextField label="Subheading" value={p.subtitle ?? ""} onChange={(v) => set("subtitle", v)} placeholder="Our story and mission" />
        <StackedTextField label="Description" value={p.description ?? ""} onChange={(v) => set("description", v)} placeholder="A few sentences about your company…" />
        <TabSection title="Image" />
        <ImageField label="Image" value={p.imageUrl ?? ""} onChange={(v) => set("imageUrl", v)} />
        <StackedTextField label="Alt Text" value={p.imageAlt ?? ""} onChange={(v) => set("imageAlt", v)} placeholder="About image" />
        <InlineSelect label="Image Position" value={p.imagePosition ?? "left"} onChange={(v) => set("imagePosition", v)}
          options={[{ value: "left", label: "Image Left" }, { value: "right", label: "Image Right" }]} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 2, columnsTablet: 1, advPadding: { top: 80, right: 0, bottom: 80, left: 0 }, badge: "About Us", title: "Who We Are", subtitle: "Our story and mission", description: "", imageUrl: "", imageAlt: "About image", imagePosition: "left" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SecGrid cols={2} gap={48}>
          {p.imagePosition !== "right"
            ? <>{p.imageUrl ? <img src={p.imageUrl} alt={p.imageAlt || ""} style={{ width: "100%", borderRadius: 8, objectFit: "cover", maxHeight: 400 }} /> : <SectionDZ slot={0} label="About image" icon="🖼" minH={240} hint="Drop Image block" />}<SectionDZ slot={1} label={`${p.badge || "About Us"} — heading, text, stats`} icon="👤" minH={240} hint="Drop Heading, Text, Icon blocks" /></>
            : <><SectionDZ slot={1} label={`${p.badge || "About Us"} — heading, text, stats`} icon="👤" minH={240} hint="Drop Heading, Text, Icon blocks" />{p.imageUrl ? <img src={p.imageUrl} alt={p.imageAlt || ""} style={{ width: "100%", borderRadius: 8, objectFit: "cover", maxHeight: 400 }} /> : <SectionDZ slot={0} label="About image" icon="🖼" minH={240} hint="Drop Image block" />}</>}
        </SecGrid>
      </SectionCanvasWrap>
    ),
  },

  // ── Gallery ───────────────────────────────────────────────────────────────
  Section_Gallery: {
    label: "Gallery",
    fields: makeSectionFields("Section_Gallery", (p, set) => (
      <>
        <TabSection title="Heading" />
        <ToggleField label="Show Heading" value={p.showHeading !== false} onChange={(v) => set("showHeading", v)} />
        {p.showHeading !== false && <><StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Our Gallery" /><StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="A short description" /></>}
        <TabSection title="Grid" />
        <InlineSelect label="Columns" value={String(p.galleryColumns ?? 3)} onChange={(v) => set("galleryColumns", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }]} />
        <SliderNumberField label="Gap (px)" value={p.gap ?? 12} onChange={(v) => set("gap", v)} min={0} max={60} step={2} unit="px" />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 2, advPadding: { top: 60, right: 0, bottom: 60, left: 0 }, sectionTitle: "Our Gallery", sectionSubtitle: "", galleryColumns: 3, gap: 12, showHeading: true }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        {p.showHeading !== false && <SectionDZ slot={0} label={p.sectionTitle || "Gallery heading"} icon="H" minH={60} hint="Drop Heading block" />}
        <div style={{ marginTop: 20 }}>
          <SecGrid cols={3} gap={p.gap ?? 12}><SectionDZ slot={1} label="Image 1" icon="🖼" minH={130} /><SectionDZ slot={2} label="Image 2" icon="🖼" minH={130} /><SectionDZ slot={3} label="Image 3" icon="🖼" minH={130} /></SecGrid>
        </div>
        <div style={{ marginTop: p.gap ?? 12 }}>
          <SecGrid cols={4} gap={p.gap ?? 12}><SectionDZ slot={4} label="Image 4" icon="🖼" minH={90} /><SectionDZ slot={5} label="Image 5" icon="🖼" minH={90} /><SectionDZ slot={6} label="Image 6" icon="🖼" minH={90} /><SectionDZ slot={7} label="Image 7" icon="🖼" minH={90} /></SecGrid>
        </div>
      </SectionCanvasWrap>
    ),
  },

  // ── Testimonial ───────────────────────────────────────────────────────────
  Section_Testimonial: {
    label: "Testimonial",
    fields: makeSectionFields("Section_Testimonial", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="What Our Customers Say" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="Real reviews from real customers" />
        <TabSection title="Layout" />
        <InlineSelect label="Columns" value={String(p.reviewCount ?? 3)} onChange={(v) => set("reviewCount", Number(v))} options={[{ value: "1", label: "1 (Single)" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 1, bgType: "color", bgColor: "#f8fafc", advPadding: { top: 60, right: 0, bottom: 60, left: 0 }, sectionTitle: "What Our Customers Say", sectionSubtitle: "", reviewCount: 3 }),
    render: (p: any) => {
      const cols = Math.min(p.reviewCount ?? 3, 4);
      return (
        <SectionCanvasWrap props={p}>
          <SectionDZ slot={0} label={p.sectionTitle || "Testimonials heading"} icon="H" minH={60} hint="Drop Heading block" />
          <div style={{ marginTop: 24 }}>
            <SecGrid cols={cols} gap={24}>{Array.from({ length: cols }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={`Review ${i + 1} — quote, author, star rating`} icon="💬" minH={120} hint="Drop BlockQuote + StarRating" />)}</SecGrid>
          </div>
        </SectionCanvasWrap>
      );
    },
  },

  // ── Carousel ──────────────────────────────────────────────────────────────
  Section_Carousel: {
    label: "Carousel",
    fields: makeSectionFields("Section_Carousel", (p, set) => (
      <>
        <TabSection title="Marquee Bar" />
        <ToggleField label="Show Marquee Bar" value={p.showMarquee !== false} onChange={(v) => set("showMarquee", v)} />
        {p.showMarquee !== false && <><StackedTextField label="Text" value={p.marqueeText ?? ""} onChange={(v) => set("marqueeText", v)} placeholder="Announcement · " /><ColorPickerField label="Background" value={p.marqueeBg ?? "#1a1a1a"} onChange={(v) => set("marqueeBg", v)} /><ColorPickerField label="Text Color" value={p.marqueeColor ?? "#ffffff"} onChange={(v) => set("marqueeColor", v)} /></>}
        <TabSection title="Carousel" />
        <StackedTextField label="Section Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Featured" />
        <InlineSelect label="Cards Per Row" value={String(p.cardCount ?? 3)} onChange={(v) => set("cardCount", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 2, advPadding: { top: 60, right: 0, bottom: 60, left: 0 }, sectionTitle: "Featured", showMarquee: true, marqueeText: "Free shipping · New arrivals · Special offers · ", marqueeBg: "#1a1a1a", marqueeColor: "#ffffff", cardCount: 3 }),
    render: (p: any) => {
      const cols = p.cardCount ?? 3;
      return (
        <div>
          {p.showMarquee !== false && <div style={{ background: p.marqueeBg || "#1a1a1a", padding: "10px 0", overflow: "hidden" }}><div style={{ display: "flex", gap: 40, color: p.marqueeColor || "#fff", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", padding: "0 24px" }}>{Array.from({ length: 3 }).map((_, i) => <span key={i}>{p.marqueeText || "Announcement · "}</span>)}</div></div>}
          <SectionCanvasWrap props={p}>
            <SectionDZ slot={0} label={p.sectionTitle || "Section heading"} icon="H" minH={60} hint="Drop Heading block" />
            <div style={{ marginTop: 20 }}><SecGrid cols={cols} gap={20}>{Array.from({ length: cols }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={`Card ${i + 1}`} icon="🃏" minH={160} hint="Drop Image, Text, Button blocks" />)}</SecGrid></div>
          </SectionCanvasWrap>
        </div>
      );
    },
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
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "Contact heading"} icon="H" minH={60} hint="Drop Heading block" />
        <div style={{ marginTop: 28 }}>
          <SecGrid cols={2} gap={48}>
            <SectionDZ slot={1} label={`Contact info — ${p.address || "address"}, ${p.phone || "phone"}, ${p.email || "email"}`} icon="📍" minH={180} hint="Drop Text, Icon, SocialIcons blocks" />
            <SectionDZ slot={2} label={`Form → "${p.submitLabel || "Send Message"}"`} icon="📋" minH={180} hint="Drop Button block" />
          </SecGrid>
        </div>
      </SectionCanvasWrap>
    ),
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
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 20 }}>
          <SectionDZ slot={0} label={`${p.sectionTitle || "Countdown headline"} — ${p.subtext || "subtext"}`} icon="⏱" minH={70} hint="Drop Heading & Text blocks" />
          <SecGrid cols={4} gap={12}><SectionDZ slot={1} label="Days" icon="📅" minH={80} hint="Number + label" /><SectionDZ slot={2} label="Hours" icon="🕐" minH={80} hint="Number + label" /><SectionDZ slot={3} label="Minutes" icon="⏰" minH={80} hint="Number + label" /><SectionDZ slot={4} label="Seconds" icon="⚡" minH={80} hint="Number + label" /></SecGrid>
          <SectionDZ slot={5} label={`"${p.ctaLabel || "Shop Now"}" button`} icon="⚡" minH={50} hint="Drop Button block" />
          {p.showProgress !== false && <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "12px 16px" }}><div style={{ fontSize: 12, color: "#cbd5e1", marginBottom: 6 }}>{p.progressLabel || "73% sold"}</div><div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 999, height: 8, overflow: "hidden" }}><div style={{ height: "100%", width: `${p.progressValue ?? 73}%`, background: p.progressColor || "#ef4444", borderRadius: 999 }} /></div></div>}
        </div>
      </SectionCanvasWrap>
    ),
  },

  // ── Media Carousel ────────────────────────────────────────────────────────
  Section_MediaCarousel: {
    label: "Media Carousel",
    fields: makeSectionFields("Section_MediaCarousel", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Featured Media" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="Short description" />
        <TabSection title="Carousel" />
        <StackedNumberField label="Thumbnail Count" value={p.thumbnailCount ?? 4} onChange={(v) => set("thumbnailCount", v)} min={2} max={8} step={1} />
        <ToggleField label="Autoplay" value={!!p.autoplay} onChange={(v) => set("autoplay", v)} />
        {p.autoplay && <SliderNumberField label="Interval (ms)" value={p.interval ?? 4000} onChange={(v) => set("interval", v)} min={1000} max={10000} step={500} unit="ms" />}
        <ToggleField label="Show Arrows" value={p.showArrows !== false} onChange={(v) => set("showArrows", v)} />
        <ToggleField label="Show Dots" value={p.showDots !== false} onChange={(v) => set("showDots", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 1, advPadding: { top: 60, right: 0, bottom: 60, left: 0 }, sectionTitle: "Featured Media", sectionSubtitle: "", thumbnailCount: 4, autoplay: false, interval: 4000, showArrows: true, showDots: true }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "Media carousel heading"} icon="H" minH={60} hint="Drop Heading block" />
        <div style={{ marginTop: 20 }}><SectionDZ slot={1} label="Main media — drop Image or Video block (YouTube/Vimeo/upload)" icon="🎞" minH={300} hint="Supports Image block and Video block" /></div>
        <div style={{ marginTop: 12 }}><SecGrid cols={p.thumbnailCount ?? 4} gap={8}>{Array.from({ length: p.thumbnailCount ?? 4 }).map((_, i) => <SectionDZ key={i} slot={i + 2} label={`Thumbnail ${i + 1}`} icon="🖼" minH={60} />)}</SecGrid></div>
      </SectionCanvasWrap>
    ),
  },

  // ── Services ──────────────────────────────────────────────────────────────
  Section_Services: {
    label: "Services",
    fields: makeSectionFields("Section_Services", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Our Services" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="What we offer" />
        <TabSection title="Grid" />
        <InlineSelect label="Per Row" value={String(p.serviceCount ?? 3)} onChange={(v) => set("serviceCount", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
        <ColorPickerField label="Accent Color" value={p.accentColor ?? "#005bd3"} onChange={(v) => set("accentColor", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 1, advPadding: { top: 70, right: 0, bottom: 70, left: 0 }, sectionTitle: "Our Services", sectionSubtitle: "", serviceCount: 3, accentColor: "#005bd3" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "Services heading"} icon="H" minH={60} hint="Drop Heading block" />
        <div style={{ marginTop: 28 }}><SecGrid cols={p.serviceCount ?? 3} gap={28}>{Array.from({ length: p.serviceCount ?? 3 }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={`Service ${i + 1} — icon, title, description`} icon="🔧" minH={140} hint="Drop Icon + Heading + Text" />)}</SecGrid></div>
      </SectionCanvasWrap>
    ),
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
        <InlineSelect label="Number of Tiers" value={String(p.tierCount ?? 3)} onChange={(v) => set("tierCount", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
        <StackedTextField label="Currency" value={p.currency ?? "$"} onChange={(v) => set("currency", v)} placeholder="$" />
        <ColorPickerField label="Accent Color" value={p.accentColor ?? "#005bd3"} onChange={(v) => set("accentColor", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 1, advPadding: { top: 80, right: 0, bottom: 80, left: 0 }, sectionTitle: "Simple, Transparent Pricing", sectionSubtitle: "", tierCount: 3, currency: "$", accentColor: "#005bd3" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "Pricing heading"} icon="H" minH={60} hint="Drop Heading block" />
        <div style={{ marginTop: 28 }}><SecGrid cols={p.tierCount ?? 3} gap={24}>{Array.from({ length: p.tierCount ?? 3 }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={i === 1 ? "Tier 2 — recommended / featured" : `Tier ${i + 1} — name, price, features, CTA`} icon={i === 1 ? "⭐" : "💳"} minH={200} hint="Drop Heading + Text + Button blocks" />)}</SecGrid></div>
      </SectionCanvasWrap>
    ),
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
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <div style={{ textAlign: p.alignment?.replace("text-", "") as any || "center", display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionDZ slot={0} label={`"${p.headline || "CTA Headline"}" — heading & subtext`} icon="⚡" minH={80} hint="Drop Heading & Text blocks" />
          <SectionDZ slot={1} label={`Buttons — "${p.primaryLabel || "Primary"}" & "${p.secondaryLabel || "Secondary"}"`} icon="⊡" minH={50} hint="Drop Button blocks" />
        </div>
      </SectionCanvasWrap>
    ),
  },

  // ── FAQ ───────────────────────────────────────────────────────────────────
  Section_FAQ: {
    label: "FAQ",
    fields: makeSectionFields("Section_FAQ", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Frequently Asked Questions" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="Everything you need to know" />
        <TabSection title="Items" />
        <StackedNumberField label="FAQ Slots" value={p.faqCount ?? 4} onChange={(v) => set("faqCount", v)} min={1} max={12} step={1} />
        <ColorPickerField label="Accent Color" value={p.accentColor ?? "#005bd3"} onChange={(v) => set("accentColor", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 1, advPadding: { top: 70, right: 0, bottom: 70, left: 0 }, sectionTitle: "Frequently Asked Questions", sectionSubtitle: "", faqCount: 4, accentColor: "#005bd3" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "FAQ heading"} icon="H" minH={60} hint="Drop Heading block" />
        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 8 }}>{Array.from({ length: p.faqCount ?? 4 }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={`FAQ ${i + 1} — question & answer`} icon="❓" minH={52} hint="Drop Accordion block" />)}</div>
      </SectionCanvasWrap>
    ),
  },

  // ── Team ──────────────────────────────────────────────────────────────────
  Section_Team: {
    label: "Team",
    fields: makeSectionFields("Section_Team", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Meet Our Team" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="The people behind the product" />
        <TabSection title="Grid" />
        <InlineSelect label="Members Per Row" value={String(p.memberCount ?? 4)} onChange={(v) => set("memberCount", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 4, columnsTablet: 2, advPadding: { top: 70, right: 0, bottom: 70, left: 0 }, sectionTitle: "Meet Our Team", sectionSubtitle: "", memberCount: 4 }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "Team heading"} icon="H" minH={60} hint="Drop Heading block" />
        <div style={{ marginTop: 28 }}><SecGrid cols={p.memberCount ?? 4} gap={24}>{Array.from({ length: p.memberCount ?? 4 }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={`Member ${i + 1} — photo, name, role, bio`} icon="👤" minH={160} hint="Drop Image + Heading + Text" />)}</SecGrid></div>
      </SectionCanvasWrap>
    ),
  },

  // ── Logo Row ──────────────────────────────────────────────────────────────
  Section_Logos: {
    label: "Logo Row",
    fields: makeSectionFields("Section_Logos", (p, set) => (
      <>
        <TabSection title="Label" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Trusted By" />
        <TabSection title="Logos" />
        <StackedNumberField label="Logo Count" value={p.logoCount ?? 6} onChange={(v) => set("logoCount", v)} min={2} max={12} step={1} />
        <ToggleField label="Grayscale" value={p.grayscale !== false} onChange={(v) => set("grayscale", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 6, columnsTablet: 3, bgType: "color", bgColor: "#f8fafc", advPadding: { top: 40, right: 0, bottom: 40, left: 0 }, sectionTitle: "Trusted By", logoCount: 6, grayscale: true }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "'Trusted by' label"} icon="🏷" minH={40} hint="Drop Heading block (small)" />
        <div style={{ marginTop: 16 }}><SecGrid cols={Math.min(p.logoCount ?? 6, 6)} gap={16}>{Array.from({ length: p.logoCount ?? 6 }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={`Logo ${i + 1}`} icon="🏷" minH={50} hint="Drop Image block" />)}</SecGrid></div>
      </SectionCanvasWrap>
    ),
  },

  // ── Features ──────────────────────────────────────────────────────────────
  Section_Features: {
    label: "Features",
    fields: makeSectionFields("Section_Features", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Why Choose Us" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="What makes us different" />
        <TabSection title="Grid" />
        <InlineSelect label="Per Row" value={String(p.featureCount ?? 3)} onChange={(v) => set("featureCount", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
        <ColorPickerField label="Accent Color" value={p.accentColor ?? "#005bd3"} onChange={(v) => set("accentColor", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 1, bgType: "color", bgColor: "#f8fafc", advPadding: { top: 70, right: 0, bottom: 70, left: 0 }, sectionTitle: "Why Choose Us", sectionSubtitle: "", featureCount: 3, accentColor: "#005bd3" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "Features heading"} icon="H" minH={60} hint="Drop Heading block" />
        <div style={{ marginTop: 28 }}><SecGrid cols={p.featureCount ?? 3} gap={32}>{Array.from({ length: p.featureCount ?? 3 }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={`Feature ${i + 1} — icon, title, description`} icon="✅" minH={130} hint="Drop Icon + Heading + Text" />)}</SecGrid></div>
      </SectionCanvasWrap>
    ),
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
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", gap: 12 }}>
          <SectionDZ slot={0} label={p.sectionTitle || "Newsletter heading"} icon="✉" minH={70} hint="Drop Heading block" />
          <SectionDZ slot={1} label={`Email input: "${p.placeholder || "Enter email"}" + "${p.buttonLabel || "Subscribe"}" button`} icon="⊡" minH={50} hint="Drop Button block" />
          {p.disclaimer && <div style={{ fontSize: 11, color: "#6b7280" }}>{p.disclaimer}</div>}
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
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        {p.showHeading !== false && <SectionDZ slot={0} label={p.sectionTitle || "Video section heading"} icon="H" minH={60} hint="Drop Heading block" />}
        <div style={{ marginTop: 20 }}>
          {p.videoUrl
            ? <div style={{ aspectRatio: "16/9", background: "#000", borderRadius: 8, overflow: "hidden" }}><iframe src={`https://www.youtube.com/embed/${p.videoUrl.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1] ?? ""}`} style={{ width: "100%", height: "100%", border: "none" }} allowFullScreen /></div>
            : <SectionDZ slot={1} label={`Video block — paste ${p.sourceType || "YouTube"} URL or upload`} icon="🎬" minH={300} hint="Drop Video block" />}
        </div>
      </SectionCanvasWrap>
    ),
  },

};

export const config: Config<Props, RootProps> = {
  root: {
    fields: {},
    render: ({
      children,

      theme,

      containerWidth,

      headerData,

      footerData,

      isGlobalEditor,
    }) => {
      const [hoverHeader, setHoverHeader] = useState(false);

      const [hoverFooter, setHoverFooter] = useState(false);

      const notifyParent = (zone: "header" | "footer") => {
        try {
          window.dispatchEvent(
            new CustomEvent("puck:global-select", { detail: { zone } }),
          );
        } catch {
          // ignore in SSR/static preview
        }
      };

      return (
        <div
          className="page-preview min-h-screen flex flex-col"
          data-theme={theme || "light"}
          style={{
            fontFamily: "var(--font-family)",

            backgroundColor: "var(--background-color)",

            color: "var(--text-color)",

            containerType: "inline-size",
          }}
        >
          {/* ── Above Header Zone ───────────────────────────────────────────── */}

          {!isGlobalEditor && <ConditionalZone zone="above-header" />}

          {/* ── Global Header ───────────────────────────────────────────────── */}

          {!isGlobalEditor && headerData?.content?.length > 0 && (
            <div style={{ position: "relative" }}>
              <Render config={previewConfig} data={headerData} />

              {/* Always-present overlay — sits on top, owns all hover/click */}
              <div
                className="pb-global-overlay"
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 200,
                  cursor: "pointer",
                  boxSizing: "border-box",
                  background: hoverHeader ? "rgba(1,88,173,0.12)" : "transparent",
                  border: hoverHeader ? "2px dashed #0158ad" : "2px solid transparent",
                  transition: "background 0.15s, border-color 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={() => setHoverHeader(true)}
                onMouseLeave={() => setHoverHeader(false)}
                onClick={() => notifyParent("header")}
              >
              </div>
            </div>
          )}

          {/* Main Content */}

          <main className="flex-1 w-full">
            <div
              style={{ maxWidth: "var(--container-width)", margin: "0 auto" }}
            >
              {children}
            </div>
          </main>

          {/* ── Global Footer ───────────────────────────────────────────────── */}

          {!isGlobalEditor && footerData?.content?.length > 0 && (
            <div style={{ position: "relative" }}>
              <Render config={previewConfig} data={footerData} />

              {/* Always-present overlay — owns all hover/click */}
              <div
                className="pb-global-overlay"
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 200,
                  cursor: "pointer",
                  boxSizing: "border-box",
                  background: hoverFooter ? "rgba(15,118,110,0.12)" : "transparent",
                  border: hoverFooter ? "2px dashed #0f766e" : "2px solid transparent",
                  transition: "background 0.15s, border-color 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={() => setHoverFooter(true)}
                onMouseLeave={() => setHoverFooter(false)}
                onClick={() => notifyParent("footer")}
              >
              </div>
            </div>
          )}

          {/* ── Below Footer Zone ───────────────────────────────────────────── */}

          {!isGlobalEditor && <ConditionalZone zone="below-footer" />}
        </div>
      );
    },
  },

  components: {
    ...commonComponents,

    Image: ImageComponent,

    Space: SpaceComponent,

    Button: ButtonComponent,

    Divider: DividerComponent,

    Video: VideoComponent,

    BlockQuote: BlockQuoteComponent,

    StarRating: StarRatingComponent,

    ProgressBar: ProgressBarComponent,

    Alert: AlertComponent,

    SocialIcons: SocialIconsComponent,

    ShareButtons: ShareButtonsComponent,

    LayoutBlock: LayoutBlockComponent,

    GridBlock: GridBlockComponent,

    Section: SectionBlockComponent,

    // Section template components — appear under "Sections" category in the drawer
    ...sectionTemplateConfig,
  },
};

// Patch layout/section blocks into previewConfig for preview/SSR rendering
(previewConfig.components as any).LayoutBlock = LayoutBlockComponent;
(previewConfig.components as any).GridBlock = GridBlockComponent;
(previewConfig.components as any).Section = SectionBlockComponent;
Object.entries(sectionTemplateConfig).forEach(([k, v]) => {
  (previewConfig.components as any)[k] = v;
});