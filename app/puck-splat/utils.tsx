// @ts-nocheck
import type { GlobalSettings } from "@/lib/settings.server";
import type { Data } from "@my-app/puck-editor";
import { Render } from "@my-app/puck-editor";
import type { SavedBlock, BlockItem } from "./types";
import { config, previewConfig } from "@/puck.config";

export const savedBlockItemIds = new Set<string>();

// --- Canvas Item Replacement --------------------------------------------------

/**
 * Returns a new Data object with the item matching `oldId` replaced by
 * `newItem`, searching both `content` and all `zones`.
 */
export function replaceItemById(data: Data, oldId: string, newItem: unknown): Data {
  const replaceInList = (items: unknown[]): unknown[] =>
    items.map((item: any) => (item.props?.id === oldId ? newItem : item));
  return {
    ...data,
    content: replaceInList(data.content ?? []) as Data["content"],
    zones: Object.fromEntries(
      Object.entries(data.zones ?? {}).map(([k, v]) => [k, replaceInList(v as unknown[])]),
    ) as Data["zones"],
  };
}

// --- CSS Variables ------------------------------------------------------------

/**
 * Private: write all CSS custom properties onto a single DOM element.
 * Extracted so we can call it for both the outer document and the Puck iframe.
 */
function _applyVarsToElement(
  root: HTMLElement,
  settings: Partial<GlobalSettings>,
): void {

  if (!root) return;
  const set = (prop: string, val?: string | null) => {
    if (val && val !== "undefined" && val.trim() !== "") {
      root.style.setProperty(prop, val);
    }
  };

  // -- Colors ------------------------------------------------------------------
  set("--primary-color", settings.primaryColor);
  set("--secondary-color", settings.secondaryColor);
  set("--accent-color", settings.accentColor);
  set("--text-color", settings.textColor);

  const bgValue =
    settings.pageBackgroundType === "gradient" && settings.pageBackgroundGradient
      ? settings.pageBackgroundGradient
      : settings.backgroundColor;
  set("--background-color", bgValue);

  // Custom palette tokens
  (settings.customColors ?? []).forEach((c) => {
    if (c.name && c.value) {
      set(`--color-${c.name.toLowerCase().replace(/\s+/g, "-")}`, c.value);
    }
  });

  // -- Layout ------------------------------------------------------------------
  set("--container-width", settings.containerWidth);
  set("--column-gap", settings.columnGap);
  set("--row-gap", settings.rowGap);

  // -- Fonts -------------------------------------------------------------------
  set("--font-family", settings.fontFamily);
  set("--heading-font", settings.headingFont ?? settings.fontFamily);
  set("--base-font-size", settings.baseFontSize);
  set("--line-height", settings.lineHeight);
  set("--letter-spacing", settings.letterSpacing);

  // -- Typography --------------------------------------------------------------
  set("--h1-size", settings.h1Size);
  set("--h2-size", settings.h2Size);
  set("--h3-size", settings.h3Size);
  set("--h4-size", settings.h4Size);
  set("--h5-size", settings.h5Size);
  set("--h6-size", settings.h6Size);
  set("--heading-weight", settings.headingWeight);
  set("--heading-line-height", settings.headingLineHeight);

  // -- Buttons -----------------------------------------------------------------
  const borderRadius =
    settings.borderRadius && settings.borderRadius !== "undefined"
      ? settings.borderRadius
      : "8px";
  set("--border-radius", borderRadius);

  const buttonBR =
    settings.buttonStyle === "pill"
      ? "9999px"
      : settings.buttonStyle === "square"
        ? "0px"
        : borderRadius;
  set("--button-border-radius", buttonBR);

  set("--button-padding-x", settings.buttonPaddingX);
  set("--button-padding-y", settings.buttonPaddingY);
  set("--button-text-transform", settings.buttonTextTransform);
  set("--button-font-weight", settings.buttonFontWeight);
  set("--button-border-width", settings.buttonBorderWidth);

  // -- Images ------------------------------------------------------------------
  set("--image-border-radius", settings.imageBorderRadius);
  set("--image-object-fit", settings.imageObjectFit);

  // -- Animation ---------------------------------------------------------------
  const durationMap: Record<string, string> = {
    none: "0s",
    slow: "0.6s",
    normal: "0.3s",
    fast: "0.15s",
  };
  if (settings.animationSpeed) {
    set("--animation-speed", durationMap[settings.animationSpeed] ?? "0.3s");
  }

  // -- Theme -------------------------------------------------------------------
  if (settings.theme) {
    root.dataset.theme = settings.theme;
  }
}

