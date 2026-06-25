// @ts-nocheck
// ─── ShareButtonsComponent ───

import { useState } from "react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { usePuck } from "@my-app/puck-editor";
import {
  AlignField,
  ToggleField,
  ColorPickerField,
  BlockTabBar,
  TabSection,
  FourSideField,
  InlineSelect,
  SliderNumberField,
  EditorHideOverlay,
  buildResponsiveSpacingCss,
} from "@/puck-blocks/shared";

const SHARE_PLATFORMS = [
  { key: "facebook",  label: "Facebook",  brandColor: "#1877F2", icon: "f" },
  { key: "twitter",   label: "Twitter",   brandColor: "#000000", icon: "𝕏" },
  { key: "whatsapp",  label: "WhatsApp",  brandColor: "#25D366", icon: "W" },
  { key: "pinterest", label: "Pinterest", brandColor: "#E60023", icon: "P" },
  { key: "email",     label: "Email",     brandColor: "#6b7280", icon: "✉" },
  { key: "copy",      label: "Copy Link", brandColor: "#374151", icon: "🔗" },
];

const ShareButtonsComponent = {
  label: "Share Buttons",
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
        const enabled: string[] = props.enabled ?? SHARE_PLATFORMS.map(p => p.key);
        const labels: Record<string, string> = props.labels ?? {};
        const bgType = props.advBgType ?? "none";
        return (
          <BlockTabBar blockKey="ShareButtons">
            {(tab) => (
              <>
                {tab === "content" && (
                  <>
                    <TabSection title="Platforms" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                      {SHARE_PLATFORMS.map((pl, i) => {
                        const isOn = enabled.includes(pl.key);
                        return (
                          <div key={pl.key}>
                            {/* Platform row: name left, toggle right */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
                              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--p-color-text)" }}>{pl.label}</span>
                              <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", flexShrink: 0 }}>
                                <input
                                  type="checkbox"
                                  checked={isOn}
                                  onChange={(e) => set("enabled", e.target.checked ? [...enabled, pl.key] : enabled.filter(k => k !== pl.key))}
                                  style={{ display: "none" }}
                                />
                                <span style={{
                                  display: "inline-block", width: 32, height: 18, borderRadius: 9,
                                  background: isOn ? "#1a1a1a" : "#d1d5db",
                                  position: "relative", transition: "background 0.15s",
                                }}>
                                  <span style={{
                                    position: "absolute", top: 2, left: isOn ? 16 : 2,
                                    width: 14, height: 14, borderRadius: "50%", background: "#fff",
                                    transition: "left 0.15s",
                                  }} />
                                </span>
                              </label>
                            </div>
                            {/* Custom label input only when enabled */}
                            {isOn && (
                              <div style={{ paddingBottom: 6 }}>
                                <input
                                  type="text"
                                  value={labels[pl.key] ?? pl.label}
                                  placeholder={pl.label}
                                  onChange={(e) => set("labels", { ...labels, [pl.key]: e.target.value })}
                                  style={{
                                    width: "100%", padding: "4px 8px", fontSize: 12, boxSizing: "border-box",
                                    border: "1px solid var(--p-color-border)", borderRadius: 4,
                                    background: "var(--p-color-bg-surface)", color: "var(--p-color-text)",
                                    outline: "none",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
                {tab === "style" && (
                  <>
                    <TabSection title="Button Style" />
                    <InlineSelect label="Style" value={props.btnStyle ?? "icon-text"} onChange={(v) => set("btnStyle", v)} options={[{ value: "icon-only", label: "Icon Only" }, { value: "icon-text", label: "Icon + Text" }, { value: "text-only", label: "Text Only" }]} />
                    <InlineSelect label="Size" value={props.btnSize ?? "medium"} onChange={(v) => set("btnSize", v)} options={[{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }]} />
                    <SliderNumberField label="Border Radius (px)" value={props.borderRadius ?? 6} onChange={(v) => set("borderRadius", v)} min={0} max={50} step={1} unit="px" />
                    <SliderNumberField label="Spacing Between (px)" value={props.spacing ?? 8} onChange={(v) => set("spacing", v)} min={0} max={60} step={1} unit="px" />
                    <TabSection title="Colors" />
                    <ColorPickerField label="Icon Color" value={props.iconColor ?? ""} onChange={(v) => set("iconColor", v)} />
                    <ColorPickerField label="Text Color" value={props.textColor ?? ""} onChange={(v) => set("textColor", v)} />
                    <ColorPickerField label="Background Color" value={props.bgColor ?? ""} onChange={(v) => set("bgColor", v)} />
                    <ColorPickerField label="Hover Background" value={props.hoverBg ?? ""} onChange={(v) => set("hoverBg", v)} />
                    <ToggleField label="Use Brand Colors" value={!!props.useBrandColors} onChange={(v) => set("useBrandColors", v)} />
                    <TabSection title="Typography" />
                    <SliderNumberField label="Font Size (px)" value={props.fontSize ?? 14} onChange={(v) => set("fontSize", v)} min={8} max={36} step={1} unit="px" />
                    <InlineSelect label="Font Weight" value={props.fontWeight ?? "600"} onChange={(v) => set("fontWeight", v)} options={[{ value: "400", label: "Normal" }, { value: "600", label: "Semi Bold" }, { value: "700", label: "Bold" }]} />
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
    enabled: ["facebook", "twitter", "whatsapp", "email", "copy"],
    labels: {}, showLabel: true,
    btnStyle: "icon-text", btnSize: "medium", borderRadius: 6, spacing: 8,
    iconColor: "", textColor: "", bgColor: "", hoverBg: "", useBrandColors: false,
    fontSize: 14, fontWeight: "600",
    alignment: "left",
    advBgType: "none", advBgColor: "", advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 8, right: 0, bottom: 8, left: 0 },
    hideDesktop: false, responsiveSpacing: {}, hideTablet: false, hideMobile: false, cssId: "", cssClass: "", zIndex: null,
  },
  render: ({ enabled, labels, showLabel, btnStyle, btnSize, borderRadius, spacing, iconColor, textColor, bgColor, hoverBg, useBrandColors, fontSize, fontWeight, alignment, advBgType, advBgColor, advMargin, advPadding, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex, id: puckId, responsiveSpacing }: any) => {
    const [copied, setCopied] = useState(false);
    const id = cssId || `share-${puckId?.slice(-6) || "blk"}`;
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const resolvedFontSize = `${Number(fontSize) || 14}px`;
    const sizeMap = { small: { px: "8px 12px", fs: "12px" }, medium: { px: "10px 16px", fs: resolvedFontSize }, large: { px: "12px 20px", fs: "16px" } };
    const s = sizeMap[btnSize ?? "medium"] ?? sizeMap.medium;
    const hoverCss = hoverBg ? `#${id} .puck-share-btn:hover { background: ${hoverBg} !important; transition: background 0.2s; } #${id} .puck-share-btn { transition: background 0.2s; }` : "";
    const platforms = SHARE_PLATFORMS.filter(p => (enabled ?? []).includes(p.key));
    const handleShare = (key: string) => {
      const pageUrl = typeof window !== "undefined" ? window.location.href : "#";
      const shareUrls: Record<string, string> = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
        twitter:  `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(pageUrl)}`,
        pinterest:`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(pageUrl)}`,
        email:    `mailto:?body=${encodeURIComponent(pageUrl)}`,
      };
      if (key === "copy") {
        navigator.clipboard?.writeText(pageUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
      } else if (shareUrls[key]) {
        window.open(shareUrls[key], "_blank", "noopener,noreferrer");
      }
    };
    return (
      <div id={id} data-pb-rs={id} className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined} style={{ position: "relative", paddingTop: advPadding?.top ?? 8, paddingRight: advPadding?.right ?? 0, paddingBottom: advPadding?.bottom ?? 8, paddingLeft: advPadding?.left ?? 0, marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0, marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0, zIndex: zIndex ?? undefined, ...(advBgType === "color" && advBgColor ? { backgroundColor: advBgColor } : {}) }}>
        <EditorHideOverlay hideDesktop={hideDesktop} hideTablet={hideTablet} hideMobile={hideMobile} />
        {(() => { const rsCss = buildResponsiveSpacingCss(`[data-pb-rs="${id}"]`, responsiveSpacing); return rsCss ? <style>{rsCss}</style> : null; })()}
        {hoverCss && <style>{hoverCss}</style>}
        <div style={{ display: "flex", gap: `${Number(spacing) || 8}px`, flexWrap: "wrap", justifyContent: alignment === "center" ? "center" : alignment === "right" ? "flex-end" : "flex-start" }}>
          {platforms.map(p => {
            const resolvedBg = useBrandColors ? p.brandColor : (bgColor || "#f3f4f6");
            const resolvedText = useBrandColors ? "#fff" : (textColor || "var(--text-color)");
            const resolvedIcon = useBrandColors ? "#fff" : (iconColor || "var(--text-color)");
            const isCopy = p.key === "copy";
            const btnLabel = (labels as any)?.[p.key] ?? p.label;
            return (
              <button key={p.key} className="puck-share-btn" onClick={() => handleShare(p.key)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: s.px, fontSize: s.fs, fontWeight: fontWeight || "600", color: resolvedText, backgroundColor: resolvedBg, border: "none", borderRadius: `${borderRadius != null ? Number(borderRadius) : 6}px`, cursor: "pointer" }}>
                {btnStyle !== "text-only" && <span style={{ color: resolvedIcon, fontWeight: 700 }}>{isCopy && copied ? "✓" : p.icon}</span>}
                {btnStyle !== "icon-only" && showLabel && <span>{isCopy && copied ? "Copied!" : btnLabel}</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  },
};

export { ShareButtonsComponent };
