/**
 * puck-renderer.ts
 *
 * Converts PuckData (the JSON structure saved by the page builder) into a
 * plain HTML string that can be written to a Shopify page's body field.
 *
 * Every Shopify theme template for pages calls {{ page.content }} which
 * outputs the body HTML, so no theme modification is needed.
 *
 * Pure HTML-string builder — no server-only deps. Imported by both server
 * routes (to write to Shopify) and the editor (to estimate size live).
 */

/** Shopify's page body limit. Hit this and pageUpdate returns "Content is too big". */
export const SHOPIFY_PAGE_BODY_LIMIT = 512 * 1024;

import type { PuckData } from "./page-schema";
import type {
  GlobalSettings,
  HeaderSettings,
  FooterSettings,
  NavLink,
} from "./settings.defaults";
import { DEFAULT_GLOBAL_SETTINGS } from "./settings.defaults";

const SYSTEM_FONT_KEYWORDS = [
  "system-ui", "sans-serif", "serif", "monospace", "inherit", "initial",
  "-apple-system", "blinkmacsystemfont",
];

/**
 * Build a Google Fonts @import for any non-system font in the given stacks.
 * Pure + client-safe (no server deps) so both the storefront route and the
 * in-app preview (browser-built) can call it. Returns "" if no web fonts.
 */
export function buildGoogleFontsImport(fontFamilies: string[]): string {
  const names = new Set<string>();
  for (const stack of fontFamilies) {
    for (const part of stack.split(",")) {
      const name = part.replace(/['"]/g, "").trim();
      if (name && !SYSTEM_FONT_KEYWORDS.some((kw) => name.toLowerCase().includes(kw))) {
        names.add(name);
      }
    }
  }
  if (names.size === 0) return "";
  const query = [...names]
    .map((n) => `family=${n.replace(/\s+/g, "+")}:wght@300;400;500;600;700;800;900`)
    .join("&");
  return `@import url('https://fonts.googleapis.com/css2?${query}&display=swap');\n`;
}

/**
 * Walk a PuckData tree and collect every per-block font-family value so the
 * page's Google Fonts @import covers block-level font choices, not just the
 * global theme fonts. Any prop whose key ends in "fontFamily" (case-insensitive)
 * and whose value is a non-"inherit" string is collected.
 *
 * Pure + client-safe. Callers merge the result with the global font stacks
 * before passing to buildGoogleFontsImport().
 */
export function collectBlockFonts(data: unknown): string[] {
  const found = new Set<string>();
  const visit = (node: unknown): void => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }
    for (const [key, val] of Object.entries(node as Record<string, unknown>)) {
      if (
        typeof val === "string" &&
        /fontfamily$/i.test(key) &&
        val &&
        val !== "inherit"
      ) {
        found.add(val);
      } else if (val && typeof val === "object") {
        visit(val);
      }
    }
  };
  visit(data);
  return [...found];
}

/**
 * Emit the `:root { --token: value }` block that the block markup references
 * via var(--primary-color) etc. This is the bridge that makes the storefront
 * AND the in-app preview match the Puck editor canvas. Pure + client-safe.
 * Variable names MUST stay in sync with _applyVarsToElement (puck-splat/utils).
 */
export function settingsToCSSString(s: GlobalSettings): string {
  const d = DEFAULT_GLOBAL_SETTINGS;
  const v = (val: string | undefined, fallback: string): string =>
    val && val !== "undefined" && val.trim() !== "" ? val : fallback;

  const buttonStyle = s.buttonStyle ?? d.buttonStyle;
  const borderRadius = v(s.borderRadius, d.borderRadius);
  const buttonBR =
    buttonStyle === "pill" ? "9999px"
    : buttonStyle === "square" ? "0px"
    : borderRadius;

  return `
:root {
  --primary-color: ${v(s.primaryColor, d.primaryColor)};
  --secondary-color: ${v(s.secondaryColor, d.secondaryColor)};
  --accent-color: ${v(s.accentColor, d.accentColor)};
  --text-color: ${v(s.textColor, d.textColor)};
  --background-color: ${v(s.backgroundColor, d.backgroundColor)};
  --font-family: ${v(s.fontFamily, d.fontFamily)};
  --heading-font: ${v(s.headingFont, d.headingFont)};
  --base-font-size: ${v(s.baseFontSize, d.baseFontSize)};
  --line-height: ${v(s.lineHeight, d.lineHeight)};
  --letter-spacing: ${v(s.letterSpacing, d.letterSpacing)};
  --h1-size: ${v(s.h1Size, d.h1Size)};
  --h2-size: ${v(s.h2Size, d.h2Size)};
  --h3-size: ${v(s.h3Size, d.h3Size)};
  --h4-size: ${v(s.h4Size, d.h4Size)};
  --h5-size: ${v(s.h5Size, d.h5Size)};
  --h6-size: ${v(s.h6Size, d.h6Size)};
  --heading-weight: ${v(s.headingWeight, d.headingWeight)};
  --heading-line-height: ${v(s.headingLineHeight, d.headingLineHeight)};
  --border-radius: ${borderRadius};
  --button-border-radius: ${buttonBR};
  --button-padding-x: ${v(s.buttonPaddingX, d.buttonPaddingX)};
  --button-padding-y: ${v(s.buttonPaddingY, d.buttonPaddingY)};
  --button-text-transform: ${s.buttonTextTransform ?? d.buttonTextTransform};
  --button-font-weight: ${v(s.buttonFontWeight, d.buttonFontWeight)};
  --button-border-width: ${v(s.buttonBorderWidth, d.buttonBorderWidth)};
  --image-border-radius: ${v(s.imageBorderRadius, d.imageBorderRadius)};
  --image-object-fit: ${s.imageObjectFit ?? d.imageObjectFit};
  --container-width: ${v(s.containerWidth, d.containerWidth)};
  --column-gap: ${v(s.columnGap, d.columnGap)};
  --row-gap: ${v(s.rowGap, d.rowGap)};
  --link-color: ${v(s.linkColor, d.linkColor)};
  --link-decoration: ${s.linkDecoration ?? d.linkDecoration};
  --card-shadow: ${v(s.cardShadow, d.cardShadow)};
}
${s.customCSS ? s.customCSS : ""}
`.trim();
}

// ─── Internal types ───────────────────────────────────────────────────────────

type Props = Record<string, unknown>;
type Block = { type: string; props: Props };
type Zones = Record<string, Block[]>;

// ─── HTML utilities ───────────────────────────────────────────────────────────

function esc(v: unknown): string {
  if (v == null) return "";
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function s(obj: Record<string, string | number | undefined | null>): string {
  return Object.entries(obj)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}:${v}`)
    .join(";");
}


function zoneContent(blockId: string, zoneName: string, zones: Zones): Block[] {
  return (zones[`${blockId}:${zoneName}`] ?? []) as Block[];
}

function renderBlocks(blocks: Block[], zones: Zones): string {
  return (blocks ?? []).map((b) => renderBlock(b, zones)).join("\n");
}

/** Convert #rrggbb or rgb()/rgba() to rgba() with the given opacity. */
function colorWithOpacity(color: string, opacity: number): string {
  if (!color) return `rgba(0,0,0,${opacity})`;
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${opacity})`;
  }
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const [r, g, b] = m[1].split(",").map((v) => v.trim());
    return `rgba(${r},${g},${b},${opacity})`;
  }
  return `rgba(0,0,0,${opacity})`;
}

/**
 * Returns CSS background-image / background-size / background-position parts
 * for the named pattern, or null for "none".
 *
 * We return the parts separately so the caller can compose them as CSS
 * multi-background layers (pattern on top, hero image/gradient below).
 * This avoids a position:absolute overlay div which breaks in Shopify themes
 * that clip or re-position the hero wrapper.
 */
function patternBackground(
  type: string,
  color: string,
): { image: string; size: string; position: string } | null {
  if (!type || type === "none") return null;
  const c1 = colorWithOpacity(color, 0.18);
  const c2 = colorWithOpacity(color, 0.12);
  const c3 = colorWithOpacity(color, 0.08);
  switch (type) {
    case "dots":
      return { image: `radial-gradient(circle,${c1} 1.5px,transparent 1.5px)`, size: "20px 20px", position: "0 0" };
    case "grid":
      return { image: `linear-gradient(${c2} 1px,transparent 1px),linear-gradient(90deg,${c2} 1px,transparent 1px)`, size: "40px 40px", position: "0 0,0 0" };
    case "waves":
      return { image: `repeating-linear-gradient(45deg,transparent,transparent 10px,${c3} 10px,${c3} 11px)`, size: "auto", position: "0 0" };
    case "geometric":
      return { image: `linear-gradient(30deg,${c3} 12%,transparent 12.5%,transparent 87%,${c3} 87.5%),linear-gradient(150deg,${c3} 12%,transparent 12.5%,transparent 87%,${c3} 87.5%),linear-gradient(60deg,${c3} 25%,transparent 25.5%,transparent 75%,${c3} 75%)`, size: "80px 140px", position: "0 0,0 0,40px 70px" };
    case "diagonal":
      return { image: `repeating-linear-gradient(45deg,transparent,transparent 8px,${c2} 8px,${c2} 9px)`, size: "auto", position: "0 0" };
    case "crosshatch":
      return { image: `repeating-linear-gradient(0deg,transparent,transparent 14px,${c2} 14px,${c2} 15px),repeating-linear-gradient(90deg,transparent,transparent 14px,${c2} 14px,${c2} 15px)`, size: "auto", position: "0 0,0 0" };
    case "zigzag":
      return { image: `linear-gradient(135deg,${c2} 25%,transparent 25%,transparent 50%,${c2} 50%,${c2} 75%,transparent 75%,transparent),linear-gradient(225deg,${c2} 25%,transparent 25%,transparent 50%,${c2} 50%,${c2} 75%,transparent 75%,transparent)`, size: "20px 20px", position: "0 0,0 0" };
    case "checkerboard":
      return { image: `linear-gradient(45deg,${c2} 25%,transparent 25%,transparent 75%,${c2} 75%),linear-gradient(45deg,${c2} 25%,transparent 25%,transparent 75%,${c2} 75%)`, size: "30px 30px", position: "0 0,15px 15px" };
    case "circles":
      return { image: `radial-gradient(circle,transparent 40%,${c1} 41%,${c1} 43%,transparent 44%)`, size: "30px 30px", position: "0 0" };
    default:
      return null;
  }
}

// ─── Component renderers ──────────────────────────────────────────────────────

function TextBlock(p: Props): string {
  return `<div style="${s({ padding: (p.padding || "48px 24px") as string, maxWidth: (p.maxWidth || "720px") as string, margin: "0 auto", textAlign: (p.textAlign || "left") as string })}">
  ${p.title ? `<h2 style="font-size:var(--h2-size, clamp(1.5rem,3vw,2.25rem));font-weight:var(--heading-weight, 700);line-height:var(--heading-line-height, 1.2);font-family:var(--heading-font);margin:0 0 16px">${esc(p.title)}</h2>` : ""}
  ${p.body ? `<div style="font-size:var(--base-font-size, 1rem);line-height:var(--line-height, 1.7);font-family:var(--font-family);color:var(--text-color);opacity:.85">${esc(p.body)}</div>` : ""}
</div>`;
}

function Text(p: Props): string {
  const m   = (p.advMargin  as any) ?? { top: 0,  right: 0, bottom: 0, left: 0 };
  const pd  = (p.advPadding as any) ?? { top: 16, right: 0, bottom: 16, left: 0 };
  const br  = (p.advBorderRadius as any) ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const bdr = (p.advBorderWidth  as any) ?? { top: 0, right: 0, bottom: 0, left: 0 };

  const bgStyle = (() => {
    if (p.advBgType === "color" && p.backgroundColor)
      return `background:${esc(p.backgroundColor as string)};`;
    if (p.advBgType === "gradient" && p.advGradientColor1 && p.advGradientColor2)
      return `background:linear-gradient(${p.advGradientAngle ?? 135}deg,${esc(p.advGradientColor1 as string)},${esc(p.advGradientColor2 as string)});`;
    return "";
  })();

  const borderStyle = (p.advBorderStyle && p.advBorderStyle !== "none")
    ? `border-style:${esc(p.advBorderStyle as string)};border-width:${bdr.top}px ${bdr.right}px ${bdr.bottom}px ${bdr.left}px;border-color:${esc((p.advBorderColor as string) || "currentColor")};`
    : "";

  // Structural class only — puck-hide-* classes are added centrally by the dispatcher.
  // The `pb-text-blk` fallback must always be present so the linkColorStyle selector matches.
  const blkClass = ["pb-text-blk", p.cssClass ? esc(p.cssClass as string) : ""].filter(Boolean).join(" ");

  const zIndex     = p.zIndex  != null ? `z-index:${p.zIndex};position:relative;` : "";
  const fontFamily = (p.fontFamily && p.fontFamily !== "inherit") ? esc(p.fontFamily as string) : "var(--font-family)";
  const fontSize   = p.fontSize ? `${p.fontSize}px` : "var(--base-font-size,1rem)";
  const fontWeight = (p.fontWeight as string) || "400";
  const fontStyle  = (p.fontStyle  as string) || "normal";
  const lineHeight = p.lineHeight != null ? String(p.lineHeight) : "var(--line-height,1.6)";
  const letterSpacing = p.letterSpacing != null ? `${p.letterSpacing}px` : "normal";
  const textDecoration = (p.textDecoration as string) || "none";
  const textTransform  = (p.textTransform  as string) || "none";
  const textColor  = esc((p.textColor as string) || "var(--text-color,#374151)");
  const alignment  = esc((p.alignment as string) || "left");
  const linkUrl    = esc((p.linkUrl as string) || "");
  const linkColor  = (p.linkColor as string) || "";

  // CSS multi-column support
  const cols = parseInt(String(p.columnCount ?? "1"), 10) || 1;
  const colCss = cols > 1
    ? `column-count:${cols};column-gap:${esc((p.columnGap as string) || "1.5rem")};`
    : "";

  const idAttr = p.cssId ? ` id="${esc(p.cssId as string)}"` : "";
  // Keep horizontal padding at least as large as the adjacent corner radii so a
  // rounded box + overflow:hidden can't clip text against the corner curve.
  // Corner map: top→top-left, right→top-right, bottom→bottom-right, left→bottom-left.
  const padLeft  = Math.max(pd.left  ?? 0, br.top    ?? 0, br.left   ?? 0);
  const padRight = Math.max(pd.right ?? 0, br.right  ?? 0, br.bottom ?? 0);
  const outerStyle = `margin:${m.top}px ${m.right}px ${m.bottom}px ${m.left}px;padding:${pd.top}px ${padRight}px ${pd.bottom}px ${padLeft}px;border-radius:${br.top}px ${br.right}px ${br.bottom}px ${br.left}px;overflow:hidden;${zIndex}${bgStyle}${borderStyle}`;
  const pStyle = `text-align:${alignment};font-size:${fontSize};font-weight:${fontWeight};font-family:${fontFamily};font-style:${fontStyle};line-height:${lineHeight};letter-spacing:${letterSpacing};text-decoration:${textDecoration};text-transform:${textTransform};color:${textColor};margin:0;white-space:pre-wrap;${colCss}`;

  const linkColorStyle = linkColor ? `<style>${idAttr ? `#${esc(p.cssId as string)}` : ".pb-text-blk"} a{color:${linkColor}!important}</style>` : "";
  const pEl = `<p style="${pStyle}">${esc((p.title as string) || "")}</p>`;
  const inner = linkUrl ? `<a href="${linkUrl}" style="text-decoration:none;color:inherit">${pEl}</a>` : pEl;

  return `${linkColorStyle}<div${idAttr} class="${blkClass}" style="${outerStyle}">${inner}</div>`;
}

function HeadingBlock(p: Props): string {
  const isCustom = String(p.level) === "custom";
  const level = isCustom ? 1 : Math.min(Math.max(Number(p.level) || 1, 1), 6);
  const tag = isCustom ? "p" : `h${level}`;
  const sizeVars = [
    "var(--h1-size, 2.5rem)", "var(--h2-size, 2rem)", "var(--h3-size, 1.75rem)",
    "var(--h4-size, 1.5rem)", "var(--h5-size, 1.25rem)", "var(--h6-size, 1rem)",
  ];
  const fs = isCustom ? `${p.fontSize || 16}px` : sizeVars[level - 1];
  const align = (p.alignment || "left") as string;
  const color = esc((p.textColor as string) || "var(--primary-color, #1a1a1a)");
  const fontFamily = (p.fontFamily && p.fontFamily !== "inherit") ? esc(p.fontFamily as string) : "var(--heading-font)";
  const fontWeight = (p.fontWeight as string) || "700";
  const fontStyle = (p.fontStyle as string) || "normal";
  const textTransform = (p.textTransform as string) || "capitalize";
  const textDecoration = (p.textDecoration as string) || "none";
  const lineHeight = p.lineHeight ? String(p.lineHeight) : "var(--heading-line-height, 1.2)";
  const letterSpacing = p.letterSpacing != null ? `${p.letterSpacing}px` : "normal";
  const subtitleColor = esc((p.subtitleColor as string) || "var(--text-color)");
  const subtitleSize = p.subtitleSize ? `${p.subtitleSize}px` : "var(--base-font-size, 1rem)";
  const m = (p.advMargin as any) ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const pd = (p.advPadding as any) ?? { top: 24, right: 24, bottom: 24, left: 24 };

  // Background: only apply when advBgType is explicitly set (not "none")
  const advBgType = (p.advBgType as string) || "none";
  let bgCss = "";
  if (advBgType === "color" && p.backgroundColor) {
    bgCss = `background:${esc(p.backgroundColor as string)};`;
  } else if (advBgType === "gradient" && p.advGradientColor1 && p.advGradientColor2) {
    bgCss = `background:linear-gradient(${p.advGradientAngle ?? 135}deg,${esc(p.advGradientColor1 as string)},${esc(p.advGradientColor2 as string)});`;
  }

  // Border
  const advBorderStyle = (p.advBorderStyle as string) || "none";
  const bw = (p.advBorderWidth as any) ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const borderCss = advBorderStyle !== "none"
    ? `border-style:${advBorderStyle};border-width:${bw.top}px ${bw.right}px ${bw.bottom}px ${bw.left}px;border-color:${esc((p.advBorderColor as string) || "currentColor")};`
    : "";
  // Border radius
  const br = (p.advBorderRadius as any) ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const radiusCss = (br.top || br.right || br.bottom || br.left)
    ? `border-radius:${br.top}px ${br.right}px ${br.bottom}px ${br.left}px;`
    : "";
  // z-index
  const zCss = p.zIndex != null ? `z-index:${p.zIndex};position:relative;` : "";

  // Hover color — scoped to a unique class so it only affects this heading
  const hoverColor = (p.hoverColor as string) || "";
  const hvId = `pb-h-${Math.random().toString(36).slice(2, 8)}`;
  const hoverCss = hoverColor ? `<style>.${hvId}:hover{color:${esc(hoverColor)}!important}</style>` : "";
  const hoverClassAttr = hoverColor ? ` class="${hvId}"` : "";
  const transitionCss = hoverColor ? "transition:color 0.2s ease;" : "";

  const headingStyle = `font-size:${fs};font-weight:${fontWeight};font-family:${fontFamily};font-style:${fontStyle};text-transform:${textTransform};text-decoration:${textDecoration};line-height:${lineHeight};letter-spacing:${letterSpacing};color:${color};margin:0;${transitionCss}`;
  const wrapStyle = `text-align:${align};${bgCss}${borderCss}${radiusCss}${zCss}margin:${m.top}px ${m.right}px ${m.bottom}px ${m.left}px;padding:${pd.top}px ${pd.right}px ${pd.bottom}px ${pd.left}px`;
  const linkUrl = esc((p.linkUrl as string) || "");
  const headingLinkTarget = esc((p.linkTarget as string) || "_blank");
  const headingHtml = linkUrl
    ? `${hoverCss}<a href="${linkUrl}" target="${headingLinkTarget}" rel="noopener noreferrer" style="text-decoration:none;color:inherit"><${tag}${hoverClassAttr} style="${headingStyle}">${esc(p.title)}</${tag}></a>`
    : `${hoverCss}<${tag}${hoverClassAttr} style="${headingStyle}">${esc(p.title)}</${tag}>`;

  // Divider rendering — uses border-top instead of height+background so Shopify
  // theme resets (height:auto!important, background resets) cannot collapse them.
  const dividerType = (p.dividerType as string) || "none";
  const dividerColor = esc((p.dividerColor as string) || (p.textColor as string) || "var(--primary-color, #1a1a1a)");
  const dividerLength = Number(p.dividerLength) || 60;
  const dividerThickness = Number(p.dividerThickness) || 3;
  const dividerIcon = esc((p.dividerIcon as string) || "⭐");
  const dividerAlign = (p.dividerAlignment as string) || "center";
  const dividerMarginCss = dividerAlign === "center" ? "margin-left:auto;margin-right:auto;" : dividerAlign === "right" ? "margin-left:auto;" : "";

  // Generate a unique class so !important overrides are scoped
  const dvId = `pb-dv-${Math.random().toString(36).slice(2, 8)}`;

  let dividerHtml = "";
  if (dividerType === "line") {
    dividerHtml = `<style>.${dvId}{display:block!important;width:${dividerLength}px!important;border:none!important;border-top:${dividerThickness}px solid ${dividerColor}!important;height:0!important;padding:0!important;margin-top:16px!important;${dividerMarginCss}border-radius:2px!important;box-sizing:content-box!important;background:none!important;}</style><div class="${dvId}"></div>`;
  } else if (dividerType === "double-line") {
    dividerHtml = `<style>.${dvId}{display:block!important;width:${dividerLength}px!important;margin-top:16px!important;${dividerMarginCss}padding:0!important;background:none!important;}.${dvId} span{display:block!important;width:100%!important;height:0!important;border:none!important;border-top:${dividerThickness}px solid ${dividerColor}!important;padding:0!important;margin:0!important;box-sizing:content-box!important;background:none!important;}</style><div class="${dvId}"><span></span><span style="margin-top:6px!important;display:block!important"></span></div>`;
  } else if (dividerType === "line-with-icon") {
    const lineMaxW = Math.round(dividerLength / 4);
    const justifyMap: Record<string, string> = { center: "center", right: "flex-end", left: "flex-start" };
    const justify = justifyMap[dividerAlign] || "flex-start";
    dividerHtml = `<style>.${dvId}{display:flex!important;align-items:center!important;gap:12px!important;justify-content:${justify}!important;margin-top:16px!important;padding:0!important;background:none!important;}.${dvId} span.pb-dv-line{display:block!important;flex:1!important;height:0!important;max-width:${lineMaxW}px!important;border:none!important;border-top:${dividerThickness}px solid ${dividerColor}!important;padding:0!important;margin:0!important;box-sizing:content-box!important;background:none!important;}</style><div class="${dvId}"><span class="pb-dv-line"></span><span style="font-size:1.5rem;white-space:nowrap;flex-shrink:0">${dividerIcon}</span><span class="pb-dv-line"></span></div>`;
  }

  return `<div style="${wrapStyle}">
  ${headingHtml}
  ${p.subtitle ? `<p style="font-size:${subtitleSize};color:${subtitleColor};margin-top:8px;margin-bottom:0">${esc(p.subtitle as string)}</p>` : ""}
  ${dividerHtml}
</div>`;
}

function Space(p: Props): string {
  // Values may be stored as "30px" (string with unit) or as a bare number.
  // Normalise to a valid CSS length; avoids "30pxpx" double-unit corruption.
  const toCssLen = (val: unknown, unit: unknown, fallback: string): string => {
    if (val == null || val === "") return fallback;
    const s = String(val);
    // If it already ends with a known unit, use it as-is.
    if (/[a-z%]+$/i.test(s)) return s;
    const u = (unit as string) || "px";
    return `${s}${u}`;
  };
  const hD = toCssLen(p.heightDesktop, p.heightDesktopUnit, `${p.size ?? 32}px`);
  const hT = toCssLen(p.heightTablet,  p.heightTabletUnit,  hD);
  const hM = toCssLen(p.heightMobile,  p.heightMobileUnit,  hT);
  const blockId = esc((p.id as string) || String(Math.random()).slice(2));
  const uid = `sp-${blockId}`;
  const classes = [uid, p.cssClass ? String(p.cssClass) : ""].filter(Boolean).join(" ");
  const idAttr = p.cssId ? ` id="${esc(String(p.cssId))}"` : "";
  const bgStyle = p.backgroundColor ? `background-color:${esc(p.backgroundColor as string)};` : "";
  // Shopify themes reset height/min-height with !important — use padding-top
  // as the primary spacing mechanism since themes almost never reset padding.
  // Also include height+min-height as belt-and-suspenders.
  const responsiveCss = `<style>.${uid}{padding-top:${hD}!important;height:0!important}@media(max-width:1023px){.${uid}{padding-top:${hT}!important}}@media(max-width:767px){.${uid}{padding-top:${hM}!important}}</style>`;
  return `${responsiveCss}<div${idAttr} class="${classes}" style="${bgStyle}display:block;padding-top:${hD};height:0;min-height:0;width:100%;box-sizing:border-box;font-size:0;line-height:0;"></div>`;
}

