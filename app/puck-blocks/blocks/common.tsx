// @ts-nocheck
// ─────────────────────────────────────────────────────────────────────────────
// "Common" components map — the text/content blocks plus the global-block
// placeholders. Grouped together because they were authored as a single Puck
// component map (`commonComponents`) and share the same field conventions.
//
// Members: GlobalBlock, GlobalHeader, GlobalFooter, MarqueeBar, HeadingBlock,
// Text, Article, PhotoCollage.
// ─────────────────────────────────────────────────────────────────────────────

import type * as React from "react";
import { useState } from "react";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import { usePuck } from "@my-app/puck-editor";

import { loadGoogleFont } from "@/puck-splat/utils";

import {
  AlignField,
  BlockTabBar,
  ColorPickerField,
  EditorHideOverlay,
  FourSideField,
  InlineSelect,
  SliderNumberField,
  StackedDateField,
  StackedTextareaField,
  StackedTextField,
  TabSection,
  ToggleField,
} from "@/puck-blocks/shared";

import { ImageField, LinkUrlField } from "@/puck-blocks/block-fields";

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

export { commonComponents };
