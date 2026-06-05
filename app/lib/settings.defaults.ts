/**
 * settings.defaults.ts
 *
 * Types and default values for GlobalSettings.
 * This file has NO Node.js / server-only imports — safe to import from
 * client components, context providers, and anywhere in the browser bundle.
 *
 * settings.server.ts imports from here for the actual read/write logic.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavLink {
  id: string;
  label: string;
  url: string;
  isActive?: boolean;
}

export interface CustomColor {
  id: string;
  name: string;
  value: string;
}

export interface HeaderSettings {
  height: string;
  backgroundColor: string;
  textColor: string;
  logo?: string;
  siteTitle: string;
  showShadow: boolean;
  showNavigation: boolean;
  navigationLinks: NavLink[];
  // Full GlobalHeader props
  backgroundImage?: string;
  textPosition?: string;
  ctaLabel?: string;
  ctaLink?: string;
  ctaStyle?: string;
  layoutStyle?: string;
}

export interface FooterSettings {
  height: string;
  backgroundColor: string;
  textColor: string;
  companyName: string;
  companyDescription: string;
  logo?: string;
  showSocialLinks: boolean;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
    youtube?: string;
  };
  quickLinks: NavLink[];
  copyrightText: string;
}

// ─── Puck Data builders ───────────────────────────────────────────────────────

export function buildHeaderData(header: HeaderSettings) {
  return {
    root: { props: { title: "" } },
    content: [
      {
        type: "GlobalHeader",
        props: {
          id: "global-header-default",
          height: header.height,
          backgroundColor: header.backgroundColor,
          textColor: header.textColor,
          siteTitle: header.siteTitle,
          logo: header.logo ?? "",
          showShadow: header.showShadow,
          showNavigation: header.showNavigation,
          navigationLinks: header.navigationLinks,
          backgroundImage: header.backgroundImage ?? "",
          textPosition: header.textPosition ?? "justify-start",
          ctaLabel: header.ctaLabel ?? "",
          ctaLink: header.ctaLink ?? "#",
          ctaStyle: header.ctaStyle ?? "primary",
          layoutStyle: header.layoutStyle ?? "default",
        },
      },
    ],
    zones: {},
  };
}

export function buildFooterData(footer: FooterSettings) {
  return {
    root: { props: { title: "" } },
    content: [
      {
        type: "GlobalFooter",
        props: {
          id: "global-footer-default",
          height: footer.height,
          backgroundColor: footer.backgroundColor,
          textColor: footer.textColor,
          companyName: footer.companyName,
          companyDescription: footer.companyDescription,
          logo: footer.logo ?? "",
          showSocialLinks: footer.showSocialLinks,
          socialLinks: footer.socialLinks,
          quickLinks: footer.quickLinks,
          copyrightText: footer.copyrightText,
        },
      },
    ],
    zones: {},
  };
}

export interface GlobalSettings {
  // ── DESIGN SYSTEM: System Colors ─────────────────────────────────────────
  theme: "light" | "dark";
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;

  // ── DESIGN SYSTEM: Custom Colors ─────────────────────────────────────────
  customColors: CustomColor[];

  // ── DESIGN SYSTEM: Fonts ────────────────────────────────────────────────
  fontFamily: string;
  headingFont: string;
  baseFontSize: string;
  lineHeight: string;
  letterSpacing: string;

  // ── THEME STYLE: Typography ──────────────────────────────────────────────
  h1Size: string;
  h2Size: string;
  h3Size: string;
  h4Size: string;
  h5Size: string;
  h6Size: string;
  headingWeight: string;
  headingLineHeight: string;

  // ── THEME STYLE: Buttons ─────────────────────────────────────────────────
  borderRadius: string;
  buttonStyle: "rounded" | "square" | "pill";
  buttonPaddingX: string;
  buttonPaddingY: string;
  buttonTextTransform: "none" | "uppercase" | "capitalize" | "lowercase";
  buttonFontWeight: string;
  buttonBorderWidth: string;

  // ── THEME STYLE: Images ──────────────────────────────────────────────────
  imageBorderRadius: string;
  imageObjectFit: "cover" | "contain" | "fill";

  // ── SETTINGS: Site Identity ──────────────────────────────────────────────
  siteTitle: string;
  siteTagline: string;
  siteLogo: string;
  favicon?: string;

  // ── SETTINGS: Background ─────────────────────────────────────────────────
  pageBackgroundType: "color" | "gradient";
  pageBackgroundGradient: string;

  // ── SETTINGS: Layout ─────────────────────────────────────────────────────
  containerWidth: string;
  columnGap: string;
  rowGap: string;

  // ── SETTINGS: Animations ─────────────────────────────────────────────────
  animationSpeed: "none" | "slow" | "normal" | "fast";
  pageTransition: "none" | "fade" | "slide-up";

  // ── INTERACTIONS: Sticky Header / Footer ────────────────────────────────
  headerSticky: boolean;
  footerSticky: boolean;
  headerTransparent: boolean;

  // ── INTERACTIONS: Button Hover ─────────────────────────────────────────
  buttonHoverEffect: "none" | "lift" | "glow" | "scale" | "fill";
  buttonShadow: "none" | "sm" | "md" | "colored";

  // ── INTERACTIONS: Image Hover ──────────────────────────────────────────
  imageHoverEffect: "none" | "zoom" | "dim" | "lift";

  // ── INTERACTIONS: Links ────────────────────────────────────────────────
  linkColor: string;
  linkHoverColor: string;
  linkDecoration: "underline" | "none" | "hover-underline";

  // ── INTERACTIONS: Shadows / Elevation ─────────────────────────────────
  cardShadow: "none" | "sm" | "md" | "lg" | "xl";

  // ── INTERACTIONS: Scroll Animations ───────────────────────────────────
  scrollAnimation: "none" | "fade-in" | "slide-up" | "zoom-in" | "slide-left" | "slide-right";
  scrollAnimationDuration: string;
  scrollAnimationDelay: string;

  // ── INTERACTIONS: Scroll-to-Top Button ────────────────────────────────
  showScrollToTop: boolean;
  scrollToTopBgColor: string;
  scrollToTopIconColor: string;

  // ── SETTINGS: Custom CSS ────────────────────────────────────────────────
  customCSS: string;

  // ── Header & Footer Color Sync ───────────────────────────────────────────
  headerColorSync: boolean;
  footerColorSync: boolean;

  // ── Header & Footer ──────────────────────────────────────────────────────
  /**
   * When true, the custom header designed in this app is injected into every
   * published page and the merchant's theme header is hidden via CSS selectors.
   * When false (default), the merchant's theme header is used as-is.
   */
  useCustomHeader: boolean;
  /** Same as useCustomHeader but for the footer. */
  useCustomFooter: boolean;
  /**
   * CSS selectors used to hide the merchant theme's native header/footer when
   * useCustomHeader / useCustomFooter is enabled. Defaults cover the most
   * common Shopify theme markup; merchants on uncommon themes can override.
   */
  hideThemeHeaderSelectors: string;
  hideThemeFooterSelectors: string;

  header: HeaderSettings;
  footer: FooterSettings;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const DEFAULT_HEADER_SETTINGS: HeaderSettings = {
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
};

