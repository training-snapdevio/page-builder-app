// @ts-nocheck
// ─────────────────────────────────────────────────────────────────────────────
// Shared editor field primitives & layout helpers used by every block.
//
// These are the reusable building blocks for the Puck side-panel UI: labelled
// inputs, color/number/select fields, the per-block tab bar, and small layout
// helpers. Block components import what they need from here.
// ─────────────────────────────────────────────────────────────────────────────

import {
  cloneElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";

import { FieldLabel } from "@my-app/puck-editor";

// ─── Reusable icon-button alignment field ────────────────────────────────────

function AlignField({
  value,

  onChange,

  label = "Alignment",

  labelIcon = <AlignJustify size={14} />,

  layout = "inline",

  options = [
    { value: "text-left", icon: <AlignLeft size={15} />, title: "Left" },

    { value: "text-center", icon: <AlignCenter size={15} />, title: "Center" },

    { value: "text-right", icon: <AlignRight size={15} />, title: "Right" },
  ],
}: {
  value: string;

  onChange: (v: string) => void;

  label?: string;

  labelIcon?: React.ReactNode;

  layout?: "inline" | "stacked";

  options?: { value: string; icon: React.ReactNode; title: string }[];
}) {
  const isStacked = layout === "stacked";

  const buttons = (
    <div
      style={
        isStacked
          ? { display: "flex", gap: 4, width: "100%" }
          : { display: "flex", gap: 4, flex: 1, minWidth: 0 }
      }
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          title={opt.title}
          onClick={() => onChange(opt.value)}
          style={{
            flex: "1 1 0",
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            height: 28,
            boxSizing: "border-box",
            border: "1px solid",
            borderRadius: "var(--p-border-radius-100, 4px)",
            cursor: "pointer",
            background:
              value === opt.value
                ? "var(--p-color-bg-fill-brand, #005bd3)"
                : "var(--p-color-bg-surface)",
            borderColor:
              value === opt.value
                ? "var(--p-color-bg-fill-brand, #005bd3)"
                : "var(--p-color-border)",
            color:
              value === opt.value
                ? "var(--p-color-text-brand-on-bg-fill, #fff)"
                : "var(--p-color-text)",
            transition: "all 0.15s",
          }}
        >
          {opt.icon
            ? cloneElement(opt.icon as React.ReactElement, {
                color:
                  value === opt.value
                    ? "var(--p-color-text-brand-on-bg-fill, #fff)"
                    : "var(--p-color-text)",
              })
            : opt.title}
        </button>
      ))}
    </div>
  );

  if (isStacked) {
    return (
      <FieldLabel label={label} icon={labelIcon}>
        {buttons}
      </FieldLabel>
    );
  }

  return (
    <FieldLabel label="">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            minWidth: 96,
            color: "#000000",
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1.25,
          }}
        >
          {labelIcon && <span style={{ display: "inline-flex", color: "#000000" }}>{labelIcon}</span>}
          <span>{label}</span>
        </span>
        {buttons}
      </div>
    </FieldLabel>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────

// ─── Toggle switch field (boolean Yes / No) ──────────────────────────────────

function ToggleField({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <FieldLabel label={label}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          role="switch"
          aria-checked={value}
          onClick={() => onChange(!value)}
          style={{
            width: 32,
            height: 18,
            borderRadius: 9,
            border: "none",
            cursor: "pointer",
            position: "relative",
            backgroundColor: value
              ? "var(--p-color-bg-fill-brand, #005bd3)"
              : "var(--p-color-border)",
            transition: "background 0.2s",
            display: "block",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 2,
              left: value ? 16 : 2,
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: "var(--p-color-bg-surface)",
              transition: "left 0.2s",
              display: "block",
            }}
          />
        </button>

        <span
          style={{
            fontSize: 12,
            color: value
              ? "var(--p-color-text-emphasis)"
              : "var(--p-color-text-secondary)",
            fontWeight: 500,
          }}
        >
          {value ? "Yes" : "No"}
        </span>
      </div>
    </FieldLabel>
  );
}

// ─── Columns field (visual column-grid preview buttons) ──────────────────────

function ColumnsField({
  value,
  onChange,
  label = "Columns",

  options,
}: {
  value: number;
  onChange: (v: number) => void;

  label?: string;

  options: { value: number }[];
}) {
  return (
    <FieldLabel label="">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            minWidth: 96,
            color: "#000000",
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1.25,
          }}
        >
          {label}
        </span>
        <div style={{ display: "flex", gap: 4, flex: 1, minWidth: 0 }}>
        {options.map((opt) => (
          <button
            key={opt.value}
            title={`${opt.value} columns`}
            onClick={() => onChange(opt.value)}
            style={{
              flex: "1 1 0",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              padding: "8px 12px",
              boxSizing: "border-box",
              border: "1px solid",
              borderRadius: "var(--p-border-radius-100, 4px)",
              cursor: "pointer",
              background:
                value === opt.value
                  ? "var(--p-color-bg-fill-brand, #005bd3)"
                  : "var(--p-color-bg-surface)",
              borderColor:
                value === opt.value
                  ? "var(--p-color-bg-fill-brand, #005bd3)"
                  : "var(--p-color-border)",
              color:
                value === opt.value
                  ? "var(--p-color-text-brand-on-bg-fill, #fff)"
                  : "var(--p-color-text)",
              transition: "all 0.15s",
            }}
          >
            <div style={{ display: "flex", gap: 2 }}>
              {Array.from({ length: opt.value }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 5,
                    height: 10,
                    backgroundColor:
                      value === opt.value
                        ? "var(--p-color-text-brand-on-bg-fill, #fff)"
                        : "currentColor",
                    borderRadius: 1,
                    opacity: value === opt.value ? 1 : 0.85,
                  }}
                />
              ))}
            </div>

          </button>
        ))}
        </div>
      </div>
    </FieldLabel>
  );
}

// ─── Helper: Stacked text input field ────────────────────────────────────────

