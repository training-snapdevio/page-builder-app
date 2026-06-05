/**
 * useContentSize
 *
 * Monitors the editor's current Puck data, re-renders it to HTML using the
 * same pure builder the server uses to write the Shopify page body, and
 * returns the byte size of the result.
 *
 * Why this hook exists: Shopify's pageUpdate caps the page body at 512 KB.
 * Without live feedback, users only learn they've crossed the limit when
 * their save fails. This hook drives an in-editor size indicator and lets
 * Save / Publish disable themselves before the network round-trip.
 *
 * Two exports:
 *   - useContentSize()       reactive, debounced — for the indicator pill
 *   - computeContentSize()   synchronous — for click-time guards that must
 *                            not race with the debounce
 */
import { useEffect, useMemo, useState } from "react";
import { usePuck } from "@my-app/puck-editor";
import type { PuckData } from "@/lib/page-schema";
import { renderPageWithChrome, SHOPIFY_PAGE_BODY_LIMIT } from "@/lib/puck-renderer";
import type { GlobalSettings } from "@/lib/settings.defaults";
import { useGlobalSettings } from "@/puck-splat/context/GlobalSettingsContext";

export type ContentSizeStatus = "ok" | "warning" | "over";

export interface ContentSize {
  bytes: number;
  /** Whole-number kilobytes, suitable for display. */
  kb: number;
  limitBytes: number;
  limitKb: number;
  /** 0–1+ ratio of bytes to limit (can exceed 1 when over). */
  ratio: number;
  status: ContentSizeStatus;
  isOver: boolean;
}

const WARNING_THRESHOLD = 0.85;
/** Small debounce: indicator should feel near-live while still coalescing keystrokes. */
const DEBOUNCE_MS = 120;

/**
 * Reactive page-size for the editor header indicator.
 *
 * As of the Theme App Extension migration, chrome (header/footer + shared
 * CSS/JS) is delivered site-wide by the `page-builder-renderer` extension
 * embed — it no longer lives in `page.body`. So the measured size here is
 * just the block markup; flipping global header/footer no longer changes
 * page.body size. The `settings` arg is kept for forward-compat with any
 * future block whose markup depends on a global setting.
 */
export function useContentSize(): ContentSize {
  const { appState } = usePuck();
  const data = appState.data as PuckData;
  const { settings } = useGlobalSettings();

  const [bytes, setBytes] = useState<number>(0);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const html = renderPageWithChrome(data, settings);
        setBytes(new TextEncoder().encode(html).length);
      } catch {
        // Renderer is defensive (block-level try/catch returns ""). If
        // something truly explodes we keep the previous reading rather than
        // zeroing out.
      }
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [data, settings]);

  return useMemo<ContentSize>(() => buildContentSize(bytes), [bytes]);
}

/**
 * Synchronous size check for click-time guards (Save / Publish). Mirrors the
 * server's preflight so the user sees the same error inline instead of after
 * a round-trip. Use when the reactive `useContentSize` value may be stale
 * (e.g. user types and clicks before the debounce fires).
 */
export function computeContentSize(
  data: PuckData,
  settings: GlobalSettings,
): ContentSize {
  const html = renderPageWithChrome(data, settings);
  const bytes = new TextEncoder().encode(html).length;
  return buildContentSize(bytes);
}

function buildContentSize(bytes: number): ContentSize {
  const ratio = bytes / SHOPIFY_PAGE_BODY_LIMIT;
  const status: ContentSizeStatus =
    ratio >= 1 ? "over" : ratio >= WARNING_THRESHOLD ? "warning" : "ok";
  return {
    bytes,
    kb: Math.round(bytes / 1024),
    limitBytes: SHOPIFY_PAGE_BODY_LIMIT,
    limitKb: Math.round(SHOPIFY_PAGE_BODY_LIMIT / 1024),
    ratio,
    status,
    isOver: ratio >= 1,
  };
}
