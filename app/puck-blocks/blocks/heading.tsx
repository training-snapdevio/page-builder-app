// @ts-nocheck
import type * as React from "react";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from "lucide-react";
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
} from "@/puck-blocks/shared";
import {
  LinkUrlField,
} from "@/puck-blocks/block-fields";

export const HeadingBlockComponent = {
  label: "Heading",
  fields: {
    _tabs: {
      type: "custom",
      label: "",
      render: ({ value: _v, onChange: _onChange }: any) => {
        // Read all current props and dispatch via usePuck
        const { selectedItem, appState, dispatch } = usePuck();
        const props = selectedItem?.props ?? {};

        // Helper: merge one prop into the current item and replace it in the store
        const set = (key: string, val: any) => {
          if (!selectedItem) return;
          const state = appState.data;
          // Find index + zone for the selected item
          // Root content lives under the compound key "root:default-zone"
          let destinationZone = "root:default-zone";
          let destinationIndex = 0;
          const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
          for (const [zone, items] of Object.entries(zones)) {
            const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
            if (idx !== -1) {
              destinationZone = zone;
              destinationIndex = idx;
              break;
            }
          }
          dispatch({
            type: "replace",
            destinationZone,
            destinationIndex,
            data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } },
          });
        };

        const dividerActive = (props.dividerType ?? "none") !== "none";
        const bgType = props.advBgType ?? "none";

        return (
          <BlockTabBar blockKey="HeadingBlock">
            {(tab) => (
              <>
                {/* ── CONTENT TAB ── */}
                {tab === "content" && (
                  <>
                    <StackedTextareaField
                      label="Title"
                      value={props.title ?? ""}
                      onChange={(v) => set("title", v)}
                      placeholder="Enter heading..."
                      rows={3}
                    />
                    <InlineSelect
                      label="HTML Tag"
                      value={String(props.level ?? "1")}
                      onChange={(v) => set("level", v === "custom" ? "custom" : Number(v))}
                      options={[
                        { value: "1", label: "H1" }, { value: "2", label: "H2" },
                        { value: "3", label: "H3" }, { value: "4", label: "H4" },
                        { value: "5", label: "H5" }, { value: "6", label: "H6" },
                        { value: "custom", label: "Custom" },
                      ]}
                    />
                    {props.level === "custom" && (
                      <SliderNumberField label="Font Size (px)" value={props.fontSize ?? 32} onChange={(v) => set("fontSize", v)} min={8} max={200} step={1} unit="px" />
                    )}
                    <LinkUrlField value={props.linkUrl ?? ""} onChange={(v) => set("linkUrl", v)} />
                    <StackedTextField
                      label="Subtitle"
                      value={props.subtitle ?? ""}
                      onChange={(v) => set("subtitle", v)}
                      placeholder="Optional subtitle..."
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
                    <InlineSelect
                      label="Font Weight"
                      value={String(props.fontWeight ?? "700")}
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
                    <SliderNumberField label="Line Height" value={props.lineHeight ?? 1.4} onChange={(v) => set("lineHeight", v)} min={0.5} max={5} step={0.05} unit="" />
                    <SliderNumberField label="Letter Spacing (px)" value={props.letterSpacing ?? 0} onChange={(v) => set("letterSpacing", v)} min={-10} max={50} step={0.5} unit="px" />

                    <TabSection title="Color" />
                    <ColorPickerField
                      label="Text Color"
                      value={props.textColor ?? ""}
                      onChange={(v) => set("textColor", v)}
                    />
                    <ColorPickerField
                      label="Hover Color"
                      value={props.hoverColor ?? ""}
                      onChange={(v) => set("hoverColor", v)}
                    />
                    <ColorPickerField
                      label="Subtitle Color"
                      value={props.subtitleColor ?? ""}
                      onChange={(v) => set("subtitleColor", v)}
                    />
                    <SliderNumberField label="Subtitle Size (px)" value={props.subtitleSize ?? 18} onChange={(v) => set("subtitleSize", v)} min={10} max={64} step={1} unit="px" />


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

                    <TabSection title="Divider" />
                    <InlineSelect
                      label="Divider Style"
                      value={props.dividerType ?? "none"}
                      onChange={(v) => set("dividerType", v)}
                      options={[
                        { value: "none", label: "None" },
                        { value: "line", label: "Line" },
                        { value: "double-line", label: "Double Line" },
                        { value: "line-with-icon", label: "Line with Icon" },
                      ]}
                    />
                    {dividerActive && (
                      <>
                        <ColorPickerField
                          label="Divider Color"
                          value={props.dividerColor ?? ""}
                          onChange={(v) => set("dividerColor", v)}
                        />
                        <SliderNumberField label="Divider Length (px)" value={props.dividerLength ?? 60} onChange={(v) => set("dividerLength", v)} min={20} max={300} step={5} unit="px" />
                        {props.dividerType !== "line-with-icon" && (
                          <SliderNumberField label="Divider Thickness (px)" value={props.dividerThickness ?? 3} onChange={(v) => set("dividerThickness", v)} min={1} max={50} step={1} unit="px" />
                        )}
                        <AlignField
                          label="Divider Alignment"
                          value={props.dividerAlignment ?? "center"}
                          onChange={(v) => set("dividerAlignment", v)}
                          options={[
                            { value: "left",   icon: <AlignLeft   size={15} />, title: "Left"   },
                            { value: "center", icon: <AlignCenter size={15} />, title: "Center" },
                            { value: "right",  icon: <AlignRight  size={15} />, title: "Right"  },
                          ]}
                        />
                        {props.dividerType === "line-with-icon" && (
                          <StackedTextField
                            label="Icon or Emoji"
                            value={props.dividerIcon ?? "⭐"}
                            onChange={(v) => set("dividerIcon", v)}
                            placeholder="e.g., ⭐ or 🌟"
                          />
                        )}
                      </>
                    )}
                  </>
                )}

                {/* ── ADVANCED TAB ── */}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField
                      label="Margin (px)"
                      value={props.advMargin}
                      onChange={(v) => set("advMargin", v)}
                    />
                    <FourSideField
                      label="Padding (px)"
                      value={props.advPadding ?? { top: props.padding ?? 32, right: 0, bottom: props.padding ?? 32, left: 0 }}
                      onChange={(v) => set("advPadding", v)}
                    />

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
                      <ColorPickerField
                        label="Color"
                        value={props.backgroundColor ?? ""}
                        onChange={(v) => set("backgroundColor", v)}
                      />
                    )}
                    {bgType === "gradient" && (
                      <>
                        <ColorPickerField
                          label="Color 1"
                          value={props.advGradientColor1 ?? ""}
                          onChange={(v) => set("advGradientColor1", v)}
                        />
                        <ColorPickerField
                          label="Color 2"
                          value={props.advGradientColor2 ?? ""}
                          onChange={(v) => set("advGradientColor2", v)}
                        />
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
                        <FourSideField
                          label="Border Width (px)"
                          value={props.advBorderWidth}
                          onChange={(v) => set("advBorderWidth", v)}
                        />
                        <ColorPickerField
                          label="Border Color"
                          value={props.advBorderColor ?? ""}
                          onChange={(v) => set("advBorderColor", v)}
                        />
                      </>
                    )}
                    <FourSideField
                      label="Border Radius (px)"
                      value={props.advBorderRadius}
                      onChange={(v) => set("advBorderRadius", v)}
                    />


                    <TabSection title="Responsive" />
                    <ToggleField
                      label="Hide on Desktop"
                      value={!!props.hideDesktop}
                      onChange={(v) => set("hideDesktop", v)}
                    />
                    <ToggleField
                      label="Hide on Tablet"
                      value={!!props.hideTablet}
                      onChange={(v) => set("hideTablet", v)}
                    />
                    <ToggleField
                      label="Hide on Mobile"
                      value={!!props.hideMobile}
                      onChange={(v) => set("hideMobile", v)}
                    />

                    <SliderNumberField label="Opacity (%)" value={props.opacity ?? 100} onChange={(v) => set("opacity", v)} min={0} max={100} step={1}
                    />
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
    // Content
    title: "Heading",
    subtitle: "",
    level: 1,
    linkUrl: "",
    linkTarget: "_blank",
    // Style – typography
    fontFamily: "inherit",
    fontSize: null,
    fontWeight: "700",
    fontStyle: "normal",
    textTransform: "capitalize",
    textDecoration: "none",
    lineHeight: null,
    letterSpacing: null,
    // Style – color
    textColor: "",
    hoverColor: "",
    subtitleColor: "",
    subtitleSize: 18,
    // Style – text shadow
    // Style – alignment & divider
    alignment: "left",
    dividerType: "none",
    dividerColor: "",
    dividerLength: 60,
    dividerThickness: 3,
    dividerAlignment: "center",
    dividerIcon: "⭐",
    // Advanced – spacing
    advMargin: { top: 0, right: 0, bottom: 0, left: 0 },
    advPadding: { top: 32, right: 0, bottom: 32, left: 0 },
    // Advanced – background
    advBgType: "none",
    backgroundColor: "",
    advGradientColor1: "",
    advGradientColor2: "",
    advGradientAngle: 135,
    advBgImage: "",
    // Advanced – border
    advBorderStyle: "none",
    advBorderWidth: { top: 0, right: 0, bottom: 0, left: 0 },
    advBorderColor: "",
    advBorderRadius: { top: 0, right: 0, bottom: 0, left: 0 },
    // Advanced – shadow
    // Advanced – responsive
    hideDesktop: false,
    hideTablet: false,
    hideMobile: false,
    // Advanced – custom
    cssId: "",
    cssClass: "",
    customCss: "",
    zIndex: null,
    opacity: 100,
  },

  render: ({
    title,
    subtitle,
    subtitleColor,
    subtitleSize,
    level,
    alignment,
    textColor,
    backgroundColor,
    linkUrl,
    linkTarget,
    fontFamily,
    fontSize,
    fontWeight,
    fontStyle,
    textTransform,
    textDecoration,
    lineHeight,
    letterSpacing,
    hoverColor: _hoverColor,
    dividerType,
    dividerColor,
    dividerLength,
    dividerThickness,
    dividerAlignment,
    dividerIcon,
    advMargin,
    advPadding,
    advBgType,
    advGradientColor1,
    advGradientColor2,
    advGradientAngle,
    advBgImage,
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
    const Tag = (level === "custom" ? "p" : `h${level || 1}`) as keyof JSX.IntrinsicElements;

    // Background
    const bgStyle: React.CSSProperties = (() => {
      if (advBgType === "color")
        return { backgroundColor: backgroundColor || "transparent" };
      if (advBgType === "gradient" && advGradientColor1 && advGradientColor2)
        return { background: `linear-gradient(${advGradientAngle ?? 135}deg, ${advGradientColor1}, ${advGradientColor2})` };
      if (advBgType === "image" && advBgImage)
        return { backgroundImage: `url(${advBgImage})`, backgroundSize: "cover", backgroundPosition: "center" };
      return {};
    })();

    // Border
    const borderStyle: React.CSSProperties = advBorderStyle && advBorderStyle !== "none"
      ? {
          borderStyle: advBorderStyle,
          borderTopWidth:    advBorderWidth?.top    ?? 0,
          borderRightWidth:  advBorderWidth?.right  ?? 0,
          borderBottomWidth: advBorderWidth?.bottom ?? 0,
          borderLeftWidth:   advBorderWidth?.left   ?? 0,
          borderColor: advBorderColor || "currentColor",
        }
      : {};

    // Border radius
    const radiusStyle: React.CSSProperties = {
      borderTopLeftRadius:     advBorderRadius?.top    ?? 0,
      borderTopRightRadius:    advBorderRadius?.right  ?? 0,
      borderBottomRightRadius: advBorderRadius?.bottom ?? 0,
      borderBottomLeftRadius:  advBorderRadius?.left   ?? 0,
    };


    // Responsive hide classes
    const hideClasses = [
      hideDesktop ? "puck-hide-desktop" : "",
      hideTablet  ? "puck-hide-tablet"  : "",
      hideMobile  ? "puck-hide-mobile"  : "",
    ].filter(Boolean).join(" ");

    const defaultFontSize =
      level === "custom" ? (fontSize ? `${fontSize}px` : "1rem")
      : level === 1 ? "var(--h1-size, 2.5rem)"
      : level === 2 ? "var(--h2-size, 2rem)"
      : level === 3 ? "var(--h3-size, 1.75rem)"
      : level === 4 ? "var(--h4-size, 1.5rem)"
      : level === 5 ? "var(--h5-size, 1.25rem)"
      : "var(--h6-size, 1rem)";

    const wrapperStyle: React.CSSProperties = {
      position: "relative",
      paddingTop:    advPadding?.top    ?? 32,
      paddingRight:  advPadding?.right  ?? 0,
      paddingBottom: advPadding?.bottom ?? 32,
      paddingLeft:   advPadding?.left   ?? 0,
      marginTop:    advMargin?.top    ?? 0,
      marginRight:  advMargin?.right  ?? 0,
      marginBottom: advMargin?.bottom ?? 0,
      marginLeft:   advMargin?.left   ?? 0,
      textAlign: alignment as any,
      zIndex: zIndex ?? undefined,
      opacity: opacity != null ? opacity / 100 : 1,
      ...bgStyle,
      ...borderStyle,
      ...radiusStyle,
    };

    const headingEl = (
      <Tag
        style={{
          fontSize: level === "custom" ? (fontSize ? `${fontSize}px` : "1rem") : defaultFontSize,
          fontWeight: fontWeight ?? "700",
          fontFamily: fontFamily && fontFamily !== "inherit" ? fontFamily : "var(--heading-font)",
          fontStyle: fontStyle ?? "normal",
          textTransform: (textTransform ?? "capitalize") as any,
          textDecoration: textDecoration ?? "none",
          lineHeight: lineHeight ?? "var(--heading-line-height, 1.2)",
          letterSpacing: letterSpacing != null ? `${letterSpacing}px` : undefined,
          color: textColor || "var(--primary-color)",
          margin: 0,
        }}
      >
        {title}
      </Tag>
    );

    return (
      <div
        id={cssId || undefined}
        className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined}
        style={wrapperStyle}
      >
        <EditorHideOverlay hideDesktop={hideDesktop} hideTablet={hideTablet} hideMobile={hideMobile} />
        {customCss && <style>{`#${cssId || "heading-block"} { ${customCss} }`}</style>}
        {linkUrl
          ? <a href={linkUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>{headingEl}</a>
          : headingEl
        }

        {subtitle && (
          <p style={{
            fontSize: subtitleSize ? `${subtitleSize}px` : "var(--base-font-size, 1rem)",
            color: subtitleColor || "var(--text-color)",
            marginTop: 8,
          }}>
            {subtitle}
          </p>
        )}

        {dividerType && dividerType !== "none" && (
          <div style={{ marginTop: 16 }}>
            {dividerType === "line" && (
              <div style={{
                width: dividerLength || 60,
                height: 0,
                borderTop: `${dividerThickness || 3}px solid ${dividerColor || textColor || "var(--primary-color)"}`,
                borderRadius: 2,
                marginLeft: dividerAlignment === "center" ? "auto" : dividerAlignment === "right" ? "auto" : 0,
                marginRight: dividerAlignment === "center" ? "auto" : dividerAlignment === "right" ? 0 : "auto",
                boxSizing: "content-box",
              }} />
            )}
            {dividerType === "double-line" && (
              <div style={{
                display: "flex", flexDirection: "column", gap: 6,
                width: dividerLength || 60,
                marginLeft: dividerAlignment === "center" ? "auto" : dividerAlignment === "right" ? "auto" : 0,
                marginRight: dividerAlignment === "center" ? "auto" : dividerAlignment === "right" ? 0 : "auto",
              }}>
                <div style={{ height: 0, borderTop: `${dividerThickness || 2}px solid ${dividerColor || textColor || "var(--primary-color)"}`, boxSizing: "content-box" }} />
                <div style={{ height: 0, borderTop: `${dividerThickness || 2}px solid ${dividerColor || textColor || "var(--primary-color)"}`, boxSizing: "content-box" }} />
              </div>
            )}
            {dividerType === "line-with-icon" && (
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                justifyContent: dividerAlignment === "right" ? "flex-end" : dividerAlignment === "center" ? "center" : "flex-start",
              }}>
                <div style={{ flex: 1, height: 0, borderTop: `${dividerThickness || 3}px solid ${dividerColor || textColor || "var(--primary-color)"}`, maxWidth: dividerLength ? dividerLength / 4 : 30, boxSizing: "content-box" }} />
                <span style={{ fontSize: "1.5rem", whiteSpace: "nowrap", flexShrink: 0 }}>{dividerIcon || "⭐"}</span>
                <div style={{ flex: 1, height: 0, borderTop: `${dividerThickness || 3}px solid ${dividerColor || textColor || "var(--primary-color)"}`, maxWidth: dividerLength ? dividerLength / 4 : 30, boxSizing: "content-box" }} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
};