function StackedTextField({
  value,

  onChange,

  label,

  placeholder = "",

  icon,
}: {
  value: string;

  onChange: (val: string) => void;

  label: string;

  placeholder?: string;

  icon?: React.ReactNode;
}) {
  const defaultIcon = null;

  const resolvedIcon = icon === undefined ? defaultIcon : icon;

  const inputRef = useRef<HTMLInputElement>(null);
  const cursorPosRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (cursorPosRef.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorPosRef.current, cursorPosRef.current);
      cursorPosRef.current = null;
    }
  });

  return (
    <StackedField label={label} icon={resolvedIcon}>
      <input
        ref={inputRef}
        type="text"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => {
          cursorPosRef.current = e.target.selectionStart;
          onChange(e.target.value);
        }}
        style={{
          width: "100%",
          padding: "5px 8px",
          fontSize: 12,
          border: "1px solid var(--p-color-border)",
          borderRadius: "var(--p-border-radius-100, 4px)",
          outline: "none",
          boxSizing: "border-box",
          background: "var(--p-color-bg-surface)",
          color: "var(--p-color-text)",
        }}
      />
    </StackedField>
  );
}

// ─── Helper: Stacked date picker field ──────────────────────────────────────

function StackedDateField({
  value,
  onChange,
  label,
  icon,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <StackedField label={label} icon={icon}>
      <input
        type="date"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "5px 8px",
          fontSize: 12,
          border: "1px solid var(--p-color-border)",
          borderRadius: "var(--p-border-radius-100, 4px)",
          outline: "none",
          boxSizing: "border-box",
          background: "var(--p-color-bg-surface)",
          color: "var(--p-color-text)",
          cursor: "pointer",
        }}
      />
    </StackedField>
  );
}

// ─── Helper: Stacked number input field ─────────────────────────────────────

function StackedNumberField({
  value,
  onChange,
  label,
  placeholder = "",
  icon,
  min,
  max,
  step = 1,
}: {
  value: number;
  onChange: (val: number) => void;
  label: string;
  placeholder?: string;
  icon?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
}) {
  const [draftValue, setDraftValue] = useState(
    value === undefined || value === null ? "" : String(value),
  );

  useEffect(() => {
    setDraftValue(value === undefined || value === null ? "" : String(value));
  }, [value]);

  const resolvedIcon = icon === undefined ? null : icon;

  const commit = (raw: string) => {
    if (raw === "" || raw === "-" || raw === "." || raw === "-.") {
      setDraftValue(value === undefined || value === null ? "" : String(value));
      return;
    }
    let parsed = Number(raw);
    if (Number.isNaN(parsed)) { setDraftValue(String(value)); return; }
    if (min !== undefined) parsed = Math.max(min, parsed);
    if (max !== undefined) parsed = Math.min(max, parsed);
    onChange(parsed);
    setDraftValue(String(parsed));
  };

  const stepBy = (dir: 1 | -1) => {
    let n = (Number(draftValue) || 0) + dir * (step ?? 1);
    if (min !== undefined) n = Math.max(min, n);
    if (max !== undefined) n = Math.min(max, n);
    onChange(n);
    setDraftValue(String(n));
  };

  const btnStyle: React.CSSProperties = {
    width: 24, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
    border: "1px solid var(--p-color-border)", borderRadius: 4,
    background: "var(--p-color-bg-surface)", cursor: "pointer",
    fontSize: 15, lineHeight: 1, color: "var(--p-color-text)", padding: 0,
    flexShrink: 0, userSelect: "none",
  };

  return (
    <StackedField label={label} icon={resolvedIcon}>
      <div style={{ display: "flex", gap: 3, width: "100%", alignItems: "center" }}>
        <button style={btnStyle} onClick={() => stepBy(-1)} type="button">−</button>
        <input
          type="number"
          value={draftValue}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = e.target.value;
            setDraftValue(v);
            if (v === "" || v === "-" || v.endsWith(".") || v === "-.") return;
            const n = Number(v);
            if (!Number.isNaN(n)) onChange(n);
          }}
          onBlur={(e) => commit(e.target.value)}
          style={{
            flex: 1, minWidth: 0, padding: "5px 6px", fontSize: 12, textAlign: "center",
            border: "1px solid var(--p-color-border)", borderRadius: 4,
            outline: "none", boxSizing: "border-box",
            background: "var(--p-color-bg-surface)", color: "var(--p-color-text)",
            MozAppearance: "textfield",
          }}
        />
        <button style={btnStyle} onClick={() => stepBy(1)} type="button">+</button>
      </div>
    </StackedField>
  );
}

// ─── Helper: Number + Unit field (e.g. Width: 100 [px ▼]) ───────────────────

