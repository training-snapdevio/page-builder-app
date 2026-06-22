/**
 * Preview token helpers.
 *
 * The standalone preview page (/api/preview/:slug) is opened in a top-level
 * browser tab so that refresh, screenshots, and browser extensions all work on
 * a real URL. A plain tab does NOT carry the embedded-app admin session, so the
 * route can't use authenticate.admin(). Instead we sign a short token that
 * encodes the shop, and the route validates the signature with the app secret.
 *
 * The token is NOT a bearer credential for the Admin API — it only authorizes
 * read-only rendering of one shop's own saved pages, which is the same data the
 * merchant just authored. It is unguessable (HMAC-SHA256 with the app secret)
 * and scoped to a single shop.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

function secret(): string {
  const s = process.env.SHOPIFY_API_SECRET;
  if (!s) {
    // Without a secret we cannot sign or verify; fail closed.
    throw new Error("SHOPIFY_API_SECRET is not set — cannot sign preview tokens.");
  }
  return s;
}

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function sign(payload: string): string {
  return base64url(createHmac("sha256", secret()).update(payload).digest());
}

/**
 * Create a preview token that authorizes rendering this shop's pages. The shop
 * is embedded in the token so the preview route can recover it without a
 * session. Slug is intentionally NOT bound, so one token works across a shop's
 * previews; the route still looks the page up scoped to this shop.
 */
export function createPreviewToken(shop: string): string {
  const payload = base64url(Buffer.from(shop, "utf8"));
  return `${payload}.${sign(payload)}`;
}

/**
 * Verify a preview token and return the shop it authorizes, or null if the
 * token is malformed or the signature doesn't match.
 */
export function verifyPreviewToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot === -1) return null;

  const payload = token.slice(0, dot);
  const provided = token.slice(dot + 1);
  const expected = sign(payload);

  // Constant-time compare to avoid leaking signature bytes via timing.
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    return Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
  } catch {
    return null;
  }
}