/**
 * Apply all global design tokens as CSS custom properties.
 *
 * When called without a `rootElement` (the common case), it targets:
 *  1. The outer document's `.page-preview` / `<html>`
 *  2. Puck's preview iframe (`iframe#preview-frame`) — so the canvas reflects
 *     changes even though it lives in a separate document.
 *
 * When called with an explicit `rootElement` (e.g. from IframeThemeInjector)
 * it only applies to that element's document, avoiding double injection.
 */
export function applyCSSVariables(
  settings: Partial<GlobalSettings>,
  rootElement?: HTMLElement,
): void {
  if (typeof document === "undefined") return;

  const outerRoot =
    rootElement ??
    (document.querySelector(".page-preview") as HTMLElement) ??
    document.documentElement;

  // Add null check for outerRoot
  if (!outerRoot) return;

  _applyVarsToElement(outerRoot, settings);

  // Ensure the page-level data-theme is always set on <html> so that
  // selectors like html[data-theme="dark"] fire correctly in the outer doc.
  if (settings.theme && !rootElement && document.documentElement) {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }

  // Inject conditional CSS rules (hover effects, keyframes, etc.) into
  // the document that owns `outerRoot`.
  injectDynamicEffects(settings, outerRoot.ownerDocument ?? document);

  // ── Propagate into Puck's preview iframe ─────────────────────────────────
  // Only for top-level calls (not when a rootElement is explicitly provided,
  // which means we were already called from inside the iframe context).
  if (!rootElement) {
    const iframe = document.querySelector(
      "iframe#preview-frame",
    ) as HTMLIFrameElement | null;
    const iframeDoc = iframe?.contentDocument;
    if (iframeDoc && iframeDoc !== document) {
      const iframeRoot =
        (iframeDoc.querySelector(".page-preview") as HTMLElement) ??
        iframeDoc.documentElement;
      if (iframeRoot) {
        _applyVarsToElement(iframeRoot, settings);
        if (settings.theme && iframeDoc.documentElement) {
          iframeDoc.documentElement.setAttribute("data-theme", settings.theme);
        }
        injectDynamicEffects(settings, iframeDoc);
      }
    }
  }
}

// --- Dynamic CSS Effects Helper -----------------------------------------------

/**
 * Inject / update the two `<style>` tags that hold conditional CSS rules
 * (hover states, keyframes, custom CSS) into the given document.
 * Accepts a `doc` so it can write into both the outer document and Puck's
 * preview iframe document without code duplication.
 */
