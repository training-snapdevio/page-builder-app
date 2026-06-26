export const COLOR_INPUT_STYLE: React.CSSProperties = {
  width: 36,
  height: 32,
  border: "1px solid #d1d5db",
  borderRadius: 6,
  cursor: "pointer",
  padding: 2,
  flexShrink: 0,
};

export const COLOR_SWATCH_STYLE: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 4,
  border: "1px solid #d1d5db",
  display: "inline-block",
  flexShrink: 0,
};
import {
  Columns,
  Image,
  LayoutGrid,
  Menu,
  Upload,
  Pencil,
  ReceiptText,
  WalletCards,
  Heading,
  Play,
  Minus,
  SeparatorHorizontal,
  PanelTop,
  PanelBottom,
  Sparkles,
  Maximize2,
  Palette,
  Megaphone,
  AlignLeft,
  FileText,
  Grid2x2,
  Layers,
  ListCollapse,
  Images,
  Briefcase,
  Phone,
  Star,
  Users,
  Quote,
  Share2,
  BarChart2,
  Bell,
  Globe,
  Smile,
  Timer,
  MessageSquare,
  Zap,
  HelpCircle,
  CheckSquare,
  Mail,
  Video,
  Hash,
  ImagePlay,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
export const COMPONENT_ICONS: Record<string, React.ReactNode> = {
  // Layout / structure
  Section:       <Columns size={24} strokeWidth={1.5} />,
  InnerSection:  <PanelTop size={24} strokeWidth={1.5} />,
  LayoutBlock:   <Layers size={24} strokeWidth={1.5} />,
  GridBlock:     <Grid2x2 size={24} strokeWidth={1.5} />,

  // Section templates (one card per concept in the "Sections" drawer group)
  Section_Hero:          <Sparkles    size={24} strokeWidth={1.5} />,
  Section_About:         <Users       size={24} strokeWidth={1.5} />,
  Section_Gallery:       <Images      size={24} strokeWidth={1.5} />,
  Section_Testimonial:   <MessageSquare size={24} strokeWidth={1.5} />,
  Section_Carousel:      <ImagePlay   size={24} strokeWidth={1.5} />,
  Section_Form:          <Mail        size={24} strokeWidth={1.5} />,
  Section_Countdown:     <Timer       size={24} strokeWidth={1.5} />,
  Section_MediaCarousel: <Video       size={24} strokeWidth={1.5} />,
  Section_Services:      <Briefcase   size={24} strokeWidth={1.5} />,
  Section_Pricing:       <CreditCard  size={24} strokeWidth={1.5} />,
  Section_CTA:           <Zap         size={24} strokeWidth={1.5} />,
  Section_FAQ:           <HelpCircle  size={24} strokeWidth={1.5} />,
  Section_Team:          <Users       size={24} strokeWidth={1.5} />,
  Section_Features:      <CheckSquare size={24} strokeWidth={1.5} />,
  Section_Newsletter:    <Mail        size={24} strokeWidth={1.5} />,
  Section_Video:         <Video       size={24} strokeWidth={1.5} />,
  Section_Stats:         <Hash        size={24} strokeWidth={1.5} />,

  // Chrome
  GlobalHeader: <PanelTop size={24} strokeWidth={1.5} />,
  GlobalFooter: <PanelBottom size={24} strokeWidth={1.5} />,

  // Heroes
  Hero:           <Sparkles size={24} strokeWidth={1.5} />,
  FullScreenHero: <Maximize2 size={24} strokeWidth={1.5} />,
  GradientHero:   <Palette size={24} strokeWidth={1.5} />,

  // Content
  MarqueeBar:  <Megaphone size={24} strokeWidth={1.5} />,
  HeadingBlock: <Heading size={24} strokeWidth={1.5} />,
  Heading:      <Heading size={24} strokeWidth={1.5} />,
  Text:         <AlignLeft size={24} strokeWidth={1.5} />,
  TextEditor:   <Pencil size={24} strokeWidth={1.5} />,
  Accordian:    <ListCollapse size={24} strokeWidth={1.5} />,
  Article:      <FileText size={24} strokeWidth={1.5} />,

  // Sections
  AboutSection:       <Users size={24} strokeWidth={1.5} />,
  GallerySection:     <Images size={24} strokeWidth={1.5} />,
  ServiceSection:     <Briefcase size={24} strokeWidth={1.5} />,
  ContactSection:     <Phone size={24} strokeWidth={1.5} />,
  PhotoCollage:       <Grid2x2 size={24} strokeWidth={1.5} />,
  TestimonialSection: <Star size={24} strokeWidth={1.5} />,

  // Media / basic
  ImageBlock: <Image size={24} strokeWidth={1.5} />,
  Image:      <Image size={24} strokeWidth={1.5} />,
  Video:      <Play size={24} strokeWidth={1.5} />,

  // UI
  Button:       <Upload size={24} strokeWidth={1.5} />,
  Divider:      <SeparatorHorizontal size={24} strokeWidth={1.5} />,
  Spacer:       <Minus size={24} strokeWidth={1.5} />,
  Space:        <Minus size={24} strokeWidth={1.5} />,
  Icons:        <Smile size={24} strokeWidth={1.5} />,
  SocialIcons:  <Globe size={24} strokeWidth={1.5} />,
  ShareButtons: <Share2 size={24} strokeWidth={1.5} />,
  BlockQuote:   <Quote size={24} strokeWidth={1.5} />,
  StarRating:   <Star size={24} strokeWidth={1.5} />,
  ProgressBar:  <BarChart2 size={24} strokeWidth={1.5} />,
  Alert:        <Bell size={24} strokeWidth={1.5} />,

  // Commerce
  FeaturedProduct: <ShoppingBag size={24} strokeWidth={1.5} />,

  // Legacy
  GridLayout:   <LayoutGrid size={24} strokeWidth={1.5} />,
  CardBlock:    <WalletCards size={24} strokeWidth={1.5} />,
  DoubleColumn: <Columns size={24} strokeWidth={1.5} />,
  Menu:         <Menu size={24} strokeWidth={1.5} />,
  TextIcon:     <ReceiptText size={24} strokeWidth={1.5} />,
};

export const FALLBACK_ICON = <LayoutGrid size={24} strokeWidth={1.5} />;

/**
 * Human-friendly display names for component panel items.
 * DrawerItemOverride checks this map before falling back to
 * the auto-formatted key name (e.g. "ColumnSection" → "Column Section").
 */
export const COMPONENT_LABELS: Record<string, string> = {
  GlobalHeader:        "Header",
  GlobalFooter:        "Footer",
  Hero:                "Hero Banner",
  GradientHero:        "Gradient Hero",
  MarqueeBar:          "Info Bar",
  HeadingBlock:        "Heading",
  Text:                "Text Block",
  Accordian:           "Details",
  Article:             "Article Block",
  AboutSection:        "About",
  GallerySection:      "Gallery",
  ServiceSection:      "Services",
  ContactSection:      "Contact",
  PhotoCollage:        "Photo Collage",
  TestimonialSection:  "Testimonials",
  Image:               "Image Block",
  Space:               "Spacer",
  Icons:               "Icon",
  SocialIcons:         "Social Icons",
  ShareButtons:        "Share Buttons",
  BlockQuote:          "Block Quote",
  StarRating:          "Star Rating",
  ProgressBar:         "Progress Bar",
  Alert:               "Alert",
  FeaturedProduct:     "Featured Product",
  Section:               "Section",
  LayoutBlock:           "Container",
  GridBlock:             "Grid",
  Section_Hero:          "Hero",
  Section_About:         "About",
  Section_Gallery:       "Gallery",
  Section_Testimonial:   "Testimonial",
  Section_Carousel:      "Carousel",
  Section_Form:          "Contact Form",
  Section_Countdown:     "Countdown",
  Section_MediaCarousel: "Media Carousel",
  Section_Services:      "Services",
  Section_Pricing:       "Pricing",
  Section_CTA:           "CTA",
  Section_FAQ:           "FAQ",
  Section_Team:          "Team",
  Section_Features:      "Features",
  Section_Newsletter:    "Newsletter",
  Section_Video:         "Video Section",
  Section_Stats:         "Stats",
};

// ─── Google Fonts ─────────────────────────────────────────────────────────────

export const GOOGLE_FONTS = [
  { label: "Inter (Default)", value: "Inter, system-ui, sans-serif" },

  { label: "Roboto", value: "Roboto, sans-serif" },

  { label: "Open Sans", value: "'Open Sans', sans-serif" },

  { label: "Poppins", value: "Poppins, sans-serif" },

  { label: "Playfair Display", value: "'Playfair Display', serif" },

  { label: "Lora", value: "Lora, serif" },

  { label: "Montserrat", value: "Montserrat, sans-serif" },

  { label: "Source Code Pro", value: "'Source Code Pro', monospace" },

  { label: "Raleway", value: "Raleway, sans-serif" },

  { label: "Ubuntu", value: "Ubuntu, sans-serif" },

  { label: "Almarai (Arabic)", value: "Almarai, sans-serif" },

  { label: "Cairo (Arabic)", value: "Cairo, sans-serif" },
] as const;


// ─── Modal Styles ─────────────────────────────────────────────────────────────

export const MODAL_OVERLAY_STYLE: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "var(--p-color-backdrop-bg, rgba(0,0,0,0.5))",
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const MODAL_CONTAINER_STYLE: React.CSSProperties = {
  background: "var(--p-color-bg-surface)",
  borderRadius: "var(--p-border-radius-300, 12px)",
  padding: 24,
  width: 360,
  boxShadow: "var(--p-shadow-600, 0 20px 60px rgba(0,0,0,0.2))",
};

// ─── Shared Form Styles ───────────────────────────────────────────────────────

/** Text input used across Save/Edit block modals. */
export const FORM_INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "5px 8px",
  border: "1px solid var(--p-color-border)",
  borderRadius: "var(--p-border-radius-100, 4px)",
  fontSize: "var(--p-font-size-325, 13px)",
  background: "var(--p-color-bg-surface)",
  color: "var(--p-color-text)",
  boxSizing: "border-box",
  outline: "none",
};

