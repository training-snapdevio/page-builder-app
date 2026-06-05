import { useCallback, useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { usePuck } from "@my-app/puck-editor";
import { useGlobalSettings } from "@/puck-splat/context/GlobalSettingsContext";
import { buildHeaderData, buildFooterData } from "@/lib/settings.defaults";
import type { NavLink, HeaderSettings, FooterSettings } from "@/lib/settings.defaults";

// ─── Shared field primitives (same style as puck.config.tsx blocks) ───────────

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  fontSize: 14,
  border: "1px solid #d1d5db",
  borderRadius: 6,
  outline: "none",
  boxSizing: "border-box",
  background: "#fff",
  color: "#111827",
  fontFamily: "inherit",
};

const SELECT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "6px 8px",
  fontSize: 13,
  border: "1px solid #d1d5db",
  borderRadius: 6,
  outline: "none",
  boxSizing: "border-box",
  background: "#fff",
  color: "#111827",
  fontFamily: "inherit",
  cursor: "pointer",
};

// ─── StackedField ─────────────────────────────────────────────────────────────

function StackedField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#000000", lineHeight: 1.3 }}>
        {label}
      </label>
      <div>{children}</div>
    </div>
  );
}

// ─── StackedTextField ─────────────────────────────────────────────────────────

function StackedTextField({
  label, value, onChange, placeholder,
}: { label: string; value?: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <StackedField label={label}>
      <input
        type="text"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={INPUT_STYLE}
      />
    </StackedField>
  );
}

// ─── StackedTextareaField ─────────────────────────────────────────────────────

function StackedTextareaField({
  label, value, onChange, placeholder, rows = 3,
}: { label: string; value?: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <StackedField label={label}>
      <textarea
        value={value ?? ""}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...INPUT_STYLE, resize: "vertical" }}
      />
    </StackedField>
  );
}

// ─── ToggleField ──────────────────────────────────────────────────────────────

function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <StackedField label={label}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          role="switch"
          aria-checked={value}
          onClick={() => onChange(!value)}
          style={{
            width: 44, height: 24, borderRadius: 12, border: "none",
            cursor: "pointer", position: "relative",
            backgroundColor: value ? "#0158ad" : "#d1d5db",
            transition: "background 0.2s", display: "block", flexShrink: 0,
            padding: 0,
          }}
        >
          <span style={{
            position: "absolute", top: 2,
            left: value ? 22 : 2,
            width: 20, height: 20, borderRadius: 10,
            backgroundColor: "#fff",
            transition: "left 0.2s", display: "block",
          }} />
        </button>
        <span style={{ fontSize: 12, color: value ? "#0158ad" : "#6b7280", fontWeight: 500 }}>
          {value ? "Yes" : "No"}
        </span>
      </div>
    </StackedField>
  );
}

// ─── SelectField ──────────────────────────────────────────────────────────────

function SelectField({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <StackedField label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={SELECT_STYLE}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </StackedField>
  );
}

// ─── ColorPickerField (hover-to-open, matches puck.config.tsx) ───────────────

const COLOR_PALETTE = [
  "#ffffff", "#f3f4f6", "#e5e7eb", "#d1d5db", "#9ca3af", "#6b7280", "#4b5563", "#374151", "#1f2937", "#111827", "#000000",
  "#fef2f2", "#fee2e2", "#fecaca", "#fca5a5", "#f87171", "#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d",
  "#fff7ed", "#ffedd5", "#fed7aa", "#fdba74", "#fb923c", "#f97316", "#ea580c", "#c2410c", "#9a3412", "#7c2d12",
  "#fffbeb", "#fef3c7", "#fde68a", "#fcd34d", "#fbbf24", "#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f",
  "#ecfdf5", "#d1fae5", "#a7f3d0", "#6ee7b7", "#34d399", "#10b981", "#059669", "#047857", "#065f46", "#064e3b",
  "#eff6ff", "#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a",
  "#faf5ff", "#f3e8ff", "#e9d5ff", "#d8b4fe", "#c084fc", "#a855f7", "#9333ea", "#7c3aed", "#6d28d9", "#5b21b6",
];