function Image(p: Props): string {
  const imageUrl = (p.imageUrl as string) || "";
  if (!imageUrl) return "";

  const altText      = esc((p.altText as string) || "");
  const caption      = (p.caption as string) || "";
  const linkUrl      = (p.linkUrl as string) || "";
  const wUnit        = (p.imgWidthUnit as string) || "%";
  const width        = p.imgWidth != null ? `${p.imgWidth}${wUnit}` : "100%";
  const isCustomH    = (p.heightMode as string) === "custom";
  const height       = isCustomH && p.imgHeight ? `${p.imgHeight}px` : "auto";
  const objectFit    = esc((p.objectFit as string) || "cover");
  const brPx         = `${Number(p.borderRadius) || 0}px`;
  const borderStyle  = (p.borderStyle as string) || "none";
  const borderWidth  = Number(p.borderWidth ?? 1);
  const borderColor  = esc((p.borderColor as string) || "#e5e7eb");
  const opacity      = p.opacity != null ? (p.opacity as number) / 100 : 1;
  const alignment    = (p.alignment as string) || "left";
  const hoverEffect  = (p.hoverEffect as string) || "none";
  const entranceAnim = (p.entranceAnim as string) || "none";

  const borderCss = borderStyle !== "none"
    ? `border:${borderWidth}px ${esc(borderStyle)} ${borderColor};`
    : "";

  const advMarginP   = (p.advMargin as any) ?? {};
  const advPaddingP  = (p.advPadding as any) ?? {};
  const mt = advMarginP.top ?? 0, mr = advMarginP.right ?? 0, mb = advMarginP.bottom ?? 0, ml = advMarginP.left ?? 0;
  const pt = advPaddingP.top ?? 0, pr = advPaddingP.right ?? 0, pbb = advPaddingP.bottom ?? 0, pl = advPaddingP.left ?? 0;

  const advBgCss = (p.advBgType as string) === "color" && p.advBgColor
    ? `background-color:${esc(p.advBgColor as string)};`
    : "";

  const uid = `img-${Math.random().toString(36).slice(2, 8)}`;
  let extraCss = "";
  if (hoverEffect !== "none") {
    const hf = hoverEffect === "zoom" ? "" :
      hoverEffect === "grayscale" ? "filter:grayscale(1);" :
      hoverEffect === "blur"      ? `filter:blur(${Number(p.cssBlur) || 4}px);` :
                                    `filter:brightness(${Number(p.cssBrightness) || 130}%);`;
    const ht = hoverEffect === "zoom" ? "transform:scale(1.08);" : "";
    extraCss += `#${uid} img{transition:all 0.35s ease}#${uid}:hover img{${hf}${ht}}`;
  }
  if (entranceAnim !== "none") {
    const an = entranceAnim === "fade-in" ? "pb-fadein" : entranceAnim === "slide-up" ? "pb-slideup" : "pb-zoomin";
    extraCss += `@keyframes pb-fadein{from{opacity:0}to{opacity:1}}@keyframes pb-slideup{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}@keyframes pb-zoomin{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}#${uid}{animation:${an} 0.5s ease both}`;
  }
  const styleTag = extraCss ? `<style>${extraCss}</style>` : "";

  const imgStyle = `width:100%;height:${height};${isCustomH ? `object-fit:${objectFit};` : ""}display:block;opacity:${opacity};${borderCss}`;
  const imgTag   = `<img src="${esc(imageUrl)}" alt="${altText}" loading="lazy" class="no-global-style" style="${imgStyle}">`;

  const safeLink = linkUrl && (linkUrl.startsWith("http://") || linkUrl.startsWith("https://")) ? linkUrl : "";
  const wrapped = safeLink
    ? `<a href="${esc(safeLink)}" target="_blank" rel="noopener noreferrer" style="display:block">${imgTag}</a>`
    : imgTag;

  let captionHtml = "";
  if (caption) {
    const capPos   = (p.captionPosition as string) || "below";
    const capColor = esc((p.captionColor as string) || (capPos === "overlay" ? "#fff" : "var(--text-color)"));
    const capFs    = `${Number(p.captionFontSize) || 13}px`;
    const capAlign = esc((p.captionAlign as string) || "center");
    if (capPos === "overlay") {
      const capBg = esc((p.captionBackground as string) || "rgba(0,0,0,0.5)");
      captionHtml = `<div style="position:absolute;bottom:0;left:0;right:0;background:${capBg};color:${capColor};font-size:${capFs};padding:8px 12px;text-align:${capAlign}">${esc(caption)}</div>`;
    } else {
      captionHtml = `<div style="font-size:${capFs};color:${capColor};padding:6px 0;text-align:${capAlign};font-style:italic">${esc(caption)}</div>`;
    }
  }

  const capPos     = (p.captionPosition as string) || "below";
  const ml_auto    = alignment === "center" || alignment === "right" ? "auto" : "0";
  const mr_auto    = alignment === "center" || alignment === "left"  ? "auto" : "0";
  const innerStyle = `display:block;width:${width};max-width:100%;margin-left:${ml_auto};margin-right:${mr_auto};position:relative;overflow:hidden;border-radius:${brPx}`;
  const innerHtml  = capPos === "overlay"
    ? `<div style="${innerStyle}">${wrapped}${captionHtml}</div>`
    : `<div style="${innerStyle}">${wrapped}</div>${captionHtml}`;

  return `${styleTag}<div id="${uid}" style="margin:${mt}px ${mr}px ${mb}px ${ml}px;padding:${pt}px ${pr}px ${pbb}px ${pl}px;${advBgCss}">${innerHtml}</div>`;
}


function GridBlock(_p: Props, _zones: Zones): string {
  // Replaced by renderGridBlock() — kept so the old switch entry compiles
  return "";
}

function DoubleColumn(p: Props, zones: Zones): string {
  const id = (p.id as string) || "";
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
  <div>${renderBlocks(zoneContent(id, "leftColumn", zones), zones)}</div>
  <div>${renderBlocks(zoneContent(id, "rightColumn", zones), zones)}</div>
</div>`;
}

function Accordian(p: Props, zones: Zones): string {
  const id = (p.id as string) || "";
  const details = renderBlocks(zoneContent(id, "details", zones), zones);
  const bg = (p.backgroundColor || "#fff") as string;
  const textColor = (p.textColor || "var(--text-color, #1a1a1a)") as string;
  const accent = (p.accentColor || "var(--primary-color, #0158ad)") as string;
  const pad = `${p.padding ?? 16}px`;
  const br = `${p.borderRadius ?? 8}px`;
  const border = p.accordionStyle === "shadow" || p.accordionStyle === "minimal" ? "none" : "1px solid #e5e7eb";
  const shadow = p.accordionStyle === "shadow" ? "0 2px 12px rgba(0,0,0,.07)" : "none";
  const open = !!p.defaultOpen;
  const minimal = p.accordionStyle === "minimal";

  // Pure-CSS toggle via the checkbox hack — Shopify's HTML sanitizer strips
  // `<script>` tags from page.body, so any JS-based toggle goes away on
  // publish. A hidden checkbox + label[for] + sibling selectors give us
  // open/closed behaviour with zero JS.
  const aid = `pb-acc-${Math.random().toString(36).slice(2, 10)}`;
  const borderTopOpen = minimal ? "0" : "1px";

  return `<div class="pb-accordion" style="border:${border};border-radius:${br};background:${esc(bg)};box-shadow:${shadow};overflow:hidden;margin-bottom:8px;position:relative">
  <input id="${aid}" type="checkbox" ${open ? "checked " : ""}style="position:absolute;opacity:0;pointer-events:none;width:0;height:0;margin:0">
  <label for="${aid}" style="cursor:pointer;padding:${pad};font-weight:600;color:${esc(textColor)};display:flex;align-items:center;justify-content:space-between;user-select:none;margin:0">
    <span>${esc(p.summaryText || "More Details")}</span>
    <span class="${aid}-i" style="font-size:18px;color:${esc(accent)};transition:transform .2s ease;display:inline-block;line-height:1">›</span>
  </label>
  <div class="${aid}-c" style="max-height:0;overflow:hidden;padding:0 ${pad};border-top:0 solid #e5e7eb;transition:max-height .3s ease,padding .25s ease,border-top-width .25s ease">${details}</div>
  <style>
  #${aid}:checked~.${aid}-c{max-height:9999px;padding:${pad};border-top-width:${borderTopOpen}}
  #${aid}:checked~label .${aid}-i{transform:rotate(90deg)}
  </style>
</div>`;
}

function bodyToHtml(text: string, fontWeight?: string, color?: string): string {
  // The old default body was "<p></p>"; users often typed plain text right
  // after it without deleting it (e.g. "<p></p>Lorem..."), which made the
  // HTML check below match and pass the whole thing through raw — collapsing
  // line breaks and, when the body is just "<p></p>", showing nothing at all.
  // Strip leading/trailing empty paragraph tags so the real text is detected.
  const cleaned = text
    .replace(/^(?:\s*<p>\s*<\/p>\s*)+/i, "")
    .replace(/(?:\s*<p>\s*<\/p>\s*)+$/i, "")
    .trim();
  // If real HTML tags remain, pass it through directly
  if (/<[a-z][\s\S]*>/i.test(cleaned)) return cleaned;
  // Weight + color repeated on the <p> so a theme/global `p` rule (e.g. the
  // Shopify theme's own `p { color }`) can't override them — otherwise the body
  // inherits from the wrapper div and the theme's p-color wins, hiding the text.
  const fw = fontWeight ? `font-weight:${fontWeight};` : "";
  const co = color ? `color:${color};` : "";
  // Otherwise treat as plain text
  return cleaned
    .split(/\n\n+/)
    .map(para => {
      const lines = para.split(/\n/).map(esc).join("<br>");
      return `<p style="margin:0 0 1em;${fw}${co}">${lines}</p>`;
    })
    .join("");
}

function Article(p: Props): string {
  const m  = (p.advMargin  as any) ?? { top: 0,  right: 0,  bottom: 0, left: 0  };
  const pd = (p.advPadding as any) ?? { top: 48, right: 24, bottom: 48, left: 24 };

  // ── Title typography ──
  const titleColor   = esc((p.titleColor as string) || "var(--primary-color, #1a1a1a)");
  const titleFont    = (p.titleFontFamily && p.titleFontFamily !== "inherit") ? esc(p.titleFontFamily as string) : "var(--heading-font)";
  const titleFS      = `${Number(p.titleFontSize) || 32}px`;
  const titleFW      = String(p.titleFontWeight ?? "700");
  const titleLH      = p.titleLineHeight != null ? String(p.titleLineHeight) : "1.3";
  const titleAlign   = esc((p.titleAlign as string) || "left");

  // ── Body typography ──
  const bodyColor    = esc((p.bodyColor as string) || "var(--text-color, #374151)");
  const bodyFont     = (p.bodyFontFamily && p.bodyFontFamily !== "inherit") ? esc(p.bodyFontFamily as string) : "var(--font-family)";
  const bodyFS       = `${Number(p.bodyFontSize) || 16}px`;
  const bodyFW       = String(p.bodyFontWeight ?? "400");
  const bodyLH       = p.bodyLineHeight != null ? String(p.bodyLineHeight) : "1.75";

  // ── Author typography ──
  const authorColor  = esc((p.authorColor as string) || "var(--text-color, #374151)");
  const authorFont   = (p.authorFontFamily && p.authorFontFamily !== "inherit") ? esc(p.authorFontFamily as string) : "var(--font-family)";
  const authorFS     = `${Number(p.authorFontSize) || 14}px`;
  const authorFW     = String(p.authorFontWeight ?? "400");

  // ── Date typography ──
  const dateColor    = esc((p.dateColor as string) || "var(--text-color, #374151)");
  const dateFont     = (p.dateFontFamily && p.dateFontFamily !== "inherit") ? esc(p.dateFontFamily as string) : "var(--font-family)";
  const dateFS       = `${Number(p.dateFontSize) || 13}px`;
  const dateFW       = String(p.dateFontWeight ?? "400");

  const cls          = "pb-article";
  const outerStyle   = `margin:${m.top}px ${m.right}px ${m.bottom}px ${m.left}px;padding:${pd.top}px ${pd.right}px ${pd.bottom}px ${pd.left}px`;

  // ── Featured image ──
  const imgH        = Number(p.imageHeight ?? 400);
  const imgBr       = `${p.imageBorderRadius ?? 8}px`;
  const imgFit      = esc((p.imageFit as string) || "cover");
  const imgMb       = Number(p.imageMarginBottom ?? 24);
  const imgSrc      = (p.featuredImage as string) || "";
  const imgPos      = (p.imagePosition as string) || "top";
  const isHoriz     = imgPos === "left" || imgPos === "right";
  let imgHtml = "";
  if (imgSrc) {
    const is = `width:100%;height:${imgH}px;object-fit:${imgFit};display:block;border-radius:${imgBr}`;
    // Radius + overflow:hidden go on the wrapper so object-fit:cover is clipped
    // to the rounded corners (a radius on the <img> alone bleeds with cover).
    imgHtml = `<div style="flex-shrink:0;min-width:0;border-radius:${imgBr};overflow:hidden;${isHoriz ? `width:44%;` : `width:100%;margin-bottom:${imgMb}px`}"><img src="${esc(imgSrc)}" alt="${esc(String(p.articleTitle || ""))}" loading="lazy" class="no-global-style" style="${is}"></div>`;
  }

  const showAuthor = p.showAuthor !== false;
  const showDate   = p.showDate   !== false;
  const metaVisible = (showAuthor && !!p.author) || (showDate && !!p.publishDate);
  const metaJustify = titleAlign === "center" ? "center" : titleAlign === "right" ? "flex-end" : "flex-start";

  // Format publish date the same way the editor does (long, localized).
  let dateStr = String(p.publishDate || "");
  if (dateStr) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      dateStr = parsed.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    }
  }

  const articleInner = `
    ${p.articleTitle ? `<h1 style="font-size:${titleFS};font-weight:${titleFW};font-family:${titleFont};color:${titleColor};text-align:${titleAlign};line-height:${titleLH};margin:0 0 10px">${esc(String(p.articleTitle))}</h1>` : ""}
    ${metaVisible ? `<div style="display:flex;gap:12px;margin-bottom:28px;flex-wrap:wrap;justify-content:${metaJustify}">
      ${showAuthor && p.author ? `<span style="font-size:${authorFS};font-weight:${authorFW};font-family:${authorFont};color:${authorColor}">By <strong>${esc(String(p.author))}</strong></span>` : ""}
      ${showDate && dateStr ? `<span style="font-size:${dateFS};font-weight:${dateFW};font-family:${dateFont};color:${dateColor}">${esc(dateStr)}</span>` : ""}
    </div>` : ""}
    <div style="font-size:${bodyFS};line-height:${bodyLH};color:${bodyColor};font-weight:${bodyFW};font-family:${bodyFont}">${p.body ? bodyToHtml(String(p.body), bodyFW, bodyColor) : ""}</div>`;

  const innerHtml = isHoriz
    ? `<div style="display:flex;flex-direction:${imgPos === "left" ? "row" : "row-reverse"};gap:48px;align-items:flex-start">${imgHtml}<div style="flex:1;min-width:0">${articleInner}</div></div>`
    : `${imgHtml}<div style="flex:1;min-width:0">${articleInner}</div>`;

  return `<div class="${cls}" style="${outerStyle}"><div style="max-width:860px;margin:0 auto">${innerHtml}</div></div>`;
}


function CardBlock(p: Props): string {
  const img = (p.image as Record<string, unknown>) ?? {};
  const isBg = img.mode === "bg";
  const url = (img.url as string) || "";
  const accent = (p.accentColor || "var(--primary-color, #0158ad)") as string;
  const textColor = (p.textColor || "var(--text-color, #1a1a1a)") as string;
  const bg = (p.backgroundColor || "#fff") as string;
  const br = `${p.borderRadius ?? 8}px`;
  const pad = `${p.padding ?? 16}px`;
  const width = `${p.cardWidth ?? 300}px`;
  const imgH = `${(img.imageHeight as number) ?? 200}px`;
  const align = (p.alignment || "left") as string;
  const border = p.cardStyle === "outlined" ? "1px solid #e5e7eb" : "none";
  const shadow = p.cardStyle === "shadow" ? "0 4px 20px rgba(0,0,0,.08)" : "none";

  if (isBg && url) {
    return `<div style="background-image:url(${esc(url)});background-size:cover;background-position:center;min-height:200px;display:flex;flex-direction:column;justify-content:flex-end;border-radius:${br};overflow:hidden;text-align:${align};width:${width};max-width:100%">
  <div style="padding:${pad};background:linear-gradient(to top,rgba(0,0,0,.7),transparent)">
    <h3 style="color:#fff;margin:0 0 8px;font-size:1.25rem;font-weight:700">${esc(p.title)}</h3>
    ${p.description ? `<p style="color:rgba(255,255,255,.9);margin:0;font-size:.9rem">${esc(p.description)}</p>` : ""}
    ${p.ctaLabel && p.ctaLink ? `<a href="${esc(p.ctaLink)}" class="pb-btn" style="display:inline-block;margin-top:12px;padding:8px 20px;background:${esc(accent)};color:#fff;text-decoration:none;border-radius:var(--button-border-radius, 6px);font-weight:600;font-size:.875rem">${esc(p.ctaLabel)}</a>` : ""}
  </div>
</div>`;
  }

  return `<div style="padding:${pad};background:${esc(bg)};border:${border};border-radius:${br};width:${width};max-width:100%;box-shadow:${shadow};display:flex;flex-direction:column;text-align:${align};overflow:hidden;position:relative">
  ${p.badge ? `<div style="position:absolute;top:12px;right:12px;background:${esc(accent)};color:#fff;font-size:11px;font-weight:700;padding:2px 10px;border-radius:99px">${esc(p.badge)}</div>` : ""}
  ${url ? `<img src="${esc(url)}" alt="" style="width:100%;height:${imgH};object-fit:cover;display:block;margin-bottom:12px">` : ""}
  <h3 style="color:${esc(textColor)};margin:0 0 8px;font-size:1.125rem;font-weight:700;font-family:var(--heading-font)">${esc(p.title)}</h3>
  ${p.description ? `<p style="color:${esc(textColor)};opacity:.8;margin:0 0 12px;font-size:.875rem;line-height:1.5;flex:1">${esc(p.description)}</p>` : ""}
  ${p.ctaLabel && p.ctaLink ? `<a href="${esc(p.ctaLink)}" class="pb-btn" style="display:inline-block;padding:8px 20px;background:${esc(accent)};color:#fff;text-decoration:none;border-radius:var(--button-border-radius, 6px);font-weight:600;font-size:.875rem;align-self:flex-start">${esc(p.ctaLabel)}</a>` : ""}
</div>`;
}

function Button(p: Props): string {
  const label        = esc((p.label as string) || (p.text as string) || "Click Me");
  const linkUrl      = esc((p.linkUrl as string) || "");
  const linkTarget   = (p.linkTarget as string) || "_blank";
  const iconType     = (p.iconType as string) || "none";
  const icon         = (p.icon as string) || "";
  const iconPos      = (p.iconPosition as string) || "before";
  const iconSize     = Number(p.iconSize ?? 20);
  const iconWidth    = Number(p.iconWidth ?? 20);
  const iconHeight   = Number(p.iconHeight ?? 20);
  const iconColor    = esc((p.iconColor as string) || "");
  const iconHoverColor = esc((p.iconHoverColor as string) || "");
  const iconGap      = Number(p.iconGap ?? 8);
  const fullWidth    = !!p.fullWidth;
  const alignment    = (p.alignment as string) || "left";
  const fontFamily   = (p.fontFamily as string) || "var(--font-family)";
  const fontSize     = p.fontSize ? `${p.fontSize}px` : "";
  const fontWeight   = (p.fontWeight as string) || "400";
  const textTransform = (p.textTransform as string) || "capitalize";
  const letterSpacing = p.letterSpacing != null ? `${p.letterSpacing}px` : "";
  const textColor    = esc((p.textColor as string) || "#ffffff");
  const bgColor      = esc((p.bgColor as string) || "var(--primary-color, #0158ad)");
  const borderStyle  = (p.borderStyle as string) || "none";
  const borderWidth  = Number(p.borderWidth ?? 2);
  const borderColor  = esc((p.borderColor as string) || "transparent");
  // borderRadius can be numeric (px) or legacy string; 0 means sharp corners
  const borderRadiusRaw = p.borderRadius;
  const borderRadius = typeof borderRadiusRaw === "number" ? `${borderRadiusRaw}px` : (borderRadiusRaw != null && borderRadiusRaw !== "" ? esc(borderRadiusRaw as string) : "6px");
  const hoverTextColor = esc((p.hoverTextColor as string) || "");
  const hoverBgColor   = esc((p.hoverBgColor as string) || "");
  const hoverBorderColor = esc((p.hoverBorderColor as string) || "");
  const hoverAnimation = (p.hoverAnimation as string) || "none";
  const entranceAnimation = (p.entranceAnimation as string) || "none";
  const animDuration  = Number(p.animDuration ?? 600);
  const animDelay     = Number(p.animDelay ?? 0);
  const sizePreset   = (p.sizePreset as string) || "medium";
  const customPad    = (p.customPadding as any) ?? {};
  const advMargin    = (p.advMargin as any) ?? {};
  const advBgType    = (p.advBgType as string) || "none";
  const advBgColor   = esc((p.advBgColor as string) || "");
  const cssId        = esc((p.cssId as string) || "");
  const cssClass     = esc((p.cssClass as string) || "");
  const customCss    = (p.customCss as string) || "";
  const zIndex       = p.zIndex != null ? String(p.zIndex) : "";

  const sizeMap: Record<string, string> = {
    small:  "padding:8px 16px",
    medium: "padding:12px 24px",
    large:  "padding:16px 32px",
    custom: `padding:${customPad.top ?? 12}px ${customPad.right ?? 24}px ${customPad.bottom ?? 12}px ${customPad.left ?? 24}px`,
  };
  const padStyle = sizeMap[sizePreset] ?? sizeMap.medium;
  const borderCss = borderStyle !== "none" ? `border:${borderWidth}px ${borderStyle} ${borderColor};` : "border:none;";
  const uid = cssId || `btn-b${String(p.id ?? "").slice(-6)}`;

  const hoverCss = (hoverTextColor || hoverBgColor || hoverBorderColor || hoverAnimation !== "none" || (iconType === "svg" && iconHoverColor)) ? `
.pb-btn-${uid}{transition:color 0.2s ease,background 0.2s ease,border-color 0.2s ease,transform 0.2s ease,opacity 0.2s ease,box-shadow 0.2s ease!important}
.pb-btn-${uid}:hover{${hoverTextColor ? `color:${hoverTextColor}!important;` : ""}${hoverBgColor ? `background:${hoverBgColor}!important;` : ""}${hoverBorderColor ? `border-color:${hoverBorderColor}!important;` : ""}${hoverAnimation === "grow" ? "transform:scale(1.05)!important;" : hoverAnimation === "shrink" ? "transform:scale(0.96)!important;" : hoverAnimation === "pulse" ? "animation:pb-pulse 0.6s ease!important;transition:color 0.2s ease,background 0.2s ease,border-color 0.2s ease!important;" : ""}}
${iconType === "svg" && iconHoverColor ? `.pb-btn-${uid}:hover svg{color:${iconHoverColor}!important;fill:${iconHoverColor}!important}` : ""}
@keyframes pb-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}` : "";

  const entranceFromMap: Record<string, string> = {
    fadeIn:       "opacity:0",
    fadeInUp:     "opacity:0;transform:translateY(20px)",
    fadeInDown:   "opacity:0;transform:translateY(-20px)",
    slideInLeft:  "opacity:0;transform:translateX(-30px)",
    slideInRight: "opacity:0;transform:translateX(30px)",
    zoomIn:       "opacity:0;transform:scale(0.85)",
    bounce:       "opacity:0;transform:translateY(-20px)",
  };
  const animCss = (entranceAnimation !== "none" && entranceFromMap[entranceAnimation]) ? `
