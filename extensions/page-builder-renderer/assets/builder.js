/**
 * Page Builder runtime — JS port of `app/lib/puck-renderer.ts`.
 *
 * Reads the page's Puck JSON from `data-content` (written by
 * `blocks/page-builder.liquid` from the page metafield) and renders the
 * block markup client-side. The output mirrors what the server-side
 * `renderPuckToHtml` produces — same DOM, same inline styles — so the
 * editor preview, the server-rendered fallback in `page.body`, and the
 * extension-rendered page are visually identical.
 *
 * Why client-side: Shopify strips `<script>` from `page.body`, so any
 * dynamic behaviour (Hero slider autoplay, etc.) only survives if it ships
 * through an extension asset like this file. The extension's CSS classes
 * (`.pb-marquee-pause`, `.pb-accordion`, `.pb-hero-slide`, …) ship with the
 * markup, so styles and animations are 1:1 with the editor.
 */
(function () {
  'use strict';

  // ── Utilities ───────────────────────────────────────────────────────────────

  function esc(v) {
    if (v == null) return '';
    return String(v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function s(obj) {
    return Object.entries(obj || {})
      .filter(function (e) { return e[1] != null && e[1] !== ''; })
      .map(function (e) {
        var prop = e[0].replace(/([A-Z])/g, '-$1').toLowerCase();
        return prop + ':' + e[1];
      })
      .join(';');
  }

  function zoneContent(blockId, zoneName, zones) {
    return (zones[blockId + ':' + zoneName] || []);
  }

  function renderBlocks(blocks, zones) {
    return (blocks || []).map(function (b) { return renderBlock(b, zones); }).join('\n');
  }

  function colorWithOpacity(color, opacity) {
    if (!color) return 'rgba(0,0,0,' + opacity + ')';
    if (color.charAt(0) === '#') {
      var hex = color.slice(1);
      var full = hex.length === 3 ? hex.split('').map(function (c) { return c + c; }).join('') : hex;
      var r = parseInt(full.slice(0, 2), 16);
      var g = parseInt(full.slice(2, 4), 16);
      var b = parseInt(full.slice(4, 6), 16);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
    }
    var m = color.match(/rgba?\(([^)]+)\)/);
    if (m) {
      var parts = m[1].split(',').map(function (v) { return v.trim(); });
      return 'rgba(' + parts[0] + ',' + parts[1] + ',' + parts[2] + ',' + opacity + ')';
    }
    return 'rgba(0,0,0,' + opacity + ')';
  }

  function patternBackground(type, color) {
    if (!type || type === 'none') return '';
    var c1 = colorWithOpacity(color, 0.1);
    var c2 = colorWithOpacity(color, 0.05);
    var c3 = colorWithOpacity(color, 0.03);
    switch (type) {
      case 'dots':
        return 'background-image:radial-gradient(circle,' + c1 + ' 1px,transparent 1px);background-size:20px 20px';
      case 'grid':
        return 'background-image:linear-gradient(' + c2 + ' 1px,transparent 1px),linear-gradient(90deg,' + c2 + ' 1px,transparent 1px);background-size:40px 40px';
      case 'waves':
        return 'background-image:repeating-linear-gradient(45deg,transparent,transparent 10px,' + c3 + ' 10px,' + c3 + ' 20px)';
      case 'geometric':
        return 'background-image:linear-gradient(30deg,' + c3 + ' 12%,transparent 12.5%,transparent 87%,' + c3 + ' 87.5%),linear-gradient(150deg,' + c3 + ' 12%,transparent 12.5%,transparent 87%,' + c3 + ' 87.5%),linear-gradient(60deg,' + c3 + ' 25%,transparent 25.5%,transparent 75%,' + c3 + ' 75%);background-size:80px 140px;background-position:0 0,0 0,40px 70px';
      default:
        return '';
    }
  }

  // ── Hero ────────────────────────────────────────────────────────────────────

  function Hero(p) {
    if (p.sliderEnabled && Array.isArray(p.slides) && p.slides.length > 0) {
      return renderHeroSlider(p);
    }
    return renderHeroSlide(p, { isFirst: true });
  }

  function renderHeroSlider(p) {
    var slides = [p].concat(p.slides);
    var autoplay = p.autoplay !== false;
    var interval = Math.max(1, Number(p.interval || 5)) * 1000;
    var showArrows = p.showArrows !== false;
    var showDots = p.showDots !== false;
    var pauseOnHover = p.pauseOnHover !== false;
    var transition = Math.max(100, Number(p.transitionDuration || 500));

    var sliderId = 'pb-hero-' + Math.random().toString(36).slice(2, 10);
    var slideHtml = slides
      .map(function (slide, i) {
        var inner = renderHeroSlide(slide, { isFirst: i === 0 });
        return '<div class="pb-hero-slide" data-idx="' + i + '" style="position:absolute;inset:0;opacity:' + (i === 0 ? 1 : 0) + ';transition:opacity ' + transition + 'ms ease-in-out;pointer-events:' + (i === 0 ? 'auto' : 'none') + '">' + inner + '</div>';
      })
      .join('');

    var arrows = showArrows
      ? '<button type="button" data-pb-prev style="position:absolute;left:16px;top:50%;transform:translateY(-50%);z-index:10;background:rgba(0,0,0,.4);color:#fff;border:none;width:40px;height:40px;border-radius:50%;cursor:pointer;font-size:20px">‹</button><button type="button" data-pb-next style="position:absolute;right:16px;top:50%;transform:translateY(-50%);z-index:10;background:rgba(0,0,0,.4);color:#fff;border:none;width:40px;height:40px;border-radius:50%;cursor:pointer;font-size:20px">›</button>'
      : '';

    var dots = showDots
      ? '<div data-pb-dots style="position:absolute;bottom:16px;left:50%;transform:translateX(-50%);z-index:10;display:flex;gap:8px">' +
        slides
          .map(function (_, i) {
            return '<button type="button" data-pb-dot="' + i + '" style="width:10px;height:10px;border-radius:50%;border:none;background:' + (i === 0 ? '#fff' : 'rgba(255,255,255,.4)') + ';cursor:pointer;padding:0"></button>';
          })
          .join('') +
        '</div>'
      : '';

    var html =
      '<div id="' + sliderId + '" data-pb-hero-slider="1" data-autoplay="' + (autoplay ? '1' : '0') + '" data-interval="' + interval + '" data-pause-on-hover="' + (pauseOnHover ? '1' : '0') + '" style="position:relative;width:100%;min-height:60vh;overflow:hidden">' +
      slideHtml + arrows + dots +
      '</div>';
    return html;
  }

  function renderHeroSlide(p, opts) {
    var pad = (p.padding != null ? p.padding : 80) + 'px';
    var bgColor = p.backgroundColor || '#f8fafc';
    var overlayOpacity = Number(p.overlayOpacity != null ? p.overlayOpacity : 0.3);
    var align = p.align || 'text-left';
    var textAlign = align === 'text-center' ? 'center' : align === 'text-right' ? 'right' : 'left';
    var justifyContent = textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start';
    var verticalAlign = p.verticalAlign || 'items-center';
    var alignItems = verticalAlign === 'items-start' ? 'flex-start' : verticalAlign === 'items-end' ? 'flex-end' : 'center';

    var img = p.image || {};
    var imgMode = img.mode || '';
    var imgUrl = img.url || '';
    var imgPosition = img.position || 'right';

    var videoSettings = p.videoSettings || {};
    var videoUrl = String(videoSettings.url || '').trim();
    var hasVideo = videoUrl !== '';
    var videoLoop = videoSettings.loop !== false;
    var videoMuted = videoSettings.muted !== false;

    var gs = p.gradientStartColor || '';
    var ge = p.gradientEndColor || '';
    var gd = p.gradientDirection || '135deg';

    // Background type drives which background fills the section. Auto-derive
    // for legacy data that has no explicit backgroundType set.
    var bgType =
      p.backgroundType ||
      (gs && ge ? 'gradient' : hasVideo ? 'video' : (imgMode === 'bg' && imgUrl) ? 'image' : 'solid');

    var useImage = bgType === 'image' && !!imgUrl;
    var isBg = useImage && imgMode === 'bg';
    var isInline = useImage && imgMode === 'inline';
    var isCustom = useImage && imgMode === 'custom';
    var hasSideImage = isInline || isCustom;

    var bgImage = 'none';
    if (bgType === 'gradient' && gs && ge) {
      bgImage = 'linear-gradient(' + gd + ',' + gs + ',' + ge + ')';
    } else if (bgType === 'image' && imgMode === 'bg' && imgUrl) {
      bgImage = 'url(' + imgUrl + ')';
    }

    var txtColor = p.textColor || (isBg || bgType === 'video' || bgType === 'gradient' ? '#fff' : 'inherit');

    var glassEffect = !!p.glassEffect;
    var glassBlur = Number(p.glassBlur != null ? p.glassBlur : 10);
    var patternType = p.patternType || 'none';
    var patternColor = p.patternColor || 'rgba(0,0,0,0.1)';
    var patternCss = patternBackground(patternType, patternColor);

    var badgeHtml = p.badge
      ? '<span style="display:inline-block;background:#0158ad;color:#fff;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:600;margin-bottom:12px">' + esc(p.badge) + '</span>'
      : '';

    var subtitleHtml = p.subtitle
      ? '<p style="font-size:1.125rem;margin:0 0 8px;opacity:.85">' + esc(p.subtitle) + '</p>'
      : '';

    var titleHtml = p.title
      ? '<h1 style="font-size:clamp(2rem,5vw,3.5rem);font-weight:700;margin:0 0 16px;line-height:1.2">' + esc(p.title) + '</h1>'
      : '';

    var rating = Number(p.rating || 0);
    var reviewCount = Number(p.reviewCount || 0);
    var ratingHtml = '';
    if (rating > 0) {
      var full = Math.floor(rating);
      var stars = '';
      for (var i = 0; i < 5; i++) {
        stars += i < full
          ? '<span style="color:#facc15">★</span>'
          : '<span style="color:#d1d5db">★</span>';
      }
      ratingHtml = '<div style="display:flex;gap:8px;align-items:center;justify-content:' + justifyContent + ';margin-bottom:12px"><span style="display:inline-flex;gap:1px">' + stars + '</span><span style="font-size:14px;opacity:.85">' + rating + (reviewCount ? ' (' + reviewCount + ' reviews)' : '') + '</span></div>';
    }

    var features = Array.isArray(p.features) ? p.features : [];
    var featuresHtml = features.length
      ? '<ul style="list-style:none;padding:0;margin:0 0 16px;text-align:' + textAlign + '">' +
        features.map(function (f) {
          return '<li style="margin-bottom:4px;font-size:.9rem">✔ ' + esc((f && f.text) || '') + '</li>';
        }).join('') +
        '</ul>'
      : '';

    // description supports rich-text HTML (Tiptap output) — don't esc it.
    var descHtml = p.description
      ? '<div style="margin-bottom:24px;line-height:1.6;opacity:.9">' + String(p.description) + '</div>'
      : '';

    var buttons = Array.isArray(p.buttons) ? p.buttons : [];
    var buttonsHtml = buttons.length
      ? '<div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:' + justifyContent + '">' +
        buttons.map(function (b) {
          if (!b || !b.label) return '';
          var variant = b.variant || 'primary';
          var style =
            variant === 'primary'
              ? 'background:#0158ad;color:#fff;border:none'
              : variant === 'secondary'
                ? 'background:#64748b;color:#fff;border:none'
                : 'background:transparent;color:currentColor;border:2px solid currentColor';
          return '<a href="' + esc(b.link || '#') + '" style="' + style + ';padding:12px 28px;border-radius:6px;font-weight:600;text-decoration:none;display:inline-block">' + esc(b.label) + '</a>';
        }).join('') +
        '</div>'
      : '';

    var textBlock = '<div style="position:relative;z-index:2;' + (hasSideImage ? 'flex:1 1 0;min-width:0;' : 'max-width:720px;width:100%;') + 'color:' + esc(txtColor) + ';text-align:' + textAlign + '">' +
      badgeHtml + subtitleHtml + titleHtml + ratingHtml + featuresHtml + descHtml + buttonsHtml +
      '</div>';

    var imageBlock = hasSideImage
      ? '<div style="position:relative;z-index:2;flex:1 1 0;min-width:0"><img src="' + esc(imgUrl) + '" alt="Hero" style="width:100%;height:auto;max-height:500px;object-fit:cover;border-radius:8px;display:block"></div>'
      : '';

    var imageFirst = isCustom && imgPosition === 'left';

    var isPlayableVideoUrl = bgType === 'video' && hasVideo && videoUrl.indexOf('data:') !== 0;
    var videoLayer = isPlayableVideoUrl
      ? '<video autoplay ' + (videoLoop ? 'loop ' : '') + (videoMuted ? 'muted ' : '') + 'playsinline preload="auto" src="' + esc(videoUrl) + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;opacity:' + (1 - overlayOpacity) + '"></video>'
      : '';

    var overlayLayer = (isBg || isPlayableVideoUrl)
      ? '<div style="position:absolute;inset:0;background:#000;opacity:' + overlayOpacity + ';z-index:1"></div>'
      : '';

    var patternLayer = patternCss
      ? '<div style="position:absolute;inset:0;' + patternCss + ';z-index:1;pointer-events:none"></div>'
      : '';

    var glassLayer = glassEffect
      ? '<div style="position:absolute;inset:0;backdrop-filter:blur(' + glassBlur + 'px);-webkit-backdrop-filter:blur(' + glassBlur + 'px);background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);z-index:1;pointer-events:none"></div>'
      : '';

    var geoShapes = p.geometricShapes;
    var geoLayer = (geoShapes && geoShapes.enabled && Array.isArray(geoShapes.shapes))
      ? geoShapes.shapes.map(function (sh) {
          var pos = sh.position || {};
          var size = Number(sh.size || 80);
          var color = String(sh.color || '#0158ad');
          var opacity = Number(sh.opacity || 0.3);
          var rotation = Number(sh.rotation || 0);
          var type = String(sh.type || 'square');
          var base = 'position:absolute;left:' + (pos.x || 0) + 'px;top:' + (pos.y || 0) + 'px;z-index:0;opacity:' + opacity + ';transform:rotate(' + rotation + 'deg)';
          if (type === 'triangle') {
            return '<div style="' + base + ';width:0;height:0;border-left:' + (size / 2) + 'px solid transparent;border-right:' + (size / 2) + 'px solid transparent;border-bottom:' + size + 'px solid ' + esc(color) + '"></div>';
          }
          var radius = type === 'circle' ? '50%' : '0';
          return '<div style="' + base + ';width:' + size + 'px;height:' + size + 'px;background:' + esc(color) + ';border-radius:' + radius + '"></div>';
        }).join('')
      : '';

    var floatEls = p.floatingElements;
    var floatLayer = (floatEls && floatEls.enabled && Array.isArray(floatEls.elements))
      ? floatEls.elements.map(function (el) {
          var pos = el.position || {};
          var size = Number(el.size || 60);
          var color = String(el.color || '#fff');
          var type = String(el.type || 'square');
          var animation = String(el.animation || 'none');
          var radius = type === 'circle' ? '50%' : type === 'blob' ? '30% 70% 70% 30% / 30% 30% 70% 70%' : '0';
          var animMap = {
            float: 'pb-hero-float 3s ease-in-out infinite',
            pulse: 'pb-hero-pulse 2s ease-in-out infinite',
            rotate: 'pb-hero-rotate 4s linear infinite',
            bounce: 'pb-hero-bounce 2s ease-in-out infinite',
          };
          var anim = animMap[animation] || 'none';
          return '<div style="position:absolute;left:' + (pos.x || 0) + 'px;top:' + (pos.y || 0) + 'px;width:' + size + 'px;height:' + size + 'px;background:' + esc(color) + ';border-radius:' + radius + ';animation:' + anim + ';z-index:0"></div>';
        }).join('')
      : '';

    var flexDirection = hasSideImage ? 'row' : 'column';
    var isFirst = !opts || opts.isFirst !== false;
    var keyframes = isFirst
      ? '<style>@keyframes pb-hero-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}@keyframes pb-hero-pulse{0%,100%{transform:scale(1);opacity:.85}50%{transform:scale(1.1);opacity:1}}@keyframes pb-hero-rotate{from{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes pb-hero-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}</style>'
      : '';

    return '<section style="position:relative;background-color:' + esc(bgColor) + ';background-image:' + bgImage + ';background-size:cover;background-position:center;padding:' + pad + ';min-height:60vh;display:flex;flex-wrap:wrap;flex-direction:' + flexDirection + ';align-items:' + alignItems + ';justify-content:' + justifyContent + ';gap:32px;overflow:hidden;color:' + esc(txtColor) + '">' +
      keyframes + videoLayer + overlayLayer + patternLayer + glassLayer + geoLayer + floatLayer +
      (imageFirst ? imageBlock : '') + textBlock + (!imageFirst ? imageBlock : '') +
      '</section>';
  }

  // ── Other blocks ────────────────────────────────────────────────────────────

  function GradientHero(p) {
    var gs = p.gradientStart || '#667eea';
    var ge = p.gradientEnd || '#764ba2';
    return '<section style="background:linear-gradient(135deg,' + esc(gs) + ',' + esc(ge) + ');min-height:60vh;display:flex;align-items:center;justify-content:center;color:#fff">' +
      '<div style="text-align:center;max-width:700px;padding:40px">' +
      (p.subtitle ? '<p style="font-size:14px;font-weight:600;margin:0 0 12px;opacity:.9;text-transform:uppercase;letter-spacing:.1em">' + esc(p.subtitle) + '</p>' : '') +
      (p.title ? '<h1 style="font-size:3.5rem;font-weight:700;margin:0 0 20px;line-height:1.2">' + esc(p.title) + '</h1>' : '') +
      (p.description ? '<p style="font-size:18px;margin:0 0 32px;opacity:.95;line-height:1.6">' + esc(p.description) + '</p>' : '') +
      (p.buttonLabel && p.buttonLink ? '<a href="' + esc(p.buttonLink) + '" style="display:inline-block;background:rgba(255,255,255,.2);color:#fff;padding:12px 36px;border-radius:8px;font-weight:600;text-decoration:none;font-size:16px;border:2px solid rgba(255,255,255,.4)">' + esc(p.buttonLabel) + '</a>' : '') +
      '</div></section>';
  }

  function TextBlock(p) {
    return '<div style="' + s({ padding: p.padding || '48px 24px', maxWidth: p.maxWidth || '720px', margin: '0 auto', textAlign: p.textAlign || 'left' }) + '">' +
      (p.title ? '<h2 style="font-size:clamp(1.5rem,3vw,2.25rem);font-weight:700;margin:0 0 16px">' + esc(p.title) + '</h2>' : '') +
      (p.body ? '<div style="line-height:1.7;opacity:.85">' + esc(p.body) + '</div>' : '') +
      '</div>';
  }

  function Text(p) {
    var fontSize = p.fontSize ? p.fontSize + 'px' : '16px';
    var content = '<p style="' + s({ textAlign: p.alignment || 'left', fontSize: fontSize, fontWeight: p.fontWeight || '400', color: p.textColor || '#374151', lineHeight: String(p.lineHeight || 1.6), margin: '0' }) + '">' + esc(p.title) + '</p>';
    return '<div style="' + s({ padding: (p.padding != null ? p.padding : 16) + 'px', backgroundColor: p.backgroundColor || 'transparent' }) + '">' +
      (p.linkUrl ? '<a href="' + esc(p.linkUrl) + '" style="text-decoration:none;color:inherit">' + content + '</a>' : content) +
      '</div>';
  }

  function HeadingBlock(p) {
    var level = Math.min(Math.max(Number(p.level) || 1, 1), 6);
    var sizes = ['2.5rem', '2rem', '1.75rem', '1.5rem', '1.25rem', '1rem'];
    var fs = sizes[level - 1];
    var padding = (p.padding != null ? p.padding : 32) + 'px';
    var align = p.alignment || 'left';
    var color = p.textColor || '#1a1a1a';
    var dividerMargin = align === 'center' ? 'margin-left:auto;margin-right:auto' : align === 'right' ? 'margin-left:auto' : '';
    return '<div style="' + s({ padding: padding, textAlign: align, backgroundColor: p.backgroundColor || 'transparent' }) + '">' +
      '<h' + level + ' style="font-size:' + fs + ';font-weight:700;color:' + esc(color) + ';line-height:1.2;margin:0">' + esc(p.title) + '</h' + level + '>' +
      (p.subtitle ? '<p style="font-size:1rem;color:' + esc(color) + ';margin-top:8px;opacity:.75">' + esc(p.subtitle) + '</p>' : '') +
      (p.showDivider ? '<div style="width:60px;height:3px;background:' + esc(color) + ';border-radius:2px;margin-top:12px;' + dividerMargin + '"></div>' : '') +
      '</div>';
  }

  function Space(p) {
    var size = (p.size != null ? p.size : 32) + 'px';
    if (p.orientation === 'horizontal') {
      return '<span style="display:inline-block;width:' + size + ';height:100%;flex-shrink:0"></span>';
    }
    return '<div style="height:' + size + ';display:flex;flex-direction:column;justify-content:center;overflow:hidden">' +
      (p.showDivider ? '<hr style="border:none;border-top:' + (p.dividerWidth || 1) + 'px ' + (p.dividerStyle || 'solid') + ' ' + (p.dividerColor || '#e5e7eb') + ';margin:0">' : '') +
      '</div>';
  }

  function Image(p) {
    var img = p.image || {};
    if (!img.url) return '';
    var borderRadius = (p.borderRadius != null ? p.borderRadius : 0) + 'px';
    var width = p.width || '100%';
    var height = (p.height != null ? p.height : 400) + 'px';
    var objectFit = p.objectFit || 'cover';
    var shadow = p.shadow ? 'box-shadow:0 8px 30px rgba(0,0,0,0.15);' : '';
    var imgTag = '<img src="' + esc(img.url) + '" alt="' + esc(img.alt || '') + '" loading="lazy" style="width:' + width + ';height:' + height + ';object-fit:' + objectFit + ';border-radius:' + borderRadius + ';display:block;' + shadow + '">';
    var wrapped = p.linkUrl ? '<a href="' + esc(p.linkUrl) + '" target="_blank" rel="noopener noreferrer">' + imgTag + '</a>' : imgTag;
    return '<div style="' + s({ padding: (p.padding != null ? p.padding : 0) + 'px', textAlign: p.alignment || 'center' }) + '">' +
      '<div style="display:inline-block;max-width:100%">' +
      wrapped +
      (p.caption ? '<p style="font-size:13px;color:#374151;opacity:.65;margin-top:8px;text-align:' + esc(p.alignment || 'center') + ';font-style:italic">' + esc(p.caption) + '</p>' : '') +
      '</div></div>';
  }

  function ColumnSection(p, zones) {
    var id = p.id || '';
    var layoutId = p.layoutId || '';
    if (!layoutId) return '';
    var templateMap = {
      '1-2': { cols: '1fr 2fr', count: 2 },
      '2-1': { cols: '2fr 1fr', count: 2 },
      'equal-2': { cols: '1fr 1fr', count: 2 },
      'equal-3': { cols: 'repeat(3,1fr)', count: 3 },
      'equal-4': { cols: 'repeat(4,1fr)', count: 4 },
    };
    var layout = templateMap[layoutId] || { cols: '1fr 1fr', count: 2 };
    var cols = '';
    for (var i = 0; i < layout.count; i++) {
      cols += '<div>' + renderBlocks(zoneContent(id, 'zone-' + i, zones), zones) + '</div>';
    }
    return '<div style="' + s({ display: 'grid', gridTemplateColumns: layout.cols, gap: p.gap || '24px', padding: p.padding || '0', background: p.background || 'transparent', minHeight: p.minHeight || '120px', boxSizing: 'border-box', width: '100%' }) + '">' + cols + '</div>';
  }

  function GridBlock(p, zones) {
    var id = p.id || '';
    var blocks = renderBlocks(zoneContent(id, 'my-grid', zones), zones);
    return '<div style="' + s({ padding: (p.padding != null ? p.padding : 16) + 'px', backgroundColor: p.backgroundColor || 'transparent' }) + '">' +
      '<div style="display:grid;grid-template-columns:repeat(' + (p.columns || 3) + ',1fr);gap:' + (p.gap || 16) + 'px;align-items:' + (p.alignItems || 'stretch') + '">' +
      blocks +
      '</div></div>';
  }

  function DoubleColumn(p, zones) {
    var id = p.id || '';
    return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">' +
      '<div>' + renderBlocks(zoneContent(id, 'leftColumn', zones), zones) + '</div>' +
      '<div>' + renderBlocks(zoneContent(id, 'rightColumn', zones), zones) + '</div>' +
      '</div>';
  }

  function Accordian(p, zones) {
    var id = p.id || '';
    var details = renderBlocks(zoneContent(id, 'details', zones), zones);
    var bg = p.backgroundColor || '#fff';
    var textColor = p.textColor || '#1a1a1a';
    var accent = p.accentColor || '#0158ad';
    var pad = (p.padding != null ? p.padding : 16) + 'px';
    var br = (p.borderRadius != null ? p.borderRadius : 8) + 'px';
    var border = p.accordionStyle === 'shadow' || p.accordionStyle === 'minimal' ? 'none' : '1px solid #e5e7eb';
    var shadow = p.accordionStyle === 'shadow' ? '0 2px 12px rgba(0,0,0,.07)' : 'none';
    var open = !!p.defaultOpen;
    var minimal = p.accordionStyle === 'minimal';
    var aid = 'pb-acc-' + Math.random().toString(36).slice(2, 10);
    var borderTopOpen = minimal ? '0' : '1px';
    return '<div class="pb-accordion" style="border:' + border + ';border-radius:' + br + ';background:' + esc(bg) + ';box-shadow:' + shadow + ';overflow:hidden;margin-bottom:8px;position:relative">' +
      '<input id="' + aid + '" type="checkbox" ' + (open ? 'checked ' : '') + 'style="position:absolute;opacity:0;pointer-events:none;width:0;height:0;margin:0">' +
      '<label for="' + aid + '" style="cursor:pointer;padding:' + pad + ';font-weight:600;color:' + esc(textColor) + ';display:flex;align-items:center;justify-content:space-between;user-select:none;margin:0">' +
      '<span>' + esc(p.summaryText || 'More Details') + '</span>' +
      '<span class="' + aid + '-i" style="font-size:18px;color:' + esc(accent) + ';transition:transform .2s ease;display:inline-block;line-height:1">›</span>' +
      '</label>' +
      '<div class="' + aid + '-c" style="max-height:0;overflow:hidden;padding:0 ' + pad + ';border-top:0 solid #e5e7eb;transition:max-height .3s ease,padding .25s ease,border-top-width .25s ease">' + details + '</div>' +
      '<style>#' + aid + ':checked~.' + aid + '-c{max-height:9999px;padding:' + pad + ';border-top-width:' + borderTopOpen + '}#' + aid + ':checked~label .' + aid + '-i{transform:rotate(90deg)}</style>' +
      '</div>';
  }

  function Article(p) {
    var pad = (p.padding != null ? p.padding : 32) + 'px';
    var mw = (p.maxWidth != null ? p.maxWidth : 860) + 'px';
    var bg = p.backgroundColor || 'transparent';
    return '<div style="padding:' + pad + ';background:' + esc(bg) + '">' +
      '<article style="max-width:' + mw + ';margin:0 auto">' +
      (p.articleTitle ? '<h1 style="font-size:2.5rem;font-weight:700;color:#1a1a1a;line-height:1.2;margin:0 0 12px">' + esc(p.articleTitle) + '</h1>' : '') +
      ((p.author || p.publishDate) ? '<div style="display:flex;gap:12px;font-size:13px;color:#374151;opacity:.65;margin-bottom:24px;flex-wrap:wrap">' +
        (p.author ? 'By <strong>' + esc(p.author) + '</strong>' : '') +
        (p.author && p.publishDate ? ' | ' : '') +
        (p.publishDate ? esc(p.publishDate) : '') +
        '</div>' : '') +
      '<div style="font-size:1rem;line-height:1.75;color:#374151">' + (p.body ? String(p.body) : '') + '</div>' +
      '</article></div>';
  }

  function CardBlock(p) {
    var img = p.image || {};
    var isBg = img.mode === 'bg';
    var url = img.url || '';
    var accent = p.accentColor || '#0158ad';
    var textColor = p.textColor || '#1a1a1a';
    var bg = p.backgroundColor || '#fff';
    var br = (p.borderRadius != null ? p.borderRadius : 8) + 'px';
    var pad = (p.padding != null ? p.padding : 16) + 'px';
    var width = (p.cardWidth != null ? p.cardWidth : 300) + 'px';
    var imgH = (img.imageHeight != null ? img.imageHeight : 200) + 'px';
    var align = p.alignment || 'left';
    var border = p.cardStyle === 'outlined' ? '1px solid #e5e7eb' : 'none';
    var shadow = p.cardStyle === 'shadow' ? '0 4px 20px rgba(0,0,0,.08)' : 'none';

    if (isBg && url) {
      return '<div style="background-image:url(' + esc(url) + ');background-size:cover;background-position:center;min-height:200px;display:flex;flex-direction:column;justify-content:flex-end;border-radius:' + br + ';overflow:hidden;text-align:' + align + ';width:' + width + ';max-width:100%">' +
        '<div style="padding:' + pad + ';background:linear-gradient(to top,rgba(0,0,0,.7),transparent)">' +
        '<h3 style="color:#fff;margin:0 0 8px;font-size:1.25rem;font-weight:700">' + esc(p.title) + '</h3>' +
        (p.description ? '<p style="color:rgba(255,255,255,.9);margin:0;font-size:.9rem">' + esc(p.description) + '</p>' : '') +
        (p.ctaLabel && p.ctaLink ? '<a href="' + esc(p.ctaLink) + '" style="display:inline-block;margin-top:12px;padding:8px 20px;background:' + esc(accent) + ';color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:.875rem">' + esc(p.ctaLabel) + '</a>' : '') +
        '</div></div>';
    }
    return '<div style="padding:' + pad + ';background:' + esc(bg) + ';border:' + border + ';border-radius:' + br + ';width:' + width + ';max-width:100%;box-shadow:' + shadow + ';display:flex;flex-direction:column;text-align:' + align + ';overflow:hidden;position:relative">' +
      (p.badge ? '<div style="position:absolute;top:12px;right:12px;background:' + esc(accent) + ';color:#fff;font-size:11px;font-weight:700;padding:2px 10px;border-radius:99px">' + esc(p.badge) + '</div>' : '') +
      (url ? '<img src="' + esc(url) + '" alt="" style="width:100%;height:' + imgH + ';object-fit:cover;display:block;margin-bottom:12px">' : '') +
      '<h3 style="color:' + esc(textColor) + ';margin:0 0 8px;font-size:1.125rem;font-weight:700">' + esc(p.title) + '</h3>' +
      (p.description ? '<p style="color:' + esc(textColor) + ';opacity:.8;margin:0 0 12px;font-size:.875rem;line-height:1.5;flex:1">' + esc(p.description) + '</p>' : '') +
      (p.ctaLabel && p.ctaLink ? '<a href="' + esc(p.ctaLink) + '" style="display:inline-block;padding:8px 20px;background:' + esc(accent) + ';color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:.875rem;align-self:flex-start">' + esc(p.ctaLabel) + '</a>' : '') +
      '</div>';
  }

  function Button(p) {
    var variantMap = {
      primary: 'background:#0158ad;color:#fff;border:none',
      secondary: 'background:#64748b;color:#fff;border:none',
      accent: 'background:#f59e0b;color:#fff;border:none',
      outline: 'background:transparent;color:#0158ad;border:2px solid #0158ad',
      success: 'background:#22c55e;color:#fff;border:none',
    };
    var sizeMap = {
      small: 'font-size:.8rem;padding:6px 14px',
      medium: 'padding:10px 20px',
      large: 'font-size:1.125rem;padding:14px 28px',
    };
    var vStyle = variantMap[p.variant || 'primary'] || variantMap.primary;
    var sStyle = sizeMap[p.size || 'medium'] || sizeMap.medium;
    return '<div style="padding:16px">' +
      '<button style="border-radius:6px;cursor:pointer;font-weight:600;' + vStyle + ';' + sStyle + '">' + esc(p.text || 'Click Me') + '</button>' +
      '</div>';
  }

  function AboutSection(p) {
    var pad = (p.padding != null ? p.padding : 80) + 'px 0';
    var bg = p.backgroundColor || '#ffffff';
    var maxWidth = Number(p.maxWidth) || 1200;
    var img = p.image || {};
    var url = img.url || '';
    var imagePosition = p.imagePosition || 'right';
    var isTop = imagePosition === 'top';
    var isLeft = imagePosition === 'left';
    var imageStyle = p.imageStyle || 'rounded';
    var imageHeight = Number(p.imageHeight) || 460;
    var radius = imageStyle === 'circle' ? '50%' : (imageStyle === 'square' ? '0px' : (p.imageRadius != null ? p.imageRadius : 16) + 'px');
    var imageShadow = p.imageShadow === true;
    var textAlign = p.textAlign || 'left';
    var verticalAlign = p.verticalAlign || 'center';
    var vAlign = verticalAlign === 'top' ? 'flex-start' : (verticalAlign === 'bottom' ? 'flex-end' : 'center');
    var itemsAlign = textAlign === 'center' ? 'center' : (textAlign === 'right' ? 'flex-end' : 'flex-start');
    var columnGap = Number(p.columnGap) || 64;
    var showStats = p.showStats !== false;
    var stats = Array.isArray(p.stats) ? p.stats : [];
    var accent = p.buttonColor || '#0158ad';
    var btnText = p.buttonTextColor || '#ffffff';

    var imgW = imageStyle === 'circle' ? imageHeight + 'px' : '100%';
    var imgMargin = (isTop || imageStyle === 'circle') ? 'margin:0 auto;' : '';
    var imgShadowCss = imageShadow ? 'box-shadow:0 20px 45px rgba(0,0,0,0.18);' : '';
    var imageEl = url
      ? '<img src="' + esc(url) + '" alt="' + esc(p.title || 'About') + '" style="width:' + imgW + ';height:' + imageHeight + 'px;max-width:100%;object-fit:cover;display:block;border-radius:' + radius + ';' + imgMargin + imgShadowCss + '">'
      : '';

    var statsEl = (showStats && stats.length)
      ? '<div style="display:grid;grid-template-columns:repeat(' + Math.min(stats.length, 4) + ',1fr);gap:16px;margin-bottom:32px;padding:24px 0;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;width:100%">' +
        stats.map(function (st) {
          return '<div style="text-align:center"><div style="font-size:1.75rem;font-weight:700;color:' + esc(p.statValueColor || '#0158ad') + ';line-height:1.1">' + esc(st.value) + '</div><div style="font-size:.8rem;color:' + esc(p.statLabelColor || '#374151') + ';opacity:.7;margin-top:4px">' + esc(st.label) + '</div></div>';
        }).join('') + '</div>'
      : '';

    var buttonsEl = (p.primaryButtonLabel || p.secondaryButtonLabel)
      ? '<div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:' + itemsAlign + '">' +
        (p.primaryButtonLabel ? '<a href="' + esc(p.primaryButtonLink || '#') + '" class="pb-btn" style="display:inline-block;background:' + esc(accent) + ';color:' + esc(btnText) + ';padding:12px 28px;border-radius:8px;font-weight:600;text-decoration:none">' + esc(p.primaryButtonLabel) + '</a>' : '') +
        (p.secondaryButtonLabel ? '<a href="' + esc(p.secondaryButtonLink || '#') + '" class="pb-btn" style="display:inline-block;background:transparent;color:' + esc(accent) + ';padding:12px 28px;border-radius:8px;font-weight:600;text-decoration:none;border:2px solid ' + esc(accent) + '">' + esc(p.secondaryButtonLabel) + '</a>' : '') +
        '</div>'
      : '';

    var contentEl = '<div style="display:flex;flex-direction:column;align-items:' + itemsAlign + ';text-align:' + textAlign + ';min-width:0">' +
      (p.badge ? '<span style="display:inline-block;font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:' + esc(p.badgeColor || '#0158ad') + ';margin-bottom:12px">' + esc(p.badge) + '</span>' : '') +
      (p.subtitle ? '<p style="font-size:16px;color:' + esc(p.subtitleColor || '#374151') + ';margin:0 0 8px">' + esc(p.subtitle) + '</p>' : '') +
      (p.title ? '<h2 style="font-size:2rem;font-weight:700;color:' + esc(p.titleColor || '#1a1a1a') + ';line-height:1.2;margin:0 0 16px">' + esc(p.title) + '</h2>' : '') +
      (p.description ? '<p style="font-size:1rem;line-height:1.7;color:' + esc(p.descriptionColor || '#374151') + ';margin:0 0 32px">' + esc(p.description) + '</p>' : '') +
      statsEl + buttonsEl +
      '</div>';

    var inner = isTop
      ? '<div style="display:flex;flex-direction:column;gap:40px;align-items:' + (textAlign === 'center' ? 'center' : itemsAlign) + '">' + imageEl + contentEl + '</div>'
      : '<div' + (url ? ' class="pb-grid-2col"' : '') + ' style="display:grid;grid-template-columns:' + (url ? '1fr 1fr' : '1fr') + ';gap:' + columnGap + 'px;align-items:' + vAlign + '">' +
        '<div style="order:' + (isLeft ? 0 : 1) + ';min-width:0">' + imageEl + '</div>' +
        '<div style="order:' + (isLeft ? 1 : 0) + ';min-width:0">' + contentEl + '</div>' +
        '</div>';

    return '<section style="background:' + esc(bg) + ';padding:' + pad + '">' +
      '<div style="max-width:' + maxWidth + 'px;margin:0 auto;padding:0 24px">' + inner + '</div></section>';
  }

  function GallerySection(p) {
    var pad = (p.padding != null ? p.padding : 80) + 'px 0';
    var bg = p.backgroundColor || '#f8fafc';
    var cols = Number(p.columns) || 3;
    var gap = Number(p.gap) || 16;
    var images = Array.isArray(p.images) ? p.images : [];
    return '<section style="background:' + esc(bg) + ';padding:' + pad + '">' +
      '<div style="max-width:1200px;margin:0 auto;padding:0 24px">' +
      ((p.title || p.subtitle) ? '<div style="text-align:center;margin-bottom:48px">' +
        (p.subtitle ? '<p style="font-size:14px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#0158ad;margin:0 0 8px">' + esc(p.subtitle) + '</p>' : '') +
        (p.title ? '<h2 style="font-size:2rem;font-weight:700;color:#1a1a1a;margin:0">' + esc(p.title) + '</h2>' : '') +
        '</div>' : '') +
      '<div style="display:grid;grid-template-columns:repeat(' + cols + ',1fr);gap:' + gap + 'px">' +
      images.filter(function (img) { return img.url; }).map(function (img) {
        return '<div style="position:relative;overflow:hidden;border-radius:8px">' +
          '<img src="' + esc(img.url) + '" alt="' + esc(img.alt || '') + '" loading="lazy" style="width:100%;aspect-ratio:4/3;object-fit:cover;display:block">' +
          (img.caption ? '<div style="position:absolute;bottom:0;left:0;right:0;padding:8px 12px;background:linear-gradient(to top,rgba(0,0,0,.7),transparent);color:#fff;font-size:13px;font-weight:500">' + esc(img.caption) + '</div>' : '') +
          '</div>';
      }).join('') +
      '</div></div></section>';
  }

  function ServiceSection(p) {
    var pad = (p.padding != null ? p.padding : 80) + 'px 0';
    var bg = p.backgroundColor || '#fff';
    var cols = Number(p.columns) || 3;
    var align = p.contentAlign || 'left';
    var services = Array.isArray(p.services) ? p.services : [];
    var cardStyleMap = {
      bordered: 'border:1px solid #e5e7eb',
      shadow: 'box-shadow:0 4px 20px rgba(0,0,0,.08)',
      flat: 'background:#f8fafc',
    };
    var cs = cardStyleMap[p.cardStyle || 'shadow'] || cardStyleMap.shadow;
    return '<section style="background:' + esc(bg) + ';padding:' + pad + '">' +
      '<div style="max-width:1200px;margin:0 auto;padding:0 24px">' +
      ((p.title || p.subtitle) ? '<div style="text-align:center;margin-bottom:48px">' +
        (p.subtitle ? '<p style="font-size:14px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#0158ad;margin:0 0 8px">' + esc(p.subtitle) + '</p>' : '') +
        (p.title ? '<h2 style="font-size:2rem;font-weight:700;color:#1a1a1a;margin:0">' + esc(p.title) + '</h2>' : '') +
        '</div>' : '') +
      '<div style="display:grid;grid-template-columns:repeat(' + cols + ',1fr);gap:24px;text-align:' + align + '">' +
      services.map(function (sv) {
        return '<div style="padding:24px;border-radius:8px;' + cs + '">' +
          (sv.icon ? '<span style="font-size:2rem;display:block;margin-bottom:16px">' + esc(sv.icon) + '</span>' : '') +
          ((sv.image && sv.image.url) ? '<img src="' + esc(sv.image.url) + '" alt="" style="width:100%;height:160px;object-fit:cover;border-radius:4px;margin-bottom:12px;display:block">' : '') +
          '<h3 style="font-size:1.125rem;font-weight:700;margin:0 0 8px;color:#1a1a1a">' + esc(sv.title || '') + '</h3>' +
          '<p style="color:#374151;opacity:.8;font-size:.9rem;line-height:1.6;margin:0 0 12px">' + esc(sv.description || '') + '</p>' +
          (sv.linkLabel && sv.link ? '<a href="' + esc(sv.link) + '" style="color:#0158ad;font-weight:600;text-decoration:none;font-size:.875rem">' + esc(sv.linkLabel) + ' →</a>' : '') +
          '</div>';
      }).join('') +
      '</div></div></section>';
  }

  function TestimonialSection(p) {
    var pad = (p.padding != null ? p.padding : 80) + 'px 0';
    var bg = p.backgroundColor || '#fff';
    var cols = Number(p.columns) || 2;
    var align = p.contentAlign || 'center';
    var accent = p.accentColor || '#0158ad';
    var cardBg = p.cardBackgroundColor || '#f8fafc';
    var items = Array.isArray(p.testimonials) ? p.testimonials : [];
    var avatarSize = p.avatarSize === 'small' ? '40px' : p.avatarSize === 'large' ? '80px' : '60px';
    var csMap = {
      bordered: 'border:1px solid #e5e7eb',
      shadow: 'box-shadow:0 4px 20px rgba(0,0,0,.08)',
      minimal: '',
      glass: 'border:1px solid rgba(255,255,255,.3)',
    };
    var cs = csMap[p.cardStyle || 'shadow'] || '';
    return '<section style="background:' + esc(bg) + ';padding:' + pad + '">' +
      '<div style="max-width:1200px;margin:0 auto;padding:0 24px">' +
      ((p.title || p.subtitle) ? '<div style="text-align:center;margin-bottom:48px">' +
        (p.subtitle ? '<p style="font-size:14px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:' + esc(accent) + ';margin:0 0 8px">' + esc(p.subtitle) + '</p>' : '') +
        (p.title ? '<h2 style="font-size:2rem;font-weight:700;color:#1a1a1a;margin:0">' + esc(p.title) + '</h2>' : '') +
        '</div>' : '') +
      '<div style="display:grid;grid-template-columns:repeat(' + cols + ',1fr);gap:24px">' +
      items.map(function (t) {
        return '<div style="padding:24px;background:' + esc(cardBg) + ';border-radius:8px;text-align:' + align + ';' + cs + '">' +
          (p.showQuotes ? '<span style="font-size:2rem;color:' + esc(accent) + ';display:block;margin-bottom:12px">✦</span>' : '') +
          (t.quote ? '<p style="font-style:italic;color:#374151;line-height:1.7;margin:0 0 16px">"' + esc(t.quote) + '"</p>' : '') +
          (t.avatar ? '<img src="' + esc(t.avatar) + '" alt="" style="width:' + avatarSize + ';height:' + avatarSize + ';border-radius:50%;object-fit:cover;margin:0 auto 12px;display:block">' : '') +
          (t.author ? '<strong style="color:#1a1a1a;display:block">' + esc(t.author) + '</strong>' : '') +
          (t.role ? '<span style="font-size:12px;color:#6b7280">' + esc(t.role) + '</span>' : '') +
          (t.rating ? '<div style="color:' + esc(accent) + ';font-size:14px;margin-top:8px">' + '★'.repeat(t.rating) + '</div>' : '') +
          '</div>';
      }).join('') +
      '</div></div></section>';
  }

  function MarqueeBar(p) {
    var bg = p.backgroundColor || '#000';
    var textColor = p.textColor || '#fff';
    var fontSize = p.fontSize ? p.fontSize + 'px' : '14px';
    var padding = p.padding ? p.padding + 'px' : '10px';
    var speed = Number(p.speed) || 20;
    var dir = p.direction === 'right' ? 'marqueeRight' : 'marqueeLeft';
    var repeat = Number(p.repeat) || 10;
    var text = p.text || '';
    var pauseOnHover = p.pauseOnHover !== false;
    var items = new Array(repeat + 1).join('<span style="margin-right:40px">' + esc(text) + '</span>');
    var wrapperClass = 'pb-marquee' + (pauseOnHover ? ' pb-marquee-pause' : '');
    return '<div class="' + wrapperClass + '" style="overflow:hidden;white-space:nowrap;background:' + esc(bg) + ';color:' + esc(textColor) + ';font-size:' + fontSize + ';padding:' + padding + '">' +
      '<div class="pb-marquee-track" style="display:inline-block;animation:' + dir + ' ' + speed + 's linear infinite">' + items + '</div>' +
      '<style>@keyframes marqueeLeft{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}@keyframes marqueeRight{0%{transform:translateX(-50%)}100%{transform:translateX(0)}}.pb-marquee-pause:hover .pb-marquee-track{animation-play-state:paused!important}</style>' +
      '</div>';
  }

  function ContactSection(p) {
    var pad = (p.padding != null ? p.padding : 80) + 'px 0';
    var bg = p.backgroundColor || '#f8fafc';
    var accent = p.accentColor || '#0158ad';
    return '<section style="background:' + esc(bg) + ';padding:' + pad + '">' +
      '<div style="max-width:1200px;margin:0 auto;padding:0 24px">' +
      '<div style="text-align:center;margin-bottom:48px">' +
      (p.subtitle ? '<p style="font-size:14px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:' + esc(accent) + ';margin:0 0 8px">' + esc(p.subtitle) + '</p>' : '') +
      (p.title ? '<h2 style="font-size:2rem;font-weight:700;color:#1a1a1a;margin:0 0 12px">' + esc(p.title) + '</h2>' : '') +
      (p.description ? '<p style="color:#374151;max-width:600px;margin:0 auto">' + esc(p.description) + '</p>' : '') +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start">' +
      '<div>' +
      (p.email ? '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px"><span style="font-size:20px">📧</span><div><strong>Email</strong><br><a href="mailto:' + esc(p.email) + '" style="color:' + esc(accent) + '">' + esc(p.email) + '</a></div></div>' : '') +
      (p.phone ? '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px"><span style="font-size:20px">📞</span><div><strong>Phone</strong><br>' + esc(p.phone) + '</div></div>' : '') +
      (p.address ? '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px"><span style="font-size:20px">📍</span><div><strong>Address</strong><br>' + esc(p.address) + '</div></div>' : '') +
      '</div>' +
      (p.showForm !== false ? '<form action="" method="post" style="display:flex;flex-direction:column;gap:16px">' +
        '<input type="text" name="name" placeholder="Your Name" style="padding:12px 16px;border:1px solid #e5e7eb;border-radius:6px;font-size:1rem;width:100%;box-sizing:border-box">' +
        '<input type="email" name="email" placeholder="Your Email" style="padding:12px 16px;border:1px solid #e5e7eb;border-radius:6px;font-size:1rem;width:100%;box-sizing:border-box">' +
        '<textarea name="message" rows="5" placeholder="Your Message" style="padding:12px 16px;border:1px solid #e5e7eb;border-radius:6px;font-size:1rem;width:100%;box-sizing:border-box;resize:vertical"></textarea>' +
        '<button type="submit" style="padding:12px 28px;background:' + esc(accent) + ';color:#fff;border:none;border-radius:6px;font-size:1rem;font-weight:600;cursor:pointer">' + esc(p.buttonLabel || 'Send Message') + '</button>' +
        '</form>' : '') +
      '</div></div></section>';
  }

  function PhotoCollage(p) {
    var gap = Number(p.gap != null ? p.gap : 8);
    var gapPx = gap + 'px';
    var br = (p.borderRadius != null ? p.borderRadius : 8) + 'px';
    var fit = p.objectFit || 'cover';
    var images = Array.isArray(p.images) ? p.images : [];
    var valid = images.filter(function (img) { return img.url; });
    if (!valid.length) return '';

    var arMap = { '1:1': '1/1', '4:3': '4/3', '16:9': '16/9', '3:2': '3/2' };
    var ar = arMap[p.aspectRatio] || '1/1';

    var shadow = !p.boxShadow ? 'none'
      : p.shadowStrength === 'strong' ? '0 8px 24px rgba(0,0,0,0.3)'
      : p.shadowStrength === 'medium' ? '0 4px 12px rgba(0,0,0,0.2)'
      : '0 2px 6px rgba(0,0,0,0.12)';

    var hideClass = [
      p.hideDesktop ? 'puck-hide-desktop' : '',
      p.hideTablet  ? 'puck-hide-tablet'  : '',
      p.hideMobile  ? 'puck-hide-mobile'  : ''
    ].filter(Boolean).join(' ');
    var classAttr = ['pb-collage-wrap', hideClass].filter(Boolean).join(' ');

    function wrapCell(img, i, extraStyle) {
      return '<div class="pb-collage-item" style="overflow:hidden;border-radius:' + br + ';box-shadow:' + shadow + ';position:relative;' + (extraStyle || '') + '">' +
        '<img src="' + esc(img.url) + '" alt="' + esc(img.alt || ('Photo ' + (i + 1))) + '" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:' + esc(fit) + ';display:block">' +
        '</div>';
    }

    var layout = p.layout || 'mixed';

    if (layout === 'grid') {
      var cells = valid.map(function (img, i) {
        return wrapCell(img, i, 'aspect-ratio:' + ar + ';');
      }).join('');
      return '<div class="' + classAttr + '" style="display:grid;grid-template-columns:repeat(3,1fr);gap:' + gapPx + '">' + cells + '</div>';
    }

    if (layout === 'brick') {
      var FULL = 3;
      var brickW = 'calc((100% - ' + (FULL - 1) + ' * ' + gapPx + ') / ' + FULL + ')';
      var halfW  = 'calc((' + brickW + ' - ' + gapPx + ') / 2)';
      var rows = [];
      var bi = 0; var rowNo = 0;
      while (bi < valid.length) {
        var offset = rowNo % 2 === 1;
        var count = offset ? FULL - 1 : FULL;
        rows.push({ items: valid.slice(bi, bi + count), offset: offset });
        bi += count; rowNo++;
      }
      var imgIdx = 0;
      var rowsHtml = rows.map(function (row) {
        var edge = row.offset ? '<div style="flex:0 0 ' + halfW + '"></div>' : '';
        var tiles = row.items.map(function (img) {
          return wrapCell(img, imgIdx++, 'flex:0 0 ' + brickW + ';aspect-ratio:' + ar + ';');
        }).join('');
        return '<div style="display:flex;gap:' + gapPx + '">' + edge + tiles + edge + '</div>';
      }).join('');
      return '<div class="' + classAttr + '" style="display:flex;flex-direction:column;gap:' + gapPx + ';overflow:hidden">' + rowsHtml + '</div>';
    }

    if (layout === 'carousel') {
      var cells2 = valid.map(function (img, i) {
        return wrapCell(img, i, 'flex:0 0 auto;width:min(70%,360px);aspect-ratio:' + ar + ';scroll-snap-align:start;');
      }).join('');
      return '<div class="' + classAttr + '" style="display:flex;gap:' + gapPx + ';overflow-x:auto;padding-bottom:6px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch">' + cells2 + '</div>';
    }

    // mixed (default)
    var mixedCells = valid.map(function (img, i) {
      var spanStyle = i === 0 ? 'grid-column:span 2;grid-row:span 2;aspect-ratio:' + ar + ';' : 'aspect-ratio:' + ar + ';';
      return wrapCell(img, i, spanStyle);
    }).join('');
    return '<div class="' + classAttr + '" style="display:grid;grid-template-columns:repeat(3,1fr);gap:' + gapPx + '">' + mixedCells + '</div>';
  }

  // ── ProgressBar ─────────────────────────────────────────────────────────────

  function ProgressBar(p) {
    var pbType    = p.pbType || 'line';
    var label     = p.label || '';
    var pct       = Math.min(100, Math.max(0, p.value != null ? p.value : 75));
    var showPct   = p.showPercentage !== false;
    var fillStyle = p.fillStyle || 'solid';
    var fc        = p.fillColor  || '#0158ad';
    var tc        = p.trackColor || '#e5e7eb';
    var gradEnd   = p.gradientEnd || '#60a5fa';
    var lineH     = Number(p.lineHeight != null ? p.lineHeight : 12);
    var lineR     = Number(p.lineRadius  != null ? p.lineRadius  : 6);
    var lfs       = Number(p.labelFontSize  != null ? p.labelFontSize  : 14);
    var lc        = p.labelColor  || 'var(--text-color)';
    var pfs       = Number(p.pctFontSize != null ? p.pctFontSize : 13);
    var pc        = p.pctColor || 'var(--text-color)';
    var alignment = p.alignment || 'left';
    var alignCss  = alignment === 'center' ? 'text-align:center;' : alignment === 'right' ? 'text-align:right;' : '';
    var hideClass = [p.hideDesktop ? 'puck-hide-desktop' : '', p.hideTablet ? 'puck-hide-tablet' : '', p.hideMobile ? 'puck-hide-mobile' : ''].filter(Boolean).join(' ');
    var classAttr = ['', p.cssClass, hideClass].filter(Boolean).join(' ').trim();

    var fillBg = fillStyle === 'gradient'
      ? 'linear-gradient(90deg,' + esc(fc) + ',' + esc(gradEnd) + ')'
      : esc(fc);
    var stripedOverlay = fillStyle === 'striped'
      ? ';background-image:repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(255,255,255,0.2) 8px,rgba(255,255,255,0.2) 16px)'
      : '';

    function buildLine(rowLabel, rowPct, mb) {
      var hdrLabel = rowLabel ? '<span style="font-size:' + lfs + 'px;color:' + esc(lc) + ';display:inline-block;flex:1">' + esc(rowLabel) + '</span>' : '';
      var hdrPct   = showPct ? '<span style="font-size:' + pfs + 'px;color:' + esc(pc) + ';font-weight:600;display:inline-block;flex-shrink:0">' + rowPct + '%</span>' : '';
      var header   = (rowLabel || showPct) ? '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:8px;line-height:1.4">' + hdrLabel + hdrPct + '</div>' : '';
      var fill  = '<div class="pb-bar-fill" style="display:block;height:' + lineH + 'px;min-height:' + lineH + 'px;width:' + rowPct + '%;max-width:100%;background:' + fillBg + stripedOverlay + ';border-radius:' + lineR + 'px;box-sizing:border-box"></div>';
      var track = '<div class="pb-bar-track" style="display:block;position:relative;height:' + lineH + 'px;min-height:' + lineH + 'px;width:100%;background:' + esc(tc) + ';border-radius:' + lineR + 'px;overflow:hidden;box-sizing:border-box;line-height:0;font-size:0">' + fill + '</div>';
      var mbS = mb ? 'margin-bottom:' + mb + 'px;' : '';
      return '<div style="' + mbS + 'display:block">' + header + track + '</div>';
    }

    function buildCircleSvg(sz, thick, disp) {
      var r = (sz - thick) / 2, cx = sz / 2, cy = sz / 2;
      var circ = 2 * Math.PI * r, dash = (disp / 100) * circ, rest = circ - dash;
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 ' + sz + ' ' + sz + '" style="transform:rotate(-90deg)">' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + esc(tc) + '" stroke-width="' + thick + '"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + esc(fc) + '" stroke-width="' + thick + '" stroke-linecap="round" stroke-dasharray="' + dash + ' ' + rest + '"/>' +
        '</svg>';
    }

    function buildSemiCircleSvg(sz, thick, disp) {
      var r = (sz - thick) / 2;
      var halfCirc = Math.PI * r, dash = (disp / 100) * halfCirc;
      var halfH = sz / 2 + thick, x1 = thick / 2, x2 = sz - thick / 2, cy = sz / 2;
      return '<svg width="' + sz + '" height="' + halfH + '" viewBox="0 0 ' + sz + ' ' + halfH + '" style="overflow:visible;display:block">' +
        '<path d="M ' + x1 + ' ' + cy + ' A ' + r + ' ' + r + ' 0 0 1 ' + x2 + ' ' + cy + '" fill="none" stroke="' + esc(tc) + '" stroke-width="' + thick + '" stroke-linecap="round"/>' +
        '<path d="M ' + x1 + ' ' + cy + ' A ' + r + ' ' + r + ' 0 0 1 ' + x2 + ' ' + cy + '" fill="none" stroke="' + esc(fc) + '" stroke-width="' + thick + '" stroke-linecap="round" stroke-dasharray="' + dash + ' ' + halfCirc + '"/>' +
        '</svg>';
    }

    function wrap(inner) {
      return '<div' + (classAttr ? ' class="' + classAttr + '"' : '') + ' style="display:block;box-sizing:border-box;width:100%;' + alignCss + '">' + inner + '</div>';
    }

    if (pbType === 'line') return wrap(buildLine(label, pct, 0));

    if (pbType === 'circle') {
      var sz = Number(p.circleSize != null ? p.circleSize : 120);
      var thick = Number(p.ringThickness != null ? p.ringThickness : 10);
      var showInside = p.showLabelInside !== false;
      var pctInner = showPct && showInside ? '<span style="font-size:' + pfs + 'px;color:' + esc(pc) + ';font-weight:700;line-height:1;display:block">' + pct + '%</span>' : '';
      var lblInner = label && showInside ? '<span style="font-size:' + Math.round(lfs * 0.78) + 'px;color:' + esc(lc) + ';line-height:1;display:block">' + esc(label) + '</span>' : '';
      var inside = showInside ? '<div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px">' + pctInner + lblInner + '</div>' : '';
      var below = !showInside && label ? '<span style="font-size:' + lfs + 'px;color:' + esc(lc) + ';display:block">' + esc(label) + '</span>' : '';
      return wrap('<div style="display:inline-flex;flex-direction:column;align-items:center;gap:6px"><div style="position:relative;width:' + sz + 'px;height:' + sz + 'px;display:block;line-height:0;font-size:0">' + buildCircleSvg(sz, thick, pct) + inside + '</div>' + below + '</div>');
    }

    if (pbType === 'semicircle') {
      var szS = Number(p.circleSize != null ? p.circleSize : 160);
      var thickS = Number(p.ringThickness != null ? p.ringThickness : 14);
      var halfH2 = szS / 2 + thickS;
      var showInsideS = p.showLabelInside !== false;
      var pctS = showPct && showInsideS ? '<span style="font-size:' + pfs + 'px;color:' + esc(pc) + ';font-weight:700;line-height:1.2;display:block">' + pct + '%</span>' : '';
      var lblS = label && showInsideS ? '<span style="font-size:' + Math.round(lfs * 0.8) + 'px;color:' + esc(lc) + ';margin-top:2px;display:block">' + esc(label) + '</span>' : '';
      var insideS = showInsideS ? '<div style="position:absolute;bottom:0;left:0;right:0;display:flex;flex-direction:column;align-items:center;padding-bottom:4px">' + pctS + lblS + '</div>' : '';
      var belowS = !showInsideS && label ? '<span style="font-size:' + lfs + 'px;color:' + esc(lc) + ';display:block">' + esc(label) + '</span>' : '';
      return wrap('<div style="display:inline-flex;flex-direction:column;align-items:center;gap:4px"><div style="position:relative;width:' + szS + 'px;height:' + halfH2 + 'px;display:block">' + buildSemiCircleSvg(szS, thickS, pct) + insideS + '</div>' + belowS + '</div>');
    }

    if (pbType === 'step') {
      var total = Math.max(1, Number(p.totalSteps != null ? p.totalSteps : 5));
      var active = Math.min(total, Math.max(0, Number(p.activeStep != null ? p.activeStep : 3)));
      var showNums = !!p.showStepNumbers;
      var labelHtml = label ? '<div style="font-size:' + lfs + 'px;color:' + esc(lc) + ';margin-bottom:8px;display:block">' + esc(label) + '</div>' : '';
      var steps = Array.from({length: total}, function(_, i) {
        var on = i < active;
        var numH = showNums ? '<span style="font-size:' + Math.max(9, lineH - 3) + 'px;color:' + (on ? '#fff' : esc(lc)) + '">' + (i + 1) + '</span>' : '';
        return '<div style="flex:1;height:' + lineH + 'px;min-height:' + lineH + 'px;border-radius:' + lineR + 'px;background:' + (on ? esc(fc) : esc(tc)) + ';display:flex;align-items:center;justify-content:center;box-sizing:border-box">' + numH + '</div>';
      }).join('');
      var pctStep = showPct ? '<div style="font-size:' + pfs + 'px;color:' + esc(pc) + ';margin-top:6px;display:block">' + Math.round((active / total) * 100) + '%</div>' : '';
      return wrap(labelHtml + '<div style="display:flex;gap:6px;align-items:stretch">' + steps + '</div>' + pctStep);
    }

    if (pbType === 'multirow') {
      var rows = Array.isArray(p.multiRows) ? p.multiRows : [{label:'Row 1', value:60}];
      var rowsHtml = rows.map(function(row, i) {
        return buildLine(row.label || '', Math.min(100, Math.max(0, row.value || 0)), i < rows.length - 1 ? 12 : 0);
      }).join('');
      return wrap(rowsHtml);
    }

    return wrap(buildLine(label, pct, 0));
  }

  // ── Dispatcher ──────────────────────────────────────────────────────────────

  function Divider(p) {
    var color = p.lineColor || '#e5e7eb';
    var th = Number(p.thickness || 1);
    var lineStyle = p.lineStyle || 'solid';
    var width = p.lineWidthVal != null ? (p.lineWidthVal + (p.lineWidthUnit || '%')) : '100%';
    var gap = Number(p.gap != null ? p.gap : 16) || 16;
    var align = p.alignment || 'center';
    var justify = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
    var br = Number(p.borderRadius || 0);
    var brCss = br > 0 ? 'border-radius:' + br + 'px;' : '';
    var spacing = 'margin:' + ((p.advMargin && p.advMargin.top) || 0) + 'px ' + ((p.advMargin && p.advMargin.right) || 0) + 'px ' + ((p.advMargin && p.advMargin.bottom) || 0) + 'px ' + ((p.advMargin && p.advMargin.left) || 0) + 'px;';
    var hideClass = [p.hideDesktop ? 'puck-hide-desktop' : '', p.hideTablet ? 'puck-hide-tablet' : '', p.hideMobile ? 'puck-hide-mobile' : ''].filter(Boolean).join(' ');

    function buildLine(widthStyle) {
      var baseWrap = 'display:block;' + widthStyle + 'align-self:center;flex-shrink:' + (widthStyle.indexOf('flex:1') === 0 ? '1' : '0') + ';' + brCss;
      if (lineStyle === 'gradient') {
        var c1 = p.gradientStart || '#e5e7eb';
        var c2 = p.gradientEnd   || '#e5e7eb';
        return '<div style="' + baseWrap + 'height:' + th + 'px;min-height:' + th + 'px;background:linear-gradient(90deg,' + esc(c1) + ',' + esc(c2) + ');"></div>';
      }
      if (lineStyle === 'shadow') {
        var h = th * 4;
        return '<div style="' + baseWrap + 'height:' + h + 'px;min-height:' + h + 'px;background:radial-gradient(ellipse at 50% 0%,' + esc(color) + ' 0%,transparent 70%);"></div>';
      }
      if (lineStyle === 'wave') {
        var hw = Math.max(th * 6, 12);
        var mid = hw / 2; var amp = mid * 0.8;
        var path = 'M0,' + mid + ' C15,' + (mid-amp) + ' 15,' + (mid+amp) + ' 30,' + mid + ' S45,' + (mid-amp) + ' 60,' + mid + ' S75,' + (mid+amp) + ' 90,' + mid + ' S105,' + (mid-amp) + ' 120,' + mid + ' S135,' + (mid+amp) + ' 150,' + mid + ' S165,' + (mid-amp) + ' 180,' + mid + ' S195,' + (mid+amp) + ' 210,' + mid + ' S225,' + (mid-amp) + ' 240,' + mid + ' S255,' + (mid+amp) + ' 270,' + mid + ' S285,' + (mid-amp) + ' 300,' + mid + ' S315,' + (mid+amp) + ' 330,' + mid + ' S345,' + (mid-amp) + ' 360,' + mid + ' S375,' + (mid+amp) + ' 390,' + mid + ' S405,' + (mid-amp) + ' 420,' + mid + ' S435,' + (mid+amp) + ' 450,' + mid + ' S465,' + (mid-amp) + ' 480,' + mid + ' S495,' + (mid+amp) + ' 510,' + mid + ' S525,' + (mid-amp) + ' 540,' + mid + ' S555,' + (mid+amp) + ' 570,' + mid + ' S585,' + (mid-amp) + ' 600,' + mid;
        return '<div style="' + baseWrap + 'height:' + hw + 'px;min-height:' + hw + 'px;overflow:hidden;"><svg width="100%" height="' + hw + '" viewBox="0 0 600 ' + hw + '" preserveAspectRatio="none" style="display:block;overflow:visible"><path d="' + path + '" fill="none" stroke="' + esc(color) + '" stroke-width="' + th + '" vector-effect="non-scaling-stroke"/></svg></div>';
      }
      if (lineStyle === 'zigzag') {
        var hz = Math.max(th * 6, 12);
        var pts = Array.from({length:61}, function(_,i){ return i*10 + ',' + (i%2===0?hz:0); }).join(' ');
        return '<div style="' + baseWrap + 'height:' + hz + 'px;min-height:' + hz + 'px;overflow:hidden;"><svg width="100%" height="' + hz + '" viewBox="0 0 600 ' + hz + '" preserveAspectRatio="none" style="display:block;overflow:visible"><polyline points="' + pts + '" fill="none" stroke="' + esc(color) + '" stroke-width="' + th + '" vector-effect="non-scaling-stroke"/></svg></div>';
      }
      if (lineStyle === 'double') {
        var gap2 = Math.max(th, 2);
        var lineDiv = '<div style="height:' + th + 'px;min-height:' + th + 'px;background:' + esc(color) + ';' + brCss + 'font-size:0;line-height:0;"></div>';
        return '<div style="' + baseWrap + 'display:flex;flex-direction:column;gap:' + gap2 + 'px;">' + lineDiv + lineDiv + '</div>';
      }
      if (lineStyle === 'dashed' || lineStyle === 'dotted') {
        return '<div style="' + baseWrap + 'height:' + th + 'px;min-height:' + th + 'px;border-top:' + th + 'px ' + lineStyle + ' ' + esc(color) + ';background:transparent;box-sizing:content-box;font-size:0;line-height:0;overflow:hidden;"></div>';
      }
      // solid
      return '<div style="' + baseWrap + 'height:' + th + 'px;min-height:' + th + 'px;background:' + esc(color) + ';' + brCss + 'font-size:0;line-height:0;overflow:hidden;"></div>';
    }

    var inner = '';
    if (p.showElement) {
      var elType = p.elementType || 'icon';
      var iconVal = String(p.elementIcon || '').trim();
      var imgUrl  = String(p.elementImage || '').trim();
      var hasContent = elType === 'text' ? true : elType === 'image' ? !!imgUrl : !!iconVal;
      if (hasContent) {
        var elSpacing = (Number(p.elementSpacing != null ? p.elementSpacing : 12)) + 'px';
        var elContent = '';
        if (elType === 'text') {
          elContent = '<span style="font-size:' + (p.elementFontSize || 14) + 'px;color:' + esc(p.elementTextColor || color) + ';white-space:nowrap;line-height:1;">' + esc(p.elementText || 'OR') + '</span>';
        } else if (elType === 'image') {
          var imgW = Number(p.elementImageWidth || 40);
          var imgH2 = Number(p.elementImageHeight || 40);
          var imgR = Number(p.elementImageRadius || 0);
          elContent = '<img src="' + esc(imgUrl) + '" alt="" style="width:' + imgW + 'px;height:' + imgH2 + 'px;object-fit:contain;display:inline-block;vertical-align:middle;' + (imgR > 0 ? 'border-radius:' + imgR + 'px;' : '') + '" />';
        } else {
          elContent = '<span style="font-size:' + (p.iconSize || 20) + 'px;color:' + esc(p.iconColor || color) + ';line-height:1;display:inline-block;">' + esc(iconVal) + '</span>';
        }
        var elPos = p.elementPosition || 'center';
        var elDiv = '<div style="flex-shrink:0;padding:0 ' + elSpacing + ';display:flex;align-items:center;">' + elContent + '</div>';
        var lineL = buildLine('flex:1;');
        var lineR = buildLine('flex:1;');
        if (elPos === 'left')       inner = '<div style="display:flex;align-items:center;width:' + width + ';">' + elDiv + lineR + '</div>';
        else if (elPos === 'right') inner = '<div style="display:flex;align-items:center;width:' + width + ';">' + lineL + elDiv + '</div>';
        else                        inner = '<div style="display:flex;align-items:center;width:' + width + ';">' + lineL + elDiv + lineR + '</div>';
      } else {
        inner = buildLine('width:' + width + ';');
      }
    } else {
      inner = buildLine('width:' + width + ';');
    }
    return '<div class="' + (hideClass || '') + '" style="' + spacing + 'padding-top:' + gap + 'px;padding-bottom:' + gap + 'px;display:flex;justify-content:' + justify + ';align-items:center;">' + inner + '</div>';
  }

  var renderers = {
    Hero: Hero,
    GradientHero: GradientHero,
    TextBlock: TextBlock,
    Text: Text,
    HeadingBlock: HeadingBlock,
    Space: Space,
    Image: Image,
    ColumnSection: ColumnSection,
    GridBlock: GridBlock,
    DoubleColumn: DoubleColumn,
    Accordian: Accordian,
    Article: Article,
    CardBlock: CardBlock,
    Button: Button,
    AboutSection: AboutSection,
    GallerySection: GallerySection,
    ServiceSection: ServiceSection,
    TestimonialSection: TestimonialSection,
    MarqueeBar: MarqueeBar,
    ContactSection: ContactSection,
    PhotoCollage: PhotoCollage,
    Divider: Divider,
    ProgressBar: ProgressBar,
  };

  function renderBlock(block, zones) {
    if (!block || !block.type) return '';
    var fn = renderers[block.type];
    if (!fn) return ''; // unknown block types fall through silently
    try {
      // ColumnSection/GridBlock/DoubleColumn/Accordian use zones
      if (fn.length >= 2) return fn(block.props || {}, zones);
      return fn(block.props || {});
    } catch (e) {
      if (window.console) console.warn('[page-builder] render error for type "' + block.type + '":', e);
      return '';
    }
  }

  function renderZone(zones, key) {
    var blocks = (zones || {})[key];
    if (!Array.isArray(blocks) || blocks.length === 0) return '';
    return blocks.map(function (b) { return renderBlock(b, zones); }).join('');
  }

  function renderPuckToHtml(envelope) {
    var puck = envelope && envelope.data ? envelope.data : envelope;
    if (!puck || !Array.isArray(puck.content)) return '';
    var zones = puck.zones || {};
    return (
      renderZone(zones, 'root:above-header') +
      renderZone(zones, 'above-header') +
      puck.content.map(function (b) { return renderBlock(b, zones); }).join('') +
      renderZone(zones, 'root:below-footer') +
      renderZone(zones, 'below-footer')
    );
  }

  // ── Slider enhancer ─────────────────────────────────────────────────────────
  // Hero slider mode renders inert markup; this wires it up on mount.

  function wireSliders(scope) {
    var sliders = (scope || document).querySelectorAll('[data-pb-hero-slider="1"]');
    sliders.forEach(function (root) {
      if (root.__pbInit) return;
      root.__pbInit = 1;
      var slides = root.querySelectorAll('.pb-hero-slide');
      var dots = root.querySelectorAll('[data-pb-dot]');
      var cur = 0;
      var timer = null;
      var paused = false;
      var autoplay = root.getAttribute('data-autoplay') === '1';
      var interval = Number(root.getAttribute('data-interval')) || 5000;
      var pauseOnHover = root.getAttribute('data-pause-on-hover') === '1';

      function show(i) {
        slides.forEach(function (s, k) {
          var on = k === i;
          s.style.opacity = on ? 1 : 0;
          s.style.pointerEvents = on ? 'auto' : 'none';
        });
        dots.forEach(function (d, k) {
          d.style.background = k === i ? '#fff' : 'rgba(255,255,255,.4)';
        });
        cur = i;
      }
      function next() { show((cur + 1) % slides.length); }
      function prev() { show((cur - 1 + slides.length) % slides.length); }

      var n = root.querySelector('[data-pb-next]');
      var pv = root.querySelector('[data-pb-prev]');
      if (n) n.addEventListener('click', next);
      if (pv) pv.addEventListener('click', prev);
      dots.forEach(function (d, k) { d.addEventListener('click', function () { show(k); }); });

      if (autoplay) {
        timer = setInterval(function () { if (!paused) next(); }, interval);
        if (pauseOnHover) {
          root.addEventListener('mouseenter', function () { paused = true; });
          root.addEventListener('mouseleave', function () { paused = false; });
        }
      }
    });
  }

  // ── Boot ────────────────────────────────────────────────────────────────────

  function init() {
    var root = document.getElementById('page-builder-root');
    if (!root) return;
    var raw = root.getAttribute('data-content');
    if (!raw) return;
    var envelope;
    try {
      envelope = JSON.parse(raw);
    } catch (e) {
      if (window.console) console.error('[page-builder] failed to parse data-content JSON:', e);
      return;
    }
    root.innerHTML = renderPuckToHtml(envelope);
    root.removeAttribute('data-content');
    wireSliders(root);

    // If page.body also wrote a fallback notice (e.g. the page was too big
    // to fit Shopify's 512 KB body cap), hide it now that the real content
    // is rendered — avoids the merchant seeing both the notice and the page.
    var fallbacks = document.querySelectorAll('.pb-body-fallback');
    for (var f = 0; f < fallbacks.length; f++) {
      fallbacks[f].style.display = 'none';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
