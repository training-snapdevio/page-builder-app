// @ts-nocheck
// ─── BlockQuoteComponent ───

import type * as React from "react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { usePuck } from "@my-app/puck-editor";
import { loadGoogleFont } from "@/puck-splat/utils";
import {
  AlignField,
  ToggleField,
  StackedTextField,
  StackedTextareaField,
  ColorPickerField,
  BlockTabBar,
  TabSection,
  FourSideField,
  InlineSelect,
  SliderNumberField,
  EditorHideOverlay,
  buildResponsiveSpacingCss,
} from "@/puck-blocks/shared";
import {
  ImageField,
} from "@/puck-blocks/block-fields";

const BlockQuoteComponent = {
  label: "Block Quote",
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
          <BlockTabBar blockKey="BlockQuote">
            {(tab) => (
              <>
                {tab === "content" && (
                  <>
                    <StackedTextareaField label="Quote Text" value={props.quoteText ?? ""} onChange={(v) => set("quoteText", v)} placeholder="Enter quote..." rows={4} />
                    <StackedTextField label="Author Name" value={props.authorName ?? ""} onChange={(v) => set("authorName", v)} placeholder="Author name..." />
                    <StackedTextField label="Author Title" value={props.authorTitle ?? ""} onChange={(v) => set("authorTitle", v)} placeholder="CEO, Acme Inc." />
                    <ImageField label="Author Image" value={props.authorImage ?? ""} onChange={(v) => set("authorImage", v)} />
                    <ToggleField label="Show Quote Icon" value={props.showQuoteIcon !== false} onChange={(v) => set("showQuoteIcon", v)} />
                  </>
                )}
                {tab === "style" && (
                  <>
                    <TabSection title="Quote Text" />
                    <InlineSelect label="Font Family" value={props.quoteFontFamily ?? "inherit"} onChange={(v) => { set("quoteFontFamily", v); loadGoogleFont(v); }} options={[{ value: "inherit", label: "Theme Default" }, { value: "Arial, Helvetica, sans-serif", label: "Arial" }, { value: "Georgia, serif", label: "Georgia" }, { value: "'Courier New', monospace", label: "Courier New" }, { value: "Impact, sans-serif", label: "Impact" }, { value: "Inter, sans-serif", label: "Inter" }, { value: "Poppins, sans-serif", label: "Poppins" }, { value: "'Roboto Serif', serif", label: "Roboto Serif" }, { value: "'New York', 'New York Small', 'Times New Roman', serif", label: "New York" }, { value: "'Open Sans', sans-serif", label: "Open Sans" }]} />
                    <SliderNumberField label="Font Size (px)" value={typeof props.quoteFontSize === "number" ? props.quoteFontSize : parseInt(props.quoteFontSize ?? "20") || 20} onChange={(v) => set("quoteFontSize", `${v}px`)} min={8} max={72} step={1} unit="px" />
                    <InlineSelect label="Font Style" value={props.quoteFontStyle ?? "italic"} onChange={(v) => set("quoteFontStyle", v)} options={[{ value: "normal", label: "Normal" }, { value: "italic", label: "Italic" }]} />
                    <ColorPickerField label="Text Color" value={props.quoteTextColor ?? ""} onChange={(v) => set("quoteTextColor", v)} />
                    <SliderNumberField label="Line Height" value={typeof props.quoteLineHeight === "number" ? props.quoteLineHeight : parseFloat(props.quoteLineHeight ?? "1.7") || 1.7} onChange={(v) => set("quoteLineHeight", v)} min={1} max={3} step={0.1} unit="" />
                    <TabSection title="Author" />
                    <ColorPickerField label="Name Color" value={props.nameColor ?? ""} onChange={(v) => set("nameColor", v)} />
                    <SliderNumberField label="Name Font Size (px)" value={typeof props.nameFontSize === "number" ? props.nameFontSize : parseInt(props.nameFontSize ?? "16") || 16} onChange={(v) => set("nameFontSize", `${v}px`)} min={8} max={48} step={1} unit="px" />
                    <InlineSelect label="Name Font Weight" value={props.nameFontWeight ?? "700"} onChange={(v) => set("nameFontWeight", v)} options={[{ value: "400", label: "Normal" }, { value: "700", label: "Bold" }]} />
                    <ColorPickerField label="Title Color" value={props.titleColor ?? ""} onChange={(v) => set("titleColor", v)} />
                    <SliderNumberField label="Title Font Size (px)" value={typeof props.titleFontSize === "number" ? props.titleFontSize : parseInt(props.titleFontSize ?? "14") || 14} onChange={(v) => set("titleFontSize", `${v}px`)} min={8} max={36} step={1} unit="px" />
                    <SliderNumberField label="Image Size (px)" value={typeof props.imageSize === "number" ? props.imageSize : parseInt(props.imageSize ?? "48") || 48} onChange={(v) => set("imageSize", `${v}px`)} min={24} max={160} step={1} unit="px" />
                    <SliderNumberField label="Image Border Radius (px)" value={typeof props.imageBorderRadius === "number" ? props.imageBorderRadius : (parseInt(props.imageBorderRadius ?? "50") ?? 50)} onChange={(v) => set("imageBorderRadius", `${v}px`)} min={0} max={100} step={1} unit="px" />
                    <TabSection title="Quote Icon" />
                    <ColorPickerField label="Icon Color" value={props.iconColor ?? ""} onChange={(v) => set("iconColor", v)} />
                    <SliderNumberField label="Icon Size (px)" value={typeof props.iconSize === "number" ? props.iconSize : parseInt(props.iconSize ?? "48") || 48} onChange={(v) => set("iconSize", `${v}px`)} min={16} max={96} step={1} unit="px" />
                    <InlineSelect label="Icon Position" value={props.iconPosition ?? "top-left"} onChange={(v) => set("iconPosition", v)} options={[{ value: "top-left", label: "Top Left" }, { value: "top-right", label: "Top Right" }]} />
                    <TabSection title="Border" />
                    <InlineSelect label="Border Style" value={props.borderType ?? "left"} onChange={(v) => set("borderType", v)} options={[{ value: "none", label: "None" }, { value: "left", label: "Left Border" }, { value: "top", label: "Top Border" }, { value: "box", label: "Box" }]} />
                    <ColorPickerField label="Border Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
                    <SliderNumberField label="Border Width (px)" value={props.borderWidth ?? 4} onChange={(v) => set("borderWidth", v)} min={1} max={20} step={1} unit="px" />
                    <TabSection title="Background" />
                    <InlineSelect label="Type" value={bgType} onChange={(v) => set("advBgType", v)} options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }]} />
                    {bgType === "color" && <ColorPickerField label="Color" value={props.advBgColorWrap ?? ""} onChange={(v) => set("advBgColorWrap", v)} />}
                    <TabSection title="Alignment" />
                    <AlignField label="Alignment" value={props.alignment ?? "left"} onChange={(v) => set("alignment", v)} options={[{ value: "left", icon: <AlignLeft size={15} />, title: "Left" }, { value: "center", icon: <AlignCenter size={15} />, title: "Center" }, { value: "right", icon: <AlignRight size={15} />, title: "Right" }]} />
                  </>
                )}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 24, right: 24, bottom: 24, left: 24 }} onChange={(v) => set("advPadding", v)} />
                    <TabSection title="Border" />
                    <InlineSelect label="Border Style" value={props.advBorderStyle ?? "none"} onChange={(v) => set("advBorderStyle", v)} options={[{ value: "none", label: "None" }, { value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }]} />
                    {props.advBorderStyle !== "none" && (<><FourSideField label="Border Width (px)" value={props.advBorderWidth} onChange={(v) => set("advBorderWidth", v)} /><ColorPickerField label="Border Color" value={props.advBorderColor ?? ""} onChange={(v) => set("advBorderColor", v)} /></>)}
                    <FourSideField label="Border Radius (px)" value={props.advBorderRadius} onChange={(v) => set("advBorderRadius", v)} />
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
    quoteText: "The best way to predict the future is to create it.", authorName: "", authorTitle: "", authorImage: "", showQuoteIcon: true,
    quoteFontFamily: "inherit", quoteFontSize: "20px", quoteFontStyle: "italic", quoteTextColor: "", quoteLineHeight: 1.7,
    nameColor: "", nameFontSize: "16px", nameFontWeight: "700", titleColor: "", titleFontSize: "14px", imageSize: "48px", imageBorderRadius: "50px",
    iconColor: "", iconSize: "48px", iconPosition: "top-left",
    borderType: "left", borderColor: "", borderWidth: 4,
    bgColor: "",
    alignment: "left",
    advBgType: "none", advBgColorWrap: "", advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 24, right: 24, bottom: 24, left: 24 },
    advBorderStyle: "none", advBorderWidth: { top: 0, right: 0, bottom: 0, left: 0 }, advBorderColor: "", advBorderRadius: { top: 0, right: 0, bottom: 0, left: 0 },
    hideDesktop: false, responsiveSpacing: {}, hideTablet: false, hideMobile: false, cssId: "", cssClass: "", zIndex: null,
  },
  render: ({ quoteText, authorName, authorTitle, authorImage, showQuoteIcon, quoteFontFamily, quoteFontSize, quoteFontStyle, quoteTextColor, quoteLineHeight, nameColor, nameFontSize, nameFontWeight, titleColor, titleFontSize, imageSize, imageBorderRadius, iconColor, iconSize, iconPosition, borderType, borderColor, borderWidth, bgColor, alignment, advBgType, advBgColorWrap, advMargin, advPadding, advBorderStyle, advBorderWidth, advBorderColor, advBorderRadius, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex, id, responsiveSpacing }: any) => {
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const borderMap: Record<string, React.CSSProperties> = {
      none: {},
      left: { borderLeft: `${borderWidth || 4}px solid ${borderColor || "var(--primary-color)"}`, paddingLeft: 20 },
      top: { borderTop: `${borderWidth || 4}px solid ${borderColor || "var(--primary-color)"}`, paddingTop: 20 },
      box: { border: `${borderWidth || 2}px solid ${borderColor || "var(--primary-color)"}`, padding: 16 },
    };
    const wrapBg = advBgType === "color" && advBgColorWrap ? { backgroundColor: advBgColorWrap } : {};
    const quoteIconSvg = (
      <svg width={iconSize || "3rem"} height={iconSize || "3rem"} viewBox="0 0 24 24" fill={iconColor || "var(--primary-color)"} style={{ opacity: 0.15 }}>
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
      </svg>
    );
    return (
      <div id={cssId || undefined}
        data-pb-rs={id} className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined} style={{ position: "relative", textAlign: alignment as any, paddingTop: advPadding?.top ?? 24, paddingRight: advPadding?.right ?? 24, paddingBottom: advPadding?.bottom ?? 24, paddingLeft: advPadding?.left ?? 24, marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0, marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0, zIndex: zIndex ?? undefined, borderTopLeftRadius: advBorderRadius?.top ?? 0, borderTopRightRadius: advBorderRadius?.right ?? 0, borderBottomRightRadius: advBorderRadius?.bottom ?? 0, borderBottomLeftRadius: advBorderRadius?.left ?? 0, ...(advBorderStyle && advBorderStyle !== "none" ? { borderStyle: advBorderStyle, borderTopWidth: advBorderWidth?.top ?? 0, borderRightWidth: advBorderWidth?.right ?? 0, borderBottomWidth: advBorderWidth?.bottom ?? 0, borderLeftWidth: advBorderWidth?.left ?? 0, borderColor: advBorderColor || "currentColor" } : {}), ...wrapBg }}>
        <EditorHideOverlay hideDesktop={hideDesktop} hideTablet={hideTablet} hideMobile={hideMobile} />
        {(() => { const rsCss = buildResponsiveSpacingCss(`[data-pb-rs="${id}"]`, responsiveSpacing); return rsCss ? <style>{rsCss}</style> : null; })()}
        <blockquote style={{ margin: 0, position: "relative", backgroundColor: bgColor || "transparent", padding: bgColor ? 24 : 0, borderRadius: bgColor ? 8 : 0, ...borderMap[borderType ?? "left"] }}>
          {showQuoteIcon && <div style={{ display: "flex", justifyContent: iconPosition === "top-right" ? "flex-end" : "flex-start", marginBottom: 8 }}>{quoteIconSvg}</div>}
          <p style={{ fontSize: quoteFontSize || "1.25rem", fontFamily: quoteFontFamily !== "inherit" ? quoteFontFamily : undefined, fontStyle: quoteFontStyle || "italic", color: quoteTextColor || "var(--text-color)", lineHeight: quoteLineHeight || "1.7", margin: "0 0 16px 0" }}>"{quoteText}"</p>
          {(authorName || authorImage) && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: alignment === "center" ? "center" : alignment === "right" ? "flex-end" : "flex-start" }}>
              {authorImage && <img src={authorImage} alt={authorName || ""} style={{ width: imageSize || "48px", height: imageSize || "48px", borderRadius: imageBorderRadius || "50%", objectFit: "cover", flexShrink: 0 }} />}
              <div>
                {authorName && <div style={{ fontSize: nameFontSize || "1rem", fontWeight: nameFontWeight || "700", color: nameColor || "var(--text-color)" }}>{authorName}</div>}
                {authorTitle && <div style={{ fontSize: titleFontSize || "0.875rem", color: titleColor || "var(--text-color)", opacity: 0.7 }}>{authorTitle}</div>}
              </div>
            </div>
          )}
        </blockquote>
      </div>
    );
  },
};

export { BlockQuoteComponent };
