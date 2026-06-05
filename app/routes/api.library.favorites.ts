import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getGlobalSettings, saveGlobalSettings } from "../lib/settings.server";

// Favorites are stored as a sub-key inside GlobalSettings JSON.
// Shape: globalSettings.__libraryFavorites = { blocks: string[], pages: string[] }

function getFavKey(settings: Record<string, unknown>) {
  const raw = settings.__libraryFavorites as { blocks?: string[]; pages?: string[] } | undefined;
  return { blocks: raw?.blocks ?? [], pages: raw?.pages ?? [] };
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const settings = (await getGlobalSettings(session.shop)) as Record<string, unknown>;
  const favorites = getFavKey(settings);
  return new Response(JSON.stringify(favorites), {
    headers: { "Content-Type": "application/json" },
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { session } = await authenticate.admin(request);
  const { action: act, tab, itemId } = (await request.json()) as {
    action: "add" | "remove";
    tab: "blocks" | "pages";
    itemId: string;
  };

  const settings = (await getGlobalSettings(session.shop)) as Record<string, unknown>;
  const favorites = getFavKey(settings);

  const list = tab === "pages" ? favorites.pages : favorites.blocks;

  const updated =
    act === "add"
      ? list.includes(itemId) ? list : [...list, itemId]
      : list.filter((id) => id !== itemId);

  const newFavorites = tab === "pages"
    ? { blocks: favorites.blocks, pages: updated }
    : { blocks: updated, pages: favorites.pages };

  await saveGlobalSettings(session.shop, {
    ...settings,
    __libraryFavorites: newFavorites,
  } as Parameters<typeof saveGlobalSettings>[1]);

  return new Response(JSON.stringify(newFavorites), {
    headers: { "Content-Type": "application/json" },
  });
};
