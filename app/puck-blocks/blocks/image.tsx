// @ts-nocheck
// ─── ImageComponent ───

import type * as React from "react";
import { useState, useEffect, useRef } from "react";
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
  EditorHideOverlay,
} from "@/puck-blocks/shared";
import {
  ImageField,
  ImageLinkUrlField,
} from "@/puck-blocks/block-fields";

const ImageComponent = {
  label: "Image",
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

        const hasCaption = !!(props.caption ?? "");
        const isCustomH = (props.heightMode ?? "auto") === "custom";
        const borderStyleVal = props.borderStyle ?? "none";
        const hoverEffectVal = props.hoverEffect ?? "none";
        const captionPosVal = props.captionPosition ?? "below";
        const imgWidthVal = props.imgWidth ?? 100;
        const imgWidthUnit = props.imgWidthUnit ?? "%";
        const isLessThan100 = imgWidthUnit !== "%" || imgWidthVal < 100;
        const bgType = props.advBgType ?? "none";
        const [showImgError, setShowImgError] = useState(false);

        useEffect(() => {
          if (props.imageUrl) { setShowImgError(false); return; }
          const handler = () => { setShowImgError(true); setTimeout(() => setShowImgError(false), 5000); };
          window.addEventListener("pb:image-validation-failed", handler);
          return () => window.removeEventListener("pb:image-validation-failed", handler);
        }, [props.imageUrl]);

        return (
          <BlockTabBar blockKey="Image">
            {(tab) => (
              <>
                {/* ── CONTENT TAB ── */}
                {tab === "content" && (
                  <>
                    <ImageField label="Image" value={props.imageUrl ?? ""} onChange={(v) => set("imageUrl", v)} />
                    {showImgError && (
                      <div style={{ color: "#d72c0d", fontSize: 11, marginTop: -4, marginBottom: 6, paddingLeft: 2 }}>
                        Image is required before publishing.
                      </div>
                    )}
                    <StackedTextField label="Alt Text" value={props.altText ?? ""} onChange={(v) => set("altText", v)} placeholder="Describe the image..." />
                    <StackedTextField label="Caption" value={props.caption ?? ""} onChange={(v) => set("caption", v)} placeholder="Optional caption..." />
                    <ImageLinkUrlField value={props.linkUrl ?? ""} onChange={(v) => set("linkUrl", v)} />
                  </>
                )}

                {/* ── STYLE TAB ── */}
                {tab === "style" && (
                  <>
                    <TabSection title="Sizing" />
                    <SliderNumberField
                      label="Width"
                      value={imgWidthVal}
                      onChange={(v) => { set("imgWidth", v); if (imgWidthUnit !== "px") set("imgWidthUnit", "px"); }}
                      min={0} max={2000} step={1} unit="px"
                    />
                    <InlineSelect
                      label="Height"
                      value={props.heightMode ?? "auto"}
                      onChange={(v) => set("heightMode", v)}
                      options={[
                        { value: "auto", label: "Auto" },
                        { value: "custom", label: "Custom" },
                      ]}
                    />
                    {isCustomH && (
                      <>
                        <SliderNumberField label="Height (px)" value={props.imgHeight ?? 300} onChange={(v) => set("imgHeight", v)} min={10} max={2000} step={10} unit="px" />
                        <InlineSelect
                          label="Object Fit"
                          value={props.objectFit ?? "cover"}
                          onChange={(v) => set("objectFit", v)}
                          options={[
                            { value: "cover", label: "Cover" },
                            { value: "contain", label: "Contain" },
                            { value: "fill", label: "Fill" },
                          ]}
                        />
                      </>
                    )}

                    <TabSection title="Border" />
                    <InlineSelect
                      label="Border Style"
                      value={borderStyleVal}
                      onChange={(v) => set("borderStyle", v)}
                      options={[
                        { value: "none", label: "None" },
                        { value: "solid", label: "Solid" },
                        { value: "dashed", label: "Dashed" },
                        { value: "dotted", label: "Dotted" },
                      ]}
                    />
                    {borderStyleVal !== "none" && (
                      <>
                        <SliderNumberField label="Border Width (px)" value={props.borderWidth ?? 1} onChange={(v) => set("borderWidth", v)} min={1} max={20} step={1} unit="px" />
                        <ColorPickerField label="Border Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
                        <SliderNumberField label="Border Radius (px)" value={props.borderRadius ?? 0} onChange={(v) => set("borderRadius", v)} min={0} max={200} step={1} unit="px" />
                      </>
                    )}

                    <TabSection title="Effects" />
                    <SliderNumberField label="Opacity (%)" value={props.opacity ?? 100} onChange={(v) => set("opacity", v)} min={0} max={100} step={1} unit="%" />
                    <InlineSelect
                      label="Hover Effect"
                      value={hoverEffectVal}
                      onChange={(v) => set("hoverEffect", v)}
                      options={[
                        { value: "none", label: "None" },
                        { value: "zoom", label: "Zoom" },
                        { value: "grayscale", label: "Grayscale" },
                        { value: "blur", label: "Blur" },
                        { value: "brightness", label: "Brightness" },
                      ]}
                    />
                    {hoverEffectVal === "blur" && (
                      <SliderNumberField label="CSS Blur (px)" value={props.cssBlur ?? 4} onChange={(v) => set("cssBlur", v)} min={1} max={20} step={1} unit="px" />
                    )}
                    {hoverEffectVal === "brightness" && (
                      <SliderNumberField label="CSS Brightness (%)" value={props.cssBrightness ?? 130} onChange={(v) => set("cssBrightness", v)} min={50} max={200} step={5} unit="%" />
                    )}

                    {hasCaption && (
                      <>
                        <TabSection title="Caption Style" />
                        <InlineSelect
                          label="Caption Position"
                          value={captionPosVal}
                          onChange={(v) => set("captionPosition", v)}
                          options={[
                            { value: "below", label: "Below" },
                            { value: "overlay", label: "Overlay" },
                          ]}
                        />
                        <AlignField
                          label="Caption Align"
                          value={props.captionAlign ?? "center"}
                          onChange={(v) => set("captionAlign", v)}
                          options={[
                            { value: "left",   icon: <AlignLeft   size={15} />, title: "Left"   },
                            { value: "center", icon: <AlignCenter size={15} />, title: "Center" },
                            { value: "right",  icon: <AlignRight  size={15} />, title: "Right"  },
                          ]}
                        />
                        <ColorPickerField label="Caption Color" value={props.captionColor ?? ""} onChange={(v) => set("captionColor", v)} />
                        <SliderNumberField label="Caption Font Size (px)" value={props.captionFontSize ?? 13} onChange={(v) => set("captionFontSize", v)} min={10} max={32} step={1} unit="px" />
                        {captionPosVal === "overlay" && (
                          <ColorPickerField label="Caption Background" value={props.captionBackground ?? ""} onChange={(v) => set("captionBackground", v)} />
                        )}
                      </>
                    )}
                  </>
                )}

                {/* ── ADVANCED TAB ── */}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 0, right: 0, bottom: 0, left: 0 }} onChange={(v) => set("advPadding", v)} />

                    {isLessThan100 && (
                      <>
                        <TabSection title="Image Alignment" />
                        <AlignField
                          label="Alignment"
                          value={props.alignment ?? "left"}
                          onChange={(v) => set("alignment", v)}
                          options={[
                            { value: "left",   icon: <AlignLeft   size={15} />, title: "Left"   },
                            { value: "center", icon: <AlignCenter size={15} />, title: "Center" },
                            { value: "right",  icon: <AlignRight  size={15} />, title: "Right"  },
                          ]}
                        />
                      </>
                    )}

                    <TabSection title="Entrance Animation" />
                    <InlineSelect
                      label="Animation"
                      value={props.entranceAnim ?? "none"}
                      onChange={(v) => set("entranceAnim", v)}
                      options={[
                        { value: "none",     label: "None" },
                        { value: "fade-in",  label: "Fade In" },
                        { value: "slide-up", label: "Slide Up" },
                        { value: "zoom-in",  label: "Zoom In" },
                      ]}
                    />

                    <TabSection title="Background" />
                    <InlineSelect
                      label="Type"
                      value={bgType}
                      onChange={(v) => set("advBgType", v)}
                      options={[
                        { value: "none", label: "None" },
                        { value: "color", label: "Color" },
                      ]}
                    />
                    {bgType === "color" && (
                      <ColorPickerField label="Color" value={props.advBgColor ?? ""} onChange={(v) => set("advBgColor", v)} />
                    )}

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
    imageUrl: "",
    altText: "",
    caption: "",
    linkUrl: "",
    imgWidth: 100,
    imgWidthUnit: "%",
    heightMode: "auto",
    imgHeight: 300,
    objectFit: "cover",
    borderStyle: "none",
    borderWidth: 1,
    borderColor: "",
    borderRadius: 0,
    opacity: 100,
    hoverEffect: "none",
    cssBlur: 4,
    cssBrightness: 130,
    captionPosition: "below",
    captionColor: "",
    captionFontSize: 13,
    captionBackground: "",
    captionAlign: "center",
    alignment: "left",
    entranceAnim: "none",
    advBgType: "none",
    advBgColor: "",
    advMargin: { top: 0, right: 0, bottom: 0, left: 0 },
    advPadding: { top: 0, right: 0, bottom: 0, left: 0 },
    hideDesktop: false,
    hideTablet: false,
    hideMobile: false,
    cssId: "",
    cssClass: "",
    customCss: "",
    zIndex: null,
  },

  render: ({
    imageUrl,
    altText,
    caption,
    linkUrl,
    imgWidth,
    imgWidthUnit,
    heightMode,
    imgHeight,
    objectFit,
    borderStyle,
    borderWidth,
    borderColor,
    borderRadius,
    opacity,
    hoverEffect,
    cssBlur,
    cssBrightness,
    captionPosition,
    captionColor,
    captionFontSize,
    captionBackground,
    captionAlign,
    alignment,
    entranceAnim,
    advBgType,
    advBgColor,
    advMargin,
    advPadding,
    hideDesktop,
    hideTablet,
    hideMobile,
    cssId,
    cssClass,
    customCss,
    zIndex,
  }: any) => {
    const [imgLoading, setImgLoading] = useState(true);
    const prevSrc = useRef<string>("");

    useEffect(() => {
      if (imageUrl !== prevSrc.current) {
        setImgLoading(true);
        prevSrc.current = imageUrl;
      }
    }, [imageUrl]);

    const wrapBgStyle: React.CSSProperties = advBgType === "color" && advBgColor
      ? { backgroundColor: advBgColor }
      : {};

    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");

    const imgId = cssId || "img-blk";
    const isCustomH = (heightMode ?? "auto") === "custom";
    const wUnit = imgWidthUnit ?? "%";
    const widthVal = `${imgWidth ?? 100}${wUnit}`;
    const heightVal = isCustomH && imgHeight ? `${imgHeight}px` : "auto";
    const brPx = `${Number(borderRadius) || 0}px`;

    const animCss = entranceAnim && entranceAnim !== "none" ? `
      @keyframes pb-img-fadein{from{opacity:0}to{opacity:1}}
      @keyframes pb-img-slideup{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
      @keyframes pb-img-zoomin{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
      #${imgId}.pb-img-animate{animation:${entranceAnim === "fade-in" ? "pb-img-fadein" : entranceAnim === "slide-up" ? "pb-img-slideup" : "pb-img-zoomin"} 0.5s ease both}
    ` : "";

    const hoverCss = hoverEffect && hoverEffect !== "none" ? `
      #${imgId} .pb-img-inner{overflow:hidden}
      #${imgId} .pb-img-inner img{transition:all 0.35s ease}
      #${imgId}:hover .pb-img-inner img{${
        hoverEffect === "zoom" ? "transform:scale(1.08);" :
        hoverEffect === "grayscale" ? "filter:grayscale(1);" :
        hoverEffect === "blur" ? `filter:blur(${Number(cssBlur) || 4}px);` :
        `filter:brightness(${Number(cssBrightness) || 130}%);`
      }}
    ` : "";

    if (!imageUrl) return (
      <div style={{ padding: 16, textAlign: "center", color: "#9ca3af", fontSize: 14, border: "2px dashed #e5e7eb", borderRadius: brPx }}>
        No image selected. Use the property panel to add an image.
      </div>
    );

    const imgEl = (
      <>
        {imgLoading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6", zIndex: 1 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "pb-img-spin 1s linear infinite" }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
        )}
        <img
          src={imageUrl}
          alt={altText ?? ""}
          loading="lazy"
          onLoad={() => setImgLoading(false)}
          onError={() => setImgLoading(false)}
          style={{
            width: "100%",
            height: heightVal,
            objectFit: isCustomH ? (objectFit as any ?? "cover") : undefined,
            display: "block",
            borderStyle: borderStyle !== "none" ? borderStyle : undefined,
            borderWidth: borderStyle !== "none" ? (borderWidth || 1) : undefined,
            borderColor: borderStyle !== "none" ? (borderColor || "#e5e7eb") : undefined,
            opacity: (opacity ?? 100) / 100,
          }}
        />
      </>
    );

    const captionEl = caption ? (
      captionPosition === "overlay"
        ? (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            backgroundColor: captionBackground || "rgba(0,0,0,0.5)",
            color: captionColor || "#fff",
            fontSize: captionFontSize || 13,
            padding: "8px 12px",
            textAlign: captionAlign as any,
          }}>
            {caption}
          </div>
        )
        : (
          <div style={{
            fontSize: captionFontSize || 13,
            color: captionColor || "var(--text-color, #374151)",
            padding: "6px 0",
            textAlign: captionAlign as any,
            fontStyle: "italic",
          }}>
            {caption}
          </div>
        )
    ) : null;

    const marginL = alignment === "center" || alignment === "right" ? "auto" : undefined;
    const marginR = alignment === "center" || alignment === "left" ? "auto" : undefined;

    return (
      <div
        id={imgId}
        className={[hideClasses, `puck-img-wrap-outer`, entranceAnim && entranceAnim !== "none" ? "pb-img-animate" : "", cssClass].filter(Boolean).join(" ") || undefined}
        style={{
          position: "relative",
          paddingTop: advPadding?.top ?? 0, paddingRight: advPadding?.right ?? 0,
          paddingBottom: advPadding?.bottom ?? 0, paddingLeft: advPadding?.left ?? 0,
          marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0,
          marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0,
          zIndex: zIndex ?? undefined,
          ...wrapBgStyle,
        }}
      >
        <EditorHideOverlay hideDesktop={hideDesktop} hideTablet={hideTablet} hideMobile={hideMobile} />
        <style>{`@keyframes pb-img-spin{to{transform:rotate(360deg)}}`}{animCss}{hoverCss}{customCss ? `#${imgId}{${customCss}}` : ""}</style>
        <div
          className="pb-img-inner"
          style={{
            display: "block",
            width: widthVal,
            maxWidth: "100%",
            marginLeft: marginL,
            marginRight: marginR,
            position: "relative",
            overflow: "hidden",
            borderRadius: brPx,
          }}
        >
          {linkUrl
            ? <a href={linkUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", position: "relative" }}>{imgEl}</a>
            : imgEl
          }
          {captionPosition === "overlay" && captionEl}
        </div>
        {captionPosition !== "overlay" && captionEl}
      </div>
    );
  },
};

export { ImageComponent };
