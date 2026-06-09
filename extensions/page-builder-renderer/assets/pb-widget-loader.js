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

  function mountBlock(container) {
    var blockId     = container.getAttribute(MOUNT_ATTR);
    var proxyUrl    = container.getAttribute(PROXY_ATTR);
    var themeStyles = container.getAttribute(THEME_ATTR);

    if (!blockId || !proxyUrl) return;
    if (container.getAttribute(MOUNTED_ATTR)) return;
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
          // Inject scoped CSS design tokens (app settings), unless merchant
          // chose "Use theme styles" — in that case styleCss is empty string.
          if (cfg.styleCss) {
            var styleEl = document.createElement("style");
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

  function scanAndMount() {
    var containers = document.querySelectorAll("[" + MOUNT_ATTR + "]");
    for (var i = 0; i < containers.length; i++) {
      mountBlock(containers[i]);
    }
  }

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    scanAndMount();
  } else {
    document.addEventListener("DOMContentLoaded", scanAndMount);
  }

  // Re-scan when theme editor loads a section dynamically
  document.addEventListener("shopify:section:load", scanAndMount);
})();