function ColorPickerField({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("mousedown", handle);
      return () => document.removeEventListener("mousedown", handle);
    }
  }, [isOpen]);

  return (
    <StackedField label={label}>
      <div
        ref={containerRef}
        style={{ position: "relative" }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div
            onClick={() => setIsOpen(!isOpen)}
            style={{
              width: 32, height: 32, borderRadius: 6, flexShrink: 0,
              background: value || "#ffffff",
              border: "2px solid #d1d5db", cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          />
          <input
            type="text"
            value={value ?? ""}
            placeholder="#000000"
            onChange={(e) => onChange(e.target.value)}
            style={{ ...INPUT_STYLE, flex: 1, fontFamily: "monospace" }}
          />
        </div>
        {isOpen && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 1000,
            background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)", padding: 10, width: 240,
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(11, 1fr)", gap: 3, marginBottom: 8 }}>
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => { onChange(c); setIsOpen(false); }}
                  style={{
                    width: 18, height: 18, borderRadius: 3,
                    border: value === c ? "2px solid #000" : "1px solid rgba(0,0,0,0.15)",
                    background: c, cursor: "pointer", padding: 0,
                  }}
                  title={c}
                />
              ))}
            </div>
            <input
              type="color"
              value={value ?? "#000000"}
              onChange={(e) => onChange(e.target.value)}
              style={{ width: "100%", height: 28, border: "none", cursor: "pointer", padding: 0 }}
            />
          </div>
        )}
      </div>
    </StackedField>
  );
}

// ─── SectionHeader (matches SettingsSectionHeader in puck.config.tsx) ─────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid #cfd6dd" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--p-color-text, #202223)", lineHeight: 1.2 }}>
        {title}
      </div>
    </div>
  );
}

// ─── Save status ──────────────────────────────────────────────────────────────

function SaveStatus({ status }: { status: "idle" | "saving" | "saved" }) {
  if (status === "idle") return null;
  return (
    <div style={{
      padding: "6px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500, textAlign: "center",
      background: status === "saved" ? "#d1fae5" : "#dbeafe",
      color: status === "saved" ? "#065f46" : "#1d4ed8",
    }}>
      {status === "saved" ? "✓ Saved" : "Saving…"}
    </div>
  );
}

// ─── Storefront enable toggle ─────────────────────────────────────────────────

function StorefrontToggle({ label, active, onToggle }: { label: string; active: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div style={{
      padding: 12, borderRadius: 8,
      border: `1px solid ${active ? "#a7f3d0" : "#bfdbfe"}`,
      background: active ? "#ecfdf5" : "#eff6ff",
    }}>
      <p style={{ fontSize: 12, color: active ? "#065f46" : "#1e40af", marginTop: 0, marginBottom: 10, lineHeight: 1.5 }}>
        {active
          ? `Custom ${label} is LIVE on the storefront — replaces the merchant theme's ${label} on every page.`
          : `Storefront currently uses the merchant theme's ${label}. Enable to switch to this custom ${label}.`}
      </p>
      <ToggleField label="Show on storefront (applies to all pages)" value={active} onChange={onToggle} />
    </div>
  );
}

// ─── App embed notice ─────────────────────────────────────────────────────────

function AppEmbedNotice() {
  return (
    <div style={{
      padding: 10, borderRadius: 6, background: "#fffbeb",
      border: "1px solid #fde68a", fontSize: 12, color: "#92400e", lineHeight: 1.5,
    }}>
      <strong>One-time setup required:</strong> To show this on home, product, and collection pages, enable the{" "}
      <strong>Page Builder Chrome</strong> app embed in Online Store → Themes → Customize → App embeds → Save.
    </div>
  );
}

// ─── Nav link options ─────────────────────────────────────────────────────────

const COMMON_NAV_OPTIONS = [
  { label: "Home",            value: "/" },
  { label: "All Products",    value: "/collections/all" },
  { label: "All Collections", value: "/collections" },
  { label: "Blog",            value: "/blogs/news" },
  { label: "Cart",            value: "/cart" },
  { label: "Contact",         value: "/pages/contact" },
  { label: "About Us",        value: "/pages/about" },
] as const;

const CUSTOM_VALUE = "__custom__";

function useBuilderPages() {
  const [pages, setPages] = useState<{ slug: string; title: string }[]>([]);
  useEffect(() => {
    fetch("/api/pages-list")
      .then((r) => r.json())
      .then((json: { pages?: { slug: string; title: string }[] }) => {
        if (json.pages) setPages(json.pages);
      })
      .catch(() => {/* non-fatal */});
  }, []);
  return pages;
}

// ─── Links array editor ───────────────────────────────────────────────────────