@keyframes pb-btn-ea-${uid}{from{${entranceFromMap[entranceAnimation]}}to{opacity:1;transform:none}}
.pb-btn-wrap-${uid}{animation:pb-btn-ea-${uid} ${animDuration}ms ease ${animDelay}ms both}` : "";

  const btnStyle = [
    `display:${fullWidth ? "flex" : "inline-flex"}`,
    fullWidth ? "width:100%" : "",
    "align-items:center",
    "justify-content:center",
    icon ? `gap:${iconGap}px` : "",
    padStyle,
    `font-family:${fontFamily}`,
    fontSize ? `font-size:${fontSize}` : "",
    `font-weight:${fontWeight}`,
    `text-transform:${textTransform}`,
    letterSpacing ? `letter-spacing:${letterSpacing}` : "",
    `color:${textColor}`,
    `background:${bgColor}`,
    borderCss,
    `border-radius:${borderRadius}`,
    "cursor:pointer",
    "text-decoration:none",
  ].filter(Boolean).join(";");

  const svgColorStyle = iconColor ? `color:${iconColor};fill:${iconColor}` : "color:currentColor;fill:currentColor";
  const iconHtml = icon
    ? iconType === "image"
      ? `<img src="${esc(icon)}" alt="" style="width:${iconWidth}px;height:${iconHeight}px;object-fit:contain;display:block;flex-shrink:0">`
      : iconType === "emoji"
        ? `<span style="font-size:${iconSize}px;line-height:1">${esc(icon)}</span>`
        : icon.trimStart().startsWith("<svg")
          ? `<span style="display:inline-flex;align-items:center;width:${iconWidth}px;height:${iconHeight}px;flex-shrink:0;${svgColorStyle}">${icon.replace(/<svg\b/, `<svg style="width:${iconWidth}px;height:${iconHeight}px;${svgColorStyle}"`)}</span>`
          : `<svg width="${iconWidth}" height="${iconHeight}" viewBox="0 0 24 24" style="${svgColorStyle}">${icon}</svg>`
    : "";
  const iconBefore = iconHtml && iconPos === "before" ? iconHtml : "";
  const iconAfter  = iconHtml && iconPos === "after"  ? iconHtml : "";
  const inner = `${iconBefore}${label}${iconAfter}`;

  const btnEl = `<button class="pb-btn pb-btn-${uid}" style="${btnStyle}">${inner}</button>`;
  const linked = linkUrl
    ? `<a href="${linkUrl}" target="${esc(linkTarget)}" rel="noopener noreferrer" style="text-decoration:none;${fullWidth ? "display:block" : "display:inline-block"}">${btnEl}</a>`
    : btnEl;
  const wrapped = `<div class="pb-btn-wrap-${uid}" style="${fullWidth ? "display:block" : "display:inline-block"}">${linked}</div>`;

  const mt = advMargin.top ?? 0, mr = advMargin.right ?? 0, mb = advMargin.bottom ?? 0, ml = advMargin.left ?? 0;
  const wrapBg = !fullWidth && advBgType === "color" && advBgColor ? `background-color:${advBgColor};` : "";
  const wrapStyle = [
    !fullWidth ? `text-align:${alignment}` : "",
    `margin:${mt}px ${mr}px ${mb}px ${ml}px`,
    zIndex ? `z-index:${zIndex}` : "",
    wrapBg,
  ].filter(Boolean).join(";");

  const styleTag = (hoverCss || animCss || customCss) ? `<style>${hoverCss}${animCss}${customCss ? `.pb-btn-${uid}{${customCss}}` : ""}</style>` : "";
  return `${styleTag}<div${cssId ? ` id="${cssId}"` : ""}${cssClass ? ` class="${cssClass}"` : ""} style="${wrapStyle}">${wrapped}</div>`;
}

function MarqueeBar(p: Props): string {
  const bg = (p.backgroundColor || "#000") as string;
  const textColor = (p.textColor || "#fff") as string;
  const fontSize = p.fontSize ? `${p.fontSize}px` : "14px";
  const padVal = Number(p.padding ?? 10);
  const speed = Number(p.speed) || 20;
  const dir = p.direction === "right" ? "mqRight" : "mqLeft";
  const repeat = Number(p.repeat) || 10;
  const itemGap = Number(p.itemGap ?? 40);
  const text = (p.text as string) || "";
  const fontWeight = p.fontWeight ? String(p.fontWeight) : "500";
  const textTransform = p.textTransform ? String(p.textTransform) : "none";
  const pauseOnHover = p.pauseOnHover !== false;
  const classAttr = ["pb-marquee", pauseOnHover ? "pb-marquee-pause" : ""].filter(Boolean).join(" ");
  const items = Array(repeat).fill(`<span style="margin-right:${itemGap}px">${esc(text)}</span>`).join("");
  return `<div class="${classAttr}" style="overflow:hidden;white-space:nowrap;background:${esc(bg)};color:${esc(textColor)};font-size:${fontSize};font-weight:${fontWeight};text-transform:${textTransform};padding:${padVal}px 0">
  <div class="pb-marquee-track" style="display:inline-block;animation:${dir} ${speed}s linear infinite">${items}</div>
  <style>@keyframes mqLeft{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}@keyframes mqRight{0%{transform:translateX(-50%)}100%{transform:translateX(0)}}.pb-marquee-pause:hover .pb-marquee-track{animation-play-state:paused!important}</style>
</div>`;
}

function PhotoCollage(p: Props): string {
  const images = (p.images as Array<{ url?: string; alt?: string }> | undefined) ?? [];
  const valid = images.filter((img) => img.url);
  const gap = Number(p.gap) || 8;
  const gapPx = `${gap}px`;
  const brVal = Number(p.borderRadius ?? 8);
  const br = `${brVal}px`;
  const fit = (p.objectFit as string) || "cover";
  const layout = (p.layout as string) || "grid";
  const aspectRatio = (p.aspectRatio as string) || "1:1";
  const hoverEffect = (p.hoverEffect as string) || "none";
  const boxShadow = !!p.boxShadow;
  const shadowStrength = (p.shadowStrength as string) || "subtle";
  const shadow = !boxShadow
    ? "none"
    : shadowStrength === "strong"
      ? "0 8px 24px rgba(0,0,0,0.3)"
      : shadowStrength === "medium"
        ? "0 4px 12px rgba(0,0,0,0.2)"
        : "0 2px 6px rgba(0,0,0,0.12)";

  const arMap: Record<string, string> = { "1:1": "1/1", "4:3": "4/3", "16:9": "16/9", "3:2": "3/2" };
  const ar = arMap[aspectRatio] ?? "1/1";

  const hoverStyle =
    hoverEffect === "zoom"
      ? `<style>.pb-collage-item:hover img { transform: scale(1.05); }</style>`
      : hoverEffect === "darken"
        ? `<style>.pb-collage-item:hover img { filter: brightness(0.75); }</style>`
        : "";

  const imgTag = (img: { url?: string; alt?: string }, i: number, fitVal: string = fit) =>
    `<img src="${esc(img.url ?? "")}" alt="${esc(img.alt || `Photo ${i + 1}`)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${esc(fitVal)};display:block;transition:transform 0.3s ease,filter 0.3s ease">`;

  const wrapCell = (content: string, extraStyle: string) =>
    `<div class="pb-collage-item" style="overflow:hidden;border-radius:${br}!important;box-shadow:${shadow};position:relative;${extraStyle}">${content}</div>`;

  const wrapClass = "pb-collage-wrap";

  if (!valid.length) {
    return `${hoverStyle}<div class="${wrapClass}" style="background:#f3f4f6;display:flex;align-items:center;justify-content:center;min-height:200px;border-radius:${br};color:#6b7280;font-size:14px">Add photos in the Content tab</div>`;
  }

  // ── GRID: uniform cells forced to the chosen aspect ratio ──
  if (layout === "grid") {
    const cells = valid.map((img, i) =>
      wrapCell(imgTag(img, i), `aspect-ratio:${ar};`)
    ).join("");
    return `${hoverStyle}<div class="${wrapClass}" style="display:grid;grid-template-columns:repeat(3,1fr);gap:${gapPx}">${cells}</div>`;
  }

  // ── BRICK: staggered brick wall — EVERY tile is identical in width & height.
  //    Full rows hold N bricks; offset rows hold N-1 bricks flanked by a half
  //    brick at each end, so every row is exactly the container width (no
  //    overflow) and the seams stagger like real brickwork. Aspect ratio
  //    controls tile proportions. ──
  if (layout === "brick") {
    const FULL = 3;     // bricks in a full row
    const brickW = `calc((100% - ${(FULL - 1)} * ${gapPx}) / ${FULL})`;
    // Flattened (non-nested) calc so the flex-basis parses reliably everywhere —
    // a nested calc here can collapse to 0 and left-align the offset row.
    const halfW = `calc((100% - ${2 * FULL - 1} * ${gapPx}) / ${2 * FULL})`;
    // Split the images into alternating full (FULL) / offset (FULL-1) rows.
    const rows: { items: typeof valid; offset: boolean }[] = [];
    let idx = 0;
    let rowNo = 0;
    while (idx < valid.length) {
      const offset = rowNo % 2 === 1;
      const count = offset ? FULL - 1 : FULL;
      rows.push({ items: valid.slice(idx, idx + count), offset });
      idx += count;
      rowNo += 1;
    }
    let imgIdx = 0;
    const rowsHtml = rows.map(({ items, offset }) => {
      const edge = offset ? `<div style="flex:0 0 ${halfW}"></div>` : "";
      const tiles = items.map((img) =>
        wrapCell(imgTag(img, imgIdx++, "cover"), `flex:0 0 ${brickW};aspect-ratio:${ar};`)
      ).join("");
      return `<div style="display:flex;gap:${gapPx}">${edge}${tiles}${edge}</div>`;
    }).join("");
    return `${hoverStyle}<div class="${wrapClass}" style="display:flex;flex-direction:column;gap:${gapPx};overflow:hidden">${rowsHtml}</div>`;
  }

  // ── CAROUSEL: horizontal scrolling strip; each photo a fixed-width slide ──
  if (layout === "carousel") {
    const cells = valid.map((img, i) =>
      wrapCell(imgTag(img, i), `flex:0 0 auto;width:min(70%,360px);aspect-ratio:${ar};scroll-snap-align:start;`)
    ).join("");
    return `${hoverStyle}<div class="${wrapClass}" style="display:flex;gap:${gapPx};overflow-x:auto;padding-bottom:6px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch">${cells}</div>`;
  }

  // ── MIXED SIZES (default): first image spans 2 cols + 2 rows ──
  const cells = valid.map((img, i) => {
    const spanStyle = i === 0 ? `grid-column:span 2;grid-row:span 2;aspect-ratio:${ar};` : `aspect-ratio:${ar};`;
    return wrapCell(imgTag(img, i), spanStyle);
  }).join("");
  return `${hoverStyle}<div class="${wrapClass}" style="display:grid;grid-template-columns:repeat(3,1fr);gap:${gapPx}">${cells}</div>`;
}

// ─── Featured Product ────────────────────────────────────────────────────────
//
// Renders a snapshot of the picked product as static HTML, tagged with
// data-pb-product-handle. On the live storefront, pb-widget-loader.js fetches
// /products/{handle}.js and refreshes the title/price/image/availability inside
// this container, so the displayed data is always current. The snapshot is the
// fallback for the pre-hydration paint and any non-storefront context.
function FeaturedProduct(p: Props): string {
  const product = (p.product as Record<string, unknown> | null | undefined) ?? null;
  const handle  = product ? String(product.handle ?? "") : "";
  if (!product || (!handle && !product.title)) return "";

  const title        = esc((product.title       as string) || "");
  const image        = esc((product.image       as string) || "");
  const price        = esc((product.price       as string) || "");
  const compareAt    = esc((product.compareAtPrice as string) || "");
  const description  = esc((product.description as string) || "");
  const vendor       = esc((product.vendor      as string) || "");
  const sku          = esc((product.sku         as string) || "");
  const productUrl   = handle ? `/products/${encodeURIComponent(handle)}` : "#";

  // Display toggles
  const showImage       = p.showImage       !== false;
  const showTitle       = p.showTitle       !== false;
  const showVendor      = !!p.showVendor;
  const showPrice       = p.showPrice       !== false;
  const showCompareAt   = !!p.showCompareAt;
  const showDescription = !!p.showDescription;
  const showSku         = !!p.showSku;
  const showVariants    = !!p.showVariants;
  const variantStyle    = (p.variantStyle as string) || "dropdown";
  const showQuantity    = !!p.showQuantity;
  const showRating      = !!p.showRating;
  const ratingValue     = Number(p.ratingValue ?? 5);
  const showButton      = p.showButton !== false;
  const addToCart       = !!p.addToCart;
  const buttonLabel     = esc((p.buttonLabel as string) || (addToCart ? "Add to Cart" : "Shop Now"));

  // Badge
  const showBadge  = !!p.showBadge;
  const badgeText  = esc((p.badgeText  as string) || "Sale");
  const badgeBg    = esc((p.badgeBg   as string) || "#ef4444");
  const badgeColor = esc((p.badgeColor as string) || "#ffffff");

  // Layout
  const layout   = (p.layout as string) || "vertical";
  const isHoriz  = layout === "horizontal" || layout === "horizontal-reverse";
  const isRev    = layout === "horizontal-reverse";
  const align    = (p.align as string) || "left";
  const justify  = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
  const aspect   = (Number(p.imageAspect) || 100) / 100;
  const imageFit = esc((p.imageFit as string) || "cover");
  const radius   = Number(p.borderRadius ?? 12);
  const shadow   = !!p.showShadow;
  const divider  = !!p.showDividers;
  const dividerCss = divider ? "border-top:1px solid #e5e7eb;margin-top:4px;padding-top:8px;" : "";

  // Colors
  const cardBg        = esc((p.cardBg           as string) || "");
  const titleColor    = esc((p.titleColor        as string) || "var(--heading-color,#1a1a1a)");
  const vendorColor   = esc((p.vendorColor       as string) || "#6b7280");
  const priceColor    = esc((p.priceColor        as string) || "var(--primary-color,#0158ad)");
  const compareColor  = esc((p.compareAtColor    as string) || "#9ca3af");
  const descColor     = esc((p.descColor         as string) || "#374151");
  const skuColor      = esc((p.skuColor          as string) || "#9ca3af");
  const btnText       = esc((p.buttonTextColor   as string) || "#ffffff");
  const btnBg         = esc((p.buttonBgColor     as string) || "var(--primary-color,#0158ad)");

  // Typography
  const titleFS  = Number(p.titleFontSize)   || 20;
  const vendorFS = Number(p.vendorFontSize)  || 13;
  const priceFS  = Number(p.priceFontSize)   || 18;
  const descFS   = Number(p.descFontSize)    || 14;

  // Button style
  const btnWidth  = (p.buttonWidth as string) || "auto";
  const btnRadius = Number(p.buttonRadius ?? 8);

  const m  = (p.advMargin  as any) ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const pd = (p.advPadding as any) ?? { top: 16, right: 16, bottom: 16, left: 16 };

  // ── Image ──
  const badgeHtml = showBadge && badgeText
    ? `<div style="position:absolute;top:10px;left:10px;background:${badgeBg};color:${badgeColor};font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px;letter-spacing:0.03em;text-transform:uppercase">${badgeText}</div>`
    : "";
  const imgHtml = showImage && image
    ? `<div class="pb-fp-media" style="position:relative;flex-shrink:0;${isHoriz ? "width:42%;" : "width:100%;"}border-radius:${radius}px;overflow:hidden;background:#f3f4f6;aspect-ratio:${aspect}"><img data-pb-fp-image src="${image}" alt="${title}" loading="lazy" style="width:100%;height:100%;object-fit:${imageFit};display:block">${badgeHtml}</div>`
    : "";

  // ── Vendor ──
  const vendorHtml = showVendor && vendor
    ? `<div data-pb-fp-vendor style="font-size:${vendorFS}px;color:${vendorColor};font-weight:500;text-transform:uppercase;letter-spacing:0.06em">${vendor}</div>`
    : "";

  // ── Title ──
  const titleHtml = showTitle
    ? `<div data-pb-fp-title style="font-size:${titleFS}px;font-weight:700;color:${titleColor};font-family:var(--heading-font);line-height:1.25">${title}</div>`
    : "";

  // ── Star rating ──
  const buildStars = (n: number): string => {
    let s = "";
    for (let i = 0; i < 5; i++) {
      const isHalf = !!(i === Math.floor(n) && (n - Math.floor(n)) >= 0.5);
      const full   = i < Math.floor(n);
      const fill   = full ? "#f59e0b" : (isHalf ? "url(#pbh)" : "#d1d5db");
      const grad   = isHalf ? `<defs><linearGradient id="pbh" x1="0" x2="1"><stop offset="50%" stop-color="#f59e0b"/><stop offset="50%" stop-color="#d1d5db"/></linearGradient></defs>` : "";
      s += `<svg width="14" height="14" viewBox="0 0 24 24" style="display:inline-block">${grad}<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="${fill}" stroke="none"/></svg>`;
    }
    return s;
  };
  const ratingHtml = showRating
    ? `<div style="display:flex;align-items:center;gap:4px;justify-content:${justify}">${buildStars(ratingValue)}<span style="font-size:12px;color:#6b7280">(${ratingValue})</span></div>`
    : "";

  // ── Prices ──
  const compareHtml = showCompareAt && compareAt
    ? `<span data-pb-fp-compare style="font-size:${priceFS}px;font-weight:400;color:${compareColor};text-decoration:line-through">${compareAt}</span>`
    : "";
  const priceHtml = showPrice
    ? `<span data-pb-fp-price style="font-size:${priceFS}px;font-weight:700;color:${priceColor}">${price}</span>`
    : "";
  const priceRowHtml = showPrice || showCompareAt
    ? `<div style="${dividerCss}display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;justify-content:${justify}">${compareHtml}${priceHtml}</div>`
    : "";

  // ── Description ──
  const descHtml = showDescription && description
    ? `<div data-pb-fp-desc style="${dividerCss}font-size:${descFS}px;color:${descColor};line-height:1.6">${description}</div>`
    : "";

  // ── SKU ──
  const skuHtml = showSku
    ? `<div data-pb-fp-sku style="${dividerCss}font-size:12px;color:${skuColor}">SKU: <span data-pb-fp-sku-val style="font-weight:500">${sku || "—"}</span></div>`
    : "";

  // ── Variant selector — rendered as functional HTML ──
  const variantHtml = showVariants
    ? `<div data-pb-fp-variants style="${dividerCss}">
         ${variantStyle === "buttons"
           ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px"><button style="padding:5px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;background:#fff;color:#374151;cursor:pointer">Default Title</button></div>`
           : `<select style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;color:#374151;background:#fff"><option>Default Title</option></select>`
         }
       </div>`
    : "";

  // ── Quantity ──
  const quantityHtml = showQuantity
    ? `<div style="${dividerCss}display:flex;align-items:center;gap:8px">
         <span style="font-size:11px;color:#6b7280;font-weight:500">Qty</span>
         <div style="display:flex;align-items:center;border:1px solid #d1d5db;border-radius:6px;overflow:hidden">
           <button data-pb-fp-qty-dec style="width:32px;height:36px;border:none;background:#f9fafb;cursor:pointer;font-size:16px;color:#374151">−</button>
           <input data-pb-fp-qty type="number" value="1" min="1" style="width:44px;height:36px;border:none;border-left:1px solid #d1d5db;border-right:1px solid #d1d5db;text-align:center;font-size:13px;color:#374151">
           <button data-pb-fp-qty-inc style="width:32px;height:36px;border:none;background:#f9fafb;cursor:pointer;font-size:16px;color:#374151">+</button>
         </div>
       </div>`
    : "";

  // ── Button ──
  const btnWidthCss = btnWidth === "full" ? "width:100%;" : "";
  const buttonHtml  = showButton
    ? `<div style="${dividerCss}${btnWidthCss}margin-top:4px"><a data-pb-fp-button${addToCart ? " data-pb-fp-atc" : ""} href="${productUrl}" style="display:inline-flex;align-items:center;justify-content:center;${btnWidthCss}padding:10px 24px;border-radius:${btnRadius}px;font-size:14px;font-weight:600;text-decoration:none;color:${btnText};background:${btnBg};cursor:pointer">${buttonLabel}</a></div>`
    : "";

  const infoHtml = `<div class="pb-fp-info" style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;align-items:${justify};text-align:${align}">${vendorHtml}${titleHtml}${ratingHtml}${priceRowHtml}${descHtml}${skuHtml}${variantHtml}${quantityHtml}${buttonHtml}</div>`;

  const cardChildren = isRev ? `${infoHtml}${imgHtml}` : `${imgHtml}${infoHtml}`;
  const cardCss = `display:flex;flex-direction:${isHoriz ? "row" : "column"};gap:${isHoriz ? "32px" : "16px"};align-items:${isHoriz ? "flex-start" : "stretch"};${cardBg ? `background:${cardBg};` : ""}border-radius:${radius}px;${shadow ? "box-shadow:0 4px 20px rgba(0,0,0,0.10);" : ""}padding:${pd.top}px ${pd.right}px ${pd.bottom}px ${pd.left}px`;
  const card = `<div class="pb-fp-card" style="${cardCss}">${cardChildren}</div>`;

  return `<div class="pb-featured-product" data-pb-product-handle="${esc(handle)}" style="position:relative;margin:${m.top}px ${m.right}px ${m.bottom}px ${m.left}px">${card}</div>`;
}

// ─── GlobalHeader / GlobalFooter renderers (used by chrome wrapper) ──────────

function renderNavLinks(links: NavLink[] | undefined, textColor: string): string {
  if (!links || links.length === 0) return "";
  return links
    .map(
      (l) =>
        `<a href="${esc(l.url)}" style="color:${esc(textColor)};text-decoration:none;font-weight:500;padding:0 8px;opacity:${l.isActive ? "1" : "0.85"}">${esc(l.label)}</a>`,
    )
    .join("");
}

function GlobalHeader(p: Props): string {
  const height = (p.height as string) || "64px";
  const bg = (p.backgroundColor as string) || "#0158ad";
  const text = (p.textColor as string) || "#ffffff";
  const siteTitle = (p.siteTitle as string) || "";
  const logo = (p.logo as string) || "";
  const showNav = p.showNavigation !== false;
  const showShadow = !!p.showShadow;
  const nav = (p.navigationLinks as NavLink[]) || [];
  const cta = (p.ctaLabel as string) || "";
  const ctaLink = (p.ctaLink as string) || "#";

  const brand = logo
    ? `<img src="${esc(logo)}" alt="${esc(siteTitle)}" style="height:${esc(
        height,
      )};max-height:48px;width:auto;display:block">`
    : `<span style="font-weight:var(--heading-weight, 700);font-size:var(--h3-size, 18px);font-family:var(--heading-font, var(--font-family));color:${esc(text)}">${esc(siteTitle)}</span>`;

  return `<header class="pb-global-header" style="background:${esc(bg)};color:${esc(text)};min-height:${esc(
    height,
  )};font-family:var(--font-family);display:flex;align-items:center;padding:0 24px;${showShadow ? "box-shadow:0 1px 6px rgba(0,0,0,.08);" : ""}">
  <a href="/" style="text-decoration:none;color:inherit;display:inline-flex;align-items:center">${brand}</a>
  <div style="flex:1"></div>
  ${showNav ? `<nav style="display:flex;align-items:center;gap:4px">${renderNavLinks(nav, text)}</nav>` : ""}
  ${
    cta
      ? `<a href="${esc(ctaLink)}" class="pb-btn" style="margin-left:16px;display:inline-block;background:#ffffff;color:${esc(
          bg,
        )};padding:8px 18px;border-radius:var(--border-radius, 6px);font-weight:600;text-decoration:none">${esc(cta)}</a>`
      : ""
  }
</header>`;
}

function GlobalFooter(p: Props): string {
  const bg = (p.backgroundColor as string) || "#1F2937";
  const text = (p.textColor as string) || "#F3F4F6";
  const companyName = (p.companyName as string) || "";
  const desc = (p.companyDescription as string) || "";
  const logo = (p.logo as string) || "";
  const showSocial = p.showSocialLinks !== false;
  const social =
    (p.socialLinks as Record<string, string | undefined>) || {};
  const quick = (p.quickLinks as NavLink[]) || [];
  const copyright = (p.copyrightText as string) || "";

  const socialIcons = showSocial
    ? Object.entries(social)
        .filter(([, url]) => !!url)
        .map(
          ([key, url]) =>
            `<a href="${esc(url)}" target="_blank" rel="noopener" style="color:${esc(
              text,
            )};margin-right:12px;text-decoration:none;font-size:14px;opacity:.85">${esc(
              key.charAt(0).toUpperCase() + key.slice(1),
            )}</a>`,
        )
        .join("")
    : "";

  const links =
    quick.length > 0
      ? `<div style="display:flex;flex-direction:column;gap:8px">${quick
          .map(
            (l) =>
              `<a href="${esc(l.url)}" style="color:${esc(
                text,
              )};text-decoration:none;opacity:.85">${esc(l.label)}</a>`,
          )
          .join("")}</div>`
      : "";

  return `<footer class="pb-global-footer" style="background:${esc(bg)};color:${esc(
    text,
  )};font-family:var(--font-family);padding:48px 24px 24px;">
  <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:32px;align-items:start">
    <div>
      ${
        logo
          ? `<img src="${esc(logo)}" alt="${esc(
              companyName,
            )}" style="max-height:48px;width:auto;display:block;margin-bottom:12px">`
          : `<div style="font-weight:var(--heading-weight, 700);font-size:var(--h3-size, 18px);font-family:var(--heading-font, var(--font-family));margin-bottom:8px">${esc(companyName)}</div>`
      }
      ${desc ? `<p style="opacity:.75;line-height:1.6;margin:0 0 12px;max-width:320px">${esc(desc)}</p>` : ""}
      ${socialIcons ? `<div>${socialIcons}</div>` : ""}
    </div>
    ${links ? `<div><div style="font-weight:600;margin-bottom:12px">Links</div>${links}</div>` : ""}
  </div>
  ${
    copyright
      ? `<div style="max-width:1200px;margin:32px auto 0;padding-top:24px;border-top:1px solid rgba(255,255,255,.1);opacity:.7;font-size:13px">${esc(
          copyright,
        )}</div>`
      : ""
  }
</footer>`;
}

// ── LayoutBlock (Container) ───────────────────────────────────────────────────
function renderLayoutBlock(p: Props, zones: Zones): string {
  const blockId = String(p.id ?? "");
  const uid = (p.cssId as string) || `pb-container-${blockId || "c"}`;
  const zoneName = `container-content-${uid}`;
  const content = zoneContent(blockId, zoneName, zones);
  const pt = (p.advPadding as {top?:number}|undefined)?.top ?? 24;
  const pb = (p.advPadding as {bottom?:number}|undefined)?.bottom ?? 24;
  const pl = (p.advPadding as {left?:number}|undefined)?.left ?? 24;
  const pr = (p.advPadding as {right?:number}|undefined)?.right ?? 24;
  const maxW = p.contentWidth === "boxed" ? `max-width:${p.containerWidth ?? 1140}px;margin:0 auto;` : "";
  let bg = "";
  if (p.bgType === "color" && p.bgColor) bg = `background-color:${esc(p.bgColor as string)};`;
  else if (p.bgType === "gradient" && p.bgGrad1 && p.bgGrad2)
    bg = `background:linear-gradient(${p.bgGradAngle ?? 180}deg,${esc(p.bgGrad1 as string)},${esc(p.bgGrad2 as string)});`;
  const dir = (p.direction as string) || "row";
  const justify = (p.justifyContent as string) || "flex-start";
  const align  = (p.alignItems as string) || "stretch";
  const gap    = p.gap ? `${p.gap}px` : "0";
  const wrap   = (p.wrap as string) || "nowrap";
  return `<div style="position:relative;overflow:hidden;${bg}padding:${pt}px ${pr}px ${pb}px ${pl}px;box-sizing:border-box"><div style="${maxW}display:flex;flex-direction:${dir};justify-content:${justify};align-items:${align};gap:${gap};flex-wrap:${wrap};width:100%;box-sizing:border-box">${renderBlocks(content as Block[], zones)}</div></div>`;
}

// ── GridBlock ─────────────────────────────────────────────────────────────────
function renderGridBlock(p: Props, zones: Zones): string {
  const blockId = String(p.id ?? "");
  const uid = (p.cssId as string) || `pb-grid-${blockId || "g"}`;
  const cols = Math.max(1, Number(p.columns ?? 2));
  const gap  = (p.columnGap as string) || "24px";
  const cells = Array.from({length: cols}, (_, i) => {
    const zoneName = `grid-${uid}-col-${i}`;
    const content = zoneContent(blockId, zoneName, zones);
    return `<div style="min-width:0">${renderBlocks(content as Block[], zones)}</div>`;
  }).join("");
  let bg = "";
  if (p.bgColor) bg = `background-color:${esc(p.bgColor as string)};`;
  const pt = (p.advPadding as {top?:number}|undefined)?.top ?? 0;
  const pb2 = (p.advPadding as {bottom?:number}|undefined)?.bottom ?? 0;
  return `<div style="${bg}padding:${pt}px 0 ${pb2}px;box-sizing:border-box"><div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${gap};align-items:${(p.alignItems as string) || "stretch"}">${cells}</div></div>`;
}

