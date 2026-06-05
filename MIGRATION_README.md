# Migrate Page Builder into Shopify App (`page-buider-app`)

This guide moves the complete page builder from `my-app` (React Router + Puck + db.json)
into `page-buider-app` (Shopify CLI scaffold — React Router + Prisma + Polaris).

**Rule of thumb:**
- **Puck canvas components** (Hero, Button, Grid, etc.) → copy as-is, keep their existing CSS
- **Admin shell UI** (pages list, modals, settings panels, drawers) → rebuild with **Shopify Polaris**
- **db.json** → **Prisma** (SQLite in dev, Postgres in prod)
- **Every route** must be wrapped in `authenticate.admin(request)` for Shopify OAuth

---

## Table of Contents

1. [Understand What Already Exists](#1-understand-what-already-exists)
2. [Install Dependencies](#2-install-dependencies)
3. [Extend Prisma Schema](#3-extend-prisma-schema)
4. [Copy & Adapt Server Lib Files](#4-copy--adapt-server-lib-files)
5. [Copy puck.config.tsx](#5-copy-puckconfigtsx)
6. [Copy puck-splat Components & Hooks](#6-copy-puck-splat-components--hooks)
7. [Create All App Routes](#7-create-all-app-routes)
8. [Rebuild Admin Shell with Polaris](#8-rebuild-admin-shell-with-polaris)
9. [Puck Editor Route Inside Shopify](#9-puck-editor-route-inside-shopify)
10. [Polaris Panels (Drawer, Modals, Library)](#10-polaris-panels-drawer-modals-library)
11. [Global Settings Route](#11-global-settings-route)
12. [Header & Footer Editor Routes](#12-header--footer-editor-routes)
13. [Run & Test](#13-run--test)
14. [File Map After Migration](#14-file-map-after-migration)

---

## 1. Understand What Already Exists

### `page-buider-app` current state
```
app/
  root.tsx              ← HTML shell, loads Polaris fonts
  shopify.server.ts     ← Shopify OAuth init
  db.server.ts          ← Prisma client
  routes/
    app.tsx             ← AppProvider + NavMenu (already has Polaris)
    app._index.tsx      ← demo GraphQL mutation page (DELETE THIS CONTENT)
    app.additional.tsx  ← placeholder (DELETE)
    auth.$.tsx          ← OAuth callback (keep)
    auth.login/         ← login page (keep)
    webhooks.*          ← webhook handlers (keep)
    _index/             ← public landing (keep)
prisma/schema.prisma    ← only has Session model (extend this)
```

### `my-app` — everything to migrate
```
puck.config.tsx                  ← 3500+ lines — ALL component definitions
app/lib/
  db.server.ts                   ← JSON read/write (replace with Prisma)
  pages.server.ts                ← page CRUD (adapt to Prisma)
  global-blocks.server.ts        ← global block CRUD
  saved-blocks.server.ts         ← saved block CRUD
  settings.server.ts             ← global design settings
  global-layout.server.ts        ← header/footer data
  resolve-global-blocks.ts       ← resolve GlobalBlock refs at render time
  resolve-saved-blocks.ts        ← resolve SavedBlock refs at render time
  slug.ts                        ← generateSlug()
  library.server.ts              ← template library
  library.types.ts               ← LibraryItem, LibraryCategory types
app/routes/
  admin.pages._index.tsx         ← pages list UI
  admin.pages.new.tsx            ← create page form
  admin.pages.$slug.edit.tsx     ← page edit (redirects to Puck editor)
  admin.settings.tsx             ← global settings form
  puck-splat.tsx                 ← THE MAIN EDITOR (catch-all)
  puck-splat/
    types.ts
    constants.tsx
    utils.tsx
    hooks/useSavedBlocks.ts
    plugins/GlobalSettingsPlugin.tsx
    components/
      ComponentsPanelWithTabs.tsx
      LibraryModal.tsx
      SavedBlocksPanel.tsx
      GlobalBlocksPanel.tsx
      SaveBlockModal.tsx
      EditBlockModal.tsx
      SaveAsGlobalBlockModal.tsx
      EditGlobalBlockModal.tsx
      ModalShell.tsx
app/components/
  confirm-modal.tsx
  puck-render.tsx
```

---

## 2. Install Dependencies

Open a terminal at `D:\page-builder-next-app\page-buider-app\` and run:

```bash
# Puck editor (use same version as my-app)
npm install @measured/puck

# Tailwind (Puck components use Tailwind classes)
npm install tailwindcss @tailwindcss/vite

# Icons (Puck components use lucide-react)
npm install lucide-react

# Rich text editor (used inside RichText block)
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-text-align @tiptap/extension-color @tiptap/extension-text-style @tiptap/extension-highlight @tiptap/extension-link @tiptap/extension-image

# Drag and drop (used inside ColumnSection layout picker)
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# State management (used in editor hooks)
npm install zustand

# Utilities
npm install uuid
npm install -D @types/uuid

# Dropzone (used in image upload fields)
npm install react-dropzone
```

### Add Tailwind to `vite.config.ts`

```ts
// page-buider-app/vite.config.ts
import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";   // ADD THIS
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tailwindcss(),          // ADD BEFORE reactRouter
    reactRouter(),
    tsconfigPaths(),
  ],
});
```

### Create `app/styles.css`

```css
/* page-buider-app/app/styles.css */
@import "tailwindcss";

/* Puck editor overrides — prevent Polaris from bleeding into canvas */
.puck-root { all: revert; }
```

Import it in `app/root.tsx`:

```tsx
// add this import at the top of root.tsx
import "./styles.css";
```

---

## 3. Extend Prisma Schema

Replace the contents of `prisma/schema.prisma`:

```prisma
// page-buider-app/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:dev.db"
}

// ── Shopify OAuth sessions (keep as-is) ─────────────────────────────────────
model Session {
  id            String    @id
  shop          String
  state         String
  isOnline      Boolean   @default(false)
  scope         String?
  expires       DateTime?
  accessToken   String
  userId        BigInt?
  firstName     String?
  lastName      String?
  email         String?
  accountOwner  Boolean   @default(false)
  locale        String?
  collaborator  Boolean?  @default(false)
  emailVerified Boolean?  @default(false)
}

// ── Page Builder data (one set per Shopify shop) ─────────────────────────────
model Page {
  id        String   @id @default(cuid())
  shop      String                        // Shopify shop domain
  slug      String
  title     String
  data      String   @default("{}")       // JSON blob (Puck Data)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([shop, slug])
  @@index([shop])
}

model GlobalBlock {
  id        String   @id @default(cuid())
  shop      String
  name      String
  content   String   @default("[]")      // JSON — BlockItem[]
  zones     String   @default("{}")      // JSON — zones map
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([shop])
}

model SavedBlock {
  id        String   @id @default(cuid())
  shop      String
  name      String
  content   String   @default("[]")      // JSON — BlockItem[]
  thumbnail String?
  createdAt DateTime @default(now())

  @@index([shop])
}

model GlobalSettings {
  id   String @id @default(cuid())
  shop String @unique
  data String @default("{}")            // JSON — all settings keys
}

model GlobalLayout {
  id     String @id @default(cuid())
  shop   String @unique
  header String @default("{}")          // JSON — Puck Data for header
  footer String @default("{}")          // JSON — Puck Data for footer
}
```

Run the migration:

```bash
npx prisma migrate dev --name add-page-builder-models
npx prisma generate
```

---

## 4. Copy & Adapt Server Lib Files

Create `app/lib/` directory. Copy these files from `my-app/app/lib/` and change **only the database layer** from JSON file I/O to Prisma calls.

### 4.1 — `app/lib/slug.ts` (copy as-is)

```bash
copy D:\page-builder-next-app\my-app\app\lib\slug.ts
     D:\page-builder-next-app\page-buider-app\app\lib\slug.ts
```

No changes needed.

### 4.2 — `app/lib/library.types.ts` (copy as-is)

```bash
copy D:\page-builder-next-app\my-app\app\lib\library.types.ts
     D:\page-builder-next-app\page-buider-app\app\lib\library.types.ts
```

### 4.3 — `app/lib/pages.server.ts` (adapt to Prisma)

```ts
// page-buider-app/app/lib/pages.server.ts
import { prisma } from "~/db.server";
import type { Data } from "@measured/puck";

export type PageRecord = {
  id: string;
  slug: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  data: Data;
};

function parse(p: { id: string; slug: string; title: string; data: string; createdAt: Date; updatedAt: Date }): PageRecord {
  return { ...p, data: JSON.parse(p.data) as Data };
}

export async function getAllPages(shop: string): Promise<PageRecord[]> {
  const rows = await prisma.page.findMany({ where: { shop }, orderBy: { updatedAt: "desc" } });
  return rows.map(parse);
}

export async function getPageBySlug(shop: string, slug: string): Promise<PageRecord | null> {
  const row = await prisma.page.findUnique({ where: { shop_slug: { shop, slug } } });
  return row ? parse(row) : null;
}

export async function createPage(shop: string, title: string, slug: string): Promise<PageRecord> {
  const row = await prisma.page.create({
    data: { shop, slug, title, data: JSON.stringify({ content: [], root: { props: {} }, zones: {} }) },
  });
  return parse(row);
}

export async function updatePage(shop: string, slug: string, data: Data): Promise<void> {
  await prisma.page.update({
    where: { shop_slug: { shop, slug } },
    data: { data: JSON.stringify(data) },
  });
}

export async function renamePage(shop: string, slug: string, title: string): Promise<void> {
  await prisma.page.update({ where: { shop_slug: { shop, slug } }, data: { title } });
}

export async function deletePageBySlug(shop: string, slug: string): Promise<void> {
  await prisma.page.delete({ where: { shop_slug: { shop, slug } } });
}
```

### 4.4 — `app/lib/global-blocks.server.ts` (adapt to Prisma)

```ts
// page-buider-app/app/lib/global-blocks.server.ts
import { prisma } from "~/db.server";

export type GlobalBlock = {
  id: string;
  name: string;
  content: any[];
  zones: Record<string, any[]>;
  createdAt: Date;
  updatedAt: Date;
};

function parse(r: any): GlobalBlock {
  return { ...r, content: JSON.parse(r.content), zones: JSON.parse(r.zones) };
}

export async function getAllGlobalBlocks(shop: string): Promise<GlobalBlock[]> {
  const rows = await prisma.globalBlock.findMany({ where: { shop }, orderBy: { createdAt: "desc" } });
  return rows.map(parse);
}

export async function getGlobalBlockById(shop: string, id: string): Promise<GlobalBlock | null> {
  const row = await prisma.globalBlock.findFirst({ where: { id, shop } });
  return row ? parse(row) : null;
}

export async function createGlobalBlock(shop: string, name: string, content: any[], zones: Record<string, any[]> = {}): Promise<GlobalBlock> {
  const row = await prisma.globalBlock.create({
    data: { shop, name, content: JSON.stringify(content), zones: JSON.stringify(zones) },
  });
  return parse(row);
}

export async function updateGlobalBlock(shop: string, id: string, updates: Partial<{ name: string; content: any[]; zones: Record<string, any[]> }>): Promise<GlobalBlock> {
  const row = await prisma.globalBlock.update({
    where: { id },
    data: {
      ...(updates.name    !== undefined && { name: updates.name }),
      ...(updates.content !== undefined && { content: JSON.stringify(updates.content) }),
      ...(updates.zones   !== undefined && { zones: JSON.stringify(updates.zones) }),
    },
  });
  return parse(row);
}

export async function deleteGlobalBlock(shop: string, id: string): Promise<void> {
  await prisma.globalBlock.delete({ where: { id } });
}
```

### 4.5 — `app/lib/saved-blocks.server.ts` (adapt to Prisma)

```ts
// page-buider-app/app/lib/saved-blocks.server.ts
import { prisma } from "~/db.server";

export type SavedBlock = {
  id: string;
  name: string;
  content: any[];
  thumbnail?: string | null;
  createdAt: Date;
};

function parse(r: any): SavedBlock {
  return { ...r, content: JSON.parse(r.content) };
}

export async function getAllSavedBlocks(shop: string): Promise<SavedBlock[]> {
  const rows = await prisma.savedBlock.findMany({ where: { shop }, orderBy: { createdAt: "desc" } });
  return rows.map(parse);
}

export async function createSavedBlock(shop: string, name: string, content: any[], thumbnail?: string): Promise<SavedBlock> {
  const row = await prisma.savedBlock.create({
    data: { shop, name, content: JSON.stringify(content), thumbnail },
  });
  return parse(row);
}

export async function updateSavedBlock(shop: string, id: string, updates: { name?: string; content?: any[] }): Promise<SavedBlock> {
  const row = await prisma.savedBlock.update({
    where: { id },
    data: {
      ...(updates.name    !== undefined && { name: updates.name }),
      ...(updates.content !== undefined && { content: JSON.stringify(updates.content) }),
    },
  });
  return parse(row);
}

export async function deleteSavedBlock(shop: string, id: string): Promise<void> {
  await prisma.savedBlock.delete({ where: { id } });
}
```

### 4.6 — `app/lib/settings.server.ts` (adapt to Prisma)

```ts
// page-buider-app/app/lib/settings.server.ts
import { prisma } from "~/db.server";

export type GlobalSettings = Record<string, unknown>;

const DEFAULTS: GlobalSettings = {
  theme: "light",
  primaryColor: "#000000",
  secondaryColor: "#ffffff",
  accentColor: "#3b82f6",
  textColor: "#111111",
  backgroundColor: "#ffffff",
  fontFamily: "Inter, system-ui, sans-serif",
  headingFont: "Inter, system-ui, sans-serif",
  baseFontSize: "16px",
  lineHeight: "1.6",
  containerWidth: "1200px",
  columnGap: "24px",
  rowGap: "24px",
  borderRadius: "8px",
  buttonStyle: "rounded",
};

export async function getSettings(shop: string): Promise<GlobalSettings> {
  const row = await prisma.globalSettings.findUnique({ where: { shop } });
  return row ? { ...DEFAULTS, ...JSON.parse(row.data) } : DEFAULTS;
}

export async function saveSettings(shop: string, settings: GlobalSettings): Promise<void> {
  await prisma.globalSettings.upsert({
    where: { shop },
    update: { data: JSON.stringify(settings) },
    create: { shop, data: JSON.stringify(settings) },
  });
}
```

### 4.7 — `app/lib/global-layout.server.ts` (adapt to Prisma)

```ts
// page-buider-app/app/lib/global-layout.server.ts
import { prisma } from "~/db.server";
import type { Data } from "@measured/puck";

export async function getGlobalLayout(shop: string): Promise<{ header: Data; footer: Data }> {
  const row = await prisma.globalLayout.findUnique({ where: { shop } });
  return {
    header: row ? JSON.parse(row.header) : { content: [], root: { props: {} }, zones: {} },
    footer: row ? JSON.parse(row.footer) : { content: [], root: { props: {} }, zones: {} },
  };
}

export async function saveHeader(shop: string, data: Data): Promise<void> {
  await prisma.globalLayout.upsert({
    where: { shop },
    update: { header: JSON.stringify(data) },
    create: { shop, header: JSON.stringify(data), footer: "{}" },
  });
}

export async function saveFooter(shop: string, data: Data): Promise<void> {
  await prisma.globalLayout.upsert({
    where: { shop },
    update: { footer: JSON.stringify(data) },
    create: { shop, header: "{}", footer: JSON.stringify(data) },
  });
}
```

### 4.8 — Copy resolve utilities (copy as-is)

These files have no db.json dependency — copy them unchanged:

```
my-app/app/lib/resolve-global-blocks.ts  →  page-buider-app/app/lib/resolve-global-blocks.ts
my-app/app/lib/resolve-saved-blocks.ts   →  page-buider-app/app/lib/resolve-saved-blocks.ts
```

---

## 5. Copy `puck.config.tsx`

The `puck.config.tsx` contains all 21+ component definitions. Copy it directly to the root of `page-buider-app`:

```bash
copy D:\page-builder-next-app\my-app\puck.config.tsx
     D:\page-builder-next-app\page-buider-app\puck.config.tsx
```

After copying, check imports at the top of the file. The only changes needed are:

1. If it imports from `~/routes/puck-splat/types` → update to new path
2. If it imports from `~/routes/puck-splat/constants` → update to new path
3. Any `@my-app/puck-editor` import → change to `@measured/puck`

Example fix:
```ts
// Before (my-app)
import { ComponentConfig, Config, Data } from "@my-app/puck-editor";

// After (page-buider-app)
import type { ComponentConfig, Config, Data } from "@measured/puck";
```

---

## 6. Copy puck-splat Components & Hooks

Create the directory structure first:

```
page-buider-app/app/puck-splat/
  types.ts
  constants.tsx
  utils.tsx
  hooks/
    useSavedBlocks.ts
  plugins/
    GlobalSettingsPlugin.tsx
  components/
    ComponentsPanelWithTabs.tsx
    LibraryModal.tsx
    SavedBlocksPanel.tsx
    GlobalBlocksPanel.tsx
    SaveBlockModal.tsx
    EditBlockModal.tsx
    SaveAsGlobalBlockModal.tsx
    EditGlobalBlockModal.tsx
    ModalShell.tsx
```

Copy all files from `my-app/app/routes/puck-splat/` to `page-buider-app/app/puck-splat/`.

**After copying, fix these import paths** in every file (find & replace):

| Old import path | New import path |
|---|---|
| `~/routes/puck-splat/types` | `~/puck-splat/types` |
| `~/routes/puck-splat/constants` | `~/puck-splat/constants` |
| `~/routes/puck-splat/utils` | `~/puck-splat/utils` |
| `@my-app/puck-editor` | `@measured/puck` |

Also copy:
```
my-app/app/components/confirm-modal.tsx  →  page-buider-app/app/components/confirm-modal.tsx
my-app/app/components/puck-render.tsx    →  page-buider-app/app/components/puck-render.tsx
```

In `puck-render.tsx`, fix the import:
```ts
// Before
import { Render } from "@my-app/puck-editor";
// After
import { Render } from "@measured/puck";
```

---

## 7. Create All App Routes

Here is every route file to create in `page-buider-app/app/routes/`.

### 7.1 — Update `app/routes/app.tsx` (Navigation)

Replace the existing `app.tsx` navigation links to match the page builder sections:

```tsx
// page-buider-app/app/routes/app.tsx
import { AppProvider } from "@shopify/polaris";
import { NavMenu } from "@shopify/app-bridge-react";
import { Outlet } from "react-router";
import "@shopify/polaris/build/esm/styles.css";
import enTranslations from "@shopify/polaris/locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export default function App() {
  return (
    <AppProvider i18n={enTranslations}>
      <NavMenu>
        <a href="/app" rel="home">Dashboard</a>
        <a href="/app/pages">Pages</a>
        <a href="/app/settings">Settings</a>
        <a href="/app/settings/header">Header</a>
        <a href="/app/settings/footer">Footer</a>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}
```

### 7.2 — API Routes (no Polaris — pure JSON)

These handle AJAX calls from the Puck editor. Create them at:

**`app/routes/api.saved-blocks.ts`**

```ts
// page-buider-app/app/routes/api.saved-blocks.ts
import { authenticate } from "~/shopify.server";
import {
  getAllSavedBlocks, createSavedBlock, updateSavedBlock, deleteSavedBlock,
} from "~/lib/saved-blocks.server";

export async function loader({ request }: { request: Request }) {
  const { session } = await authenticate.admin(request);
  const blocks = await getAllSavedBlocks(session.shop);
  return Response.json(blocks);
}

export async function action({ request }: { request: Request }) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  if (request.method === "POST") {
    const { name, content, thumbnail } = await request.json();
    const block = await createSavedBlock(shop, name, content, thumbnail);
    return Response.json(block);
  }

  if (request.method === "PUT") {
    const { id, ...updates } = await request.json();
    const block = await updateSavedBlock(shop, id, updates);
    return Response.json(block);
  }

  if (request.method === "DELETE") {
    const { id } = await request.json();
    await deleteSavedBlock(shop, id);
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
```

**`app/routes/api.global-blocks.ts`**

```ts
// page-buider-app/app/routes/api.global-blocks.ts
import { authenticate } from "~/shopify.server";
import {
  getAllGlobalBlocks, createGlobalBlock, updateGlobalBlock, deleteGlobalBlock,
} from "~/lib/global-blocks.server";

export async function loader({ request }: { request: Request }) {
  const { session } = await authenticate.admin(request);
  const blocks = await getAllGlobalBlocks(session.shop);
  return Response.json(blocks);
}

export async function action({ request }: { request: Request }) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  if (request.method === "POST") {
    const { name, content, zones } = await request.json();
    const block = await createGlobalBlock(shop, name, content, zones);
    return Response.json(block);
  }

  if (request.method === "PUT") {
    const { id, ...updates } = await request.json();
    const block = await updateGlobalBlock(shop, id, updates);
    return Response.json(block);
  }

  if (request.method === "DELETE") {
    const { id } = await request.json();
    await deleteGlobalBlock(shop, id);
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
```

**`app/routes/api.page-data.ts`** (save/load page JSON for the Puck editor)

```ts
// page-buider-app/app/routes/api.page-data.ts
import { authenticate } from "~/shopify.server";
import { getPageBySlug, updatePage } from "~/lib/pages.server";

export async function loader({ request }: { request: Request }) {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug") ?? "";
  const page = await getPageBySlug(session.shop, slug);
  return Response.json(page?.data ?? { content: [], root: { props: {} }, zones: {} });
}

export async function action({ request }: { request: Request }) {
  const { session } = await authenticate.admin(request);
  const { slug, data } = await request.json();
  await updatePage(session.shop, slug, data);
  return Response.json({ ok: true });
}
```

---

## 8. Rebuild Admin Shell with Polaris

These are the screens the merchant sees in Shopify admin — fully Polaris.

### 8.1 — `app/routes/app._index.tsx` — Dashboard

Replace the demo content entirely:

```tsx
// page-buider-app/app/routes/app._index.tsx
import { redirect } from "react-router";
export function loader() {
  return redirect("/app/pages");
}
```

### 8.2 — `app/routes/app.pages._index.tsx` — Pages List

```tsx
// page-buider-app/app/routes/app.pages._index.tsx
import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "~/shopify.server";
import { getAllPages, deletePageBySlug } from "~/lib/pages.server";
import {
  Page, Layout, Card, ResourceList, ResourceItem, Text,
  Button, EmptyState, Badge, InlineStack, BlockStack,
  Banner, Link,
} from "@shopify/polaris";
import { useState } from "react";

export async function loader({ request }: { request: Request }) {
  const { session } = await authenticate.admin(request);
  const pages = await getAllPages(session.shop);
  return { pages };
}

export async function action({ request }: { request: Request }) {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const slug = form.get("slug") as string;
  if (form.get("_action") === "delete") {
    await deletePageBySlug(session.shop, slug);
  }
  return null;
}

export default function PagesIndex() {
  const { pages } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Page
      title="Pages"
      primaryAction={
        <Button variant="primary" onClick={() => navigate("/app/pages/new")}>
          Create Page
        </Button>
      }
    >
      <Layout>
        <Layout.Section>
          <Card padding="0">
            {pages.length === 0 ? (
              <EmptyState
                heading="No pages yet"
                action={{ content: "Create your first page", onAction: () => navigate("/app/pages/new") }}
                image=""
              >
                <p>Build beautiful pages with the drag-and-drop editor.</p>
              </EmptyState>
            ) : (
              <ResourceList
                items={pages}
                renderItem={(page) => (
                  <ResourceItem
                    id={page.id}
                    onClick={() => navigate(`/app/pages/${page.slug}/edit`)}
                  >
                    <InlineStack align="space-between" blockAlign="center">
                      <BlockStack gap="100">
                        <Text variant="bodyMd" fontWeight="semibold">{page.title}</Text>
                        <Text variant="bodySm" tone="subdued">/{page.slug}</Text>
                      </BlockStack>
                      <InlineStack gap="200">
                        <Text variant="bodySm" tone="subdued">
                          {new Date(page.updatedAt).toLocaleDateString()}
                        </Text>
                        <Button
                          variant="plain"
                          tone="critical"
                          onClick={(e) => {
                            e.stopPropagation();
                            const form = new FormData();
                            form.append("_action", "delete");
                            form.append("slug", page.slug);
                            fetch("/app/pages", { method: "POST", body: form });
                          }}
                        >
                          Delete
                        </Button>
                      </InlineStack>
                    </InlineStack>
                  </ResourceItem>
                )}
              />
            )}
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text variant="headingSm">Global Layout</Text>
              <Link url="/app/settings/header">Edit Header</Link>
              <Link url="/app/settings/footer">Edit Footer</Link>
              <Link url="/app/settings">Design Settings</Link>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

### 8.3 — `app/routes/app.pages.new.tsx` — Create Page

```tsx
// page-buider-app/app/routes/app.pages.new.tsx
import { redirect } from "react-router";
import { useActionData, useNavigate, Form } from "react-router";
import { authenticate } from "~/shopify.server";
import { createPage } from "~/lib/pages.server";
import { generateSlug } from "~/lib/slug";
import {
  Page, Layout, Card, FormLayout, TextField,
  Button, BlockStack, InlineStack, Banner,
} from "@shopify/polaris";
import { useState } from "react";

export async function action({ request }: { request: Request }) {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const title = (form.get("title") as string).trim();
  if (!title) return { error: "Title is required" };

  const slug = generateSlug(title);
  try {
    await createPage(session.shop, title, slug);
    return redirect(`/app/pages/${slug}/edit`);
  } catch {
    return { error: "A page with that title already exists." };
  }
}

export default function NewPage() {
  const data = useActionData<typeof action>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");

  return (
    <Page
      title="New Page"
      backAction={{ content: "Pages", onAction: () => navigate("/app/pages") }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Form method="post">
              <BlockStack gap="400">
                {data?.error && <Banner tone="critical">{data.error}</Banner>}
                <FormLayout>
                  <TextField
                    label="Page Title"
                    name="title"
                    value={title}
                    onChange={setTitle}
                    autoComplete="off"
                    placeholder="e.g. About Us"
                  />
                </FormLayout>
                <InlineStack gap="200" align="end">
                  <Button onClick={() => navigate("/app/pages")}>Cancel</Button>
                  <Button variant="primary" submit>Create & Edit</Button>
                </InlineStack>
              </BlockStack>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

---

## 9. Puck Editor Route Inside Shopify

This is the most important route. It renders the full Puck drag-and-drop editor inside the Shopify admin iframe.

**Key difference from `my-app`:** The Shopify embed is sandboxed inside an iframe. The Puck editor must load inside a `<Page>` Polaris wrapper and use the `authenticate.admin` session to know which shop's data to load.

### 9.1 — `app/routes/app.pages.$slug.edit.tsx`

```tsx
// page-buider-app/app/routes/app.pages.$slug.edit.tsx
import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "~/shopify.server";
import { getPageBySlug } from "~/lib/pages.server";
import { getAllSavedBlocks } from "~/lib/saved-blocks.server";
import { getAllGlobalBlocks } from "~/lib/global-blocks.server";
import { getSettings } from "~/lib/settings.server";
import { getGlobalLayout } from "~/lib/global-layout.server";
import { redirect } from "react-router";
import { Page, Box } from "@shopify/polaris";
import { PuckEditorShell } from "~/components/PuckEditorShell";

export async function loader({ request, params }: { request: Request; params: { slug: string } }) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const slug = params.slug;

  const page = await getPageBySlug(shop, slug);
  if (!page) return redirect("/app/pages");

  const [savedBlocks, globalBlocks, settings, layout] = await Promise.all([
    getAllSavedBlocks(shop),
    getAllGlobalBlocks(shop),
    getSettings(shop),
    getGlobalLayout(shop),
  ]);

  return { page, savedBlocks, globalBlocks, settings, layout };
}

export default function EditPage() {
  const { page, savedBlocks, globalBlocks, settings } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    // fullWidth removes Polaris max-width constraint so Puck fills the screen
    <Page fullWidth title="">
      <Box>
        <PuckEditorShell
          page={page}
          savedBlocks={savedBlocks}
          globalBlocks={globalBlocks}
          settings={settings}
          onBack={() => navigate("/app/pages")}
        />
      </Box>
    </Page>
  );
}
```

### 9.2 — `app/components/PuckEditorShell.tsx`

This component wraps the Puck editor and connects it to the Shopify API routes. It is the direct equivalent of `my-app/app/routes/puck-splat.tsx` but adapted for Shopify embed.

```tsx
// page-buider-app/app/components/PuckEditorShell.tsx
import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { config } from "../../puck.config";            // root-level puck.config.tsx
import { useState, useCallback } from "react";
import { Button, InlineStack, Text, Banner, Box } from "@shopify/polaris";
import { ComponentsPanelWithTabs } from "~/puck-splat/components/ComponentsPanelWithTabs";
import { GlobalSettingsPlugin } from "~/puck-splat/plugins/GlobalSettingsPlugin";
import type { PageRecord } from "~/lib/pages.server";
import type { SavedBlock } from "~/lib/saved-blocks.server";
import type { GlobalBlock } from "~/lib/global-blocks.server";

type Props = {
  page: PageRecord;
  savedBlocks: SavedBlock[];
  globalBlocks: GlobalBlock[];
  settings: Record<string, unknown>;
  onBack: () => void;
};

export function PuckEditorShell({ page, savedBlocks, globalBlocks, settings, onBack }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError]  = useState<string | null>(null);

  const handlePublish = useCallback(async (data: Data) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/page-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: page.slug, data }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [page.slug]);

  // Build dynamic config with SavedBlock + GlobalBlock components injected
  // (same pattern as puck-splat.tsx in my-app)
  const dynamicConfig = buildDynamicConfig(config, savedBlocks, globalBlocks);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)" }}>
      {/* Top bar */}
      <Box padding="200" background="bg-surface-secondary">
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="300" blockAlign="center">
            <Button onClick={onBack} variant="plain">← Pages</Button>
            <Text variant="headingMd">{page.title}</Text>
          </InlineStack>
          <InlineStack gap="200">
            {saved && <Text tone="success">Saved!</Text>}
            {error && <Text tone="critical">{error}</Text>}
          </InlineStack>
        </InlineStack>
      </Box>

      {/* Puck Editor fills remaining height */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Puck
          config={dynamicConfig}
          data={page.data}
          onPublish={handlePublish}
          plugins={[GlobalSettingsPlugin]}
          overrides={{
            // Replace Puck's default component list with our custom tabbed panel
            components: () => (
              <ComponentsPanelWithTabs
                savedBlocks={savedBlocks}
                globalBlocks={globalBlocks}
              />
            ),
          }}
        />
      </div>
    </div>
  );
}

// Builds a merged Puck config that includes dynamic SavedBlock + GlobalBlock components.
// This is copied from the pattern used in my-app/puck-splat.tsx.
function buildDynamicConfig(base: any, saved: SavedBlock[], global: GlobalBlock[]) {
  const savedComponents: Record<string, any> = {};
  saved.forEach(sb => {
    savedComponents[`SavedBlock_${sb.name}`] = {
      label: sb.name,
      fields: {},
      render: () => (
        <div data-saved-block={sb.id}>
          {/* The actual content resolves from savedBlock.content at render time */}
          <span style={{ opacity: 0.5, fontSize: 12 }}>Saved: {sb.name}</span>
        </div>
      ),
    };
  });

  const globalComponents: Record<string, any> = {};
  global.forEach(gb => {
    globalComponents[`GlobalBlock_${gb.name}`] = {
      label: `🌐 ${gb.name}`,
      fields: {},
      render: () => (
        <div data-global-block={gb.id}>
          <span style={{ opacity: 0.5, fontSize: 12 }}>Global: {gb.name}</span>
        </div>
      ),
    };
  });

  return {
    ...base,
    components: {
      ...base.components,
      ...savedComponents,
      ...globalComponents,
    },
  };
}
```

---

## 10. Polaris Panels (Drawer, Modals, Library)

The `ComponentsPanelWithTabs` and modal components from `my-app` use Tailwind + custom CSS for their own styling. Since they render **inside the Puck editor sidebar** (not in the Polaris page shell), they work fine as-is.

However, the **modals** (SaveBlockModal, EditBlockModal, etc.) that float over the page should be upgraded to use **Polaris Modal** for a consistent look inside Shopify admin.

### Replace custom modal wrappers with Polaris Modal

For each modal in `app/puck-splat/components/`, replace the `ModalShell` wrapper with Polaris `Modal`:

**Before (uses custom ModalShell):**
```tsx
import { ModalShell } from "./ModalShell";

export function SaveBlockModal({ open, onClose, onSave }) {
  return (
    <ModalShell open={open} onClose={onClose} title="Save Block">
      ...
    </ModalShell>
  );
}
```

**After (uses Polaris Modal):**
```tsx
import { Modal, TextField, BlockStack, Text } from "@shopify/polaris";
import { useState } from "react";

export function SaveBlockModal({ open, onClose, onSave }) {
  const [name, setName] = useState("");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Save Block"
      primaryAction={{ content: "Save", onAction: () => { onSave(name); onClose(); } }}
      secondaryActions={[{ content: "Cancel", onAction: onClose }]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          <Text>This block will appear in your Saved Blocks library.</Text>
          <TextField
            label="Block Name"
            value={name}
            onChange={setName}
            autoComplete="off"
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
```

Apply the same pattern to:
- `EditBlockModal.tsx`
- `SaveAsGlobalBlockModal.tsx`
- `EditGlobalBlockModal.tsx`
- `LibraryModal.tsx` (use Polaris `Modal` with `size="large"`)

The `ComponentsPanelWithTabs` sidebar panel uses its own Tailwind styles and does not need Polaris — it renders inside the Puck editor chrome.

---

## 11. Global Settings Route

### `app/routes/app.settings.tsx`

```tsx
// page-buider-app/app/routes/app.settings.tsx
import { useLoaderData, Form } from "react-router";
import { authenticate } from "~/shopify.server";
import { getSettings, saveSettings } from "~/lib/settings.server";
import {
  Page, Layout, Card, FormLayout, TextField, Select,
  Button, BlockStack, InlineStack, ColorPicker, hsbToHex,
  hexToHsb, RangeSlider, Divider, Text, Banner,
} from "@shopify/polaris";
import { useState } from "react";

const FONT_OPTIONS = [
  "Inter, system-ui, sans-serif", "Roboto, sans-serif",
  "Open Sans, sans-serif", "Poppins, sans-serif",
  "Playfair Display, serif", "Lora, serif",
  "Montserrat, sans-serif", "Raleway, sans-serif",
].map(f => ({ label: f.split(",")[0], value: f }));

const CONTAINER_OPTIONS = [
  { label: "960px",  value: "960px"  },
  { label: "1200px", value: "1200px" },
  { label: "1440px", value: "1440px" },
  { label: "Full Width", value: "100%" },
];

export async function loader({ request }: { request: Request }) {
  const { session } = await authenticate.admin(request);
  const settings = await getSettings(session.shop);
  return { settings };
}

export async function action({ request }: { request: Request }) {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const settings = JSON.parse(form.get("settings") as string);
  await saveSettings(session.shop, settings);
  return { ok: true };
}

export default function SettingsPage() {
  const { settings: initial } = useLoaderData<typeof loader>();
  const [settings, setSettings] = useState(initial);
  const [saved, setSaved] = useState(false);

  const set = (key: string, val: unknown) => setSettings((s: any) => ({ ...s, [key]: val }));

  async function handleSave() {
    const form = new FormData();
    form.append("settings", JSON.stringify(settings));
    await fetch("/app/settings", { method: "POST", body: form });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <Page
      title="Design Settings"
      primaryAction={<Button variant="primary" onClick={handleSave}>Save Settings</Button>}
    >
      {saved && <Banner tone="success">Settings saved successfully.</Banner>}
      <Layout>
        {/* Typography */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingSm">Typography</Text>
              <Divider />
              <FormLayout>
                <Select
                  label="Body Font"
                  options={FONT_OPTIONS}
                  value={settings.fontFamily as string}
                  onChange={v => set("fontFamily", v)}
                />
                <Select
                  label="Heading Font"
                  options={FONT_OPTIONS}
                  value={settings.headingFont as string}
                  onChange={v => set("headingFont", v)}
                />
                <TextField
                  label="Base Font Size"
                  value={settings.baseFontSize as string}
                  onChange={v => set("baseFontSize", v)}
                  autoComplete="off"
                />
                <TextField
                  label="Line Height"
                  value={settings.lineHeight as string}
                  onChange={v => set("lineHeight", v)}
                  autoComplete="off"
                />
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Colors */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingSm">Colors</Text>
              <Divider />
              <FormLayout>
                <TextField label="Primary Color"   value={settings.primaryColor as string}   onChange={v => set("primaryColor", v)}   autoComplete="off" />
                <TextField label="Secondary Color" value={settings.secondaryColor as string} onChange={v => set("secondaryColor", v)} autoComplete="off" />
                <TextField label="Accent Color"    value={settings.accentColor as string}    onChange={v => set("accentColor", v)}    autoComplete="off" />
                <TextField label="Background"      value={settings.backgroundColor as string} onChange={v => set("backgroundColor", v)} autoComplete="off" />
                <TextField label="Text Color"      value={settings.textColor as string}      onChange={v => set("textColor", v)}      autoComplete="off" />
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Layout */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingSm">Layout</Text>
              <Divider />
              <FormLayout>
                <Select
                  label="Container Width"
                  options={CONTAINER_OPTIONS}
                  value={settings.containerWidth as string}
                  onChange={v => set("containerWidth", v)}
                />
                <TextField label="Column Gap" value={settings.columnGap as string} onChange={v => set("columnGap", v)} autoComplete="off" />
                <TextField label="Row Gap"    value={settings.rowGap as string}    onChange={v => set("rowGap", v)}    autoComplete="off" />
                <TextField label="Border Radius" value={settings.borderRadius as string} onChange={v => set("borderRadius", v)} autoComplete="off" />
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Custom CSS */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingSm">Custom CSS</Text>
              <TextField
                label=""
                value={settings.customCSS as string ?? ""}
                onChange={v => set("customCSS", v)}
                multiline={8}
                autoComplete="off"
                monospaced
              />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

---

## 12. Header & Footer Editor Routes

These open the Puck editor but load/save to `GlobalLayout` instead of a page.

### `app/routes/app.settings.header.tsx`

```tsx
// page-buider-app/app/routes/app.settings.header.tsx
import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "~/shopify.server";
import { getGlobalLayout, saveHeader } from "~/lib/global-layout.server";
import { Puck } from "@measured/puck";
import "@measured/puck/puck.css";
import { headerConfig } from "../../puck.config";  // export a headerConfig from puck.config.tsx
import { Page, Box, Button, InlineStack, Text } from "@shopify/polaris";

export async function loader({ request }: { request: Request }) {
  const { session } = await authenticate.admin(request);
  const layout = await getGlobalLayout(session.shop);
  return { data: layout.header };
}

export default function HeaderEditor() {
  const { data } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Page fullWidth title="">
      <Box padding="200" background="bg-surface-secondary">
        <InlineStack align="space-between">
          <Button onClick={() => navigate("/app/pages")} variant="plain">← Back to Pages</Button>
          <Text variant="headingMd">Global Header</Text>
          <div />
        </InlineStack>
      </Box>
      <Puck
        config={headerConfig}
        data={data}
        onPublish={async (d) => {
          await fetch("/api/global-layout/header", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: d }),
          });
        }}
      />
    </Page>
  );
}
```

Create `app/routes/api.global-layout.header.ts` and `api.global-layout.footer.ts` similarly to other API routes, calling `saveHeader` / `saveFooter`.

Create `app/routes/app.settings.footer.tsx` using the same pattern with `footerConfig` and `saveFooter`.

---

## 13. Run & Test

### Start development server

```bash
cd D:\page-builder-next-app\page-buider-app

# Run Shopify CLI dev (opens ngrok tunnel + installs on dev store)
shopify app dev
```

The CLI will print a URL like `https://abc123.trycloudflare.com`. Open it in your Shopify dev store admin.

### Test checklist

| Feature | Expected behaviour |
|---|---|
| `/app/pages` | Lists all pages from Prisma DB |
| "Create Page" | Creates page row, redirects to editor |
| Editor loads | Puck canvas opens with all 21+ component types in sidebar |
| Drag & drop | Blocks move on canvas correctly |
| Save button | `POST /api/page-data` → Prisma updates |
| Saved blocks tab | Shows saved blocks from DB |
| Save block modal | Polaris `Modal` opens, saves to DB |
| Global blocks tab | Shows global blocks from DB |
| Global settings plugin | Colors/fonts in Puck sidebar |
| Settings route | Polaris form saves to GlobalSettings table |
| Header/Footer routes | Puck editor opens, saves to GlobalLayout table |
| Delete page | Page removed from DB |

---

## 14. File Map After Migration

```
page-buider-app/
├── shopify.app.toml
├── puck.config.tsx                        ← copied from my-app (root level)
├── package.json
├── vite.config.ts                         ← + tailwindcss plugin
│
├── prisma/
│   └── schema.prisma                      ← + Page, GlobalBlock, SavedBlock,
│                                              GlobalSettings, GlobalLayout models
│
├── app/
│   ├── root.tsx                           ← + import styles.css
│   ├── styles.css                         ← @import tailwindcss (NEW)
│   ├── shopify.server.ts                  ← unchanged
│   ├── db.server.ts                       ← unchanged (Prisma client)
│   │
│   ├── lib/                               ← NEW DIRECTORY
│   │   ├── slug.ts                        ← copied as-is
│   │   ├── library.types.ts               ← copied as-is
│   │   ├── pages.server.ts                ← adapted (Prisma)
│   │   ├── global-blocks.server.ts        ← adapted (Prisma)
│   │   ├── saved-blocks.server.ts         ← adapted (Prisma)
│   │   ├── settings.server.ts             ← adapted (Prisma)
│   │   ├── global-layout.server.ts        ← adapted (Prisma)
│   │   ├── resolve-global-blocks.ts       ← copied as-is
│   │   └── resolve-saved-blocks.ts        ← copied as-is
│   │
│   ├── puck-splat/                        ← NEW DIRECTORY (from my-app/routes/puck-splat)
│   │   ├── types.ts
│   │   ├── constants.tsx
│   │   ├── utils.tsx
│   │   ├── hooks/
│   │   │   └── useSavedBlocks.ts
│   │   ├── plugins/
│   │   │   └── GlobalSettingsPlugin.tsx
│   │   └── components/
│   │       ├── ComponentsPanelWithTabs.tsx
│   │       ├── LibraryModal.tsx           ← upgrade to Polaris Modal
│   │       ├── SavedBlocksPanel.tsx
│   │       ├── GlobalBlocksPanel.tsx
│   │       ├── SaveBlockModal.tsx         ← upgrade to Polaris Modal
│   │       ├── EditBlockModal.tsx         ← upgrade to Polaris Modal
│   │       ├── SaveAsGlobalBlockModal.tsx ← upgrade to Polaris Modal
│   │       ├── EditGlobalBlockModal.tsx   ← upgrade to Polaris Modal
│   │       └── ModalShell.tsx             ← kept or removed
│   │
│   ├── components/                        ← NEW DIRECTORY
│   │   ├── PuckEditorShell.tsx            ← NEW (Puck inside Shopify embed)
│   │   ├── confirm-modal.tsx              ← copied, upgrade to Polaris Modal
│   │   └── puck-render.tsx                ← copied, fix import
│   │
│   └── routes/
│       ├── app.tsx                        ← updated NavMenu links
│       ├── app._index.tsx                 ← redirect to /app/pages
│       ├── app.pages._index.tsx           ← NEW (Polaris pages list)
│       ├── app.pages.new.tsx              ← NEW (Polaris create form)
│       ├── app.pages.$slug.edit.tsx       ← NEW (loads PuckEditorShell)
│       ├── app.settings.tsx               ← NEW (Polaris settings form)
│       ├── app.settings.header.tsx        ← NEW (Puck header editor)
│       ├── app.settings.footer.tsx        ← NEW (Puck footer editor)
│       ├── api.page-data.ts               ← NEW (load/save page JSON)
│       ├── api.saved-blocks.ts            ← NEW (CRUD)
│       ├── api.global-blocks.ts           ← NEW (CRUD)
│       ├── api.global-layout.header.ts    ← NEW
│       ├── api.global-layout.footer.ts    ← NEW
│       ├── auth.$.tsx                     ← unchanged
│       ├── auth.login/                    ← unchanged
│       ├── webhooks.*.tsx                 ← unchanged
│       └── _index/                        ← unchanged (public landing)
```

---

## Summary of What Changes vs What Stays the Same

| | Stays the same | Changes |
|---|---|---|
| **Puck canvas components** | ✅ All 21+ blocks (Hero, Button, Grid…) | Import path only |
| **Block logic** | ✅ All props, fields, render functions | Nothing |
| **Drag & drop** | ✅ Same @dnd-kit behaviour | Nothing |
| **Global settings plugin** | ✅ Same CSS variable system | Import path |
| **Saved/Global block logic** | ✅ Same CRUD operations | JSON → Prisma DB |
| **Admin UI shell** | ❌ Was Tailwind custom UI | → Shopify Polaris |
| **Modal windows** | ❌ Were custom ModalShell | → Polaris Modal |
| **Database** | ❌ Was db.json file | → Prisma SQLite |
| **Auth** | ❌ Was none | → Shopify OAuth |
| **Route structure** | Partial — same React Router | Shopify `app.*` prefix |
