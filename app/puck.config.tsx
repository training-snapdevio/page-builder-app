// @ts-nocheck

import {
  DropZone,
  FieldLabel,
  registerOverlayPortal,
  Render,
  usePuck,
  type Config,
} from "@my-app/puck-editor";

import { cloneElement, createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  PanelLeft,
  PanelRight,
  Image as ImageIcon,
  Layers,
  Settings2,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Square,
  Copy,
  Minus,
  LayoutGrid,
  Circle,
  Sparkles,
  Type,
  Video,
} from "lucide-react";

import Modal from "@/components/modal";
import { loadGoogleFont } from "@/puck-splat/utils";

import type { GlobalSettings } from "@/lib/settings.server";

// ─── Shared editor field primitives (extracted to ./puck-blocks/shared) ──────
import {
  AlignField,
  ToggleField,
  ColumnsField,
  StackedTextField,
  StackedDateField,
  StackedNumberField,
  NumberUnitField,
  StackedTextareaField,
  ColorPickerField,
  StackedField,
  SettingsSectionHeader,
  TAB_LABELS,
  useBlockTab,
  BlockTabBar,
  TabSection,
  EditorHideOverlay,
  FourSideField,
  InlineSelect,
  type BlockTab,
  SliderNumberField,
  SliderUnitField,
  IconButtonGroup,
  DIR_ICONS,
  JUSTIFY_ICONS,
  ALIGN_ICONS,
  WRAP_ICONS,
} from "@/puck-blocks/shared";

// ─────────────────────────────────────────────────────────────────────────────

// ─── Shared prop types (extracted to ./puck-blocks/types) ────────────────────
import type { RootProps, Props } from "@/puck-blocks/types";
export type { RootProps };

// ─── Block-local field helpers (extracted to ./puck-blocks/block-fields) ─────
import {
  imageUploadField,
  ImageField,
  videoUploadField,
  ConditionalZone,
  URL_PATTERN,
  LinkUrlField,
  ImageLinkUrlField,
  VideoUploadField,
} from "@/puck-blocks/block-fields";

// ─── Standalone block components (extracted to ./puck-blocks/blocks) ─────────
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

