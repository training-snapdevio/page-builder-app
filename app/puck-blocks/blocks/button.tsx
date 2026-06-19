// @ts-nocheck
// ─── ButtonComponent ───

import type * as React from "react";
import { useState } from "react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { usePuck } from "@my-app/puck-editor";
import { loadGoogleFont } from "@/puck-splat/utils";
import {
  AlignField,
  ToggleField,
  StackedTextField,
  ColorPickerField,
  StackedField,
  BlockTabBar,
  TabSection,
  FourSideField,
  ResponsiveSpacingField,
  InlineSelect,
  SliderNumberField,
  EditorHideOverlay,
  buildResponsiveSpacingCss,
} from "@/puck-blocks/shared";
import {
  ImageField,
  LinkUrlField,
} from "@/puck-blocks/block-fields";

const ButtonComponent = {
  label: "Button",
  fields: {
    _tabs: {
      type: "custom",
      label: "",
      render: ({ value: _v, onChange: _onChange }: any) => {
        const { selectedItem, appState, dispatch } = usePuck();
        const props = selectedItem?.props ?? {};
        const getZoneInfo = () => {
          const state = appState.data;
          let destinationZone = "root:default-zone";
          let destinationIndex = 0;
          const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
          for (const [zone, items] of Object.entries(zones)) {
            const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem?.props?.id);
            if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
          }
          return { destinationZone, destinationIndex };
        };
        const set = (key: string, val: any) => {
          if (!selectedItem) return;
          const { destinationZone, destinationIndex } = getZoneInfo();
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
        };
        const setMany = (patch: Record<string, any>) => {
          if (!selectedItem) return;
          const { destinationZone, destinationIndex } = getZoneInfo();
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), ...patch } } });
        };

        const bgType = props.advBgType ?? "none";

        return (
          <BlockTabBar blockKey="Button">
            {(tab) => (
              <>
                {/* ── CONTENT TAB ── */}
                {tab === "content" && (
                  <>
                    <StackedTextField label="Label" value={props.label ?? "Click Me"} onChange={(v) => set("label", v)} placeholder="Button label..." />
                    <LinkUrlField value={props.linkUrl ?? ""} onChange={(v) => set("linkUrl", v)} />
                    <InlineSelect
                      label="Icon Type"
                      value={props.iconType ?? "none"}
                      onChange={(v) => setMany({ iconType: v, icon: "" })}
                      options={[
                        { value: "none", label: "None" },
                        { value: "emoji", label: "Emoji" },
                        { value: "svg", label: "SVG" },
                        { value: "image", label: "Upload" },
                      ]}
                    />
                    {props.iconType !== "none" && (
                      props.iconType === "emoji" ? (
                        <StackedTextField label="Icon (emoji)" value={props.icon ?? ""} onChange={(v) => set("icon", v)} placeholder="e.g. 🚀" />
                      ) : props.iconType === "image" ? (
                        <ImageField label="Icon Image" value={props.icon ?? ""} onChange={(v) => set("icon", v)} />
                      ) : (
                        <StackedField label="Icon (SVG code)">
                          <textarea
                            value={props.icon ?? ""}
                            onChange={(e) => set("icon", e.target.value)}
                            placeholder="<svg>...</svg>"
                            style={{ width: "100%", height: 60, padding: "5px 8px", border: "1px solid var(--p-color-border)", borderRadius: "var(--p-border-radius-100, 4px)", fontSize: 12, fontFamily: "monospace", boxSizing: "border-box", outline: "none", resize: "vertical", background: "var(--p-color-bg-surface)", color: "var(--p-color-text)" }}
                          />
                        </StackedField>
                      )
                    )}
                    <ToggleField label="Full Width" value={!!props.fullWidth} onChange={(v) => set("fullWidth", v)} />
                    {!props.fullWidth && (
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
                    )}
                  </>
                )}

                {/* ── STYLE TAB ── */}
                {tab === "style" && (
                  <>
                    <TabSection title="Typography" />
                    <InlineSelect
                      label="Font Family"
                      value={props.fontFamily ?? "inherit"}
                      onChange={(v) => { set("fontFamily", v); loadGoogleFont(v); }}
                      options={[
                        { value: "inherit",                       label: "Theme Default" },
                        { value: "Arial, Helvetica, sans-serif",   label: "Arial" },
                        { value: "Georgia, serif",                 label: "Georgia" },
                        { value: "'Courier New', monospace",       label: "Courier New" },
                        { value: "Impact, sans-serif",             label: "Impact" },
                        { value: "Inter, sans-serif",              label: "Inter" },
                        { value: "Poppins, sans-serif",            label: "Poppins" },
                        { value: "'Roboto Serif', serif",          label: "Roboto Serif" },
                        { value: "'New York', 'New York Small', 'Times New Roman', serif", label: "New York" },
                        { value: "'Open Sans', sans-serif",        label: "Open Sans" },
                      ]}
                    />
                    <SliderNumberField label="Font Size (px)" value={props.fontSize ?? 16} onChange={(v) => set("fontSize", v)} min={8} max={64} step={1} unit="px" />
                    <InlineSelect
                      label="Font Weight"
                      value={String(props.fontWeight ?? "400")}
                      onChange={(v) => set("fontWeight", v)}
                      options={[
                        { value: "400", label: "Normal" },
                        { value: "600", label: "Semi Bold" },
                        { value: "900", label: "Bold" },
                      ]}
                    />
                    <InlineSelect
                      label="Text Transform"
                      value={props.textTransform ?? "capitalize"}
                      onChange={(v) => set("textTransform", v)}
                      options={[
                        { value: "capitalize", label: "Capitalize" },
                        { value: "uppercase", label: "Uppercase" },
                        { value: "lowercase", label: "Lowercase" },
                      ]}
                    />
                    <SliderNumberField label="Letter Spacing (px)" value={props.letterSpacing ?? 0} onChange={(v) => set("letterSpacing", v)} min={-5} max={20} step={0.5} unit="px" />

                    {props.iconType !== "none" && (
                      <>
                        <TabSection title="Icon" />
                        <InlineSelect
                          label="Icon Position"
                          value={props.iconPosition ?? "before"}
                          onChange={(v) => set("iconPosition", v)}
                          options={[
                            { value: "before", label: "Before Label" },
                            { value: "after", label: "After Label" },
                          ]}
                        />
                        {props.iconType === "emoji" && (
                          <SliderNumberField label="Icon Size (px)" value={props.iconSize ?? 20} onChange={(v) => set("iconSize", v)} min={10} max={80} step={1} unit="px" />
                        )}
                        {(props.iconType === "svg" || props.iconType === "image") && (
                          <>
                            <SliderNumberField label="Icon Width (px)" value={props.iconWidth ?? 20} onChange={(v) => set("iconWidth", v)} min={10} max={100} step={1} unit="px" />
                            <SliderNumberField label="Icon Height (px)" value={props.iconHeight ?? 20} onChange={(v) => set("iconHeight", v)} min={10} max={100} step={1} unit="px" />
                          </>
                        )}
                        {props.iconType === "svg" && (
                          <>
                            <ColorPickerField label="Icon Color" value={props.iconColor ?? ""} onChange={(v) => set("iconColor", v)} />
                            <ColorPickerField label="Icon Hover Color" value={props.iconHoverColor ?? ""} onChange={(v) => set("iconHoverColor", v)} />
                          </>
                        )}
                        <SliderNumberField label="Icon Gap (px)" value={props.iconGap ?? 8} onChange={(v) => set("iconGap", v)} min={0} max={40} step={1} unit="px" />
                      </>
                    )}

                    <TabSection title="Normal State" />
                    <ColorPickerField label="Text Color" value={props.textColor ?? ""} onChange={(v) => set("textColor", v)} />
                    <ColorPickerField label="Background Color" value={props.bgColor ?? ""} onChange={(v) => set("bgColor", v)} />
                    <InlineSelect
                      label="Border Style"
                      value={props.borderStyle ?? "none"}
                      onChange={(v) => set("borderStyle", v)}
                      options={[
                        { value: "none", label: "None" },
                        { value: "solid", label: "Solid" },
                        { value: "dashed", label: "Dashed" },
                        { value: "dotted", label: "Dotted" },
                      ]}
                    />
                    {props.borderStyle && props.borderStyle !== "none" && (
                      <>
                        <SliderNumberField label="Border Width (px)" value={props.borderWidth ?? 2} onChange={(v) => set("borderWidth", v)} min={1} max={10} step={1} unit="px" />
                        <ColorPickerField label="Border Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
                      </>
                    )}
                    <SliderNumberField label="Border Radius (px)" value={typeof props.borderRadius === "number" ? props.borderRadius : 6} onChange={(v) => set("borderRadius", v)} min={0} max={100} step={1} unit="PX" />

                    <TabSection title="Hover State" />
                    <ColorPickerField label="Text Hover Color" value={props.hoverTextColor ?? ""} onChange={(v) => set("hoverTextColor", v)} />
                    <ColorPickerField label="Background Hover" value={props.hoverBgColor ?? ""} onChange={(v) => set("hoverBgColor", v)} />
                    <InlineSelect
                      label="Hover Animation"
                      value={props.hoverAnimation ?? "none"}
                      onChange={(v) => set("hoverAnimation", v)}
                      options={[
                        { value: "none", label: "None" },
                        { value: "grow", label: "Grow" },
                        { value: "shrink", label: "Shrink" },
                        { value: "pulse", label: "Pulse" },
                      ]}
                    />

                    <TabSection title="Entrance Animation" />
                    <InlineSelect
                      label="Animation"
                      value={props.entranceAnimation ?? "none"}
                      onChange={(v) => set("entranceAnimation", v)}
                      options={[
                        { value: "none",        label: "None" },
                        { value: "fadeIn",       label: "Fade In" },
                        { value: "fadeInUp",     label: "Fade In Up" },
                        { value: "fadeInDown",   label: "Fade In Down" },
                        { value: "slideInLeft",  label: "Slide In Left" },
                        { value: "slideInRight", label: "Slide In Right" },
                        { value: "zoomIn",       label: "Zoom In" },
                        { value: "bounce",       label: "Bounce" },
                      ]}
                    />
                    {(props.entranceAnimation && props.entranceAnimation !== "none") && (
                      <>
                        <SliderNumberField label="Duration (ms)" value={props.animDuration ?? 600} onChange={(v) => set("animDuration", v)} min={100} max={2000} step={50} unit="MS" />
                        <SliderNumberField label="Delay (ms)" value={props.animDelay ?? 0} onChange={(v) => set("animDelay", v)} min={0} max={3000} step={50} unit="MS" />
                      </>
                    )}

                    <TabSection title="Sizing" />
                    <InlineSelect
                      label="Size Preset"
                      value={props.sizePreset ?? "medium"}
                      onChange={(v) => set("sizePreset", v)}
                      options={[
                        { value: "small", label: "Small" },
                        { value: "medium", label: "Medium" },
                        { value: "large", label: "Large" },
                        { value: "custom", label: "Custom" },
                      ]}
                    />
                    {props.sizePreset === "custom" && (
                      <>
                        <FourSideField label="Padding (px)" value={props.customPadding ?? { top: 12, right: 24, bottom: 12, left: 24 }} onChange={(v) => set("customPadding", v)} />
                      </>
                    )}
                  </>
                )}

                {/* ── ADVANCED TAB ── */}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />

                    {/* Wrapper background is meaningless for a full-width button
                        (the button fills the wrapper), so hide it in that case. */}
                    {!props.fullWidth && (
                      <>
                        <TabSection title="Background" />
                        <InlineSelect
                          label="Wrapper BG Type"
                          value={bgType}
                          onChange={(v) => set("advBgType", v)}
                          options={[
                            { value: "none", label: "None" },
                            { value: "color", label: "Color" },
                          ]}
                        />
                        {bgType === "color" && (
                          <ColorPickerField label="Wrapper BG Color" value={props.advBgColor ?? ""} onChange={(v) => set("advBgColor", v)} />
                        )}
                      </>
                    )}

                    <TabSection title="Responsive Spacing" />
                    <ResponsiveSpacingField value={props.responsiveSpacing} onChange={(v) => set("responsiveSpacing", v)} />
                    <TabSection title="Responsive" />
                    <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                    <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
                    <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />

                    <SliderNumberField label="Opacity (%)" value={props.opacity ?? 100} onChange={(v) => set("opacity", v)} min={0} max={100} step={1} unit="%" />
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
    label: "Click Me",
    linkUrl: "",
    linkTarget: "_blank",
    iconType: "none",
    icon: "",
    iconPosition: "before",
    iconSize: 20,
    iconWidth: 20,
    iconHeight: 20,
    iconColor: "",
    iconHoverColor: "",
    iconGap: 8,
    fullWidth: false,
    alignment: "left",
    fontFamily: "inherit",
    fontSize: null,
    fontWeight: "400",
    textTransform: "capitalize",
    letterSpacing: null,
    textColor: "#ffffff",
    bgColor: "var(--primary-color, #0158ad)",
    borderStyle: "none",
    borderWidth: 2,
    borderColor: "",
    borderRadius: 6,
    hoverTextColor: "",
    hoverBgColor: "",
    hoverBorderColor: "",
    hoverAnimation: "none",
    entranceAnimation: "none",
    animDuration: 600,
    animDelay: 0,
    sizePreset: "medium",
    customPadding: { top: 12, right: 24, bottom: 12, left: 24 },
    advBgType: "none",
    advBgColor: "",
    advMargin: { top: 0, right: 0, bottom: 0, left: 0 },
    hideDesktop: false, responsiveSpacing: {},
    hideTablet: false,
    hideMobile: false,
    cssId: "",
    cssClass: "",
    customCss: "",
    zIndex: null,
    opacity: 100,
  },

  render: ({
    label,
    linkUrl,
    linkTarget,
    iconType,
    icon,
    iconPosition,
    iconSize,
    iconWidth,
    iconHeight,
    iconColor,
    iconHoverColor,
    iconGap,
    fullWidth,
    alignment,
    fontFamily,
    fontSize,
    fontWeight,
    textTransform,
    letterSpacing,
    textColor,
    bgColor,
    borderStyle,
    borderWidth,
    borderColor,
    borderRadius,
    hoverTextColor,
    hoverBgColor,
    hoverBorderColor,
    hoverAnimation,
    entranceAnimation,
    animDuration,
    animDelay,
    sizePreset,
    customPadding,
    advBgType,
    advBgColor,
    advMargin,
    hideDesktop,
    hideTablet,
    hideMobile,
    responsiveSpacing,
    id,
    cssId,
    cssClass,
    customCss,
    zIndex,
    opacity,
  }: any) => {
    const [hovered, setHovered] = useState(false);

    const sizeMap: Record<string, React.CSSProperties> = {
      small:  { paddingTop: 8,  paddingRight: 16, paddingBottom: 8,  paddingLeft: 16 },
      medium: { paddingTop: 12, paddingRight: 24, paddingBottom: 12, paddingLeft: 24 },
      large:  { paddingTop: 16, paddingRight: 32, paddingBottom: 16, paddingLeft: 32 },
      custom: customPadding ? { paddingTop: customPadding.top, paddingRight: customPadding.right, paddingBottom: customPadding.bottom, paddingLeft: customPadding.left } : {},
    };

    const padding = sizeMap[sizePreset ?? "medium"] ?? sizeMap.medium;

    // Numeric borderRadius → px string; string passthrough for legacy values; 0 means sharp corners
    const borderRadiusValue = typeof borderRadius === "number" ? `${borderRadius}px` : (borderRadius != null && borderRadius !== "" ? borderRadius : "6px");

    const btnClass = `puck-btn-${cssId || "b"}`;

    // Entrance animation keyframes
    const entranceFromMap: Record<string, string> = {
      fadeIn:       "opacity:0",
      fadeInUp:     "opacity:0;transform:translateY(20px)",
      fadeInDown:   "opacity:0;transform:translateY(-20px)",
      slideInLeft:  "opacity:0;transform:translateX(-30px)",
      slideInRight: "opacity:0;transform:translateX(30px)",
      zoomIn:       "opacity:0;transform:scale(0.85)",
      bounce:       "opacity:0;transform:translateY(-20px)",
    };
    const anim = entranceAnimation && entranceAnimation !== "none" ? entranceAnimation : null;
    const animCss = anim && entranceFromMap[anim] ? `
      @keyframes puck-btn-${anim} { from{${entranceFromMap[anim]}} to{opacity:1;transform:none} }
      .${btnClass}-wrap { animation: puck-btn-${anim} ${animDuration ?? 600}ms ease ${animDelay ?? 0}ms both; }
    ` : "";

    const hoverCss = `
      .${btnClass}:hover {
        ${hoverTextColor ? `color: ${hoverTextColor} !important;` : ""}
        ${hoverBgColor ? `background: ${hoverBgColor} !important;` : ""}
        ${hoverBorderColor ? `border-color: ${hoverBorderColor} !important;` : ""}
        ${hoverAnimation === "grow" ? "transform: scale(1.05);" : ""}
        ${hoverAnimation === "shrink" ? "transform: scale(0.96);" : ""}
        ${hoverAnimation === "pulse" ? "animation: puck-pulse 0.6s ease;" : ""}
      }
      ${iconType === "svg" && iconHoverColor ? `.${btnClass}:hover svg { color: ${iconHoverColor} !important; fill: ${iconHoverColor} !important; }` : ""}
      .${btnClass} { transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease, transform 0.2s ease, opacity 0.2s ease; }
      @keyframes puck-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
    `;

    // Derive hover override styles applied via React state (works inside Puck editor where :hover CSS may not fire)
    const hoverOverrides: React.CSSProperties = hovered ? {
      ...(hoverTextColor ? { color: hoverTextColor } : {}),
      ...(hoverBgColor ? { background: hoverBgColor } : {}),
      ...(hoverBorderColor ? { borderColor: hoverBorderColor } : {}),
      ...(hoverAnimation === "grow" ? { transform: "scale(1.05)" } : {}),
      ...(hoverAnimation === "shrink" ? { transform: "scale(0.96)" } : {}),
    } : {};

    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const wrapBg = advBgType === "color" && advBgColor ? { backgroundColor: advBgColor } : {};

    const showIcon = iconType !== "none" && icon;
    const iconEl = showIcon && (
      iconType === "emoji" ? (
        <span style={{ fontSize: iconSize ?? 20, lineHeight: 1 }}>{icon}</span>
      ) : iconType === "image" ? (
        <img src={icon} alt="" style={{ width: iconWidth ?? 20, height: iconHeight ?? 20, objectFit: "contain", display: "block", flexShrink: 0 }} />
      ) : icon && icon.trimStart().startsWith("<svg") ? (
        <span
          style={{ display: "inline-flex", alignItems: "center", width: iconWidth ?? 20, height: iconHeight ?? 20, flexShrink: 0, color: (hovered && iconHoverColor) ? iconHoverColor : (iconColor || "currentColor"), fill: (hovered && iconHoverColor) ? iconHoverColor : (iconColor || "currentColor") }}
          dangerouslySetInnerHTML={{ __html: icon.replace(/<svg\b/, `<svg style="width:${iconWidth ?? 20}px;height:${iconHeight ?? 20}px;color:${iconColor || "currentColor"};fill:${iconColor || "currentColor"}"`) }}
        />
      ) : (
        <svg
          width={iconWidth ?? 20}
          height={iconHeight ?? 20}
          viewBox="0 0 24 24"
          dangerouslySetInnerHTML={{ __html: icon }}
          style={{ color: iconColor || "currentColor", fill: "currentColor" }}
        />
      )
    );

    const btnEl = (
      <button
        className={btnClass}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: fullWidth ? "flex" : "inline-flex",
          width: fullWidth ? "100%" : undefined,
          alignItems: "center",
          justifyContent: "center",
          gap: showIcon ? (iconGap ?? 8) : 0,
          ...padding,
          fontFamily: fontFamily && fontFamily !== "inherit" ? fontFamily : "var(--font-family)",
          fontSize: fontSize ? `${fontSize}px` : undefined,
          fontWeight: fontWeight ?? "400",
          textTransform: (textTransform ?? "capitalize") as any,
          letterSpacing: letterSpacing != null ? `${letterSpacing}px` : undefined,
          color: textColor || "#fff",
          background: bgColor || "var(--primary-color, #0158ad)",
          border: borderStyle !== "none" ? `${borderWidth ?? 2}px ${borderStyle} ${borderColor || "transparent"}` : "none",
          borderRadius: borderRadiusValue,
          cursor: "pointer",
          opacity: opacity != null ? opacity / 100 : 1,
          textDecoration: "none",
          transition: "color 0.2s ease, background 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
          ...hoverOverrides,
        }}
      >
        {showIcon && iconPosition === "before" && iconEl}
        {label || "Button"}
        {showIcon && iconPosition === "after" && iconEl}
      </button>
    );

    return (
      <div
        id={cssId || undefined}
        data-pb-rs={id}
        className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined}
        style={{ position: "relative", textAlign: !fullWidth ? (alignment as any) : undefined, zIndex: zIndex ?? undefined, marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0, marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0, ...wrapBg }}
      >
        <EditorHideOverlay hideDesktop={hideDesktop} hideTablet={hideTablet} hideMobile={hideMobile} />
        {(() => { const rsCss = buildResponsiveSpacingCss(`[data-pb-rs="${id}"]`, responsiveSpacing); return rsCss ? <style>{rsCss}</style> : null; })()}
        <style>{animCss}{hoverCss}{customCss ? `.${btnClass} { ${customCss} }` : ""}</style>
        {/* key on anim+duration+delay forces remount → replays animation in editor when settings change */}
        <div className={`${btnClass}-wrap`} key={`${anim}-${animDuration}-${animDelay}`} style={{ display: fullWidth ? "block" : "inline-block" }}>
          {linkUrl
            ? <a href={linkUrl} target={linkTarget ?? "_blank"} rel="noopener noreferrer" style={{ textDecoration: "none", display: fullWidth ? "block" : "inline-block" }}>{btnEl}</a>
            : btnEl
          }
        </div>
      </div>
    );
  },
};

export { ButtonComponent };
