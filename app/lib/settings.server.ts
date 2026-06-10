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

// These CSS helpers are pure (no server deps). They live in puck-renderer.ts
// (client-safe) so the browser-built in-app preview can use them too; re-exported
// here for the existing server-side import sites (storefront route, etc.).
export { buildGoogleFontsImport, settingsToCSSString } from "./puck-renderer";

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
