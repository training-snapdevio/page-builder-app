# page-builder-app

A Shopify-embedded visual page builder for merchant storefronts. Merchants create custom pages by dragging and dropping blocks in a Puck-powered editor, with per-shop persistence and a shared design system.

---

## Stack

| Layer | Tech |
|---|---|
| Embedding shell | Shopify App Bridge + Shopify Polaris **web components** (`<s-page>`, `<s-section>`, `<s-button>`, `<s-stack>`, `<s-app-window>`, `<s-app-nav>`, …) |
| App framework | React Router v7 (SSR + file-based routes via `@react-router/fs-routes`) |
| Auth & session | `@shopify/shopify-app-react-router` with `PrismaSessionStorage` |
| Database | Prisma + SQLite (dev) — sessions and all merchant data |
| Visual editor | `@my-app/puck-editor` (local workspace package, Puck v0.21.1 fork) |
| Editor styling | Tailwind v4 (`@tailwindcss/vite`) + Puck's own CSS |
| Icons | `lucide-react` |
| Build | Vite 6 |

---

## How it works

### 1. Pages dashboard — `/app`

Lives inside the Shopify Admin iframe. Built entirely with Polaris web components.

- `loader` calls `authenticate.admin(request)`, then `getAllPages(session.shop)`
- Renders each page row with **Edit** and **Delete** actions
- **Edit** sets `editingSlug` state → a single `<s-app-window id="page-editor" src={`/editor/${slug}`}>` is rendered → `useEffect` calls `.show()` on it
- **Delete** uses `useFetcher` with `method="DELETE"` to call the same route's `action`, which calls `deletePageBySlug`

### 2. Editor — `/editor/:slug`

Loaded inside the App Window iframe. **Not** inside the `app.tsx` layout (so it gets full screen, no Polaris app nav). Receives Shopify auth via the App Window iframe context.

- `loader` parallel-loads page data, saved blocks, global blocks, and global settings — all scoped to `session.shop`
- The route SSRs a `"Loading editor…"` fallback. The real `PuckSplatEditor` is **`React.lazy()`**-loaded on the client. This keeps the 13,100-line `puck.config.tsx` off the server entirely — it would otherwise hang SSR
- Once mounted, `PuckSplatEditor` renders the full Puck drag-and-drop UI with custom overrides (components panel with tabs, drawer items with hover previews, library modal, global-settings sidebar plugin, iframe theme injector)
- **Save** → `POST /api/pages/:slug` with `{ data }` payload
- **All Pages** link in the editor header calls `window.parent.location.href = "/app"`, which closes the App Window

### 3. API routes

All thin wrappers around `app/lib/*.server.ts` modules, all scoped by `session.shop`:

| Route | Methods | Purpose |
|---|---|---|
| `/api/pages/:slug` | GET, POST | Read / update page data |
| `/api/saved-blocks` | GET, POST, DELETE | Per-shop reusable block snippets |
| `/api/global-blocks` | GET, POST, PUT, DELETE | Per-shop shared blocks (edit once, reflect everywhere) |
| `/api/global-settings` | GET, POST | Per-shop design system tokens (colors, fonts, spacing, …) |

---

## Data format

### Page record (Prisma)

```ts
{
  id: string,            // cuid
  shop: string,          // myshopify domain
  slug: string,          // url-safe identifier — unique per shop
  title: string,
  data: string,          // JSON-serialized Puck Data — see below
  createdAt: Date,
  updatedAt: Date,
}
```

### `data` field — Puck `Data` shape

This is the canonical Puck editor format. Everything the visual editor produces lives here:

```ts
{
  content: [                              // top-level blocks on the page
    {
      type: "Hero",                       // component name from puck.config.tsx
      props: {
        id: "Hero-abc123",                // Puck-generated stable id
        title: "Welcome",
        backgroundColor: "#0158ad",
        // …all fields defined by the component's config
      }
    },
    { type: "GridBlock", props: { … } },
    …
  ],
  root: {
    props: {
      title: "About Us",                  // mirrors the page title
      theme: "light"
    }
  },
  zones: {                                // nested DropZones keyed by parent-id:zone-name
    "GridBlock-xyz789:column-1": [
      { type: "Text", props: { … } },
    ]
  }
}
```

