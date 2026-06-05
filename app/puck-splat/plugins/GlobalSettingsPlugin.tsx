// @ts-nocheck
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ALargeSmall,
  ArrowLeft,
  ArrowUpCircle,
  ChevronRight,
  Code2,
  Framer,
  ImageIcon,
  Layers,
  LayoutTemplate,
  Link2,
  MousePointerClick,
  Palette,
  Pin,
  Plus,
  RotateCcw,
  Save,
  Settings,
  Square,
  Trash2,
  Type,
  UserCircle,
  X,
  Zap,
} from "lucide-react";
import { usePuck } from "@my-app/puck-editor";
import type { GlobalSettings, CustomColor } from "@/lib/settings.server";
import { GOOGLE_FONTS, FORM_INPUT_STYLE, COLOR_INPUT_STYLE, COLOR_SWATCH_STYLE } from "../constants";
import { applyCSSVariables, loadGoogleFont } from "../utils";
import { useGlobalSettings } from "@/puck-splat/context/GlobalSettingsContext";
import { compareWithDefaults, getChangedCategories } from "@/puck-splat/utils/settings-helpers";

// ─── Section definitions ──────────────────────────────────────────────────────

type SectionId =
  | "colors" | "fonts" | "typography" | "buttons"
  | "images" | "siteidentity"
  | "layout" | "transitions" | "headerfooter" | "customcss"
  | "scrollmotion" | "linkshadows";

interface Section { id: SectionId; label: string; icon: React.ReactNode; group: string; }

const SECTIONS: Section[] = [
  { id: "colors",       label: "Global Colors",   icon: <Palette size={15} />,           group: "DESIGN SYSTEM" },
  { id: "fonts",        label: "Global Fonts",     icon: <ALargeSmall size={15} />,       group: "DESIGN SYSTEM" },
  { id: "typography",   label: "Typography",       icon: <Type size={15} />,              group: "THEME STYLE" },
  { id: "buttons",      label: "Buttons",          icon: <MousePointerClick size={15} />, group: "THEME STYLE" },
  { id: "images",       label: "Images",           icon: <ImageIcon size={15} />,         group: "THEME STYLE" },
  { id: "siteidentity", label: "Site Identity",    icon: <UserCircle size={15} />,        group: "SETTINGS" },
  { id: "layout",       label: "Layout",           icon: <LayoutTemplate size={15} />,    group: "SETTINGS" },
  { id: "transitions",  label: "Page Transitions", icon: <Framer size={15} />,            group: "SETTINGS" },
  { id: "headerfooter", label: "Header & Footer",  icon: <Layers size={15} />,            group: "SETTINGS" },
  { id: "customcss",    label: "Custom CSS",       icon: <Code2 size={15} />,             group: "SETTINGS" },
  // ── INTERACTIONS ──────────────────────────────────────────────────────────
  { id: "scrollmotion", label: "Scroll & Motion",  icon: <Zap size={15} />,               group: "INTERACTIONS" },
  { id: "linkshadows",  label: "Links & Shadows",  icon: <Link2 size={15} />,             group: "INTERACTIONS" },
];

// ─── Shared primitives ────────────────────────────────────────────────────────

const ROW: React.CSSProperties = { display: "flex", flexDirection: "row", alignItems: "center", gap: 10, minHeight: 32 };
const LABEL_STYLE: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: "var(--p-color-text-secondary)", flex: "0 0 44%", minWidth: 0, lineHeight: 1.3 };
const DIVIDER: React.CSSProperties = { height: 1, background: "var(--p-color-border-subdued, #e1e3e5)", margin: 0, marginBottom: -14 };
const SECTION_TITLE: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
  color: "var(--p-color-text)", textTransform: "uppercase", margin: "12px 0 4px",
};

function IconBtn({ icon, label, onClick, active = false, danger = false, disabled = false }: {
  icon: React.ReactNode; label: string; onClick: () => void;
  active?: boolean; danger?: boolean; disabled?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  // `above:true` flips the tooltip above the button — used when the button sits
  // near the bottom of the viewport (e.g. reset button in the settings footer).
  const [tip, setTip] = useState<{ x: number; y: number; above: boolean } | null>(null);
  return (
    <>
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => {
          const r = ref.current?.getBoundingClientRect();
          if (r) {
            // If there's less than 48 px below the button, flip tooltip above it.
            const above = (window.innerHeight - r.bottom) < 48;
            setTip({
              x: r.left + r.width / 2,
              y: above ? r.top - 6 : r.bottom + 6,
              above,
            });
          }
        }}
        onMouseLeave={() => setTip(null)}
        style={{
          width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
          border: active ? "1px solid rgba(0,91,211,0.25)" : "1px solid transparent",
          borderRadius: 6, padding: 0, flexShrink: 0,
          background: active ? "rgba(0,91,211,0.08)" : "transparent",
          color: disabled ? "var(--p-color-text-disabled, #8a8a94)" : active ? "#005BD3" : "var(--p-color-text-secondary, #6d7175)",
          cursor: disabled ? "default" : "pointer",
          transition: "background 0.12s, color 0.12s, border-color 0.12s",
        }}
        onMouseOver={(e) => {
          if (disabled) return;
          if (danger) {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(215,44,13,0.08)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--p-color-text-critical, #d72c0d)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(215,44,13,0.2)";
          } else if (!active) {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--p-color-bg-surface-selected, rgba(0,0,0,0.05))";
          }
        }}
        onMouseOut={(e) => {
          if (disabled) return;
          if (danger) {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--p-color-text-secondary, #6d7175)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
          } else if (!active) {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }
        }}
      >
        {icon}
      </button>
      {tip && createPortal(
        <div style={{
          position: "fixed",
          top: tip.y,
          left: tip.x,
          // Shift upward (above the button) when near the bottom of the viewport
          transform: tip.above ? "translateX(-50%) translateY(-100%)" : "translateX(-50%)",
          background: "#1a1a1f", color: "#fff", fontSize: 11, fontWeight: 500,
          padding: "4px 8px", borderRadius: 6, whiteSpace: "nowrap",
          boxShadow: "0 4px 12px rgba(0,0,0,0.18)", zIndex: 10000, pointerEvents: "none",
        }}>
          {label}
        </div>,
        document.body,
      )}
    </>
  );
}

function SettingRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={ROW}>
      <label style={LABEL_STYLE}>
        {label}
        {hint && <span style={{ fontWeight: 400, color: "var(--p-color-text-secondary)", marginLeft: 4 }}>({hint})</span>}
      </label>
      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}