/** Small label above a form field. */
export const FORM_LABEL_STYLE: React.CSSProperties = {
  display: "block",
  fontSize: "var(--p-font-size-300, 12px)",
  fontWeight: "var(--p-font-weight-medium, 550)" as React.CSSProperties["fontWeight"],
  color: "var(--p-color-text)",
  marginBottom: 4,
};

/** Read-only display field (e.g. component count). */
export const FORM_READONLY_FIELD_STYLE: React.CSSProperties = {
  padding: "8px 10px",
  border: "1px solid var(--p-color-border-subdued)",
  borderRadius: "var(--p-border-radius-100, 4px)",
  fontSize: "var(--p-font-size-300, 12px)",
  color: "var(--p-color-text-secondary)",
  background: "var(--p-color-bg-surface-secondary)",
};

/** Secondary/cancel button used across modals. */
export const BTN_CANCEL_STYLE: React.CSSProperties = {
  padding: "7px 14px",
  borderRadius: "var(--p-border-radius-100, 4px)",
  border: "1px solid var(--p-color-border)",
  background: "var(--p-color-bg-surface)",
  color: "var(--p-color-text)",
  fontSize: "var(--p-font-size-325, 13px)",
  cursor: "pointer",
};

// ─── Drawer Item Card Style ───────────────────────────────────────────────────