const commonComponents: any = {
  GlobalBlock: {
    fields: {
      globalBlockId: {
        type: "custom",

        label: "Block ID (do not edit)",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Block ID"
            value={value}
            onChange={onChange}
            placeholder="Block ID..."
          />
        ),
      },

      _name: {
        type: "custom",

        label: "Block Name (do not edit)",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Block Name"
            value={value}
            onChange={onChange}
            placeholder="Block Name..."
          />
        ),
      },
    },

    defaultProps: {
      globalBlockId: "",

      _name: "Global Block",
    },

    render: ({ globalBlockId, _name }: any) => (
      <div
        style={{
          border: "2px dashed #0158ad",

          borderRadius: 8,

          padding: "20px 16px",

          background: "#eff6ff",

          display: "flex",

          flexDirection: "column",

          alignItems: "center",

          gap: 6,

          userSelect: "none",

          pointerEvents: "none",
        }}
      >
        <span style={{ fontSize: 24 }}>🌐</span>

        <span style={{ fontWeight: 600, fontSize: 14, color: "#0158ad" }}>
          {_name || "Global Block"}
        </span>

        <span style={{ fontSize: 11, color: "#5b9bd5" }}>
          ID: {globalBlockId}
        </span>

        <span style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
          Edit from the Global Blocks panel → changes reflect on all pages
        </span>
      </div>
    ),
  },

  GlobalHeader: {
    label: "Header",
    fields: {
      height: {
        type: "custom",

        label: "Height (e.g., 64px)",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Height"
            value={value}
            onChange={onChange}
            placeholder="e.g., 64px"
          />
        ),
      },

      backgroundColor: {
        type: "custom",

        label: "Background Color",

        visible: ({ props }) =>
          !(
            (props?.image?.url && String(props.image.url).trim()) ||
            (props?.videoSettings?.url && String(props.videoSettings.url).trim())
          ),

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Background Color"
            value={value}
            onChange={onChange}
          />
        ),
      },

      backgroundImage: {
        type: "custom",

        label: "Background Image (URL)",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Background Image URL"
            value={value}
            onChange={onChange}
            placeholder="https://... or linear-gradient(...)"
          />
        ),
      },

      textPosition: {
        type: "custom",

        label: "Text Position",

        render: ({ value, onChange }) => (
          <AlignField
            value={value}
            onChange={onChange}
            label="Text Position"
            options={[
              { value: "justify-start",  icon: <AlignLeft size={15} />,   title: "Left" },

              { value: "justify-center", icon: <AlignCenter size={15} />, title: "Center" },

              { value: "justify-end",    icon: <AlignRight size={15} />,  title: "Right" },
            ]}
          />
        ),
      },

      textColor: {
        type: "custom",

        label: "Text Color",

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Text Color"
            value={value}
            onChange={onChange}
          />
        ),
      },

      siteTitle: {
        type: "custom",

        label: "Site Title",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Site Title"
            value={value}
            onChange={onChange}
            placeholder="My Page Builder"
          />
        ),
      },


      showNavigation: {
        type: "custom",

        label: "Show Navigation",

        render: ({ value, onChange }) => (
          <ToggleField
            value={!!value}
            onChange={onChange}
            label="Show Navigation"
          />
        ),
      },

      navigationLinks: {
        type: "array",

        label: "Navigation Links",

        getItemSummary: (item) => item.label || "Link",

        arrayFields: {
          label: {
            type: "custom",

            label: "Label",

            render: ({ value, onChange }) => (
              <StackedTextField
                label="Label"
                value={value}
                onChange={onChange}
                placeholder="e.g., Home"
              />
            ),
          },

          url: {
            type: "custom",

            label: "URL",

            render: ({ value, onChange }) => (
              <StackedTextField
                label="URL"
                value={value}
                onChange={onChange}
                placeholder="e.g., /home"
              />
            ),
          },
        },
      },

      logo: {
        type: "custom",

        label: "Logo Image URL",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Logo Image URL"
            value={value}
            onChange={onChange}
            placeholder="https://example.com/logo.png"
          />
        ),
      },

      ctaLabel: {
        type: "custom",

        label: "CTA Button Label",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="CTA Button Label"
            value={value}
            onChange={onChange}
            placeholder="e.g., Get Started"
          />
        ),
      },

      ctaLink: {
        type: "custom",

        label: "CTA Button URL",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="CTA Button URL"
            value={value}
            onChange={onChange}
            placeholder="/signup"
          />
        ),
      },

      ctaStyle: {
        type: "custom",

        label: "CTA Button Style",

        render: ({ value, onChange }) => (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#000000" }}>
              CTA Button Style
            </label>

            <select
              value={value || "primary"}
              onChange={(e) => onChange(e.target.value)}
              style={{
                border: "1px solid var(--p-color-border)",
                borderRadius: "var(--p-border-radius-100, 4px)",
                padding: "5px 8px",
                fontSize: 12,
                color: "var(--p-color-text)",
                background: "var(--p-color-bg-surface)",
              }}
            >
              <option value="primary">Solid</option>

              <option value="ghost">Ghost / Outline</option>

              <option value="none">None (hide)</option>
            </select>
          </div>
        ),
      },

      layoutStyle: {
        type: "custom",

        label: "Header Layout",

        render: ({ value, onChange }) => (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#000000" }}>
              Header Layout
            </label>

            <select
              value={value || "default"}
              onChange={(e) => onChange(e.target.value)}
              style={{
                border: "1px solid var(--p-color-border)",
                borderRadius: "var(--p-border-radius-100, 4px)",
                padding: "5px 8px",
                fontSize: 12,
                color: "var(--p-color-text)",
                background: "var(--p-color-bg-surface)",
              }}
            >
              <option value="default">Default (Logo Left, Nav Right)</option>

              <option value="centered">Centered (Logo + Nav Centred)</option>

              <option value="split">Split (Logo | Nav Centre | CTA)</option>

              <option value="minimal">Minimal (Logo Only)</option>
            </select>
          </div>
        ),
      },
    },

    defaultProps: {
      height: "64px",

      backgroundColor: "#0158ad",

      textColor: "#FFFFFF",

      siteTitle: "My Page Builder",

      showShadow: true,

      showNavigation: true,

      logo: "",

      ctaLabel: "",

      ctaLink: "#",

      ctaStyle: "primary",

      layoutStyle: "default",

      navigationLinks: [
        { id: "1", label: "Home", url: "/", isActive: false },

        { id: "2", label: "Pages", url: "/admin/pages", isActive: false },

        { id: "3", label: "Admin", url: "/admin", isActive: false },
      ],
    },

    render: ({
      height,

      backgroundColor,

      backgroundImage,

      textColor,

      siteTitle,

      showShadow,

      showNavigation,

      navigationLinks,

      logo,

      ctaLabel,

      ctaLink,

      ctaStyle,

      layoutStyle,
    }: any) => {
      const hasCta = ctaLabel && ctaStyle !== "none";

      const isCenter = layoutStyle === "centered";

      const isSplit = layoutStyle === "split";

      const isMinimal = layoutStyle === "minimal";

      const headerStyle: any = {
        backgroundColor,

        color: textColor,

        height,

        fontFamily: "var(--font-family)",

        boxShadow: showShadow ? "0 2px 8px rgba(0,0,0,0.12)" : "none",

        transition:
          "background-color var(--animation-speed,0.3s) ease, color var(--animation-speed,0.3s) ease",

        ...(backgroundImage
          ? {
              backgroundImage,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {}),
      };

      const brandEl = (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
            textDecoration: "none",
          }}
        >
          {logo ? (
            <img
              src={logo}
              alt={siteTitle || "Logo"}
              style={{ height: 36, maxWidth: 160, objectFit: "contain" }}
            />
          ) : (
            <span
              style={{
                color: textColor,
                fontFamily: "var(--heading-font, var(--font-family))",
                fontSize: "var(--h3-size, 1.25rem)",
                fontWeight: "var(--heading-weight, 700)",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
              }}
            >
              {siteTitle}
            </span>
          )}
        </div>
      );

      const navItems =
        showNavigation && !isMinimal
          ? navigationLinks.map((link: any) => (
              <a
                key={link.id}
                href={link.url}
                style={{
                  color: textColor,
                  fontFamily: "var(--font-family)",
                  fontSize: "var(--base-font-size, 0.875rem)",
                  opacity: 0.9,
                  padding: "6px 12px",
                  borderRadius: "var(--border-radius, 6px)",
                  textDecoration: "none",
                  transition: "opacity var(--animation-speed,0.3s) ease",
                  whiteSpace: "nowrap",
                }}
              >
                {link.label}
              </a>
            ))
          : null;

      const ctaBtnEl = hasCta ? (
        <a
          href={ctaLink || "#"}
          style={{
            padding: "8px 20px",
            borderRadius: "var(--border-radius, 6px)",
            fontWeight: 600,
            fontSize: "var(--base-font-size, 0.875rem)",
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
            transition: "all var(--animation-speed,0.3s) ease",
            ...(ctaStyle === "ghost"
              ? {
                  background: "transparent",
                  color: textColor,
                  border: `2px solid ${textColor}`,
                }
              : {
                  background: textColor,
                  color: backgroundColor,
                  border: `2px solid ${textColor}`,
                }),
          }}
        >
          {ctaLabel}
        </a>
      ) : null;

      return (
        <header style={headerStyle} className="w-full">
          {isCenter ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 8,
                padding: "0 24px",
              }}
            >
              {brandEl}

              {(showNavigation || hasCta) && (
                <nav
                  className="pb-header-nav"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {navItems}

                  {ctaBtnEl}
                </nav>
              )}
            </div>
          ) : isSplit ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: "100%",
                padding: "0 24px",
                maxWidth: 1280,
                margin: "0 auto",
                gap: 16,
              }}
            >
              {brandEl}

              <nav
                className="pb-header-nav"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  flex: 1,
                }}
              >
                {navItems}
              </nav>

              {ctaBtnEl}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: "100%",
                padding: "0 24px",
                maxWidth: 1280,
                margin: "0 auto",
              }}
            >
              {brandEl}

              {!isMinimal && (
                <nav
                  className="pb-header-nav"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    flexWrap: "wrap",
                  }}
                >
                  {navItems}

                  {ctaBtnEl}
                </nav>
              )}
            </div>
          )}
        </header>
      );
    },
  },

  GlobalFooter: {
    label: "Footer",
    fields: {
      height: {
        type: "custom",

        label: "Height (e.g., 300px)",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Height"
            value={value}
            onChange={onChange}
            placeholder="e.g., 300px"
          />
        ),
      },

      backgroundColor: {
        type: "custom",

        label: "Background Color",

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Background Color"
            value={value}
            onChange={onChange}
          />
        ),
      },

      textColor: {
        type: "custom",

        label: "Text Color",

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Text Color"
            value={value}
            onChange={onChange}
          />
        ),
      },

      companyName: {
        type: "custom",

        label: "Company Name",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Company Name"
            value={value}
            onChange={onChange}
            placeholder="My Page Builder"
          />
        ),
      },

      companyDescription: {
        type: "custom",

        label: "Company Description",

        render: ({ value, onChange }) => (
          <StackedTextareaField
            label="Company Description"
            value={value}
            onChange={onChange}
            placeholder="Build beautiful pages without coding"
          />
        ),
      },

      logo: {
        type: "custom",

        label: "Logo Image URL",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Logo Image URL"
            value={value}
            onChange={onChange}
            placeholder="https://example.com/logo.png"
          />
        ),
      },

      showSocialLinks: {
        type: "custom",

        label: "Show Social Links",

        render: ({ value, onChange }) => (
          <ToggleField
            value={!!value}
            onChange={onChange}
            label="Show Social Links"
          />
        ),
      },

      socialLinks: {
        type: "object",

        label: "Social Links",

        objectFields: {
          facebook: {
            type: "custom",
            label: "Facebook URL",
            render: ({ value, onChange }) => (
              <LinkUrlField label="Facebook URL" value={value} onChange={onChange} />
            ),
          },

          twitter: {
            type: "custom",
            label: "Twitter / X URL",
            render: ({ value, onChange }) => (
              <LinkUrlField label="Twitter/X URL" value={value} onChange={onChange} />
            ),
          },

          instagram: {
            type: "custom",
            label: "Instagram URL",
            render: ({ value, onChange }) => (
              <LinkUrlField label="Instagram URL" value={value} onChange={onChange} />
            ),
          },

          linkedin: {
            type: "custom",
            label: "LinkedIn URL",
            render: ({ value, onChange }) => (
              <LinkUrlField label="LinkedIn URL" value={value} onChange={onChange} />
            ),
          },

          github: {
            type: "custom",
            label: "GitHub URL",
            render: ({ value, onChange }) => (
              <LinkUrlField label="GitHub URL" value={value} onChange={onChange} />
            ),
          },

          youtube: {
            type: "custom",
            label: "YouTube URL",
            render: ({ value, onChange }) => (
              <LinkUrlField label="YouTube URL" value={value} onChange={onChange} />
            ),
          },

          tiktok: {
            type: "custom",
            label: "TikTok URL",
            render: ({ value, onChange }) => (
              <LinkUrlField label="TikTok URL" value={value} onChange={onChange} />
            ),
          },
        },
      },

      quickLinks: {
        type: "array",

        label: "Quick Links",

        getItemSummary: (item) => item.label || "Link",

        arrayFields: {
          label: {
            type: "custom",
            label: "Label",
            render: ({ value, onChange }) => (
              <StackedTextField
                label="Label"
                value={value}
                onChange={onChange}
                placeholder="e.g., Home"
              />
            ),
          },

          url: {
            type: "custom",
            label: "URL",
            render: ({ value, onChange }) => (
              <StackedTextField
                label="URL"
                value={value}
                onChange={onChange}
                placeholder="e.g., /home"
              />
            ),
          },
        },
      },

      copyrightText: {
        type: "custom",

        label: "Copyright Text",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Copyright Text"
            value={value}
            onChange={onChange}
            placeholder="© 2026 My Page Builder. All rights reserved."
          />
        ),
      },

      showNewsletter: {
        type: "custom",

        label: "Show Newsletter Signup",

        render: ({ value, onChange }) => (
          <ToggleField
            value={!!value}
            onChange={onChange}
            label="Show Newsletter Signup"
          />
        ),
      },

      newsletterTitle: {
        type: "custom",

        label: "Newsletter Title",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Newsletter Title"
            value={value}
            onChange={onChange}
            placeholder="Stay in the loop"
          />
        ),
      },

      newsletterPlaceholder: {
        type: "custom",

        label: "Email Input Placeholder",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Email Placeholder"
            value={value}
            onChange={onChange}
            placeholder="Your email address"
          />
        ),
      },
    },

    defaultProps: {
      height: "300px",

      backgroundColor: "#1F2937",

      textColor: "#F3F4F6",

      companyName: "My Page Builder",

      companyDescription: "Build beautiful pages without coding",

      logo: "",

      showSocialLinks: true,

      socialLinks: {
        facebook: "https://facebook.com",

        twitter: "https://twitter.com",

        instagram: "https://instagram.com",

        linkedin: "https://linkedin.com",

        github: "https://github.com",

        youtube: "",

        tiktok: "",
      },

      quickLinks: [
        { id: "1", label: "Home", url: "/", isActive: false },

        { id: "2", label: "Admin", url: "/admin", isActive: false },

        { id: "3", label: "Pages", url: "/admin/pages", isActive: false },
      ],

      copyrightText: "© 2026 My Page Builder. All rights reserved.",

      showNewsletter: false,

      newsletterTitle: "Stay in the loop",

      newsletterPlaceholder: "Your email address",
    },

    render: ({
      height,

      backgroundColor,

      textColor,

      companyName,

      companyDescription,

      logo,

      showSocialLinks,

      socialLinks,

      quickLinks,

      copyrightText,

      showNewsletter,

      newsletterTitle,

      newsletterPlaceholder,
    }: any) => {
      const socialEntries = Object.entries(socialLinks || {}).filter(
        ([, url]) => url,
      );

      // ── Social icon SVGs (keyed by platform name) ───────────────────────────

      const SocialIcon = ({ platform }: { platform: string }) => {
        const p = platform.toLowerCase();

        if (p === "facebook")
          return (
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          );

        if (p === "twitter")
          return (
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          );

        if (p === "instagram")
          return (
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          );

        if (p === "linkedin")
          return (
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          );

        if (p === "github")
          return (
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          );

        if (p === "youtube")
          return (
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
            </svg>
          );

        if (p === "tiktok")
          return (
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
            </svg>
          );

        return (
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            {platform[0].toUpperCase()}
          </span>
        );
      };

      return (
        <footer
          style={{
            backgroundColor,
            color: textColor,
            minHeight: height,
            fontFamily: "var(--font-family)",
            transition:
              "background-color var(--animation-speed,0.3s) ease, color var(--animation-speed,0.3s) ease",
          }}
          className="w-full mt-auto"
        >
          <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* ── Brand column ─────────────────────────────────────────── */}

              <div>
                {logo && (
                  <img
                    src={logo}
                    alt={companyName}
                    style={{
                      height: 40,
                      marginBottom: 16,
                      objectFit: "contain",
                      maxWidth: 180,
                    }}
                  />
                )}

                <h3
                  style={{
                    fontFamily: "var(--heading-font, var(--font-family))",
                    fontSize: "var(--h3-size, 1.125rem)",
                    fontWeight: "var(--heading-weight, 600)",
                    marginBottom: "0.75rem",
                    color: textColor,
                  }}
                >
                  {companyName}
                </h3>

                <p
                  style={{
                    fontSize: "var(--base-font-size, 0.875rem)",
                    lineHeight: "var(--line-height, 1.6)",
                    opacity: 0.8,
                    marginBottom:
                      showSocialLinks && socialEntries.length > 0
                        ? "1.25rem"
                        : 0,
                  }}
                >
                  {companyDescription}
                </p>

                {showSocialLinks && socialEntries.length > 0 && (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {socialEntries.map(([key, url]) => (
                      <a
                        key={key}
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={key}
                        style={{
                          color: textColor,
                          opacity: 0.8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          border: `1.5px solid ${textColor}40`,
                          textDecoration: "none",
                          transition: "opacity 0.2s, border-color 0.2s",
                          flexShrink: 0,
                        }}
                      >
                        <SocialIcon platform={key} />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Quick Links ───────────────────────────────────────────── */}

              <div>
                <h4
                  style={{
                    fontFamily: "var(--heading-font, var(--font-family))",
                    fontSize: "var(--h4-size, 1rem)",
                    fontWeight: "var(--heading-weight, 600)",
                    marginBottom: "1rem",
                    color: textColor,
                  }}
                >
                  Quick Links
                </h4>

                <ul
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    padding: 0,
                    margin: 0,
                    listStyle: "none",
                  }}
                >
                  {quickLinks.map((link: any) => (
                    <li key={link.id}>
                      <a
                        href={link.url}
                        style={{
                          color: textColor,
                          fontSize: "var(--base-font-size, 0.875rem)",
                          opacity: 0.8,
                          textDecoration: "none",
                          transition:
                            "opacity var(--animation-speed,0.3s) ease",
                          display: "inline-block",
                        }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── Newsletter / Connect ──────────────────────────────────── */}

              <div>
                {showNewsletter ? (
                  <>
                    <h4
                      style={{
                        fontFamily: "var(--heading-font, var(--font-family))",
                        fontSize: "var(--h4-size, 1rem)",
                        fontWeight: "var(--heading-weight, 600)",
                        marginBottom: "0.75rem",
                        color: textColor,
                      }}
                    >
                      {newsletterTitle || "Stay in the loop"}
                    </h4>

                    <p
                      style={{
                        fontSize: "var(--base-font-size, 0.875rem)",
                        opacity: 0.75,
                        marginBottom: "1rem",
                        lineHeight: 1.5,
                      }}
                    >
                      Get the latest updates delivered to your inbox.
                    </p>

                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="email"
                        placeholder={
                          newsletterPlaceholder || "Your email address"
                        }
                        style={{
                          flex: 1,
                          minWidth: 0,
                          padding: "9px 12px",
                          borderRadius: "var(--border-radius, 6px)",
                          border: `1.5px solid ${textColor}40`,
                          background: "transparent",
                          color: textColor,
                          fontSize: "0.875rem",
                          outline: "none",
                        }}
                      />

                      <button
                        type="button"
                        style={{
                          padding: "9px 16px",
                          background: textColor,
                          color: backgroundColor,
                          borderRadius: "var(--border-radius, 6px)",
                          border: "none",
                          fontWeight: 600,
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          flexShrink: 0,
                        }}
                      >
                        →
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h4
                      style={{
                        fontFamily: "var(--heading-font, var(--font-family))",
                        fontSize: "var(--h4-size, 1rem)",
                        fontWeight: "var(--heading-weight, 600)",
                        marginBottom: "1rem",
                        color: textColor,
                      }}
                    >
                      Connect
                    </h4>

                    {showSocialLinks && socialEntries.length > 0 ? (
                      <p
                        style={{
                          fontSize: "var(--base-font-size, 0.875rem)",
                          opacity: 0.75,
                          lineHeight: 1.5,
                        }}
                      >
                        Follow us on social media for the latest updates and
                        behind-the-scenes content.
                      </p>
                    ) : (
                      <p
                        style={{
                          fontSize: "var(--base-font-size, 0.875rem)",
                          opacity: 0.65,
                        }}
                      >
                        No social links configured.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* ── Divider + copyright ──────────────────────────────────────── */}

            <div
              style={{
                height: 1,
                background: `${textColor}25`,
                margin: "32px 0 20px",
              }}
            />

            <div
              style={{
                textAlign: "center",
                fontSize: "var(--base-font-size, 0.875rem)",
                opacity: 0.6,
              }}
            >
              <p>{copyrightText}</p>
            </div>
          </div>
        </footer>
      );
    },
  },

  MarqueeBar: {
    label: "Info Bar",
    fields: {
      _tabs: {
        type: "custom",
        label: "",
        render: ({ value: _v, onChange: _onChange }: any) => {
          const { selectedItem, appState, dispatch } = usePuck();
          const props = selectedItem?.props ?? {};
          const set = (key: string, val: any) => {
            if (!selectedItem) return;
            const state = appState.data;
            let destinationZone = "root:default-zone", destinationIndex = 0;
            const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
            for (const [zone, items] of Object.entries(zones)) {
              const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
              if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
            }
            dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
          };
          return (
            <BlockTabBar blockKey="MarqueeBar">
              {(tab) => (
                <>
                  {tab === "content" && (
                    <>
                      <TabSection title="Text" />
                      <StackedTextField label="Announcement Text" value={props.text ?? ""} onChange={(v) => set("text", v)} placeholder="Free Shipping · Sale Now On ·" />
                      <SliderNumberField label="Repeat Count" value={props.repeat ?? 10} onChange={(v) => set("repeat", v)} min={1} max={30} step={1} unit="" />
                      <TabSection title="Scroll" />
                      <AlignField
                        label="Direction"
                        value={props.direction ?? "left"}
                        onChange={(v) => set("direction", v)}
                        options={[
                          { value: "left",  icon: <ArrowLeft  size={15} />, title: "Left"  },
                          { value: "right", icon: <ArrowRight size={15} />, title: "Right" },
                        ]}
                      />
                      <SliderNumberField label="Speed (s)" value={props.speed ?? 20} onChange={(v) => set("speed", v)} min={2} max={120} step={1} unit="S" />
                      <ToggleField label="Pause on Hover" value={props.pauseOnHover !== false} onChange={(v) => set("pauseOnHover", v)} />
                    </>
                  )}
                  {tab === "style" && (
                    <>
                      <TabSection title="Colors" />
                      <ColorPickerField label="Background Color" value={props.backgroundColor ?? "#000000"} onChange={(v) => set("backgroundColor", v)} />
                      <ColorPickerField label="Text Color" value={props.textColor ?? "#ffffff"} onChange={(v) => set("textColor", v)} />
                      <TabSection title="Typography" />
                      <SliderNumberField label="Font Size (px)" value={props.fontSize ?? 14} onChange={(v) => set("fontSize", v)} min={10} max={36} step={1} unit="PX" />
                      <InlineSelect
                        label="Font Weight"
                        value={String(props.fontWeight ?? "500")}
                        onChange={(v) => set("fontWeight", v)}
                        options={[
                          { value: "400", label: "Normal" },
                          { value: "500", label: "Medium" },
                          { value: "600", label: "Semi Bold" },
                          { value: "700", label: "Bold" },
                        ]}
                      />
                      <InlineSelect
                        label="Text Transform"
                        value={props.textTransform ?? "uppercase"}
                        onChange={(v) => set("textTransform", v)}
                        options={[
                          { value: "uppercase",  label: "Uppercase"  },
                          { value: "capitalize", label: "Capitalize" },
                          { value: "lowercase",  label: "Lowercase"  },
                        ]}
                      />
                      <TabSection title="Spacing" />
                      <SliderNumberField label="Padding (px)" value={props.padding ?? 10} onChange={(v) => set("padding", v)} min={0} max={60} step={2} unit="PX" />
                      <SliderNumberField label="Item Gap (px)" value={props.itemGap ?? 40} onChange={(v) => set("itemGap", v)} min={8} max={200} step={4} unit="PX" />
                    </>
                  )}
                  {tab === "advanced" && (
                    <>
                      <TabSection title="Responsive" />
                      <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                      <ToggleField label="Hide on Tablet"  value={!!props.hideTablet}  onChange={(v) => set("hideTablet", v)} />
                      <ToggleField label="Hide on Mobile"  value={!!props.hideMobile}  onChange={(v) => set("hideMobile", v)} />
                    </>
                  )}
                </>
              )}
            </BlockTabBar>
          );
        },
      },
    },

    defaultProps: {
      text: "🔥 Free Shipping on All Orders | 30 Days Return | COD Available 🔥",
      speed: 20,
      direction: "left",
      pauseOnHover: true,
      backgroundColor: "#000000",
      textColor: "#ffffff",
      fontSize: 14,
      fontWeight: "500",
      textTransform: "uppercase",
      padding: 10,
      itemGap: 40,
      repeat: 10,
      hideDesktop: false,
      hideTablet: false,
      hideMobile: false,
    },

    render: ({ text, speed, direction, pauseOnHover, backgroundColor, textColor, fontSize, fontWeight, textTransform, padding, itemGap, repeat, hideDesktop, hideTablet, hideMobile }: any) => {
      const [hovered, setHovered] = useState(false);
      const animationName = direction === "right" ? "mqRight" : "mqLeft";
      const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
      const repeatedText = Array.from({ length: repeat ?? 10 }).map((_, i) => (
        <span key={i} style={{ marginRight: itemGap ?? 40 }}>{text}</span>
      ));
      return (
        <div
          onMouseEnter={() => pauseOnHover && setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ width: "100%", overflow: "hidden", whiteSpace: "nowrap", backgroundColor, color: textColor, fontSize, fontWeight, textTransform: textTransform as any, padding: `${padding ?? 10}px 0`, boxSizing: "border-box" }}
        >
          <div style={{ display: "inline-block", animation: `${animationName} ${speed}s linear infinite`, animationPlayState: pauseOnHover && hovered ? "paused" : "running" }}>
            {repeatedText}
          </div>
          <style>{`
            @keyframes mqLeft  { 0% { transform:translateX(0) }  100% { transform:translateX(-50%) } }
            @keyframes mqRight { 0% { transform:translateX(-50%) } 100% { transform:translateX(0) } }
          `}</style>
        </div>
      );
    },
  },

  HeadingBlock: {
    label: "Heading",
    fields: {
      _tabs: {
        type: "custom",
        label: "",
        render: ({ value: _v, onChange: _onChange }: any) => {
          // Read all current props and dispatch via usePuck
          const { selectedItem, appState, dispatch } = usePuck();
          const props = selectedItem?.props ?? {};

          // Helper: merge one prop into the current item and replace it in the store
          const set = (key: string, val: any) => {
            if (!selectedItem) return;
            const state = appState.data;
            // Find index + zone for the selected item
            // Root content lives under the compound key "root:default-zone"
            let destinationZone = "root:default-zone";
            let destinationIndex = 0;
            const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
            for (const [zone, items] of Object.entries(zones)) {
              const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
              if (idx !== -1) {
                destinationZone = zone;
                destinationIndex = idx;
                break;
              }
            }
            dispatch({
              type: "replace",
              destinationZone,
              destinationIndex,
              data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } },
            });
          };

          const dividerActive = (props.dividerType ?? "none") !== "none";
          const bgType = props.advBgType ?? "none";

          return (
            <BlockTabBar blockKey="HeadingBlock">
              {(tab) => (
                <>
                  {/* ── CONTENT TAB ── */}
                  {tab === "content" && (
                    <>
                      <StackedTextareaField
                        label="Title"
                        value={props.title ?? ""}
                        onChange={(v) => set("title", v)}
                        placeholder="Enter heading..."
                        rows={3}
                      />
                      <InlineSelect
                        label="HTML Tag"
                        value={String(props.level ?? "1")}
                        onChange={(v) => set("level", v === "custom" ? "custom" : Number(v))}
                        options={[
                          { value: "1", label: "H1" }, { value: "2", label: "H2" },
                          { value: "3", label: "H3" }, { value: "4", label: "H4" },
                          { value: "5", label: "H5" }, { value: "6", label: "H6" },
                          { value: "custom", label: "Custom" },
                        ]}
                      />
                      {props.level === "custom" && (
                        <SliderNumberField label="Font Size (px)" value={props.fontSize ?? 32} onChange={(v) => set("fontSize", v)} min={8} max={200} step={1} unit="px" />
                      )}
                      <LinkUrlField value={props.linkUrl ?? ""} onChange={(v) => set("linkUrl", v)} />
                      <StackedTextField
                        label="Subtitle"
                        value={props.subtitle ?? ""}
                        onChange={(v) => set("subtitle", v)}
                        placeholder="Optional subtitle..."
                      />
                    </>
                  )}

                  {/* ── STYLE TAB ── */}
                  {tab === "style" && (
                    <>
                      <TabSection title="Typography" />
                      <InlineSelect
                        label="Font Family"
                        value={props.fontFamily ?? "inherit"}
                        onChange={(v) => { set("fontFamily", v); loadGoogleFont(v); }}
                        options={[
                          { value: "inherit",                       label: "Theme Default" },
                          { value: "Arial, Helvetica, sans-serif",   label: "Arial" },
                          { value: "Georgia, serif",                 label: "Georgia" },
                          { value: "'Courier New', monospace",       label: "Courier New" },
                          { value: "Impact, sans-serif",             label: "Impact" },
                          { value: "Inter, sans-serif",              label: "Inter" },
                          { value: "Poppins, sans-serif",            label: "Poppins" },
                          { value: "'Roboto Serif', serif",          label: "Roboto Serif" },
                          { value: "'New York', 'New York Small', 'Times New Roman', serif", label: "New York" },
                          { value: "'Open Sans', sans-serif",        label: "Open Sans" },
                        ]}
                      />
                      <InlineSelect
                        label="Font Weight"
                        value={String(props.fontWeight ?? "700")}
                        onChange={(v) => set("fontWeight", v)}
                        options={[
                          { value: "400", label: "Normal" },
                          { value: "600", label: "Semi Bold" },
                          { value: "900", label: "Bold" },
                        ]}
                      />
                      <InlineSelect
                        label="Font Style"
                        value={props.fontStyle ?? "normal"}
                        onChange={(v) => set("fontStyle", v)}
                        options={[
                          { value: "normal", label: "Normal" },
                          { value: "italic", label: "Italic" },
                        ]}
                      />
                      <InlineSelect
                        label="Text Transform"
                        value={props.textTransform ?? "capitalize"}
                        onChange={(v) => set("textTransform", v)}
                        options={[
                          { value: "capitalize", label: "Capitalize" },
                          { value: "uppercase", label: "Uppercase" },
                          { value: "lowercase", label: "Lowercase" },
                        ]}
                      />
                      <InlineSelect
                        label="Text Decoration"
                        value={props.textDecoration ?? "none"}
                        onChange={(v) => set("textDecoration", v)}
                        options={[
                          { value: "none", label: "None" },
                          { value: "underline", label: "Underline" },
                          { value: "line-through", label: "Line Through" },
                        ]}
                      />
                      <SliderNumberField label="Line Height" value={props.lineHeight ?? 1.4} onChange={(v) => set("lineHeight", v)} min={0.5} max={5} step={0.05} unit="" />
                      <SliderNumberField label="Letter Spacing (px)" value={props.letterSpacing ?? 0} onChange={(v) => set("letterSpacing", v)} min={-10} max={50} step={0.5} unit="px" />

                      <TabSection title="Color" />
                      <ColorPickerField
                        label="Text Color"
                        value={props.textColor ?? ""}
                        onChange={(v) => set("textColor", v)}
                      />
                      <ColorPickerField
                        label="Hover Color"
                        value={props.hoverColor ?? ""}
                        onChange={(v) => set("hoverColor", v)}
                      />
                      <ColorPickerField
                        label="Subtitle Color"
                        value={props.subtitleColor ?? ""}
                        onChange={(v) => set("subtitleColor", v)}
                      />
                      <SliderNumberField label="Subtitle Size (px)" value={props.subtitleSize ?? 18} onChange={(v) => set("subtitleSize", v)} min={10} max={64} step={1} unit="px" />


                      <TabSection title="Alignment" />
                      <AlignField
                        label="Text Align"
                        value={props.alignment ?? "left"}
                        onChange={(v) => set("alignment", v)}
                        options={[
                          { value: "left",    icon: <AlignLeft    size={15} />, title: "Left"    },
                          { value: "center",  icon: <AlignCenter  size={15} />, title: "Center"  },
                          { value: "right",   icon: <AlignRight   size={15} />, title: "Right"   },
                          { value: "justify", icon: <AlignJustify size={15} />, title: "Justify" },
                        ]}
                      />

                      <TabSection title="Divider" />
                      <InlineSelect
                        label="Divider Style"
                        value={props.dividerType ?? "none"}
                        onChange={(v) => set("dividerType", v)}
                        options={[
                          { value: "none", label: "None" },
                          { value: "line", label: "Line" },
                          { value: "double-line", label: "Double Line" },
                          { value: "line-with-icon", label: "Line with Icon" },
                        ]}
                      />
                      {dividerActive && (
                        <>
                          <ColorPickerField
                            label="Divider Color"
                            value={props.dividerColor ?? ""}
                            onChange={(v) => set("dividerColor", v)}
                          />
                          <SliderNumberField label="Divider Length (px)" value={props.dividerLength ?? 60} onChange={(v) => set("dividerLength", v)} min={20} max={300} step={5} unit="px" />
                          {props.dividerType !== "line-with-icon" && (
                            <SliderNumberField label="Divider Thickness (px)" value={props.dividerThickness ?? 3} onChange={(v) => set("dividerThickness", v)} min={1} max={50} step={1} unit="px" />
                          )}
                          <AlignField
                            label="Divider Alignment"
                            value={props.dividerAlignment ?? "center"}
                            onChange={(v) => set("dividerAlignment", v)}
                            options={[
                              { value: "left",   icon: <AlignLeft   size={15} />, title: "Left"   },
                              { value: "center", icon: <AlignCenter size={15} />, title: "Center" },
                              { value: "right",  icon: <AlignRight  size={15} />, title: "Right"  },
                            ]}
                          />
                          {props.dividerType === "line-with-icon" && (
                            <StackedTextField
                              label="Icon or Emoji"
                              value={props.dividerIcon ?? "⭐"}
                              onChange={(v) => set("dividerIcon", v)}
                              placeholder="e.g., ⭐ or 🌟"
                            />
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* ── ADVANCED TAB ── */}
                  {tab === "advanced" && (
                    <>
                      <TabSection title="Spacing" />
                      <FourSideField
                        label="Margin (px)"
                        value={props.advMargin}
                        onChange={(v) => set("advMargin", v)}
                      />
                      <FourSideField
                        label="Padding (px)"
                        value={props.advPadding ?? { top: props.padding ?? 32, right: 0, bottom: props.padding ?? 32, left: 0 }}
                        onChange={(v) => set("advPadding", v)}
                      />

                      <TabSection title="Background" />
                      <InlineSelect
                        label="Type"
                        value={bgType}
                        onChange={(v) => set("advBgType", v)}
                        options={[
                          { value: "none", label: "None" },
                          { value: "color", label: "Color" },
                          { value: "gradient", label: "Gradient" },
                        ]}
                      />
                      {bgType === "color" && (
                        <ColorPickerField
                          label="Color"
                          value={props.backgroundColor ?? ""}
                          onChange={(v) => set("backgroundColor", v)}
                        />
                      )}
                      {bgType === "gradient" && (
                        <>
                          <ColorPickerField
                            label="Color 1"
                            value={props.advGradientColor1 ?? ""}
                            onChange={(v) => set("advGradientColor1", v)}
                          />
                          <ColorPickerField
                            label="Color 2"
                            value={props.advGradientColor2 ?? ""}
                            onChange={(v) => set("advGradientColor2", v)}
                          />
                          <SliderNumberField label="Angle (deg)" value={props.advGradientAngle ?? 135} onChange={(v) => set("advGradientAngle", v)} min={0} max={360} step={15} unit="°" />
                        </>
                      )}

                      <TabSection title="Border" />
                      <InlineSelect
                        label="Border Style"
                        value={props.advBorderStyle ?? "none"}
                        onChange={(v) => set("advBorderStyle", v)}
                        options={[
                          { value: "none", label: "None" },
                          { value: "solid", label: "Solid" },
                          { value: "dashed", label: "Dashed" },
                          { value: "dotted", label: "Dotted" },
                          { value: "double", label: "Double" },
                        ]}
                      />
                      {props.advBorderStyle && props.advBorderStyle !== "none" && (
                        <>
                          <FourSideField
                            label="Border Width (px)"
                            value={props.advBorderWidth}
                            onChange={(v) => set("advBorderWidth", v)}
                          />
                          <ColorPickerField
                            label="Border Color"
                            value={props.advBorderColor ?? ""}
                            onChange={(v) => set("advBorderColor", v)}
                          />
                        </>
                      )}
                      <FourSideField
                        label="Border Radius (px)"
                        value={props.advBorderRadius}
                        onChange={(v) => set("advBorderRadius", v)}
                      />


                      <TabSection title="Responsive" />
                      <ToggleField
                        label="Hide on Desktop"
                        value={!!props.hideDesktop}
                        onChange={(v) => set("hideDesktop", v)}
                      />
                      <ToggleField
                        label="Hide on Tablet"
                        value={!!props.hideTablet}
                        onChange={(v) => set("hideTablet", v)}
                      />
                      <ToggleField
                        label="Hide on Mobile"
                        value={!!props.hideMobile}
                        onChange={(v) => set("hideMobile", v)}
                      />

                      <SliderNumberField label="Opacity (%)" value={props.opacity ?? 100} onChange={(v) => set("opacity", v)} min={0} max={100} step={1}
                      />
                    </>
                  )}
                </>
              )}
            </BlockTabBar>
          );
        },
      },
    },

    defaultProps: {
      // Content
      title: "Heading",
      subtitle: "",
      level: 1,
      linkUrl: "",
      linkTarget: "_blank",
      // Style – typography
      fontFamily: "inherit",
      fontSize: null,
      fontWeight: "700",
      fontStyle: "normal",
      textTransform: "capitalize",
      textDecoration: "none",
      lineHeight: null,
      letterSpacing: null,
      // Style – color
      textColor: "",
      hoverColor: "",
      subtitleColor: "",
      subtitleSize: 18,
      // Style – text shadow
      // Style – alignment & divider
      alignment: "left",
      dividerType: "none",
      dividerColor: "",
      dividerLength: 60,
      dividerThickness: 3,
      dividerAlignment: "center",
      dividerIcon: "⭐",
      // Advanced – spacing
      advMargin: { top: 0, right: 0, bottom: 0, left: 0 },
      advPadding: { top: 32, right: 0, bottom: 32, left: 0 },
      // Advanced – background
      advBgType: "none",
      backgroundColor: "",
      advGradientColor1: "",
      advGradientColor2: "",
      advGradientAngle: 135,
      advBgImage: "",
      // Advanced – border
      advBorderStyle: "none",
      advBorderWidth: { top: 0, right: 0, bottom: 0, left: 0 },
      advBorderColor: "",
      advBorderRadius: { top: 0, right: 0, bottom: 0, left: 0 },
      // Advanced – shadow
      // Advanced – responsive
      hideDesktop: false,
      hideTablet: false,
      hideMobile: false,
      // Advanced – custom
      cssId: "",
      cssClass: "",
      customCss: "",
      zIndex: null,
      opacity: 100,
    },

    render: ({
      title,
      subtitle,
      subtitleColor,
      subtitleSize,
      level,
      alignment,
      textColor,
      backgroundColor,
      linkUrl,
      linkTarget,
      fontFamily,
      fontSize,
      fontWeight,
      fontStyle,
      textTransform,
      textDecoration,
      lineHeight,
      letterSpacing,
      hoverColor: _hoverColor,
      dividerType,
      dividerColor,
      dividerLength,
      dividerThickness,
      dividerAlignment,
      dividerIcon,
      advMargin,
      advPadding,
      advBgType,
      advGradientColor1,
      advGradientColor2,
      advGradientAngle,
      advBgImage,
      advBorderStyle,
      advBorderWidth,
      advBorderColor,
      advBorderRadius,
      hideDesktop,
      hideTablet,
      hideMobile,
      cssId,
      cssClass,
      customCss,
      zIndex,
      opacity,
    }) => {
      const Tag = (level === "custom" ? "p" : `h${level || 1}`) as keyof JSX.IntrinsicElements;

      // Background
      const bgStyle: React.CSSProperties = (() => {
        if (advBgType === "color")
          return { backgroundColor: backgroundColor || "transparent" };
        if (advBgType === "gradient" && advGradientColor1 && advGradientColor2)
          return { background: `linear-gradient(${advGradientAngle ?? 135}deg, ${advGradientColor1}, ${advGradientColor2})` };
        if (advBgType === "image" && advBgImage)
          return { backgroundImage: `url(${advBgImage})`, backgroundSize: "cover", backgroundPosition: "center" };
        return {};
      })();

      // Border
      const borderStyle: React.CSSProperties = advBorderStyle && advBorderStyle !== "none"
        ? {
            borderStyle: advBorderStyle,
            borderTopWidth:    advBorderWidth?.top    ?? 0,
            borderRightWidth:  advBorderWidth?.right  ?? 0,
            borderBottomWidth: advBorderWidth?.bottom ?? 0,
            borderLeftWidth:   advBorderWidth?.left   ?? 0,
            borderColor: advBorderColor || "currentColor",
          }
        : {};

      // Border radius
      const radiusStyle: React.CSSProperties = {
        borderTopLeftRadius:     advBorderRadius?.top    ?? 0,
        borderTopRightRadius:    advBorderRadius?.right  ?? 0,
        borderBottomRightRadius: advBorderRadius?.bottom ?? 0,
        borderBottomLeftRadius:  advBorderRadius?.left   ?? 0,
      };


      // Responsive hide classes
      const hideClasses = [
        hideDesktop ? "puck-hide-desktop" : "",
        hideTablet  ? "puck-hide-tablet"  : "",
        hideMobile  ? "puck-hide-mobile"  : "",
      ].filter(Boolean).join(" ");

      const defaultFontSize =
        level === "custom" ? (fontSize ? `${fontSize}px` : "1rem")
        : level === 1 ? "var(--h1-size, 2.5rem)"
        : level === 2 ? "var(--h2-size, 2rem)"
        : level === 3 ? "var(--h3-size, 1.75rem)"
        : level === 4 ? "var(--h4-size, 1.5rem)"
        : level === 5 ? "var(--h5-size, 1.25rem)"
        : "var(--h6-size, 1rem)";

      const wrapperStyle: React.CSSProperties = {
        paddingTop:    advPadding?.top    ?? 32,
        paddingRight:  advPadding?.right  ?? 0,
        paddingBottom: advPadding?.bottom ?? 32,
        paddingLeft:   advPadding?.left   ?? 0,
        marginTop:    advMargin?.top    ?? 0,
        marginRight:  advMargin?.right  ?? 0,
        marginBottom: advMargin?.bottom ?? 0,
        marginLeft:   advMargin?.left   ?? 0,
        textAlign: alignment as any,
        zIndex: zIndex ?? undefined,
        opacity: opacity != null ? opacity / 100 : 1,
        ...bgStyle,
        ...borderStyle,
        ...radiusStyle,
      };

      const headingEl = (
        <Tag
          style={{
            fontSize: level === "custom" ? (fontSize ? `${fontSize}px` : "1rem") : defaultFontSize,
            fontWeight: fontWeight ?? "700",
            fontFamily: fontFamily && fontFamily !== "inherit" ? fontFamily : "var(--heading-font)",
            fontStyle: fontStyle ?? "normal",
            textTransform: (textTransform ?? "capitalize") as any,
            textDecoration: textDecoration ?? "none",
            lineHeight: lineHeight ?? "var(--heading-line-height, 1.2)",
            letterSpacing: letterSpacing != null ? `${letterSpacing}px` : undefined,
            color: textColor || "var(--primary-color)",
            margin: 0,
          }}
        >
          {title}
        </Tag>
      );

      return (
        <div
          id={cssId || undefined}
          className={[cssClass].filter(Boolean).join(" ") || undefined}
          style={wrapperStyle}
        >
          {customCss && <style>{`#${cssId || "heading-block"} { ${customCss} }`}</style>}
          {linkUrl
            ? <a href={linkUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>{headingEl}</a>
            : headingEl
          }

          {subtitle && (
            <p style={{
              fontSize: subtitleSize ? `${subtitleSize}px` : "var(--base-font-size, 1rem)",
              color: subtitleColor || "var(--text-color)",
              marginTop: 8,
            }}>
              {subtitle}
            </p>
          )}

          {dividerType && dividerType !== "none" && (
            <div style={{ marginTop: 16 }}>
              {dividerType === "line" && (
                <div style={{
                  width: dividerLength || 60,
                  height: 0,
                  borderTop: `${dividerThickness || 3}px solid ${dividerColor || textColor || "var(--primary-color)"}`,
                  borderRadius: 2,
                  marginLeft: dividerAlignment === "center" ? "auto" : dividerAlignment === "right" ? "auto" : 0,
                  marginRight: dividerAlignment === "center" ? "auto" : dividerAlignment === "right" ? 0 : "auto",
                  boxSizing: "content-box",
                }} />
              )}
              {dividerType === "double-line" && (
                <div style={{
                  display: "flex", flexDirection: "column", gap: 6,
                  width: dividerLength || 60,
                  marginLeft: dividerAlignment === "center" ? "auto" : dividerAlignment === "right" ? "auto" : 0,
                  marginRight: dividerAlignment === "center" ? "auto" : dividerAlignment === "right" ? 0 : "auto",
                }}>
                  <div style={{ height: 0, borderTop: `${dividerThickness || 2}px solid ${dividerColor || textColor || "var(--primary-color)"}`, boxSizing: "content-box" }} />
                  <div style={{ height: 0, borderTop: `${dividerThickness || 2}px solid ${dividerColor || textColor || "var(--primary-color)"}`, boxSizing: "content-box" }} />
                </div>
              )}
              {dividerType === "line-with-icon" && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  justifyContent: dividerAlignment === "right" ? "flex-end" : dividerAlignment === "center" ? "center" : "flex-start",
                }}>
                  <div style={{ flex: 1, height: 0, borderTop: `${dividerThickness || 3}px solid ${dividerColor || textColor || "var(--primary-color)"}`, maxWidth: dividerLength ? dividerLength / 4 : 30, boxSizing: "content-box" }} />
                  <span style={{ fontSize: "1.5rem", whiteSpace: "nowrap", flexShrink: 0 }}>{dividerIcon || "⭐"}</span>
                  <div style={{ flex: 1, height: 0, borderTop: `${dividerThickness || 3}px solid ${dividerColor || textColor || "var(--primary-color)"}`, maxWidth: dividerLength ? dividerLength / 4 : 30, boxSizing: "content-box" }} />
                </div>
              )}
            </div>
          )}
        </div>
      );
    },
  },

  Text: {
    label: "Text Editor",
    fields: {
      _tabs: {
        type: "custom",
        label: "",
        render: ({ value: _v, onChange: _onChange }: any) => {
          const { selectedItem, appState, dispatch } = usePuck();
          const props = selectedItem?.props ?? {};
          const set = (key: string, val: any) => {
            if (!selectedItem) return;
            const state = appState.data;
            let destinationZone = "root:default-zone";
            let destinationIndex = 0;
            const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
            for (const [zone, items] of Object.entries(zones)) {
              const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
              if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
            }
            dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
          };

          const bgType = props.advBgType ?? "none";

          return (
            <BlockTabBar blockKey="Text">
              {(tab) => (
                <>
                  {/* ── CONTENT TAB ── */}
                  {tab === "content" && (
                    <>
                      <StackedTextareaField
                        label="Content"
                        value={props.title ?? ""}
                        onChange={(v) => set("title", v)}
                        placeholder="Enter text..."
                        rows={5}
                      />
                    </>
                  )}

                  {/* ── STYLE TAB ── */}
                  {tab === "style" && (
                    <>
                      <TabSection title="Typography" />
                      <InlineSelect
                        label="Font Family"
                        value={props.fontFamily ?? "inherit"}
                        onChange={(v) => { set("fontFamily", v); loadGoogleFont(v); }}
                        options={[
                          { value: "inherit",                       label: "Theme Default" },
                          { value: "Arial, Helvetica, sans-serif",   label: "Arial" },
                          { value: "Georgia, serif",                 label: "Georgia" },
                          { value: "'Courier New', monospace",       label: "Courier New" },
                          { value: "Impact, sans-serif",             label: "Impact" },
                          { value: "Inter, sans-serif",              label: "Inter" },
                          { value: "Poppins, sans-serif",            label: "Poppins" },
                          { value: "'Roboto Serif', serif",          label: "Roboto Serif" },
                          { value: "'New York', 'New York Small', 'Times New Roman', serif", label: "New York" },
                          { value: "'Open Sans', sans-serif",        label: "Open Sans" },
                        ]}
                      />
                      <SliderNumberField label="Font Size (px)" value={props.fontSize ?? 16} onChange={(v) => set("fontSize", v)} min={8} max={120} step={1} unit="px" />
                      <InlineSelect
                        label="Font Weight"
                        value={String(props.fontWeight ?? "400")}
                        onChange={(v) => set("fontWeight", v)}
                        options={[
                          { value: "400", label: "Normal" },
                          { value: "600", label: "Semi Bold" },
                          { value: "900", label: "Bold" },
                        ]}
                      />
                      <InlineSelect
                        label="Font Style"
                        value={props.fontStyle ?? "normal"}
                        onChange={(v) => set("fontStyle", v)}
                        options={[
                          { value: "normal", label: "Normal" },
                          { value: "italic", label: "Italic" },
                        ]}
                      />
                      <SliderNumberField label="Line Height" value={props.lineHeight ?? 1.6} onChange={(v) => set("lineHeight", v)} min={0.8} max={5} step={0.05} unit="" />
                      <SliderNumberField label="Letter Spacing (px)" value={props.letterSpacing ?? 0} onChange={(v) => set("letterSpacing", v)} min={-10} max={50} step={0.5} unit="px" />
                      <InlineSelect
                        label="Text Decoration"
                        value={props.textDecoration ?? "none"}
                        onChange={(v) => set("textDecoration", v)}
                        options={[
                          { value: "none", label: "None" },
                          { value: "underline", label: "Underline" },
                          { value: "line-through", label: "Line Through" },
                        ]}
                      />
                      <InlineSelect
                        label="Text Transform"
                        value={props.textTransform ?? "capitalize"}
                        onChange={(v) => set("textTransform", v)}
                        options={[
                          { value: "capitalize", label: "Capitalize" },
                          { value: "uppercase", label: "Uppercase" },
                          { value: "lowercase", label: "Lowercase" },
                        ]}
                      />

                      <TabSection title="Color" />
                      <ColorPickerField
                        label="Text Color"
                        value={props.textColor ?? ""}
                        onChange={(v) => set("textColor", v)}
                      />
                      <TabSection title="Alignment" />
                      <AlignField
                        label="Text Align"
                        value={props.alignment ?? "left"}
                        onChange={(v) => set("alignment", v)}
                        options={[
                          { value: "left",    icon: <AlignLeft    size={15} />, title: "Left"    },
                          { value: "center",  icon: <AlignCenter  size={15} />, title: "Center"  },
                          { value: "right",   icon: <AlignRight   size={15} />, title: "Right"   },
                          { value: "justify", icon: <AlignJustify size={15} />, title: "Justify" },
                        ]}
                      />
                    </>
                  )}

                  {/* ── ADVANCED TAB ── */}
                  {tab === "advanced" && (
                    <>
                      <TabSection title="Spacing" />
                      <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                      <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 16, right: 0, bottom: 16, left: 0 }} onChange={(v) => set("advPadding", v)} />

                      <TabSection title="Background" />
                      <InlineSelect
                        label="Type"
                        value={bgType}
                        onChange={(v) => set("advBgType", v)}
                        options={[
                          { value: "none", label: "None" },
                          { value: "color", label: "Color" },
                          { value: "gradient", label: "Gradient" },
                        ]}
                      />
                      {bgType === "color" && (
                        <ColorPickerField label="Color" value={props.backgroundColor ?? ""} onChange={(v) => set("backgroundColor", v)} />
                      )}
                      {bgType === "gradient" && (
                        <>
                          <ColorPickerField label="Color 1" value={props.advGradientColor1 ?? ""} onChange={(v) => set("advGradientColor1", v)} />
                          <ColorPickerField label="Color 2" value={props.advGradientColor2 ?? ""} onChange={(v) => set("advGradientColor2", v)} />
                          <SliderNumberField label="Angle (deg)" value={props.advGradientAngle ?? 135} onChange={(v) => set("advGradientAngle", v)} min={0} max={360} step={15} unit="°" />
                        </>
                      )}

                      <TabSection title="Border" />
                      <InlineSelect
                        label="Border Style"
                        value={props.advBorderStyle ?? "none"}
                        onChange={(v) => set("advBorderStyle", v)}
                        options={[
                          { value: "none", label: "None" },
                          { value: "solid", label: "Solid" },
                          { value: "dashed", label: "Dashed" },
                          { value: "dotted", label: "Dotted" },
                          { value: "double", label: "Double" },
                        ]}
                      />
                      {props.advBorderStyle && props.advBorderStyle !== "none" && (
                        <>
                          <FourSideField label="Border Width (px)" value={props.advBorderWidth} onChange={(v) => set("advBorderWidth", v)} />
                          <ColorPickerField label="Border Color" value={props.advBorderColor ?? ""} onChange={(v) => set("advBorderColor", v)} />
                        </>
                      )}
                      <FourSideField label="Border Radius (px)" value={props.advBorderRadius} onChange={(v) => set("advBorderRadius", v)} />


                      <TabSection title="Responsive" />
                      <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                      <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
                      <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />

                      <SliderNumberField label="Opacity (%)" value={props.opacity ?? 100} onChange={(v) => set("opacity", v)} min={0} max={100} step={1} unit="%" />
                    </>
                  )}
                </>
              )}
            </BlockTabBar>
          );
        },
      },
    },

    defaultProps: {
      title: "Enter your text here.",
      columnCount: "1",
      columnGap: "",
      fontFamily: "inherit",
      fontSize: null,
      fontWeight: "400",
      fontStyle: "normal",
      lineHeight: null,
      letterSpacing: null,
      textDecoration: "none",
      textTransform: "capitalize",
      textColor: "",
      linkColor: "",
      linkHoverColor: "",
      alignment: "left",
      backgroundColor: "",
      advBgType: "none",
      advGradientColor1: "",
      advGradientColor2: "",
      advGradientAngle: 135,
      advMargin: { top: 0, right: 0, bottom: 0, left: 0 },
      advPadding: { top: 16, right: 0, bottom: 16, left: 0 },
      advBorderStyle: "none",
      advBorderWidth: { top: 0, right: 0, bottom: 0, left: 0 },
      advBorderColor: "",
      advBorderRadius: { top: 0, right: 0, bottom: 0, left: 0 },
      hideDesktop: false,
      hideTablet: false,
      hideMobile: false,
      cssId: "",
      cssClass: "",
      customCss: "",
      zIndex: null,
      opacity: 100,
    },

    render: ({
      title,
      columnCount,
      columnGap,
      fontFamily,
      fontSize,
      fontWeight,
      fontStyle,
      lineHeight,
      letterSpacing,
      textDecoration,
      textTransform,
      textColor,
      linkColor,
      linkHoverColor: _linkHoverColor,
      alignment,
      backgroundColor,
      advBgType,
      advGradientColor1,
      advGradientColor2,
      advGradientAngle,
      advMargin,
      advPadding,
      advBorderStyle,
      advBorderWidth,
      advBorderColor,
      advBorderRadius,
      hideDesktop,
      hideTablet,
      hideMobile,
      cssId,
      cssClass,
      customCss,
      zIndex,
      opacity,
    }) => {
      const bgStyle: React.CSSProperties = (() => {
        if (advBgType === "color") return { backgroundColor: backgroundColor || "transparent" };
        if (advBgType === "gradient" && advGradientColor1 && advGradientColor2)
          return { background: `linear-gradient(${advGradientAngle ?? 135}deg, ${advGradientColor1}, ${advGradientColor2})` };
        return {};
      })();

      const borderStyle: React.CSSProperties = advBorderStyle && advBorderStyle !== "none"
        ? { borderStyle: advBorderStyle, borderTopWidth: advBorderWidth?.top ?? 0, borderRightWidth: advBorderWidth?.right ?? 0, borderBottomWidth: advBorderWidth?.bottom ?? 0, borderLeftWidth: advBorderWidth?.left ?? 0, borderColor: advBorderColor || "currentColor" }
        : {};

      const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");

      const cols = parseInt(String(columnCount ?? "1"), 10) || 1;
      const colStyle: React.CSSProperties = cols > 1
        ? { columnCount: cols, columnGap: columnGap || "1.5rem" }
        : {};

      return (
        <div
          id={cssId || undefined}
          className={[cssClass].filter(Boolean).join(" ") || undefined}
          style={{
            paddingTop: advPadding?.top ?? 16, paddingRight: advPadding?.right ?? 0,
            paddingBottom: advPadding?.bottom ?? 16, paddingLeft: advPadding?.left ?? 0,
            marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0,
            marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0,
            zIndex: zIndex ?? undefined,
            opacity: opacity != null ? opacity / 100 : 1,
            borderTopLeftRadius: advBorderRadius?.top ?? 0,
            borderTopRightRadius: advBorderRadius?.right ?? 0,
            borderBottomRightRadius: advBorderRadius?.bottom ?? 0,
            borderBottomLeftRadius: advBorderRadius?.left ?? 0,
            ...bgStyle,
            ...borderStyle,
          }}
        >
          {customCss && <style>{`#${cssId || "text-block"} { ${customCss} }`}</style>}
          {linkColor && <style>{`.text-block-links-${cssId || "default"} a { color: ${linkColor}; }`}</style>}
          <p
            className={linkColor ? `text-block-links-${cssId || "default"}` : undefined}
            style={{
              textAlign: alignment as any,
              fontSize: fontSize ? `${fontSize}px` : "var(--base-font-size, 1rem)",
              fontWeight: fontWeight || 400,
              fontFamily: fontFamily && fontFamily !== "inherit" ? fontFamily : "var(--font-family)",
              fontStyle: fontStyle ?? "normal",
              lineHeight: lineHeight ?? "var(--line-height, 1.6)",
              letterSpacing: letterSpacing != null ? `${letterSpacing}px` : undefined,
              textDecoration: textDecoration ?? "none",
              textTransform: (textTransform ?? "none") as any,
              color: textColor || "var(--text-color)",
              margin: 0,
              ...colStyle,
            }}
          >
            {title}
          </p>
        </div>
      );
    },
  },

  Article: {
    label: "Article Block",
    fields: {
      _tabs: {
        type: "custom",
        label: "",
        render: ({ value: _v, onChange: _onChange }: any) => {
          const { selectedItem, appState, dispatch } = usePuck();
          const props = selectedItem?.props ?? {};
          const set = (key: string, val: any) => {
            if (!selectedItem) return;
            const state = appState.data;
            let destinationZone = "root:default-zone", destinationIndex = 0;
            const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
            for (const [zone, items] of Object.entries(zones)) {
              const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
              if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
            }
            dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
          };
          return (
            <BlockTabBar blockKey="Article">
              {(tab) => (
                <>
                  {tab === "content" && (
                    <>
                      <TabSection title="Article" />
                      <StackedTextField label="Title" value={props.articleTitle ?? ""} onChange={(v) => set("articleTitle", v)} placeholder="Enter article title..." />
                      <StackedTextareaField label="Body" value={props.body ?? ""} onChange={(v) => set("body", v)} placeholder="Enter article body..." rows={6} />
                      <StackedTextField label="Author" value={props.author ?? ""} onChange={(v) => set("author", v)} placeholder="e.g., Jane Smith" />
                      <ToggleField label="Show Author" value={props.showAuthor !== false} onChange={(v) => set("showAuthor", v)} />
                      <StackedDateField label="Published Date" value={props.publishDate ?? ""} onChange={(v) => set("publishDate", v)} />
                      <ToggleField label="Show Date" value={props.showDate !== false} onChange={(v) => set("showDate", v)} />
                      <TabSection title="Featured Image" />
                      <ImageField label="Featured Image" value={props.featuredImage ?? ""} onChange={(v: any) => set("featuredImage", v)} />
                    </>
                  )}
                  {tab === "style" && (
                    <>
                      <TabSection title="Colors" />
                      <ColorPickerField label="Title Color" value={props.titleColor ?? ""} onChange={(v) => set("titleColor", v)} />
                      <ColorPickerField label="Body Color" value={props.bodyColor ?? ""} onChange={(v) => set("bodyColor", v)} />
                      <ColorPickerField label="Author Color" value={props.authorColor ?? ""} onChange={(v) => set("authorColor", v)} />
                      <ColorPickerField label="Date Color" value={props.dateColor ?? ""} onChange={(v) => set("dateColor", v)} />

                      <TabSection title="Title Typography" />
                      <InlineSelect label="Font Family" value={props.titleFontFamily ?? "inherit"} onChange={(v) => { set("titleFontFamily", v); loadGoogleFont(v); }} options={[{ value: "inherit", label: "Theme Default" }, { value: "Arial, Helvetica, sans-serif", label: "Arial" }, { value: "Georgia, serif", label: "Georgia" }, { value: "'Courier New', monospace", label: "Courier New" }, { value: "Impact, sans-serif", label: "Impact" }, { value: "Inter, sans-serif", label: "Inter" }, { value: "Poppins, sans-serif", label: "Poppins" }, { value: "'Roboto Serif', serif", label: "Roboto Serif" }, { value: "'New York', 'New York Small', 'Times New Roman', serif", label: "New York" }, { value: "'Open Sans', sans-serif", label: "Open Sans" }]} />
                      <SliderNumberField label="Font Size (px)" value={props.titleFontSize ?? 32} onChange={(v) => set("titleFontSize", v)} min={10} max={120} step={1} unit="px" />
                      <InlineSelect label="Font Weight" value={String(props.titleFontWeight ?? "700")} onChange={(v) => set("titleFontWeight", v)} options={[{value:"400",label:"Normal"},{value:"600",label:"Semi Bold"},{value:"900",label:"Bold"}]} />
                      <SliderNumberField label="Line Height" value={props.titleLineHeight ?? 1.3} onChange={(v) => set("titleLineHeight", v)} min={0.8} max={3} step={0.05} unit="" />
                      <AlignField label="Text Alignment" value={props.titleAlign ?? "left"} onChange={(v) => set("titleAlign", v)} options={[{value:"left",icon:<AlignLeft size={15}/>,title:"Left"},{value:"center",icon:<AlignCenter size={15}/>,title:"Center"},{value:"right",icon:<AlignRight size={15}/>,title:"Right"}]} />

                      <TabSection title="Body Typography" />
                      <InlineSelect label="Font Family" value={props.bodyFontFamily ?? "inherit"} onChange={(v) => { set("bodyFontFamily", v); loadGoogleFont(v); }} options={[{ value: "inherit", label: "Theme Default" }, { value: "Arial, Helvetica, sans-serif", label: "Arial" }, { value: "Georgia, serif", label: "Georgia" }, { value: "'Courier New', monospace", label: "Courier New" }, { value: "Impact, sans-serif", label: "Impact" }, { value: "Inter, sans-serif", label: "Inter" }, { value: "Poppins, sans-serif", label: "Poppins" }, { value: "'Roboto Serif', serif", label: "Roboto Serif" }, { value: "'New York', 'New York Small', 'Times New Roman', serif", label: "New York" }, { value: "'Open Sans', sans-serif", label: "Open Sans" }]} />
                      <SliderNumberField label="Font Size (px)" value={props.bodyFontSize ?? 16} onChange={(v) => set("bodyFontSize", v)} min={10} max={60} step={1} unit="px" />
                      <InlineSelect label="Font Weight" value={String(props.bodyFontWeight ?? "400")} onChange={(v) => set("bodyFontWeight", v)} options={[{value:"400",label:"Normal"},{value:"600",label:"Semi Bold"},{value:"900",label:"Bold"}]} />
                      <SliderNumberField label="Line Height" value={props.bodyLineHeight ?? 1.75} onChange={(v) => set("bodyLineHeight", v)} min={0.8} max={4} step={0.05} unit="" />

                      <TabSection title="Author Typography" />
                      <InlineSelect label="Font Family" value={props.authorFontFamily ?? "inherit"} onChange={(v) => { set("authorFontFamily", v); loadGoogleFont(v); }} options={[{ value: "inherit", label: "Theme Default" }, { value: "Arial, Helvetica, sans-serif", label: "Arial" }, { value: "Georgia, serif", label: "Georgia" }, { value: "'Courier New', monospace", label: "Courier New" }, { value: "Impact, sans-serif", label: "Impact" }, { value: "Inter, sans-serif", label: "Inter" }, { value: "Poppins, sans-serif", label: "Poppins" }, { value: "'Roboto Serif', serif", label: "Roboto Serif" }, { value: "'New York', 'New York Small', 'Times New Roman', serif", label: "New York" }, { value: "'Open Sans', sans-serif", label: "Open Sans" }]} />
                      <SliderNumberField label="Font Size (px)" value={props.authorFontSize ?? 14} onChange={(v) => set("authorFontSize", v)} min={10} max={40} step={1} unit="px" />
                      <InlineSelect label="Font Weight" value={String(props.authorFontWeight ?? "400")} onChange={(v) => set("authorFontWeight", v)} options={[{value:"400",label:"Normal"},{value:"600",label:"Semi Bold"},{value:"900",label:"Bold"}]} />

                      <TabSection title="Date Typography" />
                      <InlineSelect label="Font Family" value={props.dateFontFamily ?? "inherit"} onChange={(v) => { set("dateFontFamily", v); loadGoogleFont(v); }} options={[{ value: "inherit", label: "Theme Default" }, { value: "Arial, Helvetica, sans-serif", label: "Arial" }, { value: "Georgia, serif", label: "Georgia" }, { value: "'Courier New', monospace", label: "Courier New" }, { value: "Impact, sans-serif", label: "Impact" }, { value: "Inter, sans-serif", label: "Inter" }, { value: "Poppins, sans-serif", label: "Poppins" }, { value: "'Roboto Serif', serif", label: "Roboto Serif" }, { value: "'New York', 'New York Small', 'Times New Roman', serif", label: "New York" }, { value: "'Open Sans', sans-serif", label: "Open Sans" }]} />
                      <SliderNumberField label="Font Size (px)" value={props.dateFontSize ?? 13} onChange={(v) => set("dateFontSize", v)} min={10} max={40} step={1} unit="px" />
                      <InlineSelect label="Font Weight" value={String(props.dateFontWeight ?? "400")} onChange={(v) => set("dateFontWeight", v)} options={[{value:"400",label:"Normal"},{value:"600",label:"Semi Bold"},{value:"900",label:"Bold"}]} />

                      <TabSection title="Featured Image" />
                      <InlineSelect label="Object Fit" value={props.imageFit ?? "cover"} onChange={(v) => set("imageFit", v)} options={[{value:"cover",label:"Cover"},{value:"contain",label:"Contain"},{value:"fill",label:"Fill"}]} />
                      <SliderNumberField label="Border Radius (px)" value={props.imageBorderRadius ?? 8} onChange={(v) => set("imageBorderRadius", v)} min={0} max={100} step={1} unit="px" />
                      <SliderNumberField label="Margin Bottom (px)" value={props.imageMarginBottom ?? 24} onChange={(v) => set("imageMarginBottom", v)} min={0} max={120} step={4} unit="px" />
                    </>
                  )}
                  {tab === "advanced" && (
                    <>
                      <TabSection title="Spacing" />
                      <FourSideField label="Margin"  value={props.advMargin  ?? { top: 0, right: 0, bottom: 0, left: 0 }}   onChange={(v) => set("advMargin", v)} />
                      <FourSideField label="Padding" value={props.advPadding ?? { top: 48, right: 24, bottom: 48, left: 24 }} onChange={(v) => set("advPadding", v)} />
                      <TabSection title="Responsive" />
                      <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                      <ToggleField label="Hide on Tablet"  value={!!props.hideTablet}  onChange={(v) => set("hideTablet", v)} />
                      <ToggleField label="Hide on Mobile"  value={!!props.hideMobile}  onChange={(v) => set("hideMobile", v)} />
                    </>
                  )}
                </>
              )}
            </BlockTabBar>
          );
        },
      },
    },

    defaultProps: {
      articleTitle: "Article Title",
      author: "Jane Smith",
      showAuthor: true,
      publishDate: "",
      showDate: true,
      body: "<p></p>",
      featuredImage: "",
      imagePosition: "top",
      imageHeight: 400,
      imageBorderRadius: 8,
      imageFit: "cover",
      imageMarginBottom: 24,
      titleAlign: "left",
      titleColor: "",
      titleFontFamily: "inherit",
      titleFontSize: 32,
      titleFontWeight: "700",
      titleLineHeight: 1.3,
      bodyColor: "",
      bodyFontFamily: "inherit",
      bodyFontSize: 16,
      bodyFontWeight: "400",
      bodyLineHeight: 1.75,
      authorColor: "",
      authorFontFamily: "inherit",
      authorFontSize: 14,
      authorFontWeight: "400",
      dateColor: "",
      dateFontFamily: "inherit",
      dateFontSize: 13,
      dateFontWeight: "400",
      advMargin:  { top: 0,  right: 0,  bottom: 0,  left: 0  },
      advPadding: { top: 48, right: 24, bottom: 48, left: 24 },
      hideDesktop: false,
      hideTablet:  false,
      hideMobile:  false,
    },

    render: ({
      articleTitle, author, showAuthor, publishDate, showDate, body,
      featuredImage, imagePosition, imageHeight, imageBorderRadius, imageFit, imageMarginBottom,
      titleAlign, titleColor, titleFontFamily, titleFontSize, titleFontWeight, titleLineHeight,
      bodyColor, bodyFontFamily, bodyFontSize, bodyFontWeight, bodyLineHeight,
      authorColor, authorFontFamily, authorFontSize, authorFontWeight,
      dateColor, dateFontFamily, dateFontSize, dateFontWeight,
      advMargin, advPadding, hideDesktop, hideTablet, hideMobile,
    }: any) => {
      const m  = advMargin  ?? { top: 0,  right: 0,  bottom: 0,  left: 0  };
      const pd = advPadding ?? { top: 48, right: 24, bottom: 48, left: 24 };
      const hideClasses = [
        hideDesktop ? "puck-hide-desktop" : "",
        hideTablet  ? "puck-hide-tablet"  : "",
        hideMobile  ? "puck-hide-mobile"  : "",
      ].filter(Boolean).join(" ");
      const radius = imageBorderRadius ?? 8;
      const imgH = imageHeight ?? 400;
      const isHorizontal = imagePosition === "left" || imagePosition === "right";
      const fit = imageFit ?? "cover";
      const imgMarginBottom = imageMarginBottom ?? 24;

      const imgStyle: React.CSSProperties = {
        width: "100%",
        height: imgH,
        objectFit: fit as React.CSSProperties["objectFit"],
        display: "block",
      };

      const formatDate = (d: string) => {
        if (!d) return "";
        const parsed = new Date(d);
        return isNaN(parsed.getTime()) ? d : parsed.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      };

      const imageBox = featuredImage ? (
        <div style={{
          flexShrink: 0,
          minWidth: 0,
          width: isHorizontal ? "44%" : "100%",
          marginBottom: isHorizontal ? 0 : imgMarginBottom,
          borderRadius: radius,
          overflow: "hidden",
        }}>
          <img src={featuredImage} alt={articleTitle || "Featured image"} style={imgStyle} />
        </div>
      ) : null;

      const metaVisible = (showAuthor !== false && !!author) || (showDate !== false && !!publishDate);

      const articleContent = (
        <div style={{ flex: 1, minWidth: 0 }}>
          {articleTitle && (
            <h1 style={{
              fontSize: titleFontSize ? `${titleFontSize}px` : "2rem",
              fontWeight: Number(titleFontWeight ?? 700),
              fontFamily: titleFontFamily && titleFontFamily !== "inherit" ? titleFontFamily : "var(--heading-font)",
              color: titleColor || "var(--primary-color)",
              textAlign: titleAlign as React.CSSProperties["textAlign"],
              lineHeight: titleLineHeight ?? 1.3,
              marginBottom: 10,
            }}>
              {articleTitle}
            </h1>
          )}
          {metaVisible && (
            <div style={{
              display: "flex",
              gap: 12,
              marginBottom: 28,
              flexWrap: "wrap",
              justifyContent: titleAlign === "center" ? "center" : titleAlign === "right" ? "flex-end" : "flex-start",
            }}>
              {showAuthor !== false && author && (
                <span style={{
                  fontSize: authorFontSize ? `${authorFontSize}px` : 14,
                  fontWeight: Number(authorFontWeight ?? 400),
                  fontFamily: authorFontFamily && authorFontFamily !== "inherit" ? authorFontFamily : undefined,
                  color: authorColor || "var(--text-color)",
                }}>
                  By <strong>{author}</strong>
                </span>
              )}
              {showDate !== false && publishDate && (
                <span style={{
                  fontSize: dateFontSize ? `${dateFontSize}px` : 13,
                  fontWeight: Number(dateFontWeight ?? 400),
                  fontFamily: dateFontFamily && dateFontFamily !== "inherit" ? dateFontFamily : undefined,
                  color: dateColor || "var(--text-color)",
                }}>
                  {formatDate(publishDate)}
                </span>
              )}
            </div>
          )}
          <div style={{
            fontSize: bodyFontSize ? `${bodyFontSize}px` : "1rem",
            lineHeight: bodyLineHeight ?? 1.75,
            color: bodyColor || "var(--text-color)",
            fontWeight: Number(bodyFontWeight ?? 400),
            fontFamily: bodyFontFamily && bodyFontFamily !== "inherit" ? bodyFontFamily : undefined,
          }}>
            {body}
          </div>
        </div>
      );

      return (
        <div
          style={{
            position: "relative",
            marginTop: m.top, marginRight: m.right, marginBottom: m.bottom, marginLeft: m.left,
            paddingTop: pd.top, paddingRight: pd.right, paddingBottom: pd.bottom, paddingLeft: pd.left,
          }}
        >
          <EditorHideOverlay hideDesktop={hideDesktop} hideTablet={hideTablet} hideMobile={hideMobile} />
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            {isHorizontal ? (
              <div style={{ display: "flex", flexDirection: imagePosition === "left" ? "row" : "row-reverse", gap: 48, alignItems: "flex-start" }}>
                {imageBox}
                {articleContent}
              </div>
            ) : (
              <>
                {imageBox}
                {articleContent}
              </>
            )}
          </div>
        </div>
      );
    },
  },

  // ─── About Section ───────────────────────────────────────────────────────


  // ─── Photo Collage ───────────────────────────────────────────────────────

  PhotoCollage: {
    label: "Photo Collage",
    fields: {
      _tabs: {
        type: "custom",
        label: "",
        render: ({ value: _v, onChange: _onChange }: any) => {
          const { selectedItem, appState, dispatch } = usePuck();
          const props = selectedItem?.props ?? {};
          const set = (key: string, val: any) => {
            if (!selectedItem) return;
            const state = appState.data;
            let destinationZone = "root:default-zone";
            let destinationIndex = 0;
            const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
            for (const [zone, items] of Object.entries(zones)) {
              const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
              if (idx !== -1) {
                destinationZone = zone;
                destinationIndex = idx;
                break;
              }
            }
            dispatch({
              type: "replace",
              destinationZone,
              destinationIndex,
              data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } },
            });
          };
          const [photoOpenIdx, setPhotoOpenIdx] = useState<number | null>(null);
          const [photoConfirmIdx, setPhotoConfirmIdx] = useState<number | null>(null);

          return (
            <BlockTabBar blockKey="PhotoCollage">
              {(tab: any) => (
                <>
                  {tab === "content" && (
                    <>
                      <TabSection title="Layout" />
                      <InlineSelect
                        label="Layout Type"
                        value={props.layout ?? "mixed"}
                        onChange={(v: any) => set("layout", v)}
                        options={[
                          { value: "mixed",    label: "Mixed Sizes" },
                          { value: "grid",     label: "Grid"        },
                          { value: "brick",    label: "Brick"       },
                          { value: "carousel", label: "Carousel"    },
                        ]}
                      />
                      <TabSection title="Photos" />
                      {(() => {
                        const imgs: any[] = (props.images as any[]) ?? [];
                        const openIdx = photoOpenIdx;
                        const confirmIdx = photoConfirmIdx;
                        const updateImage = (i: number, key: string, val: any) => {
                          const cur = [...(((selectedItem?.props as any)?.images as any[]) ?? [])];
                          cur[i] = { ...cur[i], [key]: val };
                          set("images", cur);
                        };
                        const deleteImage = (i: number) => {
                          const cur = (((selectedItem?.props as any)?.images as any[]) ?? []);
                          set("images", cur.filter((_: any, idx: number) => idx !== i));
                          setPhotoConfirmIdx(null);
                          setPhotoOpenIdx(null);
                        };
                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {imgs.map((img: any, i: number) => {
                              const open = openIdx === i;
                              const confirm = confirmIdx === i;
                              return (
                                <div key={i} style={{ border: "1px solid var(--p-color-border, #e1e3e5)", borderRadius: 8, background: "var(--p-color-bg-surface, #fff)", overflow: "hidden" }}>
                                  {/* Header row */}
                                  <div
                                    onClick={() => { if (!confirm) setPhotoOpenIdx(open ? null : i); }}
                                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", cursor: confirm ? "default" : "pointer", userSelect: "none", background: open ? "var(--p-color-bg-surface-secondary, #f6f6f7)" : "transparent", borderBottom: (open || confirm) ? "1px solid var(--p-color-border, #e1e3e5)" : "none" }}
                                  >
                                    <div style={{ width: 36, height: 36, borderRadius: 5, overflow: "hidden", background: "var(--p-color-bg-surface-secondary, #f3f4f6)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--p-color-border, #e1e3e5)" }}>
                                      {img.url
                                        ? <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--p-color-icon-subdued, #8c9196)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                                      }
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--p-color-text, #202223)", lineHeight: 1.3 }}>Photo {i + 1}</div>
                                      <div style={{ fontSize: 11, color: "var(--p-color-text-subdued, #6d7175)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>
                                        {img.alt || (img.url ? "No alt text" : "No image selected")}
                                      </div>
                                    </div>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--p-color-icon-subdued, #8c9196)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
                                      <path d="m6 9 6 6 6-6"/>
                                    </svg>
                                    <button
                                      onClick={(e: any) => { e.stopPropagation(); setPhotoConfirmIdx(i); setPhotoOpenIdx(null); }}
                                      title="Remove photo"
                                      style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 5, border: "1px solid var(--p-color-border, #e1e3e5)", background: "var(--p-color-bg-surface, #fff)", color: "var(--p-color-text-critical, #d72c0d)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                        <path d="M10 11v6"/><path d="M14 11v6"/>
                                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                      </svg>
                                    </button>
                                  </div>
                                  {/* Delete confirmation */}
                                  {confirm && (
                                    <div style={{ padding: "12px 12px 14px", background: "#fff8f8", display: "flex", flexDirection: "column", gap: 10 }}>
                                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 6, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#d72c0d" }}>
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                        </div>
                                        <div>
                                          <div style={{ fontSize: 12, fontWeight: 600, color: "#202223", marginBottom: 2 }}>Remove Photo {i + 1}?</div>
                                          <div style={{ fontSize: 11, color: "#6d7175", lineHeight: 1.5 }}>This photo will be removed from the collage. This action cannot be undone.</div>
                                        </div>
                                      </div>
                                      <div style={{ display: "flex", gap: 6 }}>
                                        <button
                                          onClick={(e: any) => { e.stopPropagation(); setPhotoConfirmIdx(null); }}
                                          style={{ flex: 1, padding: "6px 0", fontSize: 12, fontWeight: 600, borderRadius: 6, border: "1px solid var(--p-color-border, #e1e3e5)", background: "var(--p-color-bg-surface, #fff)", color: "var(--p-color-text, #202223)", cursor: "pointer" }}
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={(e: any) => { e.stopPropagation(); deleteImage(i); }}
                                          style={{ flex: 1, padding: "6px 0", fontSize: 12, fontWeight: 600, borderRadius: 6, border: "none", background: "#d72c0d", color: "#fff", cursor: "pointer" }}
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  {/* Expanded fields */}
                                  {open && !confirm && (
                                    <div style={{ padding: "10px 10px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
                                      <ImageField label="Photo" value={img.url ?? ""} onChange={(v: any) => updateImage(i, "url", v)} />
                                      <StackedTextField label="Alt Text" value={img.alt ?? ""} onChange={(v: any) => updateImage(i, "alt", v)} placeholder="Describe the image…" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            <button
                              onClick={() => { const cur = (((selectedItem?.props as any)?.images as any[]) ?? []); set("images", [...cur, { url: "", alt: "" }]); setPhotoOpenIdx(cur.length); }}
                              style={{ marginTop: 2, width: "100%", padding: "8px 0", border: "1.5px dashed var(--p-color-border-interactive, #0158ad)", borderRadius: 8, color: "var(--p-color-text-interactive, #0158ad)", background: "transparent", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                              Add Photo
                            </button>
                          </div>
                        );
                      })()}
                    </>
                  )}

                  {tab === "style" && (
                    <>
                      <TabSection title="Spacing" />
                      <SliderNumberField
                        label="Gap Between Photos (px)"
                        value={props.gap ?? 8}
                        onChange={(v: any) => set("gap", v)}
                        min={0}
                        max={40}
                        step={2}
                        unit="px"
                      />
                      <SliderNumberField
                        label="Border Radius (px)"
                        value={props.borderRadius ?? 8}
                        onChange={(v: any) => set("borderRadius", v)}
                        min={0}
                        max={50}
                        step={1}
                        unit="px"
                      />
                      <TabSection title="Image Styling" />
                      <InlineSelect
                        label="Object Fit"
                        value={props.objectFit ?? "cover"}
                        onChange={(v: any) => set("objectFit", v)}
                        options={[
                          { value: "cover",   label: "Cover"   },
                          { value: "contain", label: "Contain" },
                          { value: "fill",    label: "Fill"    },
                        ]}
                      />
                      <InlineSelect
                        label="Aspect Ratio"
                        value={props.aspectRatio ?? "1:1"}
                        onChange={(v: any) => set("aspectRatio", v)}
                        options={[
                          { value: "1:1",  label: "1:1"  },
                          { value: "4:3",  label: "4:3"  },
                          { value: "16:9", label: "16:9" },
                          { value: "3:2",  label: "3:2"  },
                        ]}
                      />
                      <TabSection title="Effects" />
                      <InlineSelect
                        label="Hover Effect"
                        value={props.hoverEffect ?? "none"}
                        onChange={(v: any) => set("hoverEffect", v)}
                        options={[
                          { value: "none",   label: "None"   },
                          { value: "zoom",   label: "Zoom"   },
                          { value: "darken", label: "Darken" },
                        ]}
                      />
                      <ToggleField
                        label="Box Shadow"
                        value={!!props.boxShadow}
                        onChange={(v: any) => set("boxShadow", v)}
                      />
                      {props.boxShadow && (
                        <InlineSelect
                          label="Shadow Strength"
                          value={props.shadowStrength ?? "subtle"}
                          onChange={(v: any) => set("shadowStrength", v)}
                          options={[
                            { value: "subtle", label: "Subtle" },
                            { value: "medium", label: "Medium" },
                            { value: "strong", label: "Strong" },
                          ]}
                        />
                      )}
                    </>
                  )}

                  {tab === "advanced" && (
                    <>
                      <TabSection title="Responsive" />
                      <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v: any) => set("hideDesktop", v)} />
                      <ToggleField label="Hide on Tablet"  value={!!props.hideTablet}  onChange={(v: any) => set("hideTablet", v)}  />
                      <ToggleField label="Hide on Mobile"  value={!!props.hideMobile}  onChange={(v: any) => set("hideMobile", v)}  />
                    </>
                  )}
                </>
              )}
            </BlockTabBar>
          );
        },
      },
    },

    defaultProps: {
      layout: "mixed",
      images: [
        { url: "", alt: "Photo 1" },
        { url: "", alt: "Photo 2" },
        { url: "", alt: "Photo 3" },
      ],
      gap: 8,
      borderRadius: 8,
      objectFit: "cover",
      aspectRatio: "1:1",
      hoverEffect: "none",
      boxShadow: false,
      shadowStrength: "subtle",
      hideDesktop: false,
      hideTablet: false,
      hideMobile: false,
    },

    render: ({ layout, images, gap, borderRadius, objectFit, aspectRatio, hoverEffect, boxShadow, shadowStrength, hideDesktop, hideTablet, hideMobile }: any) => {
      const imgs = ((images as any[]) ?? []).filter((img: any) => img.url);
      const gapPx = `${gap ?? 8}px`;
      const br = `${borderRadius ?? 8}px`;
      const fit = objectFit ?? "cover";
      const shadow = !boxShadow
        ? "none"
        : shadowStrength === "strong"
          ? "0 8px 24px rgba(0,0,0,0.3)"
          : shadowStrength === "medium"
            ? "0 4px 12px rgba(0,0,0,0.2)"
            : "0 2px 6px rgba(0,0,0,0.12)";
      const hideClasses = [
        hideDesktop ? "puck-hide-desktop" : "",
        hideTablet  ? "puck-hide-tablet"  : "",
        hideMobile  ? "puck-hide-mobile"  : "",
      ].filter(Boolean).join(" ");

      const arMap: Record<string, string> = { "1:1": "1/1", "4:3": "4/3", "16:9": "16/9", "3:2": "3/2" };
      const ar = arMap[aspectRatio as string] ?? "1/1";

      const getHoverStyle = (hovered: boolean): Record<string, string> => {
        if (!hovered) return {};
        if (hoverEffect === "zoom")   return { transform: "scale(1.05)" };
        if (hoverEffect === "darken") return { filter: "brightness(0.75)" };
        return {};
      };

      const ImgCell = ({ img, i, cellStyle, fitOverride }: { img: any; i: number; cellStyle: any; fitOverride?: string }) => {
        const [hovered, setHovered] = useState(false);
        return (
          <div
            key={i}
            className="pb-collage-item"
            style={{ overflow: "hidden", borderRadius: br, boxShadow: shadow, position: "relative", ...cellStyle }}
          >
            <img
              src={img.url}
              alt={img.alt || `Photo ${i + 1}`}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: (fitOverride ?? fit) as any,
                display: "block",
                transition: "transform 0.3s ease, filter 0.3s ease",
                ...getHoverStyle(hovered),
              }}
            />
          </div>
        );
      };

      let content: React.ReactNode;

      if (!imgs.length) {
        content = (
          <div style={{ background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, borderRadius: br, color: "#6b7280", fontSize: 14 }}>
            Add photos in the Content tab
          </div>
        );
      } else if (layout === "grid") {
        content = (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: gapPx }}>
            {imgs.map((img: any, i: number) => (
              <ImgCell key={i} img={img} i={i} cellStyle={{ aspectRatio: ar }} />
            ))}
          </div>
        );
      } else if (layout === "brick") {
        const FULL = 3;
        const brickW = `calc((100% - ${(FULL - 1)} * ${gapPx}) / ${FULL})`;
        const halfW = `calc((${brickW} - ${gapPx}) / 2)`;
        const rows: { items: any[]; offset: boolean }[] = [];
        let bi = 0; let rowNo = 0;
        while (bi < imgs.length) {
          const offset = rowNo % 2 === 1;
          const count = offset ? FULL - 1 : FULL;
          rows.push({ items: imgs.slice(bi, bi + count), offset });
          bi += count; rowNo += 1;
        }
        let imgIdx = 0;
        content = (
          <div style={{ display: "flex", flexDirection: "column", gap: gapPx, overflow: "hidden" }}>
            {rows.map(({ items, offset }: { items: any[]; offset: boolean }, rIdx: number) => (
              <div key={rIdx} style={{ display: "flex", gap: gapPx }}>
                {offset && <div style={{ flex: `0 0 ${halfW}` }} />}
                {items.map((img: any, cIdx: number) => (
                  <ImgCell key={cIdx} img={img} i={imgIdx++} cellStyle={{ flex: `0 0 ${brickW}`, aspectRatio: ar }} fitOverride="cover" />
                ))}
                {offset && <div style={{ flex: `0 0 ${halfW}` }} />}
              </div>
            ))}
          </div>
        );
      } else if (layout === "carousel") {
        content = (
          <div style={{ display: "flex", gap: gapPx, overflowX: "auto", paddingBottom: 6, scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
            {imgs.map((img: any, i: number) => (
              <ImgCell key={i} img={img} i={i} cellStyle={{ flex: "0 0 auto", width: "min(70%, 360px)", aspectRatio: ar, scrollSnapAlign: "start" }} />
            ))}
          </div>
        );
      } else {
        // mixed (default)
        content = (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: gapPx }}>
            {imgs.map((img: any, i: number) => {
              const cellStyle = i === 0 ? { gridColumn: "span 2", gridRow: "span 2", aspectRatio: ar } : { aspectRatio: ar };
              return <ImgCell key={i} img={img} i={i} cellStyle={cellStyle} />;
            })}
          </div>
        );
      }

      return (
        <div style={{ position: "relative" }}>
          <EditorHideOverlay hideDesktop={hideDesktop} hideTablet={hideTablet} hideMobile={hideMobile} />
          {content}
        </div>
      );
    },
  },
};

export const previewConfig: Config<Props, RootProps> = {
  root: {
    render: ({ children }) => <>{children}</>,
  },

  components: commonComponents,
};

// ─── Image Component ──────────────────────────────────────────────────────


// ─── Spacer Component ────────────────────────────────────────────────────────


// ─── Button Component ─────────────────────────────────────────────────────────


// ─── Divider Component ────────────────────────────────────────────────────────


// ─── Video Upload Field ───────────────────────────────────────────────────────


// ─── Video Component ──────────────────────────────────────────────────────────


// ─── Social Icons Component ───────────────────────────────────────────────────


// ─── Share Buttons Component ──────────────────────────────────────────────────


// ─── Star Rating Component ────────────────────────────────────────────────────


// ─── Progress Bar Component ───────────────────────────────────────────────────


// ─── Alert Component ──────────────────────────────────────────────────────────


// ─── Block Quote Component ────────────────────────────────────────────────────


// ─── Layout Block ─────────────────────────────────────────────────────────────

// ─── Container Block (Elementor-style) ────────────────────────────────────────


// ─── Grid Block ───────────────────────────────────────────────────────────────


// ─── Section Block (Container + Grid combined) ────────────────────────────────
// One drag gives a full-width section wrapper (Container styling) with a
// columned inner grid (Grid layout). All Container and Grid settings unified.

const SectionBlockComponent = {
  label: "Section",
  fields: {
    _tabs: {
      type: "custom",
      label: "",
      render: ({ value: _v, onChange: _onChange }: any) => {
        const { selectedItem, appState, dispatch } = usePuck();
        const props = selectedItem?.props ?? {};
        const set = (key: string, val: any) => {
          if (!selectedItem) return;
          const state = appState.data;
          let destinationZone = "root:default-zone", destinationIndex = 0;
          const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
          for (const [zone, items] of Object.entries(zones)) {
            const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
            if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
          }
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
        };

        return (
          <BlockTabBar blockKey="SectionBlock">
            {(tab) => (
              <>
                {/* ── LAYOUT TAB ── */}
                {tab === "content" && (
                  <>
                    <TabSection title="Section" />
                    <InlineSelect
                      label="Content Width"
                      value={props.contentWidth ?? "boxed"}
                      onChange={(v) => set("contentWidth", v)}
                      options={[{ value: "boxed", label: "Boxed" }, { value: "full", label: "Full Width" }]}
                    />
                    {props.contentWidth === "boxed" && (
                      <SliderNumberField label="Max Width" value={props.containerWidth ?? 1140} onChange={(v) => set("containerWidth", v)} min={320} max={1920} step={10} unit="PX" />
                    )}
                    <SliderNumberField label="Min Height" value={props.minHeightPx ?? 0} onChange={(v) => set("minHeightPx", v)} min={0} max={1200} step={10} unit="PX" />
                  </>
                )}

                {/* ── STYLE TAB (background, border, shadow, dividers) ── */}
                {tab === "style" && (
                  <>
                    <TabSection title="Background" />
                    <InlineSelect label="Type" value={props.bgType ?? "none"} onChange={(v) => set("bgType", v)} options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }, { value: "gradient", label: "Gradient" }, { value: "image", label: "Image" }, { value: "video", label: "Video" }]} />
                    {props.bgType === "color" && <ColorPickerField label="Color" value={props.bgColor ?? ""} onChange={(v) => set("bgColor", v)} />}
                    {props.bgType === "gradient" && (
                      <>
                        <ColorPickerField label="Start Color" value={props.bgGrad1 ?? ""} onChange={(v) => set("bgGrad1", v)} />
                        <ColorPickerField label="End Color" value={props.bgGrad2 ?? ""} onChange={(v) => set("bgGrad2", v)} />
                        <InlineSelect label="Direction" value={props.bgGradDir ?? "to bottom"} onChange={(v) => set("bgGradDir", v)} options={[{ value: "to bottom", label: "Top → Bottom" }, { value: "to right", label: "Left → Right" }, { value: "to bottom right", label: "Diagonal ↘" }, { value: "to top", label: "Bottom → Top" }]} />
                        <SliderNumberField label="Angle" value={props.bgGradAngle ?? 180} onChange={(v) => set("bgGradAngle", v)} min={0} max={360} step={1} unit="°" />
                      </>
                    )}
                    {props.bgType === "image" && (
                      <>
                        <ImageField label="Image" value={props.bgImage ?? ""} onChange={(v) => set("bgImage", v)} />
                        <InlineSelect label="Size" value={props.bgSize ?? "cover"} onChange={(v) => set("bgSize", v)} options={[{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "auto", label: "Auto" }]} />
                        <InlineSelect label="Position" value={props.bgPos ?? "center center"} onChange={(v) => set("bgPos", v)} options={[{ value: "center center", label: "Center" }, { value: "top center", label: "Top" }, { value: "bottom center", label: "Bottom" }, { value: "center left", label: "Left" }, { value: "center right", label: "Right" }]} />
                        <InlineSelect label="Repeat" value={props.bgRepeat ?? "no-repeat"} onChange={(v) => set("bgRepeat", v)} options={[{ value: "no-repeat", label: "No Repeat" }, { value: "repeat", label: "Repeat" }, { value: "repeat-x", label: "Repeat X" }, { value: "repeat-y", label: "Repeat Y" }]} />
                        <ToggleField label="Fixed (Parallax)" value={!!props.bgFixed} onChange={(v) => set("bgFixed", v)} />
                        <TabSection title="Overlay" />
                        <InlineSelect label="Overlay Type" value={props.overlayType ?? "none"} onChange={(v) => set("overlayType", v)} options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }, { value: "gradient", label: "Gradient" }]} />
                        {props.overlayType === "color" && (
                          <>
                            <ColorPickerField label="Color" value={props.overlayColor ?? "#000000"} onChange={(v) => set("overlayColor", v)} />
                            <SliderNumberField label="Opacity" value={props.overlayOpacity ?? 50} onChange={(v) => set("overlayOpacity", v)} min={0} max={100} step={1} unit="%" />
                          </>
                        )}
                        {props.overlayType === "gradient" && (
                          <>
                            <ColorPickerField label="Gradient Start" value={props.overlayGrad1 ?? "rgba(0,0,0,0.8)"} onChange={(v) => set("overlayGrad1", v)} />
                            <ColorPickerField label="Gradient End" value={props.overlayGrad2 ?? "rgba(0,0,0,0)"} onChange={(v) => set("overlayGrad2", v)} />
                          </>
                        )}
                      </>
                    )}
                    {props.bgType === "video" && (
                      <>
                        <VideoUploadField value={props.bgVideo ?? ""} onChange={(v) => set("bgVideo", v)} />
                        <ToggleField label="Loop" value={props.bgVideoLoop !== false} onChange={(v) => set("bgVideoLoop", v)} />
                        <ToggleField label="Mute" value={props.bgVideoMute !== false} onChange={(v) => set("bgVideoMute", v)} />
                        <ColorPickerField label="Fallback Color" value={props.bgColor ?? "#000"} onChange={(v) => set("bgColor", v)} />
                      </>
                    )}

                    <TabSection title="Border" />
                    <InlineSelect label="Border Type" value={props.borderStyle ?? "none"} onChange={(v) => set("borderStyle", v)} options={[{ value: "none", label: "None" }, { value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }, { value: "dotted", label: "Dotted" }]} />
                    {props.borderStyle !== "none" && (
                      <>
                        <FourSideField label="Border Width (px)" value={props.borderWidth4 ?? { top: 1, right: 1, bottom: 1, left: 1 }} onChange={(v) => set("borderWidth4", v)} />
                        <ColorPickerField label="Border Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
                      </>
                    )}
                    <FourSideField label="Border Radius (px)" value={props.borderRadius4 ?? { top: 0, right: 0, bottom: 0, left: 0 }} onChange={(v) => set("borderRadius4", v)} />


                    <TabSection title="Shape Divider" />
                    <InlineSelect label="Top" value={props.dividerTop ?? "none"} onChange={(v) => set("dividerTop", v)} options={[{ value: "none", label: "None" }, { value: "triangle", label: "Triangle" }, { value: "curve", label: "Curve" }, { value: "wave", label: "Wave" }]} />
                    {props.dividerTop !== "none" && (
                      <>
                        <ColorPickerField label="Top Color" value={props.dividerTopColor ?? "#fff"} onChange={(v) => set("dividerTopColor", v)} />
                        <SliderNumberField label="Top Height" value={props.dividerTopHeight ?? 50} onChange={(v) => set("dividerTopHeight", v)} min={10} max={300} step={5} unit="PX" />
                        <ToggleField label="Flip Horizontal" value={!!props.dividerTopFlip} onChange={(v) => set("dividerTopFlip", v)} />
                      </>
                    )}
                    <InlineSelect label="Bottom" value={props.dividerBottom ?? "none"} onChange={(v) => set("dividerBottom", v)} options={[{ value: "none", label: "None" }, { value: "triangle", label: "Triangle" }, { value: "curve", label: "Curve" }, { value: "wave", label: "Wave" }]} />
                    {props.dividerBottom !== "none" && (
                      <>
                        <ColorPickerField label="Bottom Color" value={props.dividerBottomColor ?? "#fff"} onChange={(v) => set("dividerBottomColor", v)} />
                        <SliderNumberField label="Bottom Height" value={props.dividerBottomHeight ?? 50} onChange={(v) => set("dividerBottomHeight", v)} min={10} max={300} step={5} unit="PX" />
                        <ToggleField label="Flip Horizontal" value={!!props.dividerBottomFlip} onChange={(v) => set("dividerBottomFlip", v)} />
                      </>
                    )}
                  </>
                )}

                {/* ── ADVANCED TAB ── */}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 60, right: 0, bottom: 60, left: 0 }} onChange={(v) => set("advPadding", v)} />
                    <TabSection title="Responsive" />
                    <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                    <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
                    <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />
                    <TabSection title="Motion Effects" />
                    <InlineSelect label="Entrance Animation" value={props.animation ?? "none"} onChange={(v) => set("animation", v)} options={[{ value: "none", label: "None" }, { value: "fadeIn", label: "Fade In" }, { value: "fadeInUp", label: "Fade In Up" }, { value: "fadeInDown", label: "Fade In Down" }, { value: "slideInLeft", label: "Slide In Left" }, { value: "slideInRight", label: "Slide In Right" }, { value: "zoomIn", label: "Zoom In" }]} />
                    {props.animation && props.animation !== "none" && (
                      <>
                        <SliderNumberField label="Duration (ms)" value={props.animDuration ?? 600} onChange={(v) => set("animDuration", v)} min={100} max={3000} step={100} unit="ms" />
                        <SliderNumberField label="Delay (ms)" value={props.animDelay ?? 0} onChange={(v) => set("animDelay", v)} min={0} max={3000} step={100} unit="ms" />
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </BlockTabBar>
        );
      },
    },
  },

  defaultProps: {
    // Section / container
    contentWidth: "boxed", containerWidth: 1140, minHeightPx: 0,
    // Grid
    columns: 2, columnsTablet: 1, columnsMobile: 1,
    columnGapPx: 24, rowGapPx: 24, alignItems: "stretch",
    // Background
    bgType: "none", bgColor: "", bgGrad1: "", bgGrad2: "", bgGradDir: "to bottom", bgGradAngle: 180,
    bgImage: "", bgSize: "cover", bgPos: "center center", bgRepeat: "no-repeat", bgFixed: false,
    overlayType: "none", overlayColor: "#000000", overlayOpacity: 50,
    overlayGrad1: "rgba(0,0,0,0.8)", overlayGrad2: "rgba(0,0,0,0)",
    bgVideo: "", bgVideoLoop: true, bgVideoMute: true,
    // Border
    borderStyle: "none", borderWidth4: { top: 1, right: 1, bottom: 1, left: 1 }, borderColor: "",
    borderRadius4: { top: 0, right: 0, bottom: 0, left: 0 },
    // Shadow
    // Dividers
    dividerTop: "none", dividerTopColor: "#fff", dividerTopHeight: 50, dividerTopFlip: false,
    dividerBottom: "none", dividerBottomColor: "#fff", dividerBottomHeight: 50, dividerBottomFlip: false,
    // Spacing / visibility
    advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 60, right: 0, bottom: 60, left: 0 },
    hideDesktop: false, hideTablet: false, hideMobile: false,
    // Animation
    animation: "none", animDuration: 600, animDelay: 0,
    // Custom
    cssId: "", cssClass: "", customCss: "", zIndex: null,
  },

  render: ({
    id: puckId,
    contentWidth, containerWidth, minHeightPx,
    bgType, bgColor, bgGrad1, bgGrad2, bgGradDir: _bgGradDir, bgGradAngle,
    bgImage, bgSize, bgPos, bgRepeat, bgFixed,
    overlayType, overlayColor, overlayOpacity, overlayGrad1, overlayGrad2,
    bgVideo, bgVideoLoop, bgVideoMute,
    borderStyle, borderWidth4, borderColor, borderRadius4,
    dividerTop, dividerTopColor, dividerTopHeight, dividerTopFlip,
    dividerBottom, dividerBottomColor, dividerBottomHeight, dividerBottomFlip,
    advMargin, advPadding, hideDesktop, hideTablet, hideMobile,
    animation, animDuration, animDelay,
    cssId, cssClass, customCss, zIndex,
  }: any) => {
    const uid = cssId || `pb-section-${puckId || "s"}`;
    const hideClasses = [
      hideDesktop ? "puck-hide-desktop" : "",
      hideTablet  ? "puck-hide-tablet"  : "",
      hideMobile  ? "puck-hide-mobile"  : "",
    ].filter(Boolean).join(" ");

    const br = borderRadius4 ?? { top: 0, right: 0, bottom: 0, left: 0 };
    const bw = borderWidth4  ?? { top: 1, right: 1, bottom: 1, left: 1 };

    // ── outer section wrapper (background / border / shadow) ──
    const outerStyle: React.CSSProperties = {
      position: "relative",
      overflow: "hidden",
      backgroundColor: bgType === "color" ? (bgColor || undefined) : bgType === "video" ? (bgColor || "#000") : undefined,
      background: bgType === "gradient" ? `linear-gradient(${bgGradAngle ?? 180}deg, ${bgGrad1 || "transparent"}, ${bgGrad2 || "transparent"})` : undefined,
      backgroundImage: bgType === "image" && bgImage ? `url("${bgImage}")` : undefined,
      backgroundSize: bgType === "image" ? (bgSize || "cover") : undefined,
      backgroundPosition: bgType === "image" ? (bgPos || "center center") : undefined,
      backgroundRepeat: bgType === "image" ? (bgRepeat || "no-repeat") : undefined,
      backgroundAttachment: bgType === "image" && bgFixed ? "fixed" : undefined,
      borderStyle: borderStyle !== "none" ? borderStyle : undefined,
      borderTopWidth:    borderStyle !== "none" ? (bw.top    ?? 1) : 0,
      borderRightWidth:  borderStyle !== "none" ? (bw.right  ?? 1) : 0,
      borderBottomWidth: borderStyle !== "none" ? (bw.bottom ?? 1) : 0,
      borderLeftWidth:   borderStyle !== "none" ? (bw.left   ?? 1) : 0,
      borderColor: borderStyle !== "none" ? (borderColor || "transparent") : undefined,
      borderTopLeftRadius:     br.top    ?? 0,
      borderTopRightRadius:    br.right  ?? 0,
      borderBottomRightRadius: br.bottom ?? 0,
      borderBottomLeftRadius:  br.left   ?? 0,
      minHeight: (minHeightPx && minHeightPx > 0) ? minHeightPx : undefined,
      paddingTop:    advPadding?.top    ?? 60,
      paddingRight:  advPadding?.right  ?? 0,
      paddingBottom: advPadding?.bottom ?? 60,
      paddingLeft:   advPadding?.left   ?? 0,
      marginTop:    advMargin?.top    ?? 0,
      marginRight:  advMargin?.right  ?? 0,
      marginBottom: advMargin?.bottom ?? 0,
      marginLeft:   advMargin?.left   ?? 0,
      zIndex: zIndex ?? undefined,
      boxSizing: "border-box",
    };

    // ── boxed inner wrapper ──
    const innerWrapStyle: React.CSSProperties = {
      position: "relative", zIndex: 2,
      width: "100%",
      maxWidth: contentWidth === "boxed" ? `${containerWidth || 1140}px` : undefined,
      marginLeft:  contentWidth === "boxed" ? "auto" : undefined,
      marginRight: contentWidth === "boxed" ? "auto" : undefined,
      boxSizing: "border-box",
    };

    // ── shape divider renderer ──
    const renderDivider = (type: string, color: string, height: number, flip: boolean, pos: "top" | "bottom") => {
      const paths: Record<string, string> = {
        triangle: "M0,0 L50,100 L100,0 Z",
        curve:    "M0,100 Q50,0 100,100 Z",
        wave:     "M0,60 C20,100 40,0 60,60 C80,120 100,20 100,60 L100,100 L0,100 Z",
      };
      if (!paths[type]) return null;
      return (
        <div style={{ position: "absolute", [pos]: 0, left: 0, right: 0, zIndex: 3, height: height || 50, overflow: "hidden", transform: flip ? "scaleX(-1)" : undefined }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
            <path d={paths[type]} fill={color || "#fff"} />
          </svg>
        </div>
      );
    };

    // ── animation keyframes ──
    const fromMap: Record<string, string> = {
      fadeIn:      "opacity:0",
      fadeInUp:    "opacity:0;transform:translateY(30px)",
      fadeInDown:  "opacity:0;transform:translateY(-30px)",
      slideInLeft: "opacity:0;transform:translateX(-40px)",
      slideInRight:"opacity:0;transform:translateX(40px)",
      zoomIn:      "opacity:0;transform:scale(0.9)",
    };
    const animCss = (animation && animation !== "none" && fromMap[animation]) ? `
      @keyframes puck-sec-${animation} { from{${fromMap[animation]}} to{opacity:1;transform:none} }
      #${uid}{animation:puck-sec-${animation} ${animDuration ?? 600}ms ease ${animDelay ?? 0}ms both;}
    ` : "";

    return (
      <div
        id={uid}
        className={[cssClass].filter(Boolean).join(" ") || undefined}
        style={outerStyle}
      >
        {/* CSS */}
        {(animCss || customCss) && (
          <style>{`${animCss}${customCss || ""}`}</style>
        )}

        {/* Background video */}
        {bgType === "video" && bgVideo && (
          <video autoPlay loop={bgVideoLoop !== false} muted={bgVideoMute !== false} playsInline
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
            src={bgVideo}
          />
        )}

        {/* Overlay */}
        {bgType === "image" && overlayType === "color" && overlayOpacity > 0 && (
          <div style={{ position: "absolute", inset: 0, zIndex: 1, backgroundColor: overlayColor || "#000", opacity: (overlayOpacity || 0) / 100 }} />
        )}
        {bgType === "image" && overlayType === "gradient" && (
          <div style={{ position: "absolute", inset: 0, zIndex: 1, background: `linear-gradient(to bottom, ${overlayGrad1 || "rgba(0,0,0,0.8)"}, ${overlayGrad2 || "rgba(0,0,0,0)"})` }} />
        )}

        {/* Shape dividers */}
        {dividerTop    !== "none" && renderDivider(dividerTop,    dividerTopColor,    dividerTopHeight,    !!dividerTopFlip,    "top")}
        {dividerBottom !== "none" && renderDivider(dividerBottom, dividerBottomColor, dividerBottomHeight, !!dividerBottomFlip, "bottom")}

        {/* Boxed inner → free-flow drop zone */}
        <div style={innerWrapStyle}>
          <DropZone zone={`section-${uid}-content`} />
        </div>
      </div>
    );
  },
};

// ─── Shared section field helpers ────────────────────────────────────────────

function makeSectionSet(dispatch: any, selectedItem: any, appState: any) {
  return (key: string, val: any) => {
    if (!selectedItem) return;
    const state = appState.data;
    let destinationZone = "root:default-zone", destinationIndex = 0;
    const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
    for (const [zone, items] of Object.entries(zones)) {
      const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
      if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
    }
    dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...selectedItem.props, [key]: val } } });
  };
}

// Shared Style tab (Background / Border / Shadow) — same controls used by Section block
function SectionStyleFields({ props, set }: { props: any; set: (k: string, v: any) => void }) {
  return (
    <>
      <TabSection title="Background" />
      <InlineSelect label="Type" value={props.bgType ?? "none"} onChange={(v) => set("bgType", v)}
        options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }, { value: "gradient", label: "Gradient" }, { value: "image", label: "Image" }, { value: "video", label: "Video" }]} />
      {props.bgType === "color" && <ColorPickerField label="Color" value={props.bgColor ?? ""} onChange={(v) => set("bgColor", v)} />}
      {props.bgType === "gradient" && (
        <>
          <ColorPickerField label="Start Color" value={props.bgGrad1 ?? ""} onChange={(v) => set("bgGrad1", v)} />
          <ColorPickerField label="End Color" value={props.bgGrad2 ?? ""} onChange={(v) => set("bgGrad2", v)} />
          <InlineSelect label="Direction" value={props.bgGradDir ?? "to bottom"} onChange={(v) => set("bgGradDir", v)}
            options={[{ value: "to bottom", label: "Top → Bottom" }, { value: "to right", label: "Left → Right" }, { value: "to bottom right", label: "Diagonal ↘" }, { value: "to top", label: "Bottom → Top" }]} />
          <SliderNumberField label="Angle" value={props.bgGradAngle ?? 180} onChange={(v) => set("bgGradAngle", v)} min={0} max={360} step={1} unit="°" />
        </>
      )}
      {props.bgType === "image" && (
        <>
          <ImageField label="Background Image" value={props.bgImage ?? ""} onChange={(v) => set("bgImage", v)} />
          <InlineSelect label="Size" value={props.bgSize ?? "cover"} onChange={(v) => set("bgSize", v)}
            options={[{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "auto", label: "Auto" }]} />
          <InlineSelect label="Position" value={props.bgPos ?? "center center"} onChange={(v) => set("bgPos", v)}
            options={[{ value: "center center", label: "Center" }, { value: "top center", label: "Top" }, { value: "bottom center", label: "Bottom" }]} />
          <ToggleField label="Fixed (Parallax)" value={!!props.bgFixed} onChange={(v) => set("bgFixed", v)} />
          <TabSection title="Overlay" />
          <InlineSelect label="Overlay" value={props.overlayType ?? "none"} onChange={(v) => set("overlayType", v)}
            options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }]} />
          {props.overlayType === "color" && (
            <>
              <ColorPickerField label="Overlay Color" value={props.overlayColor ?? "#000000"} onChange={(v) => set("overlayColor", v)} />
              <SliderNumberField label="Opacity" value={props.overlayOpacity ?? 50} onChange={(v) => set("overlayOpacity", v)} min={0} max={100} step={1} unit="%" />
            </>
          )}
        </>
      )}
      {props.bgType === "video" && (
        <>
          <VideoUploadField value={props.bgVideo ?? ""} onChange={(v) => set("bgVideo", v)} />
          <ToggleField label="Loop" value={props.bgVideoLoop !== false} onChange={(v) => set("bgVideoLoop", v)} />
          <ToggleField label="Mute" value={props.bgVideoMute !== false} onChange={(v) => set("bgVideoMute", v)} />
          <ColorPickerField label="Fallback Color" value={props.bgColor ?? "#000"} onChange={(v) => set("bgColor", v)} />
        </>
      )}
      <TabSection title="Border" />
      <InlineSelect label="Style" value={props.borderStyle ?? "none"} onChange={(v) => set("borderStyle", v)}
        options={[{ value: "none", label: "None" }, { value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }, { value: "dotted", label: "Dotted" }]} />
      {props.borderStyle !== "none" && (
        <>
          <SliderNumberField label="Width (px)" value={props.borderWidth ?? 1} onChange={(v) => set("borderWidth", v)} min={1} max={20} step={1} unit="px" />
          <ColorPickerField label="Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
          <SliderNumberField label="Radius (px)" value={props.borderRadius ?? 0} onChange={(v) => set("borderRadius", v)} min={0} max={100} step={1} unit="px" />
        </>
      )}
    </>
  );
}

