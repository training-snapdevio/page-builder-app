/**
 * settings-helpers.ts
 *
 * Utility functions for Global Settings management.
 * Includes deep comparison, defaults checking, and reset helpers.
 */

import type { GlobalSettings } from "@/lib/settings.defaults";
import { DEFAULT_GLOBAL_SETTINGS } from "@/lib/settings.defaults";

/**
 * Deep comparison of two objects.
 * Handles nested objects and arrays.
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object" || a === null || b === null) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}

/**
 * Check if current settings match the default settings.
 * Returns an object with overall match status and per-field differences.
 */
export function compareWithDefaults(
  settings: GlobalSettings,
): {
  isAtDefaults: boolean;
  differences: Array<{ field: keyof GlobalSettings; current: any; default: any }>;
} {
  const differences: Array<{ field: keyof GlobalSettings; current: any; default: any }> = [];

  // Get all keys from both objects
  const allKeys = new Set([
    ...Object.keys(settings),
    ...Object.keys(DEFAULT_GLOBAL_SETTINGS),
  ]) as Set<keyof GlobalSettings>;

  for (const key of allKeys) {
    const currentValue = settings[key];
    const defaultValue = DEFAULT_GLOBAL_SETTINGS[key];

    if (!deepEqual(currentValue, defaultValue)) {
      differences.push({
        field: key,
        current: currentValue,
        default: defaultValue,
      });
    }
  }

  return {
    isAtDefaults: differences.length === 0,
    differences,
  };
}

/**
 * Quick check if settings are at defaults.
 */
export function isAtDefaultSettings(settings: GlobalSettings): boolean {
  return compareWithDefaults(settings).isAtDefaults;
}

/**
 * Get a human-readable list of changed setting categories.
 * Useful for confirmation dialogs.
 */
export function getChangedCategories(
  differences: Array<{ field: keyof GlobalSettings; current: any; default: any }>,
): string[] {
  const categoryMap: Record<string, string[]> = {
    "Design System": ["theme", "primaryColor", "secondaryColor", "accentColor", "textColor", "backgroundColor", "customColors", "fontFamily", "headingFont", "baseFontSize", "lineHeight", "letterSpacing"],
    "Typography": ["h1Size", "h2Size", "h3Size", "h4Size", "h5Size", "h6Size", "headingWeight", "headingLineHeight"],
    "Buttons": ["borderRadius", "buttonStyle", "buttonPaddingX", "buttonPaddingY", "buttonTextTransform", "buttonFontWeight", "buttonBorderWidth", "buttonHoverEffect", "buttonShadow"],
    "Images": ["imageBorderRadius", "imageObjectFit", "imageHoverEffect"],
    "Site Identity": ["siteTitle", "siteTagline", "siteLogo", "favicon"],
    "Background": ["pageBackgroundType", "pageBackgroundGradient"],
    "Layout": ["containerWidth", "columnGap", "rowGap"],
    "Animations": ["animationSpeed", "pageTransition", "scrollAnimation", "scrollAnimationDuration", "scrollAnimationDelay"],
    "Interactions": ["headerSticky", "footerSticky", "headerTransparent", "linkColor", "linkHoverColor", "linkDecoration", "cardShadow", "showScrollToTop", "scrollToTopBgColor", "scrollToTopIconColor"],
    "Header & Footer": ["headerColorSync", "footerColorSync", "header", "footer"],
    "Custom CSS": ["customCSS"],
  };

  const changedCategories = new Set<string>();

  for (const diff of differences) {
    for (const [category, fields] of Object.entries(categoryMap)) {
      if (fields.includes(diff.field as string)) {
        changedCategories.add(category);
      }
    }
  }

  return Array.from(changedCategories);
}
