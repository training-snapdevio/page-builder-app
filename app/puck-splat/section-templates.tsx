// @ts-nocheck
/**
 * Section template metadata.
 * The actual Puck component definitions (fields + render) live in
 * puck.config.tsx inside `sectionTemplateConfig`, using the exact same
 * BlockTabBar / TabSection / StackedTextField / ColorPickerField / etc.
 * helpers every other block uses — so the right-panel looks identical.
 *
 * This file only exports:
 *   SECTION_TEMPLATES — icon + label map used by DrawerItemOverride
 *   createSectionTemplateComponents — called by PuckSplatEditor to inject
 *     the components into dynamicConfig
 */

import { sectionTemplateConfig } from "@/puck.config";

export type SectionTemplateEntry = {
  label: string;
  icon: string;
};

export const SECTION_TEMPLATES: Record<string, SectionTemplateEntry> = {
  Section_Hero:          { label: "Hero",           icon: "✦"  },
  Section_About:         { label: "About",          icon: "👤" },
  Section_Gallery:       { label: "Gallery",        icon: "🖼" },
  Section_Testimonial:   { label: "Testimonial",    icon: "💬" },
  Section_Carousel:      { label: "Carousel",       icon: "🎠" },
  Section_Form:          { label: "Contact Form",   icon: "📝" },
  Section_Countdown:     { label: "Countdown",      icon: "⏱" },
  Section_MediaCarousel: { label: "Media Carousel", icon: "🎞" },
  Section_Services:      { label: "Services",       icon: "🔧" },
  Section_Pricing:       { label: "Pricing",        icon: "💳" },
  Section_CTA:           { label: "CTA",            icon: "⚡" },
  Section_FAQ:           { label: "FAQ",            icon: "❓" },
  Section_Team:          { label: "Team",           icon: "👥" },
  Section_Features:      { label: "Features",       icon: "✅" },
  Section_Newsletter:    { label: "Newsletter",     icon: "✉"  },
  Section_Video:         { label: "Video Section",  icon: "🎬" },
  Section_Stats:         { label: "Stats",          icon: "📊" },
};

/**
 * Returns the full Puck component map for all section templates.
 * Used by PuckSplatEditor to inject into dynamicConfig.components.
 */
export function createSectionTemplateComponents(): Record<string, unknown> {
  return sectionTemplateConfig;
}