// Shared Advanced tab (Layout / Spacing / Columns / Responsive / Animation / Custom)
function SectionAdvancedFields({ props, set }: { props: any; set: (k: string, v: any) => void }) {
  return (
    <>
      <TabSection title="Layout" />
      <InlineSelect label="Content Width" value={props.contentWidth ?? "boxed"} onChange={(v) => set("contentWidth", v)}
        options={[{ value: "boxed", label: "Boxed" }, { value: "full", label: "Full Width" }]} />
      {props.contentWidth === "boxed" && <SliderNumberField label="Max Width" value={props.containerWidth ?? 1140} onChange={(v) => set("containerWidth", v)} min={320} max={1920} step={10} unit="PX" />}
      <SliderNumberField label="Min Height" value={props.minHeightPx ?? 0} onChange={(v) => set("minHeightPx", v)} min={0} max={1200} step={10} unit="PX" />
      <TabSection title="Spacing" />
      <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 60, right: 0, bottom: 60, left: 0 }} onChange={(v) => set("advPadding", v)} />
      <FourSideField label="Margin (px)" value={props.advMargin ?? { top: 0, right: 0, bottom: 0, left: 0 }} onChange={(v) => set("advMargin", v)} />
      <TabSection title="Columns" />
      <InlineSelect label="Desktop" value={String(props.columns ?? 1)} onChange={(v) => set("columns", Number(v))}
        options={[{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "6", label: "6" }]} />
      <InlineSelect label="Tablet" value={String(props.columnsTablet ?? 1)} onChange={(v) => set("columnsTablet", Number(v))}
        options={[{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }]} />
      <InlineSelect label="Mobile" value={String(props.columnsMobile ?? 1)} onChange={(v) => set("columnsMobile", Number(v))}
        options={[{ value: "1", label: "1" }, { value: "2", label: "2" }]} />
      <SliderNumberField label="Column Gap" value={props.columnGapPx ?? 32} onChange={(v) => set("columnGapPx", v)} min={0} max={120} step={4} unit="PX" />
      <SliderNumberField label="Row Gap" value={props.rowGapPx ?? 32} onChange={(v) => set("rowGapPx", v)} min={0} max={120} step={4} unit="PX" />
      <TabSection title="Responsive" />
      <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
      <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
      <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />
      <TabSection title="Animation" />
      <InlineSelect label="Entrance" value={props.animation ?? "none"} onChange={(v) => set("animation", v)}
        options={[{ value: "none", label: "None" }, { value: "fadeIn", label: "Fade In" }, { value: "fadeInUp", label: "Fade In Up" }, { value: "fadeInDown", label: "Fade In Down" }, { value: "slideInLeft", label: "Slide In Left" }, { value: "slideInRight", label: "Slide In Right" }, { value: "zoomIn", label: "Zoom In" }]} />
      {props.animation && props.animation !== "none" && (
        <>
          <SliderNumberField label="Duration (ms)" value={props.animDuration ?? 600} onChange={(v) => set("animDuration", v)} min={100} max={3000} step={100} unit="ms" />
          <SliderNumberField label="Delay (ms)" value={props.animDelay ?? 0} onChange={(v) => set("animDelay", v)} min={0} max={3000} step={100} unit="ms" />
        </>
      )}
    </>
  );
}