function LinksEditor({ label, links = [], onChange }: {
  label: string;
  links: NavLink[];
  onChange: (links: NavLink[]) => void;
}) {
  const builderPages = useBuilderPages();

  const add = () => onChange([...links, { id: Date.now().toString(), label: "New Link", url: "/" }]);
  const remove = (id: string) => onChange(links.filter((l) => l.id !== id));
  const update = (id: string, field: "label" | "url", v: string) =>
    onChange(links.map((l) => (l.id === id ? { ...l, [field]: v } : l)));

  const allKnownValues = [
    ...COMMON_NAV_OPTIONS.map((o) => o.value as string),
    ...builderPages.map((p) => `/pages/${p.slug}`),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#000000" }}>{label}</label>
        <button
          onClick={add}
          style={{
            padding: "4px 10px", fontSize: 12, fontWeight: 500, borderRadius: 4,
            cursor: "pointer", border: "1px solid #d1d5db", background: "#fff", color: "#374151",
          }}
        >
          + Add
        </button>
      </div>

      {links.length === 0 && (
        <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>No links yet</p>
      )}

      {links.map((link) => {
        const pickerValue = allKnownValues.includes(link.url) ? link.url : CUSTOM_VALUE;
        return (
          <div key={link.id} style={{
            background: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: 6, padding: 10,
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => update(link.id, "label", e.target.value)}
                  placeholder="Label"
                  style={{ ...INPUT_STYLE, flex: 1 }}
                />
                <button
                  onClick={() => remove(link.id)}
                  aria-label="Remove link"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    padding: 4, color: "#ef4444", display: "flex", alignItems: "center", flexShrink: 0,
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <select
                value={pickerValue}
                onChange={(e) => { if (e.target.value !== CUSTOM_VALUE) update(link.id, "url", e.target.value); }}
                style={SELECT_STYLE}
              >
                {COMMON_NAV_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                {builderPages.length > 0 && builderPages.map((p) => (
                  <option key={p.slug} value={`/pages/${p.slug}`}>{p.title}</option>
                ))}
                <option value={CUSTOM_VALUE}>Custom URL…</option>
              </select>
              <input
                type="text"
                value={link.url}
                onChange={(e) => update(link.id, "url", e.target.value)}
                placeholder="/pages/my-page"
                style={{ ...INPUT_STYLE, fontFamily: "monospace", fontSize: 12 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Header property panel ────────────────────────────────────────────────────

function HeaderPanel() {
  const { settings, settingsRef, updateSetting } = useGlobalSettings();
  const { dispatch, appState } = usePuck();
  const dispatchRef = useRef(dispatch);
  const stateRef = useRef(appState);
  useEffect(() => { dispatchRef.current = dispatch; });
  useEffect(() => { stateRef.current = appState; });

  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const h = settings.header;
  const useCustom = !!settings.useCustomHeader;

  const persist = useCallback(
    async (full: typeof settings, republishNow: boolean) => {
      try {
        await fetch("/api/global-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ globalSettings: full, republish: republishNow }),
        });
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } catch {
        setStatus("idle");
      }
    },
    [],
  );

  const updateField = useCallback(
    (field: keyof HeaderSettings, value: HeaderSettings[keyof HeaderSettings]) => {
      if (!settingsRef.current) return;
      const next: HeaderSettings = { ...settingsRef.current.header, [field]: value };
      updateSetting("header", next);

      const root = stateRef.current.data.root;
      const cp = { ...root?.props };
      cp.headerData = buildHeaderData(next);
      dispatchRef.current({ type: "replaceRoot", root: { ...root, props: cp } });

      setStatus("saving");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const full = { ...settingsRef.current, header: next };
        persist(full as typeof settings, !!full.useCustomHeader);
      }, 700);
    },
    [updateSetting, settingsRef, persist],
  );

  const toggleEnabled = useCallback(
    async (v: boolean) => {
      if (!settingsRef.current) return;
      updateSetting("useCustomHeader", v);
      const full = { ...settingsRef.current, useCustomHeader: v };
      setStatus("saving");
      await persist(full as typeof settings, true);
    },
    [updateSetting, settingsRef, persist],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <StorefrontToggle label="header" active={useCustom} onToggle={toggleEnabled} />
      {useCustom && <AppEmbedNotice />}

      <SectionHeader title="Branding" />
      <StackedTextField label="Site Title" value={h.siteTitle} onChange={(v) => updateField("siteTitle", v)} placeholder="My Store" />
      <StackedTextField label="Logo Image URL" value={h.logo} onChange={(v) => updateField("logo", v)} placeholder="https://example.com/logo.png" />

      <SectionHeader title="Appearance" />
      <ColorPickerField label="Background Color" value={h.backgroundColor} onChange={(v) => updateField("backgroundColor", v)} />
      <ColorPickerField label="Text Color" value={h.textColor} onChange={(v) => updateField("textColor", v)} />
      <StackedTextField label="Height" value={h.height} onChange={(v) => updateField("height", v)} placeholder="64px" />
      <StackedTextField label="Background Image URL" value={h.backgroundImage} onChange={(v) => updateField("backgroundImage", v)} placeholder="https://... or linear-gradient(...)" />
      <ToggleField label="Show Shadow" value={!!h.showShadow} onChange={(v) => updateField("showShadow", v)} />
      <SelectField
        label="Header Layout"
        value={h.layoutStyle ?? "default"}
        onChange={(v) => updateField("layoutStyle", v)}
        options={[
          { value: "default",  label: "Default — Logo left, Nav right" },
          { value: "centered", label: "Centered — Logo + Nav centred" },
          { value: "split",    label: "Split — Logo | Nav | CTA" },
          { value: "minimal",  label: "Minimal — Logo only" },
        ]}
      />

      <SectionHeader title="Navigation" />
      <ToggleField label="Show Navigation" value={!!h.showNavigation} onChange={(v) => updateField("showNavigation", v)} />
      {h.showNavigation && (
        <LinksEditor label="Nav Links" links={h.navigationLinks} onChange={(links) => updateField("navigationLinks", links)} />
      )}

      <SectionHeader title="CTA Button" />
      <SelectField
        label="CTA Style"
        value={h.ctaStyle ?? "primary"}
        onChange={(v) => updateField("ctaStyle", v)}
        options={[
          { value: "primary", label: "Solid" },
          { value: "ghost",   label: "Ghost / Outline" },
          { value: "none",    label: "None (hide)" },
        ]}
      />
      {(h.ctaStyle ?? "primary") !== "none" && (
        <>
          <StackedTextField label="CTA Label" value={h.ctaLabel} onChange={(v) => updateField("ctaLabel", v)} placeholder="Get Started" />
          <StackedTextField label="CTA URL" value={h.ctaLink} onChange={(v) => updateField("ctaLink", v)} placeholder="/signup" />
        </>
      )}

      <SaveStatus status={status} />
    </div>
  );
}

// ─── Footer property panel ────────────────────────────────────────────────────

function FooterPanel() {
  const { settings, settingsRef, updateSetting } = useGlobalSettings();
  const { dispatch, appState } = usePuck();
  const dispatchRef = useRef(dispatch);
  const stateRef = useRef(appState);
  useEffect(() => { dispatchRef.current = dispatch; });
  useEffect(() => { stateRef.current = appState; });

  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const f = settings.footer;
  const useCustom = !!settings.useCustomFooter;

  const persist = useCallback(
    async (full: typeof settings, republishNow: boolean) => {
      try {
        await fetch("/api/global-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ globalSettings: full, republish: republishNow }),
        });
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } catch {
        setStatus("idle");
      }
    },
    [],
  );

  const updateField = useCallback(
    (field: keyof FooterSettings, value: FooterSettings[keyof FooterSettings]) => {
      if (!settingsRef.current) return;
      const next: FooterSettings = { ...settingsRef.current.footer, [field]: value };
      updateSetting("footer", next);

      const root = stateRef.current.data.root;
      const cp = { ...root?.props };
      cp.footerData = buildFooterData(next);
      dispatchRef.current({ type: "replaceRoot", root: { ...root, props: cp } });

      setStatus("saving");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const full = { ...settingsRef.current, footer: next };
        persist(full as typeof settings, !!full.useCustomFooter);
      }, 700);
    },
    [updateSetting, settingsRef, persist],
  );

  const toggleEnabled = useCallback(
    async (v: boolean) => {
      if (!settingsRef.current) return;
      updateSetting("useCustomFooter", v);
      const full = { ...settingsRef.current, useCustomFooter: v };
      setStatus("saving");
      await persist(full as typeof settings, true);
    },
    [updateSetting, settingsRef, persist],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <StorefrontToggle label="footer" active={useCustom} onToggle={toggleEnabled} />
      {useCustom && <AppEmbedNotice />}

      <SectionHeader title="Company Info" />
      <StackedTextField label="Company Name" value={f.companyName} onChange={(v) => updateField("companyName", v)} placeholder="My Store" />
      <StackedTextareaField label="Tagline / Description" value={f.companyDescription} onChange={(v) => updateField("companyDescription", v)} placeholder="Build beautiful pages without coding" rows={3} />
      <StackedTextField label="Copyright Text" value={f.copyrightText} onChange={(v) => updateField("copyrightText", v)} placeholder="© 2025 My Store" />
      <StackedTextField label="Logo Image URL" value={f.logo} onChange={(v) => updateField("logo", v)} placeholder="https://example.com/logo.png" />

      <SectionHeader title="Appearance" />
      <ColorPickerField label="Background Color" value={f.backgroundColor} onChange={(v) => updateField("backgroundColor", v)} />
      <ColorPickerField label="Text Color" value={f.textColor} onChange={(v) => updateField("textColor", v)} />
      <StackedTextField label="Height" value={f.height} onChange={(v) => updateField("height", v)} placeholder="300px" />

      <SectionHeader title="Quick Links" />
      <LinksEditor label="Quick Links" links={f.quickLinks} onChange={(links) => updateField("quickLinks", links)} />

      <SectionHeader title="Social Links" />
      <ToggleField label="Show Social Links" value={!!f.showSocialLinks} onChange={(v) => updateField("showSocialLinks", v)} />
      {f.showSocialLinks && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <StackedTextField label="Facebook" value={f.socialLinks?.facebook} onChange={(v) => updateField("socialLinks", { ...f.socialLinks, facebook: v })} placeholder="https://facebook.com/..." />
          <StackedTextField label="Twitter / X" value={f.socialLinks?.twitter} onChange={(v) => updateField("socialLinks", { ...f.socialLinks, twitter: v })} placeholder="https://twitter.com/..." />
          <StackedTextField label="Instagram" value={f.socialLinks?.instagram} onChange={(v) => updateField("socialLinks", { ...f.socialLinks, instagram: v })} placeholder="https://instagram.com/..." />
          <StackedTextField label="LinkedIn" value={f.socialLinks?.linkedin} onChange={(v) => updateField("socialLinks", { ...f.socialLinks, linkedin: v })} placeholder="https://linkedin.com/..." />
          <StackedTextField label="GitHub" value={f.socialLinks?.github} onChange={(v) => updateField("socialLinks", { ...f.socialLinks, github: v })} placeholder="https://github.com/..." />
          <StackedTextField label="YouTube" value={(f.socialLinks as { youtube?: string })?.youtube} onChange={(v) => updateField("socialLinks", { ...f.socialLinks, youtube: v } as FooterSettings["socialLinks"])} placeholder="https://youtube.com/@..." />
        </div>
      )}

      <SaveStatus status={status} />
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

export function GlobalLayoutPanel({
  zone,
  onClose,
}: {
  zone: "header" | "footer";
  onClose: () => void;
}) {
  const label = zone === "header" ? "Header" : "Footer";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "var(--p-font-family-sans)" }}>
      {/* Top breadcrumb — same as Puck's SidebarSection title area */}
      <div style={{
        background: "var(--puck-color-white)", padding: "10px 12px",
        borderBottom: "1px solid var(--puck-color-grey-09)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            onClick={onClose}
            style={{
              background: "none", border: 0, borderRadius: 2,
              color: "var(--puck-color-azure-04)", cursor: "pointer",
              font: "inherit", padding: 0, fontSize: 13, fontWeight: 500, lineHeight: 1,
            }}
          >
            Page
          </button>
          <span style={{ color: "var(--puck-color-grey-05)", fontSize: 13, lineHeight: 1, userSelect: "none" }}>›</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--puck-color-grey-01)", lineHeight: 1 }}>
            Global {label}
          </span>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 500, padding: "2px 8px",
          borderRadius: 99, background: "#dbeafe", color: "#1d4ed8",
        }}>
          All Pages
        </span>
      </div>

      {/* Info notice */}
      <div style={{ padding: "6px 12px", flexShrink: 0 }}>
        <div style={{
          padding: "8px 10px", borderRadius: 6,
          background: "#eff6ff", border: "1px solid #bfdbfe",
          fontSize: 12, color: "#1e40af",
        }}>
          Changes apply to <strong>every page</strong> and auto-save after a brief pause.
        </div>
      </div>

      {/* Scrollable fields */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
        {zone === "header" ? <HeaderPanel /> : <FooterPanel />}
      </div>
    </div>
  );
}