function injectDynamicEffects(
  settings: Partial<GlobalSettings>,
  doc: Document = document,
): void {
  if (typeof document === "undefined") return;
  
  // Check if document head is available
  if (!doc.head) return;

  const getOrCreate = (id: string): HTMLStyleElement => {
    let el = doc.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = doc.createElement("style") as HTMLStyleElement;
      el.id = id;
      // Double check head is still available before appending
      if (doc.head) {
        doc.head.appendChild(el);
      }
    }
    return el;
  };

  const el = getOrCreate("gs-dynamic-effects");

  const pc = settings.primaryColor ?? "#0158ad";
  const rules: string[] = [];

  // CTA button selector — only elements explicitly marked pb-btn.
  // UI controls (carousel arrows, dots, pagination) carry no-global-style so they
  // are never affected. Plain <button> without either class is also excluded so
  // sections/blocks that contain icon-buttons never shift or glow unexpectedly.
  const btnSel = `.page-preview .pb-btn`;
  const btnHover = `.page-preview .pb-btn:hover`;
  const btnOutlineSel = `.page-preview .pb-btn.pb-btn-outline`;

  rules.push(
    `${btnSel}{` +
    `transition:background-color var(--animation-speed) ease-out,color var(--animation-speed) ease-out,` +
    `border-color var(--animation-speed) ease-out,transform var(--animation-speed) ease-out,` +
    `box-shadow var(--animation-speed) ease-out,filter var(--animation-speed) ease-out;}`,
  );

  // Border width is a global token, but should affect outline variants only.
  rules.push(
    `${btnOutlineSel}{` +
    `border-style:solid !important;` +
    `border-color:currentColor !important;` +
    `border-width:var(--button-border-width,2px) !important}`,
  );

  // Button hover effect
  const btnHoverDecl: Record<string, string> = {
    lift:  "transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.15)",
    glow:  `box-shadow:0 0 18px ${pc}44`,
    scale: "transform:scale(1.07)",
    fill:  "filter:brightness(0.85) saturate(1.1)",
  };
  const bhe = settings.buttonHoverEffect ?? "none";
  if (bhe !== "none" && btnHoverDecl[bhe]) {
    rules.push(`${btnHover}{${btnHoverDecl[bhe]}}`);
  }

  // Button shadow (base state)
  const btnShadowDecl: Record<string, string> = {
    sm:      "0 1px 3px rgba(0,0,0,0.12),0 1px 2px rgba(0,0,0,0.06)",
    md:      "0 4px 12px rgba(0,0,0,0.15),0 2px 4px rgba(0,0,0,0.1)",
    colored: `0 4px 16px ${pc}66`,
  };
  const bsd = settings.buttonShadow ?? "none";
  if (bsd !== "none" && btnShadowDecl[bsd]) {
    rules.push(`${btnSel}{box-shadow:${btnShadowDecl[bsd]}}`);
  }

  // Image base styles — border-radius + object-fit applied globally to all canvas images
  const ibr = settings.imageBorderRadius ?? "8px";
  const iof = settings.imageObjectFit ?? "cover";
  rules.push(
    `.page-preview img:not(.no-global-style){` +
    `border-radius:${ibr};` +
    `object-fit:${iof};` +
    `transition:transform var(--animation-speed) ease,opacity var(--animation-speed) ease,box-shadow var(--animation-speed) ease;` +
    `}`,
  );
  const imgHoverDecl: Record<string, string> = {
    zoom: "transform:scale(1.05);",
    dim:  "opacity:0.82;",
    lift: "transform:translateY(-4px); box-shadow:0 12px 28px rgba(0,0,0,0.18);",
  };
  const ihe = settings.imageHoverEffect ?? "none";
  if (ihe !== "none" && imgHoverDecl[ihe]) {
    rules.push(`.page-preview img:not(.no-global-style):hover { ${imgHoverDecl[ihe]} }`);
  }

  // Links
  const ldec = settings.linkDecoration ?? "hover-underline";
  if (settings.linkColor && settings.linkColor.trim()) {
    rules.push(`.page-preview a:not(.no-global-style){color:${settings.linkColor};text-decoration:${ldec==="underline"?"underline":"none"};transition:color var(--animation-speed) ease;}`);
  } else if (ldec !== "none") {
    rules.push(`.page-preview a:not(.no-global-style){text-decoration:${ldec==="underline"?"underline":"none"};transition:color var(--animation-speed) ease;}`);
  }
  if (ldec === "hover-underline") {
    rules.push(`.page-preview a:not(.no-global-style):hover{text-decoration:underline;}`);
  }
  if (settings.linkHoverColor && settings.linkHoverColor.trim()) {
    rules.push(`.page-preview a:not(.no-global-style):hover{color:${settings.linkHoverColor};}`);
  }

  // Card shadow (.shadow-lg is used by CardBlock's Floating variant)
  const cardShadowDecl: Record<string, string> = {
    sm: "0 1px 3px 0 rgba(0,0,0,0.1),0 1px 2px 0 rgba(0,0,0,0.06)",
    md: "0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -2px rgba(0,0,0,0.1)",
    lg: "0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -4px rgba(0,0,0,0.1)",
    xl: "0 20px 25px -5px rgba(0,0,0,0.1),0 8px 10px -6px rgba(0,0,0,0.1)",
  };
  const csd = settings.cardShadow ?? "none";
  if (csd !== "none" && cardShadowDecl[csd]) {
    rules.push(`.page-preview .shadow-lg{box-shadow:${cardShadowDecl[csd]} !important;}`);
  }

  // Header / Footer layout effects
  if (settings.headerSticky) {
    rules.push(`.page-preview header:first-of-type{position:sticky;top:0;z-index:100;}`);
  }
  if (settings.footerSticky) {
    rules.push(`.page-preview footer{position:sticky;bottom:0;z-index:100;}`);
  }
  if (settings.headerTransparent) {
    rules.push(`.page-preview header:first-of-type{background-color:transparent !important;background:transparent !important;}`);
  }

  // Scroll / entrance animations
  const allowedScrollAnims = ["fade-in", "slide-up", "zoom-in", "slide-left", "slide-right"];
  const scrollAnim = settings.scrollAnimation ?? "none";
  if (scrollAnim !== "none" && allowedScrollAnims.includes(scrollAnim)) {
    const dur = settings.scrollAnimationDuration ?? "0.5s";
    rules.push([
      `@keyframes gs-fade-in    {from{opacity:0}to{opacity:1}}`,
      `@keyframes gs-slide-up   {from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}`,
      `@keyframes gs-zoom-in    {from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}`,
      `@keyframes gs-slide-left {from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}`,
      `@keyframes gs-slide-right{from{opacity:0;transform:translateX(-30px)}to{opacity:1;transform:translateX(0)}}`,
      `.gs-anim-hidden{opacity:0;}`,
      `.gs-anim-visible{animation:gs-${scrollAnim} ${dur} ease both;}`,
    ].join("\n"));
  }

  el.textContent = rules.join("\n");

  // Custom CSS — separate <style> tag so it can override design tokens
  const customEl = getOrCreate("gs-custom-css");
  customEl.textContent = settings.customCSS ?? "";

  // Responsive CSS — always injected; targets class names added to section grids/components
  const responsiveEl = getOrCreate("gs-responsive");
  responsiveEl.textContent = [
    `.page-preview{overflow-x:hidden}`,
    `.page-preview img{max-width:100%;height:auto}`,
    // ── Mobile ≤ 767px ────────────────────────────────────────────────────────
    `@media(max-width:767px){`,
    // Hero: reduce side padding on small screens
    `.page-preview .pb-hero{padding:40px 20px !important}`,
    // 2-col grid (ContactSection form+info)
    `.page-preview .pb-grid-2col{grid-template-columns:1fr !important;gap:32px !important}`,
    // N-col grid (GallerySection, ServiceSection, TestimonialSection)
    `.page-preview .pb-grid-ncol{grid-template-columns:1fr !important}`,
    // Stats row → max 2 cols so numbers stay readable
    `.page-preview .pb-grid-stats{grid-template-columns:repeat(2,1fr) !important;gap:12px !important}`,
    // Photo collage → simple 2-col grid, remove fixed spans
    `.page-preview .pb-collage{grid-template-columns:repeat(2,1fr) !important;grid-template-rows:auto !important}`,
    `.page-preview .pb-collage>*{grid-column:auto !important;grid-row:auto !important}`,
    // Header: hide nav links on narrow screens (prevents overflow / wrapping)
    `.page-preview .pb-header-nav{display:none !important}`,
    `}`,
    // ── Tablet 768–1023px ─────────────────────────────────────────────────────
    `@media(min-width:768px) and (max-width:1023px){`,
    // Collapse 3–4 column grids to 2 columns
    `.page-preview .pb-grid-ncol{grid-template-columns:repeat(2,1fr) !important}`,
    `}`,
  ].join("\n");
}