// Builds the fields object for any section template
function makeSectionFields(blockKey: string, contentRender: (props: any, set: (k: string, v: any) => void) => React.ReactNode) {
  return {
    _tabs: {
      type: "custom" as const,
      label: "",
      render: (_: any) => {
        const { selectedItem, appState, dispatch } = usePuck();
        const props = selectedItem?.props ?? {};
        const set = makeSectionSet(dispatch, selectedItem, appState);
        return (
          <BlockTabBar blockKey={blockKey}>
            {(tab) => (
              <>
                {tab === "content" && (
                  <>{contentRender(props, set)}</>
                )}
                {tab === "style" && (
                  <SectionStyleFields props={props} set={set} />
                )}
                {tab === "advanced" && (
                  <SectionAdvancedFields props={props} set={set} />
                )}
              </>
            )}
          </BlockTabBar>
        );
      },
    },
  };
}

// ─── Section canvas render helpers ───────────────────────────────────────────

// SectionCanvasWrap — renders the outer section shell and passes the stable
// uid down via React context so every SectionDZ inside can derive a unique,
// per-instance zone name.
const SectionUidCtx = createContext<string>("x");

function SectionCanvasWrap({ props, children }: { props: any; children: React.ReactNode }) {
  // Derive a stable uid from the Puck-assigned block id (never Math.random).
  const uid = props.cssId || `st-${(props.id || "x").slice(-8)}`;
  const bg =
    props.bgType === "gradient" && props.bgGrad1 && props.bgGrad2
      ? `linear-gradient(${props.bgGradAngle ?? 180}deg, ${props.bgGrad1}, ${props.bgGrad2})`
      : undefined;
  return (
    <SectionUidCtx.Provider value={uid}>
      <div id={uid} style={{
        position: "relative", overflow: "hidden",
        backgroundColor: props.bgType === "color" ? props.bgColor || undefined : undefined,
        background: bg,
        backgroundImage: props.bgType === "image" && props.bgImage ? `url("${props.bgImage}")` : undefined,
        backgroundSize: "cover", backgroundPosition: "center center",
        minHeight: props.minHeightPx > 0 ? props.minHeightPx : undefined,
        paddingTop: props.advPadding?.top ?? 60, paddingBottom: props.advPadding?.bottom ?? 60,
        paddingLeft: props.advPadding?.left ?? 0, paddingRight: props.advPadding?.right ?? 0,
        marginTop: props.advMargin?.top ?? 0, marginBottom: props.advMargin?.bottom ?? 0,
        boxSizing: "border-box",
      }}>
        {props.bgType === "video" && props.bgVideo && (
          <video autoPlay loop={props.bgVideoLoop !== false} muted={props.bgVideoMute !== false} playsInline
            src={props.bgVideo} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
        )}
        <div style={{ position: "relative", zIndex: 1, maxWidth: props.contentWidth === "boxed" ? `${props.containerWidth || 1140}px` : undefined, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
          {children}
        </div>
      </div>
    </SectionUidCtx.Provider>
  );
}

// SectionDZ — slot is a stable numeric index (0,1,2…) unique within each
// section template render. The zone name combines the block uid + slot so
// every instance on the page has completely independent DropZones.
function SectionDZ({ slot, label, icon, hint, minH = 80 }: { slot: number; label: string; icon?: string; hint?: string; minH?: number }) {
  const uid = useContext(SectionUidCtx);
  const zone = `${uid}-s${slot}`;
  return (
    <div style={{ position: "relative", minHeight: minH }}>
      <div style={{ position: "absolute", inset: 0, border: "2px dashed #d1d5db", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "10px 8px", background: "rgba(248,250,252,0.9)", color: "#9ca3af", pointerEvents: "none", zIndex: 0, boxSizing: "border-box" }}>
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
        <span style={{ fontSize: 11, fontWeight: 700, textAlign: "center", color: "#6b7280" }}>{label}</span>
        {hint && <span style={{ fontSize: 10, textAlign: "center", color: "#9ca3af", lineHeight: 1.3 }}>{hint}</span>}
      </div>
      <div style={{ position: "relative", zIndex: 1, minHeight: minH }}><DropZone zone={zone} /></div>
    </div>
  );
}

function SecGrid({ cols, gap = 32, children }: { cols: number; gap?: number; children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap, alignItems: "stretch" }}>{children}</div>;
}

// ─── Base defaultProps shared by section templates ────────────────────────────

function baseSectionProps(overrides: Record<string, unknown> = {}) {
  return {
    contentWidth: "boxed", containerWidth: 1140, minHeightPx: 0,
    columns: 1, columnsTablet: 1, columnsMobile: 1, columnGapPx: 32, rowGapPx: 32,
    bgType: "none", bgColor: "", bgGrad1: "", bgGrad2: "", bgGradDir: "to bottom", bgGradAngle: 180,
    bgImage: "", bgSize: "cover", bgPos: "center center", bgRepeat: "no-repeat", bgFixed: false,
    overlayType: "none", overlayColor: "#000000", overlayOpacity: 50,
    bgVideo: "", bgVideoLoop: true, bgVideoMute: true,
    borderStyle: "none", borderWidth: 1, borderColor: "", borderRadius: 0,
    advMargin: { top: 0, right: 0, bottom: 0, left: 0 },
    advPadding: { top: 60, right: 0, bottom: 60, left: 0 },
    hideDesktop: false, hideTablet: false, hideMobile: false,
    animation: "none", animDuration: 600, animDelay: 0,
    cssId: "", cssClass: "", zIndex: null,
    ...overrides,
  };
}

// ─── Section Template Components ─────────────────────────────────────────────

export const sectionTemplateConfig: Record<string, any> = {

  // ── Hero ──────────────────────────────────────────────────────────────────
  Section_Hero: {
    label: "Hero",
    fields: makeSectionFields("Section_Hero", (p, set) => (
      <>
        <TabSection title="Content" />
        <StackedTextField label="Badge" value={p.badge ?? ""} onChange={(v) => set("badge", v)} placeholder="e.g. New · Sale · Featured" />
        <StackedTextField label="Headline" value={p.title ?? ""} onChange={(v) => set("title", v)} placeholder="Your Page Headline" />
        <StackedTextField label="Subtext" value={p.subtitle ?? ""} onChange={(v) => set("subtitle", v)} placeholder="Short supporting tagline" />
        <TabSection title="Primary Button" />
        <StackedTextField label="Label" value={p.primaryLabel ?? ""} onChange={(v) => set("primaryLabel", v)} placeholder="Get Started" />
        <LinkUrlField label="URL" value={p.primaryUrl ?? ""} onChange={(v) => set("primaryUrl", v)} />
        <TabSection title="Secondary Button" />
        <StackedTextField label="Label" value={p.secondaryLabel ?? ""} onChange={(v) => set("secondaryLabel", v)} placeholder="Learn More (leave blank to hide)" />
        <LinkUrlField label="URL" value={p.secondaryUrl ?? ""} onChange={(v) => set("secondaryUrl", v)} />
        <TabSection title="Image" />
        <ImageField label="Hero Image" value={p.imageUrl ?? ""} onChange={(v) => set("imageUrl", v)} />
        <StackedTextField label="Alt Text" value={p.imageAlt ?? ""} onChange={(v) => set("imageAlt", v)} placeholder="Describe the image" />
        <TabSection title="Layout" />
        <InlineSelect label="Layout" value={p.heroLayout ?? "split"} onChange={(v) => set("heroLayout", v)}
          options={[{ value: "split", label: "Text + Image" }, { value: "centered", label: "Centered" }, { value: "image-bg", label: "Image Background" }]} />
        <AlignField label="Text Align" value={p.alignment ?? "text-left"} onChange={(v) => set("alignment", v)} />
        {p.heroLayout === "image-bg" && (
          <SliderNumberField label="Overlay Opacity" value={p.overlayOpacity ?? 40} onChange={(v) => set("overlayOpacity", v)} min={0} max={90} step={5} unit="%" />
        )}
      </>
    )),
    defaultProps: baseSectionProps({
      columns: 1, columnsTablet: 1,
      advPadding: { top: 80, right: 0, bottom: 80, left: 0 },
      badge: "",
      title: "Your Headline Here",
      subtitle: "A short tagline that explains your value proposition",
      primaryLabel: "Get Started",  primaryUrl: "#",
      secondaryLabel: "Learn More", secondaryUrl: "#",
      imageUrl: "", imageAlt: "Hero image",
      alignment: "text-left",
      heroLayout: "split",
      overlayOpacity: 40,
    }),
    render: (p: any) => {
      const layout = p.heroLayout ?? "split";
      const align = (p.alignment ?? "text-left").replace("text-", "") as "left" | "center" | "right";
      const justifyContent = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
      const isCentered = layout === "centered";
      const isBg = layout === "image-bg" && !!p.imageUrl;

      const outerStyle: React.CSSProperties = {
        position: "relative",
        overflow: "hidden",
        padding: `${p.advPadding?.top ?? 80}px ${p.advPadding?.right ?? 0}px ${p.advPadding?.bottom ?? 80}px ${p.advPadding?.left ?? 0}px`,
        backgroundColor: isBg ? "#111827" : (p.bgType === "color" ? p.bgColor || "#ffffff" : "#ffffff"),
        backgroundImage: isBg ? `url("${p.imageUrl}")` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxSizing: "border-box" as const,
        minHeight: p.minHeightPx > 0 ? p.minHeightPx : undefined,
      };

      const overlayStyle: React.CSSProperties = isBg ? {
        position: "absolute", inset: 0,
        backgroundColor: `rgba(0,0,0,${(p.overlayOpacity ?? 40) / 100})`,
        zIndex: 0,
      } : {};

      const textColor = isBg ? "#ffffff" : "#111827";
      const subtitleColor = isBg ? "rgba(255,255,255,0.85)" : "#6b7280";

      const textBlock = (
        <div style={{ position: "relative", zIndex: 1, textAlign: align, maxWidth: isCentered ? 720 : "100%", margin: isCentered ? "0 auto" : undefined }}>
          {p.badge && (
            <span style={{ display: "inline-block", background: "#005bd3", color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 4, marginBottom: 16, letterSpacing: "0.04em" }}>
              {p.badge}
            </span>
          )}
          <h1 style={{ fontSize: "clamp(1.75rem,4vw,3rem)", fontWeight: 800, color: textColor, lineHeight: 1.2, margin: "0 0 16px" }}>
            {p.title || "Your Headline Here"}
          </h1>
          {p.subtitle && (
            <p style={{ fontSize: "1.1rem", color: subtitleColor, lineHeight: 1.6, margin: "0 0 32px", maxWidth: 560, marginLeft: align === "center" ? "auto" : undefined, marginRight: align === "right" || align === "center" ? "auto" : undefined }}>
              {p.subtitle}
            </p>
          )}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent }}>
            {p.primaryLabel && (
              <a href={p.primaryUrl || "#"} style={{ display: "inline-block", background: "#005bd3", color: "#fff", padding: "12px 28px", borderRadius: 6, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
                {p.primaryLabel}
              </a>
            )}
            {p.secondaryLabel && (
              <a href={p.secondaryUrl || "#"} style={{ display: "inline-block", background: "transparent", color: isBg ? "#fff" : "#005bd3", padding: "12px 28px", borderRadius: 6, fontWeight: 600, fontSize: 15, textDecoration: "none", border: `2px solid ${isBg ? "rgba(255,255,255,0.6)" : "#005bd3"}` }}>
                {p.secondaryLabel}
              </a>
            )}
          </div>
        </div>
      );

      const imageBlock = p.imageUrl && !isBg ? (
        <div style={{ position: "relative", zIndex: 1, flex: "0 0 auto" }}>
          <img src={p.imageUrl} alt={p.imageAlt || ""} style={{ width: "100%", maxWidth: 520, borderRadius: 12, objectFit: "cover", display: "block" }} />
        </div>
      ) : null;

      const imagePlaceholder = !p.imageUrl && layout === "split" ? (
        <div style={{ flex: "0 0 auto", width: "100%", maxWidth: 520, minHeight: 300, background: "#f1f5f9", borderRadius: 12, border: "2px dashed #cbd5e1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#94a3b8" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Upload hero image</span>
          <span style={{ fontSize: 11 }}>Set in Content → Hero Image</span>
        </div>
      ) : null;

      if (isBg) {
        return (
          <div style={outerStyle}>
            <div style={overlayStyle} />
            <div style={{ position: "relative", zIndex: 1, maxWidth: 1140, margin: "0 auto", padding: "0 24px", boxSizing: "border-box" }}>
              {textBlock}
            </div>
          </div>
        );
      }

      if (isCentered) {
        return (
          <div style={outerStyle}>
            <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px", boxSizing: "border-box" }}>
              {textBlock}
            </div>
          </div>
        );
      }

      // Split layout
      return (
        <div style={outerStyle}>
          <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px", boxSizing: "border-box", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            {textBlock}
            {imageBlock || imagePlaceholder}
          </div>
        </div>
      );
    },
  },

  // ── About ─────────────────────────────────────────────────────────────────
  Section_About: {
    label: "About",
    fields: makeSectionFields("Section_About", (p, set) => (
      <>
        <TabSection title="Content" />
        <StackedTextField label="Badge" value={p.badge ?? ""} onChange={(v) => set("badge", v)} placeholder="About Us" />
        <StackedTextField label="Heading" value={p.title ?? ""} onChange={(v) => set("title", v)} placeholder="Who We Are" />
        <StackedTextField label="Subheading" value={p.subtitle ?? ""} onChange={(v) => set("subtitle", v)} placeholder="Our story and mission" />
        <StackedTextField label="Description" value={p.description ?? ""} onChange={(v) => set("description", v)} placeholder="A few sentences about your company…" />
        <TabSection title="Image" />
        <ImageField label="Image" value={p.imageUrl ?? ""} onChange={(v) => set("imageUrl", v)} />
        <StackedTextField label="Alt Text" value={p.imageAlt ?? ""} onChange={(v) => set("imageAlt", v)} placeholder="About image" />
        <InlineSelect label="Image Position" value={p.imagePosition ?? "left"} onChange={(v) => set("imagePosition", v)}
          options={[{ value: "left", label: "Image Left" }, { value: "right", label: "Image Right" }]} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 2, columnsTablet: 1, advPadding: { top: 80, right: 0, bottom: 80, left: 0 }, badge: "About Us", title: "Who We Are", subtitle: "Our story and mission", description: "", imageUrl: "", imageAlt: "About image", imagePosition: "left" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SecGrid cols={2} gap={48}>
          {p.imagePosition !== "right"
            ? <>{p.imageUrl ? <img src={p.imageUrl} alt={p.imageAlt || ""} style={{ width: "100%", borderRadius: 8, objectFit: "cover", maxHeight: 400 }} /> : <SectionDZ slot={0} label="About image" icon="🖼" minH={240} hint="Drop Image block" />}<SectionDZ slot={1} label={`${p.badge || "About Us"} — heading, text, stats`} icon="👤" minH={240} hint="Drop Heading, Text, Icon blocks" /></>
            : <><SectionDZ slot={1} label={`${p.badge || "About Us"} — heading, text, stats`} icon="👤" minH={240} hint="Drop Heading, Text, Icon blocks" />{p.imageUrl ? <img src={p.imageUrl} alt={p.imageAlt || ""} style={{ width: "100%", borderRadius: 8, objectFit: "cover", maxHeight: 400 }} /> : <SectionDZ slot={0} label="About image" icon="🖼" minH={240} hint="Drop Image block" />}</>}
        </SecGrid>
      </SectionCanvasWrap>
    ),
  },

  // ── Gallery ───────────────────────────────────────────────────────────────
  Section_Gallery: {
    label: "Gallery",
    fields: makeSectionFields("Section_Gallery", (p, set) => (
      <>
        <TabSection title="Heading" />
        <ToggleField label="Show Heading" value={p.showHeading !== false} onChange={(v) => set("showHeading", v)} />
        {p.showHeading !== false && <><StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Our Gallery" /><StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="A short description" /></>}
        <TabSection title="Grid" />
        <InlineSelect label="Columns" value={String(p.galleryColumns ?? 3)} onChange={(v) => set("galleryColumns", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }]} />
        <SliderNumberField label="Gap (px)" value={p.gap ?? 12} onChange={(v) => set("gap", v)} min={0} max={60} step={2} unit="px" />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 2, advPadding: { top: 60, right: 0, bottom: 60, left: 0 }, sectionTitle: "Our Gallery", sectionSubtitle: "", galleryColumns: 3, gap: 12, showHeading: true }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        {p.showHeading !== false && <SectionDZ slot={0} label={p.sectionTitle || "Gallery heading"} icon="H" minH={60} hint="Drop Heading block" />}
        <div style={{ marginTop: 20 }}>
          <SecGrid cols={3} gap={p.gap ?? 12}><SectionDZ slot={1} label="Image 1" icon="🖼" minH={130} /><SectionDZ slot={2} label="Image 2" icon="🖼" minH={130} /><SectionDZ slot={3} label="Image 3" icon="🖼" minH={130} /></SecGrid>
        </div>
        <div style={{ marginTop: p.gap ?? 12 }}>
          <SecGrid cols={4} gap={p.gap ?? 12}><SectionDZ slot={4} label="Image 4" icon="🖼" minH={90} /><SectionDZ slot={5} label="Image 5" icon="🖼" minH={90} /><SectionDZ slot={6} label="Image 6" icon="🖼" minH={90} /><SectionDZ slot={7} label="Image 7" icon="🖼" minH={90} /></SecGrid>
        </div>
      </SectionCanvasWrap>
    ),
  },

  // ── Testimonial ───────────────────────────────────────────────────────────
  Section_Testimonial: {
    label: "Testimonial",
    fields: makeSectionFields("Section_Testimonial", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="What Our Customers Say" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="Real reviews from real customers" />
        <TabSection title="Layout" />
        <InlineSelect label="Columns" value={String(p.reviewCount ?? 3)} onChange={(v) => set("reviewCount", Number(v))} options={[{ value: "1", label: "1 (Single)" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 1, bgType: "color", bgColor: "#f8fafc", advPadding: { top: 60, right: 0, bottom: 60, left: 0 }, sectionTitle: "What Our Customers Say", sectionSubtitle: "", reviewCount: 3 }),
    render: (p: any) => {
      const cols = Math.min(p.reviewCount ?? 3, 4);
      return (
        <SectionCanvasWrap props={p}>
          <SectionDZ slot={0} label={p.sectionTitle || "Testimonials heading"} icon="H" minH={60} hint="Drop Heading block" />
          <div style={{ marginTop: 24 }}>
            <SecGrid cols={cols} gap={24}>{Array.from({ length: cols }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={`Review ${i + 1} — quote, author, star rating`} icon="💬" minH={120} hint="Drop BlockQuote + StarRating" />)}</SecGrid>
          </div>
        </SectionCanvasWrap>
      );
    },
  },

  // ── Carousel ──────────────────────────────────────────────────────────────
  Section_Carousel: {
    label: "Carousel",
    fields: makeSectionFields("Section_Carousel", (p, set) => (
      <>
        <TabSection title="Marquee Bar" />
        <ToggleField label="Show Marquee Bar" value={p.showMarquee !== false} onChange={(v) => set("showMarquee", v)} />
        {p.showMarquee !== false && <><StackedTextField label="Text" value={p.marqueeText ?? ""} onChange={(v) => set("marqueeText", v)} placeholder="Announcement · " /><ColorPickerField label="Background" value={p.marqueeBg ?? "#1a1a1a"} onChange={(v) => set("marqueeBg", v)} /><ColorPickerField label="Text Color" value={p.marqueeColor ?? "#ffffff"} onChange={(v) => set("marqueeColor", v)} /></>}
        <TabSection title="Carousel" />
        <StackedTextField label="Section Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Featured" />
        <InlineSelect label="Cards Per Row" value={String(p.cardCount ?? 3)} onChange={(v) => set("cardCount", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 2, advPadding: { top: 60, right: 0, bottom: 60, left: 0 }, sectionTitle: "Featured", showMarquee: true, marqueeText: "Free shipping · New arrivals · Special offers · ", marqueeBg: "#1a1a1a", marqueeColor: "#ffffff", cardCount: 3 }),
    render: (p: any) => {
      const cols = p.cardCount ?? 3;
      return (
        <div>
          {p.showMarquee !== false && <div style={{ background: p.marqueeBg || "#1a1a1a", padding: "10px 0", overflow: "hidden" }}><div style={{ display: "flex", gap: 40, color: p.marqueeColor || "#fff", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", padding: "0 24px" }}>{Array.from({ length: 3 }).map((_, i) => <span key={i}>{p.marqueeText || "Announcement · "}</span>)}</div></div>}
          <SectionCanvasWrap props={p}>
            <SectionDZ slot={0} label={p.sectionTitle || "Section heading"} icon="H" minH={60} hint="Drop Heading block" />
            <div style={{ marginTop: 20 }}><SecGrid cols={cols} gap={20}>{Array.from({ length: cols }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={`Card ${i + 1}`} icon="🃏" minH={160} hint="Drop Image, Text, Button blocks" />)}</SecGrid></div>
          </SectionCanvasWrap>
        </div>
      );
    },
  },

  // ── Contact Form ─────────────────────────────────────────────────────────
  Section_Form: {
    label: "Contact Form",
    fields: makeSectionFields("Section_Form", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Get In Touch" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="We'd love to hear from you" />
        <TabSection title="Contact Info" />
        <StackedTextField label="Address" value={p.address ?? ""} onChange={(v) => set("address", v)} placeholder="123 Main St, City" />
        <StackedTextField label="Phone" value={p.phone ?? ""} onChange={(v) => set("phone", v)} placeholder="+1 (555) 000-0000" />
        <StackedTextField label="Email" value={p.email ?? ""} onChange={(v) => set("email", v)} placeholder="hello@company.com" />
        <TabSection title="Form" />
        <StackedTextField label="Submit Button" value={p.submitLabel ?? ""} onChange={(v) => set("submitLabel", v)} placeholder="Send Message" />
        <StackedTextField label="Success Message" value={p.successMessage ?? ""} onChange={(v) => set("successMessage", v)} placeholder="Thanks! We'll be in touch." />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 2, columnsTablet: 1, advPadding: { top: 80, right: 0, bottom: 80, left: 0 }, sectionTitle: "Get In Touch", sectionSubtitle: "", address: "", phone: "", email: "", submitLabel: "Send Message", successMessage: "Thanks! We'll be in touch shortly." }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "Contact heading"} icon="H" minH={60} hint="Drop Heading block" />
        <div style={{ marginTop: 28 }}>
          <SecGrid cols={2} gap={48}>
            <SectionDZ slot={1} label={`Contact info — ${p.address || "address"}, ${p.phone || "phone"}, ${p.email || "email"}`} icon="📍" minH={180} hint="Drop Text, Icon, SocialIcons blocks" />
            <SectionDZ slot={2} label={`Form → "${p.submitLabel || "Send Message"}"`} icon="📋" minH={180} hint="Drop Button block" />
          </SecGrid>
        </div>
      </SectionCanvasWrap>
    ),
  },

  // ── Countdown ─────────────────────────────────────────────────────────────
  Section_Countdown: {
    label: "Countdown",
    fields: makeSectionFields("Section_Countdown", (p, set) => (
      <>
        <TabSection title="Headline" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Sale Ends In" />
        <StackedTextField label="Subtext" value={p.subtext ?? ""} onChange={(v) => set("subtext", v)} placeholder="Don't miss our biggest sale" />
        <TabSection title="CTA Button" />
        <StackedTextField label="Label" value={p.ctaLabel ?? ""} onChange={(v) => set("ctaLabel", v)} placeholder="Shop Now" />
        <StackedTextField label="URL" value={p.ctaUrl ?? ""} onChange={(v) => set("ctaUrl", v)} placeholder="#" />
        <TabSection title="Progress Bar" />
        <ToggleField label="Show Progress Bar" value={p.showProgress !== false} onChange={(v) => set("showProgress", v)} />
        {p.showProgress !== false && <>
          <StackedTextField label="Label" value={p.progressLabel ?? ""} onChange={(v) => set("progressLabel", v)} placeholder="73% sold — only 27 left" />
          <SliderNumberField label="Value (%)" value={p.progressValue ?? 73} onChange={(v) => set("progressValue", v)} min={0} max={100} step={1} unit="%" />
          <ColorPickerField label="Bar Color" value={p.progressColor ?? "#ef4444"} onChange={(v) => set("progressColor", v)} />
        </>}
      </>
    )),
    defaultProps: baseSectionProps({ columns: 1, bgType: "color", bgColor: "#0f172a", advPadding: { top: 80, right: 0, bottom: 80, left: 0 }, sectionTitle: "Sale Ends In", subtext: "Don't miss our biggest sale of the year", ctaLabel: "Shop Now", ctaUrl: "#", showProgress: true, progressLabel: "73% sold — only 27 left", progressValue: 73, progressColor: "#ef4444" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 20 }}>
          <SectionDZ slot={0} label={`${p.sectionTitle || "Countdown headline"} — ${p.subtext || "subtext"}`} icon="⏱" minH={70} hint="Drop Heading & Text blocks" />
          <SecGrid cols={4} gap={12}><SectionDZ slot={1} label="Days" icon="📅" minH={80} hint="Number + label" /><SectionDZ slot={2} label="Hours" icon="🕐" minH={80} hint="Number + label" /><SectionDZ slot={3} label="Minutes" icon="⏰" minH={80} hint="Number + label" /><SectionDZ slot={4} label="Seconds" icon="⚡" minH={80} hint="Number + label" /></SecGrid>
          <SectionDZ slot={5} label={`"${p.ctaLabel || "Shop Now"}" button`} icon="⚡" minH={50} hint="Drop Button block" />
          {p.showProgress !== false && <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "12px 16px" }}><div style={{ fontSize: 12, color: "#cbd5e1", marginBottom: 6 }}>{p.progressLabel || "73% sold"}</div><div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 999, height: 8, overflow: "hidden" }}><div style={{ height: "100%", width: `${p.progressValue ?? 73}%`, background: p.progressColor || "#ef4444", borderRadius: 999 }} /></div></div>}
        </div>
      </SectionCanvasWrap>
    ),
  },

  // ── Media Carousel ────────────────────────────────────────────────────────
  Section_MediaCarousel: {
    label: "Media Carousel",
    fields: makeSectionFields("Section_MediaCarousel", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Featured Media" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="Short description" />
        <TabSection title="Carousel" />
        <StackedNumberField label="Thumbnail Count" value={p.thumbnailCount ?? 4} onChange={(v) => set("thumbnailCount", v)} min={2} max={8} step={1} />
        <ToggleField label="Autoplay" value={!!p.autoplay} onChange={(v) => set("autoplay", v)} />
        {p.autoplay && <SliderNumberField label="Interval (ms)" value={p.interval ?? 4000} onChange={(v) => set("interval", v)} min={1000} max={10000} step={500} unit="ms" />}
        <ToggleField label="Show Arrows" value={p.showArrows !== false} onChange={(v) => set("showArrows", v)} />
        <ToggleField label="Show Dots" value={p.showDots !== false} onChange={(v) => set("showDots", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 1, advPadding: { top: 60, right: 0, bottom: 60, left: 0 }, sectionTitle: "Featured Media", sectionSubtitle: "", thumbnailCount: 4, autoplay: false, interval: 4000, showArrows: true, showDots: true }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "Media carousel heading"} icon="H" minH={60} hint="Drop Heading block" />
        <div style={{ marginTop: 20 }}><SectionDZ slot={1} label="Main media — drop Image or Video block (YouTube/Vimeo/upload)" icon="🎞" minH={300} hint="Supports Image block and Video block" /></div>
        <div style={{ marginTop: 12 }}><SecGrid cols={p.thumbnailCount ?? 4} gap={8}>{Array.from({ length: p.thumbnailCount ?? 4 }).map((_, i) => <SectionDZ key={i} slot={i + 2} label={`Thumbnail ${i + 1}`} icon="🖼" minH={60} />)}</SecGrid></div>
      </SectionCanvasWrap>
    ),
  },

  // ── Services ──────────────────────────────────────────────────────────────
  Section_Services: {
    label: "Services",
    fields: makeSectionFields("Section_Services", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Our Services" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="What we offer" />
        <TabSection title="Grid" />
        <InlineSelect label="Per Row" value={String(p.serviceCount ?? 3)} onChange={(v) => set("serviceCount", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
        <ColorPickerField label="Accent Color" value={p.accentColor ?? "#005bd3"} onChange={(v) => set("accentColor", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 1, advPadding: { top: 70, right: 0, bottom: 70, left: 0 }, sectionTitle: "Our Services", sectionSubtitle: "", serviceCount: 3, accentColor: "#005bd3" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "Services heading"} icon="H" minH={60} hint="Drop Heading block" />
        <div style={{ marginTop: 28 }}><SecGrid cols={p.serviceCount ?? 3} gap={28}>{Array.from({ length: p.serviceCount ?? 3 }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={`Service ${i + 1} — icon, title, description`} icon="🔧" minH={140} hint="Drop Icon + Heading + Text" />)}</SecGrid></div>
      </SectionCanvasWrap>
    ),
  },

  // ── Pricing ───────────────────────────────────────────────────────────────
  Section_Pricing: {
    label: "Pricing",
    fields: makeSectionFields("Section_Pricing", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Simple, Transparent Pricing" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="No hidden fees" />
        <TabSection title="Tiers" />
        <InlineSelect label="Number of Tiers" value={String(p.tierCount ?? 3)} onChange={(v) => set("tierCount", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
        <StackedTextField label="Currency" value={p.currency ?? "$"} onChange={(v) => set("currency", v)} placeholder="$" />
        <ColorPickerField label="Accent Color" value={p.accentColor ?? "#005bd3"} onChange={(v) => set("accentColor", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 1, advPadding: { top: 80, right: 0, bottom: 80, left: 0 }, sectionTitle: "Simple, Transparent Pricing", sectionSubtitle: "", tierCount: 3, currency: "$", accentColor: "#005bd3" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "Pricing heading"} icon="H" minH={60} hint="Drop Heading block" />
        <div style={{ marginTop: 28 }}><SecGrid cols={p.tierCount ?? 3} gap={24}>{Array.from({ length: p.tierCount ?? 3 }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={i === 1 ? "Tier 2 — recommended / featured" : `Tier ${i + 1} — name, price, features, CTA`} icon={i === 1 ? "⭐" : "💳"} minH={200} hint="Drop Heading + Text + Button blocks" />)}</SecGrid></div>
      </SectionCanvasWrap>
    ),
  },

  // ── CTA ───────────────────────────────────────────────────────────────────
  Section_CTA: {
    label: "CTA",
    fields: makeSectionFields("Section_CTA", (p, set) => (
      <>
        <TabSection title="Content" />
        <StackedTextField label="Headline" value={p.headline ?? ""} onChange={(v) => set("headline", v)} placeholder="Ready to Get Started?" />
        <StackedTextField label="Subtext" value={p.subtext ?? ""} onChange={(v) => set("subtext", v)} placeholder="Supporting line" />
        <TabSection title="Primary Button" />
        <StackedTextField label="Label" value={p.primaryLabel ?? ""} onChange={(v) => set("primaryLabel", v)} placeholder="Start Free Trial" />
        <LinkUrlField label="URL" value={p.primaryUrl ?? ""} onChange={(v) => set("primaryUrl", v)} />
        <TabSection title="Secondary Button" />
        <StackedTextField label="Label" value={p.secondaryLabel ?? ""} onChange={(v) => set("secondaryLabel", v)} placeholder="Learn More" />
        <LinkUrlField label="URL" value={p.secondaryUrl ?? ""} onChange={(v) => set("secondaryUrl", v)} />
        <TabSection title="Layout" />
        <AlignField label="Alignment" value={p.alignment ?? "text-center"} onChange={(v) => set("alignment", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 1, bgType: "color", bgColor: "#005bd3", advPadding: { top: 80, right: 0, bottom: 80, left: 0 }, headline: "Ready to Get Started?", subtext: "Join thousands of happy customers today.", primaryLabel: "Start Free Trial", primaryUrl: "#", secondaryLabel: "Learn More", secondaryUrl: "#", alignment: "text-center" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <div style={{ textAlign: p.alignment?.replace("text-", "") as any || "center", display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionDZ slot={0} label={`"${p.headline || "CTA Headline"}" — heading & subtext`} icon="⚡" minH={80} hint="Drop Heading & Text blocks" />
          <SectionDZ slot={1} label={`Buttons — "${p.primaryLabel || "Primary"}" & "${p.secondaryLabel || "Secondary"}"`} icon="⊡" minH={50} hint="Drop Button blocks" />
        </div>
      </SectionCanvasWrap>
    ),
  },

  // ── FAQ ───────────────────────────────────────────────────────────────────
  Section_FAQ: {
    label: "FAQ",
    fields: makeSectionFields("Section_FAQ", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Frequently Asked Questions" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="Everything you need to know" />
        <TabSection title="Items" />
        <StackedNumberField label="FAQ Slots" value={p.faqCount ?? 4} onChange={(v) => set("faqCount", v)} min={1} max={12} step={1} />
        <ColorPickerField label="Accent Color" value={p.accentColor ?? "#005bd3"} onChange={(v) => set("accentColor", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 1, advPadding: { top: 70, right: 0, bottom: 70, left: 0 }, sectionTitle: "Frequently Asked Questions", sectionSubtitle: "", faqCount: 4, accentColor: "#005bd3" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "FAQ heading"} icon="H" minH={60} hint="Drop Heading block" />
        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 8 }}>{Array.from({ length: p.faqCount ?? 4 }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={`FAQ ${i + 1} — question & answer`} icon="❓" minH={52} hint="Drop Accordion block" />)}</div>
      </SectionCanvasWrap>
    ),
  },

  // ── Team ──────────────────────────────────────────────────────────────────
  Section_Team: {
    label: "Team",
    fields: makeSectionFields("Section_Team", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Meet Our Team" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="The people behind the product" />
        <TabSection title="Grid" />
        <InlineSelect label="Members Per Row" value={String(p.memberCount ?? 4)} onChange={(v) => set("memberCount", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 4, columnsTablet: 2, advPadding: { top: 70, right: 0, bottom: 70, left: 0 }, sectionTitle: "Meet Our Team", sectionSubtitle: "", memberCount: 4 }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "Team heading"} icon="H" minH={60} hint="Drop Heading block" />
        <div style={{ marginTop: 28 }}><SecGrid cols={p.memberCount ?? 4} gap={24}>{Array.from({ length: p.memberCount ?? 4 }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={`Member ${i + 1} — photo, name, role, bio`} icon="👤" minH={160} hint="Drop Image + Heading + Text" />)}</SecGrid></div>
      </SectionCanvasWrap>
    ),
  },

  // ── Logo Row ──────────────────────────────────────────────────────────────
  Section_Logos: {
    label: "Logo Row",
    fields: makeSectionFields("Section_Logos", (p, set) => (
      <>
        <TabSection title="Label" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Trusted By" />
        <TabSection title="Logos" />
        <StackedNumberField label="Logo Count" value={p.logoCount ?? 6} onChange={(v) => set("logoCount", v)} min={2} max={12} step={1} />
        <ToggleField label="Grayscale" value={p.grayscale !== false} onChange={(v) => set("grayscale", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 6, columnsTablet: 3, bgType: "color", bgColor: "#f8fafc", advPadding: { top: 40, right: 0, bottom: 40, left: 0 }, sectionTitle: "Trusted By", logoCount: 6, grayscale: true }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "'Trusted by' label"} icon="🏷" minH={40} hint="Drop Heading block (small)" />
        <div style={{ marginTop: 16 }}><SecGrid cols={Math.min(p.logoCount ?? 6, 6)} gap={16}>{Array.from({ length: p.logoCount ?? 6 }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={`Logo ${i + 1}`} icon="🏷" minH={50} hint="Drop Image block" />)}</SecGrid></div>
      </SectionCanvasWrap>
    ),
  },

  // ── Features ──────────────────────────────────────────────────────────────
  Section_Features: {
    label: "Features",
    fields: makeSectionFields("Section_Features", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Why Choose Us" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="What makes us different" />
        <TabSection title="Grid" />
        <InlineSelect label="Per Row" value={String(p.featureCount ?? 3)} onChange={(v) => set("featureCount", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
        <ColorPickerField label="Accent Color" value={p.accentColor ?? "#005bd3"} onChange={(v) => set("accentColor", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 1, bgType: "color", bgColor: "#f8fafc", advPadding: { top: 70, right: 0, bottom: 70, left: 0 }, sectionTitle: "Why Choose Us", sectionSubtitle: "", featureCount: 3, accentColor: "#005bd3" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "Features heading"} icon="H" minH={60} hint="Drop Heading block" />
        <div style={{ marginTop: 28 }}><SecGrid cols={p.featureCount ?? 3} gap={32}>{Array.from({ length: p.featureCount ?? 3 }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={`Feature ${i + 1} — icon, title, description`} icon="✅" minH={130} hint="Drop Icon + Heading + Text" />)}</SecGrid></div>
      </SectionCanvasWrap>
    ),
  },

  // ── Newsletter ────────────────────────────────────────────────────────────
  Section_Newsletter: {
    label: "Newsletter",
    fields: makeSectionFields("Section_Newsletter", (p, set) => (
      <>
        <TabSection title="Content" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Stay in the Loop" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="Get the latest updates" />
        <TabSection title="Form" />
        <StackedTextField label="Input Placeholder" value={p.placeholder ?? ""} onChange={(v) => set("placeholder", v)} placeholder="Enter your email address" />
        <StackedTextField label="Button Label" value={p.buttonLabel ?? ""} onChange={(v) => set("buttonLabel", v)} placeholder="Subscribe" />
        <StackedTextField label="Disclaimer" value={p.disclaimer ?? ""} onChange={(v) => set("disclaimer", v)} placeholder="No spam. Unsubscribe anytime." />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 1, bgType: "color", bgColor: "#eff6ff", advPadding: { top: 60, right: 0, bottom: 60, left: 0 }, sectionTitle: "Stay in the Loop", sectionSubtitle: "Get the latest updates delivered to your inbox.", placeholder: "Enter your email address", buttonLabel: "Subscribe", disclaimer: "" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", gap: 12 }}>
          <SectionDZ slot={0} label={p.sectionTitle || "Newsletter heading"} icon="✉" minH={70} hint="Drop Heading block" />
          <SectionDZ slot={1} label={`Email input: "${p.placeholder || "Enter email"}" + "${p.buttonLabel || "Subscribe"}" button`} icon="⊡" minH={50} hint="Drop Button block" />
          {p.disclaimer && <div style={{ fontSize: 11, color: "#6b7280" }}>{p.disclaimer}</div>}
        </div>
      </SectionCanvasWrap>
    ),
  },

  // ── Video Section ─────────────────────────────────────────────────────────
  Section_Video: {
    label: "Video Section",
    fields: makeSectionFields("Section_Video", (p, set) => (
      <>
        <TabSection title="Heading" />
        <ToggleField label="Show Heading" value={p.showHeading !== false} onChange={(v) => set("showHeading", v)} />
        {p.showHeading !== false && <><StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="See It In Action" /><StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="Short intro" /></>}
        <TabSection title="Video" />
        <InlineSelect label="Source" value={p.sourceType ?? "youtube"} onChange={(v) => set("sourceType", v)} options={[{ value: "youtube", label: "YouTube" }, { value: "vimeo", label: "Vimeo" }, { value: "upload", label: "Upload / Self-hosted" }]} />
        <StackedTextField label="Video URL" value={p.videoUrl ?? ""} onChange={(v) => set("videoUrl", v)} placeholder="https://youtube.com/watch?v=…" />
        <ImageField label="Thumbnail" value={p.thumbnailUrl ?? ""} onChange={(v) => set("thumbnailUrl", v)} />
        <ToggleField label="Autoplay" value={!!p.autoplay} onChange={(v) => set("autoplay", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 1, advPadding: { top: 60, right: 0, bottom: 60, left: 0 }, sectionTitle: "See It In Action", sectionSubtitle: "", videoUrl: "", sourceType: "youtube", thumbnailUrl: "", autoplay: false, showHeading: true }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        {p.showHeading !== false && <SectionDZ slot={0} label={p.sectionTitle || "Video section heading"} icon="H" minH={60} hint="Drop Heading block" />}
        <div style={{ marginTop: 20 }}>
          {p.videoUrl
            ? <div style={{ aspectRatio: "16/9", background: "#000", borderRadius: 8, overflow: "hidden" }}><iframe src={`https://www.youtube.com/embed/${p.videoUrl.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1] ?? ""}`} style={{ width: "100%", height: "100%", border: "none" }} allowFullScreen /></div>
            : <SectionDZ slot={1} label={`Video block — paste ${p.sourceType || "YouTube"} URL or upload`} icon="🎬" minH={300} hint="Drop Video block" />}
        </div>
      </SectionCanvasWrap>
    ),
  },

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