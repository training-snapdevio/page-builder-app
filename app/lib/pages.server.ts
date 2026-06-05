import prisma from "../db.server";
import { generateSlug } from "./slug";

export type PageStatus = "draft" | "exported" | "generating";

export interface PageRecord {
  id: string;
  shop: string;
  slug: string;
  title: string;
  brandName: string | null;
  status: string;
  exportedAt: Date | null;
  data: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getAllPages(shop: string): Promise<PageRecord[]> {
  return prisma.page.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPageBySlug(
  shop: string,
  slug: string,
): Promise<PageRecord | null> {
  return prisma.page.findUnique({
    where: { shop_slug: { shop, slug } },
  });
}

export async function createPage(
  shop: string,
  title: string,
  brandName?: string | null,
): Promise<PageRecord> {
  const existing = await getAllPages(shop);
  const existingSlugs = existing.map((p) => p.slug);
  const slug = generateSlug(title, existingSlugs);

  return prisma.page.create({
    data: {
      shop,
      slug,
      title,
      brandName: brandName?.trim() || null,
      data: JSON.stringify({
        content: [],
        root: { props: { title } },
        zones: {},
      }),
    },
  });
}

/**
 * Flag a page as published to the Shopify online store theme. Called after a
 * successful `savePageToShopify` so the pages list can show an accurate status.
 */
export async function markPageExported(
  shop: string,
  slug: string,
): Promise<void> {
  await prisma.page.update({
    where: { shop_slug: { shop, slug } },
    data: { status: "exported", exportedAt: new Date() },
  });
}

export async function updatePage(
  shop: string,
  slug: string,
  data: object,
): Promise<PageRecord> {
  return prisma.page.update({
    where: { shop_slug: { shop, slug } },
    data: { data: JSON.stringify(data) },
  });
}

export async function markPageDraft(
  shop: string,
  slug: string,
): Promise<void> {
  await prisma.page.update({
    where: { shop_slug: { shop, slug } },
    data: { status: "draft" },
  });
}

export async function deletePageBySlug(
  shop: string,
  slug: string,
): Promise<void> {
  await prisma.page.delete({
    where: { shop_slug: { shop, slug } },
  });
}