function NumberUnitField({
  label,
  value,
  unit,
  onValueChange,
  onUnitChange,
  units,
  min = 0,
  max = 9999,
  step = 1,
}: {
  label: string;
  value: number;
  unit: string;
  onValueChange: (v: number) => void;
  onUnitChange: (u: string) => void;
  units: string[];
  min?: number;
  max?: number;
  step?: number;
}) {
  const [draft, setDraft] = useState(value === null || value === undefined ? "" : String(value));
  useEffect(() => {
    setDraft(value === null || value === undefined ? "" : String(value));
  }, [value]);

  const commit = (raw: string) => {
    if (raw === "" || raw === "-") { setDraft(String(value)); return; }
    let n = Number(raw);
    if (Number.isNaN(n)) { setDraft(String(value)); return; }
    if (min !== undefined) n = Math.max(min, n);
    if (max !== undefined) n = Math.min(max, n);
    onValueChange(n);
    setDraft(String(n));
  };

  const stepBy = (dir: 1 | -1) => {
    let n = (Number(draft) || 0) + dir * (step ?? 1);
    if (min !== undefined) n = Math.max(min, n);
    if (max !== undefined) n = Math.min(max, n);
    onValueChange(n);
    setDraft(String(n));
  };

  const btnStyle: React.CSSProperties = {
    width: 22, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
    border: "1px solid var(--p-color-border)", borderRadius: 4, background: "var(--p-color-bg-surface)",
    cursor: "pointer", fontSize: 14, lineHeight: 1, color: "var(--p-color-text)", padding: 0,
    flexShrink: 0, userSelect: "none",
  };

  return (
    <StackedField label={label}>
      <div style={{ display: "flex", gap: 4, width: "100%", alignItems: "center" }}>
        <button style={btnStyle} onClick={() => stepBy(-1)} type="button">−</button>
        <input
          type="number"
          value={draft}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            setDraft(e.target.value);
            const n = Number(e.target.value);
            if (!Number.isNaN(n) && e.target.value !== "" && e.target.value !== "-") onValueChange(n);
          }}
          onBlur={(e) => commit(e.target.value)}
          style={{
            flex: 1, minWidth: 0, padding: "5px 6px", fontSize: 12, textAlign: "center",
            border: "1px solid var(--p-color-border)", borderRadius: 4,
            background: "var(--p-color-bg-surface)", color: "var(--p-color-text)",
            outline: "none", boxSizing: "border-box",
            MozAppearance: "textfield",
          }}
        />
        <button style={btnStyle} onClick={() => stepBy(1)} type="button">+</button>
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
          style={{
            height: 28, padding: "0 4px", fontSize: 11, fontWeight: 600,
            border: "1px solid var(--p-color-border)", borderRadius: 4,
            background: "var(--p-color-bg-surface)", color: "var(--p-color-text)",
            outline: "none", cursor: "pointer", flexShrink: 0,
          }}
        >
          {units.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
    </StackedField>
  );
}

// ─── Helper: Stacked textarea field ───────────────────────────────────────────

function StackedTextareaField({
  value,

  onChange,

  label,

  placeholder = "",

  icon,

  rows = 3,
}: {
  value: string;

  onChange: (val: string) => void;

  label: string;

  placeholder?: string;

  icon?: React.ReactNode;

  rows?: number;
}) {
  const defaultIcon = null;

  const resolvedIcon = icon === undefined ? defaultIcon : icon;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorPosRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (cursorPosRef.current !== null && textareaRef.current) {
      textareaRef.current.setSelectionRange(cursorPosRef.current, cursorPosRef.current);
      cursorPosRef.current = null;
    }
  });

  return (
    <StackedField label={label} icon={resolvedIcon}>
      <textarea
        ref={textareaRef}
        value={value ?? ""}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => {
          cursorPosRef.current = e.target.selectionStart;
          onChange(e.target.value);
        }}
        style={{
          width: "100%",

          padding: "6px 8px",

          fontSize: 12,

          border: "1px solid var(--p-color-border)",

          borderRadius: "var(--p-border-radius-100, 4px)",

          outline: "none",

          boxSizing: "border-box",

          resize: "vertical",

          fontFamily: "inherit",
        }}
      />
    </StackedField>
  );
}

// ─── Helper: Color picker field ────────────────────────────────────────────