// ── Section (combined Container+Grid) ─────────────────────────────────────────
function renderSectionBlock(p: Props, zones: Zones): string {
  const blockId = String(p.id ?? "");
  const uid = (p.cssId as string) || `pb-section-${blockId || "s"}`;
  // Single free-flow zone — all blocks stack vertically inside the section
  const zoneName = `section-${uid}-content`;
  const content = zoneContent(blockId, zoneName, zones);
  const blocksHtml = renderBlocks(content as Block[], zones);
  const pt = (p.advPadding as {top?:number}|undefined)?.top ?? 60;
  const pb_val = (p.advPadding as {bottom?:number}|undefined)?.bottom ?? 60;
  const pl = (p.advPadding as {left?:number}|undefined)?.left ?? 0;
  const pr = (p.advPadding as {right?:number}|undefined)?.right ?? 0;
  const mt = (p.advMargin as {top?:number}|undefined)?.top ?? 0;
  const mb = (p.advMargin as {bottom?:number}|undefined)?.bottom ?? 0;
  const ml = (p.advMargin as {left?:number}|undefined)?.left ?? 0;
  const mr = (p.advMargin as {right?:number}|undefined)?.right ?? 0;
  const maxW = p.contentWidth === "boxed" ? `max-width:${p.containerWidth ?? 1140}px;margin-left:auto;margin-right:auto;` : "";
  const minH = p.minHeightPx && Number(p.minHeightPx) > 0 ? `min-height:${p.minHeightPx}px;` : "";
  let bg = "";
  if (p.bgType === "color" && p.bgColor) bg = `background-color:${esc(p.bgColor as string)};`;
  else if (p.bgType === "gradient" && p.bgGrad1 && p.bgGrad2)
    bg = `background:linear-gradient(${p.bgGradAngle ?? 180}deg,${esc(p.bgGrad1 as string)},${esc(p.bgGrad2 as string)});`;
  else if (p.bgType === "image" && p.bgImage)
    bg = `background-image:url(${esc(p.bgImage as string)});background-size:${esc((p.bgSize as string)||"cover")};background-position:${esc((p.bgPos as string)||"center center")};background-repeat:${esc((p.bgRepeat as string)||"no-repeat")};${p.bgFixed?"background-attachment:fixed;":""}`;
  // Border
  const borderStyle = (p.borderStyle as string) || "none";
  const bw = (p.borderWidth4 as any) ?? {top:1,right:1,bottom:1,left:1};
  const bc = borderStyle !== "none" ? esc((p.borderColor as string)||"transparent") : "transparent";
  const borderCss = borderStyle !== "none"
    ? `border-style:${esc(borderStyle)};border-top-width:${bw.top??1}px;border-right-width:${bw.right??1}px;border-bottom-width:${bw.bottom??1}px;border-left-width:${bw.left??1}px;border-color:${bc};`
    : "";
  const br = (p.borderRadius4 as any) ?? {top:0,right:0,bottom:0,left:0};
  const radiusCss = `border-radius:${br.top??0}px ${br.right??0}px ${br.bottom??0}px ${br.left??0}px;`;
  return `<section style="position:relative;overflow:hidden;${bg}${borderCss}${radiusCss}${minH}padding:${pt}px ${pr}px ${pb_val}px ${pl}px;margin:${mt}px ${mr}px ${mb}px ${ml}px;box-sizing:border-box"><div style="${maxW}width:100%;box-sizing:border-box">${blocksHtml}</div></section>`;
}

// ─── Section template renderers (pre-filled, directly-editable sections) ──────
// These mirror the editor components in app/puck-blocks/blocks/section.tsx.
// Keep the markup visually in sync with the editor render of each template.

// Outer <section> shell shared by all pre-filled section templates: background,
// padding/margin, optional min-height and a boxed/full content wrapper.
function sectionShell(p: Props, inner: string): string {
  const pad = (p.advPadding as any) ?? {};
  const mar = (p.advMargin as any) ?? {};
  const pt = pad.top ?? 60, pb = pad.bottom ?? 60, pl = pad.left ?? 0, pr = pad.right ?? 0;
  const mt = mar.top ?? 0, mb = mar.bottom ?? 0, ml = mar.left ?? 0, mr = mar.right ?? 0;
  const minH = p.minHeightPx && Number(p.minHeightPx) > 0 ? `min-height:${p.minHeightPx}px;` : "";
  const bgType = (p.bgType as string) || "none";

  let bg = "";
  let videoEl = "";
  if (bgType === "color" && p.bgColor) {
    bg = `background-color:${esc(p.bgColor as string)};`;
  } else if (bgType === "gradient") {
    const dir = (p.bgGradDir as string) || `${p.bgGradAngle ?? 180}deg`;
    bg = `background:linear-gradient(${esc(dir)},${esc((p.bgGrad1 as string) || "transparent")},${esc((p.bgGrad2 as string) || "transparent")});`;
  } else if (bgType === "image" && p.bgImage) {
    bg = `background-image:url(${esc(p.bgImage as string)});`
      + `background-size:${esc((p.bgSize as string) || "cover")};`
      + `background-position:${esc((p.bgPos as string) || "center center")};`
      + `background-repeat:${esc((p.bgRepeat as string) || "no-repeat")};`
      + (p.bgFixed ? "background-attachment:fixed;" : "");
  } else if (bgType === "video") {
    bg = `background-color:${esc((p.bgColor as string) || "#000")};`;
    if (p.bgVideo) {
      videoEl = `<video autoplay${p.bgVideoLoop !== false ? " loop" : ""}${p.bgVideoMute !== false ? " muted" : ""} playsinline src="${esc(p.bgVideo as string)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0"></video>`;
    }
  }

  // Image overlay (from SectionStyleFields).
  const overlay = (bgType === "image" && p.overlayType === "color")
    ? `<div style="position:absolute;inset:0;background:${esc((p.overlayColor as string) || "#000000")};opacity:${(Number(p.overlayOpacity ?? 50)) / 100};z-index:0;pointer-events:none"></div>`
    : "";

  // Border (from SectionStyleFields).
  const borderCss = (p.borderStyle && p.borderStyle !== "none")
    ? `border:${Number(p.borderWidth ?? 1)}px ${esc(p.borderStyle as string)} ${esc((p.borderColor as string) || "#e5e7eb")};`
    : "";
  const radiusCss = p.borderRadius ? `border-radius:${Number(p.borderRadius)}px;` : "";

  const maxW = p.contentWidth === "boxed" ? `max-width:${p.containerWidth ?? 1140}px;margin-left:auto;margin-right:auto;` : "";
  return `<section style="position:relative;overflow:hidden;${bg}${borderCss}${radiusCss}${minH}padding:${pt}px ${pr}px ${pb}px ${pl}px;margin:${mt}px ${mr}px ${mb}px ${ml}px;box-sizing:border-box">${videoEl}${overlay}<div class="pb-sec-inner" style="position:relative;z-index:1;${maxW}width:100%;padding:0 24px;box-sizing:border-box">${inner}</div></section>`;
}

// Centered section heading (title + subtitle) shared by section templates.
function sectionHeadingHtml(title?: string, subtitle?: string, titleColor?: string, subtitleColor?: string, align: "left" | "center" = "center"): string {
  const t = esc(title || ""), st = esc(subtitle || "");
  if (!t && !st) return "";
  const wrap = align === "center" ? "max-width:720px;margin:0 auto 40px;text-align:center" : "margin:0 0 32px";
  return `<div style="${wrap}">`
    + (t ? `<h2 style="font-size:clamp(1.5rem,3vw,2.25rem);font-weight:800;color:${esc(titleColor || "#111827")};line-height:1.2;margin:0 0 12px">${t}</h2>` : "")
    + (st ? `<p style="font-size:1.05rem;color:${esc(subtitleColor || "#6b7280")};line-height:1.6;margin:0">${st}</p>` : "")
    + `</div>`;
}

// About: image + heading/text/button, two-column, stacks on mobile.
function renderSectionAbout(p: Props): string {
  const imageRight = p.imagePosition === "right";
  const badge = esc((p.badge as string) || "");
  const subtitle = esc((p.subtitle as string) || "");
  const title = esc((p.title as string) || "");
  const descriptionRaw = (p.description as string) || "";
  const buttonLabel = esc((p.buttonLabel as string) || "");
  const buttonUrl = esc((p.buttonUrl as string) || "");
  const imageUrl = esc((p.imageUrl as string) || "");
  const imageAlt = esc((p.imageAlt as string) || "");
  const titleColor = esc((p.titleColor as string) || "#111827");
  const textColor = esc((p.textColor as string) || "#6b7280");
  const buttonBg = esc((p.buttonBg as string) || "#005bd3");
  const buttonTextColor = esc((p.buttonTextColor as string) || "#ffffff");

  // Typography
  const ff = (v: any) => (v && v !== "inherit" ? `font-family:${esc(String(v))};` : "");
  const badgeColor = esc((p.badgeColor as string) || "#ffffff");
  const badgeBg = esc((p.badgeBg as string) || (p.buttonBg as string) || "#005bd3");
  const badgeFS = Number(p.badgeFontSize ?? 12);
  const badgeFW = esc(String(p.badgeFontWeight ?? "700"));
  const subtitleColor = esc((p.subtitleColor as string) || buttonBg);
  const subtitleFS = Number(p.subtitleFontSize ?? 13);
  const subtitleFW = esc(String(p.subtitleFontWeight ?? "700"));
  const titleFS = Number(p.titleFontSize ?? 0);
  const titleFW = esc(String(p.titleFontWeight ?? "800"));
  const descFS = Number(p.descFontSize ?? 16);
  const descFW = esc(String(p.descFontWeight ?? "400"));
  const align = String(p.textAlign ?? "text-left").replace("text-", "");
  const itemsAlign = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
  const titleSize = titleFS > 0 ? `${titleFS}px` : "clamp(1.5rem,3vw,2.25rem)";

  // Description: preserve paragraph breaks (blank line) and single line breaks.
  const descHtml = descriptionRaw
    ? descriptionRaw.split(/\n\n+/).map((para, i) => {
        const lines = para.split(/\n/).map(esc).join("<br>");
        return `<p style="font-size:${descFS}px;font-weight:${descFW};${ff(p.descFontFamily)}color:${textColor};line-height:1.7;margin:${i === 0 ? "0 0 1em" : "1em 0"}">${lines}</p>`;
      }).join("")
    : "";

  const textCol = `<div style="display:flex;flex-direction:column;justify-content:center;align-items:${itemsAlign};text-align:${align}">`
    + (badge ? `<span style="display:inline-block;background:${badgeBg};color:${badgeColor};font-size:${badgeFS}px;font-weight:${badgeFW};${ff(p.badgeFontFamily)}padding:3px 12px;border-radius:4px;margin-bottom:16px;letter-spacing:0.04em">${badge}</span>` : "")
    + (subtitle ? `<p style="font-size:${subtitleFS}px;font-weight:${subtitleFW};${ff(p.subtitleFontFamily)}text-transform:uppercase;letter-spacing:0.06em;color:${subtitleColor};margin:0 0 8px">${subtitle}</p>` : "")
    + (title ? `<h2 style="font-size:${titleSize};font-weight:${titleFW};${ff(p.titleFontFamily)}color:${titleColor};line-height:1.2;margin:0 0 16px">${title}</h2>` : "")
    + (descHtml ? `<div style="margin:0 0 24px">${descHtml}</div>` : "")
    + (buttonLabel ? `<a href="${buttonUrl || "#"}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:${buttonBg};color:${buttonTextColor};padding:12px 28px;border-radius:6px;font-weight:700;font-size:15px;text-decoration:none">${buttonLabel}</a>` : "")
    + `</div>`;

  const imageCol = imageUrl
    ? `<img src="${imageUrl}" alt="${imageAlt}" class="no-global-style" style="width:100%;border-radius:8px;object-fit:cover;max-height:420px;display:block" />`
    : "";

  const textCell = `<div class="pb-about-text">${textCol}</div>`;
  const imageCell = `<div class="pb-about-img">${imageCol}</div>`;
  const cols = imageRight ? `${textCell}${imageCell}` : `${imageCell}${textCell}`;
  const mobileBottom = (p.imagePositionMobile ?? "top") === "bottom";
  const gridClass = "pb-sec-about-grid" + (mobileBottom ? " pb-about-img-bottom" : "");
  const grid = `<div class="${gridClass}" style="display:grid;grid-template-columns:${imageUrl ? "1fr 1fr" : "1fr"};gap:clamp(24px,4vw,48px);align-items:center">${cols}</div>`;
  return sectionShell(p, grid);
}

// Hero: badge + headline + description + two buttons, with Text+Image / Text Only /
// Image Background layouts. Mirrors the editor render in section.tsx (Section_Hero).
function renderSectionHero(p: Props): string {
  const layout = String(p.heroLayout ?? "split");
  const hAlign = String(p.hAlign ?? "left");
  const vAlign = String(p.vAlign ?? "center");
  const justify = hAlign === "center" ? "center" : hAlign === "right" ? "flex-end" : "flex-start";
  const itemsAlign = hAlign === "center" ? "center" : hAlign === "right" ? "flex-end" : "flex-start";
  const vJustify = vAlign === "top" ? "flex-start" : vAlign === "bottom" ? "flex-end" : "center";
  const isBg = layout === "image-bg";
  const ff = (v: any) => (v && v !== "inherit" ? `font-family:${esc(String(v))};` : "");
  const uid = "pb-hero-" + esc(String(p.id ?? "x")).replace(/[^a-zA-Z0-9_-]/g, "").slice(-8);

  const pad = (p.advPadding as any) ?? {};
  const mar = (p.advMargin as any) ?? {};
  const pt = pad.top ?? 80, pb = pad.bottom ?? 80, pl = pad.left ?? 0, pr = pad.right ?? 0;
  const mt = mar.top ?? 0, mb = mar.bottom ?? 0, ml = mar.left ?? 0, mr = mar.right ?? 0;
  const minH = p.minHeightPx && Number(p.minHeightPx) > 0 ? `min-height:${Number(p.minHeightPx)}px;` : "";

  // Background (Style tab) — skipped in image-bg layout.
  let bg = "";
  if (isBg) {
    bg = `background-color:#111827;`;
    if (p.heroBgImage) bg += `background-image:url(${esc(String(p.heroBgImage))});background-size:${esc(String(p.heroBgSize || "cover"))};background-position:${esc(String(p.heroBgPos || "center"))};background-repeat:no-repeat;`;
  } else if (p.bgType === "color" && p.bgColor) {
    bg = `background-color:${esc(String(p.bgColor))};`;
  } else if (p.bgType === "gradient") {
    const dir = (p.bgGradDir as string) || `${p.bgGradAngle ?? 180}deg`;
    bg = `background:linear-gradient(${esc(dir)},${esc(String(p.bgGrad1 || "transparent"))},${esc(String(p.bgGrad2 || "transparent"))});`;
  } else if (p.bgType === "image" && p.bgImage) {
    bg = `background-image:url(${esc(String(p.bgImage))});background-size:${esc(String(p.bgSize || "cover"))};background-position:${esc(String(p.bgPos || "center center"))};background-repeat:${esc(String(p.bgRepeat || "no-repeat"))};`;
  } else if (p.bgType === "video") {
    bg = `background-color:${esc(String(p.bgColor || "#000"))};`;
  }
  const videoEl = (!isBg && p.bgType === "video" && p.bgVideo)
    ? `<video${p.bgVideoAutoplay !== false ? " autoplay" : ""}${p.bgVideoLoop !== false ? " loop" : ""}${p.bgVideoMute !== false ? " muted" : ""} playsinline src="${esc(String(p.bgVideo))}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0"></video>`
    : "";

  const border = (p.borderStyle && p.borderStyle !== "none")
    ? `border:${Number(p.borderWidth ?? 1)}px ${esc(String(p.borderStyle))} ${esc(String(p.borderColor || "#e5e7eb"))};` : "";
  const radius = p.borderRadius ? `border-radius:${Number(p.borderRadius)}px;` : "";

  const overlay = isBg
    ? `<div style="position:absolute;inset:0;background:${esc(String(p.heroOverlayColor || "#000000"))};opacity:${(Number(p.heroOverlayOpacity ?? 40)) / 100};z-index:0;pointer-events:none"></div>`
    : "";

  const onDark = isBg;
  const titleColor = String(p.titleColor || (onDark ? "#ffffff" : "#111827"));
  const descColor = String(p.descColor || (onDark ? "rgba(255,255,255,0.85)" : "#6b7280"));

  const badge = esc(String(p.badge || ""));
  const title = esc(String(p.title || "Your Headline Here"));
  const descRaw = String(p.description || "");

  const badgeHtml = badge
    ? `<span style="display:inline-block;background:${esc(String(p.badgeBg || "#005bd3"))};color:${esc(String(p.badgeColor || "#fff"))};font-size:${Number(p.badgeFontSize ?? 12)}px;font-weight:${Number(p.badgeFontWeight ?? 700)};padding:3px 12px;border-radius:4px;margin-bottom:16px;letter-spacing:${Number(p.badgeLetterSpacing ?? 0.5)}px">${badge}</span>` : "";
  const titleHtml = `<h1 style="font-size:${Number(p.titleFontSize ?? 48)}px;${ff(p.titleFontFamily)}font-weight:${Number(p.titleFontWeight ?? 800)};color:${titleColor};line-height:${Number(p.titleLineHeight ?? 1.2)};letter-spacing:${Number(p.titleLetterSpacing ?? 0)}px;margin:0 0 16px">${title}</h1>`;
  const descHtml = descRaw
    ? `<p style="font-size:${Number(p.descFontSize ?? 18)}px;${ff(p.descFontFamily)}font-weight:${Number(p.descFontWeight ?? 400)};color:${descColor};line-height:${Number(p.descLineHeight ?? 1.6)};letter-spacing:${Number(p.descLetterSpacing ?? 0)}px;margin:0 0 32px;max-width:560px">${esc(descRaw)}</p>` : "";

  const pIcon = p.primaryIcon ? `<span>${esc(String(p.primaryIcon))}</span>` : "";
  const sIcon = p.secondaryIcon ? `<span>${esc(String(p.secondaryIcon))}</span>` : "";
  const btnBase = "display:inline-flex;align-items:center;gap:8px;padding:12px 28px;border-radius:6px;font-size:15px;text-decoration:none;transition:background-color .15s,color .15s,border-color .15s";
  const primaryBtn = p.primaryLabel
    ? `<a href="${esc(String(p.primaryUrl || "#"))}" class="pb-hero-btn-primary" style="${btnBase};background:${esc(String(p.primaryBgColor || "#005bd3"))};color:${esc(String(p.primaryTextColor || "#fff"))};font-weight:700;border:2px solid ${esc(String(p.primaryBorderColor || "transparent"))}">${esc(String(p.primaryLabel))}${pIcon}</a>` : "";
  const secondaryBtn = p.secondaryLabel
    ? `<a href="${esc(String(p.secondaryUrl || "#"))}" class="pb-hero-btn-secondary" style="${btnBase};background:${esc(String(p.secondaryBgColor || "transparent"))};color:${esc(String(p.secondaryTextColor || (onDark ? "#fff" : "#005bd3")))};font-weight:600;border:2px solid ${esc(String(p.secondaryBorderColor || (onDark ? "rgba(255,255,255,0.6)" : "#005bd3")))}">${esc(String(p.secondaryLabel))}${sIcon}</a>` : "";
  const buttons = (primaryBtn || secondaryBtn)
    ? `<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:${justify}">${primaryBtn}${secondaryBtn}</div>` : "";

  const hoverCss = `<style>`
    + `#${uid} .pb-hero-btn-primary:hover{${p.primaryHoverBg ? `background:${esc(String(p.primaryHoverBg))};` : ""}${p.primaryHoverText ? `color:${esc(String(p.primaryHoverText))};` : ""}}`
    + `#${uid} .pb-hero-btn-secondary:hover{${p.secondaryHoverBg ? `background:${esc(String(p.secondaryHoverBg))};` : ""}${p.secondaryHoverText ? `color:${esc(String(p.secondaryHoverText))};` : ""}}`
    + `</style>`;

  const textBlock = `<div class="pb-hero-text" style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:${itemsAlign};text-align:${hAlign}">${badgeHtml}${titleHtml}${descHtml}${buttons}</div>`;

  const imageBlock = (layout === "split" && p.imageUrl)
    ? `<div style="position:relative;z-index:1"><img src="${esc(String(p.imageUrl))}" alt="${esc(String(p.imageAlt || ""))}" class="no-global-style" style="width:100%;max-width:${Number(p.imageWidth ?? 520)}px;border-radius:${Number(p.imageRadius ?? 12)}px;object-fit:${esc(String(p.imageFit ?? "cover"))};display:block${hAlign === "right" ? ";margin-left:auto" : ""}" /></div>`
    : "";

  const maxW = p.contentWidth === "boxed" ? `max-width:${Number(p.containerWidth ?? 1140)}px;` : "";
  const gridAlign = vJustify === "flex-start" ? "start" : vJustify === "flex-end" ? "end" : "center";
  const inner = layout === "split"
    ? `<div class="pb-hero-grid" style="position:relative;z-index:1;width:100%;${maxW}margin:0 auto;padding:0 24px;box-sizing:border-box;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:${gridAlign}">`
      + ((p.imagePosition ?? "right") === "left" ? `${imageBlock}${textBlock}` : `${textBlock}${imageBlock}`)
      + `</div>`
    : `<div style="position:relative;z-index:1;width:100%;${maxW}margin:0 auto;padding:0 24px;box-sizing:border-box">${textBlock}</div>`;

  return `<section id="${uid}" style="position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:${vJustify};${bg}${border}${radius}${minH}padding:${pt}px ${pr}px ${pb}px ${pl}px;margin:${mt}px ${mr}px ${mb}px ${ml}px;box-sizing:border-box">${hoverCss}${videoEl}${overlay}${inner}</section>`;
}

// CTA: headline + subtext + two buttons, alignment-aware, color-aware.
function renderSectionCTA(p: Props): string {
  const align = String(p.alignment ?? "text-center").replace("text-", "");
  const justify = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
  const onColor = p.bgType === "color" && p.bgColor && p.bgColor !== "#ffffff";
  const titleC = onColor ? "#ffffff" : "#111827";
  const subC = onColor ? "rgba(255,255,255,0.9)" : "#6b7280";
  const headline = esc((p.headline as string) || "Ready to Get Started?");
  const subtext = esc((p.subtext as string) || "");
  const pl = esc((p.primaryLabel as string) || ""), pu = esc((p.primaryUrl as string) || "#");
  const sl = esc((p.secondaryLabel as string) || ""), su = esc((p.secondaryUrl as string) || "#");
  const inner = `<div style="text-align:${align}">`
    + `<h2 style="font-size:clamp(1.6rem,3.2vw,2.4rem);font-weight:800;color:${titleC};line-height:1.2;margin:0 0 12px">${headline}</h2>`
    + (subtext ? `<p style="font-size:1.1rem;color:${subC};line-height:1.6;margin:0 0 28px">${subtext}</p>` : "")
    + `<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:${justify}">`
    + (pl ? `<a href="${pu}" style="display:inline-block;background:${onColor ? "#ffffff" : "#005bd3"};color:${onColor ? esc((p.bgColor as string) || "#005bd3") : "#ffffff"};padding:12px 28px;border-radius:6px;font-weight:700;font-size:15px;text-decoration:none">${pl}</a>` : "")
    + (sl ? `<a href="${su}" style="display:inline-block;background:transparent;color:${onColor ? "#ffffff" : "#005bd3"};padding:12px 28px;border-radius:6px;font-weight:600;font-size:15px;text-decoration:none;border:2px solid ${onColor ? "rgba(255,255,255,0.6)" : "#005bd3"}">${sl}</a>` : "")
    + `</div></div>`;
  return sectionShell(p, inner);
}