/** Base style for a component card in the Puck components drawer — compact Polaris-matched style. */

export const DRAWER_ITEM_CARD_STYLE: React.CSSProperties = {
  display: "flex",

  flexDirection: "column",

  alignItems: "center",

  justifyContent: "center",

  padding: "7px 4px 5px",

  border: "1px solid var(--p-color-border)",

  borderRadius: "var(--p-border-radius-200)",

  fontSize: "var(--p-font-size-275, 11px)",

  fontWeight: "var(--p-font-weight-medium, 550)" as React.CSSProperties["fontWeight"],

  textAlign: "center",

  gap: "4px",

  cursor: "grab",

  background: "var(--p-color-bg-surface)",

  boxShadow: "none",

  transition: "border-color 0.15s ease, box-shadow 0.15s ease",

  userSelect: "none",

  color: "var(--p-color-text)",

  minHeight: 58,
};

// ─── Puck Drawer Grid Override ────────────────────────────────────────────────

export const DRAWER_GRID_STYLES = `

  /* ── Array "Add" button tooltips ─────────────────────────────────────────── */
  [class*="_ArrayField-addButton_"] {
    position: relative;
  }
  [class*="_ArrayField-addButton_"]:hover::after {
    content: attr(data-add-label);
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    background: #1f2937;
    color: #fff;
    font-size: 11px;
    white-space: nowrap;
    padding: 3px 8px;
    border-radius: 4px;
    pointer-events: none;
    z-index: 9999;
  }

  /* ── Preview mode (Inspector OFF): hide drop-zone empty-state placeholders so
     the canvas looks exactly like a live published page.                          ── */
  [data-pb-preview] [class*="_DropZone-empty_"],
  [data-pb-preview] [class*="_DropZoneEmptyPlaceholder_"],
  [data-pb-preview] [class*="_EmptyPlaceholder_"] {
    display: none !important;
  }

  /* ── Hide Puck's default blue Publish button (we render our own on the right) ── */
  ._PuckHeader-tools_63pti_75 ._Button--primary_10byl_48,
  ._MenuBar_8pf8c_1 ._Button--primary_10byl_48 {
    display: none !important;
  }

  /* ── Remove scrollbar from Puck header area (we use a custom fixed-height header) ── */
  ._PuckLayout-header_1dd16_208 {
    overflow: hidden !important;
  }

  /* ── Right sidebar: remove scroll only from the page title/breadcrumb area ── */
  ._Sidebar--right_o396p_25 ._SidebarSection-title_5otpt_12 {
    overflow: hidden !important;
  }

  /* Blocks plugin container — Elementor style gray background */

  ._BlocksPlugin_1ey1i_1 {

    padding: 0 !important;

    background: #f5f5f5 !important;

  }

  /* ── Puck default header content (rendered as {children}) — compact + no divider ── */
  /* Strip Puck's outer header border-bottom and left-offset padding — our
     PolarisEditorHeader supplies its own border and layout. */
  ._PuckHeader_63pti_1,
  [class*="_PuckHeader_63pti"] {
    border-bottom: none !important;
    padding-left: 0 !important;
  }

  /* Strip the vertical divider and padding that Puck adds to the inner grid. */
  ._PuckHeader-inner_63pti_20,
  [class*="_PuckHeader-inner_"] {
    border-left: none !important;
    border-bottom: none !important;
    padding-left: 0 !important;
  }

  /* Hide sidebar toggle buttons — we control sidebar visibility via our own nav */
  ._PuckHeader-leftSideBarToggle_63pti_48,
  ._PuckHeader-rightSideBarToggle_63pti_47 {
    display: none !important;
  }

  /* Hide Puck's default page-slug breadcrumb — we render our own brand mark */
  ._PuckHeader-title_63pti_64,
  [class*="_PuckHeader-title_"] {
    display: none !important;
  }

  /* Shrink undo/redo (MenuBar history) icon buttons */
  ._MenuBar_8pf8c_1 ._IconButton_ffob9_1 {
    padding: 3px !important;
  }
  ._MenuBar_8pf8c_1 ._IconButton_ffob9_1 svg {
    width: 16px !important;
    height: 16px !important;
  }

  /* Category section title — uppercase only in left sidebar (component palette) */
  ._Sidebar--left_o396p_13 ._SidebarSection-title_5otpt_12 {
    padding: 8px 12px !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    color: #000000 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    background: #f5f5f5 !important;
    border-bottom: none !important;
  }

  /* ── Right sidebar: clean compact field panel ── */

  /* Section title breadcrumb — normal case, minimal */
  ._Sidebar--right_o396p_25 ._SidebarSection-title_5otpt_12 {
    position: relative !important;
    text-transform: none !important;
    letter-spacing: 0 !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    color: var(--p-color-text) !important;
    background: var(--p-color-bg-surface-secondary, #f6f6f7) !important;
    padding: 6px 40px 6px 12px !important;
    border-top: none !important;
    border-bottom: 1px solid var(--p-color-border) !important;
  }

  ._Sidebar--right_o396p_25 ._FieldsPlugin-header_nd930_7 {
    position: relative !important;
    padding-right: 40px !important;
  }

  ._Sidebar--right_o396p_25 ._SidebarSection-breadcrumbs_5otpt_62 {
    display: inline-flex !important;
    align-items: center !important;
    gap: 4px !important;
    flex-wrap: nowrap !important;
    min-width: 0 !important;
  }

  ._Sidebar--right_o396p_25 ._Breadcrumbs_1c9yh_1 {
    display: inline-flex !important;
    align-items: center !important;
    gap: 4px !important;
    flex-wrap: nowrap !important;
    min-width: 0 !important;
  }

  ._Sidebar--right_o396p_25 ._SidebarSection-heading_5otpt_74 {
    padding-inline-end: 0 !important;
  }

  /* Section heading text — bold in both sidebars */
  ._Sidebar--right_o396p_25 ._SidebarSection-heading_5otpt_74,
  ._Sidebar--left_o396p_13 ._SidebarSection-heading_5otpt_74 {
    font-weight: 700 !important;
  }

  /* Tighter gap between input wrappers */
  ._Sidebar--right_o396p_25 ._InputWrapper_bsxfo_1 + ._InputWrapper_bsxfo_1 {
    margin-top: 4px !important;
  }

  /* Tighter Puck field rows (Puck default: padding 16px + margin-top 8px) */
  ._Sidebar--right_o396p_25 ._PuckFields--wrapFields_10bh7_36 ._PuckFields-field_10bh7_32 {
    padding: 8px 10px !important;
  }
  ._Sidebar--right_o396p_25 ._PuckFields--wrapFields_10bh7_36 ._PuckFields-field_10bh7_32 + ._PuckFields-field_10bh7_32 {
    margin-top: 0 !important;
    border-top: 1px solid var(--p-color-border-subdued) !important;
  }

  /* Compact field label + icon */
  ._Sidebar--right_o396p_25 ._Input-label_bsxfo_5 {
    padding-bottom: 3px !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    color: #000000 !important;
    line-height: 1.3 !important;
  }
  ._Sidebar--right_o396p_25 ._Input-labelIcon_bsxfo_14 {
    margin-inline-end: 4px !important;
    padding-inline-start: 0 !important;
  }
  ._Sidebar--right_o396p_25 ._Input-labelIcon_bsxfo_14 svg,
  ._Sidebar--right_o396p_25 ._Input-labelIcon_bsxfo_14 .lucide {
    width: 12px !important;
    height: 12px !important;
  }

  /* Compact field input — sized to match the left sidebar (Global Settings)
     FORM_INPUT_STYLE: 13px text with padding-driven height, full width */
  ._Sidebar--right_o396p_25 ._Input-input_bsxfo_26 {
    width: 100% !important;
    height: auto !important;
    padding: 5px 8px !important;
    font-size: 12px !important;
    line-height: 1.4 !important;
    border: 1px solid var(--p-color-border) !important;
    border-radius: var(--p-border-radius-100, 4px) !important;
    background: var(--p-color-bg-surface) !important;
    color: var(--p-color-text) !important;
    box-shadow: var(--p-shadow-100, inset 0 1px 0 rgba(0,0,0,0.02)) !important;
    transition: border-color 120ms ease, box-shadow 120ms ease !important;
    box-sizing: border-box !important;
  }

  /* Textarea exception — needs multi-line height */
  ._Sidebar--right_o396p_25 textarea._Input-input_bsxfo_26 {
    height: auto !important;
    min-height: 60px !important;
    padding: 6px 8px !important;
    line-height: 1.4 !important;
  }

  /* ── Uniform sizing for ALL right-sidebar field inputs ──
     Custom fields (puck.config.tsx) render raw <input>/<select> with their own
     hardcoded styles (height: 36, padding: 8px 12px, font-size: 14, etc.). This
     !important rule overrides those inline styles so every field — number,
     padding, opacity, array item inputs — matches the left sidebar input size.
     type="color"/checkbox/range/file are intentionally excluded. */
  ._Sidebar--right_o396p_25 input[type="text"],
  ._Sidebar--right_o396p_25 input[type="number"],
  ._Sidebar--right_o396p_25 input[type="date"],
  ._Sidebar--right_o396p_25 input[type="email"],
  ._Sidebar--right_o396p_25 input[type="tel"],
  ._Sidebar--right_o396p_25 input[type="url"],
  ._Sidebar--right_o396p_25 input[type="search"],
  ._Sidebar--right_o396p_25 input:not([type]),
  ._Sidebar--right_o396p_25 select {
    height: auto !important;
    min-height: 0 !important;
    padding: 5px 8px !important;
    font-size: 12px !important;
    line-height: 1.4 !important;
    border: 1px solid var(--p-color-border) !important;
    border-radius: var(--p-border-radius-100, 4px) !important;
    box-sizing: border-box !important;
  }
  ._Sidebar--right_o396p_25 textarea {
    padding: 6px 8px !important;
    font-size: 12px !important;
    line-height: 1.4 !important;
    border: 1px solid var(--p-color-border) !important;
    border-radius: var(--p-border-radius-100, 4px) !important;
    box-sizing: border-box !important;
  }

  /* ── Array field (Buttons, Stats, …) — align with the editor's Polaris look.
     Puck defaults use an azure-blue tint + grey tokens that clash with the
     surrounding panel; remap to surface/border tokens and the editor's
     brand-active treatment (same rgba(0,91,211,…) used by the nav icons). ── */

  /* Container — soft surface card instead of Puck's azure tint */
  ._Sidebar--right_o396p_25 ._ArrayField_1vaho_5,
  ._Sidebar--left_o396p_13 ._ArrayField_1vaho_5 {
    background: var(--p-color-bg-surface) !important;
    border: 1px solid var(--p-color-border) !important;
    border-radius: 8px !important;
    overflow: hidden !important;
  }

  /* Item border — bottom border on every item so each row has a visible divider */
  ._Sidebar--right_o396p_25 ._ArrayFieldItem_1vaho_67,
  ._Sidebar--left_o396p_13 ._ArrayFieldItem_1vaho_67 {
    border-bottom: 1px solid var(--p-color-border-subdued) !important;
  }

  /* Summary row — compact, input-level density */
  ._Sidebar--right_o396p_25 ._ArrayFieldItem-summary_1vaho_97,
  ._Sidebar--left_o396p_13 ._ArrayFieldItem-summary_1vaho_97 {
    padding: 4px 10px !important;
    background: var(--p-color-bg-surface) !important;
    color: var(--p-color-text) !important;
    font-size: 12px !important;
    font-weight: 500 !important;
    transition: background-color 120ms ease !important;
  }
  ._Sidebar--right_o396p_25 ._ArrayFieldItem-summary_1vaho_97:hover,
  ._Sidebar--left_o396p_13 ._ArrayFieldItem-summary_1vaho_97:hover {
    background: var(--p-color-bg-surface-secondary, #f6f6f7) !important;
  }

  /* Expanded item — editor's brand-active treatment. Inset shadow (not outline)
     so it isn't clipped by the container's overflow: hidden. */
  ._Sidebar--right_o396p_25 ._ArrayFieldItem--isExpanded_1vaho_82,
  ._Sidebar--left_o396p_13 ._ArrayFieldItem--isExpanded_1vaho_82 {
    outline: none !important;
    box-shadow: inset 0 0 0 1px rgba(0, 91, 211, 0.25) !important;
  }
  ._Sidebar--right_o396p_25 ._ArrayFieldItem--isExpanded_1vaho_82 > ._ArrayFieldItem-summary_1vaho_97,
  ._Sidebar--left_o396p_13 ._ArrayFieldItem--isExpanded_1vaho_82 > ._ArrayFieldItem-summary_1vaho_97 {
    background: rgba(0, 91, 211, 0.08) !important;
    color: #005bd3 !important;
    font-weight: 600 !important;
  }

  /* Expanded body — match panel content padding */
  ._Sidebar--right_o396p_25 ._ArrayFieldItem-fieldset_1vaho_179,
  ._Sidebar--left_o396p_13 ._ArrayFieldItem-fieldset_1vaho_179 {
    padding: 8px 10px !important;
    border-top: 1px solid var(--p-color-border-subdued) !important;
  }

  /* Add button — brand text, compact, subtle hover.
     No extra border-top needed — items already have border-bottom above it. */
  ._Sidebar--right_o396p_25 ._ArrayField-addButton_1vaho_18,
  ._Sidebar--left_o396p_13 ._ArrayField-addButton_1vaho_18 {
    padding: 9px !important;
    font-size: 12px !important;
    font-weight: 500 !important;
    color: #005bd3 !important;
    background: var(--p-color-bg-surface) !important;
    transition: background-color 120ms ease !important;
  }
  ._Sidebar--right_o396p_25 ._ArrayField-addButton_1vaho_18:hover,
  ._Sidebar--left_o396p_13 ._ArrayField-addButton_1vaho_18:hover {
    background: rgba(0, 91, 211, 0.06) !important;
  }

  /* Drag handle + row action icons — muted to match panel iconography */
  ._Sidebar--right_o396p_25 ._ArrayFieldItem-rhs_1vaho_187 svg,
  ._Sidebar--right_o396p_25 ._ArrayFieldItem-actions_1vaho_193 svg,
  ._Sidebar--left_o396p_13 ._ArrayFieldItem-rhs_1vaho_187 svg,
  ._Sidebar--left_o396p_13 ._ArrayFieldItem-actions_1vaho_193 svg {
    width: 14px !important;
    height: 14px !important;
  }

  /* Ensure all field row containers (Puck InputWrapper) span full width */
  ._Sidebar--right_o396p_25 ._InputWrapper_bsxfo_1,
  ._Sidebar--right_o396p_25 ._Input_bsxfo_1 {
    width: 100% !important;
    box-sizing: border-box !important;
  }
  ._Sidebar--right_o396p_25 ._Input-input_bsxfo_26:focus,
  ._Sidebar--right_o396p_25 ._Input-input_bsxfo_26:focus-visible {
    border-color: var(--p-color-border-focus, #005bd3) !important;
    box-shadow: 0 0 0 1px var(--p-color-border-focus, #005bd3) !important;
    outline: none !important;
  }

  /* Polaris-style focus for custom field inputs (color picker, etc.) */
  ._Sidebar--right_o396p_25 input[type="text"]:focus,
  ._Sidebar--right_o396p_25 input[type="number"]:focus,
  ._Sidebar--right_o396p_25 textarea:focus,
  ._Sidebar--right_o396p_25 select:focus {
    border-color: var(--p-color-border-focus, #005bd3) !important;
    box-shadow: 0 0 0 1px var(--p-color-border-focus, #005bd3) !important;
    outline: none !important;
  }

  /* Subtler section dividers between fields */
  ._Sidebar--right_o396p_25 ._SidebarSection_5otpt_1 + ._SidebarSection_5otpt_1 ._SidebarSection-title_5otpt_12,
  ._Sidebar--right_o396p_25 ._PuckFields--wrapFields_10bh7_36 ._PuckFields-field_10bh7_32 + ._PuckFields-field_10bh7_32 {
    border-color: var(--p-color-border-subdued, #ebebeb) !important;
  }

  /* Compact section content area */
  ._Sidebar--right_o396p_25 ._SidebarSection-content_5otpt_24 {
    padding: 8px 10px !important;
  }

  /* ── Rich text editor: compact toolbar + editor area ── */
  ._Sidebar--right_o396p_25 ._RichTextMenu--form_k97eh_7 {
    padding: 3px 4px !important;
  }
  ._Sidebar--right_o396p_25 ._RichTextMenu-group_k97eh_17 {
    padding-inline: 3px !important;
    gap: 0 !important;
  }
  ._Sidebar--right_o396p_25 ._Control_1aveu_1 .lucide,
  ._Sidebar--right_o396p_25 ._Control_1aveu_1 svg {
    width: 14px !important;
    height: 14px !important;
  }
  ._Sidebar--right_o396p_25 ._RichTextMenu_k97eh_1 ._Select-button_xjbef_6 {
    padding: 3px !important;
    padding-right: 2px !important;
  }
  ._Sidebar--right_o396p_25 ._RichTextMenu_k97eh_1 ._Select-buttonIcon_xjbef_27 .lucide {
    width: 14px !important;
    height: 14px !important;
  }
  ._Sidebar--right_o396p_25 ._RichTextEditor--editor_z25h4_50 {
    font-size: 12px !important;
  }
  ._Sidebar--right_o396p_25 ._RichTextEditor--editor_z25h4_50 .rich-text {
    padding: 6px 8px !important;
    min-height: 60px !important;
    font-size: 12px !important;
    line-height: 1.4 !important;
  }
  ._Sidebar--right_o396p_25 ._RichTextEditor--editor_z25h4_50 .ProseMirror {
    min-height: 50px !important;
  }

  /* ── GlobalLayoutPanel (Header / Footer) — compact Polaris fields ──────────
     GlobalLayoutPanel renders inside the right sidebar fields override using
     native Polaris TextField / Select / Checkbox / Label. These Polaris
     components have their own sizing that the broad input[type] overrides
     above don't reach. Match them to the compact field style used elsewhere. */

  /* TextField container — remove Polaris min-height token */
  ._Sidebar--right_o396p_25 .Polaris-TextField {
    min-height: 0 !important;
  }
  ._Sidebar--right_o396p_25 .Polaris-TextField__Input {
    min-height: 0 !important;
    padding: 5px 8px !important;
    font-size: 12px !important;
    line-height: 1.4 !important;
  }

  /* Select input */
  ._Sidebar--right_o396p_25 .Polaris-Select__Input {
    min-height: 0 !important;
    padding: 5px 8px !important;
    font-size: 12px !important;
    line-height: 1.4 !important;
  }

  /* Field label */
  ._Sidebar--right_o396p_25 .Polaris-Label__Text {
    font-size: 12px !important;
    font-weight: 600 !important;
    color: var(--p-color-text-secondary) !important;
  }
  ._Sidebar--right_o396p_25 .Polaris-Labelled__LabelWrapper {
    margin-bottom: 3px !important;
  }

  /* InlineStack / BlockStack gaps — tighter inside the panel */
  ._Sidebar--right_o396p_25 .Polaris-BlockStack {
    --pc-block-stack-gap-xs: var(--p-space-150, 6px) !important;
  }

  /* Sidebar sections container */

  ._SidebarSections_5otpt_1 {

    gap: 0 !important;

  }

  /* Drawer — 2-column tight grid */

  ._Drawer_pl7z0_1 {

    display: grid !important;

    grid-template-columns: 1fr 1fr;

    gap: 5px !important;

    padding: 8px !important;

    background: #f5f5f5 !important;

  }

  /* Remove Puck's default DrawerItem draggable box styling — we use our own card */
  ._DrawerItem-draggable_pl7z0_22 {

    padding: 0 !important;

    border: none !important;

    background: transparent !important;

    border-radius: 0 !important;

    box-shadow: none !important;

  }

  @media (hover: hover) and (pointer: fine) {

    ._Drawer_pl7z0_1:not(._Drawer--isDraggingFrom_pl7z0_45)

      ._DrawerItem_pl7z0_22:not(._DrawerItem--disabled_pl7z0_35)

      ._DrawerItem-draggable_pl7z0_22:hover {

      background: transparent !important;

    }

  }

  /* Card hover effect — Elementor style blue border */

  .elementor-block-card:hover {

    border-color: #0073aa !important;

    box-shadow: 0 0 0 1px #0073aa !important;

  }

  .hide-scrollbar {

    scrollbar-width: none;

    -ms-overflow-style: none;

  }

  .hide-scrollbar::-webkit-scrollbar {

    display: none;

  }

  /* ── Right sidebar: compact field panel ─────────────────────────────────── */

  /* Reduce padding inside each field group */
  [class*="_SidebarSection_"][class*="_fields"] > *,
  [class*="_FieldLabel_"],
  [class*="_Field_"] {
    font-size: 11px !important;
  }

  /* Compact field label in right panel (Polaris-style) */
  [class*="_FieldLabel_"] label,
  [class*="_Field_"] label {
    font-size: 11px !important;
    font-weight: 500 !important;
    color: var(--p-color-text) !important;
    margin-bottom: 2px !important;
  }

  /* Compact native inputs inside Puck's right panel */
  [class*="_rightSideBar"] input[type="text"],
  [class*="_rightSideBar"] input[type="number"],
  [class*="_rightSideBar"] input[type="url"],
  [class*="_rightSideBar"] input[type="color"],
  [class*="_rightSideBar"] textarea,
  [class*="_rightSideBar"] select {
    font-size: 12px !important;
    padding: 4px 7px !important;
    border-radius: 5px !important;
    border: 1px solid var(--p-color-border) !important;
    background: var(--p-color-bg-surface) !important;
    color: var(--p-color-text) !important;
  }

  /* Polaris TextField inside right panel — force compact height */
  [class*="_rightSideBar"] .Polaris-TextField__Input {
    min-height: 28px !important;
    padding: 3px 8px !important;
    font-size: 12px !important;
    line-height: 1.4 !important;
  }

  [class*="_rightSideBar"] .Polaris-Label__Text {
    font-size: 11px !important;
  }

  [class*="_rightSideBar"] .Polaris-Labelled__LabelWrapper {
    margin-bottom: 2px !important;
  }

  /* ── Hide the "Fields" nav tab — right panel is always visible on desktop ── */
  /* Target all known class variants Puck uses for the built-in fields nav item */
  ._NavItem--desktopOnly_1tvxq_126,
  ._NavItem--mobileOnly_1tvxq_121 {
    display: none !important;
  }
  /* Fallback: if Fields is always the 4th nav item, hide by position */
  ._Nav-list_1tvxq_5 > li:nth-child(4) {
    display: none !important;
  }

  /* ── Plugin nav: hidden visually but kept in DOM so HeaderNavIcons can click tabs ── */
  [class*="_PuckLayout-inner_"] {
    --puck-side-nav-width: 0px !important;
  }
  ._PuckLayout-nav_1dd16_192 {
    visibility: hidden !important;
    height: 0 !important;
    overflow: hidden !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
    position: absolute !important;
  }
  ._Sidebar--left_o396p_13 {
    padding-top: 0 !important;
  }

  /* ── Prevent long select option labels from breaking the sidebar layout ──────
     Native <select> has an intrinsic min-width driven by the longest <option>.
     Capping at 100% and setting min-width:0 lets it shrink inside flex rows.
     The browser then auto-truncates the displayed value with "…" natively. */
  ._Sidebar--left_o396p_13 select {
    max-width: 100% !important;
    min-width: 0 !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }
  ._Sidebar--right_o396p_25 select {
    max-width: 100% !important;
    min-width: 0 !important;
  }

`;


