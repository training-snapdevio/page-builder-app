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
    .map((n) => `family=${n.replace(/\s+/g, "+")}:wght@300;400;500;600;700;800`)
    .join("&");
  return `@import url('https://fonts.googleapis.com/css2?${query}&display=swap');\n`;
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

function Hero(p: Props): string {
  // Slider mode: render every slide and add a small JS driver. The first slide
  // is always the main Hero's own props (mirrors the editor).
  if (p.sliderEnabled && Array.isArray(p.slides) && (p.slides as unknown[]).length > 0) {
    return renderHeroSlider(p);
  }
  return renderHeroSlide(p);
}

function renderHeroSlider(p: Props): string {
  const slides = [p, ...(p.slides as Props[])];
  const autoplay = p.autoplay !== false;
  const interval = Math.max(1, Number(p.interval ?? 5)) * 1000;
  const showArrows = p.showArrows !== false;
  const showDots = p.showDots !== false;
  const pauseOnHover = p.pauseOnHover !== false;
  const transition = Math.max(100, Number(p.transitionDuration ?? 500));

  const sliderId = `pb-hero-${Math.random().toString(36).slice(2, 10)}`;
  const slideHtml = slides
    .map((slide, i) => {
      const inner = renderHeroSlide(slide as Props, { sliderIndex: i, isFirst: i === 0 });
      return `<div class="pb-hero-slide" data-idx="${i}" style="position:absolute;inset:0;opacity:${i === 0 ? 1 : 0};transition:opacity ${transition}ms ease-in-out;pointer-events:${i === 0 ? "auto" : "none"}">${inner}</div>`;
    })
    .join("");

  const arrows = showArrows
    ? `<button type="button" data-pb-prev style="position:absolute;left:16px;top:50%;transform:translateY(-50%);z-index:10;background:rgba(0,0,0,.4);color:#fff;border:none;width:40px;height:40px;border-radius:50%;cursor:pointer;font-size:20px">‹</button><button type="button" data-pb-next style="position:absolute;right:16px;top:50%;transform:translateY(-50%);z-index:10;background:rgba(0,0,0,.4);color:#fff;border:none;width:40px;height:40px;border-radius:50%;cursor:pointer;font-size:20px">›</button>`
    : "";

  const dots = showDots
    ? `<div data-pb-dots style="position:absolute;bottom:16px;left:50%;transform:translateX(-50%);z-index:10;display:flex;gap:8px">${slides
        .map(
          (_, i) =>
            `<button type="button" data-pb-dot="${i}" style="width:10px;height:10px;border-radius:50%;border:none;background:${i === 0 ? "#fff" : "rgba(255,255,255,.4)"};cursor:pointer;padding:0"></button>`,
        )
        .join("")}</div>`
    : "";

  const sliderScript = `<script>(function(){var root=document.getElementById('${sliderId}');if(!root||root.__pbInit)return;root.__pbInit=1;var slides=root.querySelectorAll('.pb-hero-slide'),dots=root.querySelectorAll('[data-pb-dot]'),cur=0,timer=null,paused=false;function show(i){slides.forEach(function(s,k){var on=k===i;s.style.opacity=on?1:0;s.style.pointerEvents=on?'auto':'none';});dots.forEach(function(d,k){d.style.background=k===i?'#fff':'rgba(255,255,255,.4)';});cur=i;}function next(){show((cur+1)%slides.length);}function prev(){show((cur-1+slides.length)%slides.length);}var n=root.querySelector('[data-pb-next]'),pv=root.querySelector('[data-pb-prev]');if(n)n.addEventListener('click',next);if(pv)pv.addEventListener('click',prev);dots.forEach(function(d,k){d.addEventListener('click',function(){show(k);});});${
    autoplay
      ? `function start(){if(timer)return;timer=setInterval(function(){if(!paused)next();},${interval});}function stop(){if(timer){clearInterval(timer);timer=null;}}start();${pauseOnHover ? `root.addEventListener('mouseenter',function(){paused=true;});root.addEventListener('mouseleave',function(){paused=false;});` : ""}`
      : ""
  }})();</script>`;

  return `<div id="${sliderId}" style="position:relative;width:100%;min-height:60vh;overflow:hidden">
    ${slideHtml}
    ${arrows}
    ${dots}
    ${sliderScript}
  </div>`;
}

/**
 * Renders one Hero "slide" — used for the standalone Hero block and for each
 * entry in slider mode. Mirrors the React renderer in puck.config.tsx so the
 * published Shopify page matches the editor preview as closely as a static
 * HTML+inline-CSS output can.
 */
function renderHeroSlide(p: Props, opts?: { sliderIndex?: number; isFirst?: boolean }): string {
  const pad = `${p.padding ?? 80}px`;
  const bgColor = (p.backgroundColor || "#f8fafc") as string;
  const overlayOpacity = Number(p.overlayOpacity ?? 0.3);
  const align = (p.align as string) || "text-left";
  const textAlign: "left" | "center" | "right" =
    align === "text-center" ? "center" : align === "text-right" ? "right" : "left";
  const justifyContent =
    textAlign === "center" ? "center" : textAlign === "right" ? "flex-end" : "flex-start";
  const verticalAlign = (p.verticalAlign as string) || "items-center";
  const alignItems =
    verticalAlign === "items-start" ? "flex-start" : verticalAlign === "items-end" ? "flex-end" : "center";

  const img = (p.image as Record<string, string> | null | undefined) ?? {};
  const imgMode = (img.mode as string) || "";
  const imgUrl = (img.url as string) || "";
  const imgPosition = (img.position as string) || "right";
  const isBg = imgMode === "bg" && !!imgUrl;
  const isInline = imgMode === "inline" && !!imgUrl;
  const isCustom = imgMode === "custom" && !!imgUrl;
  const hasSideImage = isInline || isCustom;

  // Video background — takes precedence over bg image for the main media layer
  const videoSettings = (p.videoSettings as Record<string, unknown>) ?? {};
  const videoUrl = String(videoSettings.url ?? "").trim();
  const hasVideo = videoUrl !== "";
  const videoLoop = videoSettings.loop !== false;
  const videoMuted = videoSettings.muted !== false;

  const gs = (p.gradientStartColor as string) || "";
  const ge = (p.gradientEndColor as string) || "";
  const gd = (p.gradientDirection as string) || "135deg";
  let bgImage = "none";
  if (gs && ge) bgImage = `linear-gradient(${gd},${gs},${ge})`;
  else if (isBg && !hasVideo) bgImage = `url(${imgUrl})`;

  const txtColor = (p.textColor as string) || (isBg || hasVideo ? "#fff" : "inherit");

  // Glass effect — backdrop-blurred translucent overlay
  const glassEffect = !!p.glassEffect;
  const glassBlur = Number(p.glassBlur ?? 10);

  // Pattern — composed into the section's background-image as a multi-layer CSS
  // background so it works without a separate positioned overlay div.
  const patternType = (p.patternType as string) || "none";
  const patternColor = (p.patternColor as string) || "rgba(0,0,0,0.2)";
  const patternBg = patternBackground(patternType, patternColor);

  const badgeHtml = p.badge
    ? `<span style="display:inline-block;background:var(--accent-color, #0158ad);color:#fff;padding:4px 12px;border-radius:var(--button-border-radius, 4px);font-size:12px;font-weight:600;margin-bottom:12px">${esc(p.badge)}</span>`
    : "";

  const subtitleHtml = p.subtitle
    ? `<p style="font-size:1.125rem;margin:0 0 8px;opacity:.85">${esc(p.subtitle)}</p>`
    : "";

  const titleHtml = p.title
    ? `<h1 style="font-size:var(--h1-size, clamp(2rem,5vw,3.5rem));font-weight:var(--heading-weight, 700);margin:0 0 16px;line-height:var(--heading-line-height, 1.2);font-family:var(--heading-font)">${esc(p.title)}</h1>`
    : "";

  const rating = Number(p.rating ?? 0);
  const reviewCount = Number(p.reviewCount ?? 0);
  let ratingHtml = "";
  if (rating > 0) {
    const full = Math.floor(rating);
    let stars = "";
    for (let i = 0; i < 5; i++) {
      stars += i < full
        ? `<span style="color:#facc15">★</span>`
        : `<span style="color:#d1d5db">★</span>`;
    }
    ratingHtml = `<div style="display:flex;gap:8px;align-items:center;justify-content:${justifyContent};margin-bottom:12px"><span style="display:inline-flex;gap:1px">${stars}</span><span style="font-size:14px;opacity:.85">${rating}${reviewCount ? ` (${reviewCount} reviews)` : ""}</span></div>`;
  }

  const features = Array.isArray(p.features) ? (p.features as Array<{ text?: string }>) : [];
  const featuresHtml = features.length
    ? `<ul style="list-style:none;padding:0;margin:0 0 16px;text-align:${textAlign}">${features
        .map((f) => `<li style="margin-bottom:4px;font-size:.9rem">✔ ${esc(f?.text ?? "")}</li>`)
        .join("")}</ul>`
    : "";

  const descHtml = p.description
    ? `<div style="margin-bottom:24px;line-height:1.6;opacity:.9">${String(p.description)}</div>`
    : "";

  const buttons = Array.isArray(p.buttons) ? (p.buttons as Array<{ label?: string; link?: string; variant?: string }>) : [];
  const buttonsHtml = buttons.length
    ? `<div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:${justifyContent}">${buttons
        .map((b) => {
          if (!b?.label) return "";
          const variant = b.variant || "primary";
          const style =
            variant === "primary"
              ? "background:var(--primary-color, #0158ad);color:#fff;border:none"
              : variant === "secondary"
                ? "background:var(--secondary-color, #64748b);color:#fff;border:none"
                : "background:transparent;color:currentColor;border:2px solid currentColor";
          const className = variant === "outline" ? "pb-btn pb-btn-outline" : "pb-btn";
          return `<a href="${esc(b.link || "#")}" class="${className}" style="${style};padding:12px 28px;border-radius:var(--button-border-radius, 6px);font-weight:600;text-decoration:none;display:inline-block">${esc(b.label)}</a>`;
        })
        .join("")}</div>`
    : "";

  const textBlock = `<div style="position:relative;z-index:2;${hasSideImage ? "flex:1 1 0;min-width:0;" : "max-width:720px;width:100%;"}color:${esc(txtColor)};text-align:${textAlign}">
    ${badgeHtml}
    ${subtitleHtml}
    ${titleHtml}
    ${ratingHtml}
    ${featuresHtml}
    ${descHtml}
    ${buttonsHtml}
  </div>`;

  const imageBlock = hasSideImage
    ? `<div style="position:relative;z-index:2;flex:1 1 0;min-width:0"><img src="${esc(imgUrl)}" alt="Hero" style="width:100%;height:auto;max-height:500px;object-fit:cover;border-radius:8px;display:block"></div>`
    : "";

  const imageFirst = isCustom && imgPosition === "left";

  // ── Background layers (z-index 0–1, behind content) ──────────────────────
  // Skip data URLs entirely — Shopify strips them from page bodies and they
  // exceed the 512 KB body limit anyway. Real CDN URLs only.
  const isPlayableVideoUrl = hasVideo && !videoUrl.startsWith("data:");
  const videoLayer = isPlayableVideoUrl
    ? `<video autoplay ${videoLoop ? "loop " : ""}${videoMuted ? "muted " : ""}playsinline preload="auto" src="${esc(videoUrl)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;opacity:${1 - overlayOpacity}"></video>`
    : "";

  const overlayLayer =
    isBg || isPlayableVideoUrl
      ? `<div style="position:absolute;inset:0;background:#000;opacity:${overlayOpacity};z-index:1"></div>`
      : "";

  // Build composed background (pattern on top of hero bg image/gradient).
  const composedBgImage = patternBg
    ? bgImage !== "none" ? `${patternBg.image},${bgImage}` : patternBg.image
    : bgImage;
  const composedBgSize = patternBg
    ? bgImage !== "none" ? `${patternBg.size},cover` : patternBg.size
    : "cover";
  const composedBgPos = patternBg
    ? bgImage !== "none" ? `${patternBg.position},center` : patternBg.position
    : "center";

  const glassLayer = glassEffect
    ? `<div style="position:absolute;inset:0;backdrop-filter:blur(${glassBlur}px);-webkit-backdrop-filter:blur(${glassBlur}px);background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);z-index:1;pointer-events:none"></div>`
    : "";

  // ── Decorative shapes (geometric / floating) ─────────────────────────────
  const geoShapes = p.geometricShapes as { enabled?: boolean; shapes?: Array<Record<string, unknown>> } | undefined;
  const geoLayer =
    geoShapes?.enabled && Array.isArray(geoShapes.shapes)
      ? geoShapes.shapes
          .map((sh) => {
            const pos = (sh.position as { x?: number; y?: number }) ?? {};
            const size = Number(sh.size ?? 80);
            const color = String(sh.color ?? "#0158ad");
            const opacity = Number(sh.opacity ?? 0.3);
            const rotation = Number(sh.rotation ?? 0);
            const type = String(sh.type ?? "square");
            const base = `position:absolute;left:${pos.x ?? 0}px;top:${pos.y ?? 0}px;z-index:0;opacity:${opacity};transform:rotate(${rotation}deg)`;
            if (type === "triangle") {
              return `<div style="${base};width:0;height:0;border-left:${size / 2}px solid transparent;border-right:${size / 2}px solid transparent;border-bottom:${size}px solid ${esc(color)}"></div>`;
            }
            const radius = type === "circle" ? "50%" : "0";
            return `<div style="${base};width:${size}px;height:${size}px;background:${esc(color)};border-radius:${radius}"></div>`;
          })
          .join("")
      : "";

  const floatEls = p.floatingElements as { enabled?: boolean; elements?: Array<Record<string, unknown>> } | undefined;
  const floatLayer =
    floatEls?.enabled && Array.isArray(floatEls.elements)
      ? floatEls.elements
          .map((el) => {
            const pos = (el.position as { x?: number; y?: number }) ?? {};
            const size = Number(el.size ?? 60);
            const color = String(el.color ?? "#fff");
            const type = String(el.type ?? "square");
            const animation = String(el.animation ?? "none");
            const radius =
              type === "circle" ? "50%" : type === "blob" ? "30% 70% 70% 30% / 30% 30% 70% 70%" : "0";
            const animMap: Record<string, string> = {
              float: "pb-hero-float 3s ease-in-out infinite",
              pulse: "pb-hero-pulse 2s ease-in-out infinite",
              rotate: "pb-hero-rotate 4s linear infinite",
              bounce: "pb-hero-bounce 2s ease-in-out infinite",
            };
            const anim = animMap[animation] ?? "none";
            return `<div style="position:absolute;left:${pos.x ?? 0}px;top:${pos.y ?? 0}px;width:${size}px;height:${size}px;background:${esc(color)};border-radius:${radius};animation:${anim};z-index:0"></div>`;
          })
          .join("")
      : "";

  const flexDirection = hasSideImage ? "row" : "column";

  // Keyframes only emitted when this is the first slide rendered (avoid dup
  // on multi-slide / multi-Hero pages).
  const isFirst = !opts || opts.isFirst !== false;
  const keyframes = isFirst
    ? `<style>@keyframes pb-hero-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}@keyframes pb-hero-pulse{0%,100%{transform:scale(1);opacity:.85}50%{transform:scale(1.1);opacity:1}}@keyframes pb-hero-rotate{from{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes pb-hero-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}</style>`
    : "";

  return `<section class="pb-hero" style="position:relative;background-color:${esc(bgColor)};background-image:${composedBgImage};background-size:${composedBgSize};background-position:${composedBgPos};padding:${pad};min-height:60vh;display:flex;flex-wrap:wrap;flex-direction:${flexDirection};align-items:${alignItems};justify-content:${justifyContent};gap:32px;overflow:hidden;color:${esc(txtColor)}">
    ${keyframes}
    ${videoLayer}
    ${overlayLayer}
    ${glassLayer}
    ${geoLayer}
    ${floatLayer}
    ${imageFirst ? imageBlock : ""}
    ${textBlock}
    ${!imageFirst ? imageBlock : ""}
  </section>`;
}

function GradientHero(p: Props): string {
  const gs = p.gradientStart || "#667eea";
  const ge = p.gradientEnd || "#764ba2";
  return `<section style="background:linear-gradient(135deg,${esc(gs)},${esc(ge)});min-height:60vh;display:flex;align-items:center;justify-content:center;color:#fff">
  <div style="text-align:center;max-width:700px;padding:40px">
    ${p.subtitle ? `<p style="font-size:14px;font-weight:600;margin:0 0 12px;opacity:.9;text-transform:uppercase;letter-spacing:.1em">${esc(p.subtitle)}</p>` : ""}
    ${p.title ? `<h1 style="font-size:3.5rem;font-weight:700;margin:0 0 20px;line-height:1.2">${esc(p.title)}</h1>` : ""}
    ${p.description ? `<p style="font-size:18px;margin:0 0 32px;opacity:.95;line-height:1.6">${esc(p.description)}</p>` : ""}
    ${p.buttonLabel && p.buttonLink ? `<a href="${esc(p.buttonLink)}" class="pb-btn" style="display:inline-block;background:rgba(255,255,255,.2);color:#fff;padding:12px 36px;border-radius:8px;font-weight:600;text-decoration:none;font-size:16px;border:2px solid rgba(255,255,255,.4)">${esc(p.buttonLabel)}</a>` : ""}
  </div>
</section>`;
}

function TextBlock(p: Props): string {
  return `<div style="${s({ padding: (p.padding || "48px 24px") as string, maxWidth: (p.maxWidth || "720px") as string, margin: "0 auto", textAlign: (p.textAlign || "left") as string })}">
  ${p.title ? `<h2 style="font-size:var(--h2-size, clamp(1.5rem,3vw,2.25rem));font-weight:var(--heading-weight, 700);line-height:var(--heading-line-height, 1.2);font-family:var(--heading-font);margin:0 0 16px">${esc(p.title)}</h2>` : ""}
  ${p.body ? `<div style="font-size:var(--base-font-size, 1rem);line-height:var(--line-height, 1.7);font-family:var(--font-family);color:var(--text-color);opacity:.85">${esc(p.body)}</div>` : ""}
</div>`;
}

function Text(p: Props): string {
  const fontSize = p.fontSize ? `${p.fontSize}px` : "16px";
  const content = `<p style="${s({ textAlign: (p.alignment || "left") as string, fontSize, fontWeight: (p.fontWeight || "400") as string, color: (p.textColor || "var(--text-color, #374151)") as string, fontFamily: "var(--font-family)", lineHeight: String(p.lineHeight || 1.6), margin: "0" })}">${esc(p.title)}</p>`;
  return `<div style="${s({ padding: `${p.padding ?? 16}px`, backgroundColor: (p.backgroundColor || "transparent") as string })}">
  ${p.linkUrl ? `<a href="${esc(p.linkUrl)}" style="text-decoration:none;color:inherit">${content}</a>` : content}
</div>`;
}

function HeadingBlock(p: Props): string {
  const level = Math.min(Math.max(Number(p.level) || 1, 1), 6);
  const sizeVars = [
    "var(--h1-size, 2.5rem)", "var(--h2-size, 2rem)", "var(--h3-size, 1.75rem)",
    "var(--h4-size, 1.5rem)", "var(--h5-size, 1.25rem)", "var(--h6-size, 1rem)",
  ];
  const fs = sizeVars[level - 1];
  const padding = `${p.padding ?? 32}px`;
  const align = (p.alignment || "left") as string;
  const color = (p.textColor || "var(--primary-color, #1a1a1a)") as string;
  const dividerMargin = align === "center" ? "margin-left:auto;margin-right:auto" : align === "right" ? "margin-left:auto" : "";
  return `<div style="${s({ padding, textAlign: align, backgroundColor: (p.backgroundColor || "transparent") as string })}">
  <h${level} style="font-size:${fs};font-weight:var(--heading-weight, 700);color:${esc(color)};line-height:var(--heading-line-height, 1.2);font-family:var(--heading-font);margin:0">${esc(p.title)}</h${level}>
  ${p.subtitle ? `<p style="font-size:var(--base-font-size, 1rem);color:var(--text-color);margin-top:8px;opacity:.75">${esc(p.subtitle)}</p>` : ""}
  ${p.showDivider ? `<div style="width:60px;height:3px;background:${esc(color)};border-radius:2px;margin-top:12px;${dividerMargin}"></div>` : ""}
</div>`;
}

function Space(p: Props): string {
  // Support new NumberUnitField props (heightDesktop/heightDesktopUnit) and legacy p.size
  const hD = p.heightDesktop != null ? `${p.heightDesktop}${(p.heightDesktopUnit as string) || "px"}` : `${p.size ?? 32}px`;
  const hT = p.heightTablet  ? `${p.heightTablet}${(p.heightTabletUnit  as string) || "px"}` : hD;
  const hM = p.heightMobile  ? `${p.heightMobile}${(p.heightMobileUnit  as string) || "px"}` : hT;
  const hideClasses = [
    p.hideDesktop ? "puck-hide-desktop" : "",
    p.hideTablet  ? "puck-hide-tablet"  : "",
    p.hideMobile  ? "puck-hide-mobile"  : "",
  ].filter(Boolean).join(" ");
  const cls = hideClasses ? ` class="${hideClasses}"` : "";
  const bgStyle = p.backgroundColor ? `background-color:${esc(p.backgroundColor as string)};` : "";
  const uid = `sp-${Math.random().toString(36).slice(2, 8)}`;
  const responsiveCss = `<style>.${uid}{height:${hD}}@media(max-width:1023px){.${uid}{height:${hT}}}@media(max-width:767px){.${uid}{height:${hM}}}</style>`;
  return `${responsiveCss}<div${cls} class="${uid}" style="${bgStyle}width:100%;box-sizing:border-box"></div>`;
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
  const imgTag   = `<img src="${esc(imageUrl)}" alt="${altText}" loading="lazy" style="${imgStyle}">`;

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

function Article(p: Props): string {
  const pad = `${p.padding ?? 32}px`;
  const mw = `${p.maxWidth ?? 860}px`;
  const bg = (p.backgroundColor || "transparent") as string;
  return `<div style="padding:${pad};background:${esc(bg)}">
  <article style="max-width:${mw};margin:0 auto">
    ${p.articleTitle ? `<h1 style="font-size:var(--h1-size, 2.5rem);font-weight:var(--heading-weight, 700);color:var(--primary-color, #1a1a1a);line-height:var(--heading-line-height, 1.2);font-family:var(--heading-font);margin:0 0 12px">${esc(p.articleTitle)}</h1>` : ""}
    ${p.author || p.publishDate ? `<div style="display:flex;gap:12px;font-size:13px;color:var(--text-color, #374151);opacity:.65;margin-bottom:24px;flex-wrap:wrap">
      ${p.author ? `By <strong>${esc(p.author)}</strong>` : ""}
      ${p.author && p.publishDate ? " | " : ""}
      ${p.publishDate ? esc(p.publishDate) : ""}
    </div>` : ""}
    <div style="font-size:var(--base-font-size, 1rem);line-height:var(--line-height, 1.75);font-family:var(--font-family);color:var(--text-color, #374151)">${p.body ? String(p.body) : ""}</div>
  </article>
</div>`;
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
  const icon         = esc((p.icon as string) || "");
  const iconPos      = (p.iconPosition as string) || "before";
  const fullWidth    = !!p.fullWidth;
  const alignment    = (p.alignment as string) || "left";
  const fontFamily   = (p.fontFamily as string) || "var(--font-family)";
  const fontSize     = p.fontSize ? `${p.fontSize}px` : "";
  const fontWeight   = (p.fontWeight as string) || "600";
  const textTransform = (p.textTransform as string) || "none";
  const letterSpacing = p.letterSpacing != null ? `${p.letterSpacing}px` : "";
  const textColor    = esc((p.textColor as string) || "#ffffff");
  const bgColor      = esc((p.bgColor as string) || "var(--primary-color, #0158ad)");
  const borderStyle  = (p.borderStyle as string) || "none";
  const borderWidth  = Number(p.borderWidth ?? 2);
  const borderColor  = esc((p.borderColor as string) || "transparent");
  const borderRadius = esc((p.borderRadius as string) || "var(--button-border-radius, 6px)");
  const hoverTextColor = esc((p.hoverTextColor as string) || "");
  const hoverBgColor   = esc((p.hoverBgColor as string) || "");
  const hoverBorderColor = esc((p.hoverBorderColor as string) || "");
  const hoverAnimation = (p.hoverAnimation as string) || "none";
  const sizePreset   = (p.sizePreset as string) || "medium";
  const customPad    = (p.customPadding as any) ?? {};
  const opacity      = p.opacity != null ? (p.opacity as number) / 100 : 1;
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
  const uid = cssId || `btn-${Math.random().toString(36).slice(2, 8)}`;

  const hoverCss = (hoverTextColor || hoverBgColor || hoverBorderColor || hoverAnimation !== "none") ? `
.pb-btn-${uid}{transition:all 0.2s ease}
.pb-btn-${uid}:hover{${hoverTextColor ? `color:${hoverTextColor}!important;` : ""}${hoverBgColor ? `background:${hoverBgColor}!important;` : ""}${hoverBorderColor ? `border-color:${hoverBorderColor}!important;` : ""}${hoverAnimation === "grow" ? "transform:scale(1.05);" : hoverAnimation === "shrink" ? "transform:scale(0.96);" : hoverAnimation === "pulse" ? "animation:pb-pulse 0.6s ease;" : ""}}
@keyframes pb-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}` : "";

  const btnStyle = [
    `display:${fullWidth ? "flex" : "inline-flex"}`,
    fullWidth ? "width:100%" : "",
    "align-items:center",
    "justify-content:center",
    icon ? "gap:8px" : "",
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
    `opacity:${opacity}`,
    "text-decoration:none",
  ].filter(Boolean).join(";");

  const iconBefore = icon && iconPos === "before" ? `<span>${icon}</span>` : "";
  const iconAfter  = icon && iconPos === "after"  ? `<span>${icon}</span>` : "";
  const inner = `${iconBefore}${label}${iconAfter}`;

  const btnEl = `<button class="pb-btn pb-btn-${uid}" style="${btnStyle}">${inner}</button>`;
  const linked = linkUrl
    ? `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;${fullWidth ? "display:block" : "display:inline-block"}">${btnEl}</a>`
    : btnEl;

  const mt = advMargin.top ?? 0, mr = advMargin.right ?? 0, mb = advMargin.bottom ?? 0, ml = advMargin.left ?? 0;
  const wrapBg = advBgType === "color" && advBgColor ? `background-color:${advBgColor};` : "";
  const wrapStyle = [
    `text-align:${alignment}`,
    `margin:${mt}px ${mr}px ${mb}px ${ml}px`,
    zIndex ? `z-index:${zIndex}` : "",
    wrapBg,
  ].filter(Boolean).join(";");

  const styleTag = (hoverCss || customCss) ? `<style>${hoverCss}${customCss ? `#${uid}{${customCss}}` : ""}</style>` : "";
  return `${styleTag}<div${cssId ? ` id="${cssId}"` : ""}${cssClass ? ` class="${cssClass}"` : ""} style="${wrapStyle}">${linked}</div>`;
}

function AboutSection(p: Props): string {
  const pad = `${p.padding ?? 80}px 0`;
  const bg = (p.backgroundColor || "#ffffff") as string;
  const maxWidth = Number(p.maxWidth) || 1200;
  const img = (p.image as Record<string, unknown>) ?? {};
  const url = (img.url as string) || "";
  const imagePosition = (p.imagePosition as string) || "right";
  const isTop = imagePosition === "top";
  const isLeft = imagePosition === "left";
  const imageStyle = (p.imageStyle as string) || "rounded";
  const imageHeight = Number(p.imageHeight) || 460;
  const radius = imageStyle === "circle" ? "50%" : imageStyle === "square" ? "0px" : `${p.imageRadius ?? 16}px`;
  const imageShadow = p.imageShadow === true;
  const textAlign = (p.textAlign as string) || "left";
  const verticalAlign = (p.verticalAlign as string) || "center";
  const vAlign = verticalAlign === "top" ? "flex-start" : verticalAlign === "bottom" ? "flex-end" : "center";
  const itemsAlign = textAlign === "center" ? "center" : textAlign === "right" ? "flex-end" : "flex-start";
  const justifyRow = itemsAlign;
  const columnGap = Number(p.columnGap) || 64;
  const showStats = p.showStats !== false;
  const stats = (p.stats as Array<{ value: string; label: string }>) ?? [];
  const accent = (p.buttonColor || "var(--primary-color, #0158ad)") as string;
  const btnText = (p.buttonTextColor || "#ffffff") as string;

  const imgW = imageStyle === "circle" ? `${imageHeight}px` : "100%";
  const imgMargin = isTop || imageStyle === "circle" ? "margin:0 auto;" : "";
  const imgShadowCss = imageShadow ? "box-shadow:0 20px 45px rgba(0,0,0,0.18);" : "";
  const imageEl = url
    ? `<img src="${esc(url)}" alt="${esc((p.title as string) || "About")}" style="width:${imgW};height:${imageHeight}px;max-width:100%;object-fit:cover;display:block;border-radius:${radius};${imgMargin}${imgShadowCss}">`
    : "";

  const statsEl = showStats && stats.length
    ? `<div style="display:grid;grid-template-columns:repeat(${Math.min(stats.length, 4)},1fr);gap:16px;margin-bottom:32px;padding:24px 0;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;width:100%">` +
      stats.map((st) => `<div style="text-align:center"><div style="font-size:1.75rem;font-weight:700;color:${esc((p.statValueColor as string) || "var(--primary-color, #0158ad)")};line-height:1.1">${esc(st.value)}</div><div style="font-size:.8rem;color:${esc((p.statLabelColor as string) || "var(--text-color, #374151)")};opacity:.7;margin-top:4px">${esc(st.label)}</div></div>`).join("") +
      `</div>`
    : "";

  const buttonsEl = p.primaryButtonLabel || p.secondaryButtonLabel
    ? `<div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:${justifyRow}">` +
      (p.primaryButtonLabel ? `<a href="${esc((p.primaryButtonLink as string) || "#")}" class="pb-btn" style="display:inline-block;background:${esc(accent)};color:${esc(btnText)};padding:12px 28px;border-radius:var(--button-border-radius, 8px);font-weight:600;text-decoration:none">${esc(p.primaryButtonLabel as string)}</a>` : "") +
      (p.secondaryButtonLabel ? `<a href="${esc((p.secondaryButtonLink as string) || "#")}" class="pb-btn" style="display:inline-block;background:transparent;color:${esc(accent)};padding:12px 28px;border-radius:var(--button-border-radius, 8px);font-weight:600;text-decoration:none;border:2px solid ${esc(accent)}">${esc(p.secondaryButtonLabel as string)}</a>` : "") +
      `</div>`
    : "";

  const contentEl = `<div style="display:flex;flex-direction:column;align-items:${itemsAlign};text-align:${textAlign};min-width:0">
    ${p.badge ? `<span style="display:inline-block;font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:${esc((p.badgeColor as string) || "var(--primary-color, #0158ad)")};margin-bottom:12px">${esc(p.badge as string)}</span>` : ""}
    ${p.subtitle ? `<p style="font-size:16px;color:${esc((p.subtitleColor as string) || "var(--secondary-color, #374151)")};margin:0 0 8px">${esc(p.subtitle as string)}</p>` : ""}
    ${p.title ? `<h2 style="font-size:var(--h2-size, 2rem);font-weight:var(--heading-weight, 700);color:${esc((p.titleColor as string) || "var(--primary-color, #1a1a1a)")};line-height:var(--heading-line-height, 1.2);font-family:var(--heading-font);margin:0 0 16px">${esc(p.title as string)}</h2>` : ""}
    ${p.description ? `<p style="font-size:var(--base-font-size, 1rem);line-height:var(--line-height, 1.7);color:${esc((p.descriptionColor as string) || "var(--text-color, #374151)")};margin:0 0 32px">${esc(p.description as string)}</p>` : ""}
    ${statsEl}
    ${buttonsEl}
  </div>`;

  const inner = isTop
    ? `<div style="display:flex;flex-direction:column;gap:40px;align-items:${textAlign === "center" ? "center" : itemsAlign}">${imageEl}${contentEl}</div>`
    : `<div${url ? ' class="pb-grid-2col"' : ""} style="display:grid;grid-template-columns:${url ? "1fr 1fr" : "1fr"};gap:${columnGap}px;align-items:${vAlign}">
        <div style="order:${isLeft ? 0 : 1};min-width:0">${imageEl}</div>
        <div style="order:${isLeft ? 1 : 0};min-width:0">${contentEl}</div>
      </div>`;

  return `<section style="background:${esc(bg)};padding:${pad}">
  <div style="max-width:${maxWidth}px;margin:0 auto;padding:0 24px">
    ${inner}
  </div>
</section>`;
}

function GallerySection(p: Props): string {
  const pad = `${p.padding ?? 80}px 0`;
  const bg = (p.backgroundColor || "#f8fafc") as string;
  const cols = Number(p.columns) || 3;
  const gap = Number(p.gap) || 16;
  const images = (p.images as Array<{ url?: string; caption?: string; alt?: string }>) ?? [];
  return `<section style="background:${esc(bg)};padding:${pad}">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px">
    ${p.title || p.subtitle ? `<div style="text-align:center;margin-bottom:48px">
      ${p.subtitle ? `<p style="font-size:14px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--primary-color, #0158ad);margin:0 0 8px">${esc(p.subtitle)}</p>` : ""}
      ${p.title ? `<h2 style="font-size:var(--h2-size, 2rem);font-weight:var(--heading-weight, 700);color:var(--primary-color, #1a1a1a);font-family:var(--heading-font);line-height:var(--heading-line-height, 1.2);margin:0">${esc(p.title)}</h2>` : ""}
    </div>` : ""}
    <div class="pb-grid-ncol" style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${gap}px">
      ${images.filter((img) => img.url).map((img) => `<div style="position:relative;overflow:hidden;border-radius:8px">
        <img src="${esc(img.url)}" alt="${esc(img.alt || "")}" loading="lazy" style="width:100%;aspect-ratio:4/3;object-fit:cover;display:block">
        ${img.caption ? `<div style="position:absolute;bottom:0;left:0;right:0;padding:8px 12px;background:linear-gradient(to top,rgba(0,0,0,.7),transparent);color:#fff;font-size:13px;font-weight:500">${esc(img.caption)}</div>` : ""}
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function ServiceSection(p: Props): string {
  const pad = `${p.padding ?? 80}px 0`;
  const bg = (p.backgroundColor || "#fff") as string;
  const cols = Number(p.columns) || 3;
  const align = (p.contentAlign || "left") as string;
  const services = (p.services as Array<{ icon?: string; title?: string; description?: string; linkLabel?: string; link?: string; image?: { url?: string } }>) ?? [];
  const cardStyleMap: Record<string, string> = {
    bordered: "border:1px solid #e5e7eb",
    shadow: "box-shadow:0 4px 20px rgba(0,0,0,.08)",
    flat: "background:#f8fafc",
  };
  const cs = cardStyleMap[(p.cardStyle as string) || "shadow"] || cardStyleMap.shadow;
  return `<section style="background:${esc(bg)};padding:${pad}">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px">
    ${p.title || p.subtitle ? `<div style="text-align:center;margin-bottom:48px">
      ${p.subtitle ? `<p style="font-size:14px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--primary-color, #0158ad);margin:0 0 8px">${esc(p.subtitle)}</p>` : ""}
      ${p.title ? `<h2 style="font-size:var(--h2-size, 2rem);font-weight:var(--heading-weight, 700);color:var(--primary-color, #1a1a1a);font-family:var(--heading-font);line-height:var(--heading-line-height, 1.2);margin:0">${esc(p.title)}</h2>` : ""}
    </div>` : ""}
    <div class="pb-grid-ncol" style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:24px;text-align:${align}">
      ${services.map((sv) => `<div style="padding:24px;border-radius:8px;${cs}">
        ${sv.icon ? `<span style="font-size:2rem;display:block;margin-bottom:16px">${esc(sv.icon)}</span>` : ""}
        ${sv.image?.url ? `<img src="${esc(sv.image.url)}" alt="" style="width:100%;height:160px;object-fit:cover;border-radius:4px;margin-bottom:12px;display:block">` : ""}
        <h3 style="font-size:var(--h3-size, 1.125rem);font-weight:var(--heading-weight, 700);font-family:var(--heading-font);margin:0 0 8px;color:var(--primary-color, #1a1a1a)">${esc(sv.title || "")}</h3>
        <p style="color:var(--text-color, #374151);opacity:.8;font-size:.9rem;line-height:var(--line-height, 1.6);margin:0 0 12px">${esc(sv.description || "")}</p>
        ${sv.linkLabel && sv.link ? `<a href="${esc(sv.link)}" class="pb-btn" style="color:var(--primary-color, #0158ad);font-weight:600;text-decoration:none;font-size:.875rem">${esc(sv.linkLabel)} →</a>` : ""}
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function TestimonialSection(p: Props): string {
  const pad = `${p.padding ?? 80}px 0`;
  const bg = (p.backgroundColor || "#fff") as string;
  const cols = Number(p.columns) || 2;
  const align = (p.contentAlign || "center") as string;
  const accent = (p.accentColor || "var(--primary-color, #0158ad)") as string;
  const cardBg = (p.cardBackgroundColor || "#f8fafc") as string;
  const items = (p.testimonials as Array<{ quote?: string; author?: string; role?: string; avatar?: string; rating?: number }>) ?? [];
  const avatarSize = p.avatarSize === "small" ? "40px" : p.avatarSize === "large" ? "80px" : "60px";
  const csMap: Record<string, string> = {
    bordered: "border:1px solid #e5e7eb",
    shadow: "box-shadow:0 4px 20px rgba(0,0,0,.08)",
    minimal: "",
    glass: "border:1px solid rgba(255,255,255,.3)",
  };
  const cs = csMap[(p.cardStyle as string) || "shadow"] || "";
  return `<section style="background:${esc(bg)};padding:${pad}">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px">
    ${p.title || p.subtitle ? `<div style="text-align:center;margin-bottom:48px">
      ${p.subtitle ? `<p style="font-size:14px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:${esc(accent)};margin:0 0 8px">${esc(p.subtitle)}</p>` : ""}
      ${p.title ? `<h2 style="font-size:var(--h2-size, 2rem);font-weight:var(--heading-weight, 700);color:var(--primary-color, #1a1a1a);font-family:var(--heading-font);line-height:var(--heading-line-height, 1.2);margin:0">${esc(p.title)}</h2>` : ""}
    </div>` : ""}
    <div class="pb-grid-ncol" style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:24px">
      ${items.map((t) => `<div style="padding:24px;background:${esc(cardBg)};border-radius:8px;text-align:${align};${cs}">
        ${p.showQuotes ? `<span style="font-size:2rem;color:${esc(accent)};display:block;margin-bottom:12px">✦</span>` : ""}
        ${t.quote ? `<p style="font-style:italic;color:var(--text-color, #374151);line-height:var(--line-height, 1.7);margin:0 0 16px">"${esc(t.quote)}"</p>` : ""}
        ${t.avatar ? `<img src="${esc(t.avatar)}" alt="" style="width:${avatarSize};height:${avatarSize};border-radius:50%;object-fit:cover;margin:0 auto 12px;display:block">` : ""}
        ${t.author ? `<strong style="color:var(--text-color, #1a1a1a);display:block">${esc(t.author)}</strong>` : ""}
        ${t.role ? `<span style="font-size:12px;color:#6b7280">${esc(t.role)}</span>` : ""}
        ${t.rating ? `<div style="color:${esc(accent)};font-size:14px;margin-top:8px">${"★".repeat(t.rating)}</div>` : ""}
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function MarqueeBar(p: Props): string {
  const bg = (p.backgroundColor || "#000") as string;
  const textColor = (p.textColor || "#fff") as string;
  const fontSize = p.fontSize ? `${p.fontSize}px` : "14px";
  const padding = p.padding ? `${p.padding}px` : "10px";
  const speed = Number(p.speed) || 20;
  const dir = p.direction === "right" ? "marqueeRight" : "marqueeLeft";
  const repeat = Number(p.repeat) || 10;
  const text = (p.text as string) || "";
  // Default to true (matches editor defaultProps); only false when explicitly disabled.
  const pauseOnHover = p.pauseOnHover !== false;
  const items = Array(repeat).fill(`<span style="margin-right:40px">${esc(text)}</span>`).join("");
  const wrapperClass = `pb-marquee${pauseOnHover ? " pb-marquee-pause" : ""}`;
  return `<div class="${wrapperClass}" style="overflow:hidden;white-space:nowrap;background:${esc(bg)};color:${esc(textColor)};font-size:${fontSize};padding:${padding}">
  <div class="pb-marquee-track" style="display:inline-block;animation:${dir} ${speed}s linear infinite">${items}</div>
  <style>@keyframes marqueeLeft{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}@keyframes marqueeRight{0%{transform:translateX(-50%)}100%{transform:translateX(0)}}.pb-marquee-pause:hover .pb-marquee-track{animation-play-state:paused!important}</style>
</div>`;
}

function ContactSection(p: Props): string {
  const pad = `${p.padding ?? 80}px 0`;
  const bg = (p.backgroundColor || "#f8fafc") as string;
  const accent = (p.accentColor || "var(--primary-color, #0158ad)") as string;
  // Translucent accent for tints/gradients. Hex-alpha suffix (`${accent}22`) only
  // works on bare hex, not on a var(); use color-mix so it tracks the token too.
  const accentTint = (pct: number) => `color-mix(in srgb, ${accent} ${pct}%, transparent)`;
  const br = `${p.borderRadius ?? 8}px`;
  const labelName = (p.labelName as string) || "Name";
  const labelEmail = (p.labelEmail as string) || "Email";
  const labelSubject = (p.labelSubject as string) || "Subject";
  const labelMessage = (p.labelMessage as string) || "Message";

  const cardStyle = (() => {
    switch (p.cardStyle) {
      case "glassmorphism": return `background:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.3)`;
      case "gradient":      return `background:linear-gradient(135deg,${bg} 0%,${accentTint(13)} 100%)`;
      case "shadow":        return `background:#fff;box-shadow:0 10px 40px rgba(0,0,0,.1)`;
      case "minimal":       return `background:#fff;border:1px solid #e5e7eb`;
      default:              return `background:#fff;box-shadow:0 4px 6px rgba(0,0,0,.05)`;
    }
  })();

  const iconBox = (emoji: string) =>
    `<div style="width:44px;height:44px;border-radius:${br};background:${esc(accent)};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px">${emoji}</div>`;

  const contactItems = [
    p.email   ? `<div style="display:flex;align-items:flex-start;gap:16px">${iconBox("✉️")}<div><p style="font-weight:600;color:${esc(accent)};margin:0 0 2px">Email</p><a href="mailto:${esc(p.email as string)}" style="color:#374151;text-decoration:none">${esc(p.email as string)}</a></div></div>` : "",
    p.phone   ? `<div style="display:flex;align-items:flex-start;gap:16px">${iconBox("📞")}<div><p style="font-weight:600;color:${esc(accent)};margin:0 0 2px">Phone</p><span style="color:#374151">${esc(p.phone as string)}</span></div></div>` : "",
    p.address ? `<div style="display:flex;align-items:flex-start;gap:16px">${iconBox("📍")}<div><p style="font-weight:600;color:${esc(accent)};margin:0 0 2px">Address</p><span style="color:#374151;white-space:pre-line">${esc(p.address as string)}</span></div></div>` : "",
  ].filter(Boolean).join("");

  const infoCard = `<div style="${cardStyle};border-radius:${br};padding:32px">
    <h3 style="font-size:var(--h3-size, 1.25rem);font-weight:600;color:${esc(accent)};font-family:var(--heading-font);margin:0 0 24px">Contact Information</h3>
    <div style="display:flex;flex-direction:column;gap:20px">
      ${p.responseTime ? `<div style="display:flex;align-items:center;gap:8px;padding:12px 16px;background:${accentTint(10)};border-radius:8px;margin-bottom:8px"><span style="font-size:16px">⏱️</span><span style="font-size:14px;font-weight:600;color:${esc(accent)}">${esc(p.responseTime as string)}</span></div>` : ""}
      ${contactItems}
    </div>
  </div>`;

  const inputStyle = `padding:10px 14px;border:1px solid #e5e7eb;border-radius:${br};font-size:14px;width:100%;box-sizing:border-box;outline:none`;
  const labelStyle = `display:block;font-size:13px;font-weight:600;color:${esc(accent)};margin-bottom:6px`;

  const formCard = p.showForm !== false ? `<div style="${cardStyle};border-radius:${br};padding:32px">
    <form action="" method="post" style="display:flex;flex-direction:column;gap:20px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div><label style="${labelStyle}">${esc(labelName)}</label><input type="text" name="name" placeholder="Your name" style="${inputStyle}"></div>
        <div><label style="${labelStyle}">${esc(labelEmail)}</label><input type="email" name="email" placeholder="your@email.com" style="${inputStyle}"></div>
      </div>
      <div><label style="${labelStyle}">${esc(labelSubject)}</label><input type="text" name="subject" placeholder="Project enquiry" style="${inputStyle}"></div>
      <div><label style="${labelStyle}">${esc(labelMessage)}</label><textarea name="message" rows="6" placeholder="Tell us about your project..." style="${inputStyle};resize:vertical"></textarea></div>
      <div><button type="submit" class="pb-btn" style="padding:12px 28px;background:${esc(accent)};color:#fff;border:none;border-radius:${br};font-size:1rem;font-weight:600;cursor:pointer">${esc((p.buttonLabel as string) || "Send Message")}</button></div>
    </form>
  </div>` : "";

  return `<section style="background:${esc(bg)};padding:${pad}">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px">
    <div style="margin-bottom:48px">
      ${p.subtitle ? `<p style="font-size:14px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:${esc(accent)};margin:0 0 8px">${esc(p.subtitle as string)}</p>` : ""}
      ${p.title ? `<h2 style="font-size:var(--h2-size, 2rem);font-weight:var(--heading-weight, 700);color:${esc(accent)};font-family:var(--heading-font);line-height:var(--heading-line-height, 1.2);margin:0 0 12px">${esc(p.title as string)}</h2>` : ""}
      ${p.description ? `<p style="color:var(--text-color, #374151);max-width:700px;margin:0;opacity:.85">${esc(p.description as string)}</p>` : ""}
    </div>
    <div class="pb-grid-2col" style="display:grid;grid-template-columns:1fr 1.5fr;gap:48px;align-items:start">
      ${infoCard}
      ${formCard}
    </div>
  </div>
</section>`;
}

function PhotoCollage(p: Props): string {
  const pad = `${p.padding ?? 40}px 24px`;
  const bg = (p.backgroundColor || "#fff") as string;
  const gap = Number(p.gap) || 8;
  const br = `${p.borderRadius ?? 8}px`;
  const images = (p.images as Array<{ url?: string; alt?: string }> | undefined) ?? [];
  const valid = images.filter((img) => img.url);
  if (!valid.length) return "";

  if (p.layout === "hero") {
    const heroSpans = [
      "grid-column:1;grid-row:1 / span 3",
      "grid-column:2;grid-row:1",
      "grid-column:3;grid-row:1",
      "grid-column:2;grid-row:2",
      "grid-column:3;grid-row:2",
    ];
    return `<section style="background:${esc(bg)};padding:${pad}">
  <div class="pb-collage" style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr;grid-template-rows:repeat(3,160px);gap:${gap}px">
    ${valid.slice(0, 5).map((img, i) => `<div style="${heroSpans[i] || ""};border-radius:${br};overflow:hidden"><img src="${esc(img.url)}" alt="${esc(img.alt || "")}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block"></div>`).join("")}
  </div>
</section>`;
  }

  const spans = ["grid-column:span 2;grid-row:span 2", "", "", "", "grid-column:span 2", "", "", "grid-column:span 2", ""];
  return `<section style="background:${esc(bg)};padding:${pad}">
  <div class="pb-collage" style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(3,200px);gap:${gap}px">
    ${valid.slice(0, 9).map((img, i) => `<div style="${spans[i] || ""};border-radius:${br};overflow:hidden"><img src="${esc(img.url)}" alt="${esc(img.alt || "")}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block"></div>`).join("")}
  </div>
</section>`;
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

// ─── Section template HTML renderers ─────────────────────────────────────────
// Each section template stores child blocks in per-instance DropZone slots
// named "{uid}-s{N}" where uid = cssId || "st-{blockId.slice(-8)}".
// We render those zones recursively so the published HTML matches the canvas.

function sectionUid(p: Props): string {
  return (p.cssId as string) || `st-${String(p.id ?? "x").slice(-8)}`;
}

// Puck saves zones as "{props.id}:{zoneName}" where:
//   props.id  = the block's Puck UUID  (e.g. "4a7b2c1d-e5f6-7890-abcd-ef1234567890")
//   zoneName  = what was passed to <DropZone zone="..."> in the React render
// uid is embedded inside the zone name, not the key prefix.
function sectionSlot(blockId: string, uid: string, slot: number, zones: Zones): string {
  const zoneName = `${uid}-s${slot}`;
  const items = zoneContent(blockId, zoneName, zones);
  return renderBlocks(items as Block[], zones);
}

// Wraps section content in a <section> with background / padding from props
function sectionWrapHtml(p: Props, inner: string): string {
  const pt = (p.advPadding as { top?: number } | undefined)?.top ?? 60;
  const pb = (p.advPadding as { bottom?: number } | undefined)?.bottom ?? 60;
  const pl = (p.advPadding as { left?: number } | undefined)?.left ?? 0;
  const pr = (p.advPadding as { right?: number } | undefined)?.right ?? 0;
  const minH = Number(p.minHeightPx ?? 0) > 0 ? `min-height:${p.minHeightPx}px;` : "";
  const maxW = p.contentWidth === "boxed" ? `max-width:${p.containerWidth ?? 1140}px;margin-left:auto;margin-right:auto;` : "";

  let bg = "";
  if (p.bgType === "color" && p.bgColor) bg = `background-color:${esc(p.bgColor as string)};`;
  else if (p.bgType === "gradient" && p.bgGrad1 && p.bgGrad2)
    bg = `background:linear-gradient(${p.bgGradAngle ?? 180}deg,${esc(p.bgGrad1 as string)},${esc(p.bgGrad2 as string)});`;
  else if (p.bgType === "image" && p.bgImage)
    bg = `background-image:url(${esc(p.bgImage as string)});background-size:${esc((p.bgSize as string) || "cover")};background-position:${esc((p.bgPos as string) || "center")};`;

  const cssId = p.cssId ? ` id="${esc(p.cssId as string)}"` : "";
  const cssClass = p.cssClass ? ` class="${esc(p.cssClass as string)}"` : "";

  return `<section${cssId}${cssClass} style="position:relative;overflow:hidden;${bg}${minH}padding:${pt}px ${pr}px ${pb}px ${pl}px;box-sizing:border-box">
  <div style="${maxW}width:100%;box-sizing:border-box">
    ${inner}
  </div>
</section>`;
}

// ── Section_Hero ──────────────────────────────────────────────────────────────
function renderSectionHero(p: Props, _zones: Zones): string {
  const layout = (p.heroLayout as string) ?? "split";
  const align  = ((p.alignment as string) ?? "text-left").replace("text-", "");
  const justifyContent = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
  const isBg = layout === "image-bg" && !!p.imageUrl;
  const isCentered = layout === "centered";
  const overlayOpacity = Number(p.overlayOpacity ?? 40) / 100;
  const textColor = isBg ? "#ffffff" : "#111827";
  const subtitleColor = isBg ? "rgba(255,255,255,0.85)" : "#6b7280";

  const badge = p.badge ? `<span style="display:inline-block;background:#005bd3;color:#fff;font-size:12px;font-weight:700;padding:3px 12px;border-radius:4px;margin-bottom:16px;letter-spacing:0.04em">${esc(p.badge as string)}</span>` : "";
  const headline = `<h1 style="font-size:clamp(1.75rem,4vw,3rem);font-weight:800;color:${textColor};line-height:1.2;margin:0 0 16px">${esc((p.title as string) || "Your Headline Here")}</h1>`;
  const subtitle = p.subtitle ? `<p style="font-size:1.1rem;color:${subtitleColor};line-height:1.6;margin:0 0 32px;max-width:560px${align === "center" ? ";margin-left:auto;margin-right:auto" : ""}">${esc(p.subtitle as string)}</p>` : "";
  const btnPrimary = p.primaryLabel ? `<a href="${esc((p.primaryUrl as string) || "#")}" style="display:inline-block;background:#005bd3;color:#fff;padding:12px 28px;border-radius:6px;font-weight:700;font-size:15px;text-decoration:none">${esc(p.primaryLabel as string)}</a>` : "";
  const btnSecondary = p.secondaryLabel ? `<a href="${esc((p.secondaryUrl as string) || "#")}" style="display:inline-block;background:transparent;color:${isBg ? "#fff" : "#005bd3"};padding:12px 28px;border-radius:6px;font-weight:600;font-size:15px;text-decoration:none;border:2px solid ${isBg ? "rgba(255,255,255,0.6)" : "#005bd3"}">${esc(p.secondaryLabel as string)}</a>` : "";
  const buttons = (btnPrimary || btnSecondary) ? `<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:${justifyContent}">${btnPrimary}${btnSecondary}</div>` : "";

  const textBlock = `<div style="text-align:${align};max-width:${isCentered ? "720px" : "100%"};${isCentered ? "margin:0 auto;" : ""}">${badge}${headline}${subtitle}${buttons}</div>`;

  const imageTag = p.imageUrl && !isBg
    ? `<img src="${esc(p.imageUrl as string)}" alt="${esc((p.imageAlt as string) || "")}" style="width:100%;max-width:520px;border-radius:12px;object-fit:cover;display:block">`
    : "";

  const pt = (p.advPadding as {top?:number}|undefined)?.top ?? 80;
  const pb = (p.advPadding as {bottom?:number}|undefined)?.bottom ?? 80;
  const bgStyle = isBg
    ? `background-color:#111827;background-image:url(${esc(p.imageUrl as string)});background-size:cover;background-position:center;position:relative;overflow:hidden;`
    : `background-color:${p.bgType === "color" && p.bgColor ? esc(p.bgColor as string) : "#ffffff"};`;

  const overlay = isBg ? `<div style="position:absolute;inset:0;background-color:rgba(0,0,0,${overlayOpacity});z-index:0"></div>` : "";

  if (isBg) {
    return `<section style="${bgStyle}padding:${pt}px 0 ${pb}px;box-sizing:border-box">
  ${overlay}
  <div style="position:relative;z-index:1;max-width:1140px;margin:0 auto;padding:0 24px;box-sizing:border-box">${textBlock}</div>
</section>`;
  }

  if (isCentered) {
    return `<section style="${bgStyle}padding:${pt}px 0 ${pb}px;box-sizing:border-box">
  <div style="max-width:1140px;margin:0 auto;padding:0 24px;box-sizing:border-box">${textBlock}</div>
</section>`;
  }

  return `<section style="${bgStyle}padding:${pt}px 0 ${pb}px;box-sizing:border-box">
  <div style="max-width:1140px;margin:0 auto;padding:0 24px;box-sizing:border-box;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center">
    ${textBlock}
    ${imageTag ? `<div>${imageTag}</div>` : ""}
  </div>
</section>`;
}

// ── Section_About ─────────────────────────────────────────────────────────────
function renderSectionAbout(p: Props, zones: Zones): string {
  const id = String(p.id ?? "");
  const uid = sectionUid(p);
  const slot = (n: number) => sectionSlot(id, uid, n, zones);
  const isRight = p.imagePosition === "right";
  const imgHtml = p.imageUrl
    ? `<img src="${esc(p.imageUrl as string)}" alt="${esc((p.imageAlt as string) || "")}" style="width:100%;border-radius:8px;object-fit:cover;max-height:400px;display:block">`
    : slot(0);
  const textHtml = slot(1);
  const [left, right] = isRight ? [textHtml, imgHtml] : [imgHtml, textHtml];
  return sectionWrapHtml(p, `<div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center"><div>${left}</div><div>${right}</div></div>`);
}

// ── Section_Gallery ───────────────────────────────────────────────────────────
function renderSectionGallery(p: Props, zones: Zones): string {
  const id = String(p.id ?? "");
  const uid = sectionUid(p);
  const slot = (n: number) => sectionSlot(id, uid, n, zones);
  const gap = Number(p.gap ?? 12);
  const heading = p.showHeading !== false ? slot(0) : "";
  const row1 = [1,2,3].map((s) => `<div style="min-width:0">${slot(s)}</div>`).join("");
  const row2 = [4,5,6,7].map((s) => `<div style="min-width:0">${slot(s)}</div>`).join("");
  return sectionWrapHtml(p, `${heading}<div style="margin-top:${heading ? 20 : 0}px;display:grid;grid-template-columns:repeat(3,1fr);gap:${gap}px">${row1}</div><div style="margin-top:${gap}px;display:grid;grid-template-columns:repeat(4,1fr);gap:${gap}px">${row2}</div>`);
}

// ── Section_Testimonial ───────────────────────────────────────────────────────
function renderSectionTestimonial(p: Props, zones: Zones): string {
  const id = String(p.id ?? "");
  const uid = sectionUid(p);
  const slot = (n: number) => sectionSlot(id, uid, n, zones);
  const cols = Math.min(Number(p.reviewCount ?? 3), 4);
  const cards = Array.from({length: cols}, (_, i) => `<div style="min-width:0">${slot(i + 1)}</div>`).join("");
  return sectionWrapHtml(p, `${slot(0)}<div style="margin-top:24px;display:grid;grid-template-columns:repeat(${cols},1fr);gap:24px">${cards}</div>`);
}

// ── Section_Carousel ─────────────────────────────────────────────────────────
function renderSectionCarousel(p: Props, zones: Zones): string {
  const id = String(p.id ?? "");
  const uid = sectionUid(p);
  const slot = (n: number) => sectionSlot(id, uid, n, zones);
  const cols = Number(p.cardCount ?? 3);
  const marquee = p.showMarquee !== false
    ? MarqueeBar({ text: p.marqueeText || "Announcement · ", backgroundColor: p.marqueeBg || "#1a1a1a", textColor: p.marqueeColor || "#ffffff", speed: 30, repeat: 4, pauseOnHover: true })
    : "";
  const cards = Array.from({length: cols}, (_, i) => `<div style="min-width:0">${slot(i + 1)}</div>`).join("");
  return marquee + sectionWrapHtml(p, `${slot(0)}<div style="margin-top:20px;display:grid;grid-template-columns:repeat(${cols},1fr);gap:20px">${cards}</div>`);
}

// ── Section_Form ──────────────────────────────────────────────────────────────
function renderSectionForm(p: Props, zones: Zones): string {
  const id = String(p.id ?? "");
  const uid = sectionUid(p);
  const slot = (n: number) => sectionSlot(id, uid, n, zones);
  return sectionWrapHtml(p, `${slot(0)}<div style="margin-top:28px;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start"><div>${slot(1)}</div><div>${slot(2)}</div></div>`);
}

// ── Section_Countdown ────────────────────────────────────────────────────────
function renderSectionCountdown(p: Props, zones: Zones): string {
  const id = String(p.id ?? "");
  const uid = sectionUid(p);
  const slot = (n: number) => sectionSlot(id, uid, n, zones);
  const progress = p.showProgress !== false ? `<div style="background:rgba(255,255,255,0.1);border-radius:8px;padding:12px 16px;margin-top:16px"><div style="font-size:12px;color:#cbd5e1;margin-bottom:6px">${esc((p.progressLabel as string) || "73% sold")}</div><div style="background:rgba(255,255,255,0.15);border-radius:999px;height:8px;overflow:hidden"><div style="height:100%;width:${Number(p.progressValue ?? 73)}%;background:${esc((p.progressColor as string) || "#ef4444")};border-radius:999px"></div></div></div>` : "";
  return sectionWrapHtml(p, `<div style="text-align:center">${slot(0)}<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0"><div>${slot(1)}</div><div>${slot(2)}</div><div>${slot(3)}</div><div>${slot(4)}</div></div>${slot(5)}${progress}</div>`);
}

// ── Section_MediaCarousel ────────────────────────────────────────────────────
function renderSectionMediaCarousel(p: Props, zones: Zones): string {
  const id = String(p.id ?? "");
  const uid = sectionUid(p);
  const slot = (n: number) => sectionSlot(id, uid, n, zones);
  const thumbCount = Number(p.thumbnailCount ?? 4);
  const thumbs = Array.from({length: thumbCount}, (_, i) => `<div style="min-width:0">${slot(i + 2)}</div>`).join("");
  return sectionWrapHtml(p, `${slot(0)}<div style="margin-top:20px">${slot(1)}</div><div style="margin-top:12px;display:grid;grid-template-columns:repeat(${thumbCount},1fr);gap:8px">${thumbs}</div>`);
}

// ── Section_Services ─────────────────────────────────────────────────────────
function renderSectionServices(p: Props, zones: Zones): string {
  const id = String(p.id ?? "");
  const uid = sectionUid(p);
  const slot = (n: number) => sectionSlot(id, uid, n, zones);
  const count = Number(p.serviceCount ?? 3);
  const cards = Array.from({length: count}, (_, i) => `<div style="min-width:0">${slot(i + 1)}</div>`).join("");
  return sectionWrapHtml(p, `${slot(0)}<div style="margin-top:28px;display:grid;grid-template-columns:repeat(${count},1fr);gap:28px">${cards}</div>`);
}

// ── Section_Pricing ──────────────────────────────────────────────────────────
function renderSectionPricing(p: Props, zones: Zones): string {
  const id = String(p.id ?? "");
  const uid = sectionUid(p);
  const slot = (n: number) => sectionSlot(id, uid, n, zones);
  const count = Number(p.tierCount ?? 3);
  const tiers = Array.from({length: count}, (_, i) => `<div style="min-width:0">${slot(i + 1)}</div>`).join("");
  return sectionWrapHtml(p, `${slot(0)}<div style="margin-top:28px;display:grid;grid-template-columns:repeat(${count},1fr);gap:24px">${tiers}</div>`);
}

// ── Section_CTA ───────────────────────────────────────────────────────────────
function renderSectionCTA(p: Props, zones: Zones): string {
  const id = String(p.id ?? "");
  const uid = sectionUid(p);
  const slot = (n: number) => sectionSlot(id, uid, n, zones);
  const align = (p.alignment as string || "text-center").replace("text-", "");
  return sectionWrapHtml(p, `<div style="text-align:${align}">${slot(0)}<div style="margin-top:16px">${slot(1)}</div></div>`);
}

// ── Section_FAQ ───────────────────────────────────────────────────────────────
function renderSectionFAQ(p: Props, zones: Zones): string {
  const id = String(p.id ?? "");
  const uid = sectionUid(p);
  const slot = (n: number) => sectionSlot(id, uid, n, zones);
  const count = Number(p.faqCount ?? 4);
  const items = Array.from({length: count}, (_, i) => `<div style="margin-bottom:8px">${slot(i + 1)}</div>`).join("");
  return sectionWrapHtml(p, `${slot(0)}<div style="margin-top:28px">${items}</div>`);
}

// ── Section_Team ─────────────────────────────────────────────────────────────
function renderSectionTeam(p: Props, zones: Zones): string {
  const id = String(p.id ?? "");
  const uid = sectionUid(p);
  const slot = (n: number) => sectionSlot(id, uid, n, zones);
  const count = Number(p.memberCount ?? 4);
  const members = Array.from({length: count}, (_, i) => `<div style="min-width:0">${slot(i + 1)}</div>`).join("");
  return sectionWrapHtml(p, `${slot(0)}<div style="margin-top:28px;display:grid;grid-template-columns:repeat(${count},1fr);gap:24px">${members}</div>`);
}

// ── Section_Logos ─────────────────────────────────────────────────────────────
function renderSectionLogos(p: Props, zones: Zones): string {
  const id = String(p.id ?? "");
  const uid = sectionUid(p);
  const slot = (n: number) => sectionSlot(id, uid, n, zones);
  const count = Math.min(Number(p.logoCount ?? 6), 12);
  const logos = Array.from({length: count}, (_, i) => `<div style="min-width:0">${slot(i + 1)}</div>`).join("");
  return sectionWrapHtml(p, `${slot(0)}<div style="margin-top:16px;display:grid;grid-template-columns:repeat(${Math.min(count,6)},1fr);gap:16px">${logos}</div>`);
}

// ── Section_Features ─────────────────────────────────────────────────────────
function renderSectionFeatures(p: Props, zones: Zones): string {
  const id = String(p.id ?? "");
  const uid = sectionUid(p);
  const slot = (n: number) => sectionSlot(id, uid, n, zones);
  const count = Number(p.featureCount ?? 3);
  const cards = Array.from({length: count}, (_, i) => `<div style="min-width:0">${slot(i + 1)}</div>`).join("");
  return sectionWrapHtml(p, `${slot(0)}<div style="margin-top:28px;display:grid;grid-template-columns:repeat(${count},1fr);gap:32px">${cards}</div>`);
}

// ── Section_Newsletter ────────────────────────────────────────────────────────
function renderSectionNewsletter(p: Props, zones: Zones): string {
  const id = String(p.id ?? "");
  const uid = sectionUid(p);
  const slot = (n: number) => sectionSlot(id, uid, n, zones);
  return sectionWrapHtml(p, `<div style="max-width:560px;margin:0 auto;text-align:center">${slot(0)}<div style="margin-top:16px">${slot(1)}</div></div>`);
}

// ── Section_Video ─────────────────────────────────────────────────────────────
function renderSectionVideo(p: Props, zones: Zones): string {
  const id = String(p.id ?? "");
  const uid = sectionUid(p);
  const slot = (n: number) => sectionSlot(id, uid, n, zones);
  const heading = p.showHeading !== false ? slot(0) : "";
  const videoEl = p.videoUrl
    ? (() => {
        const ytMatch = String(p.videoUrl).match(/(?:v=|youtu\.be\/)([^&?/]+)/);
        const vimeoMatch = String(p.videoUrl).match(/vimeo\.com\/(\d+)/);
        if (ytMatch) return `<div style="aspect-ratio:16/9"><iframe src="https://www.youtube.com/embed/${ytMatch[1]}" style="width:100%;height:100%;border:none" allowfullscreen></iframe></div>`;
        if (vimeoMatch) return `<div style="aspect-ratio:16/9"><iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}" style="width:100%;height:100%;border:none" allowfullscreen></iframe></div>`;
        return `<video src="${esc(p.videoUrl as string)}" controls style="width:100%;border-radius:8px"></video>`;
      })()
    : slot(1);
  return sectionWrapHtml(p, `${heading}<div style="margin-top:${heading ? 20 : 0}px">${videoEl}</div>`);
}

// ── Section_Stats ─────────────────────────────────────────────────────────────
function renderSectionStats(p: Props, zones: Zones): string {
  const id = String(p.id ?? "");
  const uid = sectionUid(p);
  const slot = (n: number) => sectionSlot(id, uid, n, zones);
  const count = Number(p.statCount ?? 4);
  const heading = p.sectionTitle ? slot(0) : "";
  const border = p.showDividers !== false ? "border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;" : "";
  const stats = Array.from({length: count}, (_, i) => `<div style="min-width:0;text-align:center">${slot(i + 1)}</div>`).join("");
  return sectionWrapHtml(p, `${heading}<div style="margin-top:${heading ? 24 : 0}px;${border}padding:24px 0;display:grid;grid-template-columns:repeat(${count},1fr);gap:24px">${stats}</div>`);
}

// ── LayoutBlock (Container) ───────────────────────────────────────────────────
function renderLayoutBlock(p: Props, zones: Zones): string {
  const blockId = String(p.id ?? "");
  const uid = (p.cssId as string) || `pb-container-${blockId.slice(-8)}`;
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
  const uid = (p.cssId as string) || `pb-grid-${blockId.slice(-8)}`;
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
  const uid = (p.cssId as string) || `pb-section-${blockId.slice(-8)}`;
  const cols = Math.max(1, Number(p.columns ?? 1));
  const colGap = `${p.columnGapPx ?? 32}px`;
  const rowGap = `${p.rowGapPx ?? 32}px`;
  const cells = Array.from({length: cols}, (_, i) => {
    const zoneName = `section-${uid}-col-${i}`;
    const content = zoneContent(blockId, zoneName, zones);
    return `<div style="min-width:0">${renderBlocks(content as Block[], zones)}</div>`;
  }).join("");
  const pt = (p.advPadding as {top?:number}|undefined)?.top ?? 60;
  const pb = (p.advPadding as {bottom?:number}|undefined)?.bottom ?? 60;
  const pl = (p.advPadding as {left?:number}|undefined)?.left ?? 0;
  const pr = (p.advPadding as {right?:number}|undefined)?.right ?? 0;
  const maxW = p.contentWidth === "boxed" ? `max-width:${p.containerWidth ?? 1140}px;margin:0 auto;` : "";
  let bg = "";
  if (p.bgType === "color" && p.bgColor) bg = `background-color:${esc(p.bgColor as string)};`;
  else if (p.bgType === "gradient" && p.bgGrad1 && p.bgGrad2)
    bg = `background:linear-gradient(${p.bgGradAngle ?? 180}deg,${esc(p.bgGrad1 as string)},${esc(p.bgGrad2 as string)});`;
  else if (p.bgType === "image" && p.bgImage)
    bg = `background-image:url(${esc(p.bgImage as string)});background-size:cover;background-position:center;`;
  return `<section style="position:relative;overflow:hidden;${bg}padding:${pt}px ${pr}px ${pb}px ${pl}px;box-sizing:border-box"><div style="${maxW}width:100%;box-sizing:border-box"><div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${rowGap} ${colGap}">${cells}</div></div></section>`;
}

// ─── New block renderers ──────────────────────────────────────────────────────

function advSpacing(p: Props): string {
  const m = p.advMargin as any ?? {};
  const pad = p.advPadding as any ?? {};
  const mt = m.top ?? 0, mr = m.right ?? 0, mb = m.bottom ?? 0, ml = m.left ?? 0;
  const pt = pad.top ?? 0, pr = pad.right ?? 0, pb = pad.bottom ?? 0, pl = pad.left ?? 0;
  return `margin:${mt}px ${mr}px ${mb}px ${ml}px;padding:${pt}px ${pr}px ${pb}px ${pl}px;`;
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
  const thickness = p.thickness ?? 1;
  const style = esc((p.lineStyle as string) || "solid");
  const width = p.lineWidthVal != null ? `${p.lineWidthVal}${(p.lineWidthUnit as string) || "%"}` : esc((p.lineWidth as string) || "100%");
  const gap = Number(p.gap ?? 16) || 16;
  const align = (p.alignment as string) || "center";
  const justify = flexJustify(align);

  let inner = "";
  if (p.showElement) {
    const elType = (p.elementType as string) || "icon";
    const elSpacing = `${Number(p.elementSpacing ?? 12)}px`;
    const elContent = elType === "text"
      ? `<span style="font-size:${p.elementFontSize ?? 14}px;color:${esc((p.elementTextColor as string) || color)};white-space:nowrap">${esc((p.elementText as string) || "OR")}</span>`
      : `<span style="font-size:${p.iconSize ?? 20}px;color:${esc((p.iconColor as string) || color)};line-height:1">${esc((p.elementIcon as string) || "✦")}</span>`;
    const elPos = (p.elementPosition as string) || "center";
    const lineEl = `<div style="flex:1;border-top:${thickness}px ${style} ${color}"></div>`;
    const elDiv = `<div style="flex-shrink:0;padding:0 ${elSpacing}">${elContent}</div>`;
    if (elPos === "left") inner = `<div style="display:flex;align-items:center;width:${width}">${elDiv}${lineEl}</div>`;
    else if (elPos === "right") inner = `<div style="display:flex;align-items:center;width:${width}">${lineEl}${elDiv}</div>`;
    else inner = `<div style="display:flex;align-items:center;width:${width}">${lineEl}${elDiv}${lineEl}</div>`;
  } else {
    inner = `<div style="width:${width};border-top:${thickness}px ${style} ${color}"></div>`;
  }
  return `<div style="${spacing}padding-top:${gap}px;padding-bottom:${gap}px;display:flex;justify-content:${justify};${advBgStyle(p)}">${inner}</div>`;
}

function renderVideo(p: Props): string {
  const spacing = advSpacing(p);
  const videoUrl = (p.videoUrl as string) || "";
  const sourceType = (p.sourceType as string) || "youtube";
  const thumbnailUrl = (p.thumbnailUrl as string) || "";
  const aspectRatio = (p.aspectRatio as string) || "16:9";
  const videoWidthVal = p.videoWidthVal ?? 100;
  const videoWidthUnit = (p.videoWidthUnit as string) || "%";
  const width = `${videoWidthVal}${videoWidthUnit}`;
  const borderRadius = `${Number(p.borderRadius ?? 0)}px`;
  const ratioMap: Record<string, string> = { "16:9": "56.25%", "4:3": "75%", "1:1": "100%" };
  const paddingBottom = aspectRatio === "custom" ? "0" : (ratioMap[aspectRatio] ?? "56.25%");
  const containerH = aspectRatio === "custom" ? `${Number(p.customHeightVal ?? 450)}${esc((p.customHeightUnit as string) || "px")}` : "0";
  const isNative = sourceType === "self" || sourceType === "upload";
  const autoplay = p.autoplay as boolean;
  const startTime = p.startTime as number | null;
  const endTime = p.endTime as number | null;

  // Play button style
  const playBtnStyle = (p.playBtnStyle as string) || "default";
  const btnSize = Number(p.playIconSize ?? 64);
  const btnBg = esc((p.playBtnBg as string) || "rgba(0,0,0,0.5)");
  const btnRadius = playBtnStyle === "custom" ? `${Number(p.playBtnRadius ?? 50)}px` : "50%";
  const btnColor = esc((p.playIconColor as string) || "#fff");
  const iconSize = Math.round(btnSize * 0.4);

  if (!videoUrl && !thumbnailUrl) {
    return `<div style="${spacing}padding:24px;border:2px dashed #e5e7eb;border-radius:8px;color:#9ca3af;font-size:14px;text-align:center">No video URL set.</div>`;
  }

  let embedUrl = "";
  if (sourceType === "youtube" && videoUrl && !videoUrl.startsWith("data:")) {
    const match = videoUrl.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    const id = match?.[1] ?? "";
    const params = new URLSearchParams();
    if (autoplay) params.set("autoplay", "1");
    if (p.loop) { params.set("loop", "1"); params.set("playlist", id); }
    if (p.mute) params.set("mute", "1");
    if ((p.controls as string) === "hide") params.set("controls", "0");
    if (startTime != null && startTime > 0) params.set("start", String(startTime));
    if (endTime != null && endTime > 0) params.set("end", String(endTime));
    embedUrl = `https://www.youtube.com/embed/${id}?${params.toString()}`;
  } else if (sourceType === "vimeo" && videoUrl && !videoUrl.startsWith("data:")) {
    const match = videoUrl.match(/vimeo\.com\/(\d+)/);
    const id = match?.[1] ?? "";
    const params = new URLSearchParams();
    if (autoplay) params.set("autoplay", "1");
    if (p.loop) params.set("loop", "1");
    if (p.mute) params.set("muted", "1");
    if ((p.controls as string) === "hide") params.set("controls", "0");
    if (startTime != null && startTime > 0) params.set("t", String(startTime));
    embedUrl = `https://player.vimeo.com/video/${id}?${params.toString()}`;
  }

  const containerStyle = `position:relative;width:${width};padding-bottom:${paddingBottom};height:${containerH !== "0" ? containerH : "0"};overflow:hidden;border-radius:${borderRadius};background:#000;`;
  const absStyle = `position:absolute;inset:0;width:100%;height:100%;`;

  let videoInner = "";
  if (isNative && videoUrl && !videoUrl.startsWith("data:")) {
    const ctrlAttr = (p.controls as string) !== "hide" ? " controls" : "";
    const autoAttr = autoplay ? " autoplay" : "";
    const loopAttr = p.loop ? " loop" : "";
    const mutedAttr = p.mute ? " muted" : "";
    const inlineAttr = p.playInline !== false ? " playsinline" : "";
    videoInner = `<video src="${esc(videoUrl)}"${ctrlAttr}${autoAttr}${loopAttr}${mutedAttr}${inlineAttr} style="${absStyle}object-fit:cover"></video>`;
  } else if (embedUrl) {
    videoInner = `<iframe src="${esc(embedUrl)}" style="${absStyle}border:none" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  }

  const playBtnHtml = `<div style="${absStyle}display:flex;align-items:center;justify-content:center;pointer-events:none;"><div style="width:${btnSize}px;height:${btnSize}px;background:${btnBg};border-radius:${btnRadius};display:flex;align-items:center;justify-content:center;"><svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${btnColor}"><path d="M8 5v14l11-7z"/></svg></div></div>`;

  // Thumbnail: static when no videoUrl, clickable overlay when videoUrl exists
  let thumbnailInner = "";
  if (thumbnailUrl && !thumbnailUrl.startsWith("data:")) {
    if (!videoUrl) {
      thumbnailInner = `<img src="${esc(thumbnailUrl)}" alt="Video thumbnail" style="${absStyle}object-fit:cover">`;
    } else if (!autoplay) {
      thumbnailInner = `<div class="pb-vid-thumb" style="${absStyle}cursor:pointer;z-index:2;" onclick="this.style.display='none'"><img src="${esc(thumbnailUrl)}" alt="Video thumbnail" style="width:100%;height:100%;object-fit:cover">${playBtnHtml}</div>`;
    }
  }

  const inner = videoInner || thumbnailInner;
  return `<div style="${spacing}">${inner ? `<div style="${containerStyle}">${videoInner}${thumbnailInner}</div>` : ""}</div>`;
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
  const spacing = advSpacing(p);
  const enabled = (p.enabled as string[]) ?? ["facebook", "instagram", "twitter", "youtube"];
  const urls = (p.urls as Record<string, string>) ?? {};
  const newTab = p.newTab !== false;
  const iconStyle = (p.iconStyle as string) || "filled";
  const iconSize = parseFloat((p.iconSize as string) || "24") || 24;
  const iconColor = (p.iconColor as string) || "";
  const iconBgColor = (p.iconBgColor as string) || "";
  const bgShape = (p.bgShape as string) || "circle";
  const bgSize = esc((p.bgSize as string) || "40px");
  const borderStyle = (p.borderStyle as string) || "none";
  const borderWidth = p.borderWidth ?? 1;
  const borderColor = (p.borderColor as string) || "";
  const borderRadius = esc((p.borderRadius as string) || "50%");
  const iconSpacing = esc((p.iconSpacing as string) || "12px");
  const alignment = (p.alignment as string) || "left";
  const shapeRadius = bgShape === "circle" ? "50%" : bgShape === "rounded" ? "10px" : bgShape === "square" ? "0px" : undefined;

  const icons = enabled.map(key => {
    const svg = SOCIAL_SVGS[key] ?? "";
    const brand = SOCIAL_BRAND[key] ?? "#333";
    const isBranded = iconStyle === "branded";
    const color = isBranded ? (bgShape !== "none" ? "#fff" : brand) : (iconColor || "currentColor");
    const bg = bgShape !== "none" ? (isBranded ? brand : (iconBgColor || "#e5e7eb")) : "";
    const border = borderStyle === "solid" ? `border:${borderWidth}px solid ${borderColor || color};` : "";
    const innerStyle = bgShape !== "none"
      ? `display:inline-flex;align-items:center;justify-content:center;width:${bgSize};height:${bgSize};background:${bg};border-radius:${shapeRadius};${border}color:${color};flex-shrink:0;font-size:${iconSize}px;`
      : `display:inline-flex;align-items:center;justify-content:center;color:${color};font-size:${iconSize}px;`;
    const inner = `<span style="${innerStyle}">${svg}</span>`;
    const url = urls[key];
    return url
      ? `<a href="${esc(url)}" target="${newTab ? "_blank" : "_self"}" rel="noopener noreferrer" title="${esc(key)}" style="text-decoration:none;color:inherit">${inner}</a>`
      : `<span style="${innerStyle}opacity:0.4" title="${esc(key)} (no URL)">${svg}</span>`;
  }).join("");

  return `<div style="${spacing}${advBgStyle(p)}"><div style="display:flex;gap:${iconSpacing};flex-wrap:wrap;justify-content:${flexJustify(alignment)}">${icons}</div></div>`;
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
  const spacing = advSpacing(p);
  const enabled = (p.enabled as string[]) ?? ["facebook", "twitter", "whatsapp", "email", "copy"];
  const labels = (p.labels as Record<string, string>) ?? {};
  const showLabel = p.showLabel !== false;
  const btnStyle = (p.btnStyle as string) || "icon-text";
  const btnSize = (p.btnSize as string) || "medium";
  const borderRadius = esc((p.borderRadius as string) || "6px");
  const spacing2 = esc((p.spacing as string) || "8px");
  const iconColor = (p.iconColor as string) || "";
  const textColor = (p.textColor as string) || "";
  const bgColor = (p.bgColor as string) || "";
  const useBrandColors = !!p.useBrandColors;
  const fontSize = esc((p.fontSize as string) || "0.875rem");
  const fontWeight = p.fontWeight || "600";
  const alignment = (p.alignment as string) || "left";
  const sizeMap: Record<string, string> = { small: "8px 12px", medium: "10px 16px", large: "12px 20px" };
  const pad = sizeMap[btnSize] ?? sizeMap.medium;

  const platforms = SHARE_PLATFORMS_R.filter(pl => enabled.includes(pl.key));
  const shareUrlMap: Record<string, string> = {
    facebook:  "https://www.facebook.com/sharer/sharer.php?u=",
    twitter:   "https://twitter.com/intent/tweet?url=",
    whatsapp:  "https://wa.me/?text=",
    pinterest: "https://pinterest.com/pin/create/button/?url=",
    email:     "mailto:?body=",
  };

  const btns = platforms.map(pl => {
    const resolvedBg = useBrandColors ? pl.brand : (bgColor || "#f3f4f6");
    const resolvedText = useBrandColors ? "#fff" : (textColor || "var(--text-color)");
    const resolvedIcon = useBrandColors ? "#fff" : (iconColor || "var(--text-color)");
    const btnLabel = labels[pl.key] ?? pl.label;
    const iconHtml = btnStyle !== "text-only" ? `<span style="color:${resolvedIcon};font-weight:700">${pl.icon}</span>` : "";
    const labelHtml = btnStyle !== "icon-only" && showLabel ? `<span>${btnLabel}</span>` : "";
    const btnContent = `${iconHtml}${iconHtml && labelHtml ? " " : ""}${labelHtml}`;
    if (pl.key === "copy") {
      return `<button onclick="(function(b){var t=b.textContent;navigator.clipboard&&navigator.clipboard.writeText(window.location.href).then(function(){b.textContent='Copied!';setTimeout(function(){b.textContent=t},2000)})})(this)" style="display:inline-flex;align-items:center;gap:6px;padding:${pad};font-size:${fontSize};font-weight:${fontWeight};color:${resolvedText};background:${resolvedBg};border:none;border-radius:${borderRadius};cursor:pointer">${btnContent}</button>`;
    }
    const shareBase = shareUrlMap[pl.key] ?? "#";
    return `<a href="${shareBase}%7BURL%7D" onclick="event.preventDefault();window.open('${shareBase}'+encodeURIComponent(window.location.href),'_blank','noopener,noreferrer')" style="display:inline-flex;align-items:center;gap:6px;padding:${pad};font-size:${fontSize};font-weight:${fontWeight};color:${resolvedText};background:${resolvedBg};border-radius:${borderRadius};text-decoration:none;cursor:pointer">${btnContent}</a>`;
  }).join("");

  return `<div style="${spacing}${advBgStyle(p)}"><div style="display:flex;gap:${spacing2};flex-wrap:wrap;justify-content:${flexJustify(alignment)}">${btns}</div></div>`;
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
  const title = esc((p.title as string) || "");
  const pct = Math.min(100, Math.max(0, (p.percentage as number) ?? 75));
  const barHeight = p.barHeight ?? 12;
  const barColor = esc((p.barColor as string) || "#0158ad");
  const barBg = esc((p.barBg as string) || "#e5e7eb");
  const barRadius = p.barRadius ?? 6;
  const displayPct = p.displayPercentage !== false;
  const titleFontSize = esc((p.titleFontSize as string) || "0.9rem");
  const titleFontWeight = p.titleFontWeight || "600";
  const titleColor = esc((p.titleColor as string) || "var(--text-color)");
  const titlePos = (p.titlePosition as string) || "above";
  const labelFontSize = esc((p.labelFontSize as string) || "0.8rem");
  const labelColor = esc((p.labelColor as string) || "var(--text-color)");
  const labelPos = (p.labelPosition as string) || "outside-right";

  let titleRow = "";
  if (title && titlePos === "above") {
    const labelRight = displayPct && labelPos === "outside-right" ? `<span style="font-size:${labelFontSize};color:${labelColor};font-weight:600">${pct}%</span>` : "";
    titleRow = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="font-size:${titleFontSize};font-weight:${titleFontWeight};color:${titleColor}">${title}</span>${labelRight}</div>`;
  }

  let insideTitle = title && titlePos === "inside" ? `<span style="position:absolute;left:8px;top:50%;transform:translateY(-50%);font-size:${titleFontSize};font-weight:${titleFontWeight};color:${titleColor || "#fff"};white-space:nowrap">${title}</span>` : "";
  let insideLabel = displayPct && labelPos === "inside" ? `<span style="position:absolute;right:6px;top:50%;transform:translateY(-50%);font-size:${labelFontSize};color:${labelColor || "#fff"};font-weight:600;white-space:nowrap">${pct}%</span>` : "";

  const fill = `<div style="height:100%;width:${pct}%;background:${barColor};border-radius:${barRadius}px;position:relative;transition:width 0.8s ease">${insideTitle}${insideLabel}</div>`;
  const track = `<div style="position:relative;height:${barHeight}px;background:${barBg};border-radius:${barRadius}px;overflow:hidden">${fill}</div>`;

  return `<div style="${spacing}${advBgStyle(p)}">${titleRow}${track}</div>`;
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
  const resolvedBg = esc((p.bgColor as string) || t.bg);
  const resolvedText = esc((p.textColor as string) || t.text);
  const resolvedBorder = esc((p.borderColor as string) || t.border);
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
  const iconColor = esc((p.iconColor as string) || resolvedText);

  let borderCss = "";
  if (borderStyle === "left-only") borderCss = `border-left:${borderWidth}px solid ${resolvedBorder};`;
  else if (borderStyle !== "none") borderCss = `border:${borderWidth}px solid ${resolvedBorder};`;

  const dismissible = p.dismissible === true || p.dismissible === "true";
  const uid = `alert-${Math.random().toString(36).slice(2, 9)}`;

  let iconHtml = "";
  if (showIcon) {
    iconHtml = isImgIcon
      ? `<img src="${esc(rawIcon)}" alt="icon" style="width:1.5rem;height:1.5rem;object-fit:contain;flex-shrink:0" />`
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
    box:  `border:${borderWidth}px solid ${borderColor};`,
  };

  const quoteIconSvg = `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}" style="opacity:0.15"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>`;

  let iconHtml = "";
  if (showQuoteIcon) {
    if (iconPosition === "top-left") iconHtml = `<div style="margin-bottom:8px">${quoteIconSvg}</div>`;
    else if (iconPosition === "top-right") iconHtml = `<div style="text-align:right;margin-bottom:8px">${quoteIconSvg}</div>`;
  }

  const quoteEl = `<p style="font-size:${quoteFontSize};${quoteFontFamily ? `font-family:${quoteFontFamily};` : ""}font-style:${quoteFontStyle};color:${quoteTextColor};line-height:${quoteLineHeight};margin:0 0 16px 0">&ldquo;${quoteText}&rdquo;</p>`;

  let authorEl = "";
  if (authorName || authorImage) {
    const imgEl = authorImage ? `<img src="${authorImage}" alt="${authorName}" style="width:${imageSize};height:${imageSize};border-radius:${imageBorderRadius};object-fit:cover;flex-shrink:0">` : "";
    const nameEl = authorName ? `<div style="font-size:${nameFontSize};font-weight:${nameFontWeight};color:${nameColor}">${authorName}</div>` : "";
    const titleEl = authorTitle ? `<div style="font-size:${titleFontSize};color:${titleColor};opacity:0.7">${authorTitle}</div>` : "";
    const aJustify = flexJustify(alignment);
    authorEl = `<div style="display:flex;align-items:center;gap:12px;justify-content:${aJustify}">${imgEl}<div>${nameEl}${titleEl}</div></div>`;
  }

  const bqStyle = `margin:0;position:relative;background:${bgColor || "transparent"};${bgColor ? "padding:24px;border-radius:8px;" : ""}${borderMap[borderType] || ""}`;

  return `<div style="${spacing}text-align:${alignment};${wrapExtraStyle}"><blockquote style="${bqStyle}">${iconHtml}${quoteEl}${authorEl}</blockquote></div>`;
}

function renderIcons(p: Props): string {
  const spacing = advSpacing(p);
  const iconType = (p.iconType as string) || "emoji";
  const icon = esc((p.icon as string) || "★");
  const iconImage = esc((p.iconImage as string) || "");
  const linkUrl = esc((p.linkUrl as string) || "");
  const linkTarget = esc((p.linkTarget as string) || "_self");
  const tooltip = esc((p.tooltip as string) || "");
  const iconSize = esc((p.iconSize as string) || "48px");
  const iconColor = esc((p.iconColor as string) || "var(--primary-color)");
  const rotate = p.rotate as string;
  const bgType = (p.bgType as string) || "none";
  const bgColor = esc((p.bgColor as string) || "");
  const bgGrad1 = esc((p.bgGrad1 as string) || "");
  const bgGrad2 = esc((p.bgGrad2 as string) || "");
  const bgShape = (p.bgShape as string) || "none";
  const bgSize = esc((p.bgSize as string) || "80px");
  const borderStyle = (p.borderStyle as string) || "none";
  const borderWidth = p.borderWidth ?? 2;
  const borderColor = esc((p.borderColor as string) || "");
  const borderRadius = esc((p.borderRadius as string) || "0px");
  const alignment = (p.alignment as string) || "left";
  const opacity = p.opacity != null ? (p.opacity as number) / 100 : 1;

  const bg = bgType === "color" ? bgColor : bgType === "gradient" && bgGrad1 && bgGrad2 ? `linear-gradient(135deg,${bgGrad1},${bgGrad2})` : "";
  const shapeRadius = bgShape === "circle" ? "50%" : bgShape === "rounded" ? "12px" : bgShape === "square" ? "0px" : "";
  const hasBg = !!bg || !!shapeRadius;
  const rotateStyle = rotate && rotate !== "0" ? `transform:rotate(${rotate}deg);` : "";
  const borderCss = borderStyle !== "none" ? `border:${borderWidth}px ${borderStyle} ${borderColor || "currentColor"};` : "";

  let innerStyle = hasBg
    ? `display:inline-flex;align-items:center;justify-content:center;width:${bgSize};height:${bgSize};${bg ? `background:${bg};` : ""}${shapeRadius ? `border-radius:${shapeRadius};` : ""}${borderCss}color:${iconColor};${rotateStyle}opacity:${opacity};font-size:${iconSize};`
    : `display:inline-flex;align-items:center;justify-content:center;color:${iconColor};${rotateStyle}opacity:${opacity};font-size:${iconSize};${borderCss}${borderRadius !== "0px" ? `border-radius:${borderRadius};` : ""}`;

  const isImage = iconType === "image" && iconImage;
  const iconContent = isImage
    ? `<img src="${iconImage}" alt="${tooltip || "icon"}" style="width:100%;height:100%;object-fit:contain;display:block">`
    : icon;
  const inner = `<span style="${innerStyle}"${tooltip ? ` title="${tooltip}"` : ""}>${iconContent}</span>`;
  const wrapped = linkUrl
    ? `<a href="${linkUrl}" target="${linkTarget}"${linkTarget === "_blank" ? ' rel="noopener noreferrer"' : ""} style="text-decoration:none;color:inherit;display:inline-block">${inner}</a>`
    : inner;

  return `<div style="${spacing}text-align:${alignment};${advBgStyle(p)}">${wrapped}</div>`;
}

// ─── Main render dispatcher ───────────────────────────────────────────────────

function applyHideClasses(html: string, p: Props): string {
  if (!html) return html;
  const classes = [
    p.hideDesktop ? "puck-hide-desktop" : "",
    p.hideTablet  ? "puck-hide-tablet"  : "",
    p.hideMobile  ? "puck-hide-mobile"  : "",
  ].filter(Boolean).join(" ");
  if (!classes) return html;
  return `<div class="${classes}">${html}</div>`;
}

function renderBlock(block: Block, zones: Zones): string {
  const p = block.props ?? {};
  try {
    let html = "";
    switch (block.type) {
      case "Hero":              html = Hero(p); break;
      case "GradientHero":     html = GradientHero(p); break;
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
      case "AboutSection":     html = AboutSection(p); break;
      case "GallerySection":   html = GallerySection(p); break;
      case "ServiceSection":   html = ServiceSection(p); break;
      case "TestimonialSection": html = TestimonialSection(p); break;
      case "MarqueeBar":       html = MarqueeBar(p); break;
      case "ContactSection":   html = ContactSection(p); break;
      case "PhotoCollage":     html = PhotoCollage(p); break;
      // New blocks
      case "Divider":          html = renderDivider(p); break;
      case "Video":            html = renderVideo(p); break;
      case "Icons":            html = renderIcons(p); break;
      case "BlockQuote":       html = renderBlockQuote(p); break;
      case "StarRating":       html = renderStarRating(p); break;
      case "ProgressBar":      html = renderProgressBar(p); break;
      case "Alert":            html = renderAlert(p); break;
      case "SocialIcons":      html = renderSocialIcons(p); break;
      case "ShareButtons":     html = renderShareButtons(p); break;
      // Layout / container blocks
      case "LayoutBlock":        html = renderLayoutBlock(p, zones); break;
      case "Section":            html = renderSectionBlock(p, zones); break;
      // Section templates
      case "Section_Hero":          html = renderSectionHero(p, zones); break;
      case "Section_About":         html = renderSectionAbout(p, zones); break;
      case "Section_Gallery":       html = renderSectionGallery(p, zones); break;
      case "Section_Testimonial":   html = renderSectionTestimonial(p, zones); break;
      case "Section_Carousel":      html = renderSectionCarousel(p, zones); break;
      case "Section_Form":          html = renderSectionForm(p, zones); break;
      case "Section_Countdown":     html = renderSectionCountdown(p, zones); break;
      case "Section_MediaCarousel": html = renderSectionMediaCarousel(p, zones); break;
      case "Section_Services":      html = renderSectionServices(p, zones); break;
      case "Section_Pricing":       html = renderSectionPricing(p, zones); break;
      case "Section_CTA":           html = renderSectionCTA(p, zones); break;
      case "Section_FAQ":           html = renderSectionFAQ(p, zones); break;
      case "Section_Team":          html = renderSectionTeam(p, zones); break;
      case "Section_Logos":         html = renderSectionLogos(p, zones); break;
      case "Section_Features":      html = renderSectionFeatures(p, zones); break;
      case "Section_Newsletter":    html = renderSectionNewsletter(p, zones); break;
      case "Section_Video":         html = renderSectionVideo(p, zones); break;
      case "Section_Stats":         html = renderSectionStats(p, zones); break;
      // GlobalHeader/Footer are theme concerns; GlobalBlock needs DB lookup (skip)
      default: return "";
    }
    return applyHideClasses(html, p);
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
const RESPONSIVE_CSS = `<style data-pb="responsive">
img{max-width:100%;height:auto}
@media(max-width:767px){
.pb-grid-2col{grid-template-columns:1fr!important;gap:32px!important}
.pb-grid-ncol{grid-template-columns:1fr!important}
.pb-grid-stats{grid-template-columns:repeat(2,1fr)!important;gap:12px!important}
.pb-collage{grid-template-columns:repeat(2,1fr)!important;grid-template-rows:auto!important}
.pb-collage>*{grid-column:auto!important;grid-row:auto!important}
.pb-hero{padding:40px 20px!important}
.pb-header-nav{display:none!important}
.puck-hide-mobile{display:none!important}
}
@media(min-width:768px) and (max-width:1023px){
.pb-grid-ncol{grid-template-columns:repeat(2,1fr)!important}
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

  return [
    RESPONSIVE_CSS,
    ...above.map((b) => renderBlock(b, zones)),
    ...content.map((b) => renderBlock(b, zones)),
    ...below.map((b) => renderBlock(b, zones)),
  ].join("\n");
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
  return (
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

  return (
    buildGlobalImageCss(settings) +
    buildGlobalButtonCss(settings) +
    header +
    renderPuckToHtml(data) +
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
    `.pb-btn{transition:background-color .3s ease-out,color .3s ease-out,border-color .3s ease-out,transform .3s ease-out,box-shadow .3s ease-out,filter .3s ease-out}`,
    `.pb-btn.pb-btn-outline{border-style:solid!important;border-color:currentColor!important;border-width:var(--button-border-width,2px)!important}`,
  ];

  const hoverDecl: Record<string, string> = {
    lift:  "transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.15)",
    glow:  `box-shadow:0 0 18px ${esc(pc)}44`,
    scale: "transform:scale(1.07)",
    fill:  "filter:brightness(.85) saturate(1.1)",
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

  return [
    RESPONSIVE_CSS,
    ...above.map((b) => renderBlock(b, zones)),
    ...content.map((b) => renderBlock(b, zones)),
    ...below.map((b) => renderBlock(b, zones)),
  ].join("\n");
}

/**
 * Generate the global style CSS (button + image rules) for the App Proxy response.
 * Scoped client-side by pb-widget-loader.js to the widget container.
 */
export function renderGlobalStyleCss(settings: GlobalSettings): string {
  return buildGlobalButtonCss(settings) + buildGlobalImageCss(settings);
}
