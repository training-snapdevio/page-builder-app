export type {
  NavLink,
  CustomColor,
  HeaderSettings,
  FooterSettings,
  GlobalSettings,
} from "./settings.defaults";
export {
  DEFAULT_HEADER_SETTINGS,
  DEFAULT_FOOTER_SETTINGS,
  DEFAULT_GLOBAL_SETTINGS,
} from "./settings.defaults";

import type { GlobalSettings } from "./settings.defaults";
import { DEFAULT_GLOBAL_SETTINGS } from "./settings.defaults";
import prisma from "../db.server";

const SYSTEM_FONT_KEYWORDS = [
  "system-ui", "sans-serif", "serif", "monospace", "inherit", "initial",
  "-apple-system", "blinkmacsystemfont",
];

export function buildGoogleFontsImport(fontFamilies: string[]): string {
  const names = new Set<string>();
  for (const stack of fontFamilies) {
    for (const part of stack.split(",")) {
      const name = part.replace(/['"]/g, "").trim();
      if (name && !SYSTEM_FONT_KEYWORDS.some((kw) => name.toLowerCase().includes(kw))) {
        names.add(name);
      }
    }
  }
  if (names.size === 0) return "";
  const query = [...names]
    .map((n) => `family=${n.replace(/\s+/g, "+")}:wght@300;400;500;600;700;800`)
    .join("&");
  return `@import url('https://fonts.googleapis.com/css2?${query}&display=swap');\n`;
}

export function settingsToCSSString(s: GlobalSettings): string {
  const d = DEFAULT_GLOBAL_SETTINGS;
  const v = (val: string | undefined, fallback: string): string =>
    val && val !== "undefined" && val.trim() !== "" ? val : fallback;

  const buttonStyle = s.buttonStyle ?? d.buttonStyle;
  const borderRadius = v(s.borderRadius, d.borderRadius);
  const buttonBR =
    buttonStyle === "pill" ? "9999px"
    : buttonStyle === "square" ? "0px"
    : borderRadius;

  return `
:root {
  --primary-color: ${v(s.primaryColor, d.primaryColor)};
  --secondary-color: ${v(s.secondaryColor, d.secondaryColor)};
  --accent-color: ${v(s.accentColor, d.accentColor)};
  --text-color: ${v(s.textColor, d.textColor)};
  --background-color: ${v(s.backgroundColor, d.backgroundColor)};
  --font-family: ${v(s.fontFamily, d.fontFamily)};
  --heading-font: ${v(s.headingFont, d.headingFont)};
  --base-font-size: ${v(s.baseFontSize, d.baseFontSize)};
  --line-height: ${v(s.lineHeight, d.lineHeight)};
  --letter-spacing: ${v(s.letterSpacing, d.letterSpacing)};
  --h1-size: ${v(s.h1Size, d.h1Size)};
  --h2-size: ${v(s.h2Size, d.h2Size)};
  --h3-size: ${v(s.h3Size, d.h3Size)};
  --h4-size: ${v(s.h4Size, d.h4Size)};
  --h5-size: ${v(s.h5Size, d.h5Size)};
  --h6-size: ${v(s.h6Size, d.h6Size)};
  --heading-weight: ${v(s.headingWeight, d.headingWeight)};
  --heading-line-height: ${v(s.headingLineHeight, d.headingLineHeight)};
  --border-radius: ${borderRadius};
  --button-border-radius: ${buttonBR};
  --button-padding-x: ${v(s.buttonPaddingX, d.buttonPaddingX)};
  --button-padding-y: ${v(s.buttonPaddingY, d.buttonPaddingY)};
  --button-text-transform: ${s.buttonTextTransform ?? d.buttonTextTransform};
  --button-font-weight: ${v(s.buttonFontWeight, d.buttonFontWeight)};
  --button-border-width: ${v(s.buttonBorderWidth, d.buttonBorderWidth)};
  --image-border-radius: ${v(s.imageBorderRadius, d.imageBorderRadius)};
  --image-object-fit: ${s.imageObjectFit ?? d.imageObjectFit};
  --container-width: ${v(s.containerWidth, d.containerWidth)};
  --column-gap: ${v(s.columnGap, d.columnGap)};
  --row-gap: ${v(s.rowGap, d.rowGap)};
  --link-color: ${v(s.linkColor, d.linkColor)};
  --link-decoration: ${s.linkDecoration ?? d.linkDecoration};
  --card-shadow: ${v(s.cardShadow, d.cardShadow)};
}
${s.customCSS ? s.customCSS : ""}
`.trim();
}

export async function getGlobalSettings(shop: string): Promise<GlobalSettings> {
  try {
    const record = await prisma.globalSettings.findUnique({ where: { shop } });
    if (!record) return DEFAULT_GLOBAL_SETTINGS;
    return { ...DEFAULT_GLOBAL_SETTINGS, ...JSON.parse(record.settings) };
  } catch {
    return DEFAULT_GLOBAL_SETTINGS;
  }
}

export async function saveGlobalSettings(shop: string, settings: GlobalSettings): Promise<void> {
  await prisma.globalSettings.upsert({
    where: { shop },
    create: { shop, settings: JSON.stringify(settings) },
    update: { settings: JSON.stringify(settings) },
  });
}
