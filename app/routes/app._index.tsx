import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import {
  getAllPages,
  getPageBySlug,
  deletePageBySlug,
  markPageExported,
  markPageDraft,
  type PageRecord,
} from "../lib/pages.server";
import { savePageToShopify } from "../lib/shopify-pages.server";
import { getGlobalSettings } from "../lib/settings.server";
import { DEFAULT_GLOBAL_SETTINGS, type GlobalSettings } from "../lib/settings.defaults";
import { getAllGlobalBlocks, type GlobalBlock } from "../lib/global-blocks.server";
import { getSavedBlocks, type SavedBlock } from "../lib/saved-blocks.server";
import { isValidPuckData } from "../lib/page-schema";
import { renderPreviewBody } from "../lib/puck-renderer";
import { resolvePageBlocks } from "../lib/resolve-blocks";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const [pages, settings, globalBlocks, savedBlocks] = await Promise.all([
    getAllPages(session.shop),
    getGlobalSettings(session.shop),
    getAllGlobalBlocks(session.shop),
    getSavedBlocks(session.shop),
  ]);
  const effective = settings ?? DEFAULT_GLOBAL_SETTINGS;
  return {
    pages,
    shop: session.shop,
    settings: effective,
    // Shipped to the client so the View button can build the preview in the
    // browser (see buildPreviewDocument) instead of round-tripping through
    // /api/preview, which proved unreliable over the dev tunnel (Cloudflare 530).
    globalBlocks,
    savedBlocks,
    headerEnabled: !!effective.useCustomHeader,
    footerEnabled: !!effective.useCustomFooter,
  };
};

function escHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Build the standalone preview HTML document entirely in the browser, from data
 * the loader already provides. Mirrors what /api/preview/:slug returned, but
 * with no server round-trip — so it can't fail with a tunnel/Cloudflare error.
 * Returns null if the stored page data is corrupt or structurally invalid.
 */