// --- Google Font Loader -------------------------------------------------------

const SYSTEM_FONT_KEYWORDS = ["system-ui", "sans-serif", "serif", "monospace"];

export function loadGoogleFont(fontFamily: string): void {
  const fontNames = fontFamily
    .split(",")
    .map((f) => f.replace(/['"]/g, "").trim())
    .filter((f) => f && !SYSTEM_FONT_KEYWORDS.some((kw) => f.includes(kw)));

  if (fontNames.length === 0) return;

  const fontQuery = fontNames
    .map((name) => `family=${name.replace(/\s+/g, "+")}:wght@300;400;500;600;700;800;900`)
    .join("&");
  const importUrl = `https://fonts.googleapis.com/css2?${fontQuery}&display=swap`;

  const injectInto = (doc: Document) => {
    if (!doc.head) return;
    if (doc.querySelector(`link[href="${importUrl}"]`)) return;
    const link = doc.createElement("link");
    link.rel = "stylesheet";
    link.href = importUrl;
    doc.head.appendChild(link);
  };

  injectInto(document);

  // Also inject into Puck's preview iframe so fonts are available inside the
  // canvas (blank-origin iframes don't share the outer document's font cache).
  const iframe = document.querySelector(
    "iframe#preview-frame",
  ) as HTMLIFrameElement | null;
  if (iframe?.contentDocument) {
    injectInto(iframe.contentDocument);
  }
}

// --- Deep Clone with New IDs --------------------------------------------------

/**
 * Recursively deep-clones a value, assigning a fresh UUID to every `id` field.
 * Safe for nested Puck block structures.
 */
export function deepCloneWithIds<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(deepCloneWithIds) as unknown as T;
  }
  if (obj && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const key in obj as Record<string, unknown>) {
      result[key] =
        key === "id"
          ? crypto.randomUUID()
          : deepCloneWithIds((obj as Record<string, unknown>)[key]);
    }
    return result as T;
  }
  return obj;
}