function ColorPickerField({
  value,

  onChange,

  label,
}: {
  value: string;

  onChange: (val: string) => void;

  label: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // A stored value may be a CSS variable with a hex fallback, e.g.
  // "var(--primary-color, #0158ad)". Show the human-friendly hex in the text
  // input/swatch instead of the raw var() string.
  const extractHex = (val: string): string => {
    if (!val) return "";
    const m = val.match(/var\(\s*[^,]+,\s*([^)]+)\)/);
    return (m ? m[1] : val).trim();
  };
  const displayValue = extractHex(value);

  // The swatch must show the SAME color the block actually renders. When the
  // value is a CSS variable (e.g. "var(--primary-color, #0158ad)") the block
  // resolves it to the store's theme color, while extractHex() only returns the
  // hex fallback — so the swatch and the button could differ (blue vs green).
  // Resolve the variable from the preview root so the swatch matches the button.
  const [swatchColor, setSwatchColor] = useState<string>(displayValue);
  useEffect(() => {
    if (!value || !value.includes("var(")) { setSwatchColor(displayValue); return; }
    const m = value.match(/var\(\s*(--[^,)\s]+)\s*(?:,\s*([^)]+))?\)/);
    if (!m || typeof document === "undefined") { setSwatchColor(displayValue); return; }
    const varName = m[1];
    const fallback = (m[2] || "").trim();
    const root = (document.querySelector(".page-preview") as HTMLElement) || document.documentElement;
    const computed = root ? getComputedStyle(root).getPropertyValue(varName).trim() : "";
    setSwatchColor(computed || fallback || displayValue);
  }, [value, displayValue]);

  // <input type="color"> only accepts #rrggbb. Normalize the RESOLVED swatch
  // color (hex shorthand, rgb(), etc.) to 6-digit hex so the custom-color picker
  // opens on the button's ACTUAL current color — not the CSS-var hex fallback,
  // which can differ from the resolved theme color (e.g. blue vs green).
  const toHex6 = (c: string): string => {
    const s = (c || "").trim();
    if (/^#[0-9a-fA-F]{6}$/.test(s)) return s.toLowerCase();
    if (/^#[0-9a-fA-F]{3}$/.test(s)) return "#" + s.slice(1).split("").map((ch) => ch + ch).join("").toLowerCase();
    const m = s.match(/rgba?\(([^)]+)\)/i);
    if (m) {
      const [r, g, b] = m[1].split(",").map((x) => parseFloat(x));
      const h = (n: number) => Math.max(0, Math.min(255, Math.round(n || 0))).toString(16).padStart(2, "0");
      return `#${h(r)}${h(g)}${h(b)}`;
    }
    return "";
  };
  const customColorValue = toHex6(swatchColor) || (/^#[0-9a-fA-F]{6}$/.test(displayValue) ? displayValue : "#000000");

  // Close picker when clicking outside

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);

      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const colors = [
    "#ffffff",
    "#f3f4f6",
    "#e5e7eb",
    "#d1d5db",
    "#9ca3af",
    "#6b7280",
    "#4b5563",
    "#374151",
    "#1f2937",
    "#111827",
    "#000000",

    "#fef2f2",
    "#fee2e2",
    "#fecaca",
    "#fca5a5",
    "#f87171",
    "#ef4444",
    "#dc2626",
    "#b91c1c",
    "#991b1b",
    "#7f1d1d",

    "#fff7ed",
    "#ffedd5",
    "#fed7aa",
    "#fdba74",
    "#fb923c",
    "#f97316",
    "#ea580c",
    "#c2410c",
    "#9a3412",
    "#7c2d12",

    "#fffbeb",
    "#fef3c7",
    "#fde68a",
    "#fcd34d",
    "#fbbf24",
    "#f59e0b",
    "#d97706",
    "#b45309",
    "#92400e",
    "#78350f",

    "#ecfdf5",
    "#d1fae5",
    "#a7f3d0",
    "#6ee7b7",
    "#34d399",
    "#10b981",
    "#059669",
    "#047857",
    "#065f46",
    "#064e3b",

    "#eff6ff",
    "#dbeafe",
    "#bfdbfe",
    "#93c5fd",
    "#60a5fa",
    "#3b82f6",
    "#2563eb",
    "#1d4ed8",
    "#1e40af",
    "#1e3a8a",

    "#faf5ff",
    "#f3e8ff",
    "#e9d5ff",
    "#d8b4fe",
    "#c084fc",
    "#a855f7",
    "#9333ea",
    "#7c3aed",
    "#6d28d9",
    "#5b21b6",

    "#fdf4ff",
    "#fae8ff",
    "#f5d0fe",
    "#f0abfc",
    "#e879f9",
    "#d946ef",
    "#c026d3",
    "#a21caf",
    "#86198f",
    "#701a75",
  ];

  return (
    <StackedField label={label}>
      <div
        ref={containerRef}
        style={{ position: "relative" }}
      >
        {/* Single unified input: swatch + hex value, full width like other fields */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            border: "1px solid var(--p-color-border)",
            borderRadius: "var(--p-border-radius-100, 4px)",
            background: "var(--p-color-bg-surface)",
            boxSizing: "border-box",
            height: 30,
            overflow: "hidden",
          }}
        >
          {/* Color preview swatch — inside the input frame */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              width: 22,
              height: 22,
              margin: 2,
              borderRadius: "var(--p-border-radius-100, 4px)",
              border: "1px solid var(--p-color-border-subdued)",
              backgroundColor: swatchColor || "#ffffff",
              cursor: "pointer",
              flexShrink: 0,
              padding: 0,
            }}
            title="Click to open color picker"
          />

          {/* Hex value input — borderless, fills remaining width */}
          <input
            type="text"
            value={displayValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            style={{
              flex: 1,
              padding: "0 8px",
              fontSize: 12,
              border: "none",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "var(--p-font-family-mono, ui-monospace, monospace)",
              background: "transparent",
              color: "var(--p-color-text)",
              height: "100%",
              width: "100%",
              minWidth: 0,
            }}
          />
        </div>

        {/* Color picker dropdown — Polaris popover style */}
        {isOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: 4,
              padding: 10,
              backgroundColor: "var(--p-color-bg-surface)",
              border: "1px solid var(--p-color-border)",
              borderRadius: "var(--p-border-radius-200, 8px)",
              boxShadow: "var(--p-shadow-400, 0 10px 25px rgba(0,0,0,0.15))",
              zIndex: 1000,
              width: 220,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(10, 1fr)",
                gap: 3,
              }}
            >
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    onChange(color);
                    setIsOpen(false);
                  }}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 3,
                    backgroundColor: color,
                    border:
                      displayValue.toLowerCase() === color
                        ? "2px solid var(--p-color-text-emphasis, #0070f3)"
                        : "1px solid var(--p-color-border-subdued, #e1e3e5)",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  title={color}
                />
              ))}
            </div>

            <div
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTop: "1px solid var(--p-color-border-subdued, #cfd6dd)",
              }}
            >
              <label
                style={{
                  fontSize: 11,
                  color: "var(--p-color-text-secondary)",
                  display: "block",
                  marginBottom: 4,
                  fontWeight: 500,
                }}
              >
                Custom color
              </label>
              <input
                type="color"
                value={customColorValue}
                onChange={(e) => onChange(e.target.value)}
                style={{
                  width: "100%",
                  height: 28,
                  border: "1px solid var(--p-color-border)",
                  borderRadius: "var(--p-border-radius-100, 4px)",
                  cursor: "pointer",
                  padding: 2,
                  background: "var(--p-color-bg-surface)",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </StackedField>
  );
}

// ─── Stacked field (label above input - better for long labels) ──────────────

function StackedField({
  label,
  children,
  icon,
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {icon && (
          <span style={{ color: "var(--p-color-icon-secondary, #6d7175)", display: "inline-flex" }}>
            {icon}
          </span>
        )}
        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#000000",
            lineHeight: 1.3,
          }}
        >
          {label}
        </label>
      </div>
      <div>{children}</div>
    </div>
  );
}

function SettingsSectionHeader({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginTop: 14,
        paddingTop: 10,
        borderTop: "1px solid var(--p-color-border-subdued, #cfd6dd)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingInline: 2 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--p-color-text)",
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--p-color-text)",
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}

// ─── 3-Tab sidebar system (Content / Style / Advanced) ───────────────────────

type BlockTab = "content" | "style" | "advanced";

const TAB_LABELS: { id: BlockTab; label: string }[] = [
  { id: "content",  label: "Content"  },
  { id: "style",    label: "Style"    },
  { id: "advanced", label: "Advanced" },
];

// Per-block tab state stored outside React so it survives field re-renders.
const _blockTabState: Record<string, BlockTab> = {};

