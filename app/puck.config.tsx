// @ts-nocheck
// ─────────────────────────────────────────────────────────────────────────────
// Puck page-builder registry.
//
// This file is intentionally thin: it wires the block components (each defined
// under ./puck-blocks) into the two Puck `Config` objects the app consumes:
//   • `config`        — the full editor config (root layout + all blocks)
//   • `previewConfig` — a lighter config used to render header/footer and SSR
//
// To add a new block: create it under app/puck-blocks/blocks/<name>.tsx, import
// it here, and register it in `config.components` (and `previewConfig` if it
// must render in the storefront/preview).
// ─────────────────────────────────────────────────────────────────────────────

import { Render, type Config } from "@my-app/puck-editor";

import { useState } from "react";

// ─── Shared prop types ───────────────────────────────────────────────────────
import type { RootProps, Props } from "@/puck-blocks/types";
export type { RootProps };

// ─── Block-local field helpers ───────────────────────────────────────────────
import { ConditionalZone } from "@/puck-blocks/block-fields";

// ─── Standalone block components ─────────────────────────────────────────────
import { ImageComponent } from "@/puck-blocks/blocks/image";
import { SpaceComponent } from "@/puck-blocks/blocks/space";
import { ButtonComponent } from "@/puck-blocks/blocks/button";
import { DividerComponent } from "@/puck-blocks/blocks/divider";
import { VideoComponent } from "@/puck-blocks/blocks/video";
import { SocialIconsComponent } from "@/puck-blocks/blocks/social-icons";
import { ShareButtonsComponent } from "@/puck-blocks/blocks/share-buttons";
import { StarRatingComponent } from "@/puck-blocks/blocks/star-rating";
import { ProgressBarComponent } from "@/puck-blocks/blocks/progress-bar";
import { AlertComponent } from "@/puck-blocks/blocks/alert";
import { BlockQuoteComponent } from "@/puck-blocks/blocks/blockquote";
import { LayoutBlockComponent } from "@/puck-blocks/blocks/layout";
import { GridBlockComponent } from "@/puck-blocks/blocks/grid";

// ─── Common content components (extracted to ./puck-blocks/blocks/common) ────
import { commonComponents } from "@/puck-blocks/blocks/common";

// ─── Section block + templates (extracted to ./puck-blocks/blocks/section) ───
import { SectionBlockComponent, sectionTemplateConfig } from "@/puck-blocks/blocks/section";
// Re-export so external callers (e.g. puck-splat/section-templates) keep
// importing it from "@/puck.config" as before.
export { sectionTemplateConfig };

// ─── Demo content for the global header/footer preview ───────────────────────
const headerData = {
  root: {
    props: { title: "" },
  },

  content: [
    {
      type: "GlobalHeader",

      props: {
        id: "global-header-default",

        height: "64px",

        backgroundColor: "#0158ad",

        textColor: "#FFFFFF",

        siteTitle: "My Page Builder",

        showShadow: true,

        showNavigation: true,

        navigationLinks: [
          { id: "1", label: "Home", url: "/", isActive: false },

          { id: "2", label: "Pages", url: "/admin/pages", isActive: false },

          { id: "3", label: "Admin", url: "/admin", isActive: false },
        ],
      },
    },
  ],

  zones: {},
};

const footerData = {
  root: {
    props: { title: "" },
  },

  content: [
    {
      type: "GlobalFooter",

      props: {
        id: "global-footer-default",

        height: "300px",

        backgroundColor: "#1F2937",

        textColor: "#F3F4F6",

        companyName: "My Page Builder",

        companyDescription: "Build beautiful pages without coding",

        showSocialLinks: true,

        socialLinks: {
          facebook: "https://facebook.com",

          twitter: "https://twitter.com",

          instagram: "https://instagram.com",

          linkedin: "https://linkedin.com",

          github: "https://github.com",
        },

        quickLinks: [
          { id: "1", label: "Home", url: "/", isActive: false },

          { id: "2", label: "Admin", url: "/admin", isActive: false },

          { id: "3", label: "Pages", url: "/admin/pages", isActive: false },
        ],

        copyrightText: "© 2026 My Page Builder. All rights reserved.",
      },
    },
  ],

  zones: {},
};


