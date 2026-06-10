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

  var MOUNT_ATTR   = "data-block-id";
  var PROXY_ATTR   = "data-proxy-url";
  var THEME_ATTR   = "data-theme-styles";
  var MOUNTED_ATTR = "data-pb-mounted";

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
    container.removeAttribute(MOUNTED_ATTR);
    // Remove previously injected style tag
    var prev = container.querySelector("style[data-pb-style]");
    if (prev) prev.remove();
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

    unmountBlock(container);
    container.setAttribute(MOUNTED_ATTR, "1");

    // theme_styles=1 → send NO app CSS, let theme cascade apply
    var useTheme = themeStyles === "true" || themeStyles === "1";

    var url =
      proxyUrl +
      "?block_id=" + encodeURIComponent(blockId) +
      "&theme_styles=" + (useTheme ? "1" : "0");

    fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
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
          return;
        }

        throw new Error("Unsupported widget type: " + (cfg.type || "unknown"));
      })
      .catch(function (err) {
        log("Block '" + blockId + "' failed", err && err.message);
        container.removeAttribute(MOUNTED_ATTR);
        showError(container, err && err.message);
      });
  }

  function scanAndMount(force) {
    var containers = document.querySelectorAll("[" + MOUNT_ATTR + "]");
    for (var i = 0; i < containers.length; i++) {
      mountBlock(containers[i], force);
    }
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
