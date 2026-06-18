// @ts-nocheck
import {
  ToggleField,
  StackedTextField,
  StackedTextareaField,
  ColorPickerField,
} from "@/puck-blocks/shared";
import {
  LinkUrlField,
} from "@/puck-blocks/block-fields";

export const GlobalFooterComponent = {
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
};