export const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
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
};

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  theme: "light",
  primaryColor: "#0158ad",
  secondaryColor: "#FFD0FA",
  accentColor: "#0158ad",
  textColor: "#101010",
  backgroundColor: "#FFFFFF",

  customColors: [],

  fontFamily: "Inter, system-ui, sans-serif",
  headingFont: "Inter, system-ui, sans-serif",
  baseFontSize: "16px",
  lineHeight: "1.6",
  letterSpacing: "normal",

  h1Size: "3rem",
  h2Size: "2.25rem",
  h3Size: "1.875rem",
  h4Size: "1.5rem",
  h5Size: "1.25rem",
  h6Size: "1rem",
  headingWeight: "700",
  headingLineHeight: "1.2",

  borderRadius: "8px",
  buttonStyle: "rounded",
  buttonPaddingX: "24px",
  buttonPaddingY: "12px",
  buttonTextTransform: "none",
  buttonFontWeight: "500",
  buttonBorderWidth: "0px",

  imageBorderRadius: "8px",
  imageObjectFit: "cover",

  siteTitle: "My Page Builder",
  siteTagline: "Build beautiful pages without coding",
  siteLogo: "",
  favicon: "",

  pageBackgroundType: "color",
  pageBackgroundGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",

  containerWidth: "1200px",
  columnGap: "24px",
  rowGap: "24px",

  animationSpeed: "normal",
  pageTransition: "none",

  headerSticky: false,
  footerSticky: false,
  headerTransparent: false,

  buttonHoverEffect: "lift",
  buttonShadow: "none",

  imageHoverEffect: "none",

  linkColor: "",
  linkHoverColor: "",
  linkDecoration: "hover-underline",

  cardShadow: "none",

  scrollAnimation: "none",
  scrollAnimationDuration: "0.5s",
  scrollAnimationDelay: "0.1s",

  showScrollToTop: false,
  scrollToTopBgColor: "#0158ad",
  scrollToTopIconColor: "#ffffff",

  customCSS: "",

  headerColorSync: false,
  footerColorSync: false,

  useCustomHeader: false,
  useCustomFooter: false,
  hideThemeHeaderSelectors:
    "header, .header, .site-header, .header-wrapper, .shopify-section-header, #shopify-section-header, [id^='shopify-section-header'], [id^='shopify-section-sections--'][id*='--header'], .shopify-section-group-header-group",
  hideThemeFooterSelectors:
    "footer, .footer, .site-footer, .footer-wrapper, .shopify-section-footer, #shopify-section-footer, [id^='shopify-section-footer'], [id^='shopify-section-sections--'][id*='--footer'], .shopify-section-group-footer-group",

  header: DEFAULT_HEADER_SETTINGS,
  footer: DEFAULT_FOOTER_SETTINGS,
};