export const previewConfig: Config<Props, RootProps> = {
  root: {
    render: ({ children }) => <>{children}</>,
  },

  components: commonComponents,
};































export const config: Config<Props, RootProps> = {
  root: {
    fields: {},
    render: ({
      children,

      theme,

      containerWidth,

      headerData,

      footerData,

      isGlobalEditor,
    }) => {
      const [hoverHeader, setHoverHeader] = useState(false);

      const [hoverFooter, setHoverFooter] = useState(false);

      const notifyParent = (zone: "header" | "footer") => {
        try {
          window.dispatchEvent(
            new CustomEvent("puck:global-select", { detail: { zone } }),
          );
        } catch {
          // ignore in SSR/static preview
        }
      };

      return (
        <div
          className="page-preview min-h-screen flex flex-col"
          data-theme={theme || "light"}
          style={{
            fontFamily: "var(--font-family)",

            backgroundColor: "var(--background-color)",

            color: "var(--text-color)",

            containerType: "inline-size",
          }}
        >
          {/* ── Above Header Zone ───────────────────────────────────────────── */}

          {!isGlobalEditor && <ConditionalZone zone="above-header" />}

          {/* ── Global Header ───────────────────────────────────────────────── */}

          {!isGlobalEditor && headerData?.content?.length > 0 && (
            <div style={{ position: "relative" }}>
              <Render config={previewConfig} data={headerData} />

              {/* Always-present overlay — sits on top, owns all hover/click */}
              <div
                className="pb-global-overlay"
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 200,
                  cursor: "pointer",
                  boxSizing: "border-box",
                  background: hoverHeader ? "rgba(1,88,173,0.12)" : "transparent",
                  border: hoverHeader ? "2px dashed #0158ad" : "2px solid transparent",
                  transition: "background 0.15s, border-color 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={() => setHoverHeader(true)}
                onMouseLeave={() => setHoverHeader(false)}
                onClick={() => notifyParent("header")}
              >
              </div>
            </div>
          )}

          {/* Main Content */}

          <main className="flex-1 w-full">
            <div
              style={{ maxWidth: "var(--container-width)", margin: "0 auto" }}
            >
              {children}
            </div>
          </main>

          {/* ── Global Footer ───────────────────────────────────────────────── */}

          {!isGlobalEditor && footerData?.content?.length > 0 && (
            <div style={{ position: "relative" }}>
              <Render config={previewConfig} data={footerData} />

              {/* Always-present overlay — owns all hover/click */}
              <div
                className="pb-global-overlay"
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 200,
                  cursor: "pointer",
                  boxSizing: "border-box",
                  background: hoverFooter ? "rgba(15,118,110,0.12)" : "transparent",
                  border: hoverFooter ? "2px dashed #0f766e" : "2px solid transparent",
                  transition: "background 0.15s, border-color 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={() => setHoverFooter(true)}
                onMouseLeave={() => setHoverFooter(false)}
                onClick={() => notifyParent("footer")}
              >
              </div>
            </div>
          )}

          {/* ── Below Footer Zone ───────────────────────────────────────────── */}

          {!isGlobalEditor && <ConditionalZone zone="below-footer" />}
        </div>
      );
    },
  },

  components: {
    ...commonComponents,

    Image: ImageComponent,

    Space: SpaceComponent,

    Button: ButtonComponent,

    Divider: DividerComponent,

    Video: VideoComponent,

    BlockQuote: BlockQuoteComponent,

    StarRating: StarRatingComponent,

    ProgressBar: ProgressBarComponent,

    Alert: AlertComponent,

    SocialIcons: SocialIconsComponent,

    ShareButtons: ShareButtonsComponent,

    LayoutBlock: LayoutBlockComponent,

    GridBlock: GridBlockComponent,

    Section: SectionBlockComponent,

    // Section template components — appear under "Sections" category in the drawer
    ...sectionTemplateConfig,
  },
};

// Patch layout/section blocks into previewConfig for preview/SSR rendering
(previewConfig.components as any).LayoutBlock = LayoutBlockComponent;
(previewConfig.components as any).GridBlock = GridBlockComponent;
(previewConfig.components as any).Section = SectionBlockComponent;
Object.entries(sectionTemplateConfig).forEach(([k, v]) => {
  (previewConfig.components as any)[k] = v;
});