function ColorField({ label, hint, value, onChange }: { label: string; hint?: string; value: string; onChange: (v: string) => void }) {
  return (
    <SettingRow label={label} hint={hint}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} style={COLOR_INPUT_STYLE} />
        <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} spellCheck={false} placeholder="#000000" style={{ ...FORM_INPUT_STYLE, fontFamily: "monospace", fontSize: 12, flex: 1 }} />
      </div>
    </SettingRow>
  );
}

function SelectField({ label, hint, value, onChange, children }: { label: string; hint?: string; value?: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <SettingRow label={label} hint={hint}>
      {/* maxWidth + minWidth:0 prevent the native <select> intrinsic width from
          overflowing the flex row when an option label is long (e.g. "Source Code Pro").
          textOverflow + overflow + whiteSpace + paddingRight reserve space for the native
          chevron and ellipsize long labels (e.g. "Semi Bold — 600") instead of clipping. */}
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...FORM_INPUT_STYLE,
          maxWidth: "100%",
          minWidth: 0,
          paddingRight: 24,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {children}
      </select>
    </SettingRow>
  );
}

function TextField({ label, hint, value, onChange, placeholder }: { label: string; hint?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <SettingRow label={label} hint={hint}>
      <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={FORM_INPUT_STYLE} />
    </SettingRow>
  );
}

function CheckboxField({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <SettingRow label={label} hint={hint}>
      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
        <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 14, height: 14, cursor: "pointer" }} />
        <span style={{ fontSize: 12, color: checked ? "var(--p-color-text-emphasis)" : "var(--p-color-text-secondary)", fontWeight: checked ? 600 : 400 }}>
          {checked ? "Enabled" : "Disabled"}
        </span>
      </label>
    </SettingRow>
  );
}

// ─── Panel: Global Colors ─────────────────────────────────────────────────────

function ColorsPanel({ s, onChange }: { s: GlobalSettings; onChange: (f: keyof GlobalSettings, v: any) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={SECTION_TITLE}>System Colors</div>

      {/* Color legend grid — quick-pick swatches */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {([
          { key: "primaryColor" as const,   label: "Primary" },
          { key: "textColor" as const,       label: "Text" },
          { key: "secondaryColor" as const,  label: "Secondary" },
          { key: "accentColor" as const,     label: "Accent" },
        ] as const).map(({ key, label }) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--p-color-bg-surface-secondary)", borderRadius: 6, padding: "7px 9px", border: "1px solid var(--p-color-border-subdued)" }}>
            <input type="color" value={s[key] || "#000000"} onChange={(e) => onChange(key, e.target.value)} style={{ width: 26, height: 26, border: "none", borderRadius: 4, cursor: "pointer", padding: 0, flexShrink: 0 }} />
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--p-color-text)" }}>{label}</div>
          </div>
        ))}
      </div>

      <ColorField label="Primary" value={s.primaryColor} onChange={(v) => onChange("primaryColor", v)} />
      <ColorField label="Secondary" value={s.secondaryColor} onChange={(v) => onChange("secondaryColor", v)} />
      <ColorField label="Text" value={s.textColor} onChange={(v) => onChange("textColor", v)} />
      <ColorField label="Accent" value={s.accentColor} onChange={(v) => onChange("accentColor", v)} />
      <ColorField label="Background" value={s.backgroundColor} onChange={(v) => onChange("backgroundColor", v)} />
    </div>
  );
}

// ─── Panel: Global Fonts ──────────────────────────────────────────────────────