// Countdown: headline + 4 boxes + CTA + progress (static numbers; live JS optional later).
function renderSectionCountdown(p: Props): string {
  const onDark = p.bgType !== "color" || !p.bgColor || /^#(0|1|2|3)/.test(String(p.bgColor));
  const titleC = onDark ? "#ffffff" : "#111827";
  const subC = onDark ? "rgba(255,255,255,0.8)" : "#6b7280";
  const boxes = [["12", "Days"], ["08", "Hours"], ["45", "Mins"], ["30", "Secs"]];
  const boxesHtml = boxes.map(([n, l]) =>
    `<div class="pb-countdown-box" style="min-width:64px;background:${onDark ? "rgba(255,255,255,0.1)" : "#f1f5f9"};border-radius:10px;padding:14px 18px"><div style="font-size:clamp(22px,6vw,32px);font-weight:800;color:${titleC};line-height:1">${n}</div><div style="font-size:12px;color:${subC};margin-top:4px;text-transform:uppercase;letter-spacing:0.05em">${l}</div></div>`
  ).join("");
  const cta = p.ctaLabel ? `<a href="${esc((p.ctaUrl as string) || "#")}" style="display:inline-block;background:${esc((p.progressColor as string) || "#ef4444")};color:#fff;padding:12px 32px;border-radius:6px;font-weight:700;font-size:15px;text-decoration:none">${esc(p.ctaLabel as string)}</a>` : "";
  const progress = p.showProgress !== false
    ? `<div style="width:100%;max-width:420px;background:${onDark ? "rgba(255,255,255,0.1)" : "#f1f5f9"};border-radius:8px;padding:12px 16px"><div style="font-size:12px;color:${subC};margin-bottom:6px">${esc((p.progressLabel as string) || "73% sold")}</div><div style="background:${onDark ? "rgba(255,255,255,0.15)" : "#e2e8f0"};border-radius:999px;height:8px;overflow:hidden"><div style="height:100%;width:${Number(p.progressValue ?? 73)}%;background:${esc((p.progressColor as string) || "#ef4444")};border-radius:999px"></div></div></div>`
    : "";
  const inner = `<div style="text-align:center;display:flex;flex-direction:column;gap:24px;align-items:center">`
    + `<div><h2 style="font-size:clamp(1.6rem,3vw,2.25rem);font-weight:800;color:${titleC};margin:0 0 8px">${esc((p.sectionTitle as string) || "Sale Ends In")}</h2>${p.subtext ? `<p style="font-size:1.05rem;color:${subC};margin:0">${esc(p.subtext as string)}</p>` : ""}</div>`
    + `<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">${boxesHtml}</div>${cta}${progress}</div>`;
  return sectionShell(p, inner);
}

// Newsletter: heading + email input + subscribe button + disclaimer.
function renderSectionNewsletter(p: Props): string {
  const inner = `<div style="max-width:560px;margin:0 auto;text-align:center;display:flex;flex-direction:column;gap:16px">`
    + `<div><h2 style="font-size:clamp(1.4rem,2.8vw,2rem);font-weight:800;color:#111827;margin:0 0 8px">${esc((p.sectionTitle as string) || "Stay in the Loop")}</h2>${p.sectionSubtitle ? `<p style="font-size:1rem;color:#6b7280;margin:0">${esc(p.sectionSubtitle as string)}</p>` : ""}</div>`
    + `<form onsubmit="return false" style="display:flex;gap:8px;flex-wrap:wrap"><input type="email" placeholder="${esc((p.placeholder as string) || "Enter your email address")}" style="flex:1 1 200px;min-width:0;padding:12px 14px;font-size:14px;border:1px solid #d1d5db;border-radius:6px;outline:none" /><button type="submit" style="background:#005bd3;color:#fff;padding:12px 24px;border-radius:6px;font-weight:700;font-size:14px;border:none;cursor:pointer">${esc((p.buttonLabel as string) || "Subscribe")}</button></form>`
    + (p.disclaimer ? `<div style="font-size:12px;color:#6b7280">${esc(p.disclaimer as string)}</div>` : "")
    + `</div>`;
  return sectionShell(p, inner);
}

// Contact form: contact info + a basic form, two-column.
function renderSectionForm(p: Props): string {
  const inputStyle = "width:100%;padding:11px 13px;font-size:14px;border:1px solid #d1d5db;border-radius:6px;outline:none;box-sizing:border-box;margin-bottom:12px;background:#fff";
  const info = `<div style="display:flex;flex-direction:column;gap:16px;justify-content:center">`
    + (p.address ? `<div style="display:flex;gap:10px;align-items:flex-start"><span style="font-size:18px">📍</span><span style="color:#374151;font-size:15px">${esc(p.address as string)}</span></div>` : "")
    + (p.phone ? `<div style="display:flex;gap:10px;align-items:flex-start"><span style="font-size:18px">📞</span><a href="tel:${esc(p.phone as string)}" style="color:#374151;font-size:15px;text-decoration:none">${esc(p.phone as string)}</a></div>` : "")
    + (p.email ? `<div style="display:flex;gap:10px;align-items:flex-start"><span style="font-size:18px">✉️</span><a href="mailto:${esc(p.email as string)}" style="color:#374151;font-size:15px;text-decoration:none">${esc(p.email as string)}</a></div>` : "")
    + `</div>`;
  const form = `<form onsubmit="return false"><input type="text" placeholder="Your name" style="${inputStyle}" /><input type="email" placeholder="Your email" style="${inputStyle}" /><textarea placeholder="Your message" rows="4" style="${inputStyle};resize:vertical"></textarea><button type="submit" style="background:#005bd3;color:#fff;padding:12px 28px;border-radius:6px;font-weight:700;font-size:15px;border:none;cursor:pointer">${esc((p.submitLabel as string) || "Send Message")}</button></form>`;
  const grid = `<div class="pb-sec-about-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,4vw,48px)">${info}${form}</div>`;
  return sectionShell(p, sectionHeadingHtml(p.sectionTitle as string || "Get In Touch", p.sectionSubtitle as string) + grid);
}

// Video: heading + responsive 16:9 embed (YouTube/Vimeo).
function renderSectionVideo(p: Props): string {
  const url = String(p.videoUrl || "");
  const ytId = url ? (url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/)?.[1] ?? "") : "";
  const vmId = url ? (url.match(/(\d+)/)?.[1] ?? "") : "";
  const src = p.sourceType === "vimeo" ? `https://player.vimeo.com/video/${vmId}` : `https://www.youtube.com/embed/${ytId}`;
  const heading = p.showHeading !== false ? sectionHeadingHtml(p.sectionTitle as string || "See It In Action", p.sectionSubtitle as string) : "";
  const media = url
    ? `<div style="max-width:900px;margin:0 auto"><div style="aspect-ratio:16/9;background:#000;border-radius:12px;overflow:hidden"><iframe title="Video" src="${esc(src)}" style="width:100%;height:100%;border:none" allowfullscreen></iframe></div></div>`
    : "";
  return sectionShell(p, heading + media);
}

// Card-grid sections (Services / Features / Team / Pricing). Mirrors the editor
// component SectionCardsContent in section.tsx.
function renderSectionCards(p: Props, variant: "services" | "features" | "team" | "pricing"): string {
  const items: any[] = Array.isArray(p.items) ? (p.items as any[]) : [];
  const accent = esc((p.accentColor as string) || "#005bd3");
  const cols = variant === "team" ? Number(p.memberCount ?? 4)
    : variant === "pricing" ? Number(p.tierCount ?? 3)
    : variant === "features" ? Number(p.featureCount ?? 3)
    : Number(p.serviceCount ?? 3);
  const gap = variant === "features" ? 32 : variant === "team" ? 24 : variant === "pricing" ? 24 : 28;
  const currency = esc((p.currency as string) || "$");

  const card = (it: any): string => {
    if (variant === "team") {
      const img = it.imageUrl
        ? `<img src="${esc(it.imageUrl)}" alt="${esc(it.name || "")}" class="no-global-style" style="width:120px;height:120px;border-radius:50%;object-fit:cover;margin:0 auto 14px;display:block" />`
        : `<div style="width:120px;height:120px;border-radius:50%;background:#e5e7eb;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;font-size:36px">👤</div>`;
      return `<div style="text-align:center">${img}<div style="font-size:17px;font-weight:700;color:#111827">${esc(it.name || "Name")}</div><div style="font-size:14px;color:${accent};font-weight:600;margin-top:2px">${esc(it.role || "Role")}</div>${it.bio ? `<p style="font-size:13px;color:#6b7280;line-height:1.6;margin:8px 0 0">${esc(it.bio)}</p>` : ""}</div>`;
    }
    if (variant === "pricing") {
      const featured = !!it.featured && String(it.featured).trim() !== "";
      const features = String(it.features || "").split("\n").filter(Boolean);
      const feats = features.map((f) => `<li style="font-size:14px;color:#374151;display:flex;gap:8px"><span style="color:${accent}">✓</span>${esc(f)}</li>`).join("");
      return `<div style="border:${featured ? `2px solid ${accent}` : "1px solid #e5e7eb"};border-radius:12px;padding:28px;background:#fff;position:relative;${featured ? "box-shadow:0 10px 30px rgba(0,0,0,0.08)" : ""}">`
        + (featured ? `<span style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:${accent};color:#fff;font-size:11px;font-weight:700;padding:3px 12px;border-radius:999px">POPULAR</span>` : "")
        + `<div style="font-size:16px;font-weight:700;color:#111827;margin-bottom:8px">${esc(it.name || "Plan")}</div>`
        + `<div style="display:flex;align-items:baseline;gap:2px;margin-bottom:16px"><span style="font-size:18px;color:#6b7280">${currency}</span><span style="font-size:40px;font-weight:800;color:#111827;line-height:1">${esc(it.price || "0")}</span><span style="font-size:14px;color:#6b7280">${esc(it.period || "/mo")}</span></div>`
        + `<ul style="list-style:none;padding:0;margin:0 0 20px;display:flex;flex-direction:column;gap:8px">${feats}</ul>`
        + (it.buttonLabel ? `<a href="${esc(it.buttonUrl || "#")}" style="display:block;text-align:center;background:${featured ? accent : "transparent"};color:${featured ? "#fff" : accent};border:2px solid ${accent};padding:10px 0;border-radius:6px;font-weight:700;font-size:14px;text-decoration:none">${esc(it.buttonLabel)}</a>` : "")
        + `</div>`;
    }
    return `<div style="background:#fff;border:1px solid #eef2f7;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">`
      + `<div style="width:48px;height:48px;border-radius:10px;background:${accent}1a;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:14px">${esc(it.icon || "⭐")}</div>`
      + `<div style="font-size:17px;font-weight:700;color:#111827;margin-bottom:6px">${esc(it.title || "Title")}</div>`
      + (it.text ? `<p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0">${esc(it.text)}</p>` : "")
      + `</div>`;
  };

  const cards = items.map(card).join("");
  const grid = `<div class="pb-sec-cards" style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${gap}px;align-items:${variant === "pricing" ? "stretch" : "start"}">${cards}</div>`;
  return sectionShell(p, sectionHeadingHtml(p.sectionTitle as string, p.sectionSubtitle as string) + grid);
}

// Testimonial: heading + grid/slider of quote cards. Mirrors SectionTestimonialContent.
const TESTI_SHADOW: Record<string, string> = {
  none: "none",
  small: "0 1px 3px rgba(0,0,0,0.06)",
  medium: "0 6px 18px rgba(0,0,0,0.08)",
  large: "0 14px 40px rgba(0,0,0,0.12)",
};
function renderSectionTestimonial(p: Props): string {
  const items: any[] = Array.isArray(p.items) ? (p.items as any[]) : [];
  const cols = Math.max(1, Math.min(Number(p.reviewCount ?? 3), 4));
  const isSlider = (p.cardLayout ?? "grid") === "slider";
  const cardStyle = String(p.cardStyle ?? "filled");
  const minimal = cardStyle === "minimal";
  const equal = (p.cardHeight ?? "auto") === "equal";
  const ff = (v: any) => (v && v !== "inherit" ? `font-family:${esc(String(v))};` : "");

  const contentAlign = String(p.contentAlign ?? "left");
  const itemsAlign = contentAlign === "center" ? "center" : contentAlign === "right" ? "flex-end" : "flex-start";
  const vJustify = (p.cardAlign ?? "top") === "center" ? "center" : (p.cardAlign ?? "top") === "bottom" ? "flex-end" : "flex-start";

  const cardBg = String(p.cardBg || (minimal || cardStyle === "outlined" ? "transparent" : "#ffffff"));
  const effBorderStyle = minimal ? "none" : String(p.cardBorderStyle ?? "solid");
  const border = effBorderStyle !== "none" ? `${Number(p.cardBorderWidth ?? 1)}px ${effBorderStyle} ${esc(String(p.cardBorderColor || "#eef2f7"))}` : "none";
  const shadow = minimal ? "none" : (TESTI_SHADOW[String(p.cardShadow ?? "small")] ?? "none");
  const cardRadius = Number(p.cardRadius ?? 12);
  const cardPadding = Number(p.cardPadding ?? 24);

  const showRating = p.showRating !== false, showAvatar = p.showAvatar !== false;
  const showAuthor = p.showAuthor !== false, showRole = p.showRole !== false;
  const starColor = esc(String(p.starColor || "#f59e0b"));
  const starSize = Number(p.starSize ?? 15);

  const cardList = items.map((it) => {
    const rating = Math.max(0, Math.min(5, Math.round(Number(it.rating) || 0)));
    const stars = showRating ? `<div style="color:${starColor};font-size:${starSize}px;letter-spacing:1px">${"★".repeat(rating)}${"☆".repeat(5 - rating)}</div>` : "";
    const avatar = showAvatar
      ? (it.avatar
        ? `<img src="${esc(it.avatar)}" alt="${esc(it.author || "")}" class="no-global-style" style="width:40px;height:40px;border-radius:50%;object-fit:cover" />`
        : `<div style="width:40px;height:40px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:16px">👤</div>`)
      : "";
    const nameBlock = (showAuthor || showRole)
      ? `<div>${showAuthor ? `<div style="font-size:${Number(p.authorFontSize ?? 14)}px;font-weight:${Number(p.authorFontWeight ?? 700)};color:${esc(String(p.authorColor || "#111827"))}">${esc(it.author || "Customer")}</div>` : ""}${showRole && it.role ? `<div style="font-size:${Number(p.roleFontSize ?? 12)}px;color:${esc(String(p.roleColor || "#6b7280"))}">${esc(it.role)}</div>` : ""}</div>`
      : "";
    const meta = (avatar || nameBlock) ? `<div style="display:flex;align-items:center;gap:10px;justify-content:${itemsAlign}">${avatar}${nameBlock}</div>` : "";
    return `<div style="background:${cardBg};border:${border};border-radius:${cardRadius}px;padding:${cardPadding}px;box-shadow:${shadow};display:flex;flex-direction:column;gap:12px;${equal ? "height:100%;" : ""}justify-content:${vJustify};text-align:${contentAlign};align-items:${itemsAlign};box-sizing:border-box">`
      + stars
      + `<p style="font-size:${Number(p.quoteFontSize ?? 15)}px;color:${esc(String(p.quoteColor || "#374151"))};line-height:${Number(p.quoteLineHeight ?? 1.6)};margin:0;font-style:italic">“${esc(it.quote || "Great experience!")}”</p>`
      + meta + `</div>`;
  });

  const body = isSlider
    ? `<div class="pb-testi-slider" style="display:flex;gap:24px;overflow-x:auto;align-items:${equal ? "stretch" : "flex-start"};scroll-snap-type:x mandatory;padding-bottom:8px">`
      + cardList.map((c) => `<div style="flex:0 0 calc(${100 / cols}% - ${(24 * (cols - 1)) / cols}px);min-width:240px;scroll-snap-align:start">${c}</div>`).join("")
      + `</div>`
    : `<div class="pb-testi-grid pb-sec-cards" style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:24px;align-items:${equal ? "stretch" : "start"}">${cardList.join("")}</div>`;

  // Heading (custom typography).
  const headAlign = String(p.headingAlign ?? "center");
  const headWrap = headAlign === "center" ? "max-width:720px;margin:0 auto 40px;" : "margin:0 0 32px;";
  const heading = (p.sectionTitle || p.sectionSubtitle)
    ? `<div style="text-align:${headAlign};${headWrap}">`
      + (p.sectionTitle ? `<h2 style="font-size:${Number(p.headingFontSize ?? 36)}px;${ff(p.headingFontFamily)}font-weight:${Number(p.headingFontWeight ?? 800)};line-height:${Number(p.headingLineHeight ?? 1.2)};color:${esc(String(p.headingColor || "#111827"))};margin:0 0 12px">${esc(String(p.sectionTitle))}</h2>` : "")
      + (p.sectionSubtitle ? `<p style="font-size:${Number(p.subtitleFontSize ?? 17)}px;${ff(p.subtitleFontFamily)}font-weight:${Number(p.subtitleFontWeight ?? 400)};line-height:${Number(p.subtitleLineHeight ?? 1.6)};color:${esc(String(p.subtitleColor || "#6b7280"))};margin:0">${esc(String(p.sectionSubtitle))}</p>` : "")
      + `</div>`
    : "";

  return sectionShell(p, heading + body);
}

// FAQ: heading + <details> accordion list.
function renderSectionFAQ(p: Props): string {
  const items: any[] = Array.isArray(p.items) ? (p.items as any[]) : [];
  const accent = esc((p.accentColor as string) || "#005bd3");
  const rows = items.map((it) =>
    `<details style="border:1px solid #e5e7eb;border-radius:8px;padding:14px 18px;background:#fff"><summary style="font-size:15px;font-weight:600;color:#111827;cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:12px">${esc(it.q || "Question")}<span style="color:${accent}">＋</span></summary><p style="font-size:14px;color:#6b7280;line-height:1.6;margin:12px 0 0">${esc(it.a || "")}</p></details>`
  ).join("");
  const list = `<div style="max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:10px">${rows}</div>`;
  return sectionShell(p, sectionHeadingHtml(p.sectionTitle as string, p.sectionSubtitle as string) + list);
}

// Gallery: heading + responsive image grid.
function renderSectionGallery(p: Props): string {
  const items: any[] = Array.isArray(p.items) ? (p.items as any[]) : [];
  const cols       = Number(p.galleryColumns ?? 3);
  const colsTablet = Number(p.galleryColumnsTablet ?? Math.min(cols, 3));
  const colsMobile = Number(p.galleryColumnsMobile ?? Math.min(cols, 2));
  const gap        = Number(p.gap ?? 12);
  const rowGap     = p.rowGap != null ? Number(p.rowGap) : gap;
  const colGap     = p.colGap != null ? Number(p.colGap) : gap;

  const ar  = (p.aspectRatio as string) || "square";
  const fit = esc((p.objectFit as string) || "cover");
  const br  = p.imageBorderRadius != null ? Number(p.imageBorderRadius) : 8;
  const shadowCss = p.imageShadow ? "box-shadow:0 4px 16px rgba(0,0,0,0.12);" : "";
  const hoverEffect  = (p.hoverEffect as string) || "none";
  const layoutType   = (p.layoutType as string) || "grid";
  const isMasonry    = layoutType === "masonry";
  const showCaption  = !!p.showCaption;
  const captionColor = esc((p.captionColor as string) || "#6b7280");

  const aspectMap: Record<string, string> = { square: "1/1", portrait: "3/4", landscape: "4/3", original: "auto" };
  const arCss    = aspectMap[ar] ?? "1/1";
  // Masonry keeps natural image height so it ignores the aspect ratio.
  const arStyle  = (!isMasonry && arCss !== "auto") ? `aspect-ratio:${arCss};` : "";

  // Typography
  const ff = (v: any) => (v && v !== "inherit" ? `font-family:${esc(String(v))};` : "");
  const align = String(p.textAlign ?? "text-center").replace("text-", "");

  const uid = `pbg-${((p.cssId || p.id || "x") as string).slice(-6)}`;

  const gridCss = isMasonry
    ? `#${uid} .pb-gal-grid{column-count:${cols};column-gap:${colGap}px;}
       #${uid} .pb-gal-cell{break-inside:avoid;margin-bottom:${rowGap}px;}
       @media(max-width:767px){#${uid} .pb-gal-grid{column-count:${colsMobile};}}
       @media(min-width:768px) and (max-width:1023px){#${uid} .pb-gal-grid{column-count:${colsTablet};}}`
    : `#${uid} .pb-gal-grid{display:grid;grid-template-columns:repeat(${cols},1fr);row-gap:${rowGap}px;column-gap:${colGap}px;}
       @media(max-width:767px){#${uid} .pb-gal-grid{grid-template-columns:repeat(${colsMobile},1fr)!important;}}
       @media(min-width:768px) and (max-width:1023px){#${uid} .pb-gal-grid{grid-template-columns:repeat(${colsTablet},1fr)!important;}}`;

  const scopedCss = `<style>
    #${uid} .pb-gal-item{position:relative;overflow:hidden;border-radius:${br}px;${shadowCss}}
    #${uid} .pb-gal-item img{width:100%;${arStyle}object-fit:${fit};display:block;transition:transform .3s ease,filter .3s ease,opacity .3s ease;}
    ${hoverEffect === "zoom" ? `#${uid} .pb-gal-item:hover img{transform:scale(1.08);}` : ""}
    ${hoverEffect === "fade" ? `#${uid} .pb-gal-item:hover img{opacity:0.75;}` : ""}
    ${gridCss}
  </style>`;

  const cells = items.map((it) => {
    if (!it.url) return "";
    const imgTag = `<img src="${esc(it.url as string)}" alt="${esc((it.alt as string) || "")}" loading="lazy" class="no-global-style" />`;
    const captionHtml = showCaption && it.caption
      ? `<div style="font-size:13px;color:${captionColor};margin-top:6px;text-align:${align}">${esc(it.caption as string)}</div>`
      : "";
    return `<div class="pb-gal-cell"><div class="pb-gal-item">${imgTag}</div>${captionHtml}</div>`;
  }).join("");

  const heading = (p.showHeading !== false && p.sectionTitle)
    ? `<h2 style="text-align:${align};font-size:${Number(p.headingFontSize ?? 36)}px;font-weight:${esc(String(p.headingFontWeight ?? "800"))};${ff(p.headingFontFamily)}color:${esc((p.headingColor as string) || "#111827")};line-height:1.2;margin:0 0 8px">${esc(p.sectionTitle as string)}</h2>`
    : "";

  const descHtml = (p.showDescription && p.sectionDescription)
    ? `<p style="text-align:${align};font-size:${Number(p.descFontSize ?? 16)}px;font-weight:${esc(String(p.descFontWeight ?? "400"))};${ff(p.descFontFamily)}line-height:1.6;color:${esc((p.descriptionColor as string) || "#6b7280")};margin:0 0 28px;${align === "center" ? "max-width:720px;margin-left:auto;margin-right:auto;" : ""}">${esc(p.sectionDescription as string)}</p>`
    : "";

  const grid = `<div id="${uid}"><div class="pb-gal-grid">${cells}</div></div>`;

  return scopedCss + sectionShell(p, heading + descHtml + grid);
}

// Carousel: optional marquee bar + heading + product-style cards.
function renderSectionCarousel(p: Props): string {
  const items: any[] = Array.isArray(p.items) ? (p.items as any[]) : [];
  const cols       = Number(p.cardCount ?? 3);
  const accent     = esc((p.accentColor as string) || "#005bd3");
  const br         = Number(p.cardRadius ?? 12);
  const imgRatio   = esc((p.imgRatio as string) || "4/3");
  const showPrice  = p.showPrice !== false;
  const showBadge  = p.showBadge !== false;

  const marquee = p.showMarquee !== false
    ? `<div style="background:${esc((p.marqueeBg as string) || "#1a1a1a")};padding:10px 0;overflow:hidden"><div style="display:flex;gap:40px;color:${esc((p.marqueeColor as string) || "#fff")};font-size:13px;font-weight:500;white-space:nowrap;padding:0 24px">${[0, 1, 2].map(() => `<span>${esc((p.marqueeText as string) || "Announcement · ")}</span>`).join("")}</div></div>`
    : "";

  const cards = items.map((it) => {
    const imgHtml = it.imageUrl
      ? `<img src="${esc(it.imageUrl)}" alt="${esc(it.imageAlt || it.title || "")}" style="width:100%;aspect-ratio:${imgRatio};object-fit:cover;display:block" />`
      : `<div style="width:100%;aspect-ratio:${imgRatio};background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#94a3b8"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>`;
    const badgeHtml = showBadge && it.badge
      ? `<span style="position:absolute;top:10px;left:10px;z-index:1;background:${accent};color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px">${esc(it.badge)}</span>`
      : "";
    const priceHtml = showPrice && it.price
      ? `<div style="font-size:14px;font-weight:600;color:${accent};margin-bottom:8px">${esc(it.currency || "$")}${esc(it.price)}</div>`
      : "";
    const descHtml = it.text
      ? `<p style="font-size:13px;color:#6b7280;line-height:1.5;margin:0 0 12px">${esc(it.text)}</p>`
      : "";
    const btnHtml = it.buttonLabel
      ? `<a href="${esc(it.buttonUrl || "#")}" style="display:inline-block;color:${accent};font-weight:700;font-size:13px;text-decoration:none">${esc(it.buttonLabel)} →</a>`
      : "";
    return `<div style="position:relative;background:#fff;border:1px solid #eef2f7;border-radius:${br}px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04)">${badgeHtml}${imgHtml}<div style="padding:16px"><div style="font-size:15px;font-weight:700;color:#111827;margin-bottom:4px">${esc(it.title || "Card title")}</div>${priceHtml}${descHtml}${btnHtml}</div></div>`;
  }).join("");

  const grid = `<div class="pb-sec-cards" style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:20px">${cards}</div>`;
  const emptyHint = items.length === 0
    ? `<p style="text-align:center;color:#9ca3af;font-size:14px;padding:40px 0">No products added yet — select products in the editor.</p>`
    : "";
  return marquee + sectionShell(p, (p.sectionTitle ? sectionHeadingHtml(p.sectionTitle as string) : "") + (items.length > 0 ? grid : emptyHint));
}

// Media Carousel: heading + large main image + thumbnail strip.
function renderSectionMediaCarousel(p: Props): string {
  const items: any[] = Array.isArray(p.items) ? (p.items as any[]) : [];
  const main = items.find((it) => it.url) || items[0] || {};
  const heading = p.showHeading !== false ? sectionHeadingHtml(p.sectionTitle as string, p.sectionSubtitle as string) : "";
  const mainHtml = main.url
    ? `<img src="${esc(main.url)}" alt="${esc(main.alt || "")}" class="no-global-style" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:12px;display:block" />`
    : "";
  const thumbs = (p.showDots !== false && items.length > 1)
    ? `<div style="display:flex;gap:8px;margin-top:12px;justify-content:center;flex-wrap:wrap">${items.filter((it) => it.url).map((it) => `<div style="width:64px;height:44px;border-radius:6px;overflow:hidden;border:1px solid #e5e7eb;flex-shrink:0"><img src="${esc(it.url)}" alt="${esc(it.alt || "")}" style="width:100%;height:100%;object-fit:cover" /></div>`).join("")}</div>`
    : "";
  return sectionShell(p, heading + `<div style="max-width:900px;margin:0 auto">${mainHtml}${thumbs}</div>`);
}