function buildPreviewDocument(
  page: PageRecord,
  settings: GlobalSettings,
  globalBlocks: GlobalBlock[],
  savedBlocks: SavedBlock[],
): string | null {
  let data: unknown;
  try {
    data = JSON.parse(page.data);
  } catch {
    return null;
  }
  if (!isValidPuckData(data)) return null;

  const globalBlocksMap = Object.fromEntries(globalBlocks.map((b) => [b.id, b]));
  const savedBlocksMap = Object.fromEntries(savedBlocks.map((b) => [b.name, b]));
  const resolved = resolvePageBlocks(data, globalBlocksMap, savedBlocksMap);
  const body = renderPreviewBody(resolved, settings);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview: ${escHtml(page.title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  if (request.method === "DELETE") {
    const formData = await request.formData();
    const slug = formData.get("slug") as string;
    await deletePageBySlug(session.shop, slug);
    return { ok: true };
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  // Export / Re-Export: publish the page to the online store theme and flag it
  // as exported. Reuses the same path the editor uses on save.
  if (intent === "export") {
    const slug = formData.get("slug") as string;
    const page = await getPageBySlug(session.shop, slug);
    if (!page) return { ok: false, error: "Page not found" };
    try {
      const data = JSON.parse(page.data);
      await savePageToShopify({
        admin,
        shop: session.shop,
        slug,
        title: page.title,
        data,
      });
      await markPageExported(session.shop, slug);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  if (intent === "unpublish") {
    const slug = formData.get("slug") as string;
    await markPageDraft(session.shop, slug);
    return { ok: true };
  }

  return null;
};

// ─── Status helpers ─────────────────────────────────────────────────────────

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "exported", label: "Published" },
  { id: "draft", label: "Draft" },
] as const;

type TabId = (typeof STATUS_TABS)[number]["id"];

type BadgeTone = "success" | "info" | "warning" | "neutral";

function statusTone(status: string): BadgeTone {
  switch (status) {
    case "exported":
      return "success";
    case "draft":
      return "info";
    default:
      return "neutral";
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "exported":
      return "Published";
    case "draft":
      return "Draft";
    default:
      return status;
  }
}

function shopBrandFallback(shop: string): string {
  return shop.replace(/\.myshopify\.com$/i, "");
}

function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Tooltip ────────────────────────────────────────────────────────────────

// Dark pill tooltip shown below an element on hover. Rendered through a portal
// with fixed positioning so the s-table's overflow never clips it.
function Tooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setPos({ x: r.left + r.width / 2, y: r.bottom + 6 });
  };
  const hide = () => setPos(null);

  return (
    <span
      ref={ref}
      style={{ display: "inline-flex" }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onClick={hide}
    >
      {children}
      {pos &&
        createPortal(
          <span
            role="tooltip"
            style={{
              position: "fixed",
              top: pos.y,
              left: pos.x,
              transform: "translateX(-50%)",
              background: "#1a1a1f",
              color: "#fff",
              fontFamily:
                "var(--p-font-family-sans, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)",
              fontSize: "var(--p-font-size-300, 12px)",
              lineHeight: 1.4,
              fontWeight: "var(--p-font-weight-medium, 550)" as React.CSSProperties["fontWeight"],
              padding: "6px 10px",
              borderRadius: 8,
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
              zIndex: 10000,
              pointerEvents: "none",
            }}
          >
            {label}
          </span>,
          document.body,
        )}
    </span>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────

function PageRow({
  page,
  brandFallback,
  isExporting,
  settings,
  globalBlocks,
  savedBlocks,
  onExport,
  onEdit,
  onDelete,
  onUnpublish,
}: {
  page: PageRecord;
  brandFallback: string;
  isExporting: boolean;
  settings: GlobalSettings;
  globalBlocks: GlobalBlock[];
  savedBlocks: SavedBlock[];
  onExport: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUnpublish: () => void;
}) {
  const menuId = `row-menu-${page.slug}`;
  const isExported = page.status === "exported";

  // Build the preview HTML in the browser from data the loader already shipped,
  // then open it via a Blob URL. This avoids two problems: (1) the cross-origin
  // document.write() failure when window.open("","_blank") opens at a different
  // origin inside Shopify Admin's iframe, and (2) the Cloudflare 530 errors we
  // hit fetching /api/preview over the dev tunnel.
  const [previewing, setPreviewing] = useState(false);
  const handleView = async () => {
    if (previewing) return;
    setPreviewing(true);
    try {
      const html = buildPreviewDocument(page, settings, globalBlocks, savedBlocks);
      if (!html) {
        throw new Error("This page's saved content is invalid or corrupt.");
      }
      // Open a blank window first, then write HTML into it.
      // Blob URLs created inside Shopify Admin's iframe are scoped to that
      // iframe context — a new top-level tab can't access them (ERR_FILE_NOT_FOUND).
      // Writing directly to an about:blank window avoids the blob URL entirely.
      const win = window.open("", "_blank");
      if (win) {
        win.document.open();
        win.document.write(html);
        win.document.close();
      } else {
        // Popup blocked — download as an HTML file the user can open locally.
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `preview-${page.slug}.html`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
      }
    } catch (err) {
      alert(`Preview failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setPreviewing(false);
    }
  };

  return (
    <s-table-row>
      <s-table-cell>
        <s-text>
          <strong style={{ textTransform: "capitalize" }}>{page.title}</strong>
        </s-text>
      </s-table-cell>

      <s-table-cell>
        <s-stack direction="inline" gap="small-300" alignItems="center">
          <s-icon type="store" color="subdued" />
          <s-text>{page.brandName?.trim() || brandFallback}</s-text>
        </s-stack>
      </s-table-cell>

      <s-table-cell>
        <s-text color="subdued">{formatDate(page.createdAt)}</s-text>
      </s-table-cell>

      <s-table-cell>
        <s-badge tone={statusTone(page.status)}>
          {statusLabel(page.status)}
        </s-badge>
      </s-table-cell>

      <s-table-cell>
        <s-stack direction="inline" gap="small-300" alignItems="center">
          <Tooltip label={previewing ? "Loading…" : "View"}>
            <s-button
              variant="secondary"
              icon="view"
              accessibilityLabel="View"
              onClick={handleView}
              {...(previewing ? { disabled: true } : {})}
            />
          </Tooltip>

          <s-button
            variant="tertiary"
            icon="menu-horizontal"
            accessibilityLabel="More actions"
            commandFor={menuId}
            command="--toggle"
          />
          <s-menu id={menuId} accessibilityLabel={`Actions for ${page.title}`}>
            <s-button icon="edit" onClick={onEdit}>Edit</s-button>
            <s-button
              icon={isExported ? "refresh" : "upload"}
              onClick={onExport}
              {...(isExporting ? { disabled: true } : {})}
            >
              {isExporting ? "Publishing…" : isExported ? "Re-Publish" : "Publish"}
            </s-button>
            {isExported && (
              <s-button icon="undo" onClick={onUnpublish}>Move to Draft</s-button>
            )}
            <s-button icon="delete" tone="critical" onClick={onDelete}>Delete</s-button>
          </s-menu>
        </s-stack>
      </s-table-cell>
    </s-table-row>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PagesIndex() {
  const { pages, shop, settings, globalBlocks, savedBlocks } = useLoaderData<typeof loader>();
  const deleteFetcher = useFetcher();
  const exportFetcher = useFetcher<{ ok: boolean; error?: string }>();
  const unpublishFetcher = useFetcher();
  const [pendingDelete, setPendingDelete] = useState<PageRecord | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("all");
  const [query, setQuery] = useState("");

  const brandFallback = shopBrandFallback(shop);

  // Auto-open the editor when arriving with ?edit={slug} (new-page flow),
  // OR restore from sessionStorage so a hard refresh re-opens the same editor.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editParam = params.get("edit");
    if (editParam) {
      setEditingSlug(editParam);
      sessionStorage.setItem("pb:editingSlug", editParam);
      const url = new URL(window.location.href);
      url.searchParams.delete("edit");
      window.history.replaceState({}, "", url.toString());
      return;
    }
    // Restore editor panel after a hard refresh
    const stored = sessionStorage.getItem("pb:editingSlug");
    if (stored) setEditingSlug(stored);
  }, []);

  const deletingSlug =
    deleteFetcher.state !== "idle"
      ? (deleteFetcher.formData?.get("slug") as string | null)
      : null;

  const exportingSlug =
    exportFetcher.state !== "idle"
      ? (exportFetcher.formData?.get("slug") as string | null)
      : null;

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteFetcher.submit({ slug: pendingDelete.slug }, { method: "DELETE" });
    setPendingDelete(null);
  };

  const exportPage = (slug: string) => {
    exportFetcher.submit({ intent: "export", slug }, { method: "POST" });
  };

  // Open the App Window programmatically once src is set
  useEffect(() => {
    if (!editingSlug) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = document.getElementById("page-editor") as any;
    win?.show?.();
  }, [editingSlug]);

  // Reset editingSlug when the App Window is hidden (user closes the panel).
  // Also clears sessionStorage so refresh doesn't re-open a closed editor.
  useEffect(() => {
    const win = document.getElementById("page-editor");
    if (!win) return;
    const onHide = () => {
      setEditingSlug(null);
      sessionStorage.removeItem("pb:editingSlug");
    };
    win.addEventListener("hide", onHide);
    return () => win.removeEventListener("hide", onHide);
  }, [editingSlug]);

  // The editor broadcasts this when "← All Pages" is clicked. BroadcastChannel
  // works between any same-origin contexts regardless of frame hierarchy, so it
  // reaches this panel even when App Bridge places the s-app-window iframe as a
  // sibling (not a child) of our app frame.
  useEffect(() => {
    const ch = new BroadcastChannel("pb-editor");
    ch.onmessage = (e) => {
      if (e.data?.type === "pb:close-editor") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = document.getElementById("page-editor") as any;
        win?.hide?.();
        setEditingSlug(null);
        sessionStorage.removeItem("pb:editingSlug");
      }
    };
    return () => ch.close();
  }, []);

  // Open/close the delete confirmation modal in response to pendingDelete.
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const el = document.getElementById("delete-modal") as any;
    if (!el) return;
    if (pendingDelete) el.showOverlay?.();
    else el.hideOverlay?.();
  }, [pendingDelete]);

  const visiblePages = pages.filter((p) => p.slug !== deletingSlug);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visiblePages.filter((p) => {
      if (tab !== "all" && p.status !== tab) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        (p.brandName ?? "").toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      );
    });
  }, [visiblePages, tab, query]);

  const exportError =
    exportFetcher.state === "idle" && exportFetcher.data?.ok === false
      ? exportFetcher.data.error
      : null;

  return (
    <s-page heading="All Pages">
      <s-button slot="primary-action" href="/app/pages/new">
        + New Page
      </s-button>

      <s-banner tone="info">
        Create a page and save it as a draft. Click Publish to make it live on
        your online store.
      </s-banner>

      {exportError && (
        <s-banner tone="critical" heading="Publish failed">
          {exportError}
        </s-banner>
      )}

      <s-section>
        {/* Tabs */}
        <div style={{ marginBottom: "16px" }}>
          <s-stack direction="inline" gap="small-300">
            {STATUS_TABS.map((t) => (
              <s-button
                key={t.id}
                variant={tab === t.id ? "primary" : "tertiary"}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </s-button>
            ))}
          </s-stack>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "20px" }}>
          <s-search-field
            label="Search pages"
            labelAccessibilityVisibility="exclusive"
            placeholder="Search pages"
            value={query}
            onInput={(e: Event) =>
              setQuery((e.target as HTMLInputElement).value)
            }
          />
        </div>

        {filtered.length === 0 ? (
          <s-paragraph>
            {visiblePages.length === 0
              ? "No pages yet. Click “+ New Page” to create your first page."
              : "No pages match the current filter."}
          </s-paragraph>
        ) : (
          <s-table>
            <s-table-header-row>
              <s-table-header>Page</s-table-header>
              <s-table-header>Brand Name</s-table-header>
              <s-table-header>Date</s-table-header>
              <s-table-header>Status</s-table-header>
              <s-table-header>Actions</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {filtered.map((page) => (
                <PageRow
                  key={page.slug}
                  page={page}
                  brandFallback={brandFallback}
                  isExporting={exportingSlug === page.slug}
                  settings={settings}
                  globalBlocks={globalBlocks}
                  savedBlocks={savedBlocks}
                  onExport={() => exportPage(page.slug)}
                  onEdit={() => {
                    setEditingSlug(page.slug);
                    sessionStorage.setItem("pb:editingSlug", page.slug);
                  }}
                  onDelete={() => setPendingDelete(page)}
                  onUnpublish={() => unpublishFetcher.submit({ intent: "unpublish", slug: page.slug }, { method: "POST" })}
                />
              ))}
            </s-table-body>
          </s-table>
        )}
      </s-section>

      {/* Single App Window — src updates dynamically when a page is selected */}
      {editingSlug && (
        <s-app-window id="page-editor" src={`/editor/${editingSlug}`} />
      )}

      {/* Delete confirmation popup */}
      <s-modal
        id="delete-modal"
        heading="Delete page?"
        onAfterHide={() => setPendingDelete(null)}
      >
        <s-paragraph>
          “{pendingDelete?.title}” will be permanently deleted. This cannot be
          undone.
        </s-paragraph>
        <s-button
          slot="primary-action"
          variant="primary"
          tone="critical"
          onClick={confirmDelete}
        >
          Delete
        </s-button>
        <s-button
          slot="secondary-actions"
          onClick={() => setPendingDelete(null)}
        >
          Cancel
        </s-button>
      </s-modal>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