function FontsPanel({ s, onChange }: { s: GlobalSettings; onChange: (f: keyof GlobalSettings, v: any) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Heading Font first — more prominent, sets the tone of the design */}
      <SelectField label="Heading Font" value={s.headingFont} onChange={(v) => { onChange("headingFont", v); loadGoogleFont(v); }}>
        {GOOGLE_FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
      </SelectField>
      <SelectField label="Body Font" value={s.fontFamily} onChange={(v) => { onChange("fontFamily", v); loadGoogleFont(v); }}>
        {GOOGLE_FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
      </SelectField>
      <SelectField label="Base Font Size" value={s.baseFontSize} onChange={(v) => onChange("baseFontSize", v)}>
        {["12px","13px","14px","15px","16px","17px","18px","20px"].map((v) => <option key={v} value={v}>{v}</option>)}
      </SelectField>
      <SelectField label="Line Height" value={s.lineHeight} onChange={(v) => onChange("lineHeight", v)}>
        {["1.2","1.4","1.5","1.6","1.7","1.8","2"].map((v) => <option key={v} value={v}>{v}</option>)}
      </SelectField>
      <SelectField label="Letter Spacing" value={s.letterSpacing} onChange={(v) => onChange("letterSpacing", v)}>
        <option value="normal">Normal</option>
        <option value="-0.02em">Tight (−0.02em)</option>
        <option value="0.01em">Slight (0.01em)</option>
        <option value="0.05em">Wide (0.05em)</option>
        <option value="0.1em">Wider (0.1em)</option>
      </SelectField>

      <div style={{ background: "var(--p-color-bg-surface-secondary)", border: "1px solid var(--p-color-border-subdued)", borderRadius: 8, padding: "12px 14px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--p-color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "system-ui", marginBottom: 8 }}>Preview</div>
        <div style={{ fontFamily: s.headingFont, fontSize: "1.35rem", fontWeight: 700, color: "var(--p-color-text)", lineHeight: 1.2, marginBottom: 4 }}>Heading Font</div>
        <div style={{ fontFamily: s.fontFamily, fontSize: s.baseFontSize, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, color: "var(--p-color-text-secondary)" }}>Body — The quick brown fox jumps over the lazy dog.</div>
      </div>
    </div>
  );
}

// ─── Panel: Typography ────────────────────────────────────────────────────────

function TypographyPanel({ s, onChange }: { s: GlobalSettings; onChange: (f: keyof GlobalSettings, v: any) => void }) {
  const SIZES = ["0.75rem","0.875rem","1rem","1.125rem","1.25rem","1.5rem","1.875rem","2.25rem","3rem","3.75rem","4.5rem"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SelectField label="Heading Weight" value={s.headingWeight} onChange={(v) => onChange("headingWeight", v)}>
        {[["300","Light"],["400","Regular"],["500","Medium"],["600","Semi Bold"],["700","Bold"],["800","Extra Bold"],["900","Black"]].map(([v,l]) => <option key={v} value={v}>{l} — {v}</option>)}
      </SelectField>
      <SelectField label="Heading Line Height" value={s.headingLineHeight} onChange={(v) => onChange("headingLineHeight", v)}>
        {["1","1.1","1.2","1.3","1.4","1.5"].map((v) => <option key={v} value={v}>{v}</option>)}
      </SelectField>
      {(["h1","h2","h3","h4","h5","h6"] as const).map((tag) => {
        const key = `${tag}Size` as keyof GlobalSettings;
        return (
          <SelectField key={tag} label={`${tag.toUpperCase()} Size`} value={s[key] as string} onChange={(v) => onChange(key, v)}>
            {SIZES.map((v) => <option key={v} value={v}>{v}</option>)}
          </SelectField>
        );
      })}

      <div style={{ background: "var(--p-color-bg-surface-secondary)", border: "1px solid var(--p-color-border-subdued)", borderRadius: 8, padding: "12px 14px", fontFamily: s.headingFont }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--p-color-text-secondary)", textTransform: "uppercase", marginBottom: 8, fontFamily: "system-ui" }}>Heading Scale</div>
        {(["h1","h2","h3","h4"] as const).map((tag) => {
          const key = `${tag}Size` as keyof GlobalSettings;
          return <div key={tag} style={{ fontSize: s[key] as string, fontWeight: s.headingWeight, lineHeight: s.headingLineHeight, color: "var(--p-color-text)", marginBottom: 2 }}>{tag.toUpperCase()} — Heading</div>;
        })}
      </div>
    </div>
  );
}

// ─── Panel: Buttons ───────────────────────────────────────────────────────────

function ButtonsPanel({ s, onChange }: { s: GlobalSettings; onChange: (f: keyof GlobalSettings, v: any) => void }) {
  const previewBR = s.buttonStyle === "pill" ? "9999px" : s.buttonStyle === "square" ? "0px" : s.borderRadius;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SelectField label="Button Style" value={s.buttonStyle} onChange={(v) => onChange("buttonStyle", v as any)}>
        <option value="rounded">Rounded</option>
        <option value="square">Square</option>
        <option value="pill">Pill</option>
      </SelectField>
      <SelectField label="Border Radius" value={s.borderRadius} onChange={(v) => onChange("borderRadius", v)}>
        {[["0px","None"],["4px","Small"],["6px","Medium-Small"],["8px","Medium"],["12px","Large"],["16px","Extra Large"],["24px","XXL"],["9999px","Pill"]].map(([v,l]) => <option key={v} value={v}>{l} — {v}</option>)}
      </SelectField>
      <SelectField label="Padding X" value={s.buttonPaddingX} onChange={(v) => onChange("buttonPaddingX", v)}>
        {["8px","12px","16px","20px","24px","28px","32px","40px","48px"].map((v) => <option key={v} value={v}>{v}</option>)}
      </SelectField>
      <SelectField label="Padding Y" value={s.buttonPaddingY} onChange={(v) => onChange("buttonPaddingY", v)}>
        {["4px","6px","8px","10px","12px","14px","16px","20px"].map((v) => <option key={v} value={v}>{v}</option>)}
      </SelectField>
      <SelectField label="Text Transform" value={s.buttonTextTransform} onChange={(v) => onChange("buttonTextTransform", v as any)}>
        <option value="uppercase">UPPERCASE</option>
        <option value="capitalize">Capitalize</option>
        <option value="lowercase">lowercase</option>
      </SelectField>
      <SelectField label="Font Weight" value={s.buttonFontWeight} onChange={(v) => onChange("buttonFontWeight", v)}>
        {[["400","Regular"],["500","Medium"],["600","Semi Bold"],["700","Bold"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
      </SelectField>
      <SelectField label="Border Width" value={s.buttonBorderWidth} onChange={(v) => onChange("buttonBorderWidth", v)}>
        {["0px","1px","2px","3px","4px"].map((v) => <option key={v} value={v}>{v}</option>)}
      </SelectField>

      <div style={DIVIDER} />
      <div style={SECTION_TITLE}>Hover & Shadow Effects</div>

      <SelectField label="Hover Effect" value={s.buttonHoverEffect ?? "lift"} onChange={(v) => onChange("buttonHoverEffect", v as any)}>
        <option value="none">None</option>
        <option value="lift">Lift</option>
        <option value="scale">Scale </option>
        <option value="glow">Glow</option>
        <option value="fill">Fill</option>
      </SelectField>
      <SelectField label="Button Shadow" value={s.buttonShadow ?? "none"} onChange={(v) => onChange("buttonShadow", v as any)}>
        <option value="none">None</option>
        <option value="sm">Small</option>
        <option value="md">Medium</option>
        <option value="colored">Colored — primary glow</option>
      </SelectField>

      <div style={{ background: "var(--p-color-bg-surface-secondary)", border: "1px solid var(--p-color-border-subdued)", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
        {[
          { bg: s.primaryColor, color: "#fff",    label: "Primary",   border: "none" },
          { bg: s.secondaryColor, color: "var(--p-color-text)", label: "Secondary", border: "none" },
          { bg: "transparent", color: s.primaryColor, label: "Outline", border: `${s.buttonBorderWidth || "2px"} solid ${s.primaryColor}` },
        ].map(({ bg, color, label, border }) => (
          <button key={label} style={{ background: bg, color, borderRadius: previewBR, padding: `${s.buttonPaddingY} ${s.buttonPaddingX}`, textTransform: s.buttonTextTransform as any, fontWeight: s.buttonFontWeight as any, border, fontSize: 13, cursor: "default", whiteSpace: "nowrap" }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Panel: Images ────────────────────────────────────────────────────────────

function ImagesPanel({ s, onChange }: { s: GlobalSettings; onChange: (f: keyof GlobalSettings, v: any) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SelectField label="Border Radius" value={s.imageBorderRadius} onChange={(v) => onChange("imageBorderRadius", v)}>
        {["0px","4px","6px","8px","12px","16px","24px","9999px"].map((v) => <option key={v} value={v}>{v}</option>)}
      </SelectField>
      <SelectField label="Object Fit" value={s.imageObjectFit} onChange={(v) => onChange("imageObjectFit", v as any)}>
        <option value="cover">Cover — fills area, crops</option>
        <option value="contain">Contain — shows all</option>
        <option value="fill">Fill — stretches</option>
      </SelectField>

      <div style={DIVIDER} />
      <div style={SECTION_TITLE}>Hover Effect</div>

      <SelectField label="Hover Effect" value={s.imageHoverEffect ?? "none"} onChange={(v) => onChange("imageHoverEffect", v as any)}>
        <option value="none">None</option>
        <option value="zoom">Zoom In — scale up on hover</option>
        <option value="dim">Dim — slight opacity fade</option>
        <option value="lift">Lift — rise with shadow</option>
      </SelectField>

      <div style={{ background: "var(--p-color-bg-surface-secondary)", border: "1px solid var(--p-color-border-subdued)", borderRadius: 8, padding: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--p-color-text-secondary)", textTransform: "uppercase", marginBottom: 8, fontFamily: "system-ui" }}>Border Radius Preview</div>
        <div style={{ width: "100%", height: 90, borderRadius: s.imageBorderRadius, overflow: "hidden", background: `linear-gradient(135deg, ${s.primaryColor} 0%, ${s.accentColor} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 600 }}>
          Image placeholder
        </div>
      </div>
    </div>
  );
}

// ─── Panel: Site Identity ─────────────────────────────────────────────────────

function SiteIdentityPanel({ s, onChange }: { s: GlobalSettings; onChange: (f: keyof GlobalSettings, v: any) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <TextField label="Site Title" value={s.siteTitle} onChange={(v) => onChange("siteTitle", v)} placeholder="My Site" />
      <TextField label="Tagline" value={s.siteTagline} onChange={(v) => onChange("siteTagline", v)} placeholder="Build beautiful pages" />
      <TextField label="Logo URL" value={s.siteLogo} onChange={(v) => onChange("siteLogo", v)} placeholder="https://…/logo.png" />
      <TextField label="Favicon URL" value={s.favicon ?? ""} onChange={(v) => onChange("favicon", v)} placeholder="https://…/favicon.ico" />
      {s.siteLogo && (
        <div style={{ background: "var(--p-color-bg-surface-secondary)", border: "1px solid var(--p-color-border-subdued)", borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--p-color-text-secondary)", textTransform: "uppercase", marginBottom: 8, fontFamily: "system-ui" }}>Logo Preview</div>
          <img src={s.siteLogo} alt="Logo" style={{ maxHeight: 60, maxWidth: "100%", objectFit: "contain" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
      )}
    </div>
  );
}

// ─── Panel: Layout ────────────────────────────────────────────────────────────

function LayoutPanel({ s, onChange }: { s: GlobalSettings; onChange: (f: keyof GlobalSettings, v: any) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SelectField label="Container Width" value={s.containerWidth} onChange={(v) => onChange("containerWidth", v)}>
        <option value="960px">Small — 960px</option>
        <option value="1024px">Medium-Small — 1024px</option>
        <option value="1200px">Medium — 1200px</option>
        <option value="1280px">Medium-Large — 1280px</option>
        <option value="1440px">Large — 1440px</option>
        <option value="1600px">Extra Large — 1600px</option>
        <option value="100%">Full Width — 100%</option>
      </SelectField>
      <SelectField label="Column Gap" value={s.columnGap} onChange={(v) => onChange("columnGap", v)}>
        {["8px","12px","16px","20px","24px","28px","32px","40px","48px"].map((v) => <option key={v} value={v}>{v}</option>)}
      </SelectField>
      <SelectField label="Row Gap" value={s.rowGap} onChange={(v) => onChange("rowGap", v)}>
        {["8px","12px","16px","20px","24px","28px","32px","40px","48px"].map((v) => <option key={v} value={v}>{v}</option>)}
      </SelectField>

      <div style={{ background: "var(--p-color-bg-surface-secondary)", border: "1px solid var(--p-color-border-subdued)", borderRadius: 8, padding: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--p-color-text-secondary)", textTransform: "uppercase", marginBottom: 8, fontFamily: "system-ui" }}>Grid Preview</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", columnGap: s.columnGap, rowGap: s.rowGap }}>
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} style={{ background: `${s.primaryColor}22`, border: `1px dashed ${s.primaryColor}88`, borderRadius: s.borderRadius, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: s.primaryColor }}>
              Col {i}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Panel: Page Transitions (kept for backward compat, delegates to ScrollMotion) ──

function TransitionsPanel({ s, onChange }: { s: GlobalSettings; onChange: (f: keyof GlobalSettings, v: any) => void }) {
  return <ScrollMotionPanel s={s} onChange={onChange} />;
}

// ─── Panel: Custom CSS ────────────────────────────────────────────────────────

function CustomCSSPanel({ s, onChange }: { s: GlobalSettings; onChange: (f: keyof GlobalSettings, v: any) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 12, color: "var(--p-color-text-secondary)", lineHeight: 1.6 }}>
        Raw CSS injected globally on every published page. Scope rules with{" "}
        <code style={{ background: "var(--p-color-bg-surface-secondary)", padding: "1px 4px", borderRadius: 3, fontSize: 11 }}>.page-preview</code>.
      </div>
      <textarea
        value={s.customCSS ?? ""}
        onChange={(e) => onChange("customCSS", e.target.value)}
        placeholder={`.page-preview {\n  /* your custom CSS here */\n}`}
        spellCheck={false}
        style={{ ...FORM_INPUT_STYLE, fontFamily: "'Courier New', monospace", fontSize: 12, minHeight: 200, resize: "vertical", lineHeight: 1.6, whiteSpace: "pre" }}
      />
      <div style={{ background: "var(--p-color-bg-surface-warning, #fff5e0)", border: "1px solid var(--p-color-border-warning-subdued, #ffd79d)", borderRadius: 8, padding: "8px 10px", fontSize: 11, color: "var(--p-color-text-warning, #b15c00)" }}>
        ⚠️ Custom CSS overrides all design tokens. Test changes carefully.
      </div>
    </div>
  );
}

// ─── Panel: Header & Footer ───────────────────────────────────────────────────

function HeaderFooterPanel({
  s,
  onChange,
}: {
  s: GlobalSettings;
  onChange: (f: keyof GlobalSettings, v: any) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* ── Header ──────────────────────────────── */}
      <div style={SECTION_TITLE}>Header</div>

      <CheckboxField label="Sticky Header" checked={s.headerSticky ?? false} onChange={(v) => onChange("headerSticky", v)} />
      <CheckboxField label="Transparent Header" checked={s.headerTransparent ?? false} onChange={(v) => onChange("headerTransparent", v)} />
      {s.headerSticky && s.headerTransparent && (
        <div style={{ background: "var(--p-color-bg-surface-warning, #fff5e0)", border: "1px solid var(--p-color-border-warning-subdued, #ffd79d)", borderRadius: 7, padding: "8px 10px", fontSize: 11, color: "var(--p-color-text-warning, #b15c00)" }}>
          ⚠️ Sticky + Transparent creates the classic see-through sticky header. Ensure text is readable over page content.
        </div>
      )}

      <SettingRow label="Header Color Sync">
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
          <input type="checkbox" checked={s.headerColorSync ?? false} onChange={(e) => onChange("headerColorSync", e.target.checked)} style={{ width: 14, height: 14, cursor: "pointer" }} />
          <span style={{ fontSize: 12, color: "var(--p-color-text-secondary)" }}>
            {s.headerColorSync ? "ON — background follows primary color" : "OFF — using custom header colors"}
          </span>
        </label>
      </SettingRow>

      {s.headerColorSync && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--p-color-bg-surface-secondary)", border: "1px solid var(--p-color-border-subdued)", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: s.primaryColor, border: "2px solid rgba(0,0,0,0.08)", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--p-color-text)" }}>Header</div>
            <div style={{ fontSize: 11, color: "var(--p-color-text-secondary)", marginTop: 1 }}>bg: {s.primaryColor} · text: #ffffff</div>
          </div>
        </div>
      )}

      <div style={DIVIDER} />

      {/* ── Footer ──────────────────────────────── */}
      <div style={SECTION_TITLE}>Footer</div>

      <CheckboxField label="Sticky Footer" checked={s.footerSticky ?? false} onChange={(v) => onChange("footerSticky", v)} />

      <SettingRow label="Footer Color Sync">
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
          <input type="checkbox" checked={s.footerColorSync ?? false} onChange={(e) => onChange("footerColorSync", e.target.checked)} style={{ width: 14, height: 14, cursor: "pointer" }} />
          <span style={{ fontSize: 12, color: "var(--p-color-text-secondary)" }}>
            {s.footerColorSync ? "ON — background follows text color" : "OFF — using custom footer colors"}
          </span>
        </label>
      </SettingRow>

      {s.footerColorSync && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--p-color-bg-surface-secondary)", border: "1px solid var(--p-color-border-subdued)", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: s.textColor, border: "2px solid rgba(0,0,0,0.08)", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--p-color-text)" }}>Footer</div>
            <div style={{ fontSize: 11, color: "var(--p-color-text-secondary)", marginTop: 1 }}>bg: {s.textColor} · text: {s.backgroundColor}</div>
          </div>
        </div>
      )}

      <div style={DIVIDER} />

      {/* ── Info ──────────────────────────────── */}
      <div style={{ background: "var(--p-color-bg-surface-selected)", border: "1px solid var(--p-color-border-subdued)", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "var(--p-color-text-emphasis)", lineHeight: 1.5 }}>
        💡 <strong>Typography</strong> (font family, heading sizes, base font size)
        applies to header &amp; footer automatically via CSS variables — no toggle
        needed. Color sync takes effect on the next page view.
      </div>
    </div>
  );
}

// ─── Panel: Scroll & Motion ───────────────────────────────────────────────────

function ScrollMotionPanel({ s, onChange }: { s: GlobalSettings; onChange: (f: keyof GlobalSettings, v: any) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={SECTION_TITLE}>Scroll Reveal Animations</div>
      <SelectField label="Scroll Animation" value={s.scrollAnimation ?? "none"} onChange={(v) => onChange("scrollAnimation", v as any)}>
        <option value="none">None</option>
        <option value="fade-in">Fade In </option>
        <option value="slide-up">Slide Up</option>
        <option value="zoom-in">Zoom In </option>
        <option value="slide-left">Slide Left</option>
        <option value="slide-right">Slide Right</option>
      </SelectField>

      {(s.scrollAnimation ?? "none") !== "none" && (
        <>
          <SelectField label="Animation Duration" value={s.scrollAnimationDuration ?? "0.5s"} onChange={(v) => onChange("scrollAnimationDuration", v)}>
            {["0.2s","0.3s","0.4s","0.5s","0.6s","0.8s","1s","1.2s"].map((v) => <option key={v} value={v}>{v}</option>)}
          </SelectField>
          <SelectField label="Stagger Delay" value={s.scrollAnimationDelay ?? "0.1s"} onChange={(v) => onChange("scrollAnimationDelay", v)}>
            {["0s","0.05s","0.1s","0.15s","0.2s","0.25s","0.3s"].map((v) => <option key={v} value={v}>{v}</option>)}
          </SelectField>
          <div style={{ background: "var(--p-color-bg-surface-success, #e7f5ec)", border: "1px solid var(--p-color-border-success-subdued, #b3e3c1)", borderRadius: 8, padding: "9px 12px", fontSize: 11, color: "var(--p-color-text-success, #0f6132)" }}>
            ✓ Elements in .page-preview will animate into view as the user scrolls. Powered by IntersectionObserver — no layout shift.
          </div>
        </>
      )}

      <div style={DIVIDER} />
      <div style={SECTION_TITLE}>Page Transition</div>

      <SelectField label="Page Transition" value={s.pageTransition} onChange={(v) => onChange("pageTransition", v as any)}>
        <option value="none">None</option>
        <option value="fade">Fade</option>
        <option value="slide-up">Slide Up</option>
      </SelectField>
      <SelectField label="Animation Speed" value={s.animationSpeed} onChange={(v) => onChange("animationSpeed", v as any)}>
        <option value="none">None</option>
        <option value="slow">Slow — 0.6s</option>
        <option value="normal">Normal — 0.3s</option>
        <option value="fast">Fast — 0.15s</option>
      </SelectField>

      <div style={DIVIDER} />
      <div style={SECTION_TITLE}>Scroll To Top Button</div>

      <CheckboxField label="Scroll-to-Top Button" checked={s.showScrollToTop ?? false} onChange={(v) => onChange("showScrollToTop", v)} />
      {(s.showScrollToTop ?? false) && (
        <>
          <ColorField label="Button Background" value={s.scrollToTopBgColor ?? "#0158ad"} onChange={(v) => onChange("scrollToTopBgColor", v)} />
          <ColorField label="Icon Color" value={s.scrollToTopIconColor ?? "#ffffff"} onChange={(v) => onChange("scrollToTopIconColor", v)} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "4px 0" }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: s.scrollToTopBgColor ?? "#0158ad", color: s.scrollToTopIconColor ?? "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 12px rgba(0,0,0,0.2)", fontSize: 20 }}>
              ↑
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Panel: Links & Shadows ───────────────────────────────────────────────────

function LinksShadowsPanel({ s, onChange }: { s: GlobalSettings; onChange: (f: keyof GlobalSettings, v: any) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={SECTION_TITLE}>Link Styles</div>

      <ColorField label="Link Color" value={s.linkColor ?? ""} onChange={(v) => onChange("linkColor", v)} />
      <ColorField label="Hover Color" value={s.linkHoverColor ?? ""} onChange={(v) => onChange("linkHoverColor", v)} />
      <SelectField label="Link Decoration" value={s.linkDecoration ?? "hover-underline"} onChange={(v) => onChange("linkDecoration", v as any)}>
        <option value="none">None — no underline</option>
        <option value="underline">Always Underline</option>
        <option value="hover-underline">Hover Underline — appears on hover</option>
      </SelectField>

      {(s.linkColor || s.linkHoverColor) && (
        <div style={{ background: "var(--p-color-bg-surface-secondary)", border: "1px solid var(--p-color-border-subdued)", borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--p-color-text-secondary)", textTransform: "uppercase", marginBottom: 8, fontFamily: "system-ui" }}>Link Preview</div>
          <a href="#" onClick={(e) => e.preventDefault()} style={{ color: s.linkColor || "var(--accent-color)", textDecoration: s.linkDecoration === "underline" ? "underline" : "none", fontSize: 13, fontFamily: s.fontFamily }}>
            Example link text
          </a>
        </div>
      )}

      <div style={DIVIDER} />
      <div style={SECTION_TITLE}>Card & Block Shadows</div>

      <SelectField label="Card Shadow" value={s.cardShadow ?? "none"} onChange={(v) => onChange("cardShadow", v as any)}>
        <option value="none">None</option>
        <option value="sm">Small — subtle lift</option>
        <option value="md">Medium — soft depth</option>
        <option value="lg">Large — clear elevation</option>
        <option value="xl">Extra Large — strong depth</option>
      </SelectField>

      {(s.cardShadow ?? "none") !== "none" && (
        <div style={{ background: "var(--p-color-bg-surface-secondary)", border: "1px solid var(--p-color-border-subdued)", borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--p-color-text-secondary)", textTransform: "uppercase", marginBottom: 8, fontFamily: "system-ui" }}>Shadow Preview</div>
          <div style={{
            background: "var(--p-color-bg-surface)", borderRadius: s.borderRadius,
            padding: "14px 16px", fontSize: 12, color: "var(--p-color-text)",
            boxShadow: ({
              sm: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)",
              md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
              lg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
              xl: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            } as Record<string, string>)[s.cardShadow ?? "sm"] ?? "none",
          }}>
            Card with {s.cardShadow} shadow
          </div>
        </div>
      )}

      <div style={{ background: "var(--p-color-bg-surface-selected)", border: "1px solid var(--p-color-border-subdued)", borderRadius: 8, padding: "9px 12px", fontSize: 11, color: "var(--p-color-text-emphasis)" }}>
        💡 Card shadow applies to the floating card variant in CardBlock. Use <strong>Custom CSS</strong> to target additional elements.
      </div>
    </div>
  );
}

// ─── Menu screen ──────────────────────────────────────────────────────────────

function MenuScreen({ onSelect, scrollRef }: { onSelect: (id: SectionId) => void; scrollRef?: React.RefObject<HTMLDivElement> }) {
  const groups = Array.from(new Set(SECTIONS.map((s) => s.group)));
  return (
    <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
      {groups.map((group, gi) => (
        <div key={group}>
          {/* Group header */}
          <div style={{
            padding: "12px 16px 5px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.07em",
            color: "var(--p-color-text)",
            textTransform: "uppercase" as const,
          }}>
            {group}
          </div>

          {/* Section rows */}
          <div style={{ paddingInline: 8 }}>
            {SECTIONS.filter((s) => s.group === group).map((section) => (
              <button
                key={section.id}
                onClick={() => onSelect(section.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "7px 8px",
                  background: "none",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  textAlign: "left" as const,
                  transition: "background 0.12s ease",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--p-color-bg-surface-selected)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: "var(--p-color-bg-surface-selected)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--p-color-text-emphasis)",
                    flexShrink: 0,
                  }}>
                    {section.icon}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--p-color-text)" }}>{section.label}</span>
                </span>
                <ChevronRight size={13} color="var(--p-color-border)" />
              </button>
            ))}
          </div>

          {/* Group separator (between groups, not after last) */}
          {gi < groups.length - 1 && (
            <div style={{ height: 1, background: "var(--p-color-bg-surface-secondary)", margin: "6px 16px 0" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main plugin form ─────────────────────────────────────────────────────────

// Fields that are synced back into the Puck canvas root props for live preview.
const CANVAS_SYNCED_FIELDS = new Set<keyof GlobalSettings>([
  "primaryColor", "secondaryColor", "accentColor", "textColor", "backgroundColor",
  "fontFamily", "headingFont", "baseFontSize", "lineHeight", "letterSpacing",
  "h1Size", "h2Size", "h3Size", "h4Size", "h5Size", "h6Size",
  "headingWeight", "headingLineHeight", "theme", "containerWidth",
  "borderRadius", "buttonStyle", "buttonPaddingX", "buttonPaddingY",
  "buttonTextTransform", "buttonFontWeight",
  "imageBorderRadius", "imageObjectFit", "imageHoverEffect",
]);

function GlobalSettingsForm() {
  // ── Global settings state lives in GlobalSettingsContext ────────────────────
  const {
    settings,
    settingsRef,
    updateSetting,
    saveSettings,
    resetToDefaults,
    isAtDefaults,
    resetStatus,
    requestResetConfirmation,
    cancelResetConfirmation,
    dismissResetNotification,
    hasUnsaved,
    saveStatus,
  } = useGlobalSettings();

  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const menuScrollRef = useRef<HTMLDivElement>(null);
  const menuScrollTopRef = useRef(0);
  const { dispatch, appState } = usePuck();

  const handleSelectSection = useCallback((id: SectionId) => {
    menuScrollTopRef.current = menuScrollRef.current?.scrollTop ?? 0;
    setActiveSection(id);
  }, []);

  const handleBackToMenu = useCallback(() => {
    setActiveSection(null);
  }, []);

  useEffect(() => {
    if (!activeSection && menuScrollRef.current) {
      menuScrollRef.current.scrollTop = menuScrollTopRef.current;
    }
  }, [activeSection]);

  // Stable refs so handleChange never needs volatile values in its dep array.
  const dispatchRef = useRef(dispatch);
  const appStateRef = useRef(appState);

  useEffect(() => { dispatchRef.current = dispatch; });
  useEffect(() => { appStateRef.current = appState; });

  /**
   * Central change handler — applies visual feedback immediately (CSS vars +
   * Puck canvas props) but does NOT auto-save. The user must press Save.
   *
   * Flow:
   *  1. updateSetting → updates GlobalSettingsContext state synchronously
   *     (sets settingsRef.current before React re-render).
   *  2. applyCSSVariables → synchronous DOM write for zero-latency feedback;
   *     also targets the Puck canvas iframe via the updated utils helper.
   *  3. dispatch replaceRoot → keeps Puck root props in sync for components
   *     that read theme/layout values from props directly, INCLUDING syncing
   *     GlobalHeader/GlobalFooter colors when headerColorSync/footerColorSync
   *     are active.
   */
  const handleChange = useCallback(
    (field: keyof GlobalSettings, value: any): void => {
      // 1. Update context state — settingsRef.current is set synchronously.
      updateSetting(field, value);

      // 2. Apply CSS variables right away for instant visual feedback.
      applyCSSVariables(settingsRef.current);
      if (field === "fontFamily" || field === "headingFont") {
        loadGoogleFont(value as string);
      }

      // 3. Build a single combined root.props update covering:
      //    a) CANVAS_SYNCED_FIELDS (theme, colors, fonts, etc.)
      //    b) GlobalHeader/GlobalFooter backgroundColor/textColor when colorSync is on
      const root = appStateRef.current.data.root;
      const currentProps: Record<string, any> = { ...root?.props };
      let needsDispatch = false;

      // 3a. Standard canvas-synced fields
      if (CANVAS_SYNCED_FIELDS.has(field)) {
        currentProps[field] = value;
        needsDispatch = true;
      }

      // 3b. Header color sync — update headerData.content[].props live
      // Relevant when: primaryColor changes, or headerColorSync itself is toggled
      const headerColorSyncNow: boolean =
        field === "headerColorSync" ? (value as boolean) : (settingsRef.current.headerColorSync ?? false);
      const headerRelevant =
        headerColorSyncNow &&
        (field === "primaryColor" || field === "headerColorSync");

      if (headerRelevant && currentProps.headerData?.content) {
        const newHeaderBg: string =
          field === "primaryColor" ? (value as string) : settingsRef.current.primaryColor;
        currentProps.headerData = {
          ...currentProps.headerData,
          content: (currentProps.headerData.content as any[]).map((item) =>
            item.type === "GlobalHeader"
              ? { ...item, props: { ...item.props, backgroundColor: newHeaderBg, textColor: "#ffffff" } }
              : item,
          ),
        };
        needsDispatch = true;
      }

      // 3c. Footer color sync — bg mirrors textColor, text mirrors backgroundColor
      // Relevant when: textColor/backgroundColor changes, or footerColorSync is toggled
      const footerColorSyncNow: boolean =
        field === "footerColorSync" ? (value as boolean) : (settingsRef.current.footerColorSync ?? false);
      const footerRelevant =
        footerColorSyncNow &&
        (field === "textColor" || field === "backgroundColor" || field === "footerColorSync");

      if (footerRelevant && currentProps.footerData?.content) {
        const newFooterBg: string =
          field === "textColor" ? (value as string) : settingsRef.current.textColor;
        const newFooterText: string =
          field === "backgroundColor" ? (value as string) : settingsRef.current.backgroundColor;
        currentProps.footerData = {
          ...currentProps.footerData,
          content: (currentProps.footerData.content as any[]).map((item) =>
            item.type === "GlobalFooter"
              ? { ...item, props: { ...item.props, backgroundColor: newFooterBg, textColor: newFooterText } }
              : item,
          ),
        };
        needsDispatch = true;
      }

      if (needsDispatch) {
        dispatchRef.current({
          type: "replaceRoot",
          root: { ...root, props: currentProps },
        });
      }
    },
    [updateSetting, settingsRef],
  );

  // Handle reset with confirmation - syncs all canvas fields at once
  const handleResetConfirm = useCallback(() => {
    resetToDefaults();

    // Sync all canvas fields to Puck root props after reset
    const root = appStateRef.current.data.root;
    const resetRootProps: Record<string, any> = { ...root?.props };

    // Apply all synced fields from defaults
    CANVAS_SYNCED_FIELDS.forEach((field) => {
      resetRootProps[field] = settingsRef.current[field];
    });

    // Also reset header/footer colors if colorSync flags were active at default
    const defSettings = settingsRef.current;
    if (defSettings.headerColorSync && resetRootProps.headerData?.content) {
      resetRootProps.headerData = {
        ...resetRootProps.headerData,
        content: (resetRootProps.headerData.content as any[]).map((item: any) =>
          item.type === "GlobalHeader"
            ? { ...item, props: { ...item.props, backgroundColor: defSettings.primaryColor, textColor: "#ffffff" } }
            : item,
        ),
      };
    }
    if (defSettings.footerColorSync && resetRootProps.footerData?.content) {
      resetRootProps.footerData = {
        ...resetRootProps.footerData,
        content: (resetRootProps.footerData.content as any[]).map((item: any) =>
          item.type === "GlobalFooter"
            ? { ...item, props: { ...item.props, backgroundColor: defSettings.textColor, textColor: defSettings.backgroundColor } }
            : item,
        ),
      };
    }

    dispatchRef.current({
      type: "replaceRoot",
      root: { ...root, props: resetRootProps },
    });
  }, [resetToDefaults, settingsRef]);

  const activeInfo = SECTIONS.find((s) => s.id === activeSection);

  const renderPanel = () => {
    switch (activeSection) {
      case "colors":       return <ColorsPanel s={settings} onChange={handleChange} />;
      case "fonts":        return <FontsPanel s={settings} onChange={handleChange} />;
      case "typography":   return <TypographyPanel s={settings} onChange={handleChange} />;
      case "buttons":      return <ButtonsPanel s={settings} onChange={handleChange} />;
      case "images":       return <ImagesPanel s={settings} onChange={handleChange} />;
      case "siteidentity": return <SiteIdentityPanel s={settings} onChange={handleChange} />;
      case "layout":       return <LayoutPanel s={settings} onChange={handleChange} />;
      case "transitions":  return <TransitionsPanel s={settings} onChange={handleChange} />;
      case "headerfooter": return <HeaderFooterPanel s={settings} onChange={handleChange} />;
      case "customcss":    return <CustomCSSPanel s={settings} onChange={handleChange} />;
      case "scrollmotion": return <ScrollMotionPanel s={settings} onChange={handleChange} />;
      case "linkshadows":  return <LinksShadowsPanel s={settings} onChange={handleChange} />;
      default:             return null;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      {activeSection ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderBottom: "1px solid var(--p-color-border-subdued)", background: "var(--p-color-bg-surface-secondary)" }}>
          <button
            onClick={handleBackToMenu}
            style={{
              background: "var(--p-color-bg-surface-secondary)",
              border: "none",
              cursor: "pointer",
              padding: "5px",
              borderRadius: 7,
              color: "var(--p-color-text-secondary)",
              display: "flex",
              transition: "background 0.12s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--p-color-border-subdued)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--p-color-bg-surface-secondary)"; }}
          >
            <ArrowLeft size={14} />
          </button>
          <span style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            background: "var(--p-color-bg-surface-selected)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--p-color-text-emphasis)",
            flexShrink: 0,
          }}>
            {activeInfo?.icon}
          </span>
          <span style={{ fontWeight: 600, fontSize: 13, color: "var(--p-color-text)" }}>{activeInfo?.label}</span>
        </div>
      ) : (
        <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--p-color-border-subdued)", background: "var(--p-color-bg-surface-secondary)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "var(--p-color-bg-fill-brand, #005bd3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <Settings size={16} color="#fff" />
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--p-color-text)" }}>Global Settings</div>
          </div>
        </div>
      )}

      {/* Body */}
      {activeSection
        ? <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>{renderPanel()}</div>
        : <MenuScreen onSelect={handleSelectSection} scrollRef={menuScrollRef} />
      }

      {/* Footer — Save + Reset: only shown when inside a sub-section panel,
          not on the main section-list menu (activeSection === null). */}
      {activeSection && (
        <div style={{ borderTop: "1px solid var(--p-color-border-subdued)", padding: "6px 10px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, background: "var(--p-color-bg-surface-secondary)" }}>
          <button
            type="button"
            onClick={saveSettings}
            disabled={saveStatus === "saving" || !hasUnsaved}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              height: 30, padding: "0 10px",
              border: hasUnsaved ? "1px solid rgba(0,91,211,0.25)" : "1px solid transparent",
              borderRadius: 6, flexShrink: 0,
              background: hasUnsaved ? "rgba(0,91,211,0.08)" : "transparent",
              color: (saveStatus === "saving" || !hasUnsaved) ? "var(--p-color-text-disabled, #8a8a94)" : saveStatus === "error" ? "var(--p-color-text-critical, #d72c0d)" : hasUnsaved ? "#005BD3" : "var(--p-color-text-secondary, #6d7175)",
              cursor: (saveStatus === "saving" || !hasUnsaved) ? "default" : "pointer",
              fontSize: 12, fontWeight: 600,
              transition: "background 0.12s, color 0.12s, border-color 0.12s",
            }}
            onMouseOver={(e) => {
              if (saveStatus === "saving" || !hasUnsaved) return;
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,91,211,0.14)";
            }}
            onMouseOut={(e) => {
              if (saveStatus === "saving" || !hasUnsaved) return;
              (e.currentTarget as HTMLButtonElement).style.background = hasUnsaved ? "rgba(0,91,211,0.08)" : "transparent";
            }}
          >
            {saveStatus === "saved" ? <span style={{ fontSize: 14, lineHeight: 1 }}>✓</span> : saveStatus === "error" ? <span style={{ fontSize: 14, lineHeight: 1 }}>⚠</span> : <Save size={14} />}
            <span>{saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved" : saveStatus === "error" ? "Error saving" : "Save Settings"}</span>
          </button>
          <IconBtn
            icon={<RotateCcw size={14} />}
            label={isAtDefaults ? "Already at defaults" : "Reset to defaults"}
            onClick={requestResetConfirmation}
            danger={!isAtDefaults}
            disabled={isAtDefaults || resetStatus === "confirming"}
          />
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {resetStatus === "confirming" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--p-color-bg-surface-warning, #fff5e0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <RotateCcw size={24} style={{ color: "var(--p-color-text-warning, #b15c00)" }} />
          </div>
          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: 16,
              fontWeight: 700,
              color: "var(--p-color-text)",
              textAlign: "center",
            }}
          >
            Reset all settings?
          </h3>
          <p
            style={{
              margin: "0 0 20px 0",
              fontSize: 13,
              color: "var(--p-color-text-secondary)",
              textAlign: "center",
              lineHeight: 1.5,
              maxWidth: 280,
            }}
          >
            This will restore all Global Settings to their default values.
            You&apos;ll need to save to apply these changes permanently.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={cancelResetConfirmation}
              style={{
                padding: "8px 16px",
                background: "var(--p-color-bg-surface-secondary)",
                color: "var(--p-color-text-secondary)",
                border: "none",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--p-color-border-subdued)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--p-color-bg-surface-secondary)";
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleResetConfirm}
              style={{
                padding: "8px 16px",
                background: "var(--p-color-bg-fill-critical, #d72c0d)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--p-color-text-critical, #d72c0d)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--p-color-bg-fill-critical, #d72c0d)";
              }}
            >
              <RotateCcw size={12} />
              Reset to Default
            </button>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {resetStatus === "reset" && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--p-color-bg-fill-success, #15803d)",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            zIndex: 100,
            animation: "slideUp 0.3s ease-out",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20,6 9,17 4,12" />
          </svg>
          Settings reset successfully
          <button
            onClick={dismissResetNotification}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.8)",
              cursor: "pointer",
              padding: 2,
              display: "flex",
              marginLeft: 4,
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Error Toast Notification */}
      {resetStatus === "error" && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--p-color-bg-fill-critical, #d72c0d)",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            zIndex: 100,
            animation: "slideUp 0.3s ease-out",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          Failed to reset settings
          <button
            onClick={dismissResetNotification}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.8)",
              cursor: "pointer",
              padding: 2,
              display: "flex",
              marginLeft: 4,
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Plugin Factory ───────────────────────────────────────────────────────────

/**
 * Returns a Puck plugin descriptor for the Global Settings side-panel.
 *
 * All settings state, persistence, and CSS application are managed by
 * GlobalSettingsContext — this factory requires no parameters.
 */
export function createGlobalSettingsPlugin() {
  return {
    name: "global-settings",
    label: "Settings",
    icon: <Settings />,
    render: () => <GlobalSettingsForm />,
  };
}