// ─── New block renderers ──────────────────────────────────────────────────────

function advSpacing(p: Props): string {
  const m = p.advMargin as any ?? {};
  const pad = p.advPadding as any ?? {};
  const mt = m.top ?? 0, mr = m.right ?? 0, mb = m.bottom ?? 0, ml = m.left ?? 0;
  const pt = pad.top ?? 0, pr = pad.right ?? 0, pb = pad.bottom ?? 0, pl = pad.left ?? 0;
  return `margin:${mt}px ${mr}px ${mb}px ${ml}px;padding:${pt}px ${pr}px ${pb}px ${pl}px;`;
}

// Emits a <style> block for responsive spacing overrides when responsiveSpacing prop is set.
// Returns { style: string, className: string } — style is "" if no responsive overrides.
function responsiveSpacingStyle(p: Props, blockId: string): { style: string; className: string } {
  const rs = p.responsiveSpacing as any;
  if (!rs) return { style: "", className: "" };
  const uid = `pb-rs-${blockId.slice(-8)}`;
  const side = (v: any) => Number(v ?? 0);
  const mRule = (bp: any) => bp?.margin
    ? `margin:${side(bp.margin.top)}px ${side(bp.margin.right)}px ${side(bp.margin.bottom)}px ${side(bp.margin.left)}px!important;`
    : "";
  const pRule = (bp: any) => bp?.padding
    ? `padding:${side(bp.padding.top)}px ${side(bp.padding.right)}px ${side(bp.padding.bottom)}px ${side(bp.padding.left)}px!important;`
    : "";
  const rules: string[] = [];
  const d = mRule(rs.desktop) + pRule(rs.desktop);
  if (d) rules.push(`@media(min-width:1024px){.${uid}{${d}}}`);
  const t = mRule(rs.tablet) + pRule(rs.tablet);
  if (t) rules.push(`@media(min-width:768px) and (max-width:1023px){.${uid}{${t}}}`);
  const m = mRule(rs.mobile) + pRule(rs.mobile);
  if (m) rules.push(`@media(max-width:767px){.${uid}{${m}}}`);
  if (!rules.length) return { style: "", className: "" };
  return { style: `<style>${rules.join("")}</style>`, className: uid };
}

function advBgStyle(p: Props): string {
  if ((p.advBgType as string) === "color" && p.advBgColor)
    return `background-color:${esc(p.advBgColor as string)};`;
  return "";
}

function flexJustify(align: string): string {
  if (align === "center") return "center";
  if (align === "right") return "flex-end";
  return "flex-start";
}

function renderDivider(p: Props): string {
  const spacing = advSpacing(p);
  const color = esc((p.lineColor as string) || "#e5e7eb");
  const th = Number(p.thickness ?? 1);
  const lineStyle = (p.lineStyle as string) || "solid";
  // Guard against empty/invalid width values which the browser ignores.
  const wNum = Number(p.lineWidthVal);
  const width = Number.isFinite(wNum) && wNum > 0 ? `${wNum}${(p.lineWidthUnit as string) || "px"}` : esc((p.lineWidth as string) || "100%");
  const gap = Number(p.gap ?? 16) || 16;
  const align = (p.alignment as string) || "center";
  const justify = flexJustify(align);

  const br = Number(p.borderRadius ?? 0);
  const brCss = br > 0 ? `border-radius:${br}px;` : "";

  // Build one line segment. widthStyle is either "flex:1;" (inside icon row) or "width:Xunit;" (standalone).
  // We use display:block on the wrapper and an inner <hr>-style element so Shopify theme resets
  // (e.g. *{display:block}, *{height:0}, *{border:0}) cannot hide both wrappers simultaneously.
  const buildLine = (widthStyle: string): string => {
    const baseWrap = `display:block;${widthStyle}overflow:visible;align-self:center;flex-shrink:${widthStyle.startsWith("flex:1") ? "1" : "0"};${brCss}`;
    if (lineStyle === "gradient") {
      const c1 = esc((p.gradientStart as string) || "#e5e7eb");
      const c2 = esc((p.gradientEnd   as string) || "#e5e7eb");
      return `<div style="${baseWrap}height:${th}px;min-height:${th}px;background:linear-gradient(90deg,${c1},${c2});"></div>`;
    }
    if (lineStyle === "shadow") {
      const h = th * 4;
      return `<div style="${baseWrap}height:${h}px;min-height:${h}px;background:radial-gradient(ellipse at 50% 0%,${color} 0%,transparent 70%);"></div>`;
    }
    if (lineStyle === "wave") {
      const h = Math.max(th * 6, 12);
      const mid = h / 2;
      const amp = mid * 0.8;
      const path = `M0,${mid} C15,${mid - amp} 15,${mid + amp} 30,${mid} S45,${mid - amp} 60,${mid} S75,${mid + amp} 90,${mid} S105,${mid - amp} 120,${mid} S135,${mid + amp} 150,${mid} S165,${mid - amp} 180,${mid} S195,${mid + amp} 210,${mid} S225,${mid - amp} 240,${mid} S255,${mid + amp} 270,${mid} S285,${mid - amp} 300,${mid} S315,${mid + amp} 330,${mid} S345,${mid - amp} 360,${mid} S375,${mid + amp} 390,${mid} S405,${mid - amp} 420,${mid} S435,${mid + amp} 450,${mid} S465,${mid - amp} 480,${mid} S495,${mid + amp} 510,${mid} S525,${mid - amp} 540,${mid} S555,${mid + amp} 570,${mid} S585,${mid - amp} 600,${mid}`;
      return `<div style="${baseWrap}height:${h}px;min-height:${h}px;overflow:hidden;"><svg width="100%" height="${h}" viewBox="0 0 600 ${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block;overflow:visible"><path d="${path}" fill="none" stroke="${color}" stroke-width="${th}" vector-effect="non-scaling-stroke"/></svg></div>`;
    }
    if (lineStyle === "zigzag") {
      const h = Math.max(th * 6, 12);
      const pts = Array.from({ length: 61 }, (_, i) => `${i * 10},${i % 2 === 0 ? h : 0}`).join(" ");
      return `<div style="${baseWrap}height:${h}px;min-height:${h}px;overflow:hidden;"><svg width="100%" height="${h}" viewBox="0 0 600 ${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block;overflow:visible"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="${th}" vector-effect="non-scaling-stroke"/></svg></div>`;
    }
    if (lineStyle === "double") {
      const gap2 = Math.max(th, 2);
      const lineDiv = `<div style="display:block!important;height:${th}px!important;min-height:${th}px!important;background:${color}!important;${brCss}font-size:0;line-height:0;border:none!important;padding:0!important;margin:0!important;box-sizing:content-box!important;"></div>`;
      return `<div style="${baseWrap}display:flex!important;flex-direction:column!important;gap:${gap2}px!important;border:none!important;padding:0!important;">${lineDiv}${lineDiv}</div>`;
    }
    if (lineStyle === "dashed" || lineStyle === "dotted") {
      return `<div style="${baseWrap}height:${th}px;min-height:${th}px;border-top:${th}px ${lineStyle} ${color};background:transparent;box-sizing:content-box;font-size:0;line-height:0;overflow:hidden;"></div>`;
    }
    // solid
    return `<div style="${baseWrap}height:${th}px;min-height:${th}px;background:${color};${brCss}font-size:0;line-height:0;overflow:hidden;"></div>`;
  };

  let inner = "";
  if (p.showElement) {
    const elType = (p.elementType as string) || "icon";
    const iconVal = ((p.elementIcon as string) || "").trim();
    const imgUrl = ((p.elementImage as string) || "").trim();
    const imgW = Number(p.elementImageWidth ?? 40);
    const imgH = Number(p.elementImageHeight ?? 40);
    const hasContent = elType === "text" ? !!((p.elementText as string) || "").trim() : elType === "image" ? !!imgUrl : !!iconVal;
    const elSpacing = `${Number(p.elementSpacing ?? 12)}px`;
    let elContent: string;
    if (!hasContent) {
      // Keep the element's space reserved even when empty so the divider holds its
      // constrained-width, gapped layout instead of collapsing to a full-width line
      // (mirrors the editor preview — the space "remains there" until content added).
      elContent = elType === "image"
        ? `<div style="width:${imgW}px;height:${imgH}px;flex-shrink:0;"></div>`
        : `<span style="display:inline-block;min-height:${elType === "text" ? Number(p.elementFontSize ?? 14) : Number(p.iconSize ?? 20)}px;"></span>`;
    } else if (elType === "text") {
      elContent = `<span style="font-size:${p.elementFontSize ?? 14}px;color:${esc((p.elementTextColor as string) || color)};white-space:nowrap;line-height:1;">${esc((p.elementText as string) || "")}</span>`;
    } else if (elType === "image") {
      const imgR = Number(p.elementImageRadius ?? 0);
      elContent = `<div style="width:${imgW}px;height:${imgH}px;overflow:hidden;display:inline-block;vertical-align:middle;${imgR > 0 ? `border-radius:${imgR}px;` : ""}"><img src="${imgUrl.replace(/"/g, "&quot;")}" alt="" class="no-global-style" style="width:100%;height:100%;object-fit:cover;display:block;" /></div>`;
    } else {
      elContent = `<span style="font-size:${p.iconSize ?? 20}px;color:${esc((p.iconColor as string) || color)};line-height:1;display:inline-block;">${esc(iconVal)}</span>`;
    }
    const elPos = (p.elementPosition as string) || "center";
    // Build left and right line segments independently so each is a fresh div
    const lineLeft  = buildLine("flex:1;");
    const lineRight = buildLine("flex:1;");
    const elDiv = `<div style="flex-shrink:0;padding:0 ${elSpacing};display:flex;align-items:center;">${elContent}</div>`;
    if (elPos === "left")       inner = `<div style="display:flex;align-items:center;width:${width};">${elDiv}${lineRight}</div>`;
    else if (elPos === "right") inner = `<div style="display:flex;align-items:center;width:${width};">${lineLeft}${elDiv}</div>`;
    else                        inner = `<div style="display:flex;align-items:center;width:${width};">${lineLeft}${elDiv}${lineRight}</div>`;
  } else {
    // No icon/text element → clean full-width divider line.
    inner = `<div style="display:flex;align-items:center;width:100%;">${buildLine("flex:1;")}</div>`;
  }

  return `<div style="${spacing}padding-top:${gap}px;padding-bottom:${gap}px;display:flex;justify-content:${justify};align-items:center;${advBgStyle(p)}">${inner}</div>`;
}

function renderVideo(p: Props): string {
  const spacing = advSpacing(p);
  const videoUrl = (p.videoUrl as string) || "";
  const sourceType = (p.sourceType as string) || "youtube";
  const aspectRatio = (p.aspectRatio as string) || "16:9";
  const videoWidthVal = p.videoWidthVal ?? 100;
  const width = `${Number(videoWidthVal) || 100}%`;
  const borderRadius = `${Number(p.borderRadius ?? 0)}px`;
  const ratioMap: Record<string, string> = { "16:9": "56.25%", "4:3": "75%", "1:1": "100%" };
  const paddingBottom = ratioMap[aspectRatio] ?? "56.25%";
  const isNative = sourceType === "self" || sourceType === "upload";
  const autoplay = p.autoplay as boolean;

  if (!videoUrl) {
    return `<div style="${spacing}padding:24px;border:2px dashed #e5e7eb;border-radius:8px;color:#9ca3af;font-size:14px;text-align:center">No video URL set.</div>`;
  }

  // All videos are ALWAYS muted (mute=1 / muted) — no sound option is exposed.
  let embedUrl = "";
  if (sourceType === "youtube" && videoUrl && !videoUrl.startsWith("data:")) {
    const match = videoUrl.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    const id = match?.[1] ?? "";
    const params = new URLSearchParams();
    if (autoplay) params.set("autoplay", "1");
    if (p.loop) { params.set("loop", "1"); params.set("playlist", id); }
    params.set("mute", "1"); // always muted
    if ((p.controls as string) === "hide") params.set("controls", "0");
    embedUrl = `https://www.youtube.com/embed/${id}?${params.toString()}`;
  } else if (sourceType === "vimeo" && videoUrl && !videoUrl.startsWith("data:")) {
    const match = videoUrl.match(/vimeo\.com\/(\d+)/);
    const id = match?.[1] ?? "";
    const params = new URLSearchParams();
    if (autoplay) params.set("autoplay", "1");
    if (p.loop) params.set("loop", "1");
    params.set("muted", "1"); // always muted
    if ((p.controls as string) === "hide") params.set("controls", "0");
    embedUrl = `https://player.vimeo.com/video/${id}?${params.toString()}`;
  }

  const containerStyle = `position:relative;width:${width};padding-bottom:${paddingBottom};height:0;overflow:hidden;border-radius:${borderRadius};background:#000;`;
  const absStyle = `position:absolute;inset:0;width:100%;height:100%;`;

  let videoInner = "";
  if (isNative && videoUrl && !videoUrl.startsWith("data:")) {
    const ctrlAttr = (p.controls as string) !== "hide" ? " controls" : "";
    const autoAttr = autoplay ? " autoplay" : "";
    const loopAttr = p.loop ? " loop" : "";
    const inlineAttr = p.playInline !== false ? " playsinline" : "";
    // `muted` is always present so self-hosted videos never play sound.
    videoInner = `<video src="${esc(videoUrl)}"${ctrlAttr}${autoAttr}${loopAttr} muted${inlineAttr} style="${absStyle}object-fit:cover"></video>`;
  } else if (embedUrl) {
    videoInner = `<iframe src="${esc(embedUrl)}" style="${absStyle}border:none" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  }

  return `<div style="${spacing}">${videoInner ? `<div style="${containerStyle}">${videoInner}</div>` : ""}</div>`;
}

const SOCIAL_SVGS: Record<string, string> = {
  facebook:  `<svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
  twitter:   `<svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  youtube:   `<svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  tiktok:    `<svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
  linkedin:  `<svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  pinterest: `<svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>`,
  snapchat:  `<svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M12.065.003c.157-.003.313-.003.47 0 1.65.029 5.503.597 7.37 4.688.562 1.244.618 3.104.483 4.603l.006.004c.173.087.44.145.783.145.42 0 .896-.085 1.29-.274.17-.082.358-.12.539-.12.358 0 .72.156.953.43.284.33.329.73.114 1.083-.297.49-.946.8-1.583 1.02-.158.054-.328.107-.5.157-.405.12-.825.245-.954.484-.069.13-.068.294.007.527.334 1.04 1.165 2.703 2.986 3.735.188.106.265.335.183.534-.097.231-.366.48-.836.697-1.044.485-2.403.637-3.658.42-.143-.026-.278-.053-.407-.079-.27-.053-.513-.1-.745-.117-.34-.022-.64.037-.861.245-.125.12-.207.27-.272.453-.177.508-.293 1.17-.39 1.63-.016.079-.04.137-.069.18-.108.155-.335.248-.63.248-.186 0-.43-.042-.65-.156-.275-.14-.563-.217-.852-.217-.11 0-.22.01-.327.03-.48.084-.853.242-1.156.375-.499.214-.84.354-1.398.354-.535 0-.864-.133-1.35-.344-.303-.133-.676-.292-1.158-.376a2.45 2.45 0 00-.327-.03c-.29 0-.577.077-.852.218-.22.113-.464.155-.65.155-.295 0-.522-.093-.63-.248-.03-.043-.054-.101-.07-.18-.096-.46-.213-1.121-.389-1.63-.065-.182-.147-.332-.272-.452-.221-.208-.52-.267-.86-.245-.233.017-.476.064-.746.117-.128.026-.264.053-.406.079-1.256.217-2.614.065-3.658-.42-.47-.217-.74-.466-.836-.697-.082-.2-.005-.428.183-.534 1.821-1.032 2.652-2.695 2.986-3.735.074-.233.076-.396.007-.527-.129-.239-.549-.364-.954-.484-.172-.05-.342-.103-.5-.157-.637-.22-1.286-.53-1.583-1.02-.215-.353-.17-.754.114-1.083.233-.274.595-.43.953-.43.181 0 .369.038.539.12.393.189.868.274 1.288.274.344 0 .612-.058.785-.145l.006-.004c-.135-1.499-.08-3.359.483-4.604C6.558.597 10.41.029 12.065.003z"/></svg>`,
};

const SOCIAL_BRAND: Record<string, string> = {
  facebook: "#1877F2", instagram: "#E1306C", twitter: "#000000", youtube: "#FF0000",
  tiktok: "#000000", linkedin: "#0A66C2", pinterest: "#E60023", snapchat: "#FFFC00",
};

function renderSocialIcons(p: Props): string {
  const m = p.advMargin as any ?? {};
  const pad = p.advPadding as any ?? {};
  const mt = m.top ?? 0, mr = m.right ?? 0, mb = m.bottom ?? 0, ml = m.left ?? 0;
  const pt = pad.top ?? 8, pr = pad.right ?? 0, pb = pad.bottom ?? 8, pl = pad.left ?? 0;
  const outerSpacing = `margin:${mt}px ${mr}px ${mb}px ${ml}px;padding:${pt}px ${pr}px ${pb}px ${pl}px;`;
  const cssId = esc((p.cssId as string) || "") || "social-icons-blk";
  const cssClass = esc((p.cssClass as string) || "");
  const zIndex = p.zIndex != null ? `z-index:${p.zIndex};` : "";
  const classAttr = cssClass;

  const enabled = (p.enabled as string[]) ?? ["facebook", "instagram", "twitter", "youtube"];
  const urls = (p.urls as Record<string, string>) ?? {};
  const newTab = p.newTab !== false;
  const iconStyle = (p.iconStyle as string) || "filled";
  const sz = Number(p.iconSize) || 24;
  const bgsz = Number(p.bgSize) || 40;
  const iconColor = (p.iconColor as string) || "";
  const iconBgColor = (p.iconBgColor as string) || "";
  const iconHoverColor = (p.iconHoverColor as string) || "";
  const iconHoverBg = (p.iconHoverBg as string) || "";
  const bgShape = (p.bgShape as string) || "circle";
  const borderStyle = (p.borderStyle as string) || "none";
  const borderWidth = Number(p.borderWidth ?? 1);
  const borderColor = (p.borderColor as string) || "";
  const iconSpacing = Number(p.iconSpacing ?? 12);
  const alignment = (p.alignment as string) || "left";
  const shapeRadius = bgShape === "circle" ? "50%" : bgShape === "rounded" ? "10px" : bgShape === "square" ? "0px" : undefined;
  const isOutlined = iconStyle === "outlined";
  const isMinimal  = iconStyle === "minimal";
  const isBranded  = iconStyle === "branded";
  const bgColorStyle = (p.advBgType as string) === "color" && p.advBgColor ? `background-color:${esc(p.advBgColor as string)};` : "";

  const hoverCss = (iconHoverColor || iconHoverBg)
    ? `<style>#${cssId} a:hover .puck-si{${iconHoverColor ? `color:${iconHoverColor}!important;` : ""}${iconHoverBg ? `background:${iconHoverBg}!important;` : ""}transition:all 0.2s;}#${cssId} a .puck-si{transition:all 0.2s;}</style>`
    : "";

  const icons = enabled.map(key => {
    const svg = SOCIAL_SVGS[key] ?? "";
    const brand = SOCIAL_BRAND[key] ?? "#333";
    const resolvedColor = isBranded
      ? (bgShape !== "none" ? "#fff" : brand)
      : isOutlined
      ? (iconColor || brand)
      : isMinimal
      ? (iconColor || brand)
      : (iconColor || "currentColor");
    const bg = isMinimal
      ? ""
      : bgShape !== "none"
      ? (isBranded ? brand : (iconBgColor || "#e5e7eb"))
      : isOutlined
      ? "transparent"
      : "";
    const borderW = isOutlined ? 2 : (borderStyle === "solid" ? borderWidth : 0);
    const borderC = isOutlined ? (iconColor || brand) : (borderColor || resolvedColor);
    const borderCss = borderW > 0
      ? `border-width:${borderW}px;border-style:solid;border-color:${borderC};box-sizing:border-box;`
      : "";
    const resolvedBorderRadius = isOutlined ? (shapeRadius ?? "8px") : shapeRadius;
    const hasContainer = bgShape !== "none" || isOutlined;
    const wh = hasContainer ? bgsz : sz;
    const innerStyle = `display:inline-flex;align-items:center;justify-content:center;width:${wh}px;height:${wh}px;${bg ? `background:${bg};` : ""}${resolvedBorderRadius ? `border-radius:${resolvedBorderRadius};` : ""}${borderCss}color:${resolvedColor};flex-shrink:0;`;
    const svgWrap = `<span style="width:${sz}px;height:${sz}px;display:inline-flex;align-items:center;justify-content:center;font-size:${sz}px;">${svg}</span>`;
    const inner = `<span class="puck-si" style="${innerStyle}">${svgWrap}</span>`;
    const url = urls[key];
    return url
      ? `<a href="${esc(url)}" target="${newTab ? "_blank" : "_self"}" rel="noopener noreferrer" title="${esc(key)}" style="text-decoration:none;color:inherit">${inner}</a>`
      : `<span class="puck-si" style="${innerStyle}opacity:0.4;" title="${esc(key)} (no URL)">${svgWrap}</span>`;
  }).join("");

  return `${hoverCss}<div id="${cssId}"${classAttr ? ` class="${classAttr}"` : ""} style="${outerSpacing}${zIndex}${bgColorStyle}"><div style="display:flex;gap:${iconSpacing}px;flex-wrap:wrap;justify-content:${flexJustify(alignment)}">${icons}</div></div>`;
}

const SHARE_PLATFORMS_R = [
  { key: "facebook",  label: "Facebook",  brand: "#1877F2", icon: "f" },
  { key: "twitter",   label: "Twitter",   brand: "#000000", icon: "𝕏" },
  { key: "whatsapp",  label: "WhatsApp",  brand: "#25D366", icon: "W" },
  { key: "pinterest", label: "Pinterest", brand: "#E60023", icon: "P" },
  { key: "email",     label: "Email",     brand: "#6b7280", icon: "✉" },
  { key: "copy",      label: "Copy Link", brand: "#374151", icon: "🔗" },
];

function renderShareButtons(p: Props): string {
  const m = p.advMargin as any ?? {};
  const pad = p.advPadding as any ?? {};
  const mt = m.top ?? 0, mr = m.right ?? 0, mb = m.bottom ?? 0, ml = m.left ?? 0;
  const pt = pad.top ?? 8, pr = pad.right ?? 0, pb = pad.bottom ?? 8, pl = pad.left ?? 0;
  const outerSpacing = `margin:${mt}px ${mr}px ${mb}px ${ml}px;padding:${pt}px ${pr}px ${pb}px ${pl}px;`;
  const cssId = esc((p.cssId as string) || "") || `share-blk`;
  const cssClass = esc((p.cssClass as string) || "");
  const zIndex = p.zIndex != null ? `z-index:${p.zIndex};` : "";
  const classAttr = cssClass;
  const bgColorStyle = (p.advBgType as string) === "color" && p.advBgColor ? `background-color:${esc(p.advBgColor as string)};` : "";
  const hoverBg = (p.hoverBg as string) || "";
  const hoverCss = hoverBg
    ? `<style>#${cssId} .puck-share-btn:hover{background:${hoverBg}!important;transition:background 0.2s;}#${cssId} .puck-share-btn{transition:background 0.2s;}</style>`
    : "";

  const enabled = (p.enabled as string[]) ?? ["facebook", "twitter", "whatsapp", "email", "copy"];
  const labels = (p.labels as Record<string, string>) ?? {};
  const showLabel = p.showLabel !== false;
  const btnStyle = (p.btnStyle as string) || "icon-text";
  const btnSize = (p.btnSize as string) || "medium";
  const borderRadius = `${p.borderRadius != null ? Number(p.borderRadius) : 6}px`;
  const spacing2 = `${Number(p.spacing) || 8}px`;
  const iconColor = (p.iconColor as string) || "";
  const textColor = (p.textColor as string) || "";
  const bgColor = (p.bgColor as string) || "";
  const useBrandColors = !!p.useBrandColors;
  const fontSize = `${Number(p.fontSize) || 14}px`;
  const fontWeight = p.fontWeight || "600";
  const alignment = (p.alignment as string) || "left";
  const sizeMap: Record<string, string> = { small: "8px 12px", medium: "10px 16px", large: "12px 20px" };
  const btnPad = sizeMap[btnSize] ?? sizeMap.medium;

  const platforms = SHARE_PLATFORMS_R.filter(pl => enabled.includes(pl.key));
  const shareUrlMap: Record<string, string> = {
    facebook:  "https://www.facebook.com/sharer/sharer.php?u=",
    twitter:   "https://twitter.com/intent/tweet?url=",
    whatsapp:  "https://wa.me/?text=",
    pinterest: "https://pinterest.com/pin/create/button/?url=",
    email:     "mailto:?body=",
  };

  const btnBaseStyle = `display:inline-flex;align-items:center;gap:6px;padding:${btnPad};font-size:${fontSize};font-weight:${fontWeight};border-radius:${borderRadius};cursor:pointer;`;
  const btns = platforms.map(pl => {
    const resolvedBg   = useBrandColors ? pl.brand : (bgColor || "#f3f4f6");
    const resolvedText = useBrandColors ? "#fff"    : (textColor || "var(--text-color,#111)");
    const resolvedIcon = useBrandColors ? "#fff"    : (iconColor || "var(--text-color,#111)");
    const btnLabel = labels[pl.key] ?? pl.label;
    const iconHtml  = btnStyle !== "text-only"                       ? `<span style="color:${resolvedIcon};font-weight:700">${pl.icon}</span>` : "";
    const labelHtml = btnStyle !== "icon-only" && showLabel          ? `<span>${btnLabel}</span>` : "";
    const btnContent = `${iconHtml}${iconHtml && labelHtml ? " " : ""}${labelHtml}`;
    const colorStyle = `color:${resolvedText};background:${resolvedBg};`;
    if (pl.key === "copy") {
      return `<button class="puck-share-btn" onclick="(function(b){var t=b.innerHTML;navigator.clipboard&&navigator.clipboard.writeText(window.location.href).then(function(){b.innerHTML='Copied!';setTimeout(function(){b.innerHTML=t},2000)})})(this)" style="${btnBaseStyle}${colorStyle}border:none;">${btnContent}</button>`;
    }
    const shareBase = shareUrlMap[pl.key] ?? "#";
    return `<a class="puck-share-btn" href="${shareBase}%7BURL%7D" onclick="event.preventDefault();window.open('${shareBase}'+encodeURIComponent(window.location.href),'_blank','noopener,noreferrer')" style="${btnBaseStyle}${colorStyle}text-decoration:none;">${btnContent}</a>`;
  }).join("");

  return `${hoverCss}<div id="${cssId}"${classAttr ? ` class="${classAttr}"` : ""} style="${outerSpacing}${zIndex}${bgColorStyle}"><div style="display:flex;gap:${spacing2};flex-wrap:wrap;justify-content:${flexJustify(alignment)}">${btns}</div></div>`;
}

function renderStarRating(p: Props): string {
  const spacing = advSpacing(p);
  const val = Math.min((p.ratingValue as number) ?? 4, 5);
  const starSize = esc((p.starSize as string) || "24px");
  const filledColor = esc((p.filledColor as string) || "#f59e0b");
  const emptyColor = esc((p.emptyColor as string) || "#d1d5db");
  const starGap = esc((p.starGap as string) || "4px");
  const showNumber = p.showNumber !== false;
  const numPos = (p.numberPosition as string) || "after";
  const reviewCount = Number(p.reviewCount ?? 0);
  const numFontSize = esc((p.numFontSize as string) || "1rem");
  const numFontWeight = p.numFontWeight || "700";
  const numColor = esc((p.numColor as string) || "var(--text-color)");
  const alignment = (p.alignment as string) || "left";

  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < Math.floor(val);
    const partial = !filled && i < val;
    const pct = partial ? Math.round((val - Math.floor(val)) * 100) : 0;
    const gradId = `sg${i}`;
    if (partial) {
      return `<svg width="${starSize}" height="${starSize}" viewBox="0 0 24 24" style="flex-shrink:0"><defs><linearGradient id="${gradId}"><stop offset="${pct}%" stop-color="${filledColor}"/><stop offset="${pct}%" stop-color="${emptyColor}"/></linearGradient></defs><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#${gradId})"/></svg>`;
    }
    return `<svg width="${starSize}" height="${starSize}" viewBox="0 0 24 24" style="flex-shrink:0"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="${filled ? filledColor : emptyColor}"/></svg>`;
  }).join("");

  const numEl = showNumber ? `<span style="font-size:${numFontSize};font-weight:${numFontWeight};color:${numColor};white-space:nowrap">${val.toFixed(1)}${reviewCount ? ` (${reviewCount} reviews)` : ""}</span>` : "";
  const inner = numPos === "before" ? `${numEl}${stars}` : `${stars}${numEl}`;

  return `<div style="${spacing}text-align:${alignment};${advBgStyle(p)}"><div style="display:inline-flex;align-items:center;gap:${starGap};flex-wrap:wrap;justify-content:${flexJustify(alignment)}">${inner}</div></div>`;
}

