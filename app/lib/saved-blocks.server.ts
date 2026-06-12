import prisma from "../db.server";

export type SavedBlock = {
  id: string;
  name: string;
  content: unknown[];
  zones: Record<string, unknown[]>;
  blockType: "block" | "section";
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function getSavedBlocks(shop: string): Promise<SavedBlock[]> {
  const rows = await prisma.savedBlock.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    ...r,
    content: JSON.parse(r.content),
    zones: JSON.parse((r as any).zones ?? "{}"),
    blockType: ((r as any).blockType ?? "block") as "block" | "section",
    thumbnail: r.thumbnail ?? undefined,
  }));
}

export async function createSavedBlock(
  shop: string,
  name: string,
  content: unknown[],
  zones?: Record<string, unknown[]>,
  blockType?: "block" | "section",
  thumbnail?: string,
): Promise<SavedBlock> {
  const row = await prisma.savedBlock.create({
    data: {
      shop,
      name,
      content: JSON.stringify(content),
      zones: JSON.stringify(zones ?? {}),
      blockType: blockType ?? "block",
      thumbnail,
    },
  });
  return {
    ...row,
    content: JSON.parse(row.content),
    zones: JSON.parse((row as any).zones ?? "{}"),
    blockType: ((row as any).blockType ?? "block") as "block" | "section",
    thumbnail: row.thumbnail ?? undefined,
  };
}

export async function deleteSavedBlock(shop: string, id: string): Promise<void> {
  await prisma.savedBlock.deleteMany({ where: { shop, id } });
}
