// @ts-nocheck
import type * as React from "react";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from "lucide-react";
import { usePuck } from "@my-app/puck-editor";
import { loadGoogleFont } from "@/puck-splat/utils";
import {
  AlignField,
  ToggleField,
  StackedTextareaField,
  ColorPickerField,
  BlockTabBar,
  TabSection,
  FourSideField,
  InlineSelect,
  SliderNumberField,
  EditorHideOverlay,
} from "@/puck-blocks/shared";

export const TextComponent = {
  label: "Text Editor",
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

        const bgType = props.advBgType ?? "none";

        return (
          <BlockTabBar blockKey="Text">
            {(tab) => (
              <>
                {/* ── CONTENT TAB ── */}
                {tab === "content" && (
                  <>
                    <StackedTextareaField
                      label="Content"
                      value={props.title ?? ""}
                      onChange={(v) => set("title", v)}
                      placeholder="Enter text..."
                      rows={5}
                    />
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
                    <SliderNumberField label="Font Size (px)" value={props.fontSize ?? 16} onChange={(v) => set("fontSize", v)} min={8} max={120} step={1} unit="px" />
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
                      label="Font Style"
                      value={props.fontStyle ?? "normal"}
                      onChange={(v) => set("fontStyle", v)}
                      options={[
                        { value: "normal", label: "Normal" },
                        { value: "italic", label: "Italic" },
                      ]}
                    />
                    <SliderNumberField label="Line Height" value={props.lineHeight ?? 1.6} onChange={(v) => set("lineHeight", v)} min={0.8} max={5} step={0.05} unit="" />
                    <SliderNumberField label="Letter Spacing (px)" value={props.letterSpacing ?? 0} onChange={(v) => set("letterSpacing", v)} min={-10} max={50} step={0.5} unit="px" />
                    <InlineSelect
                      label="Text Decoration"
                      value={props.textDecoration ?? "none"}
                      onChange={(v) => set("textDecoration", v)}
                      options={[
                        { value: "none", label: "None" },
                        { value: "underline", label: "Underline" },
                        { value: "line-through", label: "Line Through" },
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

                    <TabSection title="Color" />
                    <ColorPickerField
                      label="Text Color"
                      value={props.textColor ?? ""}
                      onChange={(v) => set("textColor", v)}
                    />
                    <TabSection title="Alignment" />
                    <AlignField
                      label="Text Align"
                      value={props.alignment ?? "left"}
                      onChange={(v) => set("alignment", v)}
                      options={[
                        { value: "left",    icon: <AlignLeft    size={15} />, title: "Left"    },
                        { value: "center",  icon: <AlignCenter  size={15} />, title: "Center"  },
                        { value: "right",   icon: <AlignRight   size={15} />, title: "Right"   },
                        { value: "justify", icon: <AlignJustify size={15} />, title: "Justify" },
                      ]}
                    />
                  </>
                )}

                {/* ── ADVANCED TAB ── */}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 16, right: 0, bottom: 16, left: 0 }} onChange={(v) => set("advPadding", v)} />

                    <TabSection title="Background" />
                    <InlineSelect
                      label="Type"
                      value={bgType}
                      onChange={(v) => set("advBgType", v)}
                      options={[
                        { value: "none", label: "None" },
                        { value: "color", label: "Color" },
                        { value: "gradient", label: "Gradient" },
                      ]}
                    />
                    {bgType === "color" && (
                      <ColorPickerField label="Color" value={props.backgroundColor ?? ""} onChange={(v) => set("backgroundColor", v)} />
                    )}
                    {bgType === "gradient" && (
                      <>
                        <ColorPickerField label="Color 1" value={props.advGradientColor1 ?? ""} onChange={(v) => set("advGradientColor1", v)} />
                        <ColorPickerField label="Color 2" value={props.advGradientColor2 ?? ""} onChange={(v) => set("advGradientColor2", v)} />
                        <SliderNumberField label="Angle (deg)" value={props.advGradientAngle ?? 135} onChange={(v) => set("advGradientAngle", v)} min={0} max={360} step={15} unit="°" />
                      </>
                    )}

                    <TabSection title="Border" />
                    <InlineSelect
                      label="Border Style"
                      value={props.advBorderStyle ?? "none"}
                      onChange={(v) => set("advBorderStyle", v)}
                      options={[
                        { value: "none", label: "None" },
                        { value: "solid", label: "Solid" },
                        { value: "dashed", label: "Dashed" },
                        { value: "dotted", label: "Dotted" },
                        { value: "double", label: "Double" },
                      ]}
                    />
                    {props.advBorderStyle && props.advBorderStyle !== "none" && (
                      <>
                        <FourSideField label="Border Width (px)" value={props.advBorderWidth} onChange={(v) => set("advBorderWidth", v)} />
                        <ColorPickerField label="Border Color" value={props.advBorderColor ?? ""} onChange={(v) => set("advBorderColor", v)} />
                      </>
                    )}
                    <FourSideField label="Border Radius (px)" value={props.advBorderRadius} onChange={(v) => set("advBorderRadius", v)} />


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
    title: "Enter your text here.",
    columnCount: "1",
    columnGap: "",
    fontFamily: "inherit",
    fontSize: null,
    fontWeight: "400",
    fontStyle: "normal",
    lineHeight: null,
    letterSpacing: null,
    textDecoration: "none",
    textTransform: "capitalize",
    textColor: "",
    linkColor: "",
    linkHoverColor: "",
    alignment: "left",
    backgroundColor: "",
    advBgType: "none",
    advGradientColor1: "",
    advGradientColor2: "",
    advGradientAngle: 135,
    advMargin: { top: 0, right: 0, bottom: 0, left: 0 },
    advPadding: { top: 16, right: 0, bottom: 16, left: 0 },
    advBorderStyle: "none",
    advBorderWidth: { top: 0, right: 0, bottom: 0, left: 0 },
    advBorderColor: "",
    advBorderRadius: { top: 0, right: 0, bottom: 0, left: 0 },
    hideDesktop: false,
    hideTablet: false,
    hideMobile: false,
    cssId: "",
    cssClass: "",
    customCss: "",
    zIndex: null,
    opacity: 100,
  },

  render: ({
    title,
    columnCount,
    columnGap,
    fontFamily,
    fontSize,
    fontWeight,
    fontStyle,
    lineHeight,
    letterSpacing,
    textDecoration,
    textTransform,
    textColor,
    linkColor,
    linkHoverColor: _linkHoverColor,
    alignment,
    backgroundColor,
    advBgType,
    advGradientColor1,
    advGradientColor2,
    advGradientAngle,
    advMargin,
    advPadding,
    advBorderStyle,
    advBorderWidth,
    advBorderColor,
    advBorderRadius,
    hideDesktop,
    hideTablet,
    hideMobile,
    cssId,
    cssClass,
    customCss,
    zIndex,
    opacity,
  }) => {
    const bgStyle: React.CSSProperties = (() => {
      if (advBgType === "color") return { backgroundColor: backgroundColor || "transparent" };
      if (advBgType === "gradient" && advGradientColor1 && advGradientColor2)
        return { background: `linear-gradient(${advGradientAngle ?? 135}deg, ${advGradientColor1}, ${advGradientColor2})` };
      return {};
    })();

    const borderStyle: React.CSSProperties = advBorderStyle && advBorderStyle !== "none"
      ? { borderStyle: advBorderStyle, borderTopWidth: advBorderWidth?.top ?? 0, borderRightWidth: advBorderWidth?.right ?? 0, borderBottomWidth: advBorderWidth?.bottom ?? 0, borderLeftWidth: advBorderWidth?.left ?? 0, borderColor: advBorderColor || "currentColor" }
      : {};

    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");

    const cols = parseInt(String(columnCount ?? "1"), 10) || 1;
    const colStyle: React.CSSProperties = cols > 1
      ? { columnCount: cols, columnGap: columnGap || "1.5rem" }
      : {};

    return (
      <div
        id={cssId || undefined}
        className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined}
        style={{
          position: "relative",
          paddingTop: advPadding?.top ?? 16, paddingRight: advPadding?.right ?? 0,
          paddingBottom: advPadding?.bottom ?? 16, paddingLeft: advPadding?.left ?? 0,
          marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0,
          marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0,
          zIndex: zIndex ?? undefined,
          opacity: opacity != null ? opacity / 100 : 1,
          borderTopLeftRadius: advBorderRadius?.top ?? 0,
          borderTopRightRadius: advBorderRadius?.right ?? 0,
          borderBottomRightRadius: advBorderRadius?.bottom ?? 0,
          borderBottomLeftRadius: advBorderRadius?.left ?? 0,
          ...bgStyle,
          ...borderStyle,
        }}
      >
        <EditorHideOverlay hideDesktop={hideDesktop} hideTablet={hideTablet} hideMobile={hideMobile} />
        {customCss && <style>{`#${cssId || "text-block"} { ${customCss} }`}</style>}
        {linkColor && <style>{`.text-block-links-${cssId || "default"} a { color: ${linkColor}; }`}</style>}
        <p
          className={linkColor ? `text-block-links-${cssId || "default"}` : undefined}
          style={{
            textAlign: alignment as any,
            fontSize: fontSize ? `${fontSize}px` : "var(--base-font-size, 1rem)",
            fontWeight: fontWeight || 400,
            fontFamily: fontFamily && fontFamily !== "inherit" ? fontFamily : "var(--font-family)",
            fontStyle: fontStyle ?? "normal",
            lineHeight: lineHeight ?? "var(--line-height, 1.6)",
            letterSpacing: letterSpacing != null ? `${letterSpacing}px` : undefined,
            textDecoration: textDecoration ?? "none",
            textTransform: (textTransform ?? "none") as any,
            color: textColor || "var(--text-color)",
            margin: 0,
            ...colStyle,
          }}
        >
          {title}
        </p>
      </div>
    );
  },
};
