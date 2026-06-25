// @ts-nocheck
// ─── SocialIconsComponent ───

import type * as React from "react";
import { useEffect, useState as useLocalState } from "react";
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

const SOCIAL_PLATFORM_SVGS: Record<string, React.ReactNode> = {
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  pinterest: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
    </svg>
  ),
  snapchat: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d="M12.065.003c.157-.003.313-.003.47 0 1.65.029 5.503.597 7.37 4.688.562 1.244.618 3.104.483 4.603l.006.004c.173.087.44.145.783.145.42 0 .896-.085 1.29-.274.17-.082.358-.12.539-.12.358 0 .72.156.953.43.284.33.329.73.114 1.083-.297.49-.946.8-1.583 1.02-.158.054-.328.107-.5.157-.405.12-.825.245-.954.484-.069.13-.068.294.007.527.334 1.04 1.165 2.703 2.986 3.735.188.106.265.335.183.534-.097.231-.366.48-.836.697-1.044.485-2.403.637-3.658.42-.143-.026-.278-.053-.407-.079-.27-.053-.513-.1-.745-.117-.34-.022-.64.037-.861.245-.125.12-.207.27-.272.453-.177.508-.293 1.17-.39 1.63-.016.079-.04.137-.069.18-.108.155-.335.248-.63.248-.186 0-.43-.042-.65-.156-.275-.14-.563-.217-.852-.217-.11 0-.22.01-.327.03-.48.084-.853.242-1.156.375-.499.214-.84.354-1.398.354-.535 0-.864-.133-1.35-.344-.303-.133-.676-.292-1.158-.376a2.45 2.45 0 00-.327-.03c-.29 0-.577.077-.852.218-.22.113-.464.155-.65.155-.295 0-.522-.093-.63-.248-.03-.043-.054-.101-.07-.18-.096-.46-.213-1.121-.389-1.63-.065-.182-.147-.332-.272-.452-.221-.208-.52-.267-.86-.245-.233.017-.476.064-.746.117-.128.026-.264.053-.406.079-1.256.217-2.614.065-3.658-.42-.47-.217-.74-.466-.836-.697-.082-.2-.005-.428.183-.534 1.821-1.032 2.652-2.695 2.986-3.735.074-.233.076-.396.007-.527-.129-.239-.549-.364-.954-.484-.172-.05-.342-.103-.5-.157-.637-.22-1.286-.53-1.583-1.02-.215-.353-.17-.754.114-1.083.233-.274.595-.43.953-.43.181 0 .369.038.539.12.393.189.868.274 1.288.274.344 0 .612-.058.785-.145l.006-.004c-.135-1.499-.08-3.359.483-4.604C6.558.597 10.41.029 12.065.003z"/>
    </svg>
  ),
};

const SOCIAL_PLATFORMS = [
  { key: "facebook",  label: "Facebook",  brandColor: "#1877F2" },
  { key: "instagram", label: "Instagram", brandColor: "#E1306C" },
  { key: "twitter",   label: "Twitter/X", brandColor: "#000000" },
  { key: "youtube",   label: "YouTube",   brandColor: "#FF0000" },
  { key: "tiktok",    label: "TikTok",    brandColor: "#000000" },
  { key: "linkedin",  label: "LinkedIn",  brandColor: "#0A66C2" },
  { key: "pinterest", label: "Pinterest", brandColor: "#E60023" },
  { key: "snapchat",  label: "Snapchat",  brandColor: "#FFFC00" },
];

const SOCIAL_URL_PATTERN = /^(https?:\/\/|\/)/;

function SocialUrlInput({ platform, value, onChange }: { platform: string; value: string; onChange: (v: string) => void }) {
  const [draft, setDraft] = useLocalState(value);
  const [touched, setTouched] = useLocalState(false);
  useEffect(() => { setDraft(value); }, [value]);

  const isValid = !draft || SOCIAL_URL_PATTERN.test(draft);
  const showError = touched && draft && !isValid;

  const commit = (raw: string) => {
    setTouched(true);
    const v = raw.trim();
    if (!v || SOCIAL_URL_PATTERN.test(v)) onChange(v);
  };

  return (
    <div style={{ paddingBottom: 6 }}>
      <input
        type="url"
        value={draft}
        placeholder={`${platform} URL…`}
        onChange={(e) => { setDraft(e.target.value); setTouched(false); }}
        onBlur={(e) => commit(e.target.value)}
        style={{
          width: "100%", padding: "4px 8px", fontSize: 12, boxSizing: "border-box",
          border: `1px solid ${showError ? "#d72c0d" : "var(--p-color-border)"}`,
          borderRadius: 4, outline: "none",
          background: "var(--p-color-bg-surface)", color: "var(--p-color-text)",
        }}
      />
      {showError && (
        <div style={{ fontSize: 11, color: "#d72c0d", marginTop: 3 }}>
          Must start with https:// or http://
        </div>
      )}
    </div>
  );
}