function renderProgressBar(p: Props): string {
  const spacing = advSpacing(p);
  const pbType   = (p.pbType as string) || "line";
  const label    = esc((p.label as string) || "");
  const pct      = Math.min(100, Math.max(0, (p.value as number) ?? 75));
  const showPct  = p.showPercentage !== false;
  const fillStyle = (p.fillStyle as string) || "solid";
  const fc       = esc((p.fillColor as string)  || "#0158ad");
  const tc       = esc((p.trackColor as string) || "#e5e7eb");
  const gradEnd  = esc((p.gradientEnd as string) || "#60a5fa");
  const lineH    = Number(p.lineHeight ?? 12);
  const lineR    = Number(p.lineRadius  ?? 6);
  const lfs      = Number(p.labelFontSize  ?? 14);
  const lc       = esc((p.labelColor  as string) || "var(--text-color)");
  const pfs      = Number(p.pctFontSize ?? 13);
  const pc       = esc((p.pctColor as string) || "var(--text-color)");
  const alignment = (p.alignment as string) || "left";
  const alignCss  = alignment === "center" ? "text-align:center;" : alignment === "right" ? "text-align:right;" : "";

  // fill background CSS value
  let fillBg: string;
  if (fillStyle === "gradient") {
    fillBg = `linear-gradient(90deg,${fc},${gradEnd})`;
  } else if (fillStyle === "striped") {
    fillBg = fc;
  } else {
    fillBg = fc;
  }
  const stripedOverlay = fillStyle === "striped"
    ? `;background-image:repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(255,255,255,0.2) 8px,rgba(255,255,255,0.2) 16px)`
    : "";

  const animFill = (p.animation as string) === "fill";
  // Pure-CSS animation: Shopify strips <script> from page.content, so JS-driven
  // fills never run on the storefront. CSS @keyframes survive sanitization and,
  // critically, the bar ENDS at the target value even if the animation is
  // skipped/unsupported (the keyframe's 100% state holds). Each bar gets a
  // unique animation name so concurrent bars don't collide.
  const uid = `pbq-${Math.abs(String(p.id ?? "").split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0)).toString(36)}`;
  const keyframes: string[] = [];
  let animSeq = 0;

  // ── line helper ──────────────────────────────────────────────────────────────
  // Heights are set in explicit px (not height:100%) and reinforced with
  // min-height + a guard class so Shopify themes that reset `height:auto` on
  // divs can't collapse the bar to invisibility.
  const buildLine = (rowLabel: string, rowPct: number, mb = 0): string => {
    const headerLabel = rowLabel ? `<span style="font-size:${lfs}px;color:${lc};display:inline-block;flex:1">${esc(rowLabel)}</span>` : "";
    const headerPct   = showPct   ? `<span style="font-size:${pfs}px;color:${pc};font-weight:600;display:inline-block;flex-shrink:0">${rowPct}%</span>` : "";
    const header = (rowLabel || showPct)
      ? `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:8px;line-height:1.4">${headerLabel}${headerPct}</div>`
      : "";
    let fillExtra = `width:${rowPct}%;`;
    if (animFill) {
      const an = `${uid}-l${animSeq++}`;
      keyframes.push(`@keyframes ${an}{from{width:0%}to{width:${rowPct}%}}`);
      // animation holds the 100% (target) state via forwards + the static width fallback above
      fillExtra = `width:${rowPct}%;animation:${an} 900ms ease forwards;`;
    }
    const fillDiv = `<div class="pb-bar-fill" style="display:block;height:${lineH}px;min-height:${lineH}px;${fillExtra}max-width:100%;background:${fillBg}${stripedOverlay};border-radius:${lineR}px;box-sizing:border-box"></div>`;
    const track   = `<div class="pb-bar-track" style="display:block;position:relative;height:${lineH}px;min-height:${lineH}px;width:100%;background:${tc};border-radius:${lineR}px;overflow:hidden;box-sizing:border-box;line-height:0;font-size:0">${fillDiv}</div>`;
    const mbStyle = mb ? `margin-bottom:${mb}px;` : "";
    return `<div style="${mbStyle}display:block">${header}${track}</div>`;
  };

  // ── circle SVG helper ────────────────────────────────────────────────────────
  const buildCircleSvg = (sz: number, thick: number, disp: number): string => {
    const r    = (sz - thick) / 2;
    const cx   = sz / 2;
    const cy   = sz / 2;
    const circ = 2 * Math.PI * r;
    const dash = (disp / 100) * circ;
    const rest = circ - dash;
    let styleAttr = "";
    if (animFill) {
      const an = `${uid}-c${animSeq++}`;
      keyframes.push(`@keyframes ${an}{from{stroke-dasharray:0 ${circ}}to{stroke-dasharray:${dash} ${rest}}}`);
      styleAttr = ` style="animation:${an} 900ms ease forwards"`;
    }
    return `<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}" style="transform:rotate(-90deg)"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${tc}" stroke-width="${thick}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${fc}" stroke-width="${thick}" stroke-linecap="round" stroke-dasharray="${dash} ${rest}"${styleAttr}/></svg>`;
  };

  // ── semi-circle SVG helper (top half arc) ────────────────────────────────────
  const buildSemiCircleSvg = (sz: number, thick: number, disp: number): string => {
    const r = (sz - thick) / 2;
    const halfCirc = Math.PI * r;
    const dash = (disp / 100) * halfCirc;
    const halfH = sz / 2 + thick;
    const x1 = thick / 2, x2 = sz - thick / 2, cy = sz / 2;
    let styleAttr = "";
    if (animFill) {
      const an = `${uid}-s${animSeq++}`;
      keyframes.push(`@keyframes ${an}{from{stroke-dasharray:0 ${halfCirc}}to{stroke-dasharray:${dash} ${halfCirc}}}`);
      styleAttr = ` style="animation:${an} 900ms ease forwards"`;
    }
    return `<svg width="${sz}" height="${halfH}" viewBox="0 0 ${sz} ${halfH}" style="overflow:visible;display:block"><path d="M ${x1} ${cy} A ${r} ${r} 0 0 1 ${x2} ${cy}" fill="none" stroke="${tc}" stroke-width="${thick}" stroke-linecap="round"/><path d="M ${x1} ${cy} A ${r} ${r} 0 0 1 ${x2} ${cy}" fill="none" stroke="${fc}" stroke-width="${thick}" stroke-linecap="round" stroke-dasharray="${dash} ${halfCirc}"${styleAttr}/></svg>`;
  };

  // Structural class only — puck-hide-* are injected centrally by the dispatcher.
  const cssClass = p.cssClass ? String(p.cssClass) : "";
  const classAttr = cssClass ? ` class="${cssClass}"` : "";

  // Every type shares this outer wrapper. Keyframes are collected while building
  // `inner`, so emit the <style> here (after inner is built) to drive the CSS
  // fill-on-load animation without any JS.
  const wrap = (inner: string) =>
    `${keyframes.length ? `<style>${keyframes.join("")}</style>` : ""}<div${classAttr} style="display:block;box-sizing:border-box;width:100%;${spacing}${alignCss}${advBgStyle(p)}">${inner}</div>`;

  // ── type: line ───────────────────────────────────────────────────────────────
  if (pbType === "line") {
    return wrap(buildLine(label, pct));
  }

  // ── type: circle ─────────────────────────────────────────────────────────────
  if (pbType === "circle") {
    const sz    = Number(p.circleSize ?? 120);
    const thick = Number(p.ringThickness ?? 10);
    const showInside = p.showLabelInside !== false;
    const pctHtml   = showPct && showInside ? `<span style="font-size:${pfs}px;color:${pc};font-weight:700;line-height:1;display:block">${pct}%</span>` : "";
    const lblHtml   = label && showInside ? `<span style="font-size:${Math.round(lfs * 0.78)}px;color:${lc};line-height:1;display:block">${label}</span>` : "";
    const inner     = showInside ? `<div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px">${pctHtml}${lblHtml}</div>` : "";
    const below     = !showInside && label ? `<span style="font-size:${lfs}px;color:${lc};display:block">${label}</span>` : "";
    return wrap(`<div style="display:inline-flex;flex-direction:column;align-items:center;gap:6px"><div style="position:relative;width:${sz}px;height:${sz}px;display:block;line-height:0;font-size:0">${buildCircleSvg(sz, thick, pct)}${inner}</div>${below}</div>`);
  }

  // ── type: semicircle ─────────────────────────────────────────────────────────
  if (pbType === "semicircle") {
    const sz    = Number(p.circleSize ?? 160);
    const thick = Number(p.ringThickness ?? 14);
    const halfH = sz / 2 + thick;
    const showInside = p.showLabelInside !== false;
    const pctHtml = showPct && showInside ? `<span style="font-size:${pfs}px;color:${pc};font-weight:700;line-height:1.2;display:block">${pct}%</span>` : "";
    const lblHtml = label && showInside ? `<span style="font-size:${Math.round(lfs * 0.8)}px;color:${lc};margin-top:2px;display:block">${label}</span>` : "";
    const inside  = showInside ? `<div style="position:absolute;bottom:0;left:0;right:0;display:flex;flex-direction:column;align-items:center;padding-bottom:4px">${pctHtml}${lblHtml}</div>` : "";
    const below   = !showInside && label ? `<span style="font-size:${lfs}px;color:${lc};display:block">${label}</span>` : "";
    return wrap(`<div style="display:inline-flex;flex-direction:column;align-items:center;gap:4px"><div style="position:relative;width:${sz}px;height:${halfH}px;display:block">${buildSemiCircleSvg(sz, thick, pct)}${inside}</div>${below}</div>`);
  }

  // ── type: step ───────────────────────────────────────────────────────────────
  if (pbType === "step") {
    const total    = Math.max(1, Number(p.totalSteps ?? 5));
    const active   = Math.min(total, Math.max(0, Number(p.activeStep ?? 3)));
    const showNums = !!p.showStepNumbers;
    const labelHtml = label ? `<div style="font-size:${lfs}px;color:${lc};margin-bottom:8px;display:block">${label}</div>` : "";
    const steps = Array.from({ length: total }, (_, i) => {
      const on = i < active;
      const numHtml = showNums ? `<span style="font-size:${Math.max(9, lineH - 3)}px;color:${on ? "#fff" : lc}">${i + 1}</span>` : "";
      let animExtra = "";
      if (animFill && on) {
        const an = `${uid}-st${animSeq++}`;
        keyframes.push(`@keyframes ${an}{from{background-color:${tc}}to{background-color:${fc}}}`);
        animExtra = `animation:${an} 400ms ease ${i * 100}ms forwards;`;
      }
      return `<div style="flex:1;height:${lineH}px;min-height:${lineH}px;border-radius:${lineR}px;background:${on ? fc : tc};display:flex;align-items:center;justify-content:center;box-sizing:border-box;${animExtra}">${numHtml}</div>`;
    }).join("");
    const pctHtml = showPct ? `<div style="font-size:${pfs}px;color:${pc};margin-top:6px;display:block">${Math.round((active / total) * 100)}%</div>` : "";
    return wrap(`${labelHtml}<div style="display:flex;gap:6px;align-items:stretch">${steps}</div>${pctHtml}`);
  }

  // ── type: multirow ───────────────────────────────────────────────────────────
  if (pbType === "multirow") {
    const rows: Array<{ label: string; value: number }> = (p.multiRows as Array<{ label: string; value: number }>) ?? [{ label: "Row 1", value: 60 }];
    const rowsHtml = rows.map((row, i) => buildLine(row.label, Math.min(100, Math.max(0, row.value)), i < rows.length - 1 ? 12 : 0)).join("");
    return wrap(rowsHtml);
  }

  // fallback → line
  return wrap(buildLine(label, pct));
}

function renderAlert(p: Props): string {
  const spacing = advSpacing(p);
  const alertType = (p.alertType as string) || "info";
  const typeMap: Record<string, { bg: string; text: string; border: string; icon: string }> = {
    info:    { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe", icon: "ℹ️" },
    success: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", icon: "✅" },
    warning: { bg: "#fffbeb", text: "#92400e", border: "#fde68a", icon: "⚠️" },
    error:   { bg: "#fef2f2", text: "#991b1b", border: "#fecaca", icon: "❌" },
    custom:  { bg: "#f9fafb", text: "#111827", border: "#e5e7eb", icon: "🔔" },
  };
  const t = typeMap[alertType] ?? typeMap.info;
  const isCustomType = alertType === "custom";
  const resolvedBg = esc(isCustomType && (p.bgColor as string) ? (p.bgColor as string) : t.bg);
  const resolvedText = esc(isCustomType && (p.textColor as string) ? (p.textColor as string) : t.text);
  const resolvedBorder = esc(isCustomType && (p.borderColor as string) ? (p.borderColor as string) : t.border);
  const rawIcon = (p.customIcon as string) || "";
  const isImgIcon = rawIcon && (rawIcon.startsWith("http") || rawIcon.startsWith("/") || rawIcon.startsWith("data:"));
  const resolvedIcon = isImgIcon ? "" : esc(rawIcon || t.icon);
  const showIcon = p.showIcon !== false;
  const alertTitle = esc((p.alertTitle as string) || "");
  const message = esc((p.message as string) || "");
  const borderStyle = (p.borderStyle as string) || "solid";
  const borderWidth = Number(p.borderWidth ?? 1);
  const borderRadius = Number(p.borderRadius ?? 8);
  const titleFontSize = `${Number(p.titleFontSize) || 16}px`;
  const titleFontWeight = p.titleFontWeight || "700";
  const msgFontSize = `${Number(p.msgFontSize) || 14}px`;
  const lineHeight = Number(p.lineHeight) ? Number(p.lineHeight) / 10 : 1.5;
  const iconColor = esc(isCustomType && (p.iconColor as string) ? (p.iconColor as string) : resolvedText);

  let borderCss = "";
  if (borderStyle === "left-only") borderCss = `border-left:${borderWidth}px solid ${resolvedBorder};`;
  else if (borderStyle !== "none") borderCss = `border:${borderWidth}px solid ${resolvedBorder};`;

  const dismissible = p.dismissible === true || p.dismissible === "true";
  const uid = `alert-${Math.random().toString(36).slice(2, 9)}`;

  let iconHtml = "";
  if (showIcon) {
    iconHtml = isImgIcon
      ? `<img src="${rawIcon.replace(/"/g, "&quot;")}" alt="icon" class="no-global-style" style="width:1.5rem;height:1.5rem;object-fit:contain;flex-shrink:0;border-radius:0" />`
      : `<span style="font-size:1.25rem;color:${iconColor};flex-shrink:0;line-height:1.3">${resolvedIcon}</span>`;
  }
  const titleHtml = alertTitle ? `<div style="font-size:${titleFontSize};font-weight:${titleFontWeight};margin-bottom:4px">${alertTitle}</div>` : "";
  const msgHtml = `<div style="font-size:${msgFontSize}">${message}</div>`;
  const dismissBtn = dismissible
    ? `<button onclick="document.getElementById('${uid}').style.display='none'" style="background:none;border:none;cursor:pointer;color:${resolvedText};font-size:1.2rem;line-height:1;padding:0;opacity:0.6;flex-shrink:0">×</button>`
    : "";

  return `<div id="${uid}" style="${spacing}background:${resolvedBg};color:${resolvedText};border-radius:${borderRadius}px;line-height:${lineHeight};${borderCss}${advBgStyle(p)}"><div style="display:flex;align-items:flex-start;gap:12px">${iconHtml}<div style="flex:1">${titleHtml}${msgHtml}</div>${dismissBtn}</div></div>`;
}

function renderBlockQuote(p: Props): string {
  const spacing = advSpacing(p);
  const quoteText = esc((p.quoteText as string) || "");
  const authorName = esc((p.authorName as string) || "");
  const authorTitle = esc((p.authorTitle as string) || "");
  const authorImage = esc((p.authorImage as string) || "");
  const showQuoteIcon = p.showQuoteIcon !== false;
  const quoteFontSize = esc((p.quoteFontSize as string) || "1.25rem");
  const quoteFontFamily = (p.quoteFontFamily as string) !== "inherit" ? esc(p.quoteFontFamily as string) : "";
  const quoteFontStyle = esc((p.quoteFontStyle as string) || "italic");
  const quoteTextColor = esc((p.quoteTextColor as string) || "var(--text-color)");
  const quoteLineHeight = esc((p.quoteLineHeight as string) || "1.7");
  const nameColor = esc((p.nameColor as string) || "var(--text-color)");
  const nameFontSize = esc((p.nameFontSize as string) || "1rem");
  const nameFontWeight = p.nameFontWeight || "700";
  const titleColor = esc((p.titleColor as string) || "var(--text-color)");
  const titleFontSize = esc((p.titleFontSize as string) || "0.875rem");
  const imageSize = esc((p.imageSize as string) || "48px");
  const imageBorderRadius = esc((p.imageBorderRadius as string) || "50%");
  const iconColor = esc((p.iconColor as string) || "var(--primary-color)");
  const iconSize = esc((p.iconSize as string) || "3rem");
  const iconPosition = (p.iconPosition as string) || "top-left";
  const borderType = (p.borderType as string) || "left";
  const borderColor = esc((p.borderColor as string) || "var(--primary-color)");
  const borderWidth = p.borderWidth ?? 4;
  const bgColor = esc((p.bgColor as string) || "");
  const alignment = (p.alignment as string) || "left";

  // Advanced wrapper styles
  const advBgType = (p.advBgType as string) || "none";
  const advBgColorWrap = esc((p.advBgColorWrap as string) || "");
  const advBorderStyle = (p.advBorderStyle as string) || "none";
  const advBorderColor = esc((p.advBorderColor as string) || "currentColor");
  const advBorderWidth = p.advBorderWidth as { top?: number; right?: number; bottom?: number; left?: number } | undefined;
  const advBorderRadius = p.advBorderRadius as { top?: number; right?: number; bottom?: number; left?: number } | undefined;

  const wrapExtraStyle = [
    advBgType === "color" && advBgColorWrap ? `background-color:${advBgColorWrap};` : "",
    advBorderStyle !== "none" ? `border-style:${advBorderStyle};border-color:${advBorderColor};border-top-width:${advBorderWidth?.top ?? 0}px;border-right-width:${advBorderWidth?.right ?? 0}px;border-bottom-width:${advBorderWidth?.bottom ?? 0}px;border-left-width:${advBorderWidth?.left ?? 0}px;` : "",
    `border-top-left-radius:${advBorderRadius?.top ?? 0}px;border-top-right-radius:${advBorderRadius?.right ?? 0}px;border-bottom-right-radius:${advBorderRadius?.bottom ?? 0}px;border-bottom-left-radius:${advBorderRadius?.left ?? 0}px;`,
  ].join("");

  const borderMap: Record<string, string> = {
    none: "",
    left: `border-left:${borderWidth}px solid ${borderColor};padding-left:20px;`,
    top:  `border-top:${borderWidth}px solid ${borderColor};padding-top:20px;`,
    box:  `border:${borderWidth}px solid ${borderColor};padding:16px;`,
  };

  const quoteIconSvg = `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}" style="opacity:0.15"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>`;

  let iconHtml = "";
  if (showQuoteIcon) {
    const iconJustify = iconPosition === "top-right" ? "flex-end" : "flex-start";
    iconHtml = `<div style="display:flex;justify-content:${iconJustify};margin-bottom:8px">${quoteIconSvg}</div>`;
  }

  const quoteEl = `<p style="font-size:${quoteFontSize};${quoteFontFamily ? `font-family:${quoteFontFamily};` : ""}font-style:${quoteFontStyle};color:${quoteTextColor};line-height:${quoteLineHeight};margin:0 0 16px 0">&ldquo;${quoteText}&rdquo;</p>`;

  let authorEl = "";
  if (authorName || authorImage) {
    const imgEl = authorImage ? `<img src="${authorImage}" alt="${authorName}" class="no-global-style" style="width:${imageSize};height:${imageSize};border-radius:${imageBorderRadius};object-fit:cover;flex-shrink:0">` : "";
    const nameEl = authorName ? `<div style="font-size:${nameFontSize};font-weight:${nameFontWeight};color:${nameColor}">${authorName}</div>` : "";
    const titleEl = authorTitle ? `<div style="font-size:${titleFontSize};color:${titleColor};opacity:0.7">${authorTitle}</div>` : "";
    const aJustify = flexJustify(alignment);
    authorEl = `<div style="display:flex;align-items:center;gap:12px;justify-content:${aJustify}">${imgEl}<div>${nameEl}${titleEl}</div></div>`;
  }

  const bqStyle = `margin:0;position:relative;background:${bgColor || "transparent"};${bgColor ? "padding:24px;border-radius:8px;" : ""}${borderMap[borderType] || ""}`;

  return `<div style="${spacing}text-align:${alignment};${wrapExtraStyle}"><blockquote style="${bqStyle}">${iconHtml}${quoteEl}${authorEl}</blockquote></div>`;
}

// ─── Main render dispatcher ───────────────────────────────────────────────────

// ─── Responsive "hide on screen size" — single reusable implementation ─────────
//
// "Hide on Desktop/Tablet/Mobile" works by adding `puck-hide-desktop|tablet|mobile`
// classes to a block's OUTERMOST element. The matching `display:none` media queries
// live ONLY in RESPONSIVE_CSS (storefront + preview) and are DELIBERATELY ABSENT
// from the editor canvas (see app/styles/editor.css) — so blocks stay visible while
// editing but hide correctly on the storefront/preview at the chosen breakpoints.
//
// This logic is applied in ONE place — `applyHideClasses`, called by the dispatcher
// for every block — so individual render functions never deal with hiding. The
// helper injects the classes into the FIRST real element's `class` attribute
// (skipping any leading <style> tag that some blocks emit), which means no extra
// wrapper div is added and flex/grid/full-width layouts are never broken.

function hideClassList(p: Props): string {
  return [
    p.hideDesktop ? "puck-hide-desktop" : "",
    p.hideTablet  ? "puck-hide-tablet"  : "",
    p.hideMobile  ? "puck-hide-mobile"  : "",
  ].filter(Boolean).join(" ");
}

// Inject `extraClasses` into the first non-<style> element of `html`. If that element
// already has a class="…" attribute the classes are appended; otherwise a class
// attribute is added. Falls back to a wrapper div only if no element tag is found.
function injectClasses(html: string, extraClasses: string): string {
  if (!extraClasses) return html;

  // Skip any leading <style>…</style> blocks (e.g. Button/SocialIcons emit one first).
  let offset = 0;
  const stylePrefix = /^\s*<style[\s\S]*?<\/style>\s*/i;
  let m: RegExpMatchArray | null;
  while ((m = html.slice(offset).match(stylePrefix))) {
    offset += m[0].length;
  }

  // Find the first opening tag after the style prefix.
  const tagMatch = html.slice(offset).match(/<([a-zA-Z][\w-]*)\b([^>]*)>/);
  if (!tagMatch) return `<div class="${extraClasses}">${html}</div>`;

  const tagStart = offset + (tagMatch.index ?? 0);
  const [fullTag, , attrs] = tagMatch;
  const classAttr = attrs.match(/\sclass\s*=\s*"([^"]*)"/i);

  let newTag: string;
  if (classAttr) {
    // Append to the existing class attribute.
    const merged = `${classAttr[1]} ${extraClasses}`.trim();
    newTag = fullTag.replace(classAttr[0], ` class="${merged}"`);
  } else {
    // Add a class attribute right after the tag name.
    newTag = fullTag.replace(/^<([a-zA-Z][\w-]*)/, `<$1 class="${extraClasses}"`);
  }

  return html.slice(0, tagStart) + newTag + html.slice(tagStart + fullTag.length);
}

