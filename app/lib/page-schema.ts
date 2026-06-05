/**
 * page-schema.ts
 *
 * Canonical TypeScript types for page builder content stored in Shopify
 * metafields. Matches Puck's internal data shape so serialisation is lossless.
 *
 * Safe to import from both server and client — no Node-only imports.
 */

// ─── Puck data types ──────────────────────────────────────────────────────────

export interface PuckBlock {
  type: string;
  props: Record<string, unknown>;
}

export interface PuckRoot {
  props: Record<string, unknown>;
}

export interface PuckData {
  content: PuckBlock[];
  root: PuckRoot;
  zones: Record<string, PuckBlock[]>;
}

// ─── Metafield envelope ───────────────────────────────────────────────────────

/** Shape stored as the JSON value in namespace=page_builder / key=content */
export interface PageMetafieldValue {
  version: 1;
  slug: string;
  title: string;
  updatedAt: string; // ISO-8601
  data: PuckData;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function isValidPuckData(v: unknown): v is PuckData {
  if (!isObject(v)) return false;
  return (
    Array.isArray(v.content) &&
    isObject(v.root) &&
    isObject(v.zones)
  );
}

export function isValidPageMetafieldValue(v: unknown): v is PageMetafieldValue {
  if (!isObject(v)) return false;
  return (
    v.version === 1 &&
    typeof v.slug === "string" &&
    typeof v.title === "string" &&
    typeof v.updatedAt === "string" &&
    isValidPuckData(v.data)
  );
}

// ─── Builder ──────────────────────────────────────────────────────────────────

export function buildMetafieldValue(
  slug: string,
  title: string,
  data: PuckData,
): PageMetafieldValue {
  return {
    version: 1,
    slug,
    title,
    updatedAt: new Date().toISOString(),
    data,
  };
}
