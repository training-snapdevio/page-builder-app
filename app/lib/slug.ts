export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateSlug(title: string, existingSlugs: string[]): string {
  const base = slugify(title) || "page";
  const slugSet = new Set(existingSlugs);

  if (!slugSet.has(base)) return base;

  let counter = 1;
  while (slugSet.has(`${base}-${counter}`)) {
    counter++;
  }

  return `${base}-${counter}`;
}