// ─── Modal-scoped Puck layout overrides ─────────────────────────────────────

export const MODAL_PUCK_STYLES = `

  ._PuckLayout_1dd16_36 {

    height: 100% !important;

  }

  /* Left sidebar — components/saved blocks drawer */

  ._SidebarSection_rsw5o_1,

  [class*="_leftSideBar"],

  [class*="_SidebarSections"] {

    overflow-y: auto !important;

    height: 100% !important;

  }

  /* Right sidebar — field panel */

  [class*="_rightSideBar"],

  [class*="_PuckFields"] {

    overflow-y: auto !important;

  }

  /* Canvas area */

  [class*="_PuckPreview-frame"],

  [class*="_PuckPreview_"] {

    overflow-y: auto !important;

  }

`;

// ─── 3D Parallax Drag Effect Styles ───────────────────────────────────────────

export const PARALLAX_DRAG_STYLES = `
  /* 3D Parallax Effect - ONLY during drag, normal when selected */
  
  /* Drag overlay wrapper - smooth transitions */
  ._DraggableComponent-overlayWrapper_1vaqy_12 {
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  
  /* When dragging - shrink to floating purple card above background */
  [data-dnd-dragging][data-puck-component] {
    transform: 
      scale(0.5)
      translateY(-50px) !important;
    transform-origin: center center !important;
    z-index: 9999 !important;
  }
  
  [data-dnd-dragging] ._DraggableComponent-overlayWrapper_1vaqy_12,
  ._DraggableComponent--isDragging_1vaqy_1 ._DraggableComponent-overlayWrapper_1vaqy_12 {
    transform: 
      scale(0.5)
      translateY(-50px) !important;
    transform-origin: center center !important;
    z-index: 9999 !important;
  }
  
  /* When dragging - the block becomes floating purple card with depth */
  [data-dnd-dragging] ._DraggableComponent-overlay_1vaqy_12,
  ._DraggableComponent--isDragging_1vaqy_1 ._DraggableComponent-overlay_1vaqy_12 {
    background: linear-gradient(
      145deg,
      rgba(88, 28, 135, 0.98) 0%,
      rgba(109, 40, 217, 0.95) 50%,
      rgba(124, 58, 237, 0.92) 100%
    ) !important;
    outline: none !important;
    border-radius: 12px;
    box-shadow: 
      /* Deep shadow for floating effect above background */
      0 40px 80px -20px rgba(0, 0, 0, 0.5),
      0 20px 40px -10px rgba(88, 28, 135, 0.6),
      /* Inner glow */
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      /* Border glow */
      0 0 0 1px rgba(139, 92, 246, 0.3);
    min-height: 140px;
    min-width: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    backdrop-filter: blur(10px);
  }
  
  /* Floating arrow inside the purple card */
  [data-dnd-dragging] ._DraggableComponent-overlay_1vaqy_12::before,
  ._DraggableComponent--isDragging_1vaqy_1 ._DraggableComponent-overlay_1vaqy_12::before {
    content: "↑";
    position: absolute;
    top: 35%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 28px;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
    z-index: 10;
    pointer-events: none;
    animation: parallaxFloat 2s ease-in-out infinite;
    font-weight: 300;
  }
  
  /* Parallax scrolling text inside the purple card */
  [data-dnd-dragging] ._DraggableComponent-overlay_1vaqy_12::after,
  ._DraggableComponent--isDragging_1vaqy_1 ._DraggableComponent-overlay_1vaqy_12::after {
    content: "Parallax Scrolling";
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.85);
    letter-spacing: 2px;
    text-transform: capitalize;
    z-index: 10;
    pointer-events: none;
    white-space: nowrap;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    font-family: system-ui, -apple-system, sans-serif;
  }
  
  /* Floating animation */
  @keyframes parallaxFloat {
    0%, 100% {
      transform: translate(-50%, -50%) translateY(0);
    }
    50% {
      transform: translate(-50%, -50%) translateY(-10px);
    }
  }
  
  /* Normal selected state - no purple, no scale */
  ._DraggableComponent--isSelected_1vaqy_57 > ._DraggableComponent-overlayWrapper_1vaqy_12 {
    transform: scale(1);
  }
  
  ._DraggableComponent--isSelected_1vaqy_57 > ._DraggableComponent-overlayWrapper_1vaqy_12 > ._DraggableComponent-overlay_1vaqy_12 {
    background: transparent !important;
    outline: 2px solid var(--puck-color-azure-07) !important;
    outline-offset: -2px;
  }
  
  /* Hide arrow/text when just selected (not dragging) */
  ._DraggableComponent--isSelected_1vaqy_57 ._DraggableComponent-overlay_1vaqy_12::before,
  ._DraggableComponent--isSelected_1vaqy_57 ._DraggableComponent-overlay_1vaqy_12::after {
    display: none;
  }
  
  /* Background components fade during drag - creates depth like image */
  [data-puck-dragging] [data-puck-component]:not([data-dnd-dragging]) {
    opacity: 0.4;
    filter: blur(1px);
    transform: scale(0.98);
    transition: all 0.3s ease;
  }
  
  /* The dragged component stays bright and sharp */
  [data-dnd-dragging][data-puck-component] {
    opacity: 1 !important;
    filter: none !important;
  }
  
  /* Enhanced drop zone during drag */
  [data-puck-dragging] ._DropZone--isEnabled_1i2sv_59 {
    outline: 2px dashed rgba(139, 92, 246, 0.5) !important;
    background: rgba(139, 92, 246, 0.05) !important;
  }
  
  /* Placeholder styling - glow effect */
  [data-dnd-placeholder] {
    background: linear-gradient(
      145deg,
      rgba(88, 28, 135, 0.2) 0%,
      rgba(139, 92, 246, 0.15) 100%
    ) !important;
    border: 2px dashed rgba(139, 92, 246, 0.4) !important;
    box-shadow: 
      inset 0 0 30px rgba(99, 102, 241, 0.1),
      0 4px 20px rgba(99, 102, 241, 0.15);
    transform: scale(0.96);
    transition: all 0.3s ease;
    border-radius: 8px;
  }
  
  /* Ensure smooth transitions */
  [data-puck-component],
  ._DraggableComponent-overlayWrapper_1vaqy_12,
  ._DraggableComponent-overlay_1vaqy_12 {
    will-change: transform, opacity, filter;
    backface-visibility: hidden;
  }
`;