### Saved block

```ts
{
  id: string,
  shop: string,
  name: string,
  content: string,    // JSON-serialized array of Puck blocks (same shape as Data.content)
  thumbnail: string | null,
}
```

### Global block

```ts
{
  id: string,
  shop: string,
  name: string,
  content: string,    // JSON array of Puck blocks
  zones: string,      // JSON object of nested DropZones
}
```

A page references a global block by component type `GlobalBlock_<id>`, so updating the global block updates every page that uses it.

### Global settings

```ts
{
  id: string,
  shop: string,              // unique — one settings record per merchant
  settings: string,          // JSON of the GlobalSettings interface
}
```

The `settings` JSON has 40+ fields covering theme, typography (font families, sizes, weights, line heights), colors (primary, secondary, accent, background, text, …), spacing scale, border radius, header/footer config, etc. See `app/lib/settings.defaults.ts` for the full interface.

These get applied as **CSS custom properties** inside Puck's iframe canvas via `IframeThemeInjector`, so every block on the page automatically inherits them.

---

## Shopify storefront integration

Builder pages are published to Shopify via the GraphQL `pageUpdate` mutation —
each page's rendered block HTML is written to `page.body`. Two pieces of
**shared infrastructure** ship via the `page-builder-renderer` theme app
extension (`extensions/page-builder-renderer/`) and are loaded on **every
storefront page** (home, products, collections, and builder pages):

| Asset | Source | Delivery |
|---|---|---|
| Custom global header / footer HTML + CSS | `renderChromeBundle(settings)` → `shop.metafields.page_builder.global_chrome` | App embed reads metafield, emits HTML once site-wide |
| Hide-native-header / hide-native-footer CSS | `settings.hideThemeHeaderSelectors` etc. → `shop.metafields.page_builder.hide_native_{header,footer}` | App embed reads booleans, emits scoped `display:none` |
| Hide-page-title CSS (`{{ page.title }}`) | Static rule in `global-chrome.liquid` | App embed, every page |
| Responsive overrides for block markup | Static rules in `global-chrome.liquid` (`data-page-builder="embed-responsive"`) | App embed, every page |
| Page block markup (primary) | Per-page Puck JSON → `page.metafields.page_builder.content` | Page Builder app block + `assets/builder.js` render client-side |
| Page block markup (fallback) | Per-page `puck-renderer.ts → page.body` | Shopify renders via `{{ page.content }}` for themes without the app block |

**Why this split**: chrome would otherwise be inlined into every page's
`page.body`, blowing past Shopify's 512 KB body limit and causing global
settings to drift (every page would carry a frozen copy of chrome at
publish time). Moving it to the metafield-backed app embed means **one
change in global settings → every storefront page updates on next request**,
no per-page republish needed.

**Merchant setup (one-time)**:
1. In the Shopify Admin → Online Store → Themes → Customize
2. Open **App embeds** in the left sidebar
3. Enable **Page Builder Chrome** — site-wide CSS + header/footer + runtime

(Optional — recommended for pages > 512 KB) Add the **Page Builder** block
to the `page` template:
1. Switch the customizer to a page template (top dropdown → Pages → any page)
2. Click **Add block** in the section containing `{{ page.content }}` (often
   the "Page" or "Main page" section)
3. Pick **Page Builder** from the Apps category
4. Optionally hide the default `{{ page.content }}` block so it doesn't render twice

With the block added, content is rendered **from the page metafield**
(`page.metafields.page_builder.content`) via `assets/builder.js`. This
sidesteps the 512 KB `page.body` limit and gets you working sliders /
animations / scripts that Shopify's HTML sanitizer would otherwise strip
from `page.body`. The save flow always writes both the metafield and a
fallback to `page.body` — so themes without the block still render the
page; themes with it render from the metafield and auto-hide the fallback.

### Responsive behavior