function useBlockTab(blockKey: string): [BlockTab, (t: BlockTab) => void] {
  const [tab, setTabState] = useState<BlockTab>(
    () => _blockTabState[blockKey] ?? "content",
  );
  const setTab = (t: BlockTab) => {
    _blockTabState[blockKey] = t;
    setTabState(t);
  };
  return [tab, setTab];
}

function BlockTabBar({ blockKey, children }: {
  blockKey: string;
  children: (tab: BlockTab) => React.ReactNode;
}) {
  const [tab, setTab] = useBlockTab(blockKey);
  return (
    <div>
      {/* Tab bar */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid var(--p-color-border-subdued, #cfd6dd)",
        marginBottom: 12,
        gap: 0,
      }}>
        {TAB_LABELS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            style={{
              flex: 1,
              padding: "8px 4px",
              fontSize: 12,
              fontWeight: tab === id ? 600 : 400,
              border: "none",
              borderBottom: tab === id
                ? "2px solid var(--p-color-border-emphasis, #005bd3)"
                : "2px solid transparent",
              backgroundColor: "transparent",
              color: tab === id
                ? "var(--p-color-text-emphasis, #005bd3)"
                : "var(--p-color-text-secondary, #6d7175)",
              cursor: "pointer",
              transition: "color 0.15s, border-color 0.15s",
              marginBottom: -1,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Active tab content */}
      <style>{_tabSectionCss}</style>
      <div className="pb-tab-content" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {children(tab)}
      </div>
    </div>
  );
}

// Section header used inside tabs (lighter than SettingsSectionHeader)
// When it's the first element in a tab the parent flex container makes it :first-child,
// so we suppress the top border via a global CSS rule injected once.
const _tabSectionCss = `
  .pb-tab-content > .pb-tab-section:first-child {
    border-top: none !important;
    margin-top: 0 !important;
    padding-top: 0 !important;
  }
`;
function TabSection({ title }: { title: string }) {
  return (
    <div className="pb-tab-section" style={{
      fontSize: 11,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      color: "var(--p-color-text-secondary, #6d7175)",
      paddingTop: 8,
      paddingBottom: 2,
      borderTop: "1px solid var(--p-color-border-subdued, #e4e5e7)",
      marginTop: 4,
    }}>
      {title}
    </div>
  );
}

// Returns a wrapper style that visually dims a block in the editor when it is
// set to hide on a given viewport, without actually hiding it (so the user can
// still select and edit it). The puck-hide-* CSS classes are only applied by
// puck-renderer.ts (preview) and builder.js (storefront).
function EditorHideOverlay({ hideDesktop, hideTablet, hideMobile }: { hideDesktop?: boolean; hideTablet?: boolean; hideMobile?: boolean }) {
  const labels = [
    hideDesktop && "Desktop",
    hideTablet  && "Tablet",
    hideMobile  && "Mobile",
  ].filter(Boolean).join(", ");
  if (!labels) return null;
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10,
      background: "rgba(0,0,0,0.04)",
      border: "1.5px dashed #f59e0b",
      borderRadius: 4,
      display: "flex", alignItems: "flex-start", justifyContent: "flex-end",
    }}>
      <span style={{
        background: "#f59e0b", color: "#fff", fontSize: 10, fontWeight: 700,
        padding: "2px 6px", borderRadius: "0 4px 0 4px", lineHeight: 1.6,
        letterSpacing: "0.04em", whiteSpace: "nowrap",
      }}>
        Hidden on {labels}
      </span>
    </div>
  );
}