// ─── Event Names ──────────────────────────────────────────────────────────────

export const SAVED_BLOCKS_REFRESH_EVENT = "saved-blocks:refresh";

// ─── Canvas scroll suppression ────────────────────────────────────────────────
// The page scrolls INSIDE the iframe (like the real storefront). The outer
// canvas must not scroll so no scrollbar appears in the gray gutter.
export const CANVAS_SCROLL_STYLES = `
  ._PuckCanvas_t6s9b_1 { overflow: hidden !important; }
  /* Pin the canvas inner + root to exactly the canvas height so the iframe
     fills the visible area and scrolls internally. Without this, leftover
     auto-growth rules let the root extend past the canvas bottom, which the
     overflow:hidden canvas then clips — cutting off the iframe's scrollbar at
     the bottom while the top stays inset by the canvas padding. */
  ._PuckCanvas-inner_t6s9b_33 { height: 100% !important; min-height: 0 !important; }
  ._PuckCanvas-root_t6s9b_42 { height: 100% !important; min-height: 0 !important; }
`;

// ─── Iframe page scrollbar ────────────────────────────────────────────────────
// Injected into the iframe document so the scrollbar appears inside the white
// page area, matching the app's thin-scrollbar style.
export const IFRAME_SCROLLBAR_CSS = `
  html {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    scrollbar-width: thin;
    scrollbar-color: #c7c7d6 transparent;
  }
  html::-webkit-scrollbar { width: 8px; }
  html::-webkit-scrollbar-track { background: transparent; }
  html::-webkit-scrollbar-thumb { background: #c7c7d6; border-radius: 999px; }
  html::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
  html::-webkit-scrollbar-corner { background: transparent; }
`;

export const GLOBAL_BLOCKS_REFRESH_EVENT = "global-blocks:refresh";
