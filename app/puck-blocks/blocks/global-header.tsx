// @ts-nocheck
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import {
  AlignField,
  ToggleField,
  StackedTextField,
  ColorPickerField,
} from "@/puck-blocks/shared";

export const GlobalHeaderComponent = {
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
};