const SocialIconsComponent = {
  label: "Social Icons",
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
        const urls: Record<string, string> = props.urls ?? {};
        const enabled: string[] = props.enabled ?? SOCIAL_PLATFORMS.map(p => p.key);
        const bgType = props.advBgType ?? "none";
        return (
          <BlockTabBar blockKey="SocialIcons">
            {(tab) => (
              <>
                {tab === "content" && (
                  <>
                    <TabSection title="Platforms" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                      {SOCIAL_PLATFORMS.map((pl, i) => {
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
                            {/* URL input only when enabled */}
                            {isOn && (
                              <SocialUrlInput
                                key={pl.key}
                                platform={pl.label}
                                value={urls[pl.key] ?? ""}
                                onChange={(v) => set("urls", { ...urls, [pl.key]: v })}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <ToggleField label="Open in New Tab" value={props.newTab !== false} onChange={(v) => set("newTab", v)} />
                  </>
                )}
                {tab === "style" && (
                  <>
                    <TabSection title="Icons" />
                    <InlineSelect label="Icon Style" value={props.iconStyle ?? "filled"} onChange={(v) => set("iconStyle", v)} options={[{ value: "filled", label: "Filled" }, { value: "outlined", label: "Outlined" }, { value: "minimal", label: "Minimal" }, { value: "branded", label: "Branded" }]} />
                    <SliderNumberField label="Icon Size (px)" value={props.iconSize ?? 24} onChange={(v) => set("iconSize", v)} min={10} max={80} step={1} unit="px" />
                    <ColorPickerField label="Icon Color" value={props.iconColor ?? ""} onChange={(v) => set("iconColor", v)} />
                    <ColorPickerField label="Icon Hover Color" value={props.iconHoverColor ?? ""} onChange={(v) => set("iconHoverColor", v)} />
                    <SliderNumberField label="Spacing Between (px)" value={props.iconSpacing ?? 12} onChange={(v) => set("iconSpacing", v)} min={0} max={80} step={1} unit="px" />
                    <TabSection title="Background" />
                    <ColorPickerField label="Background Color" value={props.iconBgColor ?? ""} onChange={(v) => set("iconBgColor", v)} />
                    <ColorPickerField label="Hover Background" value={props.iconHoverBg ?? ""} onChange={(v) => set("iconHoverBg", v)} />
                    <InlineSelect label="Background Shape" value={props.bgShape ?? "none"} onChange={(v) => set("bgShape", v)} options={[{ value: "none", label: "None" }, { value: "circle", label: "Circle" }, { value: "square", label: "Square" }, { value: "rounded", label: "Rounded" }]} />
                    <SliderNumberField label="Background Size (px)" value={props.bgSize ?? 40} onChange={(v) => set("bgSize", v)} min={16} max={120} step={1} unit="px" />
                    <TabSection title="Border" />
                    <InlineSelect label="Border Style" value={props.borderStyle ?? "none"} onChange={(v) => set("borderStyle", v)} options={[{ value: "none", label: "None" }, { value: "solid", label: "Solid" }]} />
                    {props.borderStyle === "solid" && (
                      <>
                        <SliderNumberField label="Border Width (px)" value={props.borderWidth ?? 1} onChange={(v) => set("borderWidth", v)} min={1} max={10} step={1} unit="px" />
                        <ColorPickerField label="Border Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
                        <SliderNumberField label="Border Radius (px)" value={props.borderRadius ?? 0} onChange={(v) => set("borderRadius", v)} min={0} max={50} step={1} unit="px" />
                      </>
                    )}
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
    enabled: ["facebook", "instagram", "twitter", "youtube"],
    urls: {}, newTab: true,
    iconStyle: "filled", iconSize: 24, iconColor: "", iconHoverColor: "", iconSpacing: 12,
    iconBgColor: "", iconHoverBg: "", bgShape: "circle", bgSize: 40,
    borderStyle: "none", borderWidth: 1, borderColor: "", borderRadius: 0,
    alignment: "left",
    advBgType: "none", advBgColor: "", advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 8, right: 0, bottom: 8, left: 0 },
    hideDesktop: false, responsiveSpacing: {}, hideTablet: false, hideMobile: false, cssId: "", cssClass: "", zIndex: null,
  },
  render: ({ enabled, urls, newTab, iconStyle, iconSize, iconColor, iconHoverColor, iconSpacing, iconBgColor, iconHoverBg, bgShape, bgSize, borderStyle, borderWidth, borderColor, borderRadius, alignment, advBgType, advBgColor, advMargin, advPadding, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex, responsiveSpacing }: any) => {
    const id = cssId || `social-icons-blk`;
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const sz = Number(iconSize) || 24;
    const bgsz = Number(bgSize) || 40;
    const spacing = Number(iconSpacing) ?? 12;
    const shapeRadius = bgShape === "circle" ? "50%" : bgShape === "rounded" ? "10px" : bgShape === "square" ? "0px" : undefined;
    const isOutlined = iconStyle === "outlined";
    const isMinimal = iconStyle === "minimal";
    const isBranded = iconStyle === "branded";
    const hoverCss = (iconHoverColor || iconHoverBg) ? `#${id} a:hover .puck-si { ${iconHoverColor ? `color: ${iconHoverColor} !important;` : ""} ${iconHoverBg ? `background: ${iconHoverBg} !important;` : ""} transition: all 0.2s; } #${id} a .puck-si { transition: all 0.2s; }` : "";
    const platforms = SOCIAL_PLATFORMS.filter(p => (enabled ?? []).includes(p.key));
    return (
      <div id={id} data-pb-rs={id} className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined} style={{ position: "relative", paddingTop: advPadding?.top ?? 8, paddingRight: advPadding?.right ?? 0, paddingBottom: advPadding?.bottom ?? 8, paddingLeft: advPadding?.left ?? 0, marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0, marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0, zIndex: zIndex ?? undefined, ...(advBgType === "color" && advBgColor ? { backgroundColor: advBgColor } : {}) }}>
        <EditorHideOverlay hideDesktop={hideDesktop} hideTablet={hideTablet} hideMobile={hideMobile} />
        {(() => { const rsCss = buildResponsiveSpacingCss(`[data-pb-rs="${id}"]`, responsiveSpacing); return rsCss ? <style>{rsCss}</style> : null; })()}
        {hoverCss && <style>{hoverCss}</style>}
        <div style={{ display: "flex", gap: spacing, flexWrap: "wrap", justifyContent: alignment === "center" ? "center" : alignment === "right" ? "flex-end" : "flex-start" }}>
          {platforms.map(p => {
            const url = (urls as any)?.[p.key];
            const resolvedColor = isBranded
              ? (bgShape !== "none" ? "#fff" : p.brandColor)
              : isOutlined
              ? (iconColor || p.brandColor)
              : isMinimal
              ? (iconColor || p.brandColor)
              : (iconColor || "currentColor");
            const bgColor = isMinimal
              ? undefined
              : bgShape !== "none"
              ? (isBranded ? p.brandColor : (iconBgColor || "#e5e7eb"))
              : isOutlined
              ? "transparent"
              : undefined;
            const borderW = isOutlined ? 2 : (borderStyle === "solid" ? (borderWidth || 1) : 0);
            const borderC = isOutlined ? (iconColor || p.brandColor) : (borderColor || resolvedColor);
            const hasContainer = bgShape !== "none" || isOutlined;
            const innerStyle: React.CSSProperties = {
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: hasContainer ? bgsz : sz,
              height: hasContainer ? bgsz : sz,
              backgroundColor: bgColor,
              borderRadius: isOutlined ? (shapeRadius ?? "8px") : shapeRadius,
              ...(borderW > 0 ? { borderWidth: borderW, borderStyle: "solid", borderColor: borderC, boxSizing: "border-box" } : {}),
              color: resolvedColor,
              flexShrink: 0,
            };
            const svgIcon = (
              <span style={{ width: sz, height: sz, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: sz }}>
                {SOCIAL_PLATFORM_SVGS[p.key]}
              </span>
            );
            return url ? (
              <a key={p.key} href={url} target={newTab !== false ? "_blank" : "_self"} rel="noopener noreferrer" title={p.label} style={{ textDecoration: "none", color: "inherit" }}>
                <span className="puck-si" style={innerStyle}>{svgIcon}</span>
              </a>
            ) : (
              <span key={p.key} className="puck-si" style={{ ...innerStyle, opacity: 0.4 }} title={`${p.label} (no URL set)`}>{svgIcon}</span>
            );
          })}
        </div>
      </div>
    );
  },
};

export { SocialIconsComponent };