// Compact 4-side spacing input (Margin / Padding)
function FourSideField({
  label,
  value,
  onChange,
  min = 0,
  max = 200,
}: {
  label: string;
  value?: { top?: number; right?: number; bottom?: number; left?: number };
  onChange: (v: { top: number; right: number; bottom: number; left: number }) => void;
  min?: number;
  max?: number;
}) {
  const v = value ?? {};
  const t = v.top ?? 0, r = v.right ?? 0, b = v.bottom ?? 0, l = v.left ?? 0;
  // Default to the linked (single range slider) view for every field, even when
  // the stored sides differ — the per-side T/R/B/L inputs are revealed by clicking
  // the clip/link toggle. (Unlinking never mutates the values, so asymmetric
  // padding like 60/0/60/0 is preserved and shown intact after one click.)
  const [linked, setLinked] = useState(true);

  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  const setAll = (n: number) => { const c = clamp(n); onChange({ top: c, right: c, bottom: c, left: c }); };
  const setSide = (side: "top" | "right" | "bottom" | "left", n: number) =>
    onChange({ top: t, right: r, bottom: b, left: l, [side]: clamp(n) });

  const numBox = (val: number, onCh: (n: number) => void, showUnit = true) => (
    <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--p-color-border)", borderRadius: 6, background: "var(--p-color-bg-surface)", height: 28, overflow: "hidden", width: "100%", minWidth: 0, boxSizing: "border-box" }}>
      <input
        type="number"
        value={val}
        min={min}
        max={max}
        onChange={(e) => onCh(Number(e.target.value))}
        style={{ width: "100%", flex: 1, minWidth: 0, padding: showUnit ? "0 6px" : "0 4px", fontSize: 12, fontWeight: 500, border: "none", outline: "none", background: "transparent", color: "var(--p-color-text)", textAlign: showUnit ? "right" : "center", MozAppearance: "textfield" } as any}
      />
      {showUnit && (
        <span style={{ padding: "0 7px", fontSize: 11, fontWeight: 500, color: "var(--p-color-text-secondary)", background: "var(--p-color-bg-surface-secondary, #f6f6f7)", borderLeft: "1px solid var(--p-color-border)", height: "100%", display: "flex", alignItems: "center", userSelect: "none", flexShrink: 0 }}>
          px
        </span>
      )}
    </div>
  );

  const fill = `${((t - min) / (max - min)) * 100}%`;

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#000" }}>{label}</span>
        <button
          onClick={() => {
            if (!linked) setAll(t);
            setLinked(!linked);
          }}
          title={linked ? "Unlink sides" : "Link all sides"}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: linked ? "var(--p-color-border-emphasis,#005bd3)" : "var(--p-color-text-secondary)", display: "flex", alignItems: "center" }}
        >
          {linked ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.84 12.25l1.72-1.71a5 5 0 0 0-7.07-7.07l-3 3a5 5 0 0 0 .54 7.54"/><path d="M5.16 11.75l-1.72 1.71a5 5 0 0 0 7.07 7.07l3-3a5 5 0 0 0-.54-7.54"/>
            </svg>
          )}
        </button>
      </div>

      {linked ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="range"
              min={min}
              max={max}
              step={1}
              value={t}
              onChange={(e) => setAll(Number(e.target.value))}
              style={{ flex: 1, minWidth: 0, cursor: "pointer", appearance: "none", WebkitAppearance: "none", height: 11, background: "transparent", outline: "none", border: "none", padding: 0, "--fill": fill } as any}
            />
            <div style={{ width: 76, flexShrink: 0 }}>{numBox(t, (n) => setAll(n))}</div>
          </div>
          <style>{`
            input[type=range]::-webkit-slider-runnable-track{height:3px;border-radius:99px;background:linear-gradient(to right,#1a1a1a var(--fill,0%),#d1d5db var(--fill,0%))}
            input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:11px;height:11px;border-radius:50%;background:#1a1a1a;cursor:pointer;margin-top:-4px;box-shadow:none}
            input[type=range]::-moz-range-track{height:3px;border-radius:99px;background:#d1d5db}
            input[type=range]::-moz-range-progress{height:3px;border-radius:99px;background:#1a1a1a}
            input[type=range]::-moz-range-thumb{width:11px;height:11px;border-radius:50%;background:#1a1a1a;cursor:pointer;border:none}
            input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
          `}</style>
        </>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 6 }}>
          {(["top", "right", "bottom", "left"] as const).map((side) => (
            <div key={side} style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center", minWidth: 0 }}>
              <span style={{ fontSize: 10, color: "var(--p-color-text-secondary)" }}>
                {side === "top" ? "T" : side === "right" ? "R" : side === "bottom" ? "B" : "L"}
              </span>
              {numBox(v[side] ?? 0, (n) => setSide(side, n), false)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Inline select helper
function InlineSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <StackedField label={label}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "5px 8px",
          fontSize: 12,
          border: "1px solid var(--p-color-border)",
          borderRadius: "var(--p-border-radius-100, 4px)",
          outline: "none",
          boxSizing: "border-box",
          background: "var(--p-color-bg-surface)",
          color: "var(--p-color-text)",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </StackedField>
  );
}

// ─── Responsive Spacing helpers ──────────────────────────────────────────────

/**
 * Generates a CSS string for responsive spacing overrides, keyed by a unique
 * block id. Used in both the editor canvas (as an inline <style> tag) and the
 * storefront renderer (via responsiveSpacingStyle in puck-renderer.ts).
 *
 * Usage in a block render:
 *   {responsiveSpacingCss && <style>{responsiveSpacingCss(`#${id || "blk"}`, responsiveSpacing)}</style>}
 */
export function buildResponsiveSpacingCss(
  selector: string,
  rs: ResponsiveSpacing | undefined | null,
): string {
  if (!rs) return "";
  const side = (v: any) => Number(v ?? 0);
  const mRule = (bp: any) =>
    bp?.margin
      ? `margin:${side(bp.margin.top)}px ${side(bp.margin.right)}px ${side(bp.margin.bottom)}px ${side(bp.margin.left)}px!important;`
      : "";
  const pRule = (bp: any) =>
    bp?.padding
      ? `padding:${side(bp.padding.top)}px ${side(bp.padding.right)}px ${side(bp.padding.bottom)}px ${side(bp.padding.left)}px!important;`
      : "";

  const rules: string[] = [];
  const d = mRule(rs.desktop) + pRule(rs.desktop);
  if (d) rules.push(`@media(min-width:1024px){${selector}{${d}}}`);
  const t = mRule(rs.tablet) + pRule(rs.tablet);
  if (t) rules.push(`@media(min-width:768px) and (max-width:1023px){${selector}{${t}}}`);
  const m = mRule(rs.mobile) + pRule(rs.mobile);
  if (m) rules.push(`@media(max-width:767px){${selector}{${m}}}`);
  return rules.join("");
}

/**
 * Drop this inside any block render to inject responsive spacing as a <style> tag.
 * Uses the cssId if provided, otherwise falls back to a React useId-based uid.
 *
 * Usage:
 *   <ResponsiveSpacingStyle id={cssId} responsiveSpacing={responsiveSpacing} />
 *
 * The generated CSS targets `[data-pb-rs="<uid>"]` on the outer wrapper div,
 * which each block should add: data-pb-rs={rsUid}
 *
 * Simpler pattern — just call buildResponsiveSpacingStyle(id, rs) inline:
 *   const rsCss = buildResponsiveSpacingCss(`[data-pb-rs="${uid}"]`, responsiveSpacing);
 *   {rsCss && <style>{rsCss}</style>}
 */

// ─── Responsive Spacing Field ─────────────────────────────────────────────────
// Shows Desktop / Tablet / Mobile tabs. Each tab has Margin + Padding FourSideFields.
// Stored as: { desktop: {margin,padding}, tablet: {margin,padding}, mobile: {margin,padding} }

type FourSide = { top: number; right: number; bottom: number; left: number };
export type ResponsiveSpacing = {
  desktop?: { margin?: Partial<FourSide>; padding?: Partial<FourSide> };
  tablet?:  { margin?: Partial<FourSide>; padding?: Partial<FourSide> };
  mobile?:  { margin?: Partial<FourSide>; padding?: Partial<FourSide> };
};

const BPIcon = {
  desktop: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
    </svg>
  ),
  tablet: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="18" r="1"/>
    </svg>
  ),
  mobile: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="18" r="1"/>
    </svg>
  ),
};

