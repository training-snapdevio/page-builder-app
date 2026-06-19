// @ts-nocheck
import type * as React from "react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { usePuck } from "@my-app/puck-editor";
import { loadGoogleFont } from "@/puck-splat/utils";
import {
  AlignField,
  ToggleField,
  StackedTextField,
  StackedDateField,
  StackedTextareaField,
  ColorPickerField,
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
} from "@/puck-blocks/block-fields";

export const ArticleComponent = {
  label: "Article Block",
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
          <BlockTabBar blockKey="Article">
            {(tab) => (
              <>
                {tab === "content" && (
                  <>
                    <TabSection title="Article" />
                    <StackedTextField label="Title" value={props.articleTitle ?? ""} onChange={(v) => set("articleTitle", v)} placeholder="Enter article title..." />
                    <StackedTextareaField label="Body" value={props.body ?? ""} onChange={(v) => set("body", v)} placeholder="Enter article body..." rows={6} />
                    <StackedTextField label="Author" value={props.author ?? ""} onChange={(v) => set("author", v)} placeholder="e.g., Jane Smith" />
                    <ToggleField label="Show Author" value={props.showAuthor !== false} onChange={(v) => set("showAuthor", v)} />
                    <StackedDateField label="Published Date" value={props.publishDate ?? ""} onChange={(v) => set("publishDate", v)} />
                    <ToggleField label="Show Date" value={props.showDate !== false} onChange={(v) => set("showDate", v)} />
                    <TabSection title="Featured Image" />
                    <ImageField label="Featured Image" value={props.featuredImage ?? ""} onChange={(v: any) => set("featuredImage", v)} />
                  </>
                )}
                {tab === "style" && (
                  <>
                    <TabSection title="Colors" />
                    <ColorPickerField label="Title Color" value={props.titleColor ?? ""} onChange={(v) => set("titleColor", v)} />
                    <ColorPickerField label="Body Color" value={props.bodyColor ?? ""} onChange={(v) => set("bodyColor", v)} />
                    <ColorPickerField label="Author Color" value={props.authorColor ?? ""} onChange={(v) => set("authorColor", v)} />
                    <ColorPickerField label="Date Color" value={props.dateColor ?? ""} onChange={(v) => set("dateColor", v)} />

                    <TabSection title="Title Typography" />
                    <InlineSelect label="Font Family" value={props.titleFontFamily ?? "inherit"} onChange={(v) => { set("titleFontFamily", v); loadGoogleFont(v); }} options={[{ value: "inherit", label: "Theme Default" }, { value: "Arial, Helvetica, sans-serif", label: "Arial" }, { value: "Georgia, serif", label: "Georgia" }, { value: "'Courier New', monospace", label: "Courier New" }, { value: "Impact, sans-serif", label: "Impact" }, { value: "Inter, sans-serif", label: "Inter" }, { value: "Poppins, sans-serif", label: "Poppins" }, { value: "'Roboto Serif', serif", label: "Roboto Serif" }, { value: "'New York', 'New York Small', 'Times New Roman', serif", label: "New York" }, { value: "'Open Sans', sans-serif", label: "Open Sans" }]} />
                    <SliderNumberField label="Font Size (px)" value={props.titleFontSize ?? 32} onChange={(v) => set("titleFontSize", v)} min={10} max={120} step={1} unit="px" />
                    <InlineSelect label="Font Weight" value={String(props.titleFontWeight ?? "700")} onChange={(v) => set("titleFontWeight", v)} options={[{value:"400",label:"Normal"},{value:"600",label:"Semi Bold"},{value:"900",label:"Bold"}]} />
                    <SliderNumberField label="Line Height" value={props.titleLineHeight ?? 1.3} onChange={(v) => set("titleLineHeight", v)} min={0.8} max={3} step={0.05} unit="" />
                    <AlignField label="Text Alignment" value={props.titleAlign ?? "left"} onChange={(v) => set("titleAlign", v)} options={[{value:"left",icon:<AlignLeft size={15}/>,title:"Left"},{value:"center",icon:<AlignCenter size={15}/>,title:"Center"},{value:"right",icon:<AlignRight size={15}/>,title:"Right"}]} />

                    <TabSection title="Body Typography" />
                    <InlineSelect label="Font Family" value={props.bodyFontFamily ?? "inherit"} onChange={(v) => { set("bodyFontFamily", v); loadGoogleFont(v); }} options={[{ value: "inherit", label: "Theme Default" }, { value: "Arial, Helvetica, sans-serif", label: "Arial" }, { value: "Georgia, serif", label: "Georgia" }, { value: "'Courier New', monospace", label: "Courier New" }, { value: "Impact, sans-serif", label: "Impact" }, { value: "Inter, sans-serif", label: "Inter" }, { value: "Poppins, sans-serif", label: "Poppins" }, { value: "'Roboto Serif', serif", label: "Roboto Serif" }, { value: "'New York', 'New York Small', 'Times New Roman', serif", label: "New York" }, { value: "'Open Sans', sans-serif", label: "Open Sans" }]} />
                    <SliderNumberField label="Font Size (px)" value={props.bodyFontSize ?? 16} onChange={(v) => set("bodyFontSize", v)} min={10} max={60} step={1} unit="px" />
                    <InlineSelect label="Font Weight" value={String(props.bodyFontWeight ?? "400")} onChange={(v) => set("bodyFontWeight", v)} options={[{value:"400",label:"Normal"},{value:"600",label:"Semi Bold"},{value:"900",label:"Bold"}]} />
                    <SliderNumberField label="Line Height" value={props.bodyLineHeight ?? 1.75} onChange={(v) => set("bodyLineHeight", v)} min={0.8} max={4} step={0.05} unit="" />

                    <TabSection title="Author Typography" />
                    <InlineSelect label="Font Family" value={props.authorFontFamily ?? "inherit"} onChange={(v) => { set("authorFontFamily", v); loadGoogleFont(v); }} options={[{ value: "inherit", label: "Theme Default" }, { value: "Arial, Helvetica, sans-serif", label: "Arial" }, { value: "Georgia, serif", label: "Georgia" }, { value: "'Courier New', monospace", label: "Courier New" }, { value: "Impact, sans-serif", label: "Impact" }, { value: "Inter, sans-serif", label: "Inter" }, { value: "Poppins, sans-serif", label: "Poppins" }, { value: "'Roboto Serif', serif", label: "Roboto Serif" }, { value: "'New York', 'New York Small', 'Times New Roman', serif", label: "New York" }, { value: "'Open Sans', sans-serif", label: "Open Sans" }]} />
                    <SliderNumberField label="Font Size (px)" value={props.authorFontSize ?? 14} onChange={(v) => set("authorFontSize", v)} min={10} max={40} step={1} unit="px" />
                    <InlineSelect label="Font Weight" value={String(props.authorFontWeight ?? "400")} onChange={(v) => set("authorFontWeight", v)} options={[{value:"400",label:"Normal"},{value:"600",label:"Semi Bold"},{value:"900",label:"Bold"}]} />

                    <TabSection title="Date Typography" />
                    <InlineSelect label="Font Family" value={props.dateFontFamily ?? "inherit"} onChange={(v) => { set("dateFontFamily", v); loadGoogleFont(v); }} options={[{ value: "inherit", label: "Theme Default" }, { value: "Arial, Helvetica, sans-serif", label: "Arial" }, { value: "Georgia, serif", label: "Georgia" }, { value: "'Courier New', monospace", label: "Courier New" }, { value: "Impact, sans-serif", label: "Impact" }, { value: "Inter, sans-serif", label: "Inter" }, { value: "Poppins, sans-serif", label: "Poppins" }, { value: "'Roboto Serif', serif", label: "Roboto Serif" }, { value: "'New York', 'New York Small', 'Times New Roman', serif", label: "New York" }, { value: "'Open Sans', sans-serif", label: "Open Sans" }]} />
                    <SliderNumberField label="Font Size (px)" value={props.dateFontSize ?? 13} onChange={(v) => set("dateFontSize", v)} min={10} max={40} step={1} unit="px" />
                    <InlineSelect label="Font Weight" value={String(props.dateFontWeight ?? "400")} onChange={(v) => set("dateFontWeight", v)} options={[{value:"400",label:"Normal"},{value:"600",label:"Semi Bold"},{value:"900",label:"Bold"}]} />

                    <TabSection title="Featured Image" />
                    <InlineSelect label="Object Fit" value={props.imageFit ?? "cover"} onChange={(v) => set("imageFit", v)} options={[{value:"cover",label:"Cover"},{value:"contain",label:"Contain"},{value:"fill",label:"Fill"}]} />
                    <SliderNumberField label="Border Radius (px)" value={props.imageBorderRadius ?? 8} onChange={(v) => set("imageBorderRadius", v)} min={0} max={100} step={1} unit="px" />
                    <SliderNumberField label="Margin Bottom (px)" value={props.imageMarginBottom ?? 24} onChange={(v) => set("imageMarginBottom", v)} min={0} max={120} step={4} unit="px" />
                  </>
                )}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin"  value={props.advMargin  ?? { top: 0, right: 0, bottom: 0, left: 0 }}   onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding" value={props.advPadding ?? { top: 48, right: 24, bottom: 48, left: 24 }} onChange={(v) => set("advPadding", v)} />
                    <TabSection title="Responsive Spacing" />
                    <ResponsiveSpacingField value={props.responsiveSpacing} onChange={(v) => set("responsiveSpacing", v)} />
                    <TabSection title="Responsive" />
                    <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                    <ToggleField label="Hide on Tablet"  value={!!props.hideTablet}  onChange={(v) => set("hideTablet", v)} />
                    <ToggleField label="Hide on Mobile"  value={!!props.hideMobile}  onChange={(v) => set("hideMobile", v)} />
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
    articleTitle: "Article Title",
    author: "Jane Smith",
    showAuthor: true,
    publishDate: "",
    showDate: true,
    body: "<p></p>",
    featuredImage: "",
    imagePosition: "top",
    imageHeight: 400,
    imageBorderRadius: 8,
    imageFit: "cover",
    imageMarginBottom: 24,
    titleAlign: "left",
    titleColor: "",
    titleFontFamily: "inherit",
    titleFontSize: 32,
    titleFontWeight: "700",
    titleLineHeight: 1.3,
    bodyColor: "",
    bodyFontFamily: "inherit",
    bodyFontSize: 16,
    bodyFontWeight: "400",
    bodyLineHeight: 1.75,
    authorColor: "",
    authorFontFamily: "inherit",
    authorFontSize: 14,
    authorFontWeight: "400",
    dateColor: "",
    dateFontFamily: "inherit",
    dateFontSize: 13,
    dateFontWeight: "400",
    advMargin:  { top: 0,  right: 0,  bottom: 0,  left: 0  },
    advPadding: { top: 48, right: 24, bottom: 48, left: 24 },
    hideDesktop: false, responsiveSpacing: {},
    hideTablet:  false,
    hideMobile:  false,
  },

  render: ({
    articleTitle, author, showAuthor, publishDate, showDate, body,
    featuredImage, imagePosition, imageHeight, imageBorderRadius, imageFit, imageMarginBottom,
    titleAlign, titleColor, titleFontFamily, titleFontSize, titleFontWeight, titleLineHeight,
    bodyColor, bodyFontFamily, bodyFontSize, bodyFontWeight, bodyLineHeight,
    authorColor, authorFontFamily, authorFontSize, authorFontWeight,
    dateColor, dateFontFamily, dateFontSize, dateFontWeight,
    advMargin, advPadding, hideDesktop, hideTablet, hideMobile,
    id, responsiveSpacing,
  }: any) => {
    const m  = advMargin  ?? { top: 0,  right: 0,  bottom: 0,  left: 0  };
    const pd = advPadding ?? { top: 48, right: 24, bottom: 48, left: 24 };
    const hideClasses = [
      hideDesktop ? "puck-hide-desktop" : "",
      hideTablet  ? "puck-hide-tablet"  : "",
      hideMobile  ? "puck-hide-mobile"  : "",
    ].filter(Boolean).join(" ");
    const radius = imageBorderRadius ?? 8;
    const imgH = imageHeight ?? 400;
    const isHorizontal = imagePosition === "left" || imagePosition === "right";
    const fit = imageFit ?? "cover";
    const imgMarginBottom = imageMarginBottom ?? 24;

    const imgStyle: React.CSSProperties = {
      width: "100%",
      height: imgH,
      objectFit: fit as React.CSSProperties["objectFit"],
      display: "block",
    };

    const formatDate = (d: string) => {
      if (!d) return "";
      const parsed = new Date(d);
      return isNaN(parsed.getTime()) ? d : parsed.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    };

    const imageBox = featuredImage ? (
      <div style={{
        flexShrink: 0,
        minWidth: 0,
        width: isHorizontal ? "44%" : "100%",
        marginBottom: isHorizontal ? 0 : imgMarginBottom,
        borderRadius: radius,
        overflow: "hidden",
      }}>
        <img src={featuredImage} alt={articleTitle || "Featured image"} style={imgStyle} />
      </div>
    ) : null;

    const metaVisible = (showAuthor !== false && !!author) || (showDate !== false && !!publishDate);

    const articleContent = (
      <div style={{ flex: 1, minWidth: 0 }}>
        {articleTitle && (
          <h1 style={{
            fontSize: titleFontSize ? `${titleFontSize}px` : "2rem",
            fontWeight: Number(titleFontWeight ?? 700),
            fontFamily: titleFontFamily && titleFontFamily !== "inherit" ? titleFontFamily : "var(--heading-font)",
            color: titleColor || "var(--primary-color)",
            textAlign: titleAlign as React.CSSProperties["textAlign"],
            lineHeight: titleLineHeight ?? 1.3,
            marginBottom: 10,
          }}>
            {articleTitle}
          </h1>
        )}
        {metaVisible && (
          <div style={{
            display: "flex",
            gap: 12,
            marginBottom: 28,
            flexWrap: "wrap",
            justifyContent: titleAlign === "center" ? "center" : titleAlign === "right" ? "flex-end" : "flex-start",
          }}>
            {showAuthor !== false && author && (
              <span style={{
                fontSize: authorFontSize ? `${authorFontSize}px` : 14,
                fontWeight: Number(authorFontWeight ?? 400),
                fontFamily: authorFontFamily && authorFontFamily !== "inherit" ? authorFontFamily : undefined,
                color: authorColor || "var(--text-color)",
              }}>
                By <strong>{author}</strong>
              </span>
            )}
            {showDate !== false && publishDate && (
              <span style={{
                fontSize: dateFontSize ? `${dateFontSize}px` : 13,
                fontWeight: Number(dateFontWeight ?? 400),
                fontFamily: dateFontFamily && dateFontFamily !== "inherit" ? dateFontFamily : undefined,
                color: dateColor || "var(--text-color)",
              }}>
                {formatDate(publishDate)}
              </span>
            )}
          </div>
        )}
        <div style={{
          fontSize: bodyFontSize ? `${bodyFontSize}px` : "1rem",
          lineHeight: bodyLineHeight ?? 1.75,
          color: bodyColor || "var(--text-color)",
          fontWeight: Number(bodyFontWeight ?? 400),
          fontFamily: bodyFontFamily && bodyFontFamily !== "inherit" ? bodyFontFamily : undefined,
        }}>
          {body}
        </div>
      </div>
    );

    return (
      <div
        className={hideClasses || undefined}
        data-pb-rs={id}
        style={{
          position: "relative",
          marginTop: m.top, marginRight: m.right, marginBottom: m.bottom, marginLeft: m.left,
          paddingTop: pd.top, paddingRight: pd.right, paddingBottom: pd.bottom, paddingLeft: pd.left,
        }}
      >
        <EditorHideOverlay hideDesktop={hideDesktop} hideTablet={hideTablet} hideMobile={hideMobile} />
        {(() => { const rsCss = buildResponsiveSpacingCss(`[data-pb-rs="${id}"]`, responsiveSpacing); return rsCss ? <style>{rsCss}</style> : null; })()}
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          {isHorizontal ? (
            <div style={{ display: "flex", flexDirection: imagePosition === "left" ? "row" : "row-reverse", gap: 48, alignItems: "flex-start" }}>
              {imageBox}
              {articleContent}
            </div>
          ) : (
            <>
              {imageBox}
              {articleContent}
            </>
          )}
        </div>
      </div>
    );
  },
};
