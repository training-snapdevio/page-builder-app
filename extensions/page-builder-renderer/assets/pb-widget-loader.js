/**
 * pb-widget-loader.js
 * Page Builder Widget — Storefront loader
 *
 * For each [data-block-id] container on the page:
 *   1. Read block_id, proxy-url, and theme-styles data attributes
 *   2. Fetch /apps/pb-widget?block_id=XYZ&theme_styles=0|1
 *   3. Inject the returned HTML + scoped CSS into the container
 */

(function () {
  "use strict";

  var MOUNT_ATTR    = "data-block-id";
  var PROXY_ATTR    = "data-proxy-url";
  var THEME_ATTR    = "data-theme-styles";
  var MOUNTED_ATTR  = "data-pb-mounted";
  var FETCHING_ATTR = "data-pb-fetching";

  // Tracks AbortControllers keyed by container element so we can cancel
  // in-flight requests when a new mount is triggered before the previous
  // fetch completes (race condition on first Block ID entry in theme editor).
  var pendingAborts = new WeakMap();

  function log(msg, data) {
    if (typeof console !== "undefined" && console.warn) {
      data !== undefined
        ? console.warn("[PBWidget] " + msg, data)
        : console.warn("[PBWidget] " + msg);
    }
  }

  function showError(container, message) {
    container.innerHTML =
      '<div style="padding:16px;border:1px solid #fecaca;background:#fef2f2;color:#991b1b;' +
      'border-radius:6px;font-family:sans-serif;font-size:13px;text-align:center">' +
      "&#9888; Widget failed to load" +
      (message ? ": " + message : "") +
      "</div>";
  }

  function unmountBlock(container) {
    // Cancel any in-flight fetch for this container
    var prev = pendingAborts.get(container);
    if (prev) { try { prev.abort(); } catch (e) {} }
    pendingAborts.delete(container);

    container.removeAttribute(MOUNTED_ATTR);
    container.removeAttribute(FETCHING_ATTR);
    // Remove previously injected style tag
    var prevStyle = container.querySelector("style[data-pb-style]");
    if (prevStyle) prevStyle.remove();
    // Remove previously injected content wrapper
    var wrapper = container.querySelector(".pb-page-content");
    if (wrapper) wrapper.remove();
    // Restore loading spinner if it was removed
    if (!container.querySelector(".pb-widget-loading")) {
      var spinner = document.createElement("div");
      spinner.className = "pb-widget-loading";
      spinner.style.cssText = "display:flex;align-items:center;justify-content:center;padding:32px;color:#9ca3af;font-size:14px;font-family:sans-serif;";
      spinner.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;animation:pb-spin 1s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Loading content…<style>@keyframes pb-spin{to{transform:rotate(360deg)}}</style>';
      container.insertBefore(spinner, container.firstChild);
    }
  }

  function mountBlock(container, force) {
    var blockId     = container.getAttribute(MOUNT_ATTR);
    var proxyUrl    = container.getAttribute(PROXY_ATTR);
    var themeStyles = container.getAttribute(THEME_ATTR);

    if (!blockId || !proxyUrl) return;
    if (!force && container.getAttribute(MOUNTED_ATTR)) return;

    // Cancel any prior in-flight request and reset state
    unmountBlock(container);
    container.setAttribute(MOUNTED_ATTR, "1");

    // Stamp a unique fetch token so we can detect stale responses
    var fetchToken = String(Date.now()) + Math.random();
    container.setAttribute(FETCHING_ATTR, fetchToken);

    // theme_styles=1 → send NO app CSS, let theme cascade apply
    var useTheme = themeStyles === "true" || themeStyles === "1";

    var url =
      proxyUrl +
      "?block_id=" + encodeURIComponent(blockId) +
      "&theme_styles=" + (useTheme ? "1" : "0");

    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    if (controller) pendingAborts.set(container, controller);

    fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "same-origin",
      signal: controller ? controller.signal : undefined,
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        // Discard if a newer mount has already started for this container
        if (container.getAttribute(FETCHING_ATTR) !== fetchToken) return;

        if (!data || !data.widgetConfig) {
          throw new Error("Invalid response");
        }

        var cfg = data.widgetConfig;

        // Remove loading spinner
        var loader = container.querySelector(".pb-widget-loading");
        if (loader) loader.remove();

        if (cfg.type === "page" && cfg.html) {
          // Inject scoped CSS. In app-design mode this is the design-token
          // stylesheet; in "Use theme styles" mode it is a reset stylesheet
          // that neutralizes baked-in inline styles so the theme cascades in.
          // Either way it is scoped to this container via the :root rewrite.
          if (cfg.styleCss) {
            var styleEl = document.createElement("style");
            styleEl.setAttribute("data-pb-style", "1");
            var scopeId = container.id || "pb-widget-" + blockId;
            styleEl.textContent = cfg.styleCss.replace(/:root\b/g, "#" + scopeId);
            container.appendChild(styleEl);
          }

          var wrapper = document.createElement("div");
          wrapper.className = "pb-page-content";
          wrapper.innerHTML = cfg.html;
          container.appendChild(wrapper);
          container.removeAttribute(FETCHING_ATTR);
          pendingAborts.delete(container);

          // Hydrate any Featured Product blocks with live storefront data.
          hydrateFeaturedProducts(wrapper);
          return;
        }

        throw new Error("Unsupported widget type: " + (cfg.type || "unknown"));
      })
      .catch(function (err) {
        // Ignore aborted requests — a newer mount took over
        if (err && err.name === "AbortError") return;
        // Ignore stale responses
        if (container.getAttribute(FETCHING_ATTR) !== fetchToken) return;

        log("Block '" + blockId + "' failed", err && err.message);
        container.removeAttribute(MOUNTED_ATTR);
        container.removeAttribute(FETCHING_ATTR);
        pendingAborts.delete(container);
        showError(container, err && err.message);
      });
  }

  // ── Featured Product live hydration ───────────────────────────────────────
  //
  // The server renders a snapshot of the picked product. Here we fetch the live
  // product JSON from the storefront (/products/{handle}.js — available on every
  // Shopify storefront, no auth) and update the title, price, image, button URL
  // and availability so the block always reflects the current product.

  // Format a price in cents using the active Shopify currency, falling back to
  // a simple decimal if Intl/currency isn't available.
  function formatMoney(cents, currency) {
    var amount = (Number(cents) || 0) / 100;
    try {
      if (currency && typeof Intl !== "undefined" && Intl.NumberFormat) {
        return new Intl.NumberFormat(undefined, { style: "currency", currency: currency }).format(amount);
      }
    } catch (e) {}
    return amount.toFixed(2);
  }

  function hydrateOne(el) {
    var handle = el.getAttribute("data-pb-product-handle");
    if (!handle) return;
    // Mark as hydrating so we never double-fetch the same element.
    if (el.getAttribute("data-pb-fp-hydrated")) return;
    el.setAttribute("data-pb-fp-hydrated", "1");

    fetch("/products/" + encodeURIComponent(handle) + ".js", {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (prod) {
        if (!prod) return;
        var cur = prod.currency || (window.Shopify && window.Shopify.currency && window.Shopify.currency.active);

        // ── Resolve first available variant ────────────────────────────────
        var firstAvail = null;
        var allVariants = Array.isArray(prod.variants) ? prod.variants : [];
        for (var i = 0; i < allVariants.length; i++) {
          if (allVariants[i] && allVariants[i].available) { firstAvail = allVariants[i]; break; }
        }
        var activeVariant = firstAvail || allVariants[0] || null;

        // ── Title ──────────────────────────────────────────────────────────
        var titleEl = el.querySelector("[data-pb-fp-title]");
        if (titleEl && prod.title) titleEl.textContent = prod.title;

        // ── Vendor ─────────────────────────────────────────────────────────
        var vendorEl = el.querySelector("[data-pb-fp-vendor]");
        if (vendorEl && prod.vendor) vendorEl.textContent = prod.vendor;

        // ── Price (first available variant, fallback to product price) ─────
        var priceEl = el.querySelector("[data-pb-fp-price]");
        if (priceEl) {
          var priceCents = activeVariant && activeVariant.price != null ? activeVariant.price : prod.price;
          priceEl.textContent = formatMoney(priceCents, cur);
        }

        // ── Compare-at price ───────────────────────────────────────────────
        var compareEl = el.querySelector("[data-pb-fp-compare]");
        if (compareEl) {
          var compareCents = activeVariant && activeVariant.compare_at_price != null
            ? activeVariant.compare_at_price
            : (prod.compare_at_price || null);
          if (compareCents) {
            compareEl.textContent = formatMoney(compareCents, cur);
            compareEl.style.display = "";
          } else {
            compareEl.style.display = "none";
          }
        }

        // ── Description ────────────────────────────────────────────────────
        var descEl = el.querySelector("[data-pb-fp-desc]");
        if (descEl && prod.description != null) {
          // prod.description from .js endpoint is plain-text; .body_html from JSON-LD
          // would be HTML but isn't available here — keep as text for safety.
          descEl.textContent = prod.description;
        }

        // ── SKU ────────────────────────────────────────────────────────────
        var skuValEl = el.querySelector("[data-pb-fp-sku-val]");
        if (skuValEl) {
          skuValEl.textContent = (activeVariant && activeVariant.sku) ? activeVariant.sku : (prod.variants && prod.variants[0] && prod.variants[0].sku ? prod.variants[0].sku : "—");
        }

        // ── Image — swap to live featured image ────────────────────────────
        var imgEl = el.querySelector("[data-pb-fp-image]");
        if (imgEl && (prod.featured_image || (prod.images && prod.images[0]))) {
          imgEl.src = prod.featured_image || prod.images[0];
          imgEl.alt = prod.title || imgEl.alt || "";
        }

        // ── Variant selector — populate options from live data ─────────────
        var variantWrap = el.querySelector("[data-pb-fp-variants]");
        if (variantWrap && allVariants.length > 1) {
          var select = variantWrap.querySelector("select");
          if (select) {
            select.innerHTML = "";
            for (var vi = 0; vi < allVariants.length; vi++) {
              var vr = allVariants[vi];
              if (!vr) continue;
              var opt = document.createElement("option");
              opt.value = String(vr.id);
              opt.textContent = vr.title || ("Variant " + (vi + 1));
              if (!vr.available) opt.disabled = true;
              if (vr === firstAvail) opt.selected = true;
              select.appendChild(opt);
            }
          }
          // Button-style swatches — replace placeholder buttons
          var swatchWrap = variantWrap.querySelector("[data-pb-fp-swatches]");
          if (swatchWrap) {
            swatchWrap.innerHTML = "";
            for (var si = 0; si < allVariants.length; si++) {
              var sv = allVariants[si];
              if (!sv) continue;
              var btn2 = document.createElement("button");
              btn2.style.cssText = "padding:5px 12px;border:1px solid " + (sv.available ? "#d1d5db" : "#f0f0f0") + ";border-radius:6px;font-size:13px;background:" + (sv === firstAvail ? "#1a1a1a" : "#fff") + ";color:" + (sv === firstAvail ? "#fff" : "#374151") + ";cursor:" + (sv.available ? "pointer" : "not-allowed") + ";opacity:" + (sv.available ? "1" : "0.45");
              btn2.textContent = sv.title || ("V" + (si + 1));
              btn2.disabled = !sv.available;
              swatchWrap.appendChild(btn2);
            }
          }
        }

        // ── Quantity stepper wiring ────────────────────────────────────────
        var qtyInput = el.querySelector("[data-pb-fp-qty]");
        var qtyDec   = el.querySelector("[data-pb-fp-qty-dec]");
        var qtyInc   = el.querySelector("[data-pb-fp-qty-inc]");
        if (qtyInput && qtyDec && qtyInc) {
          qtyDec.addEventListener("click", function () {
            var v = parseInt(qtyInput.value, 10) || 1;
            if (v > 1) qtyInput.value = v - 1;
          });
          qtyInc.addEventListener("click", function () {
            var v = parseInt(qtyInput.value, 10) || 1;
            qtyInput.value = v + 1;
          });
        }

        // ── Button — PDP link or add-to-cart ──────────────────────────────
        var btn = el.querySelector("[data-pb-fp-button]");
        if (btn) {
          btn.setAttribute("href", "/products/" + handle);
          var soldOut = prod.available === false;
          if (soldOut) {
            btn.textContent = "Sold Out";
            btn.style.opacity = "0.55";
            btn.style.pointerEvents = "none";
          }
          if (btn.hasAttribute("data-pb-fp-atc") && !soldOut) {
            var variantId = activeVariant ? activeVariant.id : null;
            if (variantId != null) {
              // Wire up ATC to respect quantity if selector is present.
              btn.addEventListener("click", function (e) {
                e.preventDefault();
                var qty = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;
                // Prefer Shopify Ajax API so the page doesn't reload.
                fetch("/cart/add.js", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: variantId, quantity: qty }),
                })
                  .then(function () {
                    // Trigger cart update event themes listen to.
                    document.dispatchEvent(new CustomEvent("cart:refresh", { bubbles: true }));
                    // Also fire the native Shopify section event some themes need.
                    document.dispatchEvent(new CustomEvent("cart:updated", { bubbles: true }));
                  })
                  .catch(function () {
                    // Fallback: navigate to cart/add URL.
                    window.location.href = "/cart/add?id=" + variantId + "&quantity=" + qty;
                  });
              });
            }
          }
        }
      })
      .catch(function (err) {
        log("Featured product '" + handle + "' hydration failed", err && err.message);
        // Snapshot stays as-is — graceful degradation.
      });
  }

  function hydrateFeaturedProducts(root) {
    var scope = root || document;
    var els = scope.querySelectorAll(".pb-featured-product[data-pb-product-handle]");
    for (var i = 0; i < els.length; i++) hydrateOne(els[i]);
  }

  function scanAndMount(force) {
    var containers = document.querySelectorAll("[" + MOUNT_ATTR + "]");
    for (var i = 0; i < containers.length; i++) {
      mountBlock(containers[i], force);
    }
    // Hydrate Featured Product blocks rendered directly in the page body (i.e.
    // exported pages where the HTML isn't injected by this loader).
    hydrateFeaturedProducts(document);
  }

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    scanAndMount(false);
  } else {
    document.addEventListener("DOMContentLoaded", function () { scanAndMount(false); });
  }

  // Re-scan when theme editor loads a new section instance
  document.addEventListener("shopify:section:load", function () { scanAndMount(false); });

  // Re-fetch with updated settings whenever the merchant changes any setting
  // (including the "Use Shopify theme styles" toggle) in the theme editor.
  document.addEventListener("shopify:section:select", function () { scanAndMount(true); });
  document.addEventListener("shopify:block:select", function () { scanAndMount(true); });
})();
