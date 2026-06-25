// @ts-nocheck
// ─── AlertComponent ───

import type * as React from "react";
import { useState } from "react";
import { usePuck } from "@my-app/puck-editor";
import {
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

const AlertComponent = {
  label: "Alert",
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
          <BlockTabBar blockKey="Alert">
            {(tab) => (
              <>
                {tab === "content" && (
                  <>
                    <StackedTextField label="Title" value={props.alertTitle ?? ""} onChange={(v) => set("alertTitle", v)} placeholder="Alert title..." />
                    <StackedTextareaField label="Message" value={props.message ?? ""} onChange={(v) => set("message", v)} placeholder="Alert message..." rows={3} />
                    <InlineSelect label="Type" value={props.alertType ?? "info"} onChange={(v) => set("alertType", v)} options={[{ value: "info", label: "Info" }, { value: "success", label: "Success" }, { value: "warning", label: "Warning" }, { value: "error", label: "Error" }, { value: "custom", label: "Custom" }]} />
                    <ToggleField label="Show Icon" value={props.showIcon !== false} onChange={(v) => set("showIcon", v)} />
                    <ImageField label="Custom Icon" value={props.customIcon ?? ""} onChange={(v) => set("customIcon", v)} />
                    <ToggleField label="Dismissible" value={!!props.dismissible} onChange={(v) => set("dismissible", v)} />
                  </>
                )}
                {tab === "style" && (
                  <>
                    {(props.alertType ?? "info") === "custom" && (
                      <>
                        <TabSection title="Colors" />
                        <ColorPickerField label="Background Color" value={props.bgColor ?? ""} onChange={(v) => set("bgColor", v)} />
                        <ColorPickerField label="Text Color" value={props.textColor ?? ""} onChange={(v) => set("textColor", v)} />
                        <ColorPickerField label="Border Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
                        <ColorPickerField label="Icon Color" value={props.iconColor ?? ""} onChange={(v) => set("iconColor", v)} />
                      </>
                    )}
                    <TabSection title="Typography" />
                    <SliderNumberField label="Title Font Size (px)" value={props.titleFontSize ?? 16} onChange={(v) => set("titleFontSize", v)} min={8} max={72} step={1} unit="px" />
                    <InlineSelect label="Title Font Weight" value={props.titleFontWeight ?? "700"} onChange={(v) => set("titleFontWeight", v)} options={[{ value: "400", label: "Normal" }, { value: "700", label: "Bold" }]} />
                    <SliderNumberField label="Message Font Size (px)" value={props.msgFontSize ?? 14} onChange={(v) => set("msgFontSize", v)} min={8} max={48} step={1} unit="px" />
                    <SliderNumberField label="Line Height" value={props.lineHeight ?? 15} onChange={(v) => set("lineHeight", v)} min={10} max={30} step={1} unit="" />
                    <TabSection title="Border" />
                    <InlineSelect label="Border Style" value={props.borderStyle ?? "solid"} onChange={(v) => set("borderStyle", v)} options={[{ value: "none", label: "None" }, { value: "solid", label: "Solid" }, { value: "left-only", label: "Left Only" }]} />
                    <SliderNumberField label="Border Width (px)" value={props.borderWidth ?? 1} onChange={(v) => set("borderWidth", v)} min={1} max={10} step={1} unit="px" />
                    <SliderNumberField label="Border Radius (px)" value={props.borderRadius ?? 8} onChange={(v) => set("borderRadius", v)} min={0} max={50} step={1} unit="px" />
                  </>
                )}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 16, right: 16, bottom: 16, left: 16 }} onChange={(v) => set("advPadding", v)} />
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
    alertTitle: "", message: "This is an important message.", alertType: "info", showIcon: true, customIcon: "", dismissible: false,
    bgColor: "", textColor: "", borderColor: "", iconColor: "",
    titleFontSize: 16, titleFontWeight: "700", msgFontSize: 14, lineHeight: 15,
    borderStyle: "solid", borderWidth: 1, borderRadius: 8,
    advBgType: "none", advBgColor: "", advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 16, right: 16, bottom: 16, left: 16 },
    hideDesktop: false, responsiveSpacing: {}, hideTablet: false, hideMobile: false, cssId: "", cssClass: "", zIndex: null,
  },
  render: ({ alertTitle, message, alertType, showIcon, customIcon, dismissible, bgColor, textColor, borderColor, iconColor, titleFontSize, titleFontWeight, msgFontSize, lineHeight, borderStyle, borderWidth, borderRadius, advBgType, advBgColor, advMargin, advPadding, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex, id, responsiveSpacing }: any) => {
    const [dismissed, setDismissed] = useState(false);
    const typeMap: Record<string, { bg: string; text: string; border: string; icon: string }> = {
      info:    { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe", icon: "ℹ️" },
      success: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", icon: "✅" },
      warning: { bg: "#fffbeb", text: "#92400e", border: "#fde68a", icon: "⚠️" },
      error:   { bg: "#fef2f2", text: "#991b1b", border: "#fecaca", icon: "❌" },
      custom:  { bg: "#f9fafb", text: "#111827", border: "#e5e7eb", icon: "🔔" },
    };
    const t = typeMap[alertType ?? "info"] ?? typeMap.info;
    const isCustomType = (alertType ?? "info") === "custom";
    const resolvedBg = (isCustomType && bgColor) ? bgColor : t.bg;
    const resolvedText = (isCustomType && textColor) ? textColor : t.text;
    const resolvedBorder = (isCustomType && borderColor) ? borderColor : t.border;
    const isImgIcon = customIcon && (customIcon.startsWith("http") || customIcon.startsWith("/") || customIcon.startsWith("data:"));
    const resolvedIcon = isImgIcon ? null : (customIcon || t.icon);
    const titleFs = `${Number(titleFontSize) || 16}px`;
    const msgFs = `${Number(msgFontSize) || 14}px`;
    const lh = Number(lineHeight) ? Number(lineHeight) / 10 : 1.5;
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    if (dismissed) return null;
    const borderCss: React.CSSProperties = borderStyle === "left-only"
      ? { borderLeft: `${borderWidth || 4}px solid ${resolvedBorder}` }
      : borderStyle !== "none"
      ? { border: `${borderWidth || 1}px solid ${resolvedBorder}` }
      : {};
    return (
      <div id={cssId || undefined}
        data-pb-rs={id} className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined} style={{ paddingTop: advPadding?.top ?? 16, paddingRight: advPadding?.right ?? 16, paddingBottom: advPadding?.bottom ?? 16, paddingLeft: advPadding?.left ?? 16, marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0, marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0, backgroundColor: resolvedBg, color: resolvedText, borderRadius: borderRadius ?? 8, zIndex: zIndex ?? undefined, position: "relative", lineHeight: lh, ...borderCss, ...(advBgType === "color" && advBgColor ? { backgroundColor: advBgColor } : {}) }}>
        <EditorHideOverlay hideDesktop={hideDesktop} hideTablet={hideTablet} hideMobile={hideMobile} />
        {(() => { const rsCss = buildResponsiveSpacingCss(`[data-pb-rs="${id}"]`, responsiveSpacing); return rsCss ? <style>{rsCss}</style> : null; })()}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          {showIcon && (isImgIcon
            ? <img src={customIcon} alt="icon" style={{ width: "1.5rem", height: "1.5rem", objectFit: "contain", flexShrink: 0, borderRadius: 0 }} />
            : <span style={{ fontSize: "1.25rem", color: (isCustomType && iconColor) ? iconColor : resolvedText, flexShrink: 0, lineHeight: 1.3 }}>{resolvedIcon}</span>
          )}
          <div style={{ flex: 1 }}>
            {alertTitle && <div style={{ fontSize: titleFs, fontWeight: titleFontWeight || "700", marginBottom: 4 }}>{alertTitle}</div>}
            <div style={{ fontSize: msgFs }}>{message}</div>
          </div>
          {dismissible && <button onClick={() => setDismissed(true)} style={{ background: "none", border: "none", cursor: "pointer", color: resolvedText, fontSize: "1.2rem", lineHeight: 1, padding: 0, opacity: 0.6, flexShrink: 0 }}>×</button>}
        </div>
      </div>
    );
  },
};

export { AlertComponent };