function applyHideClasses(html: string, p: Props): string {
  if (!html) return html;
  return injectClasses(html, hideClassList(p));
}

function renderBlock(block: Block, zones: Zones): string {
  const p = block.props ?? {};
  try {
    let html = "";
    switch (block.type) {
      case "TextBlock":        html = TextBlock(p); break;
      case "Text":             html = Text(p); break;
      case "HeadingBlock":     html = HeadingBlock(p); break;
      case "Space":            html = Space(p); break;
      case "Image":            html = Image(p); break;
      case "GridBlock":        html = renderGridBlock(p, zones); break;
      case "DoubleColumn":     html = DoubleColumn(p, zones); break;
      case "Accordian":        html = Accordian(p, zones); break;
      case "Article":          html = Article(p); break;
      case "CardBlock":        html = CardBlock(p); break;
      case "Button":           html = Button(p); break;
      case "MarqueeBar":       html = MarqueeBar(p); break;
      case "PhotoCollage":     html = PhotoCollage(p); break;
      case "FeaturedProduct":  html = FeaturedProduct(p); break;
      case "Divider":          html = renderDivider(p); break;
      case "Video":            html = renderVideo(p); break;
      case "BlockQuote":       html = renderBlockQuote(p); break;
      case "StarRating":       html = renderStarRating(p); break;
      case "ProgressBar":      html = renderProgressBar(p); break;
      case "Alert":            html = renderAlert(p); break;
      case "SocialIcons":      html = renderSocialIcons(p); break;
      case "ShareButtons":     html = renderShareButtons(p); break;
      case "LayoutBlock":      html = renderLayoutBlock(p, zones); break;
      case "Section":          html = renderSectionBlock(p, zones); break;
      case "Section_Hero":     html = renderSectionHero(p); break;
      case "Section_About":    html = renderSectionAbout(p); break;
      case "Section_CTA":      html = renderSectionCTA(p); break;
      case "Section_Countdown": html = renderSectionCountdown(p); break;
      case "Section_Newsletter": html = renderSectionNewsletter(p); break;
      case "Section_Form":     html = renderSectionForm(p); break;
      case "Section_Video":    html = renderSectionVideo(p); break;
      case "Section_Services": html = renderSectionCards(p, "services"); break;
      case "Section_Features": html = renderSectionCards(p, "features"); break;
      case "Section_Team":     html = renderSectionCards(p, "team"); break;
      case "Section_Pricing":  html = renderSectionCards(p, "pricing"); break;
      case "Section_Testimonial":   html = renderSectionTestimonial(p); break;
      case "Section_FAQ":           html = renderSectionFAQ(p); break;
      case "Section_Gallery":       html = renderSectionGallery(p); break;
      case "Section_Carousel":      html = renderSectionCarousel(p); break;
      case "Section_MediaCarousel": html = renderSectionMediaCarousel(p); break;
      // GlobalHeader/Footer are theme concerns; GlobalBlock needs DB lookup (skip)
      default: return "";
    }
    // Single, reusable hide-on-screen-size handling for EVERY block/section:
    // inject puck-hide-* into the outermost element (no per-block code needed).
    html = applyHideClasses(html, p);
    // Responsive spacing: inject per-breakpoint margin/padding class + style tag.
    const { style: rsStyle, className: rsClass } = responsiveSpacingStyle(p, (block.props?.id as string) || block.type);
    if (rsClass) html = rsStyle + injectClasses(html, rsClass);
    return html;
  } catch {
    return "";
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Convert PuckData JSON to a complete HTML string suitable for a Shopify page body.
 * The output is written to page.body via pageUpdate and rendered by
 * {{ page.content }} in any Shopify theme template — no theme modification needed.
 */
// Responsive CSS injected once per page — targets class names added to each section's grid
// container. Uses !important so it overrides the inline styles written by each render function.
const PB_ANIM_SCRIPT = `<script data-pb="anim">(function(){
  function fire(el){
    var t=el.getAttribute('data-pb-anim');
    if(t==='line'){
      el.style.width=el.getAttribute('data-pb-target')+'%';
    } else if(t==='circle'||t==='semicircle'){
      var circ=parseFloat(el.getAttribute('data-pb-circ'));
      var pct=parseFloat(el.getAttribute('data-pb-target'));
      var dash=(pct/100)*circ;
      el.setAttribute('stroke-dasharray',dash+' '+circ);
    } else if(t==='step'){
      var on=parseInt(el.getAttribute('data-pb-step-on'),10);
      var i=parseInt(el.getAttribute('data-pb-step-i'),10);
      el.style.backgroundColor=i<on?el.getAttribute('data-pb-fc'):el.getAttribute('data-pb-tc');
    }
  }
  function getAnchor(el){
    // walk up to a sizeable ancestor so IntersectionObserver has an area to measure
    return el.parentElement||el;
  }
  var seen=new WeakSet();
  if('IntersectionObserver' in window){
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting)return;
        obs.unobserve(e.target);
        var fills=e.target.querySelectorAll?e.target.querySelectorAll('[data-pb-anim]'):[e.target];
        if(!fills.length&&e.target.hasAttribute('data-pb-anim'))fills=[e.target];
        setTimeout(function(){fills.forEach(fire);},100);
      });
    },{threshold:0.1});
    document.querySelectorAll('[data-pb-anim]').forEach(function(el){
      var anchor=getAnchor(el);
      if(!seen.has(anchor)){seen.add(anchor);obs.observe(anchor);}
    });
  } else {
    setTimeout(function(){document.querySelectorAll('[data-pb-anim]').forEach(fire);},100);
  }
}());<\/script>`;

const RESPONSIVE_CSS = `<style data-pb="responsive">
*{box-sizing:border-box}
img{max-width:100%;height:auto}
.pb-sec-inner{padding-left:clamp(16px,4vw,24px)!important;padding-right:clamp(16px,4vw,24px)!important}
.pb-collage-wrap{box-sizing:border-box}
.pb-collage-wrap *{box-sizing:border-box}
.pb-collage-item{position:relative!important;margin:0!important;padding:0!important}
.pb-collage-item img{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;box-shadow:none!important}
.pb-bar-track{display:block!important;overflow:hidden!important;box-sizing:border-box!important}
.pb-bar-fill{display:block!important;box-sizing:border-box!important}
.pb-countdown-box{flex:1 1 60px!important}
@media(max-width:767px){
.pb-grid-2col{grid-template-columns:1fr!important;gap:24px!important}
.pb-sec-about-grid{grid-template-columns:1fr!important;gap:24px!important}
.pb-about-img-bottom .pb-about-img{order:2!important}
.pb-about-img-bottom .pb-about-text{order:1!important}
.pb-sec-cards{grid-template-columns:1fr!important;gap:16px!important}
.pb-sec-gallery{grid-template-columns:repeat(2,1fr)!important}
.pb-grid-ncol{grid-template-columns:1fr!important}
.pb-grid-stats{grid-template-columns:repeat(2,1fr)!important;gap:12px!important}
.pb-collage-wrap{grid-template-columns:repeat(2,1fr)!important;grid-template-rows:auto!important}
.pb-collage-wrap>*{grid-column:auto!important;grid-row:auto!important}
.pb-hero{padding:40px 16px!important}
.pb-hero-grid{grid-template-columns:1fr!important;gap:32px!important}
.pb-header-nav{display:none!important}
.puck-hide-mobile{display:none!important}
}
@media(min-width:768px) and (max-width:1023px){
.pb-grid-ncol{grid-template-columns:repeat(2,1fr)!important}
.pb-sec-cards{grid-template-columns:repeat(2,1fr)!important}
.pb-sec-gallery{grid-template-columns:repeat(2,1fr)!important}
.pb-sec-about-grid{grid-template-columns:1fr!important;gap:32px!important}
.puck-hide-tablet{display:none!important}
}
@media(min-width:1024px){
.puck-hide-desktop{display:none!important}
}
</style>`;

export function renderPuckToHtml(data: PuckData): string {
  const zones = (data.zones ?? {}) as Zones;
  const content = (data.content ?? []) as Block[];

  const above = (zones["root:above-header"] ?? zones["above-header"] ?? []) as Block[];
  const below = (zones["root:below-footer"] ?? zones["below-footer"] ?? []) as Block[];

  const blocks = [
    ...above.map((b) => renderBlock(b, zones)),
    ...content.map((b) => renderBlock(b, zones)),
    ...below.map((b) => renderBlock(b, zones)),
  ];
  const html = blocks.join("\n");
  const needsAnim = html.includes('data-pb-anim=');
  return [RESPONSIVE_CSS, html, needsAnim ? PB_ANIM_SCRIPT : ""].join("\n");
}

/**
 * Renders ONLY the page's block markup — no chrome, no shared CSS, no scripts.
 *
 * Chrome (global header/footer, hide-theme-header rules) and shared styles
 * (page-title-hide, etc.) are delivered site-wide by the Page Builder theme
 * app embed (`extensions/page-builder-renderer/blocks/global-chrome.liquid`).
 * That embed reads the same `shop.metafields.page_builder.global_chrome`
 * value we write in `saveShopChromeMetafield`, so toggling a global setting
 * updates every page on the next request — no re-publish needed.
 *
 * Keeping chrome out of page.body shrinks pages by 150–400 KB and avoids
 * the 512 KB Shopify page-body limit. The `settings` parameter is retained
 * for API stability and to give future callers room to render
 * settings-dependent block markup.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function renderPageWithChrome(
  data: PuckData,
  settings: GlobalSettings,
): string {
  // Block-level font choices (e.g. an Article title set to Poppins) aren't part
  // of the global theme fonts, so emit a Google Fonts @import covering them.
  // Wrapped in a <style> so it's valid inside the page body. Global fonts are
  // already delivered by the theme app embed / chrome bundle.
  const blockFonts = collectBlockFonts(data);
  const fontsCss = blockFonts.length ? `<style>${buildGoogleFontsImport(blockFonts)}</style>` : "";
  return (
    fontsCss +
    buildGlobalImageCss(settings) +
    buildGlobalButtonCss(settings) +
    renderPuckToHtml(data)
  );
}

/**
 * Self-contained HTML for the in-app preview tab (View button).
 *
 * Differs from renderPageWithChrome in two ways, because the preview opens as a
 * standalone document with no Shopify theme around it:
 *   1. The global header/footer are rendered inline (in normal flow — no fixed
 *      positioning or hide-theme logic, which only make sense on a live theme)
 *      so the preview resembles the published page. Both are always shown,
 *      mirroring the editor canvas (root render in puck.config). The
 *      useCustomHeader / useCustomFooter toggles only govern injection into the
 *      live Shopify theme, so they deliberately don't gate the preview.
 *   2. The caller is expected to have already resolved GlobalBlock / SavedBlock
 *      references via resolvePageBlocks(), so all content renders.
 */
export function renderPreviewBody(
  data: PuckData,
  settings: GlobalSettings,
): string {
  const header = GlobalHeader(settingsHeaderProps(settings.header));
  const footer = GlobalFooter(settingsFooterProps(settings.footer));

  // On a live storefront, Shopify's theme wraps {{ page.content }} in its own
  // page-width container so every block shares the same bounds. The preview is a
  // bare document with no theme, so we recreate that shared container here —
  // otherwise blocks spill to the full browser width inconsistently. Header and
  // footer stay full-width (they manage their own inner max-width).
  const containerWidth = settings.containerWidth ?? "1200px";
  const content =
    `<div class="pb-preview-container" style="max-width:${esc(containerWidth)};margin:0 auto;width:100%;padding-left:20px;padding-right:20px;box-sizing:border-box">` +
    renderPuckToHtml(data) +
    `</div>`;

  return (
    buildGlobalImageCss(settings) +
    buildGlobalButtonCss(settings) +
    header +
    content +
    footer
  );
}

/**
 * Generates a <style> block for global button hover + shadow settings.
 * Targets only .pb-btn elements — UI controls (carousel arrows, dots, etc.)
 * carry no-global-style so they are never affected.
 */
function buildGlobalButtonCss(settings: GlobalSettings): string {
  const pc  = settings.primaryColor ?? "#0158ad";
  const bhe = settings.buttonHoverEffect ?? "none";
  const bsd = settings.buttonShadow ?? "none";

  const rules: string[] = [
    `.pb-btn{transition:background-color .3s ease-out,color .3s ease-out,border-color .3s ease-out,transform .3s ease-out,box-shadow .3s ease-out,filter .3s ease-out!important}`,
    `.pb-btn.pb-btn-outline{border-style:solid!important;border-color:currentColor!important;border-width:var(--button-border-width,2px)!important}`,
  ];

  const hoverDecl: Record<string, string> = {
    lift:  "transform:translateY(-2px)!important;box-shadow:0 6px 20px rgba(0,0,0,.15)!important",
    glow:  `box-shadow:0 0 18px ${esc(pc)}44!important`,
    scale: "transform:scale(1.07)!important",
    fill:  "filter:brightness(.85) saturate(1.1)!important",
  };
  if (bhe !== "none" && hoverDecl[bhe]) {
    rules.push(`.pb-btn:hover{${hoverDecl[bhe]}}`);
  }

  const shadowDecl: Record<string, string> = {
    sm:      "0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06)",
    md:      "0 4px 12px rgba(0,0,0,.15),0 2px 4px rgba(0,0,0,.1)",
    colored: `0 4px 16px ${esc(pc)}66`,
  };
  if (bsd !== "none" && shadowDecl[bsd]) {
    rules.push(`.pb-btn{box-shadow:${shadowDecl[bsd]}}`);
  }

  if (rules.length === 1 && bhe === "none" && bsd === "none") return "";
  return `<style data-pb="button-settings">${rules.join("")}</style>\n`;
}

/**
 * Generates a <style> block that applies the global image settings
 * (border-radius, object-fit, hover effect) to all images in the page.
 * Uses !important to override any hardcoded inline styles on individual images.
 */
function buildGlobalImageCss(settings: GlobalSettings): string {
  const ibr = settings.imageBorderRadius ?? "8px";
  const iof = settings.imageObjectFit ?? "cover";
  const ihe = settings.imageHoverEffect ?? "none";

  const rules: string[] = [
    `img:not(.no-global-style){border-radius:${esc(ibr)}!important;object-fit:${esc(iof)}!important}`,
  ];

  const hoverDecl: Record<string, string> = {
    zoom: "transform:scale(1.05)",
    dim:  "opacity:0.82",
    lift: "transform:translateY(-4px);box-shadow:0 12px 28px rgba(0,0,0,.18)",
  };

  if (ihe !== "none" && hoverDecl[ihe]) {
    rules.push(
      `img:not(.no-global-style){transition:transform .3s ease,opacity .3s ease,box-shadow .3s ease}`,
      `img:not(.no-global-style):hover{${hoverDecl[ihe]}}`,
    );
  }

  return `<style data-pb="image-settings">${rules.join("")}</style>\n`;
}

/**
 * Render the global header/footer chrome bundle: hide-theme CSS + positioning
 * CSS + dedup script + header HTML + footer HTML.
 *
 * Used in two places:
 *   • Builder page bodies — injected into {{ page.content }} via renderPageWithChrome
 *   • Theme app embed block — written to a shop metafield and emitted site-wide
 *
 * The bundled script removes duplicate elements (in case both injectors are
 * active on the same page) and moves the surviving header/footer to <body>
 * root so CSS positioning escapes the theme's <main> wrapper.
 *
 * Returns "" when neither toggle is enabled.
 */
export function renderChromeBundle(settings: GlobalSettings): string {
  const useHeader = !!settings.useCustomHeader;
  const useFooter = !!settings.useCustomFooter;

  // Global button + image settings CSS is ALWAYS included in the chrome bundle
  // so the theme embed delivers it to every Shopify page the moment settings
  // change — without needing to republish individual pages.
  const globalSettingsCss =
    buildGlobalButtonCss(settings) +
    buildGlobalImageCss(settings);

  if (!useHeader && !useFooter) return globalSettingsCss;

  const headerHtml = useHeader ? GlobalHeader(settingsHeaderProps(settings.header)) : "";
  const footerHtml = useFooter ? GlobalFooter(settingsFooterProps(settings.footer)) : "";

  // Build `:not(...)` scoped selector strings, used in both CSS and JS.
  // The `:not()` guards prevent us from accidentally hiding our own elements
  // when the base selector (e.g. `footer`) would match them too.
  const headerHideSelectors = useHeader && settings.hideThemeHeaderSelectors
    ? settings.hideThemeHeaderSelectors
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .join(",")
    : "";

  const footerHideSelectors = useFooter && settings.hideThemeFooterSelectors
    ? settings.hideThemeFooterSelectors
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .join(",")
    : "";

  const hideRules: string[] = [];
  if (headerHideSelectors) {
    const css = headerHideSelectors.split(",")
      .map((s) => `${s}:not(.pb-global-header)`)
      .join(",");
    hideRules.push(`${css}{display:none!important}`);
  }
  if (footerHideSelectors) {
    const css = footerHideSelectors.split(",")
      .map((s) => `${s}:not(.pb-global-footer)`)
      .join(",");
    hideRules.push(`${css}{display:none!important}`);
  }

  const chromeRules: string[] = [];
  if (useHeader) {
    chromeRules.push(
      `.pb-global-header{display:flex!important;position:fixed!important;top:0!important;left:0!important;right:0!important;width:100%!important;max-width:100%!important;z-index:99999!important;box-sizing:border-box!important}`,
    );
  }
  if (useFooter) {
    chromeRules.push(
      `.pb-global-footer{display:block!important;width:100%!important;box-sizing:border-box!important}`,
    );
  }

  const allCss = [...hideRules, ...chromeRules].join("");
  const styleBlock = `<style data-page-builder="chrome">${allCss}</style>`;

  // JS approach is more reliable than CSS alone: some Shopify themes use
  // element structures (custom classes, shadow wrappers, or !important) that
  // CSS selectors can't always override at cascade time. Running the same
  // hide logic in JS at DOMContentLoaded guarantees the result regardless of
  // theme CSS specificity or naming conventions.
  //
  // The script is also safe to run twice (once from page body, once from app
  // embed): deduplication keeps only the first chrome element found.
  const jsHeaderSel = JSON.stringify(headerHideSelectors);
  const jsFooterSel = JSON.stringify(footerHideSelectors);

  const doH = useHeader ? "1" : "0";
  const doF = useFooter ? "1" : "0";

  // The script needs to be resilient to:
  // - Themes that hide our element via theme JS (we re-show)
  // - Themes that render the footer after DOMContentLoaded (MutationObserver)
  // - Themes that use non-standard class/id names (broad scan by tag/id/class/data-attr)
  // - Re-runs after both page-body chrome and embed chrome fire (dedup)
  const chromeScript = `<script data-page-builder="chrome">(function(){
  if(window.__pbChromeBooted)return;window.__pbChromeBooted=1;
  var hSel=${jsHeaderSel},fSel=${jsFooterSel};
  var doH=${doH},doF=${doF};

  /* Selector-based hide for known patterns */
  function pbHideSel(sel,skip){
    if(!sel)return;
    try{document.querySelectorAll(sel).forEach(function(el){
      if(!el.classList||!el.classList.contains(skip)){
        el.style.setProperty('display','none','important');
      }
    });}catch(e){}
  }

  /* Broad scan: check tag/id/class/data-attrs for the keyword (case-insensitive) */
  function pbHideBroad(keyword,skip){
    if(!document.body)return;
    var kw=keyword.toLowerCase();
    var all=document.body.querySelectorAll('*');
    for(var i=0;i<all.length;i++){
      var el=all[i];
      if(!el||!el.tagName)continue;
      if(el.classList&&el.classList.contains(skip))continue;
      var tag=el.tagName.toLowerCase();
      var id=(el.id||'').toLowerCase();
      var cls=el.className;if(typeof cls!=='string')cls=String(cls||'');cls=cls.toLowerCase();
      var hit=(tag===kw||id.indexOf(kw)!==-1||cls.indexOf(kw)!==-1);
      if(!hit&&el.dataset){
        for(var k in el.dataset){
          if(String(el.dataset[k]||'').toLowerCase().indexOf(kw)!==-1){hit=true;break;}
        }
      }
      if(hit){el.style.setProperty('display','none','important');}
    }
  }

  function pbHideAll(){
    if(doH){pbHideSel(hSel,'pb-global-header');pbHideBroad('header','pb-global-header');}
    if(doF){pbHideSel(fSel,'pb-global-footer');pbHideBroad('footer','pb-global-footer');}
  }

  function pbReposition(){
    var b=document.body;if(!b)return;
    /* Dedup our elements (safe when both page-body + embed fire) */
    var hs=document.querySelectorAll('.pb-global-header');
    for(var i=1;i<hs.length;i++){hs[i].parentNode&&hs[i].parentNode.removeChild(hs[i]);}
    var fs=document.querySelectorAll('.pb-global-footer');
    for(var j=1;j<fs.length;j++){fs[j].parentNode&&fs[j].parentNode.removeChild(fs[j]);}
    /* Move survivors to <body> root */
    var h=document.querySelector('.pb-global-header');
    var f=document.querySelector('.pb-global-footer');
    if(h&&h.parentNode!==b){b.insertBefore(h,b.firstChild);}
    if(f&&f.parentNode!==b){b.appendChild(f);}
    /* Force-show our elements (the broad scan may have caught them before move) */
    if(h){h.style.setProperty('display','flex','important');b.style.setProperty('padding-top',h.offsetHeight+'px','important');}
    if(f){f.style.setProperty('display','block','important');}
  }

  function pbRun(){pbHideAll();pbReposition();}

  /* Run early (when body parsed) and on full load (for late theme JS) */
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',pbRun);}
  else{pbRun();}
  window.addEventListener('load',pbRun);

  /* MutationObserver — re-hide anything the theme re-inserts/un-hides */
  function pbObserve(){
    if(!window.MutationObserver||!document.body)return;
    var pending=false;
    var obs=new MutationObserver(function(){
      if(pending)return;pending=true;
      requestAnimationFrame(function(){pending=false;pbRun();});
    });
    obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
  }
  if(document.body){pbObserve();}
  else{document.addEventListener('DOMContentLoaded',pbObserve);}
})();</script>`;

  return `${globalSettingsCss}${styleBlock}${chromeScript}${headerHtml}${footerHtml}`;
}

// ─── Settings → Puck props bridge ─────────────────────────────────────────────
// Maps the structured HeaderSettings / FooterSettings shape onto the Props
// shape the GlobalHeader / GlobalFooter renderers above expect. Keeps the
// renderers single-source-of-truth between editor preview and storefront.

function settingsHeaderProps(h: HeaderSettings): Props {
  return {
    height: h.height,
    backgroundColor: h.backgroundColor,
    textColor: h.textColor,
    siteTitle: h.siteTitle,
    logo: h.logo,
    showShadow: h.showShadow,
    showNavigation: h.showNavigation,
    navigationLinks: h.navigationLinks as unknown as Props[keyof Props],
    ctaLabel: h.ctaLabel,
    ctaLink: h.ctaLink,
  };
}

function settingsFooterProps(f: FooterSettings): Props {
  return {
    backgroundColor: f.backgroundColor,
    textColor: f.textColor,
    companyName: f.companyName,
    companyDescription: f.companyDescription,
    logo: f.logo,
    showSocialLinks: f.showSocialLinks,
    socialLinks: f.socialLinks as unknown as Props[keyof Props],
    quickLinks: f.quickLinks as unknown as Props[keyof Props],
    copyrightText: f.copyrightText,
  };
}

/**
 * Render only the block content (no header/footer chrome, no global CSS).
 * Used by the App Proxy endpoint to serve just the page markup to the storefront widget.
 */
export function renderPageContentOnly(data: PuckData): string {
  const zones = (data.zones ?? {}) as Zones;
  const content = (data.content ?? []) as Block[];

  const above = (zones["root:above-header"] ?? zones["above-header"] ?? []) as Block[];
  const below = (zones["root:below-footer"] ?? zones["below-footer"] ?? []) as Block[];

  const blocks = [
    ...above.map((b) => renderBlock(b, zones)),
    ...content.map((b) => renderBlock(b, zones)),
    ...below.map((b) => renderBlock(b, zones)),
  ];
  const html = blocks.join("\n");
  const needsAnim = html.includes('data-pb-anim=');
  return [RESPONSIVE_CSS, html, needsAnim ? PB_ANIM_SCRIPT : ""].join("\n");
}

/**
 * Generate the global style CSS (button + image rules) for the App Proxy response.
 * Scoped client-side by pb-widget-loader.js to the widget container.
 */
export function renderGlobalStyleCss(settings: GlobalSettings): string {
  return buildGlobalButtonCss(settings) + buildGlobalImageCss(settings);
}
