import prisma from "../db.server";

export type SavedBlock = {
  id: string;
  name: string;
  content: unknown[];
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
    thumbnail: r.thumbnail ?? undefined,
  }));
}

export async function createSavedBlock(
  shop: string,
  name: string,
  content: unknown[],
  thumbnail?: string,
): Promise<SavedBlock> {
  const row = await prisma.savedBlock.create({
    data: { shop, name, content: JSON.stringify(content), thumbnail },
  });
  return { ...row, content: JSON.parse(row.content), thumbnail: row.thumbnail ?? undefined };
}

export async function deleteSavedBlock(shop: string, id: string): Promise<void> {
  await prisma.savedBlock.deleteMany({ where: { shop, id } });
}