function ResponsiveSpacingField({
  value,
  onChange,
  defaultMargin = { top: 0, right: 0, bottom: 0, left: 0 },
  defaultPadding = { top: 0, right: 0, bottom: 0, left: 0 },
}: {
  value?: ResponsiveSpacing;
  onChange: (v: ResponsiveSpacing) => void;
  defaultMargin?: Partial<FourSide>;
  defaultPadding?: Partial<FourSide>;
}) {
  const [bp, setBp] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const val = value ?? {};
  const bpVal = val[bp] ?? {};

  const merge = (side: "margin" | "padding", fs: FourSide) =>
    onChange({ ...val, [bp]: { ...bpVal, [side]: fs } });

  const tabs: Array<"desktop" | "tablet" | "mobile"> = ["desktop", "tablet", "mobile"];
  const bpLabel: Record<string, string> = { desktop: "Desktop", tablet: "Tablet", mobile: "Mobile" };

  return (
    <div style={{ marginBottom: 8 }}>
      {/* Breakpoint switcher */}
      <div style={{ display: "flex", gap: 4, marginBottom: 10, background: "var(--p-color-bg-surface-secondary,#f6f6f7)", borderRadius: 8, padding: 3 }}>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setBp(t)}
            title={bpLabel[t]}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              padding: "5px 8px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
              background: bp === t ? "#fff" : "transparent",
              color: bp === t ? "var(--p-color-text,#202223)" : "var(--p-color-text-secondary,#6d7175)",
              boxShadow: bp === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.15s",
            }}
          >
            {BPIcon[t]}{bpLabel[t]}
          </button>
        ))}
      </div>
      <FourSideField
        label="Margin (px)"
        value={{ top: defaultMargin.top ?? 0, right: defaultMargin.right ?? 0, bottom: defaultMargin.bottom ?? 0, left: defaultMargin.left ?? 0, ...bpVal.margin }}
        onChange={(fs) => merge("margin", fs)}
      />
      <FourSideField
        label="Padding (px)"
        value={{ top: defaultPadding.top ?? 0, right: defaultPadding.right ?? 0, bottom: defaultPadding.bottom ?? 0, left: defaultPadding.left ?? 0, ...bpVal.padding }}
        onChange={(fs) => merge("padding", fs)}
      />
    </div>
  );
}

export {
  AlignField,
  ToggleField,
  ColumnsField,
  StackedTextField,
  StackedDateField,
  StackedNumberField,
  NumberUnitField,
  StackedTextareaField,
  ColorPickerField,
  StackedField,
  SettingsSectionHeader,
  TAB_LABELS,
  useBlockTab,
  BlockTabBar,
  TabSection,
  EditorHideOverlay,
  FourSideField,
  ResponsiveSpacingField,
  InlineSelect,
};
export type { BlockTab, ResponsiveSpacing };
// buildResponsiveSpacingCss is already exported inline above

// ─────────────────────────────────────────────────────────────────────────────
// Slider / icon-group field helpers (shared by layout, grid and content blocks)
// ─────────────────────────────────────────────────────────────────────────────

function SliderNumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "px",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <FieldLabel label="">
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--p-color-text)" }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value ?? 0}
            onChange={(e) => onChange(clamp(Number(e.target.value)))}
            style={{ flex: 1, minWidth: 0, cursor: "pointer", appearance: "none", WebkitAppearance: "none", height: 11, background: "transparent", outline: "none", border: "none", padding: 0, "--fill": `${(((value??0)-min)/(max-min))*100}%` } as any}
          />
          <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--p-color-border)", borderRadius: 6, background: "var(--p-color-bg-surface)", height: 28, overflow: "hidden", flexShrink: 0 }}>
            <input
              type="number"
              value={value ?? 0}
              min={min}
              max={max}
              step={step}
              onChange={(e) => onChange(clamp(Number(e.target.value)))}
              style={{ width: 36, padding: "0 6px", fontSize: 12, fontWeight: 500, border: "none", outline: "none", background: "transparent", color: "var(--p-color-text)", textAlign: "right", MozAppearance: "textfield" }}
            />
            {unit && (
              <span style={{ padding: "0 7px", fontSize: 11, fontWeight: 500, color: "var(--p-color-text-secondary)", background: "var(--p-color-bg-surface-secondary, #f6f6f7)", borderLeft: "1px solid var(--p-color-border)", height: "100%", display: "flex", alignItems: "center", userSelect: "none", flexShrink: 0 }}>
                {unit.toLowerCase()}
              </span>
            )}
          </div>
        </div>
        <style>{`
          input[type=range]::-webkit-slider-runnable-track{height:3px;border-radius:99px;background:linear-gradient(to right,#1a1a1a var(--fill,0%),#d1d5db var(--fill,0%))}
          input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:11px;height:11px;border-radius:50%;background:#1a1a1a;cursor:pointer;margin-top:-4px;box-shadow:none}
          input[type=range]::-moz-range-track{height:3px;border-radius:99px;background:#d1d5db}
          input[type=range]::-moz-range-progress{height:3px;border-radius:99px;background:#1a1a1a}
          input[type=range]::-moz-range-thumb{width:11px;height:11px;border-radius:50%;background:#1a1a1a;cursor:pointer;border:none}
          input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
        `}</style>
      </div>
    </FieldLabel>
  );
}

