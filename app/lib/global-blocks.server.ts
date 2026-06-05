import prisma from "../db.server";

export type GlobalBlock = {
  id: string;
  name: string;
  content: unknown[];
  zones?: Record<string, unknown[]>;
  createdAt: Date;
  updatedAt: Date;
};

export async function getAllGlobalBlocks(shop: string): Promise<GlobalBlock[]> {
  const rows = await prisma.globalBlock.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    ...r,
    content: JSON.parse(r.content),
    zones: JSON.parse(r.zones) as Record<string, unknown[]>,
  }));
}

export async function createGlobalBlock(
  shop: string,
  name: string,
  content: unknown[],
  zones?: Record<string, unknown[]>,
): Promise<GlobalBlock> {
  const row = await prisma.globalBlock.create({
    data: {
      shop,
      name,
      content: JSON.stringify(content),
      zones: JSON.stringify(zones ?? {}),
    },
  });
  return {
    ...row,
    content: JSON.parse(row.content),
    zones: JSON.parse(row.zones) as Record<string, unknown[]>,
  };
}

export async function updateGlobalBlock(
  shop: string,
  id: string,
  content: unknown[],
  zones?: Record<string, unknown[]>,
): Promise<GlobalBlock> {
  const row = await prisma.globalBlock.update({
    where: { id, shop },
    data: {
      content: JSON.stringify(content),
      zones: JSON.stringify(zones ?? {}),
    },
  });
  return {
    ...row,
    content: JSON.parse(row.content),
    zones: JSON.parse(row.zones) as Record<string, unknown[]>,
  };
}

export async function deleteGlobalBlock(shop: string, id: string): Promise<void> {
  await prisma.globalBlock.deleteMany({ where: { shop, id } });
}