Block markup uses inline CSS for portability, which Shopify sanitizes-safe
but normally can't be overridden by external stylesheets without
`!important`. The chrome embed ships a small `<style data-page-builder=
"embed-responsive">` block with three breakpoints:

- **≤ 640px**: collapses all multi-column grids to a single column,
  shrinks oversized headings, reduces section padding, wraps the global
  header so nav links flow under the brand.
- **641–768px**: same collapse plus PhotoCollage falls back to a clean
  2-column stack.
- **769–1024px**: 4/5/6-column grids collapse to 2 columns; 3-column
  layouts stay as-is (still readable on tablet).
- **> 1024px**: original layout from the editor.

Selectors are attribute-based (e.g. `[style*="grid-template-columns:
repeat(3,"]`) so no renderer change is needed — both `puck-renderer.ts`
and `assets/builder.js` emit the same canonical inline-style strings, and
the chrome embed's CSS overrides catch them both.

To opt out of an override for a specific element, render it with an
inline `media` attribute or a class that's more specific than the
attribute selector.

---

## Multi-tenant isolation

Every Prisma query and every API route takes `shop: string` from `session.shop`. There is no way to read or write another merchant's data — auth is always the first thing every loader/action does:

```ts
const { session } = await authenticate.admin(request);
const pages = await getAllPages(session.shop);
```

---

## Local development

```bash
npm install --legacy-peer-deps      # React 18 + dnd-kit peer mismatch
npm run setup                       # prisma generate + migrate deploy
npm run dev                         # spawns shopify app dev (tunnel + server)
```

Open the **Preview URL** printed in the terminal — not `localhost:3000` directly — so the Shopify Admin frame loads correctly.

### Notes

- The Shopify CLI auto-injects env vars at runtime; no `.env` needed for dev
- Sessions are stored in `prisma/dev.sqlite`. If auth misbehaves, clear it: `echo 'DELETE FROM "Session";' | npx prisma db execute --schema prisma/schema.prisma --stdin`
- HMR WebSocket errors in the App Window iframe are **expected** through the Cloudflare tunnel — they don't break anything, just no hot reload inside the editor

---

## File map

```
app/
├─ routes/
│  ├─ app._index.tsx           Pages dashboard (Polaris)
│  ├─ app.pages.new.tsx        Create page form
│  ├─ app.tsx                  Shopify Admin layout wrapper
│  ├─ editor.$slug.tsx         Fullscreen editor route (lazy-loads PuckSplatEditor)
│  ├─ api.pages.$slug.ts       Page CRUD
│  ├─ api.saved-blocks.ts      Saved block CRUD
│  ├─ api.global-blocks.ts     Global block CRUD
│  └─ api.global-settings.ts   Design system CRUD
├─ lib/
│  ├─ pages.server.ts          Prisma page queries
│  ├─ saved-blocks.server.ts
│  ├─ global-blocks.server.ts
│  ├─ settings.server.ts       Design system + CSS-var generation
│  ├─ settings.defaults.ts     GlobalSettings interface + defaults
│  ├─ library.types.ts         Library item types
│  └─ slug.ts                  URL-safe slug generator with collision suffixing
├─ puck-splat/                 Custom editor extensions
│  ├─ PuckSplatEditor.tsx      Main editor component (default export)
│  ├─ context/GlobalSettingsContext.tsx
│  ├─ plugins/GlobalSettingsPlugin.tsx
│  ├─ components/              LibraryModal, IframeThemeInjector, ComponentsPanelWithTabs, …
│  ├─ hooks/, utils/, constants.tsx, types.ts, utils.tsx
├─ puck.config.tsx             13k-line block definitions (// @ts-nocheck)
├─ shopify.server.ts           shopifyApp() setup
├─ db.server.ts                Prisma client singleton
└─ styles/editor.css           Tailwind v4 + Puck no-external CSS
packages/puck-editor/          Local workspace fork of Puck v0.21.1
prisma/
├─ schema.prisma               Session, Page, SavedBlock, GlobalBlock, GlobalSettings
└─ migrations/
```
