// @ts-nocheck
// ─── FeaturedProductComponent ───
//
// Picks a REAL Shopify product via App Bridge ResourcePicker and renders it.
// The block stores a snapshot (title/image/price/description/vendor/sku).
// On the live storefront pb-widget-loader.js hydrates from /products/{handle}.js
// so all data always reflects the current product.

import type * as React from "react";
import { usePuck } from "@my-app/puck-editor";
import {
  ToggleField,
  StackedTextField,
  BlockTabBar,
  TabSection,
  InlineSelect,
  ColorPickerField,
  AlignField,
  FourSideField,
  ResponsiveSpacingField,
  SliderNumberField,
  EditorHideOverlay,
  buildResponsiveSpacingCss,
} from "@/puck-blocks/shared";
import { ProductPickerField } from "@/puck-blocks/block-fields";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";

const FeaturedProductComponent = {
  label: "Featured Product",
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

        return (
          <BlockTabBar blockKey="FeaturedProduct">
            {(tab: any) => (
              <>
                {tab === "content" && (
                  <>
                    <TabSection title="Product" />
                    <ProductPickerField
                      label="Pick a product"
                      value={props.product ?? null}
                      onChange={(v) => set("product", v)}
                    />

                    <TabSection title="Display" />
                    <ToggleField label="Show Image"           value={props.showImage       !== false} onChange={(v) => set("showImage", v)} />
                    <ToggleField label="Show Title"           value={props.showTitle       !== false} onChange={(v) => set("showTitle", v)} />
                    <ToggleField label="Show Vendor"          value={!!props.showVendor}              onChange={(v) => set("showVendor", v)} />
                    <ToggleField label="Show Price"           value={props.showPrice       !== false} onChange={(v) => set("showPrice", v)} />
                    <ToggleField label="Show Compare-at Price" value={!!props.showCompareAt}          onChange={(v) => set("showCompareAt", v)} />
                    <ToggleField label="Show Description"     value={!!props.showDescription}         onChange={(v) => set("showDescription", v)} />
                    <ToggleField label="Show SKU"             value={!!props.showSku}                 onChange={(v) => set("showSku", v)} />
                    <ToggleField label="Show Variant Selector" value={!!props.showVariants}           onChange={(v) => set("showVariants", v)} />
                    {props.showVariants && (
                      <InlineSelect
                        label="Variant Style"
                        value={props.variantStyle ?? "dropdown"}
                        onChange={(v) => set("variantStyle", v)}
                        options={[
                          { value: "dropdown", label: "Dropdown" },
                          { value: "buttons",  label: "Buttons"  },
                        ]}
                      />
                    )}
                    <ToggleField label="Show Quantity Selector" value={!!props.showQuantity}          onChange={(v) => set("showQuantity", v)} />
                    <ToggleField label="Show Star Rating"      value={!!props.showRating}             onChange={(v) => set("showRating", v)} />
                    {props.showRating && (
                      <SliderNumberField label="Stars (0–5)" value={props.ratingValue ?? 5} onChange={(v) => set("ratingValue", v)} min={0} max={5} step={0.5} unit="★" />
                    )}

                    <TabSection title="Button" />
                    <ToggleField label="Show Button" value={props.showButton !== false} onChange={(v) => set("showButton", v)} />
                    {props.showButton !== false && (
                      <>
                        <StackedTextField label="Button Label" value={props.buttonLabel ?? "Shop Now"} onChange={(v) => set("buttonLabel", v)} placeholder="Shop Now" />
                        <ToggleField label="Add to Cart (vs. View Product)" value={!!props.addToCart} onChange={(v) => set("addToCart", v)} />
                      </>
                    )}

                    <TabSection title="Badge" />
                    <ToggleField label="Show Badge" value={!!props.showBadge} onChange={(v) => set("showBadge", v)} />
                    {props.showBadge && (
                      <>
                        <StackedTextField label="Badge Text" value={props.badgeText ?? "Sale"} onChange={(v) => set("badgeText", v)} placeholder="Sale" />
                        <ColorPickerField label="Badge Background" value={props.badgeBg ?? "#ef4444"}   onChange={(v) => set("badgeBg", v)} />
                        <ColorPickerField label="Badge Text Color"  value={props.badgeColor ?? "#ffffff"} onChange={(v) => set("badgeColor", v)} />
                      </>
                    )}
                  </>
                )}

                {tab === "style" && (
                  <>
                    <TabSection title="Layout" />
                    <InlineSelect
                      label="Layout"
                      value={props.layout ?? "vertical"}
                      onChange={(v) => set("layout", v)}
                      options={[
                        { value: "vertical",   label: "Image on top"  },
                        { value: "horizontal", label: "Image on left" },
                        { value: "horizontal-reverse", label: "Image on right" },
                      ]}
                    />
                    <AlignField
                      label="Content Alignment"
                      value={props.align ?? "left"}
                      onChange={(v) => set("align", v)}
                      options={[
                        { value: "left",   icon: <AlignLeft   size={15} />, title: "Left"   },
                        { value: "center", icon: <AlignCenter size={15} />, title: "Center" },
                        { value: "right",  icon: <AlignRight  size={15} />, title: "Right"  },
                      ]}
                    />
                    <SliderNumberField label="Image Aspect (W:H × 100)" value={props.imageAspect ?? 100} onChange={(v) => set("imageAspect", v)} min={50} max={200} step={5} unit="%" />
                    <InlineSelect
                      label="Image Fit"
                      value={props.imageFit ?? "cover"}
                      onChange={(v) => set("imageFit", v)}
                      options={[
                        { value: "cover",   label: "Cover"   },
                        { value: "contain", label: "Contain" },
                      ]}
                    />
                    <SliderNumberField label="Card Border Radius (px)" value={props.borderRadius ?? 12} onChange={(v) => set("borderRadius", v)} min={0} max={48} step={1} unit="px" />
                    <ToggleField label="Show Card Shadow" value={!!props.showShadow} onChange={(v) => set("showShadow", v)} />
                    <ToggleField label="Show Section Dividers" value={!!props.showDividers} onChange={(v) => set("showDividers", v)} />

                    <TabSection title="Colors" />
                    <ColorPickerField label="Card Background"  value={props.cardBg ?? ""}          onChange={(v) => set("cardBg", v)} />
                    <ColorPickerField label="Title Color"      value={props.titleColor ?? ""}      onChange={(v) => set("titleColor", v)} />
                    <ColorPickerField label="Vendor Color"     value={props.vendorColor ?? ""}     onChange={(v) => set("vendorColor", v)} />
                    <ColorPickerField label="Price Color"      value={props.priceColor ?? ""}      onChange={(v) => set("priceColor", v)} />
                    <ColorPickerField label="Compare-at Color" value={props.compareAtColor ?? ""}  onChange={(v) => set("compareAtColor", v)} />
                    <ColorPickerField label="Description Color" value={props.descColor ?? ""}      onChange={(v) => set("descColor", v)} />
                    <ColorPickerField label="SKU / Meta Color"  value={props.skuColor ?? ""}       onChange={(v) => set("skuColor", v)} />
                    <ColorPickerField label="Button Text"       value={props.buttonTextColor ?? ""} onChange={(v) => set("buttonTextColor", v)} />
                    <ColorPickerField label="Button Background"  value={props.buttonBgColor ?? ""}  onChange={(v) => set("buttonBgColor", v)} />

                    <TabSection title="Typography" />
                    <SliderNumberField label="Title Size (px)"       value={props.titleFontSize   ?? 20} onChange={(v) => set("titleFontSize", v)}   min={12} max={48} step={1} unit="px" />
                    <SliderNumberField label="Vendor Size (px)"      value={props.vendorFontSize  ?? 13} onChange={(v) => set("vendorFontSize", v)}  min={10} max={24} step={1} unit="px" />
                    <SliderNumberField label="Price Size (px)"       value={props.priceFontSize   ?? 18} onChange={(v) => set("priceFontSize", v)}   min={10} max={40} step={1} unit="px" />
                    <SliderNumberField label="Description Size (px)" value={props.descFontSize    ?? 14} onChange={(v) => set("descFontSize", v)}    min={10} max={24} step={1} unit="px" />

                    <TabSection title="Button Style" />
                    <InlineSelect
                      label="Button Width"
                      value={props.buttonWidth ?? "auto"}
                      onChange={(v) => set("buttonWidth", v)}
                      options={[
                        { value: "auto", label: "Auto" },
                        { value: "full", label: "Full width" },
                      ]}
                    />
                    <SliderNumberField label="Button Border Radius (px)" value={props.buttonRadius ?? 8} onChange={(v) => set("buttonRadius", v)} min={0} max={32} step={1} unit="px" />
                  </>
                )}

                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin"  value={props.advMargin  ?? { top: 0, right: 0, bottom: 0, left: 0 }}   onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding" value={props.advPadding ?? { top: 16, right: 16, bottom: 16, left: 16 }} onChange={(v) => set("advPadding", v)} />
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
    product: null,
    // Display toggles
    showImage:       true,
    showTitle:       true,
    showVendor:      false,
    showPrice:       true,
    showCompareAt:   false,
    showDescription: false,
    showSku:         false,
    showVariants:    false,
    variantStyle:    "dropdown",
    showQuantity:    false,
    showRating:      false,
    ratingValue:     5,
    showButton:      true,
    buttonLabel:     "Shop Now",
    addToCart:       false,
    // Badge
    showBadge:  false,
    badgeText:  "Sale",
    badgeBg:    "#ef4444",
    badgeColor: "#ffffff",
    // Layout
    layout:      "vertical",
    align:       "left",
    imageAspect: 100,
    imageFit:    "cover",
    borderRadius: 12,
    showShadow:   false,
    showDividers: false,
    // Colors
    cardBg:           "",
    titleColor:       "",
    vendorColor:      "",
    priceColor:       "",
    compareAtColor:   "",
    descColor:        "",
    skuColor:         "",
    buttonTextColor:  "#ffffff",
    buttonBgColor:    "var(--primary-color, #0158ad)",
    // Typography
    titleFontSize:   20,
    vendorFontSize:  13,
    priceFontSize:   18,
    descFontSize:    14,
    // Button style
    buttonWidth:  "auto",
    buttonRadius: 8,
    // Spacing
    advMargin:  { top: 0,  right: 0,  bottom: 0,  left: 0  },
    advPadding: { top: 16, right: 16, bottom: 16, left: 16 },
    hideDesktop: false,
    hideTablet:  false,
    hideMobile:  false,
    responsiveSpacing: {},
  },

  render: ({
    product,
    showImage, showTitle, showVendor, showPrice, showCompareAt,
    showDescription, showSku, showVariants, variantStyle,
    showQuantity, showRating, ratingValue,
    showButton, buttonLabel, addToCart,
    showBadge, badgeText, badgeBg, badgeColor,
    layout, align, imageAspect, imageFit, borderRadius, showShadow, showDividers,
    cardBg, titleColor, vendorColor, priceColor, compareAtColor, descColor, skuColor,
    buttonTextColor, buttonBgColor,
    titleFontSize, vendorFontSize, priceFontSize, descFontSize,
    buttonWidth, buttonRadius,
    advMargin, advPadding, hideDesktop, hideTablet, hideMobile,
    id, responsiveSpacing,
  }: any) => {
    const m  = advMargin  ?? { top: 0, right: 0, bottom: 0, left: 0 };
    const pd = advPadding ?? { top: 16, right: 16, bottom: 16, left: 16 };
    const hideClasses = [
      hideDesktop ? "puck-hide-desktop" : "",
      hideTablet  ? "puck-hide-tablet"  : "",
      hideMobile  ? "puck-hide-mobile"  : "",
    ].filter(Boolean).join(" ");

    const isHorizontal = layout === "horizontal" || layout === "horizontal-reverse";
    const isReverse    = layout === "horizontal-reverse";
    const radius       = borderRadius ?? 12;
    const aspect       = (imageAspect ?? 100) / 100;
    const justify      = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
    const dividerStyle = showDividers ? { borderTop: "1px solid #e5e7eb", marginTop: 4, paddingTop: 8 } : {};

    if (!product || (!product.handle && !product.title)) {
      return (
        <div data-pb-rs={id} style={{ position: "relative" }}>
          <EditorHideOverlay hideDesktop={hideDesktop} hideTablet={hideTablet} hideMobile={hideMobile} />
          <div style={{ border: "2px dashed #e5e7eb", borderRadius: 12, padding: 32, textAlign: "center", color: "#6b7280", fontSize: 14 }}>
            Select a product in the Content tab
          </div>
        </div>
      );
    }

    // ── Image ────────────────────────────────────────────────────────────────
    const imgEl = showImage && product.image ? (
      <div style={{ position: "relative", flexShrink: 0, width: isHorizontal ? "42%" : "100%", borderRadius: radius, overflow: "hidden", background: "#f3f4f6", aspectRatio: String(aspect) }}>
        <img src={product.image} alt={product.title || "Product"} style={{ width: "100%", height: "100%", objectFit: (imageFit ?? "cover") as any, display: "block" }} />
        {showBadge && badgeText && (
          <div style={{ position: "absolute", top: 10, left: 10, background: badgeBg || "#ef4444", color: badgeColor || "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, letterSpacing: "0.03em", textTransform: "uppercase" }}>
            {badgeText}
          </div>
        )}
      </div>
    ) : null;

    // ── Star rating ──────────────────────────────────────────────────────────
    const stars = (n: number) => {
      const full = Math.floor(n); const half = n - full >= 0.5;
      return Array.from({ length: 5 }, (_, i) => {
        const fill = i < full ? "#f59e0b" : (i === full && half ? "url(#pb-fp-half)" : "#d1d5db");
        return (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" style={{ display: "inline-block" }}>
            {i === full && half && (
              <defs>
                <linearGradient id="pb-fp-half" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="50%" stopColor="#f59e0b" /><stop offset="50%" stopColor="#d1d5db" />
                </linearGradient>
              </defs>
            )}
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill={fill} stroke="none" />
          </svg>
        );
      });
    };

    // ── Variant selector (editor placeholder) ───────────────────────────────
    const variantEl = showVariants ? (
      <div style={{ ...dividerStyle }}>
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>Options</div>
        {variantStyle === "buttons" ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["S", "M", "L", "XL"].map((s) => (
              <button key={s} style={{ padding: "5px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, background: s === "M" ? "#1a1a1a" : "#fff", color: s === "M" ? "#fff" : "#374151", cursor: "pointer", fontWeight: 500 }}>{s}</button>
            ))}
          </div>
        ) : (
          <select style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, color: "#374151", background: "#fff" }}>
            <option>Default Title</option>
          </select>
        )}
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Variants load live on storefront</div>
      </div>
    ) : null;

    // ── Quantity selector ────────────────────────────────────────────────────
    const quantityEl = showQuantity ? (
      <div style={{ ...dividerStyle, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, marginRight: 4 }}>Qty</div>
        <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: 6, overflow: "hidden" }}>
          <button style={{ width: 32, height: 36, border: "none", background: "#f9fafb", cursor: "pointer", fontSize: 16, color: "#374151" }}>−</button>
          <input type="number" defaultValue={1} min={1} style={{ width: 44, height: 36, border: "none", borderLeft: "1px solid #d1d5db", borderRight: "1px solid #d1d5db", textAlign: "center", fontSize: 13, color: "#374151" }} />
          <button style={{ width: 32, height: 36, border: "none", background: "#f9fafb", cursor: "pointer", fontSize: 16, color: "#374151" }}>+</button>
        </div>
      </div>
    ) : null;

    // ── Info column ──────────────────────────────────────────────────────────
    const info = (
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6, alignItems: justify, textAlign: align as any }}>
        {showVendor && product.vendor && (
          <div style={{ fontSize: vendorFontSize ?? 13, color: vendorColor || "#6b7280", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {product.vendor}
          </div>
        )}
        {showTitle && product.title && (
          <div style={{ fontSize: titleFontSize ?? 20, fontWeight: 700, color: titleColor || "var(--heading-color, #1a1a1a)", fontFamily: "var(--heading-font)", lineHeight: 1.25 }}>
            {product.title}
          </div>
        )}
        {showRating && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: justify }}>
            {stars(ratingValue ?? 5)}
            <span style={{ fontSize: 12, color: "#6b7280" }}>({ratingValue ?? 5})</span>
          </div>
        )}
        {(showPrice || showCompareAt) && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", justifyContent: justify, ...dividerStyle }}>
            {showCompareAt && product.compareAtPrice != null && (
              <span style={{ fontSize: priceFontSize ?? 18, fontWeight: 400, color: compareAtColor || "#9ca3af", textDecoration: "line-through" }}>
                {product.compareAtPrice}
              </span>
            )}
            {showPrice && product.price != null && (
              <span style={{ fontSize: priceFontSize ?? 18, fontWeight: 700, color: priceColor || "var(--primary-color, #0158ad)" }}>
                {product.price}
              </span>
            )}
          </div>
        )}
        {showDescription && product.description && (
          <div style={{ fontSize: descFontSize ?? 14, color: descColor || "#374151", lineHeight: 1.6, ...dividerStyle }}>
            {product.description}
          </div>
        )}
        {showSku && (
          <div style={{ fontSize: 12, color: skuColor || "#9ca3af", ...dividerStyle }}>
            SKU: <span style={{ fontWeight: 500 }}>{product.sku || "—"}</span>
          </div>
        )}
        {variantEl}
        {quantityEl}
        {showButton && (
          <div style={{ marginTop: 4, width: buttonWidth === "full" ? "100%" : "auto", ...dividerStyle }}>
            <a
              href={product.handle ? `/products/${product.handle}` : "#"}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: buttonWidth === "full" ? "100%" : "auto",
                padding: "10px 24px",
                borderRadius: buttonRadius ?? 8,
                fontSize: 14, fontWeight: 600, textDecoration: "none",
                color: buttonTextColor || "#fff",
                background: buttonBgColor || "var(--primary-color, #0158ad)",
                cursor: "pointer",
              }}
            >
              {buttonLabel || (addToCart ? "Add to Cart" : "Shop Now")}
            </a>
          </div>
        )}
      </div>
    );

    const cardChildren = isReverse ? [info, imgEl] : [imgEl, info];

    return (
      <div className={hideClasses || undefined} data-pb-rs={id} style={{ position: "relative", marginTop: m.top, marginRight: m.right, marginBottom: m.bottom, marginLeft: m.left }}>
        <EditorHideOverlay hideDesktop={hideDesktop} hideTablet={hideTablet} hideMobile={hideMobile} />
        {(() => { const rsCss = buildResponsiveSpacingCss(`[data-pb-rs="${id}"]`, responsiveSpacing); return rsCss ? <style>{rsCss}</style> : null; })()}
        <div
          style={{
            display: "flex",
            flexDirection: isHorizontal ? "row" : "column",
            gap: isHorizontal ? 32 : 16,
            alignItems: isHorizontal ? "flex-start" : "stretch",
            background: cardBg || undefined,
            borderRadius: radius,
            boxShadow: showShadow ? "0 4px 20px rgba(0,0,0,0.10)" : undefined,
            paddingTop: pd.top, paddingRight: pd.right, paddingBottom: pd.bottom, paddingLeft: pd.left,
          }}
        >
          {cardChildren}
        </div>
      </div>
    );
  },
};

export { FeaturedProductComponent };