// Slider + number box like SliderNumberField, but the unit is a selectable
// dropdown (e.g. Width: 100 [% ▼]). The slider range adapts to the unit so a
// percentage caps at 100 while px allows a larger range.
function SliderUnitField({
  label,
  value,
  unit,
  onValueChange,
  onUnitChange,
  units = ["%", "px"],
  step = 1,
}: {
  label: string;
  value: number;
  unit: string;
  onValueChange: (v: number) => void;
  onUnitChange: (u: string) => void;
  units?: string[];
  step?: number;
}) {
  // Percent/viewport units cap at 100; px gets a wider, more useful range.
  const max = unit === "px" ? 1000 : 100;
  const min = 0;
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  const v = clamp(value ?? 0);
  return (
    <FieldLabel label="">
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--p-color-text)" }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={v}
            onChange={(e) => onValueChange(clamp(Number(e.target.value)))}
            style={{ flex: 1, minWidth: 0, cursor: "pointer", appearance: "none", WebkitAppearance: "none", height: 11, background: "transparent", outline: "none", border: "none", padding: 0, "--fill": `${((v - min) / (max - min)) * 100}%` } as any}
          />
          <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--p-color-border)", borderRadius: 6, background: "var(--p-color-bg-surface)", height: 28, overflow: "hidden", flexShrink: 0 }}>
            <input
              type="number"
              value={v}
              min={min}
              max={max}
              step={step}
              onChange={(e) => onValueChange(clamp(Number(e.target.value)))}
              style={{ width: 36, padding: "0 6px", fontSize: 12, fontWeight: 500, border: "none", outline: "none", background: "transparent", color: "var(--p-color-text)", textAlign: "right", MozAppearance: "textfield" }}
            />
            <select
              value={unit}
              onChange={(e) => onUnitChange(e.target.value)}
              style={{ padding: "0 4px 0 7px", fontSize: 11, fontWeight: 500, color: "var(--p-color-text-secondary)", background: "var(--p-color-bg-surface-secondary, #f6f6f7)", borderLeft: "1px solid var(--p-color-border)", border: "none", borderLeftWidth: 1, borderLeftStyle: "solid", borderLeftColor: "var(--p-color-border)", height: "100%", cursor: "pointer", outline: "none", appearance: "auto" }}
            >
              {units.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
        <style>{`
          input[type=range]::-webkit-slider-runnable-track{height:3px;border-radius:99px;background:linear-gradient(to right,#1a1a1a var(--fill,0%),#d1d5db var(--fill,0%))}
          input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:11px;height:11px;border-radius:50%;background:#1a1a1a;cursor:pointer;margin-top:-4px;box-shadow:none}
          input[type=range]::-moz-range-track{height:3px;border-radius:99px;background:#d1d5db}
          input[type=range]::-moz-range-progress{height:3px;border-radius:99px;background:#1a1a1a}
          input[type=range]::-moz-range-thumb{width:11px;height:11px;border-radius:50%;background:#1a1a1a;cursor:pointer;border:none}
          input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
        `}</style>
      </div>
    </FieldLabel>
  );
}

// ─── Direction / icon button row (used by Container block) ───────────────────

function IconButtonGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; title: string; icon: React.ReactNode }[];
}) {
  return (
    <FieldLabel label="">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#000", minWidth: 90, flexShrink: 0 }}>{label}</span>
        <div style={{ display: "flex", gap: 3, flex: 1 }}>
          {options.map((opt) => (
            <button
              key={opt.value}
              title={opt.title}
              onClick={() => onChange(opt.value)}
              style={{
                flex: "1 1 0", minWidth: 0, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                padding: 0, border: "1px solid", borderRadius: 4, cursor: "pointer",
                background: value === opt.value ? "var(--p-color-bg-fill-brand, #005bd3)" : "var(--p-color-bg-surface)",
                borderColor: value === opt.value ? "var(--p-color-bg-fill-brand, #005bd3)" : "var(--p-color-border)",
                color: value === opt.value ? "#fff" : "var(--p-color-text)",
                transition: "all 0.15s",
              }}
            >
              {opt.icon}
            </button>
          ))}
        </div>
      </div>
    </FieldLabel>
  );
}

// Inline SVG arrows for direction picker
const DIR_ICONS = {
  row:            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  column:         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M6 13l6 6 6-6"/></svg>,
  "row-reverse":  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>,
  "column-reverse":<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M6 11l6-6 6 6"/></svg>,
};
const JUSTIFY_ICONS = {
  "flex-start":    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="5" width="3" height="14"/><rect x="8" y="8" width="5" height="8"/><rect x="15" y="6" width="7" height="12"/></svg>,
  center:          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="10.5" y="3" width="3" height="18"/><rect x="5" y="7" width="5" height="10"/><rect x="14" y="5" width="6" height="14"/></svg>,
  "flex-end":      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="18" y="5" width="3" height="14"/><rect x="11" y="8" width="5" height="8"/><rect x="3" y="6" width="7" height="12"/></svg>,
  "space-between": <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="4" height="12"/><rect x="10" y="6" width="4" height="12"/><rect x="18" y="6" width="4" height="12"/></svg>,
  "space-around":  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="7" width="4" height="10"/><rect x="10" y="7" width="4" height="10"/><rect x="16" y="7" width="4" height="10"/></svg>,
  "space-evenly":  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="7" width="3" height="10"/><rect x="10" y="7" width="4" height="10"/><rect x="18" y="7" width="3" height="10"/></svg>,
};
const ALIGN_ICONS = {
  "flex-start": <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5h18"/><rect x="5" y="8" width="5" height="11"/><rect x="14" y="8" width="5" height="7"/></svg>,
  center:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18"/><rect x="5" y="5" width="5" height="14"/><rect x="14" y="7" width="5" height="10"/></svg>,
  "flex-end":   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 19h18"/><rect x="5" y="5" width="5" height="11"/><rect x="14" y="9" width="5" height="7"/></svg>,
  stretch:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5h18M3 19h18"/><rect x="5" y="5" width="5" height="14"/><rect x="14" y="5" width="5" height="14"/></svg>,
};
const WRAP_ICONS = {
  nowrap: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16M4 7h16M4 17h16"/></svg>,
  wrap:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h10M4 12h16M4 18h10M18 15l3 3-3 3"/></svg>,
};

export {
  SliderNumberField,
  SliderUnitField,
  IconButtonGroup,
  DIR_ICONS,
  JUSTIFY_ICONS,
  ALIGN_ICONS,
  WRAP_ICONS,
};
