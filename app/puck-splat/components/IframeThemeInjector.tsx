import { useEffect, useRef } from "react";
import { useGlobalSettings } from "@/puck-splat/context/GlobalSettingsContext";
import { applyCSSVariables, loadGoogleFont } from "@/puck-splat/utils";

/**
 * IframeThemeInjector
 *
 * Rendered inside Puck's canvas iframe via the `iframe` override.
 * Because React portals (used by Puck to render the iframe content) maintain
 * the component tree, this component has access to GlobalSettingsContext even
 * though its DOM lives inside the preview iframe.
 *
 * It uses `ref.current.ownerDocument` to obtain the iframe's Document and
 * re-applies all CSS custom properties + dynamic effect `<style>` tags into
 * that document whenever settings change.
 */
export function IframeThemeInjector() {
  const { settings } = useGlobalSettings();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const iframeDoc = el.ownerDocument;

    // Guard: skip if we're in the outer document (non-iframe context).
    if (iframeDoc === document) return;

    // 1. Apply CSS custom properties to the iframe's .page-preview or <html>
    const previewRoot =
      (iframeDoc.querySelector(".page-preview") as HTMLElement) ??
      iframeDoc.documentElement;

    applyCSSVariables(settings, previewRoot);

    // Ensure data-theme is set on the iframe's <html> element
    if (settings.theme) {
      iframeDoc.documentElement.setAttribute("data-theme", settings.theme);
    }

    // 2. Load Google Fonts inside the iframe (fonts loaded in the outer document
    //    are not automatically shared with blank-origin iframes).
    injectFontsIntoDoc(iframeDoc, settings.fontFamily);
    if (settings.headingFont && settings.headingFont !== settings.fontFamily) {
      injectFontsIntoDoc(iframeDoc, settings.headingFont);
    }
  }, [settings]);

  // Render a hidden anchor so we can access ownerDocument.
  return <div ref={ref} style={{ display: "none" }} aria-hidden />;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SYSTEM_FONT_KEYWORDS = ["system-ui", "sans-serif", "serif", "monospace"];

function injectFontsIntoDoc(doc: Document, fontFamily: string): void {
  const fontNames = fontFamily
    .split(",")
    .map((f) => f.replace(/['"]/g, "").trim())
    .filter(
      (f) => f && !SYSTEM_FONT_KEYWORDS.some((kw) => f.toLowerCase().includes(kw)),
    );

  if (fontNames.length === 0) return;

  const fontQuery = fontNames
    .map((name) => `family=${name.replace(/\s+/g, "+")}:wght@300;400;500;600;700;800;900`)
    .join("&");
  const href = `https://fonts.googleapis.com/css2?${fontQuery}&display=swap`;

  if (!doc.head) return;
  if (doc.querySelector(`link[href="${href}"]`)) return;

  const link = doc.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  doc.head.appendChild(link);
}