// --- Collect Saved Block IDs --------------------------------------------------
export function collectSavedBlockIds(items: BlockItem[]): void {
  items.forEach((item) => {
    if (item?.id) savedBlockItemIds.add(item.id);

    const asAny = item as Record<string, unknown>;
    if (Array.isArray(asAny.children))
      collectSavedBlockIds(asAny.children as BlockItem[]);
    if (asAny.zones && typeof asAny.zones === "object") {
      Object.values(asAny.zones).forEach((zone) =>
        collectSavedBlockIds(zone as BlockItem[]),
      );
    }
  });
}

// --- Global Block Components Factory -----------------------------------------

export function createGlobalBlockComponents(
  blocks: import("./types").GlobalBlock[],
  puckConfig: typeof config,
): Record<string, unknown> {
  return Object.fromEntries(
    blocks.map((block) => {
      const safeName =
        block.name?.trim() || `Global Block ${block.id.slice(-5)}`;

      // Use previewConfig (minimal root: no header/footer chrome) so that
      // slot-based blocks (DoubleColumn, GridBlock, Accordian) render their
      // inner content correctly via Puck's Render engine.
      const renderData = {
        content: block.content ?? [],
        root: { props: { title: "" } } as any,
        zones: block.zones ?? {},
      };

      return [
        `GlobalBlock_${block.id}`,
        {
          label: safeName,
          category: "global",
          fields: {},
          defaultProps: {
            globalBlockId: block.id,
            _name: safeName,
          },
          render: (_props: any) => (
            <Render config={previewConfig} data={renderData} />
          ),
        },
      ];
    }),
  );
}

// --- Saved Block Components Factory ------------------------------------------

export function createSavedBlockComponents(
  blocks: SavedBlock[],
  puckConfig: typeof config,
): Record<string, unknown> {
  return Object.fromEntries(
    blocks.map((block) => {
      const rootItem = block.content?.[0];
      const originalConfig = rootItem?.type
        ? (puckConfig.components as any)[rootItem.type]
        : null;

      return [
        `SavedBlock_${block.name}`,
        {
          label: block.name,
          fields: originalConfig?.fields || {},
          defaultProps: rootItem?.props || {},
          render: (props: any) => {
            return (
              <>
                {(block.content ?? []).map((item, index) => {
                  const Comp = (
                    puckConfig.components as unknown as Record<
                      string,
                      { render: React.ComponentType<Record<string, unknown>> }
                    >
                  )[item.type]?.render;

                  // Apply dynamic props from the property panel to the root item
                  const itemProps =
                    index === 0 ? { ...item.props, ...props } : item.props;
                  return Comp ? <Comp key={item.id} {...itemProps} /> : null;
                })}
              </>
            );
          },
        },
      ];
    }),
  );
}



