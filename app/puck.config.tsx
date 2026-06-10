// @ts-nocheck

import {
  DropZone,
  FieldLabel,
  registerOverlayPortal,
  Render,
  usePuck,
  type Config,
} from "@my-app/puck-editor";

import { cloneElement, createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  PanelLeft,
  PanelRight,
  Image as ImageIcon,
  Layers,
  Settings2,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Square,
  Copy,
  Minus,
  LayoutGrid,
  Circle,
  Sparkles,
  Type,
  Video,
} from "lucide-react";

import Modal from "@/components/modal";

import type { GlobalSettings } from "@/lib/settings.server";

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
              backgroundColor: value || "#ffffff",
              cursor: "pointer",
              flexShrink: 0,
              padding: 0,
            }}
            title="Click to open color picker"
          />

          {/* Hex value input — borderless, fills remaining width */}
          <input
            type="text"
            value={value ?? ""}
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
                      value === color
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
                value={value || "#000000"}
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

// Compact 4-side spacing input (Margin / Padding)
function FourSideField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: { top?: number; right?: number; bottom?: number; left?: number };
  onChange: (v: { top: number; right: number; bottom: number; left: number }) => void;
}) {
  const v = value ?? {};
  const sides = ["top", "right", "bottom", "left"] as const;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#000" }}>{label}</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4 }}>
        {sides.map((side) => (
          <div key={side} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 10, color: "var(--p-color-text-secondary)", textTransform: "capitalize", textAlign: "center" }}>
              {side.charAt(0).toUpperCase()}
            </span>
            <input
              type="number"
              value={v[side] ?? 0}
              onChange={(e) => onChange({ top: v.top ?? 0, right: v.right ?? 0, bottom: v.bottom ?? 0, left: v.left ?? 0, [side]: Number(e.target.value) })}
              style={{
                width: "100%",
                padding: "4px 4px",
                fontSize: 11,
                border: "1px solid var(--p-color-border)",
                borderRadius: "var(--p-border-radius-100, 4px)",
                outline: "none",
                boxSizing: "border-box",
                background: "var(--p-color-bg-surface)",
                color: "var(--p-color-text)",
                textAlign: "center",
              }}
            />
          </div>
        ))}
      </div>
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

// ─────────────────────────────────────────────────────────────────────────────

export type RootProps = {
  title?: string;

  theme: "light" | "dark";

  containerWidth: string;

  primaryColor: string;

  fontFamily: string;

  headerData?: any;

  footerData?: any;

  isGlobalEditor?: boolean;

  backgroundColor?: string;

  textColor?: string;
};

type Props = {
  Hero: {
    title: string;

    subtitle?: string;

    badge?: string;

    description: string;

    rating?: number;

    reviewCount?: number;

    features?: {
      text: string;
    }[];

    buttons: {
      label: string;

      link: string;

      variant: "primary" | "secondary" | "outline";
    }[];

    image: {
      url: string;

      mode: "inline" | "bg" | "custom";

      position: "left" | "right";
    };

    backgroundColor?: string;

    gradientStartColor?: string;

    gradientEndColor?: string;

    gradientDirection?: string;

    glassEffect?: boolean;

    glassBlur?: number;

    patternType?: "none" | "dots" | "grid" | "waves" | "geometric";

    patternColor?: string;

    textColor?: string;

    videoUrl?: string;

    videoLoop?: boolean;

    videoMuted?: boolean;

    floatingElements?: {
      enabled: boolean;

      elements: Array<{
        type: "circle" | "square" | "triangle" | "blob";

        size: number;

        color: string;

        position: { x: string; y: string };

        animation: "float" | "pulse" | "rotate" | "bounce";
      }>;
    };

    geometricShapes?: {
      enabled: boolean;

      shapes: Array<{
        type: "circle" | "square" | "triangle" | "hexagon";

        size: number;

        color: string;

        position: { x: string; y: string };

        rotation: number;

        opacity: number;
      }>;
    };

    parallaxEffect?: {
      enabled: boolean;

      intensity: number;
    };

    fullscreen?: boolean;

    padding: number;

    align: "text-left" | "text-center" | "text-right";

    overlayOpacity?: number;

    verticalAlign?: "items-start" | "items-center" | "items-end";

    contentWidth?: "max-w-md" | "max-w-xl" | "max-w-full";

    // ── Slider Mode ────────────────────────────────────────────────────────────────

    sliderEnabled?: boolean;

    slides?: any[];

    autoplay?: boolean;

    interval?: number;

    showArrows?: boolean;

    showDots?: boolean;

    pauseOnHover?: boolean;

    transitionDuration?: number;
  };

  MarqueeBar: {
    text: string;

    speed: number;

    direction: "left" | "right";

    pauseOnHover: boolean;

    backgroundColor: string;

    textColor: string;

    fontSize: number;

    padding: number;

    repeat: number;
  };

  HeadingBlock: {
    title: string;
    alignment: string;
    subtitle?: string;
    subtitleColor?: string;
    subtitleSize?: number;
    dividerType?: "none" | "line" | "double-line" | "line-with-icon";
    dividerColor?: string;
    dividerLength?: number;
    dividerThickness?: number;
    dividerAlignment?: "left" | "center" | "right";
    dividerIcon?: string;
  };

  Text: { title: string; alignment: string };

  GlobalBlock: { globalBlockId: string; _name: string };



  Article: {
    articleTitle: string;
    author: string;
    showAuthor: boolean;
    publishDate: string;
    showDate: boolean;
    body: string;
    featuredImage?: string;
    imagePosition?: "top" | "left" | "right";
    imageStyle?: "none" | "rectangle" | "square" | "circle";
    imageHeight?: number;
    imageBorderRadius?: number;
    titleAlign?: "left" | "center" | "right";
    lineHeight?: number;
    letterSpacing?: number;
    titleFontWeight?: string;
    metaFontWeight?: string;
    bodyFontWeight?: string;
    backgroundColor?: string;
    titleColor?: string;
    bodyColor?: string;
    metaColor?: string;
    contentWidth?: "small" | "medium" | "large";
  };

  AboutSection: {
    // Content
    badge?: string;
    title: string;
    subtitle?: string;
    description?: string;
    stats?: { value: string; label: string }[];
    primaryButtonLabel?: string;
    primaryButtonLink?: string;
    secondaryButtonLabel?: string;
    secondaryButtonLink?: string;
    // Image
    image?: { url?: string };
    imagePosition?: "left" | "right" | "top";
    imageStyle?: "square" | "rounded" | "circle";
    imageRadius?: number;
    imageHeight?: number;
    imageShadow?: boolean;
    // Layout
    textAlign?: "left" | "center" | "right";
    verticalAlign?: "top" | "center" | "bottom";
    columnGap?: number;
    maxWidth?: number;
    padding?: number;
    showStats?: boolean;
    // Style / colors
    backgroundColor?: string;
    badgeColor?: string;
    titleColor?: string;
    subtitleColor?: string;
    descriptionColor?: string;
    statValueColor?: string;
    statLabelColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
  };






  GallerySection: {
    title?: string;

    subtitle?: string;

    columns: 2 | 3 | 4;

    gap: number;

    images: { url: string; caption?: string; alt?: string }[];

    backgroundColor?: string;

    textColor?: string;

    padding?: number;
  };

  ServiceSection: {
    title?: string;

    subtitle?: string;

    description?: string;

    columns: 2 | 3 | 4;

    cardStyle: "bordered" | "shadow" | "flat";

    layoutStyle?:
      | "standard"
      | "image-top"
      | "image-left"
      | "image-right"
      | "icon-center";

    services: {
      icon?: string;
      title: string;
      description: string;
      linkLabel?: string;
      link?: string;
      image?: { url: string };
    }[];

    backgroundColor?: string;

    padding?: number;

    contentAlign?: "left" | "center" | "right";
  };

  ContactSection: {
    title?: string;

    subtitle?: string;

    description?: string;

    email?: string;

    phone?: string;

    address?: string;

    showForm: boolean;

    buttonLabel?: string;

    backgroundColor?: string;

    padding?: number;

    layoutStyle?: "split" | "centered" | "full-width" | "grid" | "cards";

    cardStyle?: "modern" | "minimal" | "glassmorphism" | "gradient" | "shadow";

    image?: {
      url?: string;

      mode?: "inline" | "bg" | "custom";

      position?: "left" | "right";
    };

    columns?: 1 | 2 | 3 | 4;

    accentColor?: string;

    backgroundPattern?: "dots" | "lines" | "gradient" | "geometric" | "none";

    socialLinks?: { platform: string; url: string; icon?: string }[];

    workingHours?: { days: string; hours: string }[];

    responseTime?: string;

    mapEmbed?: string;

    hoverEffects?: boolean;

    borderRadius?: number;

    spacing?: "compact" | "normal" | "generous";

    contentCentered?: boolean;

    imagePosition?: "left" | "right" | "top" | "bottom";

    overlayOpacity?: number;

    labelName?: string;

    labelEmail?: string;

    labelSubject?: string;

    labelMessage?: string;
  };

  TestimonialSection: {
    title?: string;

    subtitle?: string;

    columns: 1 | 2 | 3;

    testimonials: {
      quote: string;
      author: string;
      role?: string;
      avatar?: string;
      rating?: number;
    }[];

    backgroundColor?: string;

    padding?: number;

    layoutStyle?: "standard" | "avatar-top" | "centered" | "minimal";

    cardStyle?: "bordered" | "shadow" | "minimal" | "glass";

    avatarSize?: "small" | "medium" | "large";

    showQuotes?: boolean;

    contentAlign?: "left" | "center" | "right";

    cardBackgroundColor?: string;

    accentColor?: string;

    sliderEnabled?: boolean;

    autoplay?: boolean;

    interval?: number;

    showArrows?: boolean;

    showDots?: boolean;
  };

  PhotoCollage: {
    layout: "simple" | "mixed" | "hero" | "balanced";

    images: { url: string; alt?: string }[];

    gap: number;

    padding: number;

    backgroundColor?: string;

    borderRadius?: number;
  };
};

const imageUploadField = {
  type: "custom" as const,

  label: "Image",

  render: ({
    value,

    onChange,

    field,
  }: {
    value: string;

    onChange: (val: string) => void;

    field: any;
  }) => {
    const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "error">(
      "idle",
    );
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset so picking the same file twice still fires onChange.
      e.target.value = "";

      // Shopify Files cap; also keeps unintentionally huge uploads out.
      const maxSizeMB = 20;
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`Image is too large. Maximum ${maxSizeMB}MB.`);
        return;
      }

      setUploadStatus("uploading");
      setUploadError(null);

      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/upload-asset", { method: "POST", body: form });
        const result = (await res.json()) as
          | { ok: true; url: string }
          | { ok: false; error: string };
        if (!result.ok) throw new Error(result.error || "Upload failed");

        onChange(result.url);
        setUploadStatus("idle");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setUploadError(msg);
        setUploadStatus("error");
      }
    };

    // Legacy: pre-existing data URLs from older saves. The user should re-upload
    // to convert to a CDN URL — these are the source of the 512 KB overflow.
    const isDataImage = typeof value === "string" && value.startsWith("data:image");
    const useCompactPreview = field?.previewLayout === "compact";

    /* ── shared button base ─────────────────────────────── */

    const btnBase: React.CSSProperties = {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      fontSize: 12,
      fontWeight: 600,
      padding: "7px 10px",
      borderRadius: "var(--p-border-radius-200, 8px)",
      cursor: "pointer",
      border: "1px solid var(--p-color-border-subdued)",
      backgroundColor: "var(--p-color-bg-surface)",
      color: "var(--p-color-text)",
      transition: "background 0.15s, border-color 0.15s",
      whiteSpace: "nowrap" as const,
    };

    return (
      <FieldLabel label={useCompactPreview ? "" : (field.label || "Image")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={
              useCompactPreview
                ? {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }
                : { display: "block" }
            }
          >
            {useCompactPreview && (
              <span style={{ fontSize: 13, fontWeight: 600, color: "#000000" }}>
                {field.label || "Image"}
              </span>
            )}

            <label
              style={{
                display: "block",
                width: useCompactPreview ? 92 : "100%",
                height: useCompactPreview ? 58 : "auto",
                aspectRatio: useCompactPreview ? undefined : (value ? undefined : "16/7"),
                minHeight: useCompactPreview ? undefined : (value ? 0 : 80),
                border: value
                  ? "1.5px solid var(--p-color-border-subdued)"
                  : `${useCompactPreview ? "1.5" : "2"}px dashed var(--p-color-border)`,
                borderRadius: "var(--p-border-radius-200, 8px)",
                overflow: "hidden",
                cursor: "pointer",
                backgroundColor: "var(--p-color-bg-surface-secondary)",
                transition: "border-color 0.2s",
                position: "relative",
                flexShrink: useCompactPreview ? 0 : undefined,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor =
                  "var(--p-color-border-emphasis, #005bd3)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = value
                  ? "var(--p-color-border-subdued)"
                  : "var(--p-color-border)")
              }
            >
              {value ? (
                <img
                  src={value}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='180' viewBox='0 0 400 180'%3E%3Crect width='400' height='180' fill='%23f3f4f6'/%3E%3Cg transform='translate(175%2C60)'%3E%3Crect x='0' y='0' width='50' height='40' rx='4' fill='none' stroke='%239ca3af' stroke-width='2'/%3E%3Ccircle cx='14' cy='14' r='5' fill='%239ca3af'/%3E%3Cpolyline points='0%2C30 14%2C18 26%2C26 36%2C14 50%2C30' fill='none' stroke='%239ca3af' stroke-width='2'/%3E%3C/g%3E%3Ctext x='50%25' y='75%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='13' fill='%236b7280'%3ECannot load image%3C/text%3E%3C/svg%3E";
                  }}
                  style={{
                    width: "100%",
                    height: useCompactPreview ? "100%" : "auto",
                    maxHeight: useCompactPreview ? undefined : 180,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: useCompactPreview ? 4 : 6,
                    color: "var(--p-color-text-secondary)",
                    padding: useCompactPreview ? 8 : 16,
                    pointerEvents: "none",
                  }}
                >
                  <svg
                    width={useCompactPreview ? "20" : "28"}
                    height={useCompactPreview ? "20" : "28"}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>

                  <div
                    style={{
                      fontSize: useCompactPreview ? 10 : 12,
                      fontWeight: 600,
                      color: "var(--p-color-text)",
                    }}
                  >
                    {uploadStatus === "uploading" ? "Uploading…" : (useCompactPreview ? "Upload" : "Click to upload")}
                  </div>
                  {!useCompactPreview && (
                    <div style={{ fontSize: 11, color: "var(--p-color-text-secondary)" }}>
                      PNG · JPG · WEBP
                    </div>
                  )}
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploadStatus === "uploading"}
                style={{ display: "none" }}
              />
            </label>
          </div>

          {uploadStatus === "uploading" && (
            <div style={{ fontSize: 11, color: "var(--p-color-text-secondary)" }}>
              Uploading to Shopify Files…
            </div>
          )}
          {uploadStatus === "error" && uploadError && (
            <div style={{ fontSize: 11, color: "var(--p-color-text-critical, #d72c0d)" }}>
              {uploadError}
            </div>
          )}
          {isDataImage && uploadStatus === "idle" && (
            <div
              style={{
                fontSize: 11,
                color: "var(--p-color-text-critical, #d72c0d)",
                lineHeight: 1.5,
              }}
            >
              This image is inlined as base64 and is the main cause of large page sizes. Click <strong>Replace</strong> to re-upload to Shopify Files.
            </div>
          )}

          {/* ── Replace / Remove row ─────────────────────────── */}

          {value && (
            <div style={{ display: "flex", gap: 8 }}>
              {/* Replace */}

              <label
                style={{ ...btnBase, flex: 1 }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "var(--p-color-bg-surface-hover)";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "var(--p-color-border)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "var(--p-color-bg-surface)";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "var(--p-color-border-subdued)";
                }}
              >
                {/* rotate-cw icon */}
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                {uploadStatus === "uploading" ? "Uploading…" : "Replace"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploadStatus === "uploading"}
                  style={{ display: "none" }}
                />
              </label>

              {/* Remove */}

              <button
                onClick={() => onChange("")}
                style={{
                  ...btnBase,
                  flex: 1,
                  color: "var(--p-color-text-critical, #d72c0d)",
                  borderColor: "var(--p-color-border-critical-subdued, #fadcdc)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--p-color-bg-surface-critical, #fff4f4)";
                  e.currentTarget.style.borderColor =
                    "var(--p-color-border-critical, #d72c0d)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--p-color-bg-surface)";
                  e.currentTarget.style.borderColor =
                    "var(--p-color-border-critical-subdued, #fadcdc)";
                }}
              >
                {/* x icon */}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Remove
              </button>
            </div>
          )}
        </div>
      </FieldLabel>
    );
  },
};

// Standalone React component that wraps imageUploadField.render so it can be
// used as <ImageField label="..." value={...} onChange={...} /> inside other
// custom field renders (e.g. the Icon block's iconImage field).
function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return imageUploadField.render({ value, onChange, field: { label } } as any);
}

const videoUploadField = {
  type: "custom" as const,

  label: "Video",

  render: ({
    value,

    onChange,

    field,
  }: {
    value: string;

    onChange: (val: string) => void;

    field: any;
  }) => {
    const [uploadStatus, setUploadStatus] = useState<
      "idle" | "uploading" | "processing" | "error"
    >("idle");
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (!file) return;

      // Reset so picking the same file twice still fires onChange.
      e.target.value = "";

      // Shopify Files accepts videos up to ~5 GB but transcode time gets slow
      // past 250 MB. Cap to keep the UX reasonable.
      const maxSizeMB = 250;
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(
          `Video file too large. Maximum ${maxSizeMB}MB allowed for uploads.`,
        );
        return;
      }

      setUploadStatus("uploading");
      setUploadError(null);

      try {
        const form = new FormData();
        form.append("file", file);
        // Shopify transcoding for videos can take 30-90s — give the request room.
        setUploadStatus("processing");

        const res = await fetch("/api/upload-asset", {
          method: "POST",
          body: form,
        });
        const result = (await res.json()) as
          | { ok: true; url: string }
          | { ok: false; error: string };
        if (!result.ok) throw new Error(result.error || "Upload failed");

        onChange(result.url);
        setUploadStatus("idle");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setUploadError(msg);
        setUploadStatus("error");
      }
    };

    return (
      <FieldLabel label={field.label || "Video"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                padding: "8px 12px",
                borderRadius: "var(--p-border-radius-200, 8px)",
                cursor: "pointer",
                border: "1px solid var(--p-color-border-subdued)",
                backgroundColor: "var(--p-color-bg-surface-secondary)",
                color: "var(--p-color-text)",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--p-color-bg-surface-hover)";
                e.currentTarget.style.borderColor = "var(--p-color-border)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--p-color-bg-surface-secondary)";
                e.currentTarget.style.borderColor =
                  "var(--p-color-border-subdued)";
              }}
            >
              {uploadStatus === "uploading" || uploadStatus === "processing"
                ? uploadStatus === "uploading"
                  ? "Uploading…"
                  : "Processing on Shopify…"
                : value
                  ? "Replace Video"
                  : "Upload Video"}

              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
                style={{ display: "none" }}
              />
            </label>

            {value && uploadStatus === "idle" && (
              <button
                type="button"
                onClick={() => onChange("")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "8px 12px",
                  borderRadius: "var(--p-border-radius-200, 8px)",
                  cursor: "pointer",
                  border: "1px solid var(--p-color-border-critical-subdued, #fadcdc)",
                  backgroundColor: "var(--p-color-bg-surface-critical, #fff4f4)",
                  color: "var(--p-color-text-critical, #d72c0d)",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--p-color-bg-surface-critical-hover, #fde8e8)";
                  e.currentTarget.style.borderColor =
                    "var(--p-color-border-critical, #d72c0d)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--p-color-bg-surface-critical, #fff4f4)";
                  e.currentTarget.style.borderColor =
                    "var(--p-color-border-critical-subdued, #fadcdc)";
                }}
              >
                Remove
              </button>
            )}
          </div>

          {uploadStatus === "processing" && (
            <div style={{ fontSize: 11, color: "var(--p-color-text-secondary)", lineHeight: 1.5 }}>
              Shopify is transcoding your video. This can take up to a minute — please don&apos;t close the editor.
            </div>
          )}
          {uploadStatus === "error" && uploadError && (
            <div style={{ fontSize: 11, color: "var(--p-color-text-critical, #d72c0d)", lineHeight: 1.5 }}>
              {uploadError}
            </div>
          )}

          {value && uploadStatus === "idle" && (
            <div
              style={{
                fontSize: 11,
                color: "var(--p-color-text-success, #0f6132)",
                border: "1px solid var(--p-color-border-success-subdued, #b3e3c1)",
                borderRadius: "var(--p-border-radius-100, 4px)",
                padding: "8px 10px",
                backgroundColor: "var(--p-color-bg-surface-success, #e7f5ec)",
              }}
            >
              ✓ Video uploaded successfully
            </div>
          )}
        </div>
      </FieldLabel>
    );
  },
};

const headerData = {
  root: {
    props: { title: "" },
  },

  content: [
    {
      type: "GlobalHeader",

      props: {
        id: "global-header-default",

        height: "64px",

        backgroundColor: "#0158ad",

        textColor: "#FFFFFF",

        siteTitle: "My Page Builder",

        showShadow: true,

        showNavigation: true,

        navigationLinks: [
          { id: "1", label: "Home", url: "/", isActive: false },

          { id: "2", label: "Pages", url: "/admin/pages", isActive: false },

          { id: "3", label: "Admin", url: "/admin", isActive: false },
        ],
      },
    },
  ],

  zones: {},
};

const footerData = {
  root: {
    props: { title: "" },
  },

  content: [
    {
      type: "GlobalFooter",

      props: {
        id: "global-footer-default",

        height: "300px",

        backgroundColor: "#1F2937",

        textColor: "#F3F4F6",

        companyName: "My Page Builder",

        companyDescription: "Build beautiful pages without coding",

        showSocialLinks: true,

        socialLinks: {
          facebook: "https://facebook.com",

          twitter: "https://twitter.com",

          instagram: "https://instagram.com",

          linkedin: "https://linkedin.com",

          github: "https://github.com",
        },

        quickLinks: [
          { id: "1", label: "Home", url: "/", isActive: false },

          { id: "2", label: "Admin", url: "/admin", isActive: false },

          { id: "3", label: "Pages", url: "/admin/pages", isActive: false },
        ],

        copyrightText: "© 2026 My Page Builder. All rights reserved.",
      },
    },
  ],

  zones: {},
};

const commonComponents: any = {
  GlobalBlock: {
    fields: {
      globalBlockId: {
        type: "custom",

        label: "Block ID (do not edit)",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Block ID"
            value={value}
            onChange={onChange}
            placeholder="Block ID..."
          />
        ),
      },

      _name: {
        type: "custom",

        label: "Block Name (do not edit)",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Block Name"
            value={value}
            onChange={onChange}
            placeholder="Block Name..."
          />
        ),
      },
    },

    defaultProps: {
      globalBlockId: "",

      _name: "Global Block",
    },

    render: ({ globalBlockId, _name }: any) => (
      <div
        style={{
          border: "2px dashed #0158ad",

          borderRadius: 8,

          padding: "20px 16px",

          background: "#eff6ff",

          display: "flex",

          flexDirection: "column",

          alignItems: "center",

          gap: 6,

          userSelect: "none",

          pointerEvents: "none",
        }}
      >
        <span style={{ fontSize: 24 }}>🌐</span>

        <span style={{ fontWeight: 600, fontSize: 14, color: "#0158ad" }}>
          {_name || "Global Block"}
        </span>

        <span style={{ fontSize: 11, color: "#5b9bd5" }}>
          ID: {globalBlockId}
        </span>

        <span style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
          Edit from the Global Blocks panel → changes reflect on all pages
        </span>
      </div>
    ),
  },

  GlobalHeader: {
    label: "Header",
    fields: {
      height: {
        type: "custom",

        label: "Height (e.g., 64px)",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Height"
            value={value}
            onChange={onChange}
            placeholder="e.g., 64px"
          />
        ),
      },

      backgroundColor: {
        type: "custom",

        label: "Background Color",

        visible: ({ props }) =>
          !(
            (props?.image?.url && String(props.image.url).trim()) ||
            (props?.videoSettings?.url && String(props.videoSettings.url).trim())
          ),

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Background Color"
            value={value}
            onChange={onChange}
          />
        ),
      },

      backgroundImage: {
        type: "custom",

        label: "Background Image (URL)",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Background Image URL"
            value={value}
            onChange={onChange}
            placeholder="https://... or linear-gradient(...)"
          />
        ),
      },

      textPosition: {
        type: "custom",

        label: "Text Position",

        render: ({ value, onChange }) => (
          <AlignField
            value={value}
            onChange={onChange}
            label="Text Position"
            options={[
              { value: "justify-start",  icon: <AlignLeft size={15} />,   title: "Left" },

              { value: "justify-center", icon: <AlignCenter size={15} />, title: "Center" },

              { value: "justify-end",    icon: <AlignRight size={15} />,  title: "Right" },
            ]}
          />
        ),
      },

      textColor: {
        type: "custom",

        label: "Text Color",

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Text Color"
            value={value}
            onChange={onChange}
          />
        ),
      },

      siteTitle: {
        type: "custom",

        label: "Site Title",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Site Title"
            value={value}
            onChange={onChange}
            placeholder="My Page Builder"
          />
        ),
      },


      showNavigation: {
        type: "custom",

        label: "Show Navigation",

        render: ({ value, onChange }) => (
          <ToggleField
            value={!!value}
            onChange={onChange}
            label="Show Navigation"
          />
        ),
      },

      navigationLinks: {
        type: "array",

        label: "Navigation Links",

        getItemSummary: (item) => item.label || "Link",

        arrayFields: {
          label: {
            type: "custom",

            label: "Label",

            render: ({ value, onChange }) => (
              <StackedTextField
                label="Label"
                value={value}
                onChange={onChange}
                placeholder="e.g., Home"
              />
            ),
          },

          url: {
            type: "custom",

            label: "URL",

            render: ({ value, onChange }) => (
              <StackedTextField
                label="URL"
                value={value}
                onChange={onChange}
                placeholder="e.g., /home"
              />
            ),
          },
        },
      },

      logo: {
        type: "custom",

        label: "Logo Image URL",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Logo Image URL"
            value={value}
            onChange={onChange}
            placeholder="https://example.com/logo.png"
          />
        ),
      },

      ctaLabel: {
        type: "custom",

        label: "CTA Button Label",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="CTA Button Label"
            value={value}
            onChange={onChange}
            placeholder="e.g., Get Started"
          />
        ),
      },

      ctaLink: {
        type: "custom",

        label: "CTA Button URL",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="CTA Button URL"
            value={value}
            onChange={onChange}
            placeholder="/signup"
          />
        ),
      },

      ctaStyle: {
        type: "custom",

        label: "CTA Button Style",

        render: ({ value, onChange }) => (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#000000" }}>
              CTA Button Style
            </label>

            <select
              value={value || "primary"}
              onChange={(e) => onChange(e.target.value)}
              style={{
                border: "1px solid var(--p-color-border)",
                borderRadius: "var(--p-border-radius-100, 4px)",
                padding: "5px 8px",
                fontSize: 12,
                color: "var(--p-color-text)",
                background: "var(--p-color-bg-surface)",
              }}
            >
              <option value="primary">Solid</option>

              <option value="ghost">Ghost / Outline</option>

              <option value="none">None (hide)</option>
            </select>
          </div>
        ),
      },

      layoutStyle: {
        type: "custom",

        label: "Header Layout",

        render: ({ value, onChange }) => (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#000000" }}>
              Header Layout
            </label>

            <select
              value={value || "default"}
              onChange={(e) => onChange(e.target.value)}
              style={{
                border: "1px solid var(--p-color-border)",
                borderRadius: "var(--p-border-radius-100, 4px)",
                padding: "5px 8px",
                fontSize: 12,
                color: "var(--p-color-text)",
                background: "var(--p-color-bg-surface)",
              }}
            >
              <option value="default">Default (Logo Left, Nav Right)</option>

              <option value="centered">Centered (Logo + Nav Centred)</option>

              <option value="split">Split (Logo | Nav Centre | CTA)</option>

              <option value="minimal">Minimal (Logo Only)</option>
            </select>
          </div>
        ),
      },
    },

    defaultProps: {
      height: "64px",

      backgroundColor: "#0158ad",

      textColor: "#FFFFFF",

      siteTitle: "My Page Builder",

      showShadow: true,

      showNavigation: true,

      logo: "",

      ctaLabel: "",

      ctaLink: "#",

      ctaStyle: "primary",

      layoutStyle: "default",

      navigationLinks: [
        { id: "1", label: "Home", url: "/", isActive: false },

        { id: "2", label: "Pages", url: "/admin/pages", isActive: false },

        { id: "3", label: "Admin", url: "/admin", isActive: false },
      ],
    },

    render: ({
      height,

      backgroundColor,

      backgroundImage,

      textColor,

      siteTitle,

      showShadow,

      showNavigation,

      navigationLinks,

      logo,

      ctaLabel,

      ctaLink,

      ctaStyle,

      layoutStyle,
    }: any) => {
      const hasCta = ctaLabel && ctaStyle !== "none";

      const isCenter = layoutStyle === "centered";

      const isSplit = layoutStyle === "split";

      const isMinimal = layoutStyle === "minimal";

      const headerStyle: any = {
        backgroundColor,

        color: textColor,

        height,

        fontFamily: "var(--font-family)",

        boxShadow: showShadow ? "0 2px 8px rgba(0,0,0,0.12)" : "none",

        transition:
          "background-color var(--animation-speed,0.3s) ease, color var(--animation-speed,0.3s) ease",

        ...(backgroundImage
          ? {
              backgroundImage,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {}),
      };

      const brandEl = (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
            textDecoration: "none",
          }}
        >
          {logo ? (
            <img
              src={logo}
              alt={siteTitle || "Logo"}
              style={{ height: 36, maxWidth: 160, objectFit: "contain" }}
            />
          ) : (
            <span
              style={{
                color: textColor,
                fontFamily: "var(--heading-font, var(--font-family))",
                fontSize: "var(--h3-size, 1.25rem)",
                fontWeight: "var(--heading-weight, 700)",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
              }}
            >
              {siteTitle}
            </span>
          )}
        </div>
      );

      const navItems =
        showNavigation && !isMinimal
          ? navigationLinks.map((link: any) => (
              <a
                key={link.id}
                href={link.url}
                style={{
                  color: textColor,
                  fontFamily: "var(--font-family)",
                  fontSize: "var(--base-font-size, 0.875rem)",
                  opacity: 0.9,
                  padding: "6px 12px",
                  borderRadius: "var(--border-radius, 6px)",
                  textDecoration: "none",
                  transition: "opacity var(--animation-speed,0.3s) ease",
                  whiteSpace: "nowrap",
                }}
              >
                {link.label}
              </a>
            ))
          : null;

      const ctaBtnEl = hasCta ? (
        <a
          href={ctaLink || "#"}
          style={{
            padding: "8px 20px",
            borderRadius: "var(--border-radius, 6px)",
            fontWeight: 600,
            fontSize: "var(--base-font-size, 0.875rem)",
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
            transition: "all var(--animation-speed,0.3s) ease",
            ...(ctaStyle === "ghost"
              ? {
                  background: "transparent",
                  color: textColor,
                  border: `2px solid ${textColor}`,
                }
              : {
                  background: textColor,
                  color: backgroundColor,
                  border: `2px solid ${textColor}`,
                }),
          }}
        >
          {ctaLabel}
        </a>
      ) : null;

      return (
        <header style={headerStyle} className="w-full">
          {isCenter ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 8,
                padding: "0 24px",
              }}
            >
              {brandEl}

              {(showNavigation || hasCta) && (
                <nav
                  className="pb-header-nav"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {navItems}

                  {ctaBtnEl}
                </nav>
              )}
            </div>
          ) : isSplit ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: "100%",
                padding: "0 24px",
                maxWidth: 1280,
                margin: "0 auto",
                gap: 16,
              }}
            >
              {brandEl}

              <nav
                className="pb-header-nav"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  flex: 1,
                }}
              >
                {navItems}
              </nav>

              {ctaBtnEl}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: "100%",
                padding: "0 24px",
                maxWidth: 1280,
                margin: "0 auto",
              }}
            >
              {brandEl}

              {!isMinimal && (
                <nav
                  className="pb-header-nav"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    flexWrap: "wrap",
                  }}
                >
                  {navItems}

                  {ctaBtnEl}
                </nav>
              )}
            </div>
          )}
        </header>
      );
    },
  },

  GlobalFooter: {
    label: "Footer",
    fields: {
      height: {
        type: "custom",

        label: "Height (e.g., 300px)",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Height"
            value={value}
            onChange={onChange}
            placeholder="e.g., 300px"
          />
        ),
      },

      backgroundColor: {
        type: "custom",

        label: "Background Color",

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Background Color"
            value={value}
            onChange={onChange}
          />
        ),
      },

      textColor: {
        type: "custom",

        label: "Text Color",

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Text Color"
            value={value}
            onChange={onChange}
          />
        ),
      },

      companyName: {
        type: "custom",

        label: "Company Name",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Company Name"
            value={value}
            onChange={onChange}
            placeholder="My Page Builder"
          />
        ),
      },

      companyDescription: {
        type: "custom",

        label: "Company Description",

        render: ({ value, onChange }) => (
          <StackedTextareaField
            label="Company Description"
            value={value}
            onChange={onChange}
            placeholder="Build beautiful pages without coding"
          />
        ),
      },

      logo: {
        type: "custom",

        label: "Logo Image URL",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Logo Image URL"
            value={value}
            onChange={onChange}
            placeholder="https://example.com/logo.png"
          />
        ),
      },

      showSocialLinks: {
        type: "custom",

        label: "Show Social Links",

        render: ({ value, onChange }) => (
          <ToggleField
            value={!!value}
            onChange={onChange}
            label="Show Social Links"
          />
        ),
      },

      socialLinks: {
        type: "object",

        label: "Social Links",

        objectFields: {
          facebook: {
            type: "custom",
            label: "Facebook URL",
            render: ({ value, onChange }) => (
              <StackedTextField
                label="Facebook URL"
                value={value}
                onChange={onChange}
                placeholder="https://facebook.com"
              />
            ),
          },

          twitter: {
            type: "custom",
            label: "Twitter / X URL",
            render: ({ value, onChange }) => (
              <StackedTextField
                label="Twitter/X URL"
                value={value}
                onChange={onChange}
                placeholder="https://twitter.com"
              />
            ),
          },

          instagram: {
            type: "custom",
            label: "Instagram URL",
            render: ({ value, onChange }) => (
              <StackedTextField
                label="Instagram URL"
                value={value}
                onChange={onChange}
                placeholder="https://instagram.com"
              />
            ),
          },

          linkedin: {
            type: "custom",
            label: "LinkedIn URL",
            render: ({ value, onChange }) => (
              <StackedTextField
                label="LinkedIn URL"
                value={value}
                onChange={onChange}
                placeholder="https://linkedin.com"
              />
            ),
          },

          github: {
            type: "custom",
            label: "GitHub URL",
            render: ({ value, onChange }) => (
              <StackedTextField
                label="GitHub URL"
                value={value}
                onChange={onChange}
                placeholder="https://github.com"
              />
            ),
          },

          youtube: {
            type: "custom",
            label: "YouTube URL",
            render: ({ value, onChange }) => (
              <StackedTextField
                label="YouTube URL"
                value={value}
                onChange={onChange}
                placeholder="https://youtube.com"
              />
            ),
          },

          tiktok: {
            type: "custom",
            label: "TikTok URL",
            render: ({ value, onChange }) => (
              <StackedTextField
                label="TikTok URL"
                value={value}
                onChange={onChange}
                placeholder="https://tiktok.com"
              />
            ),
          },
        },
      },

      quickLinks: {
        type: "array",

        label: "Quick Links",

        getItemSummary: (item) => item.label || "Link",

        arrayFields: {
          label: {
            type: "custom",
            label: "Label",
            render: ({ value, onChange }) => (
              <StackedTextField
                label="Label"
                value={value}
                onChange={onChange}
                placeholder="e.g., Home"
              />
            ),
          },

          url: {
            type: "custom",
            label: "URL",
            render: ({ value, onChange }) => (
              <StackedTextField
                label="URL"
                value={value}
                onChange={onChange}
                placeholder="e.g., /home"
              />
            ),
          },
        },
      },

      copyrightText: {
        type: "custom",

        label: "Copyright Text",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Copyright Text"
            value={value}
            onChange={onChange}
            placeholder="© 2026 My Page Builder. All rights reserved."
          />
        ),
      },

      showNewsletter: {
        type: "custom",

        label: "Show Newsletter Signup",

        render: ({ value, onChange }) => (
          <ToggleField
            value={!!value}
            onChange={onChange}
            label="Show Newsletter Signup"
          />
        ),
      },

      newsletterTitle: {
        type: "custom",

        label: "Newsletter Title",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Newsletter Title"
            value={value}
            onChange={onChange}
            placeholder="Stay in the loop"
          />
        ),
      },

      newsletterPlaceholder: {
        type: "custom",

        label: "Email Input Placeholder",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Email Placeholder"
            value={value}
            onChange={onChange}
            placeholder="Your email address"
          />
        ),
      },
    },

    defaultProps: {
      height: "300px",

      backgroundColor: "#1F2937",

      textColor: "#F3F4F6",

      companyName: "My Page Builder",

      companyDescription: "Build beautiful pages without coding",

      logo: "",

      showSocialLinks: true,

      socialLinks: {
        facebook: "https://facebook.com",

        twitter: "https://twitter.com",

        instagram: "https://instagram.com",

        linkedin: "https://linkedin.com",

        github: "https://github.com",

        youtube: "",

        tiktok: "",
      },

      quickLinks: [
        { id: "1", label: "Home", url: "/", isActive: false },

        { id: "2", label: "Admin", url: "/admin", isActive: false },

        { id: "3", label: "Pages", url: "/admin/pages", isActive: false },
      ],

      copyrightText: "© 2026 My Page Builder. All rights reserved.",

      showNewsletter: false,

      newsletterTitle: "Stay in the loop",

      newsletterPlaceholder: "Your email address",
    },

    render: ({
      height,

      backgroundColor,

      textColor,

      companyName,

      companyDescription,

      logo,

      showSocialLinks,

      socialLinks,

      quickLinks,

      copyrightText,

      showNewsletter,

      newsletterTitle,

      newsletterPlaceholder,
    }: any) => {
      const socialEntries = Object.entries(socialLinks || {}).filter(
        ([, url]) => url,
      );

      // ── Social icon SVGs (keyed by platform name) ───────────────────────────

      const SocialIcon = ({ platform }: { platform: string }) => {
        const p = platform.toLowerCase();

        if (p === "facebook")
          return (
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          );

        if (p === "twitter")
          return (
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          );

        if (p === "instagram")
          return (
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          );

        if (p === "linkedin")
          return (
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          );

        if (p === "github")
          return (
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          );

        if (p === "youtube")
          return (
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
            </svg>
          );

        if (p === "tiktok")
          return (
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
            </svg>
          );

        return (
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            {platform[0].toUpperCase()}
          </span>
        );
      };

      return (
        <footer
          style={{
            backgroundColor,
            color: textColor,
            minHeight: height,
            fontFamily: "var(--font-family)",
            transition:
              "background-color var(--animation-speed,0.3s) ease, color var(--animation-speed,0.3s) ease",
          }}
          className="w-full mt-auto"
        >
          <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* ── Brand column ─────────────────────────────────────────── */}

              <div>
                {logo && (
                  <img
                    src={logo}
                    alt={companyName}
                    style={{
                      height: 40,
                      marginBottom: 16,
                      objectFit: "contain",
                      maxWidth: 180,
                    }}
                  />
                )}

                <h3
                  style={{
                    fontFamily: "var(--heading-font, var(--font-family))",
                    fontSize: "var(--h3-size, 1.125rem)",
                    fontWeight: "var(--heading-weight, 600)",
                    marginBottom: "0.75rem",
                    color: textColor,
                  }}
                >
                  {companyName}
                </h3>

                <p
                  style={{
                    fontSize: "var(--base-font-size, 0.875rem)",
                    lineHeight: "var(--line-height, 1.6)",
                    opacity: 0.8,
                    marginBottom:
                      showSocialLinks && socialEntries.length > 0
                        ? "1.25rem"
                        : 0,
                  }}
                >
                  {companyDescription}
                </p>

                {showSocialLinks && socialEntries.length > 0 && (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {socialEntries.map(([key, url]) => (
                      <a
                        key={key}
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={key}
                        style={{
                          color: textColor,
                          opacity: 0.8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          border: `1.5px solid ${textColor}40`,
                          textDecoration: "none",
                          transition: "opacity 0.2s, border-color 0.2s",
                          flexShrink: 0,
                        }}
                      >
                        <SocialIcon platform={key} />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Quick Links ───────────────────────────────────────────── */}

              <div>
                <h4
                  style={{
                    fontFamily: "var(--heading-font, var(--font-family))",
                    fontSize: "var(--h4-size, 1rem)",
                    fontWeight: "var(--heading-weight, 600)",
                    marginBottom: "1rem",
                    color: textColor,
                  }}
                >
                  Quick Links
                </h4>

                <ul
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    padding: 0,
                    margin: 0,
                    listStyle: "none",
                  }}
                >
                  {quickLinks.map((link: any) => (
                    <li key={link.id}>
                      <a
                        href={link.url}
                        style={{
                          color: textColor,
                          fontSize: "var(--base-font-size, 0.875rem)",
                          opacity: 0.8,
                          textDecoration: "none",
                          transition:
                            "opacity var(--animation-speed,0.3s) ease",
                          display: "inline-block",
                        }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── Newsletter / Connect ──────────────────────────────────── */}

              <div>
                {showNewsletter ? (
                  <>
                    <h4
                      style={{
                        fontFamily: "var(--heading-font, var(--font-family))",
                        fontSize: "var(--h4-size, 1rem)",
                        fontWeight: "var(--heading-weight, 600)",
                        marginBottom: "0.75rem",
                        color: textColor,
                      }}
                    >
                      {newsletterTitle || "Stay in the loop"}
                    </h4>

                    <p
                      style={{
                        fontSize: "var(--base-font-size, 0.875rem)",
                        opacity: 0.75,
                        marginBottom: "1rem",
                        lineHeight: 1.5,
                      }}
                    >
                      Get the latest updates delivered to your inbox.
                    </p>

                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="email"
                        placeholder={
                          newsletterPlaceholder || "Your email address"
                        }
                        style={{
                          flex: 1,
                          minWidth: 0,
                          padding: "9px 12px",
                          borderRadius: "var(--border-radius, 6px)",
                          border: `1.5px solid ${textColor}40`,
                          background: "transparent",
                          color: textColor,
                          fontSize: "0.875rem",
                          outline: "none",
                        }}
                      />

                      <button
                        type="button"
                        style={{
                          padding: "9px 16px",
                          background: textColor,
                          color: backgroundColor,
                          borderRadius: "var(--border-radius, 6px)",
                          border: "none",
                          fontWeight: 600,
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          flexShrink: 0,
                        }}
                      >
                        →
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h4
                      style={{
                        fontFamily: "var(--heading-font, var(--font-family))",
                        fontSize: "var(--h4-size, 1rem)",
                        fontWeight: "var(--heading-weight, 600)",
                        marginBottom: "1rem",
                        color: textColor,
                      }}
                    >
                      Connect
                    </h4>

                    {showSocialLinks && socialEntries.length > 0 ? (
                      <p
                        style={{
                          fontSize: "var(--base-font-size, 0.875rem)",
                          opacity: 0.75,
                          lineHeight: 1.5,
                        }}
                      >
                        Follow us on social media for the latest updates and
                        behind-the-scenes content.
                      </p>
                    ) : (
                      <p
                        style={{
                          fontSize: "var(--base-font-size, 0.875rem)",
                          opacity: 0.65,
                        }}
                      >
                        No social links configured.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* ── Divider + copyright ──────────────────────────────────────── */}

            <div
              style={{
                height: 1,
                background: `${textColor}25`,
                margin: "32px 0 20px",
              }}
            />

            <div
              style={{
                textAlign: "center",
                fontSize: "var(--base-font-size, 0.875rem)",
                opacity: 0.6,
              }}
            >
              <p>{copyrightText}</p>
            </div>
          </div>
        </footer>
      );
    },
  },

  Hero: {
    label: "Hero Banner",
    fields: {
      contentSection: {
        type: "custom",
        label: "Content Section",
        render: () => (
          <SettingsSectionHeader
            title="Content"
            description="Main text, trust indicators, features, and call-to-action buttons."
            icon={<Type size={15} />}
          />
        ),
      },

      title: {
        type: "custom",

        label: "Title",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Title"
            value={value}
            onChange={onChange}
            icon={null}
            placeholder="Enter title..."
          />
        ),
      },

      subtitle: {
        type: "custom",

        label: "Subtitle",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Subtitle"
            value={value}
            onChange={onChange}
            icon={null}
            placeholder="Enter subtitle..."
          />
        ),
      },

      badge: {
        type: "custom",

        label: "Badge",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Badge"
            value={value}
            onChange={onChange}
            icon={null}
            placeholder="e.g., New Feature"
          />
        ),
      },

      description: {
        type: "custom",
        label: "Description",
        render: ({ value, onChange }) => (
          <StackedTextareaField
            label="Description"
            value={value ?? ""}
            onChange={onChange}
            icon={null}
            placeholder="Enter description..."
            rows={2}
          />
        ),
      },

      rating: {
        type: "custom",

        label: "Rating",

        render: ({ value, onChange }) => (
          <StackedNumberField
            label="Rating"
            value={value}
            onChange={onChange}
            icon={null}
            min={0}
            max={5}
            step={0.1}
            placeholder="e.g., 4.3"
          />
        ),
      },

      reviewCount: {
        type: "custom",

        label: "Review Count",

        render: ({ value, onChange }) => (
          <StackedNumberField
            label="Review Count"
            value={value}
            onChange={onChange}
            icon={null}
            placeholder="e.g., 100"
          />
        ),
      },

      features: {
        type: "array",

        label: "Features",

        getItemSummary: (item) => item.text || "Feature",

        arrayFields: {
          text: {
            type: "custom",

            label: "Feature Text",

            render: ({ value, onChange }) => (
              <StackedTextField
                label="Feature Text"
                value={value}
                onChange={onChange}
                icon={null}
                placeholder="e.g., Free shipping"
              />
            ),
          },
        },
      },

      buttons: {
        type: "array",

        label: "Buttons",

        getItemSummary: (item) => item.label || "Button",

        arrayFields: {
          label: {
            type: "custom",

            label: "Button Text",

            render: ({ value, onChange }) => (
              <StackedTextField
                label="Button Text"
                value={value}
                onChange={onChange}
                icon={null}
                placeholder="e.g., Get Started"
              />
            ),
          },

          link: {
            type: "custom",

            label: "URL",

            render: ({ value, onChange }) => (
              <StackedTextField
                label="URL"
                value={value}
                onChange={onChange}
                icon={null}
                placeholder="e.g., /signup"
              />
            ),
          },

          variant: {
            type: "custom",
            label: "Button Style",
            render: ({ value, onChange }) => (
              <StackedField label="Button Style">
                <select
                  value={value ?? "primary"}
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
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="outline">Outline</option>
                </select>
              </StackedField>
            ),
          },
        },
      },

      layoutSection: {
        type: "custom",
        label: "Layout Section",
        render: () => (
          <SettingsSectionHeader
            title="Layout"
            description="Control spacing, alignment, content width, and overall hero sizing."
            icon={<LayoutGrid size={15} />}
          />
        ),
      },

      padding: {
        type: "custom",

        label: "Padding (px)",

        render: ({ value, onChange }) => (
          <StackedField
            label="Padding (px)"
          >
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              style={{
                width: "100%",

                padding: "8px 12px",

                fontSize: 14,

                border: "1px solid #d1d5db",

                borderRadius: 6,

                outline: "none",
              }}
            />
          </StackedField>
        ),
      },

      align: {
        type: "custom",

        label: "Text Align",

        render: ({ value, onChange }) => (
          <AlignField
            value={value}
            onChange={onChange}
            label="Text Align"
            labelIcon={<AlignJustify size={14} />}
          />
        ),
      },

      overlayOpacity: {
        type: "custom",

        label: "Overlay Opacity (0–1)",

        // Only relevant when there's a background image or video behind the text
        visible: ({ props }) =>
          (props.backgroundType ?? "media") === "media" &&
          (props.mediaType === "video" || (props.image as any)?.mode === "bg"),

        render: ({ value, onChange }) => (
          <StackedField
            label="Overlay Opacity (0–1)"
          >
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              style={{
                width: "100%",

                padding: "8px 12px",

                fontSize: 14,

                border: "1px solid #d1d5db",

                borderRadius: 6,

                outline: "none",
              }}
            />
          </StackedField>
        ),
      },

      verticalAlign: {
        type: "custom",

        label: "Vertical Align",

        render: ({ value, onChange }) => (
          <StackedField label="Vertical Align">
            <select
              value={value ?? "items-center"}
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
              <option value="items-start">Top</option>
              <option value="items-center">Center</option>
              <option value="items-end">Bottom</option>
            </select>
          </StackedField>
        ),
      },

      textPosition: {
        type: "custom",

        label: "Text Position (for BG image)",

        // Only relevant when image is in background mode or video is the background
        visible: ({ props }) =>
          (props.backgroundType ?? "media") === "media" &&
          (props.mediaType === "video" || (props.image as any)?.mode === "bg"),

        render: ({ value, onChange }) => (
          <StackedField label="Text Position (BG)">
            <select
              value={value ?? "justify-center"}
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
              <option value="justify-start">Top</option>
              <option value="justify-center">Center</option>
              <option value="justify-end">Bottom</option>
            </select>
          </StackedField>
        ),
      },

      contentWidth: {
        type: "custom",

        label: "Content Width",

        render: ({ value, onChange }) => (
          <StackedField label="Content Width">
            <select
              value={value ?? "max-w-xl"}
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
              <option value="max-w-md">Small</option>
              <option value="max-w-xl">Medium</option>
              <option value="max-w-full">Full</option>
            </select>
          </StackedField>
        ),
      },

      textColor: {
        type: "custom",

        label: "Text Color",

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Text Color"
            value={value}
            onChange={onChange}
          />
        ),
      },

      appearanceSection: {
        type: "custom",
        label: "Appearance Section",
        render: () => (
          <SettingsSectionHeader
            title="Appearance"
            description="Adjust background, colors, overlay, gradients, and decorative patterns."
            icon={<Sparkles size={15} />}
          />
        ),
      },

      backgroundType: {
        type: "custom",
        label: "Background Type",
        render: ({ value, onChange }) => (
          <StackedField label="Background Type">
            <select
              value={value ?? "media"}
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
              <option value="media">Media (Image / Video)</option>
              <option value="color">Background Color</option>
              <option value="gradient">Gradient Color</option>
            </select>
          </StackedField>
        ),
      },

      mediaSection: {
        type: "custom",
        label: "Media Section",
        visible: ({ props }) => (props.backgroundType ?? "media") === "media",
        render: () => (
          <SettingsSectionHeader
            title="Media"
            description="Manage the hero image and optional background video together."
            icon={<ImageIcon size={15} />}
          />
        ),
      },

      mediaType: {
        type: "custom",
        label: "Media Type",
        visible: ({ props }) => (props.backgroundType ?? "media") === "media",
        render: ({ value, onChange }) => (
          <StackedField label="Media Type">
            <select
              value={value ?? "image"}
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
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </StackedField>
        ),
      },

      image: {
        type: "custom",
        label: "Image",
        visible: ({ props }) =>
          (props.backgroundType ?? "media") === "media" &&
          (props.mediaType ?? "image") === "image",
        render: ({ value, onChange }) => {
          const imgVal = value ?? {};
          const currentMode = imgVal.mode ?? "inline";
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <imageUploadField.render
                value={imgVal.url ?? ""}
                onChange={(url: string) => onChange({ ...imgVal, url })}
                field={{ label: "Image", previewLayout: "standard" }}
              />
              <AlignField
                value={currentMode}
                onChange={(mode: string) => onChange({ ...imgVal, mode })}
                label="Mode"
                labelIcon={<Layers size={14} />}
                options={[
                  { value: "inline", icon: <ImageIcon size={15} />, title: "Inline" },
                  { value: "bg",     icon: <Layers    size={15} />, title: "Background" },
                  { value: "custom", icon: <Settings2 size={15} />, title: "Custom" },
                ]}
              />
              {currentMode === "custom" && (
                <AlignField
                  value={imgVal.position ?? "left"}
                  onChange={(position: string) => onChange({ ...imgVal, position })}
                  label="Position"
                  options={[
                    { value: "left",  icon: <PanelLeft  size={15} />, title: "Left"  },
                    { value: "right", icon: <PanelRight size={15} />, title: "Right" },
                  ]}
                />
              )}
            </div>
          );
        },
      },

      videoSettings: {
        type: "custom",
        label: "Video Settings",
        visible: ({ props }) =>
          (props.backgroundType ?? "media") === "media" &&
          props.mediaType === "video",
        render: ({ value, onChange }) => {
          const vidVal = value ?? {};
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <videoUploadField.render
                value={vidVal.url ?? ""}
                onChange={(url: string) => onChange({ ...vidVal, url })}
                field={{ label: "Background Video" }}
              />
              {vidVal.url && (
                <>
                  <ToggleField
                    label="Autoplay"
                    value={vidVal.autoplay !== false}
                    onChange={(autoplay: boolean) => onChange({ ...vidVal, autoplay })}
                  />
                  <ToggleField
                    label="Loop Video"
                    value={vidVal.loop !== false}
                    onChange={(loop: boolean) => onChange({ ...vidVal, loop })}
                  />
                  <ToggleField
                    label="Mute Video"
                    value={vidVal.muted !== false}
                    onChange={(muted: boolean) => onChange({ ...vidVal, muted })}
                  />
                </>
              )}
            </div>
          );
        },
      },

      backgroundColor: {
        type: "custom",

        label: "Background Color",

        visible: ({ props }) => (props.backgroundType ?? "media") === "color",

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Background Color"
            value={value}
            onChange={onChange}
          />
        ),
      },

      gradientStartColor: {
        type: "custom",

        label: "Gradient Start Color",

        visible: ({ props }) => (props.backgroundType ?? "media") === "gradient",

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Gradient Start Color"
            value={value}
            onChange={onChange}
          />
        ),
      },

      gradientEndColor: {
        type: "custom",

        label: "Gradient End Color",

        visible: ({ props }) => (props.backgroundType ?? "media") === "gradient",

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Gradient End Color"
            value={value}
            onChange={onChange}
          />
        ),
      },

      gradientDirection: {
        type: "custom",

        label: "Gradient Angle",

        visible: ({ props }) => (props.backgroundType ?? "media") === "gradient",

        render: ({ value, onChange }) => (
          <AlignField
            value={value ?? "135deg"}
            onChange={onChange}
            label="Gradient Angle"
            layout="stacked"
            options={[
              { value: "0deg", icon: <ArrowUp size={15} />, title: "↑ Top" },
              { value: "45deg", icon: <ArrowUp size={15} />, title: "↗ Top Right" },
              { value: "90deg", icon: <ArrowRight size={15} />, title: "→ Right" },
              { value: "135deg", icon: <ArrowUp size={15} />, title: "↘ Bottom Right" },
              { value: "180deg", icon: <ArrowDown size={15} />, title: "↓ Bottom" },
            ]}
          />
        ),
      },

      patternType: {
        type: "custom",

        label: "Background Pattern",

        visible: ({ props }) =>
          (props.backgroundType ?? "media") === "color" ||
          (props.backgroundType ?? "media") === "gradient",

        render: ({ value, onChange }) => (
          <StackedField label="Pattern Type">
            <select
              value={value ?? "none"}
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
              <option value="none">None</option>
              <option value="dots">Dots</option>
              <option value="grid">Grid</option>
              <option value="waves">Waves</option>
              <option value="geometric">Geometric</option>
              <option value="diagonal">Diagonal Lines</option>
              <option value="crosshatch">Crosshatch</option>
              <option value="zigzag">Zigzag</option>
              <option value="checkerboard">Checkerboard</option>
              <option value="circles">Circles</option>
            </select>
          </StackedField>
        ),
      },

      patternColor: {
        type: "custom",

        label: "Pattern Color",

        visible: ({ props }) =>
          (props?.patternType ?? "none") !== "none" &&
          (
            (props.backgroundType ?? "media") === "color" ||
            (props.backgroundType ?? "media") === "gradient"
          ),

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Pattern Color"
            value={value ?? "rgba(0,0,0,0.1)"}
            onChange={onChange}
          />
        ),
      },

      fullscreen: {
        type: "custom",

        label: "Full Screen",

        render: ({ value, onChange }) => (
          <ToggleField
            label="Full Screen Hero"
            value={value}
            onChange={onChange}
          />
        ),
      },

      sliderSection: {
        type: "custom",
        label: "Slider Section",
        visible: ({ props }) => !!props?.sliderEnabled,
        render: () => (
          <SettingsSectionHeader
            title="Slider"
            description="Enable rotating slides and tune autoplay, timing, and navigation controls."
            icon={<Video size={15} />}
          />
        ),
      },

      // ── Slider Section ─────────────────────────────────────────────────────────

      sliderEnabled: {
        type: "custom",

        label: "Enable Hero Slider",

        render: ({ value, onChange }) => (
          <ToggleField
            label="Enable Hero Slider"
            value={!!value}
            onChange={onChange}
          />
        ),
      },

      slides: {
        type: "array",

        label: "Hero Slides (for Slider Mode)",

        visible: ({ props }) => !!props?.sliderEnabled,

        getItemSummary: (item) => item.title || item.subtitle || "Slide",

        arrayFields: {
          title: {
            type: "custom",
            label: "Title",
            render: ({ value, onChange }) => (
              <StackedTextField
                label="Title"
                value={value ?? ""}
                onChange={onChange}
                icon={null}
                placeholder="Slide title..."
              />
            ),
          },

          subtitle: {
            type: "custom",
            label: "Subtitle",
            render: ({ value, onChange }) => (
              <StackedTextField
                label="Subtitle"
                value={value ?? ""}
                onChange={onChange}
                icon={null}
                placeholder="Slide subtitle..."
              />
            ),
          },

          badge: {
            type: "custom",
            label: "Badge",
            render: ({ value, onChange }) => (
              <StackedTextField
                label="Badge"
                value={value ?? ""}
                onChange={onChange}
                icon={null}
                placeholder="e.g., New"
              />
            ),
          },

          description: { type: "richtext" },

          rating: {
            type: "custom",
            label: "Rating",
            render: ({ value, onChange }) => (
              <StackedNumberField
                label="Rating"
                value={value}
                onChange={onChange}
                icon={null}
                min={0}
                max={5}
                step={0.1}
                placeholder="e.g., 4.3"
              />
            ),
          },

          reviewCount: {
            type: "custom",
            label: "Review Count",
            render: ({ value, onChange }) => (
              <StackedNumberField
                label="Review Count"
                value={value}
                onChange={onChange}
                icon={null}
                placeholder="e.g., 100"
              />
            ),
          },

          features: {
            type: "array",
            label: "Features",
            getItemSummary: (item) => item.text || "Feature",
            arrayFields: {
              text: {
                type: "custom",
                label: "Feature Text",
                render: ({ value, onChange }) => (
                  <StackedTextField
                    label="Feature Text"
                    value={value ?? ""}
                    onChange={onChange}
                    icon={null}
                    placeholder="e.g., Free shipping"
                  />
                ),
              },
            },
          },

          buttons: {
            type: "array",
            label: "Buttons",
            getItemSummary: (item) => item.label || "Button",
            arrayFields: {
              label: {
                type: "custom",
                label: "Button Text",
                render: ({ value, onChange }) => (
                  <StackedTextField
                    label="Button Text"
                    value={value ?? ""}
                    onChange={onChange}
                    icon={null}
                    placeholder="e.g., Get Started"
                  />
                ),
              },
              link: {
                type: "custom",
                label: "URL",
                render: ({ value, onChange }) => (
                  <StackedTextField
                    label="URL"
                    value={value ?? ""}
                    onChange={onChange}
                    icon={null}
                    placeholder="e.g., /signup"
                  />
                ),
              },
              variant: {
                type: "select",
                label: "Variant",
                options: [
                  { label: "Primary", value: "primary" },
                  { label: "Secondary", value: "secondary" },
                  { label: "Outline", value: "outline" },
                ],
              },
            },
          },

          image: {
            type: "object",
            label: "Image",
            objectFields: {
              url: {
                type: "custom",
                label: "Image",
                render: ({ value, onChange }) => (
                  <imageUploadField.render
                    value={value}
                    onChange={onChange}
                    field={{ label: "Image", previewLayout: "standard" }}
                  />
                ),
              },
              mode: {
                type: "custom",
                label: "Mode",
                render: ({ value, onChange }) => (
                  <AlignField
                    value={value}
                    onChange={onChange}
                    label="Mode"
                    options={[
                      {
                        value: "inline",
                        icon: <ImageIcon size={15} />,
                        title: "Inline",
                      },
                      {
                        value: "bg",
                        icon: <Layers size={15} />,
                        title: "Background",
                      },
                      {
                        value: "custom",
                        icon: <Settings2 size={15} />,
                        title: "Custom",
                      },
                    ]}
                  />
                ),
              },
              position: {
                type: "custom",
                label: "Position",
                render: ({ value, onChange }) => (
                  <AlignField
                    value={value}
                    onChange={onChange}
                    label="Position"
                    options={[
                      {
                        value: "left",
                        icon: <PanelLeft size={15} />,
                        title: "Left",
                      },
                      {
                        value: "right",
                        icon: <PanelRight size={15} />,
                        title: "Right",
                      },
                    ]}
                  />
                ),
              },
            },
          },

          videoSettings: {
            type: "custom",
            label: "Video Settings",
            visible: ({ props }) => props.mediaType === "video",
            render: ({ value, onChange }) => {
              const v = value ?? {};
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <videoUploadField.render
                    value={v.url ?? ""}
                    onChange={(url: string) => onChange({ ...v, url })}
                    field={{ label: "Background Video" }}
                  />
                  {v.url && (
                    <>
                      <ToggleField label="Autoplay"    value={v.autoplay !== false} onChange={(autoplay: boolean) => onChange({ ...v, autoplay })} />
                      <ToggleField label="Loop Video"  value={v.loop    !== false} onChange={(loop: boolean)    => onChange({ ...v, loop    })} />
                      <ToggleField label="Mute Video"  value={v.muted   !== false} onChange={(muted: boolean)   => onChange({ ...v, muted   })} />
                    </>
                  )}
                </div>
              );
            },
          },

          backgroundColor: {
            type: "custom",
            label: "Background Color",
            render: ({ value, onChange }) => (
              <ColorPickerField
                label="Background Color"
                value={value}
                onChange={onChange}
              />
            ),
          },

          overlayOpacity: {
            type: "custom",
            label: "Overlay Opacity (0–1)",
            render: ({ value, onChange }) => (
              <StackedNumberField
                label="Overlay Opacity (0–1)"
                value={value}
                onChange={onChange}
                min={0}
                max={1}
                placeholder="e.g., 0.4"
              />
            ),
          },

          gradientStartColor: {
            type: "custom",
            label: "Gradient Start",
            render: ({ value, onChange }) => (
              <ColorPickerField
                label="Gradient Start"
                value={value}
                onChange={onChange}
              />
            ),
          },

          gradientEndColor: {
            type: "custom",
            label: "Gradient End",
            render: ({ value, onChange }) => (
              <ColorPickerField
                label="Gradient End"
                value={value}
                onChange={onChange}
              />
            ),
          },

          gradientDirection: {
            type: "custom",
            label: "Gradient Angle",
            render: ({ value, onChange }) => (
              <AlignField
                value={value ?? "135deg"}
                onChange={onChange}
                label="Gradient Angle"
                layout="stacked"
                options={[
                  { value: "0deg", icon: <ArrowUp size={15} />, title: "↑ Top" },
                  { value: "45deg", icon: <ArrowUp size={15} />, title: "↗ Top Right" },
                  { value: "90deg", icon: <ArrowRight size={15} />, title: "→ Right" },
                  { value: "135deg", icon: <ArrowUp size={15} />, title: "↘ Bottom Right" },
                  { value: "180deg", icon: <ArrowDown size={15} />, title: "↓ Bottom" },
                ]}
              />
            ),
          },

          patternType: {
            type: "custom",
            label: "Background Pattern",
            render: ({ value, onChange }) => (
              <AlignField
                value={value}
                onChange={onChange}
                label="Pattern Type"
                options={[
                  { value: "none", icon: <Square size={15} />, title: "None" },
                  {
                    value: "dots",
                    icon: <span style={{ fontSize: 12 }}>•••</span>,
                    title: "Dots",
                  },
                  {
                    value: "grid",
                    icon: <span style={{ fontSize: 12 }}>⊞</span>,
                    title: "Grid",
                  },
                  {
                    value: "waves",
                    icon: <span style={{ fontSize: 12 }}>〰</span>,
                    title: "Waves",
                  },
                  {
                    value: "geometric",
                    icon: <span style={{ fontSize: 12 }}>◇</span>,
                    title: "Geometric",
                  },
                ]}
              />
            ),
          },

          patternColor: {
            type: "custom",
            label: "Pattern Color",
            render: ({ value, onChange }) => (
              <ColorPickerField
                label="Pattern Color"
                value={value ?? "rgba(0,0,0,0.1)"}
                onChange={onChange}
              />
            ),
          },

          textColor: {
            type: "custom",
            label: "Text Color",
            render: ({ value, onChange }) => (
              <ColorPickerField
                label="Text Color"
                value={value}
                onChange={onChange}
              />
            ),
          },

          padding: {
            type: "custom",
            label: "Padding (px)",
            render: ({ value, onChange }) => (
              <StackedNumberField
                label="Padding (px)"
                value={value ?? 80}
                onChange={onChange}
                placeholder="e.g., 80"
              />
            ),
          },

          align: {
            type: "custom",
            label: "Text Align",
            render: ({ value, onChange }) => (
              <AlignField
                value={value}
                onChange={onChange}
                label="Text Align"
              />
            ),
          },

          verticalAlign: {
            type: "custom",
            label: "Vertical Align",
            render: ({ value, onChange }) => (
              <AlignField
                value={value}
                onChange={onChange}
                label="Vertical Align"
                options={[
                  {
                    value: "items-start",
                    icon: <AlignVerticalJustifyStart size={15} />,
                    title: "Top",
                  },
                  {
                    value: "items-center",
                    icon: <AlignVerticalJustifyCenter size={15} />,
                    title: "Center",
                  },
                  {
                    value: "items-end",
                    icon: <AlignVerticalJustifyEnd size={15} />,
                    title: "Bottom",
                  },
                ]}
              />
            ),
          },

          contentWidth: {
            type: "custom",
            label: "Content Width",
            render: ({ value, onChange }) => (
              <AlignField
                value={value}
                onChange={onChange}
                label="Content Width"
                options={[
                  {
                    value: "max-w-md",
                    icon: (
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <span
                          style={{
                            width: 10,
                            height: 4,
                            background: "currentColor",
                            borderRadius: 2,
                            display: "inline-block",
                          }}
                        />
                      </span>
                    ),
                    title: "Small",
                  },
                  {
                    value: "max-w-xl",
                    icon: (
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <span
                          style={{
                            width: 16,
                            height: 4,
                            background: "currentColor",
                            borderRadius: 2,
                            display: "inline-block",
                          }}
                        />
                      </span>
                    ),
                    title: "Medium",
                  },
                  {
                    value: "max-w-full",
                    icon: (
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <span
                          style={{
                            width: 22,
                            height: 4,
                            background: "currentColor",
                            borderRadius: 2,
                            display: "inline-block",
                          }}
                        />
                      </span>
                    ),
                    title: "Full",
                  },
                ]}
              />
            ),
          },

          textPosition: {
            type: "custom",
            label: "Text Position (BG)",
            render: ({ value, onChange }) => (
              <AlignField
                value={value ?? "justify-center"}
                onChange={onChange}
                label="Text Position (BG)"
                options={[
                  { value: "justify-start",  icon: <AlignVerticalJustifyStart  size={15} />, title: "Top"    },
                  { value: "justify-center", icon: <AlignVerticalJustifyCenter size={15} />, title: "Center" },
                  { value: "justify-end",    icon: <AlignVerticalJustifyEnd    size={15} />, title: "Bottom" },
                ]}
              />
            ),
          },

          mediaType: {
            type: "custom",
            label: "Media Type",
            render: ({ value, onChange }) => (
              <StackedField label="Media Type">
                <select
                  value={value ?? "image"}
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
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </StackedField>
            ),
          },

          backgroundType: {
            type: "custom",
            label: "Background Type",
            render: ({ value, onChange }) => (
              <StackedField label="Background Type">
                <select
                  value={value ?? "media"}
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
                  <option value="media">Media (Image / Video)</option>
                  <option value="color">Background Color</option>
                  <option value="gradient">Gradient Color</option>
                </select>
              </StackedField>
            ),
          },

          fullscreen: {
            type: "custom",
            label: "Full Screen",
            render: ({ value, onChange }) => (
              <ToggleField label="Full Screen Slide" value={!!value} onChange={onChange} />
            ),
          },

        },
      },

      autoplay: {
        type: "custom",

        label: "Autoplay",

        visible: ({ props }) => !!props?.sliderEnabled,

        render: ({ value, onChange }) => {
          const sliderOn = (() => {
            try {
              const puck = usePuck();

              const selectedId = puck?.appState?.ui?.selectedItem?.id;

              const selectedItem = puck?.appState?.data?.content?.find(
                (item) => item.id === selectedId,
              );

              return !!selectedItem?.props?.sliderEnabled;
            } catch (_) {
              return false;
            }
          })();

          if (!sliderOn) return null;

          return (
            <ToggleField
              label="Autoplay"
              value={value !== false}
              onChange={onChange}
            />
          );
        },
      },

      interval: {
        type: "custom",

        label: "Slide Interval (seconds)",

        visible: ({ props }) => !!props?.sliderEnabled,

        render: ({ value, onChange }) => {
          const sliderOn = (() => {
            try {
              const puck = usePuck();

              const selectedId = puck?.appState?.ui?.selectedItem?.id;

              const selectedItem = puck?.appState?.data?.content?.find(
                (item) => item.id === selectedId,
              );

              return !!selectedItem?.props?.sliderEnabled;
            } catch (_) {
              return false;
            }
          })();

          if (!sliderOn) return null;

          return (
            <StackedNumberField
              label="Slide Interval (seconds)"
              value={value ?? 5}
              onChange={onChange}
              min={1}
              max={60}
              placeholder="e.g., 5"
            />
          );
        },
      },

      showArrows: {
        type: "custom",

        label: "Show Arrows",

        visible: ({ props }) => !!props?.sliderEnabled,

        render: ({ value, onChange }) => {
          const sliderOn = (() => {
            try {
              const puck = usePuck();

              const selectedId = puck?.appState?.ui?.selectedItem?.id;

              const selectedItem = puck?.appState?.data?.content?.find(
                (item) => item.id === selectedId,
              );

              return !!selectedItem?.props?.sliderEnabled;
            } catch (_) {
              return false;
            }
          })();

          if (!sliderOn) return null;

          return (
            <ToggleField
              label="Show Navigation Arrows"
              value={value !== false}
              onChange={onChange}
            />
          );
        },
      },

      showDots: {
        type: "custom",

        label: "Show Dots",

        visible: ({ props }) => !!props?.sliderEnabled,

        render: ({ value, onChange }) => {
          const sliderOn = (() => {
            try {
              const puck = usePuck();

              const selectedId = puck?.appState?.ui?.selectedItem?.id;

              const selectedItem = puck?.appState?.data?.content?.find(
                (item) => item.id === selectedId,
              );

              return !!selectedItem?.props?.sliderEnabled;
            } catch (_) {
              return false;
            }
          })();

          if (!sliderOn) return null;

          return (
            <ToggleField
              label="Show Slide Dots"
              value={value !== false}
              onChange={onChange}
            />
          );
        },
      },

      pauseOnHover: {
        type: "custom",

        label: "Pause On Hover",

        visible: ({ props }) => !!props?.sliderEnabled,

        render: ({ value, onChange }) => {
          const sliderOn = (() => {
            try {
              const puck = usePuck();

              const selectedId = puck?.appState?.ui?.selectedItem?.id;

              const selectedItem = puck?.appState?.data?.content?.find(
                (item) => item.id === selectedId,
              );

              return !!selectedItem?.props?.sliderEnabled;
            } catch (_) {
              return false;
            }
          })();

          if (!sliderOn) return null;

          return (
            <ToggleField
              label="Pause Autoplay on Hover"
              value={value !== false}
              onChange={onChange}
            />
          );
        },
      },

      transitionDuration: {
        type: "custom",

        label: "Transition Duration (ms)",

        visible: ({ props }) => !!props?.sliderEnabled,

        render: ({ value, onChange }) => {
          const sliderOn = (() => {
            try {
              const puck = usePuck();

              const selectedId = puck?.appState?.ui?.selectedItem?.id;

              const selectedItem = puck?.appState?.data?.content?.find(
                (item) => item.id === selectedId,
              );

              return !!selectedItem?.props?.sliderEnabled;
            } catch (_) {
              return false;
            }
          })();

          if (!sliderOn) return null;

          return (
            <StackedNumberField
              label="Transition Duration (ms)"
              value={value ?? 500}
              onChange={onChange}
              min={100}
              max={2000}
              step={100}
              placeholder="e.g., 500"
            />
          );
        },
      },
    },

    defaultProps: {
      title: "Welcome to My Store",

      subtitle: "New Collection 2026",

      badge: "🔥 Limited Offer",

      description: "Discover premium products crafted just for you.",

      rating: 4.8,

      reviewCount: 1200,

      features: [
        { text: "Free Shipping" },

        { text: "30 Days Return" },

        { text: "Premium Quality" },
      ],

      buttons: [
        {
          label: "Shop Now",

          link: "#",

          variant: "primary",
        },

        {
          label: "Learn More",

          link: "#",

          variant: "outline",
        },
      ],

      image: {
        url: "https://picsum.photos/seed/hero1/1200/500",

        mode: "bg",

        position: "right",
      },

      padding: 80,

      backgroundImage: "",

      textPosition: "justify-center",

      align: "text-left",

      overlayOpacity: 0.4,

      backgroundColor: "#f8fafc",

      verticalAlign: "items-center",

      contentWidth: "max-w-xl",

      patternType: "none",

      patternColor: "rgba(0,0,0,0.1)",

      videoSettings: {
        url: "",
        autoplay: true,
        loop: true,
        muted: true,
      },

      mediaType: "image",

      backgroundType: "media",

      sliderEnabled: false,

      slides: [],

      autoplay: true,

      interval: 5,

      showArrows: true,

      showDots: true,

      pauseOnHover: true,

      transitionDuration: 500,
    },

    render: ({
      title,
      subtitle,
      badge,
      description,
      rating,
      reviewCount,
      features,
      buttons,
      image,
      padding,
      align,
      overlayOpacity,
      backgroundColor,
      verticalAlign,
      contentWidth,
      textPosition,
      gradientStartColor,
      gradientEndColor,
      gradientDirection,
      glassEffect,
      glassBlur,
      patternType,
      patternColor,
      textColor,
      videoSettings,
      mediaType,
      backgroundType,
      floatingElements,
      geometricShapes,
      parallaxEffect,
      fullscreen,
      sliderEnabled,
      slides,
      autoplay,
      interval,
      showArrows,
      showDots,
      pauseOnHover,
      transitionDuration,
    }) => {
      // HeroSlide component for single hero and each slider slide

      const HeroSlide = (props: any) => {
        const {
          title: t = "",
          subtitle: sub,
          badge: bdg,
          description: desc = "",
          rating: rat,
          reviewCount: revCount,
          features: feats = [],
          buttons: btns = [],
          image: img,
          padding: pad = 80,
          align: al = "text-left",
          overlayOpacity: opacity = 0.3,
          backgroundColor: bgColor = "transparent",
          verticalAlign: vAlign = "items-center",
          contentWidth: cWidth = "max-w-xl",
          textPosition: tPos = "justify-center",
          gradientStartColor: gradStart,
          gradientEndColor: gradEnd,
          gradientDirection: gradDir = "135deg",
          glassEffect: glass,
          glassBlur: blur = 10,
          patternType: pattern,
          patternColor: patColor = "rgba(0,0,0,0.1)",
          textColor: txtColor,
          videoSettings: vidSettings,
          mediaType: media = "image",
          backgroundType: bgType = "media",
          floatingElements: floatEls,
          geometricShapes: geoShapes,
          parallaxEffect: parallax,
          fullscreen: fs,
        } = props;

        const {
          url: vUrl,
          autoplay: vAutoplay,
          loop: vLoop,
          muted: vMuted,
          poster: vPoster,
        } = vidSettings || { url: "", autoplay: true, loop: true, muted: true, poster: "" };

        const { url, mode, position } = img || {};

        const isBg = mode === "bg",
          isInline = mode === "inline",
          isCustom = mode === "custom";

        // backgroundType is the source of truth for what the hero looks like
        const isMediaType   = bgType === "media" || !bgType;
        const isColorType   = bgType === "color";
        const isGradientType = bgType === "gradient";

        const hasVideo =
          isMediaType && media === "video" && !!(vUrl && vUrl.trim() !== "");

        const hasNoImage = !isBg && !isInline && !isCustom;

        const imageOrder =
          isCustom && position === "left" ? "order-1" : "order-2";

        const textOrder =
          isCustom && position === "left" ? "order-2" : "order-1";

        // Derive the CSS background-image only for the active background type
        let heroBackgroundImage = "none";
        let heroBgColor = "transparent";

        if (isGradientType && gradStart && gradEnd) {
          heroBackgroundImage = `linear-gradient(${gradDir ?? "135deg"}, ${gradStart}, ${gradEnd})`;
          heroBgColor = gradStart; // visible while gradient loads
        } else if (isColorType) {
          heroBgColor = bgColor || "transparent";
        } else if (isMediaType && !hasVideo && isBg && url) {
          heroBackgroundImage = `url(${url})`;
          heroBgColor = "transparent";
        } else {
          // media type without a bg-mode image, or video — let bgColor show through
          heroBgColor = bgColor || "transparent";
        }

        // Patterns only apply on top of solid/gradient backgrounds
        const applyPattern = (isColorType || isGradientType) && pattern && pattern !== "none";

        const getPatternGradient = (baseColor: string, opacity: number) => {
          if (!baseColor) return `rgba(0, 0, 0, ${opacity})`;
          
          // Handle hex colors (#fff or #ffffff)
          if (baseColor.startsWith("#")) {
            const hex = baseColor.slice(1);
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
          }
          
          // Handle rgb/rgba colors
          const rgbaMatch = baseColor.match(/rgba?\((.*?)\)/);
          if (rgbaMatch) {
            const values = rgbaMatch[1].split(",").map((v) => v.trim());
            return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${opacity})`;
          }
          
          // Fallback to black
          return `rgba(0, 0, 0, ${opacity})`;
        };

        const patternStyles: { [k: string]: React.CSSProperties } = {
          dots:        { backgroundImage: `radial-gradient(circle, ${getPatternGradient(patColor, 0.18)} 1.5px, transparent 1.5px)`, backgroundSize: "20px 20px" },
          grid:        { backgroundImage: `linear-gradient(${getPatternGradient(patColor, 0.12)} 1px, transparent 1px), linear-gradient(90deg, ${getPatternGradient(patColor, 0.12)} 1px, transparent 1px)`, backgroundSize: "40px 40px" },
          waves:       { backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${getPatternGradient(patColor, 0.08)} 10px, ${getPatternGradient(patColor, 0.08)} 11px)` },
          geometric:   { backgroundImage: `linear-gradient(30deg, ${getPatternGradient(patColor, 0.08)} 12%, transparent 12.5%, transparent 87%, ${getPatternGradient(patColor, 0.08)} 87.5%), linear-gradient(150deg, ${getPatternGradient(patColor, 0.08)} 12%, transparent 12.5%, transparent 87%, ${getPatternGradient(patColor, 0.08)} 87.5%), linear-gradient(60deg, ${getPatternGradient(patColor, 0.08)} 25%, transparent 25.5%, transparent 75%, ${getPatternGradient(patColor, 0.08)} 75%)`, backgroundSize: "80px 140px", backgroundPosition: "0 0, 0 0, 40px 70px" },
          diagonal:    { backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 8px, ${getPatternGradient(patColor, 0.12)} 8px, ${getPatternGradient(patColor, 0.12)} 9px)` },
          crosshatch:  { backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 14px, ${getPatternGradient(patColor, 0.12)} 14px, ${getPatternGradient(patColor, 0.12)} 15px), repeating-linear-gradient(90deg, transparent, transparent 14px, ${getPatternGradient(patColor, 0.12)} 14px, ${getPatternGradient(patColor, 0.12)} 15px)` },
          zigzag:      { backgroundImage: `linear-gradient(135deg, ${getPatternGradient(patColor, 0.12)} 25%, transparent 25%, transparent 50%, ${getPatternGradient(patColor, 0.12)} 50%, ${getPatternGradient(patColor, 0.12)} 75%, transparent 75%, transparent), linear-gradient(225deg, ${getPatternGradient(patColor, 0.12)} 25%, transparent 25%, transparent 50%, ${getPatternGradient(patColor, 0.12)} 50%, ${getPatternGradient(patColor, 0.12)} 75%, transparent 75%, transparent)`, backgroundSize: "20px 20px" },
          checkerboard:{ backgroundImage: `linear-gradient(45deg, ${getPatternGradient(patColor, 0.12)} 25%, transparent 25%, transparent 75%, ${getPatternGradient(patColor, 0.12)} 75%), linear-gradient(45deg, ${getPatternGradient(patColor, 0.12)} 25%, transparent 25%, transparent 75%, ${getPatternGradient(patColor, 0.12)} 75%)`, backgroundSize: "30px 30px", backgroundPosition: "0 0, 15px 15px" },
          circles:     { backgroundImage: `radial-gradient(circle, transparent 40%, ${getPatternGradient(patColor, 0.18)} 41%, ${getPatternGradient(patColor, 0.18)} 43%, transparent 44%)`, backgroundSize: "30px 30px" },
        };

        const currentPattern =
          pattern && pattern !== "none" ? patternStyles[pattern] : {};

        const hasDarkBg = hasVideo || (isMediaType && isBg) || isGradientType;

        return (
          <div
            className={`relative flex flex-col md:flex-row ${vAlign} gap-8 ${hasDarkBg ? "text-white" : ""} ${tPos} pb-hero`}
            style={{
              backgroundImage: hasVideo ? "none" : heroBackgroundImage,
              backgroundColor: glass ? "rgba(255,255,255,0.1)" : heroBgColor,
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: "100vh",
              padding: pad,
              overflow: "hidden",
              ...(glass
                ? {
                    backdropFilter: `blur(${blur}px)`,
                    border: "1px solid rgba(255,255,255,0.2)",
                  }
                : {}),
              ...(applyPattern ? currentPattern : {}),
            }}
          >
            {hasVideo && (
              <video
                autoPlay={vAutoplay !== false}
                loop={vLoop !== false}
                muted={vMuted !== false}
                playsInline
                poster={vPoster || undefined}
                className="absolute inset-0 w-full h-full object-cover z-0"
                style={{ opacity: 1 }}
              >
                <source src={vUrl} />
              </video>
            )}

            {/* Dark overlay — only for media backgrounds (bg image or video) */}
            {(hasVideo || (isMediaType && isBg)) && opacity > 0 && (
              <div
                className="absolute inset-0 bg-black z-0"
                style={{ opacity }}
              />
            )}

            {geoShapes?.enabled &&
              geoShapes.shapes?.map((s: any, i: number) => (
                <div
                  key={`geo-${i}`}
                  className="absolute z-0"
                  style={{
                    left: s.position.x,
                    top: s.position.y,
                    width: s.size,
                    height: s.size,
                    backgroundColor: s.color,
                    opacity: s.opacity || 0.3,
                    transform: `rotate(${s.rotation || 0}deg)`,
                    ...(s.type === "circle" ? { borderRadius: "50%" } : {}),
                    ...(s.type === "triangle"
                      ? {
                          width: 0,
                          height: 0,
                          backgroundColor: "transparent",
                          borderLeft: `${s.size / 2}px solid transparent`,
                          borderRight: `${s.size / 2}px solid transparent`,
                          borderBottom: `${s.size}px solid ${s.color}`,
                        }
                      : {}),
                  }}
                />
              ))}

            {floatEls?.enabled &&
              floatEls.elements?.map((e: any, i: number) => (
                <div
                  key={`float-${i}`}
                  className="absolute z-0"
                  style={{
                    left: e.position.x,
                    top: e.position.y,
                    width: e.size,
                    height: e.size,
                    backgroundColor: e.color,
                    borderRadius:
                      e.type === "circle"
                        ? "50%"
                        : e.type === "blob"
                          ? "30% 70% 70% 30% / 30% 30% 70% 70%"
                          : "0",
                    animation:
                      e.animation === "float"
                        ? "float 3s ease-in-out infinite"
                        : e.animation === "pulse"
                          ? "pulse 2s ease-in-out infinite"
                          : e.animation === "rotate"
                            ? "rotate 4s linear infinite"
                            : e.animation === "bounce"
                              ? "bounce 2s ease-in-out infinite"
                              : "none",
                  }}
                />
              ))}

            {(isInline || isCustom) && url && (
              <div className={`w-full md:w-1/2 ${imageOrder}`}>
                <img
                  src={url}
                  alt="Hero"
                  className="w-full h-full object-cover rounded"
                />
              </div>
            )}

            <div
              className={`relative ${hasNoImage ? "w-full" : "w-full md:w-1/2"} p-8 z-10 ${textOrder} ${al} ${cWidth} ${tPos}`}
              style={{ color: txtColor || "inherit" }}
            >
              {bdg && (
                <span
                  className="inline-block mb-2 px-3 py-1 text-xs text-white rounded"
                  style={{
                    backgroundColor: "var(--accent-color)",
                    borderRadius: "var(--button-border-radius)",
                  }}
                >
                  {bdg}
                </span>
              )}

              {sub && (
                <p
                  className="text-lg mb-2"
                  style={{ color: txtColor || "var(--secondary-color)" }}
                >
                  {sub}
                </p>
              )}

              <h1
                className="mb-4"
                style={{
                  color: txtColor || "var(--primary-color)",
                  fontFamily: "var(--heading-font)",
                  fontSize: "var(--h1-size)",
                  fontWeight: "var(--heading-weight)",
                  lineHeight: "var(--heading-line-height)",
                }}
              >
                {t}
              </h1>

              {rat && (
                <div
                  className="flex items-center gap-2 mb-3"
                  style={{
                    justifyContent:
                      al === "text-center"
                        ? "center"
                        : al === "text-right"
                          ? "flex-end"
                          : "flex-start",
                  }}
                >
                  <div className="flex text-lg" style={{ gap: 1 }}>
                    {Array.from({ length: 5 }, (_, j) => {
                      const full = j < Math.floor(rat);
                      const fraction = rat % 1;
                      const partial = j === Math.floor(rat) && fraction > 0;
                      if (full)
                        return (
                          <span key={j} style={{ color: "#facc15" }}>★</span>
                        );
                      if (partial)
                        return (
                          <span key={j} style={{ position: "relative", display: "inline-block" }}>
                            <span style={{ color: "#d1d5db" }}>★</span>
                            <span style={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              width: `${fraction * 100}%`,
                              overflow: "hidden",
                              color: "#facc15",
                              whiteSpace: "nowrap",
                            }}>★</span>
                          </span>
                        );
                      return (
                        <span key={j} style={{ color: "#d1d5db" }}>★</span>
                      );
                    })}
                  </div>
                  <span className="text-sm opacity-80">
                    {rat}
                    {revCount ? ` (${revCount} reviews)` : ""}
                  </span>
                </div>
              )}

              {feats && feats.length > 0 && (
                <ul
                  className="mb-4 space-y-1 text-sm"
                  style={{
                    textAlign:
                      al === "text-center"
                        ? "center"
                        : al === "text-right"
                          ? "right"
                          : "left",
                    listStylePosition: "inside",
                  }}
                >
                  {feats.map((f: any, i: number) => (
                    <li key={i} style={{ color: "var(--secondary-color)" }}>
                      ✔ {f.text}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mb-6">{desc}</div>

              <div
                className="flex gap-4 flex-wrap mb-6"
                style={{
                  justifyContent:
                    al === "text-center"
                      ? "center"
                      : al === "text-right"
                        ? "flex-end"
                        : "flex-start",
                }}
              >
                {btns?.map((b: any, i: number) => {
                  const s: React.CSSProperties = {
                    borderRadius: "var(--button-border-radius)",
                    paddingLeft: "var(--button-padding-x)",
                    paddingRight: "var(--button-padding-x)",
                    paddingTop: "var(--button-padding-y)",
                    paddingBottom: "var(--button-padding-y)",
                    fontWeight: "var(--button-font-weight)" as any,
                    textTransform: "var(--button-text-transform)" as any,
                    display: "inline-block",
                    cursor: "pointer",
                    ...(b.variant === "primary"
                      ? {
                          backgroundColor: "var(--primary-color)",
                          color: "#fff",
                          border: "none",
                        }
                      : b.variant === "secondary"
                        ? {
                            backgroundColor: "var(--secondary-color)",
                            color: "#fff",
                            border: "none",
                          }
                        : {
                            backgroundColor: "transparent",
                            border: "2px solid currentColor",
                          }),
                  };
                  return (
                    <a
                      key={i}
                      href={b.link}
                      className={b.variant === "outline" ? "pb-btn pb-btn-outline" : "pb-btn"}
                      style={s}
                    >
                      {b.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        );
      };

      const baseSlideProps = {
        title,

        subtitle,

        badge,

        description,

        rating,

        reviewCount,

        features,

        buttons,

        image,

        padding,

        align,

        overlayOpacity,

        backgroundColor,

        verticalAlign,

        contentWidth,

        textPosition,

        gradientStartColor,

        gradientEndColor,

        gradientDirection,

        glassEffect,

        glassBlur,

        patternType,

        patternColor,

        textColor,

        videoSettings,

        mediaType,

        floatingElements,

        geometricShapes,

        parallaxEffect,

        fullscreen,

        backgroundType,
      };

      // --- SLIDER: Main hero as first slide ---

      let activeSlides = null;

      if (sliderEnabled && Array.isArray(slides) && slides.length > 0) {
        // Prepend the main hero as the first slide

        activeSlides = [baseSlideProps, ...slides];
      }

      const [currentIndex, setCurrentIndex] = useState(0);

      const [isHovered, setIsHovered] = useState(false);

      const slideIntervalMs = Math.max(1, Number(interval) || 5) * 1000;

      const fadeDurationMs = Math.max(100, Number(transitionDuration) || 500);

      const shouldPause = pauseOnHover !== false && isHovered;

      useEffect(() => {
        if (
          !activeSlides ||
          activeSlides.length < 2 ||
          autoplay === false ||
          shouldPause
        )
          return;

        const timer = window.setInterval(() => {
          setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
        }, slideIntervalMs);

        return () => window.clearInterval(timer);
      }, [activeSlides?.length, autoplay, shouldPause, slideIntervalMs]);

      useEffect(() => {
        if (!activeSlides || activeSlides.length === 0) {
          setCurrentIndex(0);

          return;
        }

        if (currentIndex >= activeSlides.length) {
          setCurrentIndex(0);
        }
      }, [activeSlides?.length, currentIndex]);

      if (!activeSlides) {
        return <HeroSlide {...baseSlideProps} />;
      }

      return (
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ overflow: "hidden" }}
        >
          {/* Only the active slide is mounted — no ghost DOM nodes from inactive slides */}
          <style>{`@keyframes pb-slide-fadein{from{opacity:0}to{opacity:1}}`}</style>
          <div
            key={`hero-slide-${currentIndex}`}
            style={{ animation: `pb-slide-fadein ${fadeDurationMs}ms ease` }}
          >
            <HeroSlide {...activeSlides[currentIndex]} />
          </div>

          {showArrows !== false && activeSlides.length > 1 && (
            <>
              <button
                type="button"
                className="no-global-style"
                aria-label="Previous slide"
                onClick={() =>
                  setCurrentIndex(
                    (prev) =>
                      (prev - 1 + activeSlides.length) % activeSlides.length,
                  )
                }
                style={{
                  position: "absolute",

                  left: 16,

                  top: "50%",

                  transform: "translateY(-50%)",

                  width: 44,

                  height: 44,

                  borderRadius: "50%",

                  border: "1px solid rgba(255,255,255,0.35)",

                  backgroundColor: "rgba(10,20,40,0.55)",

                  backdropFilter: "blur(8px)",

                  color: "#fff",

                  cursor: "pointer",

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  zIndex: 5,
                }}
              >
                <ArrowLeft size={20} />
              </button>

              <button
                type="button"
                className="no-global-style"
                aria-label="Next slide"
                onClick={() =>
                  setCurrentIndex((prev) => (prev + 1) % activeSlides.length)
                }
                style={{
                  position: "absolute",

                  right: 16,

                  top: "50%",

                  transform: "translateY(-50%)",

                  width: 44,

                  height: 44,

                  borderRadius: "50%",

                  border: "1px solid rgba(255,255,255,0.35)",

                  backgroundColor: "rgba(10,20,40,0.55)",

                  backdropFilter: "blur(8px)",

                  color: "#fff",

                  cursor: "pointer",

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  zIndex: 5,
                }}
              >
                <ArrowRight size={20} />
              </button>
            </>
          )}

          {showDots !== false && activeSlides.length > 1 && (
            <div
              style={{
                position: "absolute",

                left: "50%",

                bottom: 18,

                transform: "translateX(-50%)",

                display: "flex",

                gap: 8,

                zIndex: 5,
              }}
            >
              {activeSlides.map((_, idx) => {
                const isActive = idx === currentIndex;

                return (
                  <button
                    key={`hero-dot-${idx}`}
                    type="button"
                    className="no-global-style"
                    aria-label={`Go to slide ${idx + 1}`}
                    onClick={() => setCurrentIndex(idx)}
                    style={{
                      width: isActive ? 28 : 10,

                      height: 10,

                      borderRadius: 9999,

                      border: "none",

                      backgroundColor: isActive
                        ? "#ffffff"
                        : "rgba(255,255,255,0.45)",

                      boxShadow: "0 1px 4px rgba(0,0,0,0.35)",

                      cursor: "pointer",

                      transition: "all 0.25s ease",
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      );
    },
  },

  // ─── Gradient Hero with Dividers ─────────────────────────────────────────

  MarqueeBar: {
    label: "Info Bar",
    fields: {
      text: {
        type: "custom",

        label: "Announcement Text",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Announcement Text"
            value={value}
            onChange={onChange}
            placeholder="Enter announcement text..."
          />
        ),
      },

      speed: {
        type: "custom",

        label: "Speed (seconds)",

        render: ({ value, onChange }) => (
          <StackedNumberField
            label="Speed (seconds)"
            value={value}
            onChange={onChange}
            placeholder="e.g., 20"
          />
        ),
      },

      direction: {
        type: "custom",

        label: "Direction",

        render: ({ value, onChange }) => (
          <AlignField
            value={value}
            onChange={onChange}
            label="Direction"
            options={[
              { value: "left", icon: <ArrowLeft size={15} />, title: "Left" },

              {
                value: "right",
                icon: <ArrowRight size={15} />,
                title: "Right",
              },
            ]}
          />
        ),
      },

      pauseOnHover: {
        type: "custom",

        label: "Pause on Hover",

        render: ({ value, onChange }) => (
          <ToggleField
            value={!!value}
            onChange={onChange}
            label="Pause on Hover"
          />
        ),
      },

      backgroundColor: {
        type: "custom",

        label: "Background Color (CSS)",

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Background Color"
            value={value}
            onChange={onChange}
          />
        ),
      },

      textColor: {
        type: "custom",

        label: "Text Color (CSS)",

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Text Color"
            value={value}
            onChange={onChange}
          />
        ),
      },

      fontSize: {
        type: "custom",

        label: "Font Size",

        render: ({ value, onChange }) => (
          <StackedNumberField
            label="Font Size"
            value={value}
            onChange={onChange}
            placeholder="e.g., 16"
          />
        ),
      },

      padding: {
        type: "custom",

        label: "Padding (px)",

        render: ({ value, onChange }) => (
          <StackedNumberField
            label="Padding (px)"
            value={value}
            onChange={onChange}
            placeholder="e.g., 12"
          />
        ),
      },

      repeat: {
        type: "custom",

        label: "Repeat Count",

        render: ({ value, onChange }) => (
          <StackedNumberField
            label="Repeat Count"
            value={value}
            onChange={onChange}
            placeholder="e.g., 3"
          />
        ),
      },
    },

    defaultProps: {
      text: "🔥 Free Shipping on All Orders | 30 Days Return | COD Available 🔥",

      speed: 20,

      direction: "left",

      pauseOnHover: true,

      backgroundColor: "#000",

      textColor: "#fff",

      fontSize: 14,

      padding: 10,

      repeat: 10,
    },

    render: ({
      text,

      speed,

      direction,

      pauseOnHover,

      backgroundColor,

      textColor,

      fontSize,

      padding,

      repeat,
    }) => {
      const [hovered, setHovered] = useState(false);

      const animationName =
        direction === "left" ? "marqueeLeft" : "marqueeRight";

      const repeatedText = Array.from({ length: repeat }).map((_, i) => (
        <span key={i} style={{ marginRight: 40 }}>
          {text}
        </span>
      ));

      return (
        <div
          onMouseEnter={() => pauseOnHover && setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            boxSizing: "border-box",
            overflow: "hidden",

            whiteSpace: "nowrap",

            backgroundColor,

            color: textColor,

            fontSize,

            padding,
          }}
        >
          <div
            style={{
              display: "inline-block",

              animation: `${animationName} ${speed}s linear infinite`,

              animationPlayState:
                pauseOnHover && hovered ? "paused" : "running",
            }}
          >
            {repeatedText}
          </div>

          {/* KEYFRAMES */}

          <style>
            {`
            @keyframes marqueeLeft {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            @keyframes marqueeRight {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0%); }
            }
          `}
          </style>
        </div>
      );
    },
  },

  HeadingBlock: {
    label: "Heading",
    fields: {
      _tabs: {
        type: "custom",
        label: "",
        render: ({ value: _v, onChange: _onChange }: any) => {
          // Read all current props and dispatch via usePuck
          const { selectedItem, appState, dispatch } = usePuck();
          const props = selectedItem?.props ?? {};

          // Helper: merge one prop into the current item and replace it in the store
          const set = (key: string, val: any) => {
            if (!selectedItem) return;
            const state = appState.data;
            // Find index + zone for the selected item
            // Root content lives under the compound key "root:default-zone"
            let destinationZone = "root:default-zone";
            let destinationIndex = 0;
            const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
            for (const [zone, items] of Object.entries(zones)) {
              const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
              if (idx !== -1) {
                destinationZone = zone;
                destinationIndex = idx;
                break;
              }
            }
            dispatch({
              type: "replace",
              destinationZone,
              destinationIndex,
              data: { ...selectedItem, props: { ...props, [key]: val } },
            });
          };

          const dividerActive = (props.dividerType ?? "none") !== "none";
          const bgType = props.advBgType ?? "none";

          return (
            <BlockTabBar blockKey="HeadingBlock">
              {(tab) => (
                <>
                  {/* ── CONTENT TAB ── */}
                  {tab === "content" && (
                    <>
                      <StackedTextField
                        label="Text"
                        value={props.title ?? ""}
                        onChange={(v) => set("title", v)}
                        placeholder="Enter heading..."
                      />
                      <InlineSelect
                        label="HTML Tag"
                        value={String(props.level ?? "1")}
                        onChange={(v) => set("level", Number(v))}
                        options={[
                          { value: "1", label: "H1" }, { value: "2", label: "H2" },
                          { value: "3", label: "H3" }, { value: "4", label: "H4" },
                          { value: "5", label: "H5" }, { value: "6", label: "H6" },
                        ]}
                      />
                      <StackedTextField
                        label="Link URL"
                        value={props.linkUrl ?? ""}
                        onChange={(v) => set("linkUrl", v)}
                        placeholder="https://..."
                      />
                      <InlineSelect
                        label="Link Target"
                        value={props.linkTarget ?? "_self"}
                        onChange={(v) => set("linkTarget", v)}
                        options={[
                          { value: "_self", label: "Same Tab" },
                          { value: "_blank", label: "New Tab" },
                        ]}
                      />
                      <StackedTextField
                        label="Subtitle"
                        value={props.subtitle ?? ""}
                        onChange={(v) => set("subtitle", v)}
                        placeholder="Optional subtitle..."
                      />
                    </>
                  )}

                  {/* ── STYLE TAB ── */}
                  {tab === "style" && (
                    <>
                      <TabSection title="Typography" />
                      <InlineSelect
                        label="Font Family"
                        value={props.fontFamily ?? "inherit"}
                        onChange={(v) => set("fontFamily", v)}
                        options={[
                          { value: "inherit", label: "Theme Default" },
                          { value: "serif", label: "Serif" },
                          { value: "sans-serif", label: "Sans-serif" },
                          { value: "monospace", label: "Monospace" },
                          { value: "Georgia, serif", label: "Georgia" },
                          { value: "'Times New Roman', serif", label: "Times New Roman" },
                          { value: "Arial, sans-serif", label: "Arial" },
                          { value: "'Helvetica Neue', sans-serif", label: "Helvetica" },
                          { value: "'Trebuchet MS', sans-serif", label: "Trebuchet MS" },
                          { value: "'Courier New', monospace", label: "Courier New" },
                        ]}
                      />
                      <StackedNumberField
                        label="Font Size (px)"
                        value={props.fontSize ?? null}
                        onChange={(v) => set("fontSize", v)}
                        placeholder="e.g. 32"
                        min={8} max={200} step={1}
                      />
                      <InlineSelect
                        label="Font Weight"
                        value={String(props.fontWeight ?? "700")}
                        onChange={(v) => set("fontWeight", v)}
                        options={[
                          { value: "100", label: "100 – Thin" },
                          { value: "200", label: "200 – Extra Light" },
                          { value: "300", label: "300 – Light" },
                          { value: "400", label: "400 – Normal" },
                          { value: "500", label: "500 – Medium" },
                          { value: "600", label: "600 – Semi Bold" },
                          { value: "700", label: "700 – Bold" },
                          { value: "800", label: "800 – Extra Bold" },
                          { value: "900", label: "900 – Black" },
                        ]}
                      />
                      <InlineSelect
                        label="Font Style"
                        value={props.fontStyle ?? "normal"}
                        onChange={(v) => set("fontStyle", v)}
                        options={[
                          { value: "normal", label: "Normal" },
                          { value: "italic", label: "Italic" },
                        ]}
                      />
                      <InlineSelect
                        label="Text Transform"
                        value={props.textTransform ?? "none"}
                        onChange={(v) => set("textTransform", v)}
                        options={[
                          { value: "none", label: "None" },
                          { value: "uppercase", label: "Uppercase" },
                          { value: "lowercase", label: "Lowercase" },
                          { value: "capitalize", label: "Capitalize" },
                        ]}
                      />
                      <InlineSelect
                        label="Text Decoration"
                        value={props.textDecoration ?? "none"}
                        onChange={(v) => set("textDecoration", v)}
                        options={[
                          { value: "none", label: "None" },
                          { value: "underline", label: "Underline" },
                          { value: "line-through", label: "Line Through" },
                        ]}
                      />
                      <StackedNumberField
                        label="Line Height"
                        value={props.lineHeight ?? null}
                        onChange={(v) => set("lineHeight", v)}
                        placeholder="e.g. 1.4"
                        min={0.5} max={5} step={0.05}
                      />
                      <StackedNumberField
                        label="Letter Spacing (px)"
                        value={props.letterSpacing ?? null}
                        onChange={(v) => set("letterSpacing", v)}
                        placeholder="e.g. 0.5"
                        min={-10} max={50} step={0.5}
                      />

                      <TabSection title="Color" />
                      <ColorPickerField
                        label="Text Color"
                        value={props.textColor ?? ""}
                        onChange={(v) => set("textColor", v)}
                      />
                      <ColorPickerField
                        label="Hover Color"
                        value={props.hoverColor ?? ""}
                        onChange={(v) => set("hoverColor", v)}
                      />
                      <ColorPickerField
                        label="Subtitle Color"
                        value={props.subtitleColor ?? ""}
                        onChange={(v) => set("subtitleColor", v)}
                      />
                      <StackedNumberField
                        label="Subtitle Size (px)"
                        value={props.subtitleSize ?? 18}
                        onChange={(v) => set("subtitleSize", v)}
                        min={10} max={64} step={1}
                      />


                      <TabSection title="Alignment" />
                      <AlignField
                        label="Text Align"
                        value={props.alignment ?? "left"}
                        onChange={(v) => set("alignment", v)}
                        options={[
                          { value: "left",    icon: <AlignLeft    size={15} />, title: "Left"    },
                          { value: "center",  icon: <AlignCenter  size={15} />, title: "Center"  },
                          { value: "right",   icon: <AlignRight   size={15} />, title: "Right"   },
                          { value: "justify", icon: <AlignJustify size={15} />, title: "Justify" },
                        ]}
                      />

                      <TabSection title="Divider" />
                      <InlineSelect
                        label="Divider Style"
                        value={props.dividerType ?? "none"}
                        onChange={(v) => set("dividerType", v)}
                        options={[
                          { value: "none", label: "None" },
                          { value: "line", label: "Line" },
                          { value: "double-line", label: "Double Line" },
                          { value: "line-with-icon", label: "Line with Icon" },
                        ]}
                      />
                      {dividerActive && (
                        <>
                          <ColorPickerField
                            label="Divider Color"
                            value={props.dividerColor ?? ""}
                            onChange={(v) => set("dividerColor", v)}
                          />
                          <StackedNumberField
                            label="Divider Length (px)"
                            value={props.dividerLength ?? 60}
                            onChange={(v) => set("dividerLength", v)}
                            min={20} max={300} step={5}
                          />
                          {props.dividerType !== "line-with-icon" && (
                            <StackedNumberField
                              label="Divider Thickness (px)"
                              value={props.dividerThickness ?? 3}
                              onChange={(v) => set("dividerThickness", v)}
                              min={1} max={50} step={1}
                            />
                          )}
                          <AlignField
                            label="Divider Alignment"
                            value={props.dividerAlignment ?? "center"}
                            onChange={(v) => set("dividerAlignment", v)}
                            options={[
                              { value: "left",   icon: <AlignLeft   size={15} />, title: "Left"   },
                              { value: "center", icon: <AlignCenter size={15} />, title: "Center" },
                              { value: "right",  icon: <AlignRight  size={15} />, title: "Right"  },
                            ]}
                          />
                          {props.dividerType === "line-with-icon" && (
                            <StackedTextField
                              label="Icon or Emoji"
                              value={props.dividerIcon ?? "⭐"}
                              onChange={(v) => set("dividerIcon", v)}
                              placeholder="e.g., ⭐ or 🌟"
                            />
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* ── ADVANCED TAB ── */}
                  {tab === "advanced" && (
                    <>
                      <TabSection title="Spacing" />
                      <FourSideField
                        label="Margin (px)"
                        value={props.advMargin}
                        onChange={(v) => set("advMargin", v)}
                      />
                      <FourSideField
                        label="Padding (px)"
                        value={props.advPadding ?? { top: props.padding ?? 32, right: 0, bottom: props.padding ?? 32, left: 0 }}
                        onChange={(v) => set("advPadding", v)}
                      />

                      <TabSection title="Background" />
                      <InlineSelect
                        label="Type"
                        value={bgType}
                        onChange={(v) => set("advBgType", v)}
                        options={[
                          { value: "none", label: "None" },
                          { value: "color", label: "Color" },
                          { value: "gradient", label: "Gradient" },
                          { value: "image", label: "Image" },
                        ]}
                      />
                      {bgType === "color" && (
                        <ColorPickerField
                          label="Color"
                          value={props.backgroundColor ?? ""}
                          onChange={(v) => set("backgroundColor", v)}
                        />
                      )}
                      {bgType === "gradient" && (
                        <>
                          <ColorPickerField
                            label="Color 1"
                            value={props.advGradientColor1 ?? ""}
                            onChange={(v) => set("advGradientColor1", v)}
                          />
                          <ColorPickerField
                            label="Color 2"
                            value={props.advGradientColor2 ?? ""}
                            onChange={(v) => set("advGradientColor2", v)}
                          />
                          <StackedNumberField
                            label="Angle (deg)"
                            value={props.advGradientAngle ?? 135}
                            onChange={(v) => set("advGradientAngle", v)}
                            min={0} max={360} step={15}
                          />
                        </>
                      )}
                      {bgType === "image" && (
                        <StackedTextField
                          label="Image URL"
                          value={props.advBgImage ?? ""}
                          onChange={(v) => set("advBgImage", v)}
                          placeholder="https://..."
                        />
                      )}

                      <TabSection title="Border" />
                      <InlineSelect
                        label="Border Style"
                        value={props.advBorderStyle ?? "none"}
                        onChange={(v) => set("advBorderStyle", v)}
                        options={[
                          { value: "none", label: "None" },
                          { value: "solid", label: "Solid" },
                          { value: "dashed", label: "Dashed" },
                          { value: "dotted", label: "Dotted" },
                          { value: "double", label: "Double" },
                        ]}
                      />
                      {props.advBorderStyle && props.advBorderStyle !== "none" && (
                        <>
                          <FourSideField
                            label="Border Width (px)"
                            value={props.advBorderWidth}
                            onChange={(v) => set("advBorderWidth", v)}
                          />
                          <ColorPickerField
                            label="Border Color"
                            value={props.advBorderColor ?? ""}
                            onChange={(v) => set("advBorderColor", v)}
                          />
                        </>
                      )}
                      <FourSideField
                        label="Border Radius (px)"
                        value={props.advBorderRadius}
                        onChange={(v) => set("advBorderRadius", v)}
                      />


                      <TabSection title="Responsive" />
                      <ToggleField
                        label="Hide on Desktop"
                        value={!!props.hideDesktop}
                        onChange={(v) => set("hideDesktop", v)}
                      />
                      <ToggleField
                        label="Hide on Tablet"
                        value={!!props.hideTablet}
                        onChange={(v) => set("hideTablet", v)}
                      />
                      <ToggleField
                        label="Hide on Mobile"
                        value={!!props.hideMobile}
                        onChange={(v) => set("hideMobile", v)}
                      />

                      <StackedNumberField
                        label="Opacity (%)"
                        value={props.opacity ?? 100}
                        onChange={(v) => set("opacity", v)}
                        min={0} max={100} step={1}
                      />
                    </>
                  )}
                </>
              )}
            </BlockTabBar>
          );
        },
      },
    },

    defaultProps: {
      // Content
      title: "Heading",
      subtitle: "",
      level: 1,
      linkUrl: "",
      linkTarget: "_self",
      // Style – typography
      fontFamily: "inherit",
      fontSize: null,
      fontWeight: "700",
      fontStyle: "normal",
      textTransform: "none",
      textDecoration: "none",
      lineHeight: null,
      letterSpacing: null,
      // Style – color
      textColor: "",
      hoverColor: "",
      subtitleColor: "",
      subtitleSize: 18,
      // Style – text shadow
      // Style – alignment & divider
      alignment: "left",
      dividerType: "none",
      dividerColor: "",
      dividerLength: 60,
      dividerThickness: 3,
      dividerAlignment: "center",
      dividerIcon: "⭐",
      // Advanced – spacing
      advMargin: { top: 0, right: 0, bottom: 0, left: 0 },
      advPadding: { top: 32, right: 0, bottom: 32, left: 0 },
      // Advanced – background
      advBgType: "none",
      backgroundColor: "",
      advGradientColor1: "",
      advGradientColor2: "",
      advGradientAngle: 135,
      advBgImage: "",
      // Advanced – border
      advBorderStyle: "none",
      advBorderWidth: { top: 0, right: 0, bottom: 0, left: 0 },
      advBorderColor: "",
      advBorderRadius: { top: 0, right: 0, bottom: 0, left: 0 },
      // Advanced – shadow
      // Advanced – responsive
      hideDesktop: false,
      hideTablet: false,
      hideMobile: false,
      // Advanced – custom
      cssId: "",
      cssClass: "",
      customCss: "",
      zIndex: null,
      opacity: 100,
    },

    render: ({
      title,
      subtitle,
      subtitleColor,
      subtitleSize,
      level,
      alignment,
      textColor,
      backgroundColor,
      linkUrl,
      linkTarget,
      fontFamily,
      fontSize,
      fontWeight,
      fontStyle,
      textTransform,
      textDecoration,
      lineHeight,
      letterSpacing,
      hoverColor: _hoverColor,
      dividerType,
      dividerColor,
      dividerLength,
      dividerThickness,
      dividerAlignment,
      dividerIcon,
      advMargin,
      advPadding,
      advBgType,
      advGradientColor1,
      advGradientColor2,
      advGradientAngle,
      advBgImage,
      advBorderStyle,
      advBorderWidth,
      advBorderColor,
      advBorderRadius,
      hideDesktop,
      hideTablet,
      hideMobile,
      cssId,
      cssClass,
      customCss,
      zIndex,
      opacity,
    }) => {
      const Tag = `h${level || 1}` as keyof JSX.IntrinsicElements;

      // Background
      const bgStyle: React.CSSProperties = (() => {
        if (advBgType === "color")
          return { backgroundColor: backgroundColor || "transparent" };
        if (advBgType === "gradient" && advGradientColor1 && advGradientColor2)
          return { background: `linear-gradient(${advGradientAngle ?? 135}deg, ${advGradientColor1}, ${advGradientColor2})` };
        if (advBgType === "image" && advBgImage)
          return { backgroundImage: `url(${advBgImage})`, backgroundSize: "cover", backgroundPosition: "center" };
        return {};
      })();

      // Border
      const borderStyle: React.CSSProperties = advBorderStyle && advBorderStyle !== "none"
        ? {
            borderStyle: advBorderStyle,
            borderTopWidth:    advBorderWidth?.top    ?? 0,
            borderRightWidth:  advBorderWidth?.right  ?? 0,
            borderBottomWidth: advBorderWidth?.bottom ?? 0,
            borderLeftWidth:   advBorderWidth?.left   ?? 0,
            borderColor: advBorderColor || "currentColor",
          }
        : {};

      // Border radius
      const radiusStyle: React.CSSProperties = {
        borderTopLeftRadius:     advBorderRadius?.top    ?? 0,
        borderTopRightRadius:    advBorderRadius?.right  ?? 0,
        borderBottomRightRadius: advBorderRadius?.bottom ?? 0,
        borderBottomLeftRadius:  advBorderRadius?.left   ?? 0,
      };


      // Responsive hide classes
      const hideClasses = [
        hideDesktop ? "puck-hide-desktop" : "",
        hideTablet  ? "puck-hide-tablet"  : "",
        hideMobile  ? "puck-hide-mobile"  : "",
      ].filter(Boolean).join(" ");

      const defaultFontSize =
        level === 1 ? "var(--h1-size, 2.5rem)"
        : level === 2 ? "var(--h2-size, 2rem)"
        : level === 3 ? "var(--h3-size, 1.75rem)"
        : level === 4 ? "var(--h4-size, 1.5rem)"
        : level === 5 ? "var(--h5-size, 1.25rem)"
        : "var(--h6-size, 1rem)";

      const wrapperStyle: React.CSSProperties = {
        paddingTop:    advPadding?.top    ?? 32,
        paddingRight:  advPadding?.right  ?? 0,
        paddingBottom: advPadding?.bottom ?? 32,
        paddingLeft:   advPadding?.left   ?? 0,
        marginTop:    advMargin?.top    ?? 0,
        marginRight:  advMargin?.right  ?? 0,
        marginBottom: advMargin?.bottom ?? 0,
        marginLeft:   advMargin?.left   ?? 0,
        textAlign: alignment as any,
        zIndex: zIndex ?? undefined,
        opacity: opacity != null ? opacity / 100 : 1,
        ...bgStyle,
        ...borderStyle,
        ...radiusStyle,
      };

      const headingEl = (
        <Tag
          style={{
            fontSize: fontSize ? `${fontSize}px` : defaultFontSize,
            fontWeight: fontWeight ?? "700",
            fontFamily: fontFamily && fontFamily !== "inherit" ? fontFamily : "var(--heading-font)",
            fontStyle: fontStyle ?? "normal",
            textTransform: (textTransform ?? "none") as any,
            textDecoration: textDecoration ?? "none",
            lineHeight: lineHeight ?? "var(--heading-line-height, 1.2)",
            letterSpacing: letterSpacing != null ? `${letterSpacing}px` : undefined,
            color: textColor || "var(--primary-color)",
            margin: 0,
          }}
        >
          {title}
        </Tag>
      );

      return (
        <div
          id={cssId || undefined}
          className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined}
          style={wrapperStyle}
        >
          {customCss && <style>{`#${cssId || "heading-block"} { ${customCss} }`}</style>}
          {linkUrl
            ? <a href={linkUrl} target={linkTarget ?? "_self"} style={{ textDecoration: "none", color: "inherit" }}>{headingEl}</a>
            : headingEl
          }

          {subtitle && (
            <p style={{
              fontSize: subtitleSize ? `${subtitleSize}px` : "var(--base-font-size, 1rem)",
              color: subtitleColor || textColor || "var(--text-color)",
              marginTop: 8,
              opacity: 0.75,
            }}>
              {subtitle}
            </p>
          )}

          {dividerType && dividerType !== "none" && (
            <div style={{ marginTop: 16 }}>
              {dividerType === "line" && (
                <div style={{
                  height: dividerThickness || 3,
                  backgroundColor: dividerColor || textColor || "var(--primary-color)",
                  borderRadius: 2,
                  width: dividerLength || 60,
                  marginLeft: dividerAlignment === "right" ? "auto" : dividerAlignment === "center" ? "auto" : 0,
                  marginRight: dividerAlignment === "center" ? "auto" : dividerAlignment === "right" ? 0 : "auto",
                }} />
              )}
              {dividerType === "double-line" && (
                <div style={{
                  display: "flex", flexDirection: "column", gap: 6,
                  width: dividerLength || 60,
                  marginLeft: dividerAlignment === "right" ? "auto" : dividerAlignment === "center" ? "auto" : 0,
                  marginRight: dividerAlignment === "center" ? "auto" : dividerAlignment === "right" ? 0 : "auto",
                }}>
                  <div style={{ height: dividerThickness || 2, backgroundColor: dividerColor || textColor || "var(--primary-color)" }} />
                  <div style={{ height: dividerThickness || 2, backgroundColor: dividerColor || textColor || "var(--primary-color)" }} />
                </div>
              )}
              {dividerType === "line-with-icon" && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  justifyContent: dividerAlignment === "right" ? "flex-end" : dividerAlignment === "center" ? "center" : "flex-start",
                }}>
                  <div style={{ flex: 1, height: dividerThickness || 3, backgroundColor: dividerColor || textColor || "var(--primary-color)", maxWidth: dividerLength ? dividerLength / 4 : 30 }} />
                  <span style={{ fontSize: "1.5rem", whiteSpace: "nowrap" }}>{dividerIcon || "⭐"}</span>
                  <div style={{ flex: 1, height: dividerThickness || 3, backgroundColor: dividerColor || textColor || "var(--primary-color)", maxWidth: dividerLength ? dividerLength / 4 : 30 }} />
                </div>
              )}
            </div>
          )}
        </div>
      );
    },
  },

  Text: {
    label: "Text Editor",
    fields: {
      _tabs: {
        type: "custom",
        label: "",
        render: ({ value: _v, onChange: _onChange }: any) => {
          const { selectedItem, appState, dispatch } = usePuck();
          const props = selectedItem?.props ?? {};
          const set = (key: string, val: any) => {
            if (!selectedItem) return;
            const state = appState.data;
            let destinationZone = "root:default-zone";
            let destinationIndex = 0;
            const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
            for (const [zone, items] of Object.entries(zones)) {
              const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
              if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
            }
            dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...props, [key]: val } } });
          };

          const bgType = props.advBgType ?? "none";

          return (
            <BlockTabBar blockKey="Text">
              {(tab) => (
                <>
                  {/* ── CONTENT TAB ── */}
                  {tab === "content" && (
                    <>
                      <StackedTextareaField
                        label="Content"
                        value={props.title ?? ""}
                        onChange={(v) => set("title", v)}
                        placeholder="Enter text..."
                        rows={5}
                      />
                      <InlineSelect
                        label="Column Count"
                        value={String(props.columnCount ?? "1")}
                        onChange={(v) => set("columnCount", v)}
                        options={[
                          { value: "1", label: "1 Column" },
                          { value: "2", label: "2 Columns" },
                          { value: "3", label: "3 Columns" },
                        ]}
                      />
                      <StackedTextField
                        label="Column Gap"
                        value={props.columnGap ?? ""}
                        onChange={(v) => set("columnGap", v)}
                        placeholder="e.g. 24px or 1.5rem"
                      />
                    </>
                  )}

                  {/* ── STYLE TAB ── */}
                  {tab === "style" && (
                    <>
                      <TabSection title="Typography" />
                      <InlineSelect
                        label="Font Family"
                        value={props.fontFamily ?? "inherit"}
                        onChange={(v) => set("fontFamily", v)}
                        options={[
                          { value: "inherit", label: "Theme Default" },
                          { value: "serif", label: "Serif" },
                          { value: "sans-serif", label: "Sans-serif" },
                          { value: "monospace", label: "Monospace" },
                          { value: "Georgia, serif", label: "Georgia" },
                          { value: "Arial, sans-serif", label: "Arial" },
                          { value: "'Helvetica Neue', sans-serif", label: "Helvetica" },
                          { value: "'Courier New', monospace", label: "Courier New" },
                        ]}
                      />
                      <StackedNumberField
                        label="Font Size (px)"
                        value={props.fontSize ?? null}
                        onChange={(v) => set("fontSize", v)}
                        placeholder="e.g. 16"
                        min={8} max={120} step={1}
                      />
                      <InlineSelect
                        label="Font Weight"
                        value={String(props.fontWeight ?? "400")}
                        onChange={(v) => set("fontWeight", v)}
                        options={[
                          { value: "300", label: "300 – Light" },
                          { value: "400", label: "400 – Normal" },
                          { value: "500", label: "500 – Medium" },
                          { value: "600", label: "600 – Semi Bold" },
                          { value: "700", label: "700 – Bold" },
                        ]}
                      />
                      <InlineSelect
                        label="Font Style"
                        value={props.fontStyle ?? "normal"}
                        onChange={(v) => set("fontStyle", v)}
                        options={[
                          { value: "normal", label: "Normal" },
                          { value: "italic", label: "Italic" },
                        ]}
                      />
                      <StackedNumberField
                        label="Line Height"
                        value={props.lineHeight ?? null}
                        onChange={(v) => set("lineHeight", v)}
                        placeholder="e.g. 1.6"
                        min={0.8} max={5} step={0.05}
                      />
                      <StackedNumberField
                        label="Letter Spacing (px)"
                        value={props.letterSpacing ?? null}
                        onChange={(v) => set("letterSpacing", v)}
                        placeholder="e.g. 0.5"
                        min={-10} max={50} step={0.5}
                      />
                      <InlineSelect
                        label="Text Decoration"
                        value={props.textDecoration ?? "none"}
                        onChange={(v) => set("textDecoration", v)}
                        options={[
                          { value: "none", label: "None" },
                          { value: "underline", label: "Underline" },
                          { value: "line-through", label: "Line Through" },
                        ]}
                      />
                      <InlineSelect
                        label="Text Transform"
                        value={props.textTransform ?? "none"}
                        onChange={(v) => set("textTransform", v)}
                        options={[
                          { value: "none", label: "None" },
                          { value: "uppercase", label: "Uppercase" },
                          { value: "lowercase", label: "Lowercase" },
                          { value: "capitalize", label: "Capitalize" },
                        ]}
                      />

                      <TabSection title="Color" />
                      <ColorPickerField
                        label="Text Color"
                        value={props.textColor ?? ""}
                        onChange={(v) => set("textColor", v)}
                      />
                      <ColorPickerField
                        label="Link Color"
                        value={props.linkColor ?? ""}
                        onChange={(v) => set("linkColor", v)}
                      />
                      <ColorPickerField
                        label="Link Hover Color"
                        value={props.linkHoverColor ?? ""}
                        onChange={(v) => set("linkHoverColor", v)}
                      />

                      <TabSection title="Alignment" />
                      <AlignField
                        label="Text Align"
                        value={props.alignment ?? "left"}
                        onChange={(v) => set("alignment", v)}
                        options={[
                          { value: "left",    icon: <AlignLeft    size={15} />, title: "Left"    },
                          { value: "center",  icon: <AlignCenter  size={15} />, title: "Center"  },
                          { value: "right",   icon: <AlignRight   size={15} />, title: "Right"   },
                          { value: "justify", icon: <AlignJustify size={15} />, title: "Justify" },
                        ]}
                      />
                    </>
                  )}

                  {/* ── ADVANCED TAB ── */}
                  {tab === "advanced" && (
                    <>
                      <TabSection title="Spacing" />
                      <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                      <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 16, right: 0, bottom: 16, left: 0 }} onChange={(v) => set("advPadding", v)} />

                      <TabSection title="Background" />
                      <InlineSelect
                        label="Type"
                        value={bgType}
                        onChange={(v) => set("advBgType", v)}
                        options={[
                          { value: "none", label: "None" },
                          { value: "color", label: "Color" },
                          { value: "gradient", label: "Gradient" },
                        ]}
                      />
                      {bgType === "color" && (
                        <ColorPickerField label="Color" value={props.backgroundColor ?? ""} onChange={(v) => set("backgroundColor", v)} />
                      )}
                      {bgType === "gradient" && (
                        <>
                          <ColorPickerField label="Color 1" value={props.advGradientColor1 ?? ""} onChange={(v) => set("advGradientColor1", v)} />
                          <ColorPickerField label="Color 2" value={props.advGradientColor2 ?? ""} onChange={(v) => set("advGradientColor2", v)} />
                          <StackedNumberField label="Angle (deg)" value={props.advGradientAngle ?? 135} onChange={(v) => set("advGradientAngle", v)} min={0} max={360} step={15} />
                        </>
                      )}

                      <TabSection title="Border" />
                      <InlineSelect
                        label="Border Style"
                        value={props.advBorderStyle ?? "none"}
                        onChange={(v) => set("advBorderStyle", v)}
                        options={[
                          { value: "none", label: "None" },
                          { value: "solid", label: "Solid" },
                          { value: "dashed", label: "Dashed" },
                          { value: "dotted", label: "Dotted" },
                          { value: "double", label: "Double" },
                        ]}
                      />
                      {props.advBorderStyle && props.advBorderStyle !== "none" && (
                        <>
                          <FourSideField label="Border Width (px)" value={props.advBorderWidth} onChange={(v) => set("advBorderWidth", v)} />
                          <ColorPickerField label="Border Color" value={props.advBorderColor ?? ""} onChange={(v) => set("advBorderColor", v)} />
                        </>
                      )}
                      <FourSideField label="Border Radius (px)" value={props.advBorderRadius} onChange={(v) => set("advBorderRadius", v)} />


                      <TabSection title="Responsive" />
                      <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                      <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
                      <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />

                      <StackedNumberField label="Opacity (%)" value={props.opacity ?? 100} onChange={(v) => set("opacity", v)} min={0} max={100} step={1} />
                    </>
                  )}
                </>
              )}
            </BlockTabBar>
          );
        },
      },
    },

    defaultProps: {
      title: "Enter your text here.",
      columnCount: "1",
      columnGap: "",
      fontFamily: "inherit",
      fontSize: null,
      fontWeight: "400",
      fontStyle: "normal",
      lineHeight: null,
      letterSpacing: null,
      textDecoration: "none",
      textTransform: "none",
      textColor: "",
      linkColor: "",
      linkHoverColor: "",
      alignment: "left",
      backgroundColor: "",
      advBgType: "none",
      advGradientColor1: "",
      advGradientColor2: "",
      advGradientAngle: 135,
      advMargin: { top: 0, right: 0, bottom: 0, left: 0 },
      advPadding: { top: 16, right: 0, bottom: 16, left: 0 },
      advBorderStyle: "none",
      advBorderWidth: { top: 0, right: 0, bottom: 0, left: 0 },
      advBorderColor: "",
      advBorderRadius: { top: 0, right: 0, bottom: 0, left: 0 },
      hideDesktop: false,
      hideTablet: false,
      hideMobile: false,
      cssId: "",
      cssClass: "",
      customCss: "",
      zIndex: null,
      opacity: 100,
    },

    render: ({
      title,
      columnCount,
      columnGap,
      fontFamily,
      fontSize,
      fontWeight,
      fontStyle,
      lineHeight,
      letterSpacing,
      textDecoration,
      textTransform,
      textColor,
      linkColor,
      linkHoverColor: _linkHoverColor,
      alignment,
      backgroundColor,
      advBgType,
      advGradientColor1,
      advGradientColor2,
      advGradientAngle,
      advMargin,
      advPadding,
      advBorderStyle,
      advBorderWidth,
      advBorderColor,
      advBorderRadius,
      hideDesktop,
      hideTablet,
      hideMobile,
      cssId,
      cssClass,
      customCss,
      zIndex,
      opacity,
    }) => {
      const bgStyle: React.CSSProperties = (() => {
        if (advBgType === "color") return { backgroundColor: backgroundColor || "transparent" };
        if (advBgType === "gradient" && advGradientColor1 && advGradientColor2)
          return { background: `linear-gradient(${advGradientAngle ?? 135}deg, ${advGradientColor1}, ${advGradientColor2})` };
        return {};
      })();

      const borderStyle: React.CSSProperties = advBorderStyle && advBorderStyle !== "none"
        ? { borderStyle: advBorderStyle, borderTopWidth: advBorderWidth?.top ?? 0, borderRightWidth: advBorderWidth?.right ?? 0, borderBottomWidth: advBorderWidth?.bottom ?? 0, borderLeftWidth: advBorderWidth?.left ?? 0, borderColor: advBorderColor || "currentColor" }
        : {};

      const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");

      const cols = parseInt(String(columnCount ?? "1"), 10) || 1;
      const colStyle: React.CSSProperties = cols > 1
        ? { columnCount: cols, columnGap: columnGap || "1.5rem" }
        : {};

      return (
        <div
          id={cssId || undefined}
          className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined}
          style={{
            paddingTop: advPadding?.top ?? 16, paddingRight: advPadding?.right ?? 0,
            paddingBottom: advPadding?.bottom ?? 16, paddingLeft: advPadding?.left ?? 0,
            marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0,
            marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0,
            zIndex: zIndex ?? undefined,
            opacity: opacity != null ? opacity / 100 : 1,
            borderTopLeftRadius: advBorderRadius?.top ?? 0,
            borderTopRightRadius: advBorderRadius?.right ?? 0,
            borderBottomRightRadius: advBorderRadius?.bottom ?? 0,
            borderBottomLeftRadius: advBorderRadius?.left ?? 0,
            ...bgStyle,
            ...borderStyle,
          }}
        >
          {customCss && <style>{`#${cssId || "text-block"} { ${customCss} }`}</style>}
          {linkColor && <style>{`.text-block-links-${cssId || "default"} a { color: ${linkColor}; }`}</style>}
          <p
            className={linkColor ? `text-block-links-${cssId || "default"}` : undefined}
            style={{
              textAlign: alignment as any,
              fontSize: fontSize ? `${fontSize}px` : "var(--base-font-size, 1rem)",
              fontWeight: fontWeight || 400,
              fontFamily: fontFamily && fontFamily !== "inherit" ? fontFamily : "var(--font-family)",
              fontStyle: fontStyle ?? "normal",
              lineHeight: lineHeight ?? "var(--line-height, 1.6)",
              letterSpacing: letterSpacing != null ? `${letterSpacing}px` : undefined,
              textDecoration: textDecoration ?? "none",
              textTransform: (textTransform ?? "none") as any,
              color: textColor || "var(--text-color)",
              margin: 0,
              ...colStyle,
            }}
          >
            {title}
          </p>
        </div>
      );
    },
  },

  Article: {
    label: "Article Block",
    fields: {
      // ── Content ────────────────────────────────────────────────────────
      articleTitle: {
        type: "custom",
        label: "Article Title",
        render: ({ value, onChange }) => (
          <StackedTextField label="Article Title" value={value ?? ""} onChange={onChange} placeholder="Enter article title..." />
        ),
      },
      author: {
        type: "custom",
        label: "Author",
        render: ({ value, onChange }) => (
          <StackedTextField label="Author" value={value ?? ""} onChange={onChange} placeholder="e.g., Jane Smith" />
        ),
      },
      showAuthor: {
        type: "custom",
        label: "Show Author",
        render: ({ value, onChange }) => (
          <ToggleField value={value !== false} onChange={onChange} label="Show Author" />
        ),
      },
      publishDate: {
        type: "custom",
        label: "Published Date",
        render: ({ value, onChange }) => (
          <StackedDateField label="Published Date" value={value ?? ""} onChange={onChange} />
        ),
      },
      showDate: {
        type: "custom",
        label: "Show Date",
        render: ({ value, onChange }) => (
          <ToggleField value={value !== false} onChange={onChange} label="Show Date" />
        ),
      },
      body: {
        type: "richtext",
      },
      // ── Featured Image ──────────────────────────────────────────────────
      featuredImage: { ...imageUploadField, label: "Featured Image" },
      imagePosition: {
        type: "custom",
        label: "Featured Image Position",
        render: ({ value, onChange }) => (
          <AlignField
            value={value ?? "top"}
            onChange={onChange}
            label="Featured Image Position"
            options={[
              { value: "top",   title: "Top"   },
              { value: "left",  icon: <PanelLeft  size={15} />, title: "Left"  },
              { value: "right", icon: <PanelRight size={15} />, title: "Right" },
            ]}
          />
        ),
      },
      imageStyle: {
        type: "custom",
        label: "Image Style",
        render: ({ value, onChange }) => (
          <AlignField
            value={value ?? "none"}
            onChange={onChange}
            label="Image Style"
            options={[
              { value: "none",      title: "Original" },
              { value: "rectangle", title: "Rect"     },
              { value: "square",    icon: <Square size={15} />, title: "Square" },
              { value: "circle",    icon: <Circle size={15} />, title: "Circle" },
            ]}
          />
        ),
      },
      imageHeight: {
        type: "custom",
        label: "Image Height (px)",
        render: ({ value, onChange }) => (
          <StackedNumberField label="Image Height (px)" value={value ?? 400} onChange={onChange} placeholder="e.g., 400" min={60} max={900} />
        ),
      },
      imageBorderRadius: {
        type: "custom",
        label: "Image Border Radius (px)",
        render: ({ value, onChange }) => (
          <StackedNumberField label="Image Border Radius (px)" value={value ?? 8} onChange={onChange} placeholder="e.g., 8" min={0} max={200} />
        ),
      },
      // ── Typography ──────────────────────────────────────────────────────
      titleAlign: {
        type: "custom",
        label: "Title Alignment",
        render: ({ value, onChange }) => (
          <AlignField
            value={value ?? "left"}
            onChange={onChange}
            label="Title Alignment"
            options={[
              { value: "left",   icon: <AlignLeft   size={15} />, title: "Left"   },
              { value: "center", icon: <AlignCenter size={15} />, title: "Center" },
              { value: "right",  icon: <AlignRight  size={15} />, title: "Right"  },
            ]}
          />
        ),
      },
      lineHeight: {
        type: "custom",
        label: "Line Height",
        render: ({ value, onChange }) => (
          <StackedNumberField label="Line Height" value={value ?? 1.75} onChange={onChange} placeholder="e.g., 1.75" min={1} max={4} step={0.1} />
        ),
      },
      letterSpacing: {
        type: "custom",
        label: "Letter Spacing (px)",
        render: ({ value, onChange }) => (
          <StackedNumberField label="Letter Spacing (px)" value={value ?? 0} onChange={onChange} placeholder="e.g., 0" min={-2} max={10} step={0.1} />
        ),
      },
      titleFontWeight: {
        type: "custom",
        label: "Title Font Weight",
        render: ({ value, onChange }) => (
          <AlignField
            value={String(value ?? "700")}
            onChange={onChange}
            label="Title Font Weight"
            options={[
              { value: "400", title: "400" },
              { value: "600", title: "600" },
              { value: "700", title: "700" },
              { value: "800", title: "800" },
            ]}
          />
        ),
      },
      metaFontWeight: {
        type: "custom",
        label: "Meta Font Weight",
        render: ({ value, onChange }) => (
          <AlignField
            value={String(value ?? "400")}
            onChange={onChange}
            label="Meta Font Weight"
            options={[
              { value: "400", title: "400" },
              { value: "500", title: "500" },
              { value: "600", title: "600" },
            ]}
          />
        ),
      },
      bodyFontWeight: {
        type: "custom",
        label: "Body Font Weight",
        render: ({ value, onChange }) => (
          <AlignField
            value={String(value ?? "400")}
            onChange={onChange}
            label="Body Font Weight"
            options={[
              { value: "400", title: "400" },
              { value: "500", title: "500" },
              { value: "600", title: "600" },
            ]}
          />
        ),
      },
      // ── Colors ──────────────────────────────────────────────────────────
      backgroundColor: {
        type: "custom",
        label: "Background Color",
        render: ({ value, onChange }) => (
          <ColorPickerField label="Background Color" value={value ?? ""} onChange={onChange} />
        ),
      },
      titleColor: {
        type: "custom",
        label: "Title Color",
        render: ({ value, onChange }) => (
          <ColorPickerField label="Title Color" value={value ?? ""} onChange={onChange} />
        ),
      },
      bodyColor: {
        type: "custom",
        label: "Body Color",
        render: ({ value, onChange }) => (
          <ColorPickerField label="Body Color" value={value ?? ""} onChange={onChange} />
        ),
      },
      metaColor: {
        type: "custom",
        label: "Meta Color",
        render: ({ value, onChange }) => (
          <ColorPickerField label="Meta Color" value={value ?? ""} onChange={onChange} />
        ),
      },
      // ── Layout ──────────────────────────────────────────────────────────
      contentWidth: {
        type: "custom",
        label: "Content Width",
        render: ({ value, onChange }) => (
          <AlignField
            value={value ?? "medium"}
            onChange={onChange}
            label="Content Width"
            options={[
              { value: "small",  title: "S" },
              { value: "medium", title: "M" },
              { value: "large",  title: "L" },
            ]}
          />
        ),
      },
    },

    defaultProps: {
      articleTitle: "Article Title",
      author: "Jane Smith",
      showAuthor: true,
      publishDate: "",
      showDate: true,
      body: "<p></p>",
      featuredImage: "",
      imagePosition: "top",
      imageStyle: "none",
      imageHeight: 400,
      imageBorderRadius: 8,
      titleAlign: "left",
      lineHeight: 1.75,
      letterSpacing: 0,
      titleFontWeight: "700",
      metaFontWeight: "400",
      bodyFontWeight: "400",
      backgroundColor: "",
      titleColor: "",
      bodyColor: "",
      metaColor: "",
      contentWidth: "medium",
    },

    render: ({
      articleTitle, author, showAuthor, publishDate, showDate, body,
      featuredImage, imagePosition, imageStyle, imageHeight, imageBorderRadius,
      titleAlign, lineHeight, letterSpacing,
      titleFontWeight, metaFontWeight, bodyFontWeight,
      backgroundColor, titleColor, bodyColor, metaColor, contentWidth,
    }) => {
      const maxWidthMap: Record<string, number> = { small: 680, medium: 860, large: 1100 };
      const maxWidth = maxWidthMap[contentWidth ?? "medium"] ?? 860;
      const radius = imageBorderRadius ?? 8;
      const imgH = imageHeight ?? 400;
      const isHorizontal = imagePosition === "left" || imagePosition === "right";

      const imgStyle: React.CSSProperties =
        imageStyle === "circle"
          ? { width: imgH, height: imgH, borderRadius: "50%", objectFit: "cover", display: "block" }
          : imageStyle === "square"
          ? { width: "100%", aspectRatio: "1/1", height: imgH, borderRadius: radius, objectFit: "cover", display: "block" }
          : imageStyle === "rectangle"
          ? { width: "100%", aspectRatio: "16/9", borderRadius: radius, objectFit: "cover", display: "block" }
          : { width: "100%", height: imgH, borderRadius: radius, objectFit: "cover", display: "block" };

      const formatDate = (d: string) => {
        if (!d) return "";
        const parsed = new Date(d);
        return isNaN(parsed.getTime()) ? d : parsed.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      };

      const imageBox = featuredImage ? (
        <div style={{
          flexShrink: 0,
          minWidth: 0,
          width: isHorizontal ? (imageStyle === "circle" ? "auto" : "44%") : "100%",
          marginBottom: isHorizontal ? 0 : 32,
        }}>
          <img src={featuredImage} alt={articleTitle || "Featured image"} style={imgStyle} />
        </div>
      ) : null;

      const metaVisible = (showAuthor !== false && !!author) || (showDate !== false && !!publishDate);

      const articleContent = (
        <div style={{ flex: 1, minWidth: 0 }}>
          {articleTitle && (
            <h1 style={{
              fontSize: "2.25rem",
              fontWeight: Number(titleFontWeight ?? 700),
              fontFamily: "var(--heading-font)",
              color: titleColor || "var(--primary-color)",
              textAlign: titleAlign as React.CSSProperties["textAlign"],
              lineHeight: lineHeight ?? 1.2,
              letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined,
              marginBottom: 10,
            }}>
              {articleTitle}
            </h1>
          )}
          {metaVisible && (
            <div style={{
              display: "flex",
              gap: 12,
              fontSize: 13,
              color: metaColor || "var(--text-color)",
              opacity: 0.75,
              marginBottom: 28,
              flexWrap: "wrap",
              fontWeight: Number(metaFontWeight ?? 400),
              justifyContent: titleAlign === "center" ? "center" : titleAlign === "right" ? "flex-end" : "flex-start",
            }}>
              {showAuthor !== false && author && <span>By <strong>{author}</strong></span>}
              {showDate !== false && publishDate && <span>{formatDate(publishDate)}</span>}
            </div>
          )}
          <div style={{
            fontSize: "var(--base-font-size, 1rem)",
            lineHeight: lineHeight ?? 1.75,
            color: bodyColor || "var(--text-color)",
            fontWeight: Number(bodyFontWeight ?? 400),
            letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined,
          }}>
            {body}
          </div>
        </div>
      );

      return (
        <div style={{ padding: "48px 24px", backgroundColor: backgroundColor || "transparent" }}>
          <div style={{ maxWidth, margin: "0 auto" }}>
            {isHorizontal ? (
              <div style={{
                display: "flex",
                flexDirection: imagePosition === "left" ? "row" : "row-reverse",
                gap: 48,
                alignItems: "flex-start",
              }}>
                {imageBox}
                {articleContent}
              </div>
            ) : (
              <>
                {imageBox}
                {articleContent}
              </>
            )}
          </div>
        </div>
      );
    },
  },

  // ─── About Section ───────────────────────────────────────────────────────

  AboutSection: {
    label: "About",
    fields: {
      // ── Content ──────────────────────────────────────────────────────────
      badge: {
        type: "custom",
        label: "Badge",
        render: ({ value, onChange }) => (
          <StackedTextField label="Badge" value={value ?? ""} onChange={onChange} placeholder="e.g., About Us" />
        ),
      },
      title: {
        type: "custom",
        label: "Title",
        render: ({ value, onChange }) => (
          <StackedTextField label="Title" value={value ?? ""} onChange={onChange} placeholder="Enter section title..." />
        ),
      },
      subtitle: {
        type: "custom",
        label: "Subtitle",
        render: ({ value, onChange }) => (
          <StackedTextField label="Subtitle" value={value ?? ""} onChange={onChange} placeholder="Enter subtitle..." />
        ),
      },
      description: {
        type: "custom",
        label: "Description",
        render: ({ value, onChange }) => (
          <StackedTextareaField label="Description" value={value ?? ""} onChange={onChange} placeholder="Enter description..." rows={4} />
        ),
      },
      stats: {
        type: "array",
        label: "Stats",
        getItemSummary: (item) => item.label || "Stat",
        arrayFields: {
          value: {
            type: "custom",
            label: "Value",
            render: ({ value, onChange }) => (
              <StackedTextField label="Value" value={value ?? ""} onChange={onChange} placeholder="e.g., 500+" />
            ),
          },
          label: {
            type: "custom",
            label: "Label",
            render: ({ value, onChange }) => (
              <StackedTextField label="Label" value={value ?? ""} onChange={onChange} placeholder="e.g., Projects Done" />
            ),
          },
        },
      },
      primaryButtonLabel: {
        type: "custom",
        label: "Primary Button Label",
        render: ({ value, onChange }) => (
          <StackedTextField label="Primary Button Label" value={value ?? ""} onChange={onChange} placeholder="e.g., Learn More" />
        ),
      },
      primaryButtonLink: {
        type: "custom",
        label: "Primary Button URL",
        render: ({ value, onChange }) => (
          <StackedTextField label="Primary Button URL" value={value ?? ""} onChange={onChange} placeholder="e.g., /about" />
        ),
      },
      secondaryButtonLabel: {
        type: "custom",
        label: "Secondary Button Label",
        render: ({ value, onChange }) => (
          <StackedTextField label="Secondary Button Label" value={value ?? ""} onChange={onChange} placeholder="e.g., Contact Us" />
        ),
      },
      secondaryButtonLink: {
        type: "custom",
        label: "Secondary Button URL",
        render: ({ value, onChange }) => (
          <StackedTextField label="Secondary Button URL" value={value ?? ""} onChange={onChange} placeholder="e.g., /contact" />
        ),
      },
      // ── Image ────────────────────────────────────────────────────────────
      image: {
        type: "object",
        label: "Image",
        objectFields: {
          url: imageUploadField,
        },
      },
      imagePosition: {
        type: "custom",
        label: "Image Position",
        render: ({ value, onChange }) => (
          <AlignField
            value={value ?? "right"}
            onChange={onChange}
            label="Image Position"
            options={[
              { value: "left",  icon: <PanelLeft  size={15} />, title: "Left"  },
              { value: "right", icon: <PanelRight size={15} />, title: "Right" },
              { value: "top",   icon: <ArrowUp    size={15} />, title: "Top"   },
            ]}
          />
        ),
      },
      imageStyle: {
        type: "custom",
        label: "Image Style",
        render: ({ value, onChange }) => (
          <AlignField
            value={value ?? "rounded"}
            onChange={onChange}
            label="Image Style"
            options={[
              { value: "square",  icon: <Square size={15} />, title: "Square"  },
              { value: "rounded", title: "Rounded" },
              { value: "circle",  icon: <Circle size={15} />, title: "Circle"  },
            ]}
          />
        ),
      },
      imageRadius: {
        type: "custom",
        label: "Image Corner Radius (px)",
        render: ({ value, onChange }) => (
          <StackedNumberField label="Image Corner Radius (px)" value={value ?? 16} onChange={onChange} placeholder="e.g., 16" min={0} max={80} />
        ),
      },
      imageHeight: {
        type: "custom",
        label: "Image Height (px)",
        render: ({ value, onChange }) => (
          <StackedNumberField label="Image Height (px)" value={value ?? 460} onChange={onChange} placeholder="e.g., 460" min={120} max={900} />
        ),
      },
      // ── Layout ───────────────────────────────────────────────────────────
      textAlign: {
        type: "custom",
        label: "Text Alignment",
        render: ({ value, onChange }) => (
          <AlignField
            value={value ?? "left"}
            onChange={onChange}
            label="Text Alignment"
            options={[
              { value: "left",   icon: <AlignLeft   size={15} />, title: "Left"   },
              { value: "center", icon: <AlignCenter size={15} />, title: "Center" },
              { value: "right",  icon: <AlignRight  size={15} />, title: "Right"  },
            ]}
          />
        ),
      },
      verticalAlign: {
        type: "custom",
        label: "Vertical Alignment",
        render: ({ value, onChange }) => (
          <AlignField
            value={value ?? "center"}
            onChange={onChange}
            label="Vertical Alignment"
            options={[
              { value: "top",    icon: <AlignVerticalJustifyStart  size={15} />, title: "Top"    },
              { value: "center", icon: <AlignVerticalJustifyCenter size={15} />, title: "Center" },
              { value: "bottom", icon: <AlignVerticalJustifyEnd    size={15} />, title: "Bottom" },
            ]}
          />
        ),
      },
      columnGap: {
        type: "custom",
        label: "Column Gap (px)",
        render: ({ value, onChange }) => (
          <StackedNumberField label="Column Gap (px)" value={value ?? 64} onChange={onChange} placeholder="e.g., 64" min={0} max={160} />
        ),
      },
      maxWidth: {
        type: "custom",
        label: "Max Width (px)",
        render: ({ value, onChange }) => (
          <StackedNumberField label="Max Width (px)" value={value ?? 1200} onChange={onChange} placeholder="e.g., 1200" min={480} max={1600} />
        ),
      },
      padding: {
        type: "custom",
        label: "Padding (px)",
        render: ({ value, onChange }) => (
          <StackedNumberField label="Padding (px)" value={value ?? 80} onChange={onChange} placeholder="e.g., 80" min={0} max={240} />
        ),
      },
      showStats: {
        type: "custom",
        label: "Show Stats",
        render: ({ value, onChange }) => (
          <ToggleField value={value !== false} onChange={onChange} label="Show Stats" />
        ),
      },
      // ── Style / Colors ───────────────────────────────────────────────────
      backgroundColor: {
        type: "custom",
        label: "Background Color",
        render: ({ value, onChange }) => (
          <ColorPickerField label="Background Color" value={value ?? ""} onChange={onChange} />
        ),
      },
      badgeColor: {
        type: "custom",
        label: "Badge Color",
        render: ({ value, onChange }) => (
          <ColorPickerField label="Badge Color" value={value ?? ""} onChange={onChange} />
        ),
      },
      titleColor: {
        type: "custom",
        label: "Title Color",
        render: ({ value, onChange }) => (
          <ColorPickerField label="Title Color" value={value ?? ""} onChange={onChange} />
        ),
      },
      subtitleColor: {
        type: "custom",
        label: "Subtitle Color",
        render: ({ value, onChange }) => (
          <ColorPickerField label="Subtitle Color" value={value ?? ""} onChange={onChange} />
        ),
      },
      descriptionColor: {
        type: "custom",
        label: "Description Color",
        render: ({ value, onChange }) => (
          <ColorPickerField label="Description Color" value={value ?? ""} onChange={onChange} />
        ),
      },
      statValueColor: {
        type: "custom",
        label: "Stat Value Color",
        render: ({ value, onChange }) => (
          <ColorPickerField label="Stat Value Color" value={value ?? ""} onChange={onChange} />
        ),
      },
      statLabelColor: {
        type: "custom",
        label: "Stat Label Color",
        render: ({ value, onChange }) => (
          <ColorPickerField label="Stat Label Color" value={value ?? ""} onChange={onChange} />
        ),
      },
      buttonColor: {
        type: "custom",
        label: "Button Color",
        render: ({ value, onChange }) => (
          <ColorPickerField label="Button Color" value={value ?? ""} onChange={onChange} />
        ),
      },
      buttonTextColor: {
        type: "custom",
        label: "Button Text Color",
        render: ({ value, onChange }) => (
          <ColorPickerField label="Button Text Color" value={value ?? ""} onChange={onChange} />
        ),
      },
    },
    defaultProps: {
      badge: "About Us",
      title: "We Are a Creative Team",
      subtitle: "Who We Are",
      description:
        "We are a team of passionate designers and developers who create amazing digital experiences. Our mission is to help businesses grow online with beautiful, functional websites.",
      stats: [
        { value: "500+", label: "Projects Done" },
        { value: "200+", label: "Happy Clients" },
        { value: "10+", label: "Years Experience" },
        { value: "15", label: "Team Members" },
      ],
      primaryButtonLabel: "Learn More",
      primaryButtonLink: "#",
      secondaryButtonLabel: "",
      secondaryButtonLink: "",
      image: { url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80" },
      imagePosition: "right",
      imageStyle: "rounded",
      imageRadius: 16,
      imageHeight: 460,
      imageShadow: false,
      textAlign: "left",
      verticalAlign: "center",
      columnGap: 64,
      maxWidth: 1200,
      padding: 80,
      showStats: true,
      backgroundColor: "#ffffff",
      badgeColor: "",
      titleColor: "",
      subtitleColor: "",
      descriptionColor: "",
      statValueColor: "",
      statLabelColor: "",
      buttonColor: "",
      buttonTextColor: "",
    },
    render: ({
      badge, title, subtitle, description, stats,
      primaryButtonLabel, primaryButtonLink, secondaryButtonLabel, secondaryButtonLink,
      image, imagePosition, imageStyle, imageRadius, imageHeight, imageShadow,
      textAlign, verticalAlign, columnGap, maxWidth, padding, showStats,
      backgroundColor, badgeColor, titleColor, subtitleColor, descriptionColor,
      statValueColor, statLabelColor, buttonColor, buttonTextColor,
    }) => {
      const url = image?.url || "";
      const isTop = imagePosition === "top";
      const isLeft = imagePosition === "left";
      const radius = imageStyle === "circle" ? "50%" : imageStyle === "square" ? "0px" : `${imageRadius ?? 16}px`;
      const vAlign = verticalAlign === "top" ? "flex-start" : verticalAlign === "bottom" ? "flex-end" : "center";
      const justifyRow = textAlign === "center" ? "center" : textAlign === "right" ? "flex-end" : "flex-start";
      const itemsAlign = textAlign === "center" ? "center" : textAlign === "right" ? "flex-end" : "flex-start";
      const accent = buttonColor || "var(--primary-color)";
      const btnText = buttonTextColor || "#ffffff";

      const imageEl = url ? (
        <img
          src={url}
          alt={title || "About"}
          style={{
            width: imageStyle === "circle" ? (imageHeight ?? 460) : "100%",
            height: imageHeight ?? 460,
            maxWidth: "100%",
            objectFit: "cover",
            display: "block",
            borderRadius: radius,
            margin: isTop || imageStyle === "circle" ? "0 auto" : undefined,
            boxShadow: imageShadow ? "0 20px 45px rgba(0,0,0,0.18)" : "none",
          }}
        />
      ) : null;

      const contentEl = (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: itemsAlign,
          textAlign,
          minWidth: 0,
        }}>
          {badge && (
            <span style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: badgeColor || "var(--primary-color)", marginBottom: 12 }}>
              {badge}
            </span>
          )}
          {subtitle && (
            <p style={{ fontSize: 16, color: subtitleColor || "var(--secondary-color)", marginBottom: 8 }}>{subtitle}</p>
          )}
          {title && (
            <h2 style={{ fontSize: "var(--h2-size, 2rem)", fontWeight: "var(--heading-weight, 700)", fontFamily: "var(--heading-font)", color: titleColor || "var(--primary-color)", lineHeight: "var(--heading-line-height, 1.2)", marginBottom: 16 }}>
              {title}
            </h2>
          )}
          {description && (
            <p style={{ fontSize: "var(--base-font-size, 1rem)", lineHeight: "var(--line-height, 1.7)", color: descriptionColor || "var(--text-color)", marginBottom: 32 }}>
              {description}
            </p>
          )}
          {showStats !== false && stats && stats.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`, gap: 16, marginBottom: 32, padding: "24px 0", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", width: "100%" }}>
              {stats.map((stat, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.75rem", fontWeight: 700, color: statValueColor || "var(--primary-color)", lineHeight: 1.1 }}>{stat.value}</div>
                  <div style={{ fontSize: "0.8rem", color: statLabelColor || "var(--text-color)", opacity: 0.7, marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}
          {(primaryButtonLabel || secondaryButtonLabel) && (
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: justifyRow }}>
              {primaryButtonLabel && (
                <a href={primaryButtonLink || "#"} style={{ display: "inline-block", backgroundColor: accent, color: btnText, padding: "12px 28px", borderRadius: "var(--button-border-radius, 8px)", fontWeight: 600, textDecoration: "none", fontSize: "var(--base-font-size, 1rem)" }}>
                  {primaryButtonLabel}
                </a>
              )}
              {secondaryButtonLabel && (
                <a href={secondaryButtonLink || "#"} style={{ display: "inline-block", backgroundColor: "transparent", color: accent, padding: "12px 28px", borderRadius: "var(--button-border-radius, 8px)", fontWeight: 600, textDecoration: "none", fontSize: "var(--base-font-size, 1rem)", border: `2px solid ${accent}` }}>
                  {secondaryButtonLabel}
                </a>
              )}
            </div>
          )}
        </div>
      );

      return (
        <section style={{ backgroundColor: backgroundColor || "#ffffff", padding: `${padding ?? 80}px 0` }}>
          <div style={{ maxWidth: maxWidth ?? 1200, margin: "0 auto", padding: "0 24px" }}>
            {isTop ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 40, alignItems: textAlign === "center" ? "center" : itemsAlign }}>
                {imageEl}
                {contentEl}
              </div>
            ) : (
              <div
                className="pb-grid-2col"
                style={{
                  display: "grid",
                  gridTemplateColumns: url ? "1fr 1fr" : "1fr",
                  gap: columnGap ?? 64,
                  alignItems: vAlign,
                }}
              >
                <div style={{ order: isLeft ? 0 : 1, minWidth: 0 }}>{imageEl}</div>
                <div style={{ order: isLeft ? 1 : 0, minWidth: 0 }}>{contentEl}</div>
              </div>
            )}
          </div>
        </section>
      );
    },
  },

  // ─── Gallery Section ─────────────────────────────────────────────────────

  GallerySection: {
    label: "Gallery",
    fields: {
      title: {
        type: "custom",

        label: "Title",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Title"
            value={value}
            onChange={onChange}
            placeholder="Enter gallery title..."
          />
        ),
      },

      subtitle: {
        type: "custom",

        label: "Subtitle",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Subtitle"
            value={value}
            onChange={onChange}
            placeholder="Enter subtitle..."
          />
        ),
      },

      columns: {
        type: "custom",

        label: "Columns",

        render: ({ value, onChange }) => (
          <ColumnsField
            value={value}
            onChange={onChange}
            label="Columns"
            options={[{ value: 2 }, { value: 3 }, { value: 4 }]}
          />
        ),
      },

      gap: {
        type: "custom",

        label: "Gap (px)",

        render: ({ value, onChange }) => (
          <StackedNumberField
            label="Gap (px)"
            value={value}
            onChange={onChange}
            placeholder="e.g., 16"
          />
        ),
      },

      images: {
        type: "array",

        label: "Images",

        getItemSummary: (item) => item.caption || item.alt || "Image",

        arrayFields: {
          url: imageUploadField,

          caption: {
            type: "custom",

            label: "Caption",

            render: ({ value, onChange }) => (
              <StackedTextField
                label="Caption"
                value={value}
                onChange={onChange}
                placeholder="Image caption..."
              />
            ),
          },

          alt: {
            type: "custom",

            label: "Alt Text",

            render: ({ value, onChange }) => (
              <StackedTextField
                label="Alt Text"
                value={value}
                onChange={onChange}
                placeholder="Describe the image..."
              />
            ),
          },
        },
      },

      backgroundColor: {
        type: "custom",

        label: "Background Color",

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Background Color"
            value={value}
            onChange={onChange}
          />
        ),
      },

      textColor: {
        type: "custom",

        label: "Text Color",

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Text Color"
            value={value}
            onChange={onChange}
          />
        ),
      },

      padding: {
        type: "custom",

        label: "Padding (px)",

        render: ({ value, onChange }) => (
          <StackedNumberField
            label="Padding (px)"
            value={value}
            onChange={onChange}
            placeholder="e.g., 80"
            min={0}
          />
        ),
      },
    },

    defaultProps: {
      title: "Our Gallery",

      subtitle: "A Glimpse of Our Work",

      columns: 3,

      gap: 16,

      images: [
        {
          url: "https://picsum.photos/seed/gallery1/400/300",
          caption: "Project 1",
          alt: "Project 1",
        },

        {
          url: "https://picsum.photos/seed/gallery2/400/300",
          caption: "Project 2",
          alt: "Project 2",
        },

        {
          url: "https://picsum.photos/seed/gallery3/400/300",
          caption: "Project 3",
          alt: "Project 3",
        },

        {
          url: "https://picsum.photos/seed/gallery4/400/300",
          caption: "Project 4",
          alt: "Project 4",
        },

        {
          url: "https://picsum.photos/seed/gallery5/400/300",
          caption: "Project 5",
          alt: "Project 5",
        },

        {
          url: "https://picsum.photos/seed/gallery6/400/300",
          caption: "Project 6",
          alt: "Project 6",
        },
      ],

      backgroundColor: "#f8fafc",

      textColor: "#1f2937",

      padding: 80,
    },

    render: ({
      title,
      subtitle,
      columns,
      gap,
      images,
      backgroundColor,
      textColor,
      padding,
    }) => (
      <>
        <section style={{ backgroundColor, padding: `${padding}px 0` }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            {(title || subtitle) && (
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                {subtitle && (
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: textColor || "var(--primary-color)",
                      marginBottom: 8,
                    }}
                  >
                    {subtitle}
                  </p>
                )}

                {title && (
                  <h2
                    style={{
                      fontSize: "var(--h2-size, 2rem)",
                      fontWeight: "var(--heading-weight, 700)",
                      fontFamily: "var(--heading-font)",
                      color: textColor || "var(--primary-color)",
                      lineHeight: "var(--heading-line-height, 1.2)",
                    }}
                  >
                    {title}
                  </h2>
                )}
              </div>
            )}

            <div
              className="pb-grid-ncol"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap,
              }}
            >
              {images.map((img, i) => (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 8,
                  }}
                >
                  <img
                    src={img.url}
                    alt={img.alt || img.caption || `Gallery ${i + 1}`}
                    style={{
                      width: "100%",
                      aspectRatio: "4/3",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  {img.caption && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "8px 12px",
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      {img.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    ),
  },

  // ─── Service Section ─────────────────────────────────────────────────────

  ServiceSection: {
    label: "Services",
    fields: {
      title: {
        type: "custom",

        label: "Section Title",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Section Title"
            value={value}
            onChange={onChange}
            placeholder="Enter section title..."
          />
        ),
      },

      subtitle: {
        type: "custom",

        label: "Subtitle",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Subtitle"
            value={value}
            onChange={onChange}
            placeholder="Enter subtitle..."
          />
        ),
      },

      description: {
        type: "custom",

        label: "Description",

        render: ({ value, onChange }) => (
          <StackedTextareaField
            label="Description"
            value={value}
            onChange={onChange}
            placeholder="Enter description..."
            rows={3}
          />
        ),
      },

      columns: {
        type: "custom",

        label: "Columns",

        render: ({ value, onChange }) => (
          <ColumnsField
            value={value}
            onChange={onChange}
            label="Columns"
            options={[{ value: 2 }, { value: 3 }, { value: 4 }]}
          />
        ),
      },

      cardStyle: {
        type: "custom",

        label: "Card Style",

        render: ({ value, onChange }) => (
          <AlignField
            value={value}
            onChange={onChange}
            label="Card Style"
            options={[
              {
                value: "bordered",
                icon: <Square size={15} />,
                title: "Bordered",
              },

              { value: "shadow", icon: <Copy size={15} />, title: "Shadow" },

              { value: "flat", icon: <Minus size={15} />, title: "Flat" },
            ]}
          />
        ),
      },

      layoutStyle: {
        type: "custom",

        label: "Layout Style",

        render: ({ value, onChange }) => (
          <AlignField
            value={value}
            onChange={onChange}
            label="Layout Style"
            options={[
              {
                value: "standard",
                icon: <LayoutGrid size={15} />,
                title: "Standard",
              },

              {
                value: "image-top",
                icon: <ImageIcon size={15} />,
                title: "Image Top",
              },

              {
                value: "image-left",
                icon: <PanelLeft size={15} />,
                title: "Image Left",
              },

              {
                value: "image-right",
                icon: <PanelRight size={15} />,
                title: "Image Right",
              },

              {
                value: "icon-center",
                icon: <AlignCenter size={15} />,
                title: "Icon Center",
              },
            ]}
          />
        ),
      },

      services: {
        type: "array",

        label: "Services",

        getItemSummary: (item) => item.title || "Service",

        arrayFields: {
          icon: {
            type: "custom",

            label: "Icon (emoji)",

            render: ({ value, onChange }) => (
              <StackedTextField
                label="Icon (emoji)"
                value={value}
                onChange={onChange}
                placeholder="e.g., 🎨"
              />
            ),
          },

          title: {
            type: "custom",

            label: "Title",

            render: ({ value, onChange }) => (
              <StackedTextField
                label="Title"
                value={value}
                onChange={onChange}
                placeholder="Service title..."
              />
            ),
          },

          description: {
            type: "custom",

            label: "Description",

            render: ({ value, onChange }) => (
              <StackedTextareaField
                label="Description"
                value={value}
                onChange={onChange}
                placeholder="Service description..."
                rows={2}
              />
            ),
          },

          linkLabel: {
            type: "custom",

            label: "Link Label",

            render: ({ value, onChange }) => (
              <StackedTextField
                label="Link Label"
                value={value}
                onChange={onChange}
                placeholder="e.g., Learn More"
              />
            ),
          },

          link: {
            type: "custom",

            label: "Link URL",

            render: ({ value, onChange }) => (
              <StackedTextField
                label="Link URL"
                value={value}
                onChange={onChange}
                placeholder="e.g., /services"
              />
            ),
          },

          image: {
            type: "custom" as const,

            label: "Image",

            render: ({
              value,
              onChange,
              field,
            }: {
              value: { url: string } | undefined;
              onChange: (val: { url: string } | undefined) => void;
              field: any;
            }) => {
              return imageUploadField.render({
                value: value?.url || "",

                onChange: (url: string) => onChange(url ? { url } : undefined),

                field,
              });
            },
          },
        },
      },

      backgroundColor: {
        type: "custom",

        label: "Background Color",

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Background Color"
            value={value}
            onChange={onChange}
          />
        ),
      },

      padding: {
        type: "custom",

        label: "Padding (px)",

        render: ({ value, onChange }) => (
          <StackedNumberField
            label="Padding (px)"
            value={value}
            onChange={onChange}
            placeholder="e.g., 80"
          />
        ),
      },

      contentAlign: {
        type: "custom",

        label: "Content Alignment",

        render: ({ value, onChange }) => (
          <AlignField
            value={value}
            onChange={onChange}
            label="Content Align"
            options={[
              { value: "left", icon: <AlignLeft size={15} />, title: "Left" },

              {
                value: "center",
                icon: <AlignCenter size={15} />,
                title: "Center",
              },

              {
                value: "right",
                icon: <AlignRight size={15} />,
                title: "Right",
              },
            ]}
          />
        ),
      },
    },

    defaultProps: {
      title: "Our Services",

      subtitle: "What We Offer",

      description:
        "We provide comprehensive solutions to help your business succeed in the digital world.",

      columns: 3,

      cardStyle: "shadow",

      services: [
        {
          icon: "🎨",
          title: "Web Design",
          description:
            "Beautiful, modern designs that capture your brand and engage your audience.",
          linkLabel: "Learn More",
          link: "#",
        },

        {
          icon: "⚙️",
          title: "Development",
          description:
            "Robust and scalable web applications built with the latest technologies.",
          linkLabel: "Learn More",
          link: "#",
        },

        {
          icon: "📈",
          title: "SEO & Marketing",
          description:
            "Grow your online presence and reach more customers with proven strategies.",
          linkLabel: "Learn More",
          link: "#",
        },

        {
          icon: "📱",
          title: "Mobile Apps",
          description:
            "Cross-platform mobile applications that deliver a seamless user experience.",
          linkLabel: "Learn More",
          link: "#",
        },

        {
          icon: "🔒",
          title: "Security",
          description:
            "Protect your digital assets with enterprise-grade security solutions.",
          linkLabel: "Learn More",
          link: "#",
        },

        {
          icon: "☁️",
          title: "Cloud Services",
          description:
            "Scalable cloud infrastructure that grows with your business needs.",
          linkLabel: "Learn More",
          link: "#",
        },
      ],

      backgroundColor: "#ffffff",

      padding: 80,

      contentAlign: "left",

      layoutStyle: "standard",
    },

    render: ({
      title,
      subtitle,
      description,
      columns,
      cardStyle,
      services,
      backgroundColor,
      padding,
      contentAlign,
      layoutStyle,
    }) => {
      const cardStyleMap: Record<string, React.CSSProperties> = {
        bordered: { border: "1px solid #e5e7eb", boxShadow: "none" },


        flat: { border: "none", boxShadow: "none", backgroundColor: "#f8fafc" },
      };

      return (
        <>
          <section style={{ backgroundColor, padding: `${padding}px 0` }}>
            <div
              style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}
            >
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                {subtitle && (
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--primary-color)",
                      marginBottom: 8,
                    }}
                  >
                    {subtitle}
                  </p>
                )}

                {title && (
                  <h2
                    style={{
                      fontSize: "var(--h2-size, 2rem)",
                      fontWeight: "var(--heading-weight, 700)",
                      fontFamily: "var(--heading-font)",
                      color: "var(--primary-color)",
                      marginBottom: 16,
                      lineHeight: "var(--heading-line-height, 1.2)",
                    }}
                  >
                    {title}
                  </h2>
                )}

                {description && (
                  <p
                    style={{
                      maxWidth: 600,
                      margin: "0 auto",
                      color: "var(--text-color)",
                      opacity: 0.75,
                      lineHeight: "var(--line-height, 1.7)",
                    }}
                  >
                    {description}
                  </p>
                )}
              </div>

              <div
                className="pb-grid-ncol"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                  gap: 24,
                }}
              >
                {services.map((service, i) => {
                  // Image Left/Right layouts use horizontal flex

                  if (
                    layoutStyle === "image-left" ||
                    layoutStyle === "image-right"
                  ) {
                    return (
                      <div
                        key={i}
                        style={{
                          padding: "32px 24px",
                          borderRadius: 12,
                          ...cardStyleMap[cardStyle],
                          display: "flex",
                          flexDirection:
                            layoutStyle === "image-right"
                              ? "row-reverse"
                              : "row",
                          gap: 20,
                          alignItems: "center",
                        }}
                      >
                        {service.image?.url && (
                          <img
                            src={service.image.url}
                            alt={service.title}
                            style={{
                              width: 120,
                              height: 120,
                              objectFit: "cover",
                              borderRadius: 8,
                              flexShrink: 0,
                            }}
                          />
                        )}

                        <div style={{ flex: 1, textAlign: contentAlign }}>
                          <h3
                            style={{
                              fontSize: "var(--h3-size, 1.25rem)",
                              fontWeight: "var(--heading-weight, 600)",
                              fontFamily: "var(--heading-font)",
                              color: "var(--primary-color)",
                              marginBottom: 12,
                              lineHeight: "var(--heading-line-height, 1.2)",
                            }}
                          >
                            {service.title}
                          </h3>

                          <p
                            style={{
                              fontSize: "var(--base-font-size, 0.95rem)",
                              color: "var(--text-color)",
                              opacity: 0.8,
                              lineHeight: "var(--line-height, 1.7)",
                              marginBottom: service.linkLabel ? 20 : 0,
                            }}
                          >
                            {service.description}
                          </p>

                          {service.linkLabel && (
                            <a
                              href={service.link || "#"}
                              style={{
                                color: "var(--primary-color)",
                                fontWeight: 600,
                                fontSize: 14,
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              {service.linkLabel} →
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Icon Center layout

                  if (layoutStyle === "icon-center") {
                    return (
                      <div
                        key={i}
                        style={{
                          padding: "32px 24px",
                          borderRadius: 12,
                          ...cardStyleMap[cardStyle],
                          textAlign: "center",
                        }}
                      >
                        {service.icon && (
                          <div
                            style={{
                              fontSize: 64,
                              marginBottom: 20,
                              lineHeight: 1,
                            }}
                          >
                            {service.icon}
                          </div>
                        )}

                        <h3
                          style={{
                            fontSize: "var(--h3-size, 1.25rem)",
                            fontWeight: "var(--heading-weight, 600)",
                            fontFamily: "var(--heading-font)",
                            color: "var(--primary-color)",
                            marginBottom: 12,
                            lineHeight: "var(--heading-line-height, 1.2)",
                          }}
                        >
                          {service.title}
                        </h3>

                        <p
                          style={{
                            fontSize: "var(--base-font-size, 0.95rem)",
                            color: "var(--text-color)",
                            opacity: 0.8,
                            lineHeight: "var(--line-height, 1.7)",
                            marginBottom: service.linkLabel ? 20 : 0,
                          }}
                        >
                          {service.description}
                        </p>

                        {service.linkLabel && (
                          <a
                            href={service.link || "#"}
                            style={{
                              color: "var(--primary-color)",
                              fontWeight: 600,
                              fontSize: 14,
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            {service.linkLabel} →
                          </a>
                        )}
                      </div>
                    );
                  }

                  // Standard and Image Top layouts (vertical)

                  return (
                    <div
                      key={i}
                      style={{
                        padding: "32px 24px",
                        borderRadius: 12,
                        ...cardStyleMap[cardStyle],
                        textAlign: contentAlign,
                      }}
                    >
                      {service.image?.url ? (
                        <img
                          src={service.image.url}
                          alt={service.title}
                          style={{
                            width: "100%",
                            height: layoutStyle === "image-top" ? 180 : 200,
                            objectFit: "cover",
                            borderRadius: 8,
                            marginBottom: 16,
                          }}
                        />
                      ) : (
                        service.icon && (
                          <div
                            style={{
                              fontSize: 40,
                              marginBottom: 16,
                              lineHeight: 1,
                            }}
                          >
                            {service.icon}
                          </div>
                        )
                      )}

                      <h3
                        style={{
                          fontSize: "var(--h3-size, 1.25rem)",
                          fontWeight: "var(--heading-weight, 600)",
                          fontFamily: "var(--heading-font)",
                          color: "var(--primary-color)",
                          marginBottom: 12,
                          lineHeight: "var(--heading-line-height, 1.2)",
                        }}
                      >
                        {service.title}
                      </h3>

                      <p
                        style={{
                          fontSize: "var(--base-font-size, 0.95rem)",
                          color: "var(--text-color)",
                          opacity: 0.8,
                          lineHeight: "var(--line-height, 1.7)",
                          marginBottom: service.linkLabel ? 20 : 0,
                        }}
                      >
                        {service.description}
                      </p>

                      {service.linkLabel && (
                        <a
                          href={service.link || "#"}
                          style={{
                            color: "var(--primary-color)",
                            fontWeight: 600,
                            fontSize: 14,
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {service.linkLabel} →
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      );
    },
  },

  // ─── Contact Section ─────────────────────────────────────────────────────

  ContactSection: {
    label: "Contact",
    fields: {
      title: {
        type: "custom",

        label: "Contact heading",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Contact heading"
            value={value}
            onChange={onChange}
            placeholder="Enter contact heading..."
          />
        ),
      },

      subtitle: {
        type: "custom",

        label: "Contact subheading",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Contact subheading"
            value={value}
            onChange={onChange}
            placeholder="Enter contact subheading..."
          />
        ),
      },

      description: {
        type: "custom",

        label: "Contact description",

        render: ({ value, onChange }) => (
          <StackedTextareaField
            label="Contact description"
            value={value}
            onChange={onChange}
            placeholder="Enter contact description..."
            rows={3}
          />
        ),
      },

      email: {
        type: "custom",

        label: "Contact email",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Contact email"
            value={value}
            onChange={onChange}
            placeholder="contact@example.com"
          />
        ),
      },

      phone: {
        type: "custom",

        label: "Contact phone",

        render: ({ value, onChange }) => {
          const digits = (value ?? "").replace(/\D/g, "");
          const tooLong = digits.length > 15;
          const tooShort = digits.length > 0 && digits.length < 7;
          const hasError = tooLong || tooShort;

          const handleChange = (raw: string) => {
            // Strip anything that isn't +, digit, space, -, (, )
            const sanitised = raw.replace(/[^\d\s\+\-\(\)]/g, "");
            // Enforce max 15 digits
            const digitCount = sanitised.replace(/\D/g, "").length;
            if (digitCount > 15) return;
            onChange(sanitised);
          };

          return (
            <StackedField label="Contact phone" icon={<span style={{ fontSize: 14 }}>📞</span>}>
              <input
                type="tel"
                value={value ?? ""}
                placeholder="+1 234 567 8900"
                onChange={(e) => handleChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: 14,
                  border: `1px solid ${hasError ? "#ef4444" : "#d1d5db"}`,
                  borderRadius: 6,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {tooLong && (
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "#ef4444" }}>
                  Phone number must not exceed 15 digits.
                </p>
              )}
              {tooShort && (
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "#ef4444" }}>
                  Phone number must have at least 7 digits.
                </p>
              )}
            </StackedField>
          );
        },
      },

      address: {
        type: "custom",

        label: "Contact address",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Contact address"
            value={value}
            onChange={onChange}
            placeholder="123 Main St, City, Country"
          />
        ),
      },

      showForm: {
        type: "custom",

        label: "Display contact form",

        render: ({ value, onChange }) => (
          <ToggleField
            value={!!value}
            onChange={onChange}
            label="Display contact form"
          />
        ),
      },

      buttonLabel: {
        type: "custom",

        label: "Form button text",

        visible: ({ props }) => !!props?.showForm,

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Form button text"
            value={value}
            onChange={onChange}
            placeholder="Enter button text..."
          />
        ),
      },

      backgroundColor: {
        type: "custom",

        label: "Background Color",

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Background Color"
            value={value}
            onChange={onChange}
          />
        ),
      },

      padding: {
        type: "custom",

        label: "Padding (px)",

        render: ({ value, onChange }) => (
          <StackedNumberField
            label="Padding (px)"
            value={value}
            onChange={onChange}
            placeholder="e.g., 80"
          />
        ),
      },

      layoutStyle: {
        type: "select",

        options: [
          { label: "Split", value: "split" },

          { label: "Centered", value: "centered" },

          { label: "Full Width", value: "full-width" },

          { label: "Grid", value: "grid" },

          { label: "Cards", value: "cards" },
        ],
      },

      cardStyle: {
        type: "select",

        options: [
          { label: "Modern", value: "modern" },

          { label: "Minimal", value: "minimal" },

          { label: "Glassmorphism", value: "glassmorphism" },

          { label: "Gradient", value: "gradient" },

          { label: "Shadow", value: "shadow" },
        ],
      },

      backgroundPattern: {
        type: "select",

        options: [
          { label: "None", value: "none" },

          { label: "Dots", value: "dots" },

          { label: "Lines", value: "lines" },

          { label: "Gradient", value: "gradient" },

          { label: "Geometric", value: "geometric" },
        ],
      },

      spacing: {
        type: "select",

        options: [
          { label: "Compact", value: "compact" },

          { label: "Normal", value: "normal" },

          { label: "Generous", value: "generous" },
        ],
      },

      accentColor: {
        type: "custom",

        label: "Accent Color",

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Accent Color"
            value={value}
            onChange={onChange}
          />
        ),
      },

      responseTime: {
        type: "custom",

        label: "Response Time",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Response Time"
            value={value}
            onChange={onChange}
            placeholder="e.g., Within 24 hours"
          />
        ),
      },

      mapEmbed: {
        type: "custom",

        label: "Map Embed URL",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Map Embed URL"
            value={value}
            onChange={onChange}
            placeholder="Google Maps embed URL"
          />
        ),
      },

      hoverEffects: {
        type: "custom",

        label: "Hover Effects",

        render: ({ value, onChange }) => (
          <ToggleField
            value={!!value}
            onChange={onChange}
            label="Enable Hover Effects"
          />
        ),
      },

      borderRadius: {
        type: "custom",

        label: "Border Radius (px)",

        render: ({ value, onChange }) => (
          <StackedNumberField
            label="Border Radius (px)"
            value={value}
            onChange={onChange}
            placeholder="e.g., 8"
          />
        ),
      },

      contentCentered: {
        type: "custom",

        label: "Content Centered",

        render: ({ value, onChange }) => (
          <ToggleField
            value={!!value}
            onChange={onChange}
            label="Center Content"
          />
        ),
      },

      image: {
        type: "object",

        label: "Image",

        objectFields: {
          url: imageUploadField,

          mode: {
            type: "custom",

            label: "Mode",

            render: ({ value, onChange }) => (
              <AlignField
                value={value}
                onChange={onChange}
                label="Mode"
                options={[
                  {
                    value: "inline",
                    icon: <ImageIcon size={15} />,
                    title: "Inline",
                  },

                  {
                    value: "bg",
                    icon: <Layers size={15} />,
                    title: "Background",
                  },
                ]}
              />
            ),
          },
        },
      },

      overlayOpacity: {
        type: "custom",

        label: "Overlay Opacity",

        render: ({ value, onChange }) => (
          <StackedNumberField
            label="Overlay Opacity (0-1)"
            value={value}
            onChange={onChange}
            min={0}
            max={1}
            step={0.1}
            placeholder="e.g., 0.7"
          />
        ),
      },

      labelName: {
        type: "custom",

        label: "Name Field Label",

        visible: ({ props }) => !!props?.showForm,

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Name Field Label"
            value={value ?? ""}
            onChange={onChange}
            placeholder="e.g., Name"
          />
        ),
      },

      labelEmail: {
        type: "custom",

        label: "Email Field Label",

        visible: ({ props }) => !!props?.showForm,

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Email Field Label"
            value={value ?? ""}
            onChange={onChange}
            placeholder="e.g., Email"
          />
        ),
      },

      labelSubject: {
        type: "custom",

        label: "Subject Field Label",

        visible: ({ props }) => !!props?.showForm,

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Subject Field Label"
            value={value ?? ""}
            onChange={onChange}
            placeholder="e.g., Subject"
          />
        ),
      },

      labelMessage: {
        type: "custom",

        label: "Message Field Label",

        visible: ({ props }) => !!props?.showForm,

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Message Field Label"
            value={value ?? ""}
            onChange={onChange}
            placeholder="e.g., Message"
          />
        ),
      },
    },

    defaultProps: {
      title: "Get In Touch",

      subtitle: "Contact Us",

      description:
        "Have a project in mind? We'd love to hear from you. Send us a message and we'll get back to you as soon as possible.",

      email: "hello@example.com",

      phone: "+1 (555) 123-4567",

      address: "123 Main Street, Suite 100\nNew York, NY 10001",

      showForm: true,

      buttonLabel: "Send Message",

      backgroundColor: "#f8fafc",

      padding: 80,

      layoutStyle: "split",

      cardStyle: "modern",

      accentColor: "#0158ad",

      backgroundPattern: "none",

      responseTime: "Within 24 hours",

      mapEmbed: "",

      hoverEffects: true,

      borderRadius: 8,

      spacing: "normal",

      contentCentered: false,

      image: { url: "", mode: "inline", position: "right" },

      overlayOpacity: 0.7,

      labelName: "Name",

      labelEmail: "Email",

      labelSubject: "Subject",

      labelMessage: "Message",
    },

    render: ({
      title,
      subtitle,
      description,
      email,
      phone,
      address,
      showForm,
      buttonLabel,
      backgroundColor,
      padding,
      layoutStyle,
      cardStyle,
      accentColor,
      backgroundPattern,
      responseTime,
      mapEmbed,
      hoverEffects,
      borderRadius,
      spacing,
      contentCentered,
      image,
      overlayOpacity,
      labelName,
      labelEmail,
      labelSubject,
      labelMessage,
    }) => {
      // Calculate spacing values

      const spacingValues = {
        compact: { gap: 24, padding: 60 },

        normal: { gap: 48, padding: 80 },

        generous: { gap: 64, padding: 100 },
      };

      const currentSpacing = spacingValues[spacing] || spacingValues.normal;

      // Background pattern styles

      const getBackgroundPattern = () => {
        if (!backgroundPattern || backgroundPattern === "none") return {};

        switch (backgroundPattern) {
          case "dots":
            return {
              backgroundImage:
                "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            };

          case "lines":
            return {
              backgroundImage:
                "linear-gradient(90deg, #e5e7eb 1px, transparent 1px)",
              backgroundSize: "40px 100%",
            };

          case "gradient":
            return {
              backgroundImage: `linear-gradient(135deg, ${backgroundColor} 0%, ${accentColor || "var(--primary-color)"}20 100%)`,
            };

          case "geometric":
            return {
              backgroundImage:
                "linear-gradient(45deg, #f3f4f6 25%, transparent 25%, transparent 75%, #f3f4f6 75%, #f3f4f6), linear-gradient(45deg, #f3f4f6 25%, transparent 25%, transparent 75%, #f3f4f6 75%, #f3f4f6)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 10px 10px",
            };

          default:
            return {};
        }
      };

      // Card style classes

      const getCardStyle = () => {
        switch (cardStyle) {
          case "glassmorphism":
            return {
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            };

          case "gradient":
            return {
              background: `linear-gradient(135deg, ${backgroundColor} 0%, ${accentColor || "var(--primary-color)"}15 100%)`,
            };

          case "shadow":
            return { boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)" };

          case "minimal":
            return { border: "1px solid #e5e7eb" };

          case "modern":

          default:
            return { boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" };
        }
      };

      // Get image styles based on mode

      const getImageStyles = () => {
        if (!image?.url) return {};

        if (image?.mode === "bg") {
          return {
            backgroundImage: `url(${image.url})`,

            backgroundSize: "cover",

            backgroundPosition: "center",

            position: "relative" as const,
          };
        }

        return {};
      };

      const getImageOverlay = () => {
        if (image?.mode === "bg" && image?.url) {
          const opacity = overlayOpacity ?? 0.7;

          const alpha = Math.round(opacity * 255)
            .toString(16)
            .padStart(2, "0");

          return {
            position: "absolute" as const,

            inset: 0,

            backgroundColor: `${backgroundColor}${alpha}`,

            zIndex: 0,
          };
        }

        return null;
      };

      return (
        <section
          style={{
            backgroundColor: image?.mode === "bg" ? undefined : backgroundColor,
            padding: `${currentSpacing.padding}px 0`,
            ...getBackgroundPattern(),
            ...getImageStyles(),
          }}
        >
          {getImageOverlay() && <div style={getImageOverlay()} />}

          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 24px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {image?.url && image?.mode === "inline" && (
              <img
                src={image.url}
                alt="Contact"
                style={{
                  width: "100%",
                  height: 300,
                  objectFit: "cover",
                  borderRadius: borderRadius || 12,
                  marginBottom: 32,
                }}
              />
            )}

            <div
              style={{
                textAlign: contentCentered ? "center" : "left",
                marginBottom: 48,
                marginLeft: contentCentered ? "auto" : 0,
                marginRight: contentCentered ? "auto" : 0,
              }}
            >
              {subtitle && (
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: accentColor || "var(--primary-color)",
                    marginBottom: 8,
                  }}
                >
                  {subtitle}
                </p>
              )}

              {title && (
                <h2
                  style={{
                    fontSize: "var(--h2-size, 2rem)",
                    fontWeight: "var(--heading-weight, 700)",
                    fontFamily: "var(--heading-font)",
                    color: accentColor || "var(--primary-color)",
                    marginBottom: 16,
                    lineHeight: "var(--heading-line-height, 1.2)",
                    textAlign: contentCentered ? "center" : "left",
                  }}
                >
                  {title}
                </h2>
              )}

              {description && (
                <p
                  style={{
                    maxWidth: contentCentered ? 560 : "none",
                    margin: contentCentered ? "0 auto" : "0",
                    color: "var(--text-color)",
                    opacity: 0.75,
                    lineHeight: "var(--line-height, 1.7)",
                    textAlign: contentCentered ? "center" : "left",
                  }}
                >
                  {description}
                </p>
              )}
            </div>

            <div
              className={showForm ? "pb-grid-2col" : undefined}
              style={{
                display: "grid",
                gridTemplateColumns: showForm ? "1fr 1.5fr" : "1fr",
                gap: currentSpacing.gap,
                alignItems: "start",
              }}
            >
              {/* Contact Info */}

              <div
                style={{
                  ...getCardStyle(),
                  borderRadius: borderRadius || 8,
                  padding: 32,
                  transition: hoverEffects
                    ? "transform 0.3s ease, box-shadow 0.3s ease"
                    : "none",
                  ...(hoverEffects
                    ? {
                        ":hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
                        },
                      }
                    : {}),
                }}
              >
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: accentColor || "var(--primary-color)",
                    marginBottom: 24,
                    fontFamily: "var(--heading-font)",
                  }}
                >
                  Contact Information
                </h3>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 20 }}
                >
                  {responseTime && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "12px 16px",
                        backgroundColor: `${accentColor || "var(--primary-color)"}10`,
                        borderRadius: 8,
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontSize: 16 }}>⏱️</span>

                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: accentColor || "var(--primary-color)",
                        }}
                      >
                        {responseTime}
                      </span>
                    </div>
                  )}

                  {email && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 16,
                        transition: hoverEffects
                          ? "transform 0.2s ease"
                          : "none",
                        ...(hoverEffects
                          ? { ":hover": { transform: "translateX(4px)" } }
                          : {}),
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: borderRadius || 10,
                          backgroundColor:
                            accentColor || "var(--primary-color)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          color: "#fff",
                          fontSize: 18,
                        }}
                      >
                        ✉️
                      </div>

                      <div>
                        <p
                          style={{
                            fontWeight: 600,
                            color: accentColor || "var(--primary-color)",
                            marginBottom: 2,
                          }}
                        >
                          Email
                        </p>

                        <a
                          href={`mailto:${email}`}
                          style={{
                            color: "var(--text-color)",
                            textDecoration: "none",
                            fontSize: 15,
                            opacity: 0.8,
                          }}
                        >
                          {email}
                        </a>
                      </div>
                    </div>
                  )}

                  {phone && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 16,
                        transition: hoverEffects
                          ? "transform 0.2s ease"
                          : "none",
                        ...(hoverEffects
                          ? { ":hover": { transform: "translateX(4px)" } }
                          : {}),
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: borderRadius || 10,
                          backgroundColor:
                            accentColor || "var(--primary-color)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          color: "#fff",
                          fontSize: 18,
                        }}
                      >
                        📞
                      </div>

                      <div>
                        <p
                          style={{
                            fontWeight: 600,
                            color: accentColor || "var(--primary-color)",
                            marginBottom: 2,
                          }}
                        >
                          Phone
                        </p>

                        <a
                          href={`tel:${phone}`}
                          style={{
                            color: "var(--text-color)",
                            textDecoration: "none",
                            fontSize: 15,
                            opacity: 0.8,
                          }}
                        >
                          {phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {address && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 16,
                        transition: hoverEffects
                          ? "transform 0.2s ease"
                          : "none",
                        ...(hoverEffects
                          ? { ":hover": { transform: "translateX(4px)" } }
                          : {}),
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: borderRadius || 10,
                          backgroundColor:
                            accentColor || "var(--primary-color)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          color: "#fff",
                          fontSize: 18,
                        }}
                      >
                        📍
                      </div>

                      <div>
                        <p
                          style={{
                            fontWeight: 600,
                            color: accentColor || "var(--primary-color)",
                            marginBottom: 2,
                          }}
                        >
                          Address
                        </p>

                        <p
                          style={{
                            color: "var(--text-color)",
                            fontSize: 15,
                            opacity: 0.8,
                            whiteSpace: "pre-line",
                          }}
                        >
                          {address}
                        </p>
                      </div>
                    </div>
                  )}

                  {mapEmbed && (
                    <div
                      style={{
                        marginTop: 16,
                        borderRadius: borderRadius || 8,
                        overflow: "hidden",
                        border: `2px solid ${accentColor || "var(--primary-color)"}`,
                      }}
                    >
                      <iframe
                        src={mapEmbed}
                        style={{ width: "100%", height: 250, border: "none" }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Form */}

              {showForm && (
                <form
                  style={{
                    ...getCardStyle(),
                    borderRadius: borderRadius || 8,
                    padding: 32,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    transition: hoverEffects
                      ? "transform 0.3s ease, box-shadow 0.3s ease"
                      : "none",
                    ...(hoverEffects
                      ? {
                          ":hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
                          },
                        }
                      : {}),
                  }}
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 13,
                          fontWeight: 600,
                          color: accentColor || "var(--primary-color)",
                          marginBottom: 6,
                        }}
                      >
                        {labelName || "Name"}
                      </label>

                      <input
                        type="text"
                        placeholder="Your name"
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          border: "2px solid #e5e7eb",
                          borderRadius: borderRadius || 8,
                          fontSize: 14,
                          outline: "none",
                          boxSizing: "border-box",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          ...(hoverEffects
                            ? {
                                ":hover": {
                                  borderColor:
                                    accentColor || "var(--primary-color)",
                                  boxShadow: `0 0 0 3px ${accentColor || "var(--primary-color)"}20`,
                                  transform: "translateY(-1px)",
                                },
                              }
                            : {}),
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 13,
                          fontWeight: 600,
                          color: accentColor || "var(--primary-color)",
                          marginBottom: 6,
                        }}
                      >
                        {labelEmail || "Email"}
                      </label>

                      <input
                        type="email"
                        placeholder="your@email.com"
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          border: "2px solid #e5e7eb",
                          borderRadius: borderRadius || 8,
                          fontSize: 14,
                          outline: "none",
                          boxSizing: "border-box",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          ...(hoverEffects
                            ? {
                                ":hover": {
                                  borderColor:
                                    accentColor || "var(--primary-color)",
                                  boxShadow: `0 0 0 3px ${accentColor || "var(--primary-color)"}20`,
                                  transform: "translateY(-1px)",
                                },
                              }
                            : {}),
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 600,
                        color: accentColor || "var(--primary-color)",
                        marginBottom: 6,
                      }}
                    >
                      {labelSubject || "Subject"}
                    </label>

                    <input
                      type="text"
                      placeholder="Project enquiry"
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "2px solid #e5e7eb",
                        borderRadius: borderRadius || 8,
                        fontSize: 14,
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        ...(hoverEffects
                          ? {
                              ":hover": {
                                borderColor:
                                  accentColor || "var(--primary-color)",
                                boxShadow: `0 0 0 3px ${accentColor || "var(--primary-color)"}20`,
                                transform: "translateY(-1px)",
                              },
                            }
                          : {}),
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 600,
                        color: accentColor || "var(--primary-color)",
                        marginBottom: 6,
                      }}
                    >
                      {labelMessage || "Message"}
                    </label>

                    <textarea
                      placeholder="Tell us about your project..."
                      rows={5}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "2px solid #e5e7eb",
                        borderRadius: borderRadius || 8,
                        fontSize: 14,
                        outline: "none",
                        resize: "vertical",
                        boxSizing: "border-box",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        ...(hoverEffects
                          ? {
                              ":hover": {
                                borderColor:
                                  accentColor || "var(--primary-color)",
                                boxShadow: `0 0 0 3px ${accentColor || "var(--primary-color)"}20`,
                                transform: "translateY(-1px)",
                              },
                            }
                          : {}),
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="pb-btn"
                    style={{
                      backgroundColor: accentColor || "var(--primary-color)",
                      color: "#fff",
                      border: "none",
                      padding: "14px 36px",
                      borderRadius: borderRadius || 8,
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: "pointer",
                      alignSelf: "flex-start",
                      transition: "all 0.3s ease",
                      ...(hoverEffects
                        ? {
                            ":hover": {
                              transform: "translateY(-2px)",
                              boxShadow: `0 8px 20px ${accentColor || "var(--primary-color)"}40`,
                            },
                          }
                        : {}),
                    }}
                  >
                    {buttonLabel}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      );
    },
  },

  // ─── Photo Collage (Simple) ──────────────────────────────────────────────

  PhotoCollage: {
    label: "Photo Collage",
    fields: {
      layout: {
        type: "custom",

        label: "Layout Style",

        render: ({ value, onChange }) => {
          const layouts = [
            {
              id: "mixed",
              name: "Mixed Sizes",
              desc: "Varied heights and widths",
            },

            { id: "hero", name: "Hero Left", desc: "Big left + small right" },
          ];

          return (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {layouts.map((l) => (
                <button
                  key={l.id}
                  onClick={() => onChange(l.id)}
                  style={{
                    padding: "10px",

                    border: `2px solid ${value === l.id ? "#0158ad" : "#e5e7eb"}`,

                    borderRadius: 6,

                    background: value === l.id ? "#eff6ff" : "#fff",

                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: value === l.id ? "#0158ad" : "#374151",
                    }}
                  >
                    {l.name}
                  </div>

                  <div style={{ fontSize: 10, color: "#6b7280" }}>{l.desc}</div>
                </button>
              ))}
            </div>
          );
        },
      },

      images: {
        type: "array",

        label: "Photos",

        getItemSummary: (item, i) =>
          item?.alt ? item.alt : `Photo ${(i ?? 0) + 1}`,

        arrayFields: {
          url: imageUploadField,

          alt: {
            type: "custom",

            label: "Alt Text",

            render: ({ value, onChange }) => (
              <StackedTextField
                label="Alt Text"
                value={value ?? ""}
                onChange={onChange}
                placeholder="Describe the image..."
              />
            ),
          },
        },
      },

      gap: {
        type: "custom",

        label: "Gap (px)",

        render: ({ value, onChange }) => (
          <StackedNumberField
            label="Gap (px)"
            value={value ?? 8}
            onChange={onChange}
            placeholder="e.g., 8"
            min={0}
            max={60}
          />
        ),
      },

      padding: {
        type: "custom",

        label: "Section Padding (px)",

        render: ({ value, onChange }) => (
          <StackedNumberField
            label="Section Padding (px)"
            value={value ?? 40}
            onChange={onChange}
            placeholder="e.g., 40"
            min={0}
            max={200}
          />
        ),
      },

      borderRadius: {
        type: "custom",

        label: "Corner Radius (px)",

        render: ({ value, onChange }) => (
          <StackedNumberField
            label="Corner Radius (px)"
            value={value ?? 8}
            onChange={onChange}
            placeholder="e.g., 8"
            min={0}
            max={40}
          />
        ),
      },

      backgroundColor: {
        type: "custom",

        label: "Background Color",

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Background Color"
            value={value ?? "#ffffff"}
            onChange={onChange}
          />
        ),
      },
    },

    defaultProps: {
      layout: "mixed",

      images: [
        { url: "https://picsum.photos/seed/collage1/800/600", alt: "Nature landscape" },
        { url: "https://picsum.photos/seed/collage2/800/600", alt: "City architecture" },
        { url: "https://picsum.photos/seed/collage3/800/600", alt: "Abstract texture" },
        { url: "https://picsum.photos/seed/collage4/800/600", alt: "Portrait" },
        { url: "https://picsum.photos/seed/collage5/800/600", alt: "Travel scenery" },
        { url: "https://picsum.photos/seed/collage6/800/600", alt: "Food & drink" },
        { url: "https://picsum.photos/seed/collage7/800/600", alt: "Interior design" },
        { url: "https://picsum.photos/seed/collage8/800/600", alt: "Fashion" },
        { url: "https://picsum.photos/seed/collage9/800/600", alt: "Technology" },
        { url: "https://picsum.photos/seed/collage10/800/600", alt: "Wildlife" },
      ],

      gap: 8,

      padding: 40,

      borderRadius: 8,

      backgroundColor: "#ffffff",
    },

    render: ({
      layout,
      images,
      gap,
      padding,
      borderRadius,
      backgroundColor,
    }) => {
      const validImages = images.filter((img) => img.url);

      // Grid templates for different layouts - spans define how each cell is sized

      const templates = {
        mixed: {
          style: {
            display: "grid",

            gridTemplateColumns: "repeat(4, 1fr)",

            gridTemplateRows: "200px 150px 200px",

            gap: `${gap}px`,
          },

          spans: [
            { gridColumn: "span 2", gridRow: "span 2" }, // big

            {},
            {},

            {},
            { gridColumn: "span 2" }, // wide

            {},
            {},

            { gridColumn: "span 2" }, // wide

            {},
          ],
        },

        hero: {
          style: {
            display: "grid",

            gridTemplateColumns: "2fr 1fr 1fr",

            gridTemplateRows: "repeat(3, 160px)",

            gap: `${gap}px`,
          },

          spans: [
            { gridRow: "span 3" }, // hero tall

            {},
            {},
            {},
            {},
            {},
            {},
          ],
        },
      };

      const config = templates[layout] || templates.mixed;

      // Only render images that have URLs (no placeholders)

      const imageCount = Math.min(validImages.length, config.spans.length);

      return (
        <section style={{ backgroundColor, padding: `${padding}px 24px` }}>
          <div className="pb-collage" style={{ maxWidth: 1200, margin: "0 auto", ...config.style }}>
            {validImages.slice(0, imageCount).map((img, i) => (
              <div
                key={i}
                style={{
                  borderRadius,

                  overflow: "hidden",

                  ...(config.spans[i] || {}),
                }}
              >
                <img
                  src={img.url}
                  alt={img.alt || `Photo ${i + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      );
    },
  },

  // ─── Testimonial Section ─────────────────────────────────────────────────

  TestimonialSection: {
    label: "Testimonials",
    fields: {
      title: {
        type: "custom",

        label: "Title",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Title"
            value={value}
            onChange={onChange}
            placeholder="Enter title..."
          />
        ),
      },

      subtitle: {
        type: "custom",

        label: "Subtitle",

        render: ({ value, onChange }) => (
          <StackedTextField
            label="Subtitle"
            value={value}
            onChange={onChange}
            placeholder="Enter subtitle..."
          />
        ),
      },

      columns: {
        type: "custom",

        label: "Columns",

        render: ({ value, onChange }) => (
          <ColumnsField
            value={value}
            onChange={onChange}
            label="Columns"
            options={[{ value: 1 }, { value: 2 }, { value: 3 }]}
          />
        ),
      },

      testimonials: {
        type: "array",

        label: "Testimonials",

        getItemSummary: (item) => item.author || "Testimonial",

        arrayFields: {
          quote: {
            type: "custom",

            label: "Quote",

            render: ({ value, onChange }) => (
              <StackedTextareaField
                label="Quote"
                value={value}
                onChange={onChange}
                placeholder="Enter testimonial quote..."
                rows={3}
              />
            ),
          },

          author: {
            type: "custom",

            label: "Author Name",

            render: ({ value, onChange }) => (
              <StackedTextField
                label="Author Name"
                value={value}
                onChange={onChange}
                placeholder="e.g., John Smith"
              />
            ),
          },

          role: {
            type: "custom",

            label: "Role / Company",

            render: ({ value, onChange }) => (
              <StackedTextField
                label="Role / Company"
                value={value}
                onChange={onChange}
                placeholder="e.g., CEO, Company Inc."
              />
            ),
          },

          avatar: imageUploadField,

          rating: {
            type: "custom",

            label: "Rating (1–5)",

            render: ({ value, onChange }) => (
              <StackedNumberField
                label="Rating (1–5)"
                value={value}
                onChange={onChange}
                min={1}
                max={5}
                placeholder="1-5"
              />
            ),
          },
        },
      },

      backgroundColor: {
        type: "custom",

        label: "Background Color",

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Background Color"
            value={value}
            onChange={onChange}
          />
        ),
      },

      padding: {
        type: "custom",

        label: "Padding (px)",

        render: ({ value, onChange }) => (
          <StackedNumberField
            label="Padding (px)"
            value={value}
            onChange={onChange}
            placeholder="e.g., 80"
          />
        ),
      },

      layoutStyle: {
        type: "custom",

        label: "Layout Style",

        render: ({ value, onChange }) => (
          <AlignField
            value={value}
            onChange={onChange}
            label="Layout Style"
            options={[
              {
                value: "standard",
                icon: <LayoutGrid size={15} />,
                title: "Standard",
              },

              {
                value: "avatar-top",
                icon: <ImageIcon size={15} />,
                title: "Avatar Top",
              },

              {
                value: "centered",
                icon: <AlignCenter size={15} />,
                title: "Centered",
              },

              { value: "minimal", icon: <Minus size={15} />, title: "Minimal" },
            ]}
          />
        ),
      },

      cardStyle: {
        type: "custom",

        label: "Card Style",

        render: ({ value, onChange }) => (
          <AlignField
            value={value}
            onChange={onChange}
            label="Card Style"
            options={[
              {
                value: "bordered",
                icon: <Square size={15} />,
                title: "Bordered",
              },

              { value: "shadow", icon: <Layers size={15} />, title: "Shadow" },

              { value: "minimal", icon: <Minus size={15} />, title: "Minimal" },

              { value: "glass", icon: <Sparkles size={15} />, title: "Glass" },
            ]}
          />
        ),
      },

      avatarSize: {
        type: "custom",

        label: "Avatar Size",

        render: ({ value, onChange }) => (
          <AlignField
            value={value}
            onChange={onChange}
            label="Avatar Size"
            options={[
              { value: "small", icon: <Circle size={12} />, title: "Small" },

              { value: "medium", icon: <Circle size={15} />, title: "Medium" },

              { value: "large", icon: <Circle size={18} />, title: "Large" },
            ]}
          />
        ),
      },

      showQuotes: {
        type: "custom",

        label: "Show Quote Marks",

        render: ({ value, onChange }) => (
          <ToggleField
            label="Show Quote Marks"
            value={value}
            onChange={onChange}
          />
        ),
      },

      contentAlign: {
        type: "custom",

        label: "Content Alignment",

        render: ({ value, onChange }) => (
          <AlignField
            value={value}
            onChange={onChange}
            label="Content Align"
            options={[
              { value: "left", icon: <AlignLeft size={15} />, title: "Left" },

              {
                value: "center",
                icon: <AlignCenter size={15} />,
                title: "Center",
              },

              {
                value: "right",
                icon: <AlignRight size={15} />,
                title: "Right",
              },
            ]}
          />
        ),
      },

      cardBackgroundColor: {
        type: "custom",

        label: "Card Background",

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Card Background"
            value={value}
            onChange={onChange}
          />
        ),
      },

      accentColor: {
        type: "custom",

        label: "Accent Color",

        render: ({ value, onChange }) => (
          <ColorPickerField
            label="Accent Color"
            value={value}
            onChange={onChange}
          />
        ),
      },

      sliderEnabled: {
        type: "custom",

        label: "Slider Mode",

        render: ({ value, onChange }) => (
          <ToggleField
            label="Enable Slider"
            value={!!value}
            onChange={onChange}
          />
        ),
      },

      autoplay: {
        type: "custom",

        label: "Autoplay",

        render: ({ value, onChange }) => (
          <ToggleField
            label="Autoplay"
            value={value !== false}
            onChange={onChange}
          />
        ),
      },

      interval: {
        type: "custom",

        label: "Autoplay Interval (ms)",

        render: ({ value, onChange }) => (
          <StackedNumberField
            label="Interval (ms)"
            value={value ?? 5000}
            onChange={onChange}
            min={1000}
            max={15000}
            step={500}
            placeholder="5000"
          />
        ),
      },

      showArrows: {
        type: "custom",

        label: "Show Arrows",

        render: ({ value, onChange }) => (
          <ToggleField
            label="Show Arrows"
            value={value !== false}
            onChange={onChange}
          />
        ),
      },

      showDots: {
        type: "custom",

        label: "Show Dots",

        render: ({ value, onChange }) => (
          <ToggleField
            label="Show Dots"
            value={value !== false}
            onChange={onChange}
          />
        ),
      },
    },

    defaultProps: {
      title: "What Our Clients Say",

      subtitle: "Testimonials",

      columns: 3,

      layoutStyle: "standard",

      cardStyle: "bordered",

      avatarSize: "medium",

      showQuotes: true,

      contentAlign: "left",

      testimonials: [
        {
          quote:
            "Working with this team was an absolute pleasure. They delivered beyond our expectations and on time!",
          author: "Sarah Johnson",
          role: "CEO, TechStart",
          avatar: "",
          rating: 5,
        },

        {
          quote:
            "The website they built for us increased our conversions by 40%. Incredible work and great communication!",
          author: "Michael Chen",
          role: "Founder, GrowthCo",
          avatar: "",
          rating: 5,
        },

        {
          quote:
            "Professional, creative, and highly skilled. I wouldn't hesitate to recommend them to anyone!",
          author: "Emily Rodriguez",
          role: "Marketing Director, StyleBrand",
          avatar: "",
          rating: 5,
        },
      ],

      backgroundColor: "#ffffff",

      padding: 80,

      sliderEnabled: false,

      autoplay: true,

      interval: 5000,

      showArrows: true,

      showDots: true,
    },

    render: ({
      title,
      subtitle,
      columns,
      testimonials,
      backgroundColor,
      padding,
      layoutStyle,
      cardStyle,
      avatarSize,
      showQuotes,
      contentAlign,
      cardBackgroundColor,
      accentColor,
      sliderEnabled,
      autoplay,
      interval,
      showArrows,
      showDots,
    }) => {
      const [activeSlide, setActiveSlide] = useState(0);

      const total = (testimonials || []).length;

      useEffect(() => {
        if (!sliderEnabled || !autoplay || total < 2) return;

        const t = setInterval(
          () => setActiveSlide((p) => (p + 1) % total),
          interval || 5000,
        );

        return () => clearInterval(t);
      }, [sliderEnabled, autoplay, interval, total]);

      const prevSlide = () => setActiveSlide((p) => (p - 1 + total) % total);

      const nextSlide = () => setActiveSlide((p) => (p + 1) % total);

      // Avatar size mapping

      const avatarSizes = { small: 36, medium: 44, large: 56 };

      const avSize = avatarSizes[avatarSize] || 44;

      // Helper to get flex alignment from contentAlign

      const getFlexAlign = (align: string) => {
        switch (align) {
          case "center":
            return "center";

          case "right":
            return "flex-end";

          case "left":

          default:
            return "flex-start";
        }
      };

      // Card style configurations

      const getCardStyles = () => {
        const base = { borderRadius: 12, padding: 28 };

        const bg =
          cardBackgroundColor ||
          (cardStyle === "glass"
            ? "rgba(255,255,255,0.7)"
            : layoutStyle === "minimal"
              ? "transparent"
              : "#fafafa");

        switch (cardStyle) {
          case "shadow":
            return {
              ...base,
              backgroundColor: bg,
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            };

          case "glass":
            return {
              ...base,
              backgroundColor: bg,
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.3)",
            };

          case "minimal":
            return { ...base, backgroundColor: bg, border: "none" };

          case "bordered":

          default:
            return {
              ...base,
              backgroundColor: bg,
              border: "1px solid #e5e7eb",
            };
        }
      };

      // Star rating color

      const starColor = accentColor || "#f59e0b";

      // Quote marks

      const quoteMark = showQuotes ? "" : "";

      const headerBlock = (
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          {subtitle && (
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: accentColor || "var(--primary-color)",
                marginBottom: 8,
              }}
            >
              {subtitle}
            </p>
          )}

          {title && (
            <h2
              style={{
                fontSize: "var(--h2-size, 2rem)",
                fontWeight: "var(--heading-weight, 700)",
                fontFamily: "var(--heading-font)",
                color: accentColor || "var(--primary-color)",
                lineHeight: "var(--heading-line-height, 1.2)",
              }}
            >
              {title}
            </h2>
          )}
        </div>
      );

      if (sliderEnabled && testimonials.length > 0) {
        const t = testimonials[activeSlide];

        const avSize = { small: 36, medium: 52, large: 72 }[avatarSize] || 52;

        const bg =
          cardBackgroundColor ||
          (cardStyle === "glass" ? "rgba(255,255,255,0.75)" : "#fafafa");

        const cardSt = (() => {
          const base = { borderRadius: 16, padding: 40 };

          switch (cardStyle) {
            case "shadow":
              return {
                ...base,
                backgroundColor: bg,
                boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
              };

            case "glass":
              return {
                ...base,
                backgroundColor: bg,
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.35)",
              };

            case "minimal":
              return {
                ...base,
                backgroundColor: "transparent",
                border: "none",
              };

            default:
              return {
                ...base,
                backgroundColor: bg,
                border: "1px solid #e5e7eb",
              };
          }
        })();

        return (
          <>
            <section style={{ backgroundColor, padding: `${padding}px 0` }}>
              <div
                style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}
              >
                {headerBlock}

                <div style={{ position: "relative" }}>
                  {/* Slide track */}

                  <div style={{ overflow: "hidden", borderRadius: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        transform: `translateX(-${activeSlide * 100}%)`,
                        transition: "transform 500ms cubic-bezier(0.4,0,0.2,1)",
                      }}
                    >
                      {testimonials.map((t, i) => (
                        <div
                          key={i}
                          style={{
                            minWidth: "100%",
                            padding: "0 4px",
                            boxSizing: "border-box",
                          }}
                        >
                          <div
                            style={{
                              ...cardSt,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              textAlign: "center",
                              maxWidth: 720,
                              margin: "0 auto",
                              gap: 20,
                            }}
                          >
                            {t.rating && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: 4,
                                  color: accentColor || "#f59e0b",
                                  fontSize: 22,
                                }}
                              >
                                {Array.from({ length: 5 }, (_, j) => (
                                  <span
                                    key={j}
                                    style={{ opacity: j < t.rating ? 1 : 0.2 }}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            )}

                            <p
                              style={{
                                fontSize: "var(--base-font-size, 1.1rem)",
                                lineHeight: "var(--line-height, 1.75)",
                                color: "var(--text-color)",
                                fontStyle: "italic",
                                maxWidth: 640,
                              }}
                            >
                              {showQuotes && (
                                <span
                                  style={{
                                    color:
                                      accentColor || "var(--primary-color)",
                                    fontSize: "1.6em",
                                    marginRight: 4,
                                  }}
                                >
                                  "
                                </span>
                              )}

                              {t.quote}

                              {showQuotes && (
                                <span
                                  style={{
                                    color:
                                      accentColor || "var(--primary-color)",
                                    fontSize: "1.6em",
                                    marginLeft: 4,
                                  }}
                                >
                                  "
                                </span>
                              )}
                            </p>

                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 10,
                                paddingTop: 8,
                              }}
                            >
                              {t.avatar ? (
                                <img
                                  src={t.avatar}
                                  alt={t.author}
                                  style={{
                                    width: avSize,
                                    height: avSize,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: `3px solid ${accentColor || "var(--primary-color)"}`,
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: avSize,
                                    height: avSize,
                                    borderRadius: "50%",
                                    background:
                                      accentColor || "var(--primary-color)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#fff",
                                    fontWeight: 700,
                                    fontSize: avSize * 0.38,
                                    border: `3px solid ${accentColor || "var(--primary-color)"}`,
                                  }}
                                >
                                  {t.author?.charAt(0) || "?"}
                                </div>
                              )}

                              <div>
                                <p
                                  style={{
                                    fontWeight: 700,
                                    color:
                                      accentColor || "var(--primary-color)",
                                    fontSize: 15,
                                    marginBottom: 2,
                                  }}
                                >
                                  {t.author}
                                </p>

                                {t.role && (
                                  <p
                                    style={{
                                      fontSize: 13,
                                      color: "var(--text-color)",
                                      opacity: 0.65,
                                    }}
                                  >
                                    {t.role}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Arrows */}

                  {showArrows && total > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="no-global-style"
                        style={{
                          position: "absolute",
                          left: -20,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          border: "none",
                          background: accentColor || "var(--primary-color)",
                          color: "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          zIndex: 10,
                        }}
                      >
                        ‹
                      </button>

                      <button
                        onClick={nextSlide}
                        className="no-global-style"
                        style={{
                          position: "absolute",
                          right: -20,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          border: "none",
                          background: accentColor || "var(--primary-color)",
                          color: "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          zIndex: 10,
                        }}
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>

                {/* Dots */}

                {showDots && total > 1 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 8,
                      marginTop: 28,
                    }}
                  >
                    {testimonials.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveSlide(i)}
                        className="no-global-style"
                        style={{
                          width: i === activeSlide ? 28 : 10,
                          height: 10,
                          borderRadius: 5,
                          border: "none",
                          background:
                            i === activeSlide
                              ? accentColor || "var(--primary-color)"
                              : "#d1d5db",
                          cursor: "pointer",
                          transition: "all 300ms",
                          padding: 0,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        );
      }

      return (
        <>
          <section style={{ backgroundColor, padding: `${padding}px 0` }}>
            <div
              style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}
            >
              {headerBlock}

              <div
                className="pb-grid-ncol"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                  gap: 24,
                }}
              >
                {testimonials.map((t, i) => (
                  <div
                    key={i}
                    style={{
                      ...getCardStyles(),
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                      textAlign: contentAlign,
                    }}
                  >
                    {/* Avatar Top Layout */}

                    {layoutStyle === "avatar-top" && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: getFlexAlign(contentAlign),
                          gap: 12,
                          marginBottom: 8,
                        }}
                      >
                        {t.avatar ? (
                          <img
                            src={t.avatar}
                            alt={t.author}
                            style={{
                              width: avSize,
                              height: avSize,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: avSize,
                              height: avSize,
                              borderRadius: "50%",
                              backgroundColor:
                                accentColor || "var(--primary-color)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: avSize * 0.4,
                            }}
                          >
                            {t.author?.charAt(0) || "?"}
                          </div>
                        )}

                        <div style={{ textAlign: contentAlign }}>
                          <p
                            style={{
                              fontWeight: 600,
                              color: accentColor || "var(--primary-color)",
                              fontSize: 14,
                              marginBottom: 2,
                            }}
                          >
                            {t.author}
                          </p>

                          {t.role && (
                            <p
                              style={{
                                fontSize: 12,
                                color: "var(--text-color)",
                                opacity: 0.65,
                              }}
                            >
                              {t.role}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Rating - shown for all layouts except positioned differently for centered */}

                    {t.rating && (
                      <div
                        style={{
                          display: "flex",
                          gap: 2,
                          color: starColor,
                          justifyContent: getFlexAlign(contentAlign),
                        }}
                      >
                        {Array.from({ length: 5 }, (_, j) => (
                          <span
                            key={j}
                            style={{
                              opacity: j < t.rating ? 1 : 0.25,
                              fontSize: layoutStyle === "centered" ? 18 : 14,
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quote */}

                    <p
                      style={{
                        fontSize: "var(--base-font-size, 0.95rem)",
                        lineHeight: "var(--line-height, 1.7)",
                        color: "var(--text-color)",
                        fontStyle:
                          layoutStyle === "minimal" ? "normal" : "italic",
                        flex: 1,
                      }}
                    >
                      {showQuotes && (
                        <span
                          style={{
                            color: accentColor || "var(--primary-color)",
                            fontSize: "1.5em",
                            marginRight: 4,
                          }}
                        >
                          "
                        </span>
                      )}

                      {t.quote}

                      {showQuotes && (
                        <span
                          style={{
                            color: accentColor || "var(--primary-color)",
                            fontSize: "1.5em",
                            marginLeft: 4,
                          }}
                        >
                          "
                        </span>
                      )}
                    </p>

                    {/* Standard & Minimal Layout - Author at bottom */}

                    {(layoutStyle === "standard" ||
                      layoutStyle === "minimal") && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          paddingTop: 12,
                          borderTop:
                            cardStyle === "minimal"
                              ? "none"
                              : "1px solid #e5e7eb",
                          justifyContent: getFlexAlign(contentAlign),
                          flexDirection:
                            contentAlign === "right" ? "row-reverse" : "row",
                        }}
                      >
                        {t.avatar ? (
                          <img
                            src={t.avatar}
                            alt={t.author}
                            style={{
                              width: avSize,
                              height: avSize,
                              borderRadius: "50%",
                              objectFit: "cover",
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: avSize,
                              height: avSize,
                              borderRadius: "50%",
                              backgroundColor:
                                accentColor || "var(--primary-color)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: avSize * 0.4,
                              flexShrink: 0,
                            }}
                          >
                            {t.author?.charAt(0) || "?"}
                          </div>
                        )}

                        <div style={{ textAlign: "left" }}>
                          <p
                            style={{
                              fontWeight: 600,
                              color: accentColor || "var(--primary-color)",
                              fontSize: 14,
                              marginBottom: 2,
                            }}
                          >
                            {t.author}
                          </p>

                          {t.role && (
                            <p
                              style={{
                                fontSize: 12,
                                color: "var(--text-color)",
                                opacity: 0.65,
                              }}
                            >
                              {t.role}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Centered Layout - Author centered */}

                    {layoutStyle === "centered" && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 8,
                          paddingTop: 12,
                        }}
                      >
                        {t.avatar ? (
                          <img
                            src={t.avatar}
                            alt={t.author}
                            style={{
                              width: avSize,
                              height: avSize,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: avSize,
                              height: avSize,
                              borderRadius: "50%",
                              backgroundColor:
                                accentColor || "var(--primary-color)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: avSize * 0.4,
                            }}
                          >
                            {t.author?.charAt(0) || "?"}
                          </div>
                        )}

                        <div style={{ textAlign: "center" }}>
                          <p
                            style={{
                              fontWeight: 600,
                              color: accentColor || "var(--primary-color)",
                              fontSize: 14,
                            }}
                          >
                            {t.author}
                          </p>

                          {t.role && (
                            <p
                              style={{
                                fontSize: 12,
                                color: "var(--text-color)",
                                opacity: 0.65,
                              }}
                            >
                              {t.role}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      );
    },
  },
};

// ─── ConditionalZone ─────────────────────────────────────────────────────────
// Renders a DropZone only when it contains blocks; collapses to nothing when
// empty so no visual gap appears above the header or below the footer.

function ConditionalZone({ zone }: { zone: string }) {
  const { appState } = usePuck();
  const items = appState?.data?.zones?.[zone as keyof typeof appState.data.zones];
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div data-zone={zone}>
      <DropZone zone={zone} />
    </div>
  );
}

export const previewConfig: Config<Props, RootProps> = {
  root: {
    render: ({ children }) => <>{children}</>,
  },

  components: commonComponents,
};


// ─── Image Component ──────────────────────────────────────────────────────

const ImageComponent = {
  label: "Image",
  fields: {
    _tabs: {
      type: "custom",
      label: "",
      render: ({ value: _v, onChange: _onChange }: any) => {
        const { selectedItem, appState, dispatch } = usePuck();
        const props = selectedItem?.props ?? {};
        const set = (key: string, val: any) => {
          if (!selectedItem) return;
          const state = appState.data;
          let destinationZone = "root:default-zone";
          let destinationIndex = 0;
          const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
          for (const [zone, items] of Object.entries(zones)) {
            const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
            if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
          }
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...props, [key]: val } } });
        };

        const bgType = props.advBgType ?? "none";

        return (
          <BlockTabBar blockKey="Image">
            {(tab) => (
              <>
                {/* ── CONTENT TAB ── */}
                {tab === "content" && (
                  <>
                    <ImageField label="Image" value={props.imageUrl ?? ""} onChange={(v) => set("imageUrl", v)} />
                    <StackedTextField label="Alt Text" value={props.altText ?? ""} onChange={(v) => set("altText", v)} placeholder="Describe the image..." />
                    <StackedTextField label="Caption" value={props.caption ?? ""} onChange={(v) => set("caption", v)} placeholder="Optional caption..." />
                    <StackedTextField label="Link URL" value={props.linkUrl ?? ""} onChange={(v) => set("linkUrl", v)} placeholder="https://..." />
                    <InlineSelect
                      label="Link Target"
                      value={props.linkTarget ?? "_self"}
                      onChange={(v) => set("linkTarget", v)}
                      options={[
                        { value: "_self", label: "Same Tab" },
                        { value: "_blank", label: "New Tab" },
                      ]}
                    />
                    <ToggleField label="Lazy Load" value={props.lazyLoad !== false} onChange={(v) => set("lazyLoad", v)} />
                  </>
                )}

                {/* ── STYLE TAB ── */}
                {tab === "style" && (
                  <>
                    <TabSection title="Sizing" />
                    <NumberUnitField
                      label="Width"
                      value={props.imgWidth ?? 100}
                      unit={props.imgWidthUnit ?? "%"}
                      onValueChange={(v) => set("imgWidth", v)}
                      onUnitChange={(u) => set("imgWidthUnit", u)}
                      units={["%", "px", "vw"]}
                      min={0} max={9999} step={1}
                    />
                    <NumberUnitField
                      label="Height"
                      value={props.imgHeight ?? 0}
                      unit={props.imgHeightUnit ?? "px"}
                      onValueChange={(v) => set("imgHeight", v)}
                      onUnitChange={(u) => set("imgHeightUnit", u)}
                      units={["px", "vh", "auto"]}
                      min={0} max={9999} step={1}
                    />
                    <InlineSelect
                      label="Object Fit"
                      value={props.objectFit ?? "cover"}
                      onChange={(v) => set("objectFit", v)}
                      options={[
                        { value: "cover", label: "Cover" },
                        { value: "contain", label: "Contain" },
                        { value: "fill", label: "Fill" },
                        { value: "scale-down", label: "Scale Down" },
                        { value: "none", label: "None" },
                      ]}
                    />

                    <TabSection title="Border" />
                    <InlineSelect
                      label="Border Style"
                      value={props.borderStyle ?? "none"}
                      onChange={(v) => set("borderStyle", v)}
                      options={[
                        { value: "none", label: "None" },
                        { value: "solid", label: "Solid" },
                        { value: "dashed", label: "Dashed" },
                        { value: "dotted", label: "Dotted" },
                      ]}
                    />
                    {props.borderStyle && props.borderStyle !== "none" && (
                      <>
                        <StackedNumberField label="Border Width (px)" value={props.borderWidth ?? 1} onChange={(v) => set("borderWidth", v)} min={1} max={20} step={1} />
                        <ColorPickerField label="Border Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
                      </>
                    )}
                    <StackedTextField label="Border Radius" value={props.borderRadius ?? "0px"} onChange={(v) => set("borderRadius", v)} placeholder="e.g. 8px or 50%" />

                    <TabSection title="Effects" />
                    <StackedNumberField label="Opacity (%)" value={props.opacity ?? 100} onChange={(v) => set("opacity", v)} min={0} max={100} step={1} />
                    <InlineSelect
                      label="Hover Effect"
                      value={props.hoverEffect ?? "none"}
                      onChange={(v) => set("hoverEffect", v)}
                      options={[
                        { value: "none", label: "None" },
                        { value: "zoom", label: "Zoom" },
                        { value: "grayscale", label: "Grayscale" },
                        { value: "blur", label: "Blur" },
                        { value: "brightness", label: "Brightness" },
                      ]}
                    />
                    <StackedNumberField label="CSS Blur (px)" value={props.cssBlur ?? 0} onChange={(v) => set("cssBlur", v)} min={0} max={20} step={1} />
                    <StackedNumberField label="CSS Brightness (%)" value={props.cssBrightness ?? 100} onChange={(v) => set("cssBrightness", v)} min={0} max={200} step={5} />
                    <StackedNumberField label="CSS Contrast (%)" value={props.cssContrast ?? 100} onChange={(v) => set("cssContrast", v)} min={0} max={200} step={5} />
                    <StackedNumberField label="CSS Saturate (%)" value={props.cssSaturate ?? 100} onChange={(v) => set("cssSaturate", v)} min={0} max={300} step={5} />

                    <TabSection title="Caption Style" />
                    <InlineSelect
                      label="Caption Position"
                      value={props.captionPosition ?? "below"}
                      onChange={(v) => set("captionPosition", v)}
                      options={[
                        { value: "below", label: "Below" },
                        { value: "overlay", label: "Overlay" },
                      ]}
                    />
                    <ColorPickerField label="Caption Color" value={props.captionColor ?? ""} onChange={(v) => set("captionColor", v)} />
                    <StackedNumberField label="Caption Font Size (px)" value={props.captionFontSize ?? 13} onChange={(v) => set("captionFontSize", v)} min={10} max={32} step={1} />
                    <ColorPickerField label="Caption Background" value={props.captionBackground ?? ""} onChange={(v) => set("captionBackground", v)} />
                    <AlignField
                      label="Caption Align"
                      value={props.captionAlign ?? "center"}
                      onChange={(v) => set("captionAlign", v)}
                      options={[
                        { value: "left",   icon: <AlignLeft   size={15} />, title: "Left"   },
                        { value: "center", icon: <AlignCenter size={15} />, title: "Center" },
                        { value: "right",  icon: <AlignRight  size={15} />, title: "Right"  },
                      ]}
                    />

                    <TabSection title="Alignment" />
                    <AlignField
                      label="Alignment"
                      value={props.alignment ?? "center"}
                      onChange={(v) => set("alignment", v)}
                      options={[
                        { value: "left",   icon: <AlignLeft   size={15} />, title: "Left"   },
                        { value: "center", icon: <AlignCenter size={15} />, title: "Center" },
                        { value: "right",  icon: <AlignRight  size={15} />, title: "Right"  },
                      ]}
                    />
                  </>
                )}

                {/* ── ADVANCED TAB ── */}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 0, right: 0, bottom: 0, left: 0 }} onChange={(v) => set("advPadding", v)} />

                    <TabSection title="Background" />
                    <InlineSelect
                      label="Type"
                      value={bgType}
                      onChange={(v) => set("advBgType", v)}
                      options={[
                        { value: "none", label: "None" },
                        { value: "color", label: "Color" },
                      ]}
                    />
                    {bgType === "color" && (
                      <ColorPickerField label="Color" value={props.advBgColor ?? ""} onChange={(v) => set("advBgColor", v)} />
                    )}

                    <TabSection title="Responsive" />
                    <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                    <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
                    <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />

                  </>
                )}
              </>
            )}
          </BlockTabBar>
        );
      },
    },
  },

  defaultProps: {
    imageUrl: "",
    altText: "",
    caption: "",
    linkUrl: "",
    linkTarget: "_self",
    lazyLoad: true,
    imgWidth: 100,
    imgWidthUnit: "%",
    imgHeight: 0,
    imgHeightUnit: "px",
    objectFit: "cover",
    borderStyle: "none",
    borderWidth: 1,
    borderColor: "",
    borderRadius: "0px",
    opacity: 100,
    hoverEffect: "none",
    cssBlur: 0,
    cssBrightness: 100,
    cssContrast: 100,
    cssSaturate: 100,
    captionPosition: "below",
    captionColor: "",
    captionFontSize: 13,
    captionBackground: "",
    captionAlign: "center",
    alignment: "center",
    advBgType: "none",
    advBgColor: "",
    advMargin: { top: 0, right: 0, bottom: 0, left: 0 },
    advPadding: { top: 0, right: 0, bottom: 0, left: 0 },
    hideDesktop: false,
    hideTablet: false,
    hideMobile: false,
    cssId: "",
    cssClass: "",
    customCss: "",
    zIndex: null,
  },

  render: ({
    imageUrl,
    altText,
    caption,
    linkUrl,
    linkTarget,
    lazyLoad,
    imgWidth,
    imgWidthUnit,
    imgHeight,
    imgHeightUnit,
    objectFit,
    borderStyle,
    borderWidth,
    borderColor,
    borderRadius,
    opacity,
    hoverEffect,
    cssBlur,
    cssBrightness,
    cssContrast,
    cssSaturate,
    captionPosition,
    captionColor,
    captionFontSize,
    captionBackground,
    captionAlign,
    alignment,
    advBgType,
    advBgColor,
    advMargin,
    advPadding,
    hideDesktop,
    hideTablet,
    hideMobile,
    cssId,
    cssClass,
    customCss,
    zIndex,
  }: any) => {
    const cssFilter = [
      cssBlur ? `blur(${cssBlur}px)` : "",
      cssBrightness !== 100 ? `brightness(${cssBrightness}%)` : "",
      cssContrast !== 100 ? `contrast(${cssContrast}%)` : "",
      cssSaturate !== 100 ? `saturate(${cssSaturate}%)` : "",
    ].filter(Boolean).join(" ");

    const wrapBgStyle: React.CSSProperties = advBgType === "color" && advBgColor
      ? { backgroundColor: advBgColor }
      : {};

    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");

    const imgId = cssId || `img-${Math.random().toString(36).slice(2, 7)}`;
    const hoverStyles = hoverEffect && hoverEffect !== "none" ? `
      #${imgId} .pb-img-wrap { overflow: hidden; }
      #${imgId} .pb-img-wrap img { transition: all 0.35s ease; }
      #${imgId}:hover .pb-img-wrap img {
        ${hoverEffect === "zoom" ? "transform: scale(1.08);" : ""}
        ${hoverEffect === "grayscale" ? "filter: grayscale(1);" : ""}
        ${hoverEffect === "blur" ? "filter: blur(4px);" : ""}
        ${hoverEffect === "brightness" ? "filter: brightness(1.3);" : ""}
      }
    ` : "";

    const wUnit = imgWidthUnit ?? "%";
    const hUnit = imgHeightUnit ?? "px";
    const widthVal = wUnit === "auto" ? "auto" : `${imgWidth ?? 100}${wUnit}`;
    const heightVal = (hUnit === "auto" || !imgHeight) ? "auto" : `${imgHeight}${hUnit}`;

    if (!imageUrl) return (
      <div style={{ padding: 16, textAlign: alignment as any, color: "#9ca3af", fontSize: 14, border: "2px dashed #e5e7eb", borderRadius: borderRadius || "0px", margin: "0 auto" }}>
        <div>No image selected. Use the property panel to add an image.</div>
        {altText && <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>Alt: {altText}</div>}
      </div>
    );

    const imgEl = (
      <img
        src={imageUrl}
        alt={altText ?? ""}
        loading={lazyLoad !== false ? "lazy" : "eager"}
        style={{
          width: "100%",
          height: heightVal,
          objectFit: objectFit as any,
          display: "block",
          filter: cssFilter || undefined,
          borderStyle: borderStyle !== "none" ? borderStyle : undefined,
          borderWidth: borderStyle !== "none" ? (borderWidth || 1) : undefined,
          borderColor: borderStyle !== "none" ? (borderColor || "#e5e7eb") : undefined,
          opacity: (opacity ?? 100) / 100,
        }}
      />
    );

    const captionEl = caption && (
      captionPosition === "overlay"
        ? (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            backgroundColor: captionBackground || "rgba(0,0,0,0.5)",
            color: captionColor || "#fff",
            fontSize: captionFontSize || 13,
            padding: "8px 12px",
            textAlign: captionAlign as any,
          }}>
            {caption}
          </div>
        )
        : (
          <div style={{
            fontSize: captionFontSize || 13,
            color: captionColor || "var(--text-color, #374151)",
            backgroundColor: captionBackground || "transparent",
            padding: "6px 0",
            textAlign: captionAlign as any,
            fontStyle: "italic",
          }}>
            {caption}
          </div>
        )
    );

    return (
      <div
        id={imgId}
        className={[`puck-img-wrap-outer`, hideClasses, cssClass].filter(Boolean).join(" ") || undefined}
        style={{
          paddingTop: advPadding?.top ?? 0, paddingRight: advPadding?.right ?? 0,
          paddingBottom: advPadding?.bottom ?? 0, paddingLeft: advPadding?.left ?? 0,
          marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0,
          marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0,
          textAlign: alignment as any,
          zIndex: zIndex ?? undefined,
          ...wrapBgStyle,
        }}
      >
        {(hoverStyles || customCss) && (
          <style>{hoverStyles}{customCss ? `#${imgId} { ${customCss} }` : ""}</style>
        )}
        <div
          className="pb-img-wrap"
          style={{
            display: "block",
            width: widthVal,
            maxWidth: "100%",
            marginLeft: alignment === "center" || alignment === "right" ? "auto" : undefined,
            marginRight: alignment === "center" || alignment === "left" ? "auto" : undefined,
            position: "relative",
            overflow: "hidden",
            borderRadius: borderRadius || "0px",
          }}
        >
          {linkUrl
            ? <a href={linkUrl} target={linkTarget ?? "_self"} rel={linkTarget === "_blank" ? "noopener noreferrer" : undefined} style={{ display: "block" }}>{imgEl}</a>
            : imgEl
          }
          {captionPosition === "overlay" && captionEl}
        </div>
        {captionPosition !== "overlay" && captionEl}
      </div>
    );
  },
};

// ─── Spacer Component ────────────────────────────────────────────────────────

const SpaceComponent = {
  label: "Spacer",
  fields: {
    _tabs: {
      type: "custom",
      label: "",
      render: ({ value: _v, onChange: _onChange }: any) => {
        const { selectedItem, appState, dispatch } = usePuck();
        const props = selectedItem?.props ?? {};
        const set = (key: string, val: any) => {
          if (!selectedItem) return;
          const state = appState.data;
          let destinationZone = "root:default-zone";
          let destinationIndex = 0;
          const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
          for (const [zone, items] of Object.entries(zones)) {
            const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
            if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
          }
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...props, [key]: val } } });
        };

        return (
          <BlockTabBar blockKey="Space">
            {(tab) => (
              <>
                {/* ── CONTENT TAB ── */}
                {tab === "content" && (
                  <>
                    <NumberUnitField
                      label="Height Desktop"
                      value={props.heightDesktop ?? 32}
                      unit={props.heightDesktopUnit ?? "px"}
                      onValueChange={(v) => set("heightDesktop", v)}
                      onUnitChange={(u) => set("heightDesktopUnit", u)}
                      units={["px", "vh", "rem"]}
                      min={0} max={9999} step={1}
                    />
                    <NumberUnitField
                      label="Height Tablet"
                      value={props.heightTablet ?? 0}
                      unit={props.heightTabletUnit ?? "px"}
                      onValueChange={(v) => set("heightTablet", v)}
                      onUnitChange={(u) => set("heightTabletUnit", u)}
                      units={["px", "vh", "rem"]}
                      min={0} max={9999} step={1}
                    />
                    <NumberUnitField
                      label="Height Mobile"
                      value={props.heightMobile ?? 0}
                      unit={props.heightMobileUnit ?? "px"}
                      onValueChange={(v) => set("heightMobile", v)}
                      onUnitChange={(u) => set("heightMobileUnit", u)}
                      units={["px", "vh", "rem"]}
                      min={0} max={9999} step={1}
                    />
                  </>
                )}

                {/* ── STYLE TAB ── */}
                {tab === "style" && (
                  <>
                    <ColorPickerField label="Background Color" value={props.backgroundColor ?? ""} onChange={(v) => set("backgroundColor", v)} />
                  </>
                )}

                {/* ── ADVANCED TAB ── */}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Responsive" />
                    <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                    <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
                    <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />

                  </>
                )}
              </>
            )}
          </BlockTabBar>
        );
      },
    },
  },

  defaultProps: {
    heightDesktop: 32,
    heightDesktopUnit: "px",
    heightTablet: 0,
    heightTabletUnit: "px",
    heightMobile: 0,
    heightMobileUnit: "px",
    backgroundColor: "",
    hideDesktop: false,
    hideTablet: false,
    hideMobile: false,
    cssId: "",
    cssClass: "",
    zIndex: null,
  },

  render: ({ heightDesktop, heightDesktopUnit, heightTablet, heightTabletUnit, heightMobile, heightMobileUnit, backgroundColor, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex }: any) => {
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const hD = `${heightDesktop || 32}${heightDesktopUnit || "px"}`;
    const hT = heightTablet ? `${heightTablet}${heightTabletUnit || "px"}` : hD;
    const hM = heightMobile ? `${heightMobile}${heightMobileUnit || "px"}` : hT;
    const responsiveCss = `
      .spacer-${cssId || "default"} { height: ${hD}; }
      @media (max-width: 1024px) { .spacer-${cssId || "default"} { height: ${hT}; } }
      @media (max-width: 640px) { .spacer-${cssId || "default"} { height: ${hM}; } }
    `;
    return (
      <div
        id={cssId || undefined}
        className={[`spacer-${cssId || "default"}`, hideClasses, cssClass].filter(Boolean).join(" ") || undefined}
        style={{ backgroundColor: backgroundColor || "transparent", zIndex: zIndex ?? undefined }}
      >
        <style>{responsiveCss}</style>
      </div>
    );
  },
};

// ─── Button Component ─────────────────────────────────────────────────────────

const ButtonComponent = {
  label: "Button",
  fields: {
    _tabs: {
      type: "custom",
      label: "",
      render: ({ value: _v, onChange: _onChange }: any) => {
        const { selectedItem, appState, dispatch } = usePuck();
        const props = selectedItem?.props ?? {};
        const set = (key: string, val: any) => {
          if (!selectedItem) return;
          const state = appState.data;
          let destinationZone = "root:default-zone";
          let destinationIndex = 0;
          const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
          for (const [zone, items] of Object.entries(zones)) {
            const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
            if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
          }
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...props, [key]: val } } });
        };

        const bgType = props.advBgType ?? "none";

        return (
          <BlockTabBar blockKey="Button">
            {(tab) => (
              <>
                {/* ── CONTENT TAB ── */}
                {tab === "content" && (
                  <>
                    <StackedTextField label="Label" value={props.label ?? "Click Me"} onChange={(v) => set("label", v)} placeholder="Button label..." />
                    <StackedTextField label="Link URL" value={props.linkUrl ?? ""} onChange={(v) => set("linkUrl", v)} placeholder="https://..." />
                    <InlineSelect
                      label="Link Target"
                      value={props.linkTarget ?? "_self"}
                      onChange={(v) => set("linkTarget", v)}
                      options={[
                        { value: "_self", label: "Same Tab" },
                        { value: "_blank", label: "New Tab" },
                      ]}
                    />
                    <StackedTextField label="Icon (emoji or SVG)" value={props.icon ?? ""} onChange={(v) => set("icon", v)} placeholder="e.g. 🚀 or leave blank" />
                    <InlineSelect
                      label="Icon Position"
                      value={props.iconPosition ?? "before"}
                      onChange={(v) => set("iconPosition", v)}
                      options={[
                        { value: "before", label: "Before Label" },
                        { value: "after", label: "After Label" },
                      ]}
                    />
                    <ToggleField label="Full Width" value={!!props.fullWidth} onChange={(v) => set("fullWidth", v)} />
                    <AlignField
                      label="Alignment"
                      value={props.alignment ?? "left"}
                      onChange={(v) => set("alignment", v)}
                      options={[
                        { value: "left",   icon: <AlignLeft   size={15} />, title: "Left"   },
                        { value: "center", icon: <AlignCenter size={15} />, title: "Center" },
                        { value: "right",  icon: <AlignRight  size={15} />, title: "Right"  },
                      ]}
                    />
                  </>
                )}

                {/* ── STYLE TAB ── */}
                {tab === "style" && (
                  <>
                    <TabSection title="Typography" />
                    <InlineSelect
                      label="Font Family"
                      value={props.fontFamily ?? "inherit"}
                      onChange={(v) => set("fontFamily", v)}
                      options={[
                        { value: "inherit", label: "Theme Default" },
                        { value: "serif", label: "Serif" },
                        { value: "sans-serif", label: "Sans-serif" },
                        { value: "monospace", label: "Monospace" },
                        { value: "Arial, sans-serif", label: "Arial" },
                        { value: "'Helvetica Neue', sans-serif", label: "Helvetica" },
                      ]}
                    />
                    <StackedNumberField label="Font Size (px)" value={props.fontSize ?? null} onChange={(v) => set("fontSize", v)} placeholder="e.g. 16" min={8} max={64} step={1} />
                    <InlineSelect
                      label="Font Weight"
                      value={String(props.fontWeight ?? "600")}
                      onChange={(v) => set("fontWeight", v)}
                      options={[
                        { value: "400", label: "Normal" },
                        { value: "600", label: "Semi Bold" },
                        { value: "700", label: "Bold" },
                      ]}
                    />
                    <InlineSelect
                      label="Text Transform"
                      value={props.textTransform ?? "none"}
                      onChange={(v) => set("textTransform", v)}
                      options={[
                        { value: "none", label: "None" },
                        { value: "uppercase", label: "Uppercase" },
                        { value: "lowercase", label: "Lowercase" },
                      ]}
                    />
                    <StackedNumberField label="Letter Spacing (px)" value={props.letterSpacing ?? null} onChange={(v) => set("letterSpacing", v)} placeholder="e.g. 0.5" min={-5} max={20} step={0.5} />

                    <TabSection title="Normal State" />
                    <ColorPickerField label="Text Color" value={props.textColor ?? ""} onChange={(v) => set("textColor", v)} />
                    <ColorPickerField label="Background Color" value={props.bgColor ?? ""} onChange={(v) => set("bgColor", v)} />
                    <InlineSelect
                      label="Border Style"
                      value={props.borderStyle ?? "none"}
                      onChange={(v) => set("borderStyle", v)}
                      options={[
                        { value: "none", label: "None" },
                        { value: "solid", label: "Solid" },
                        { value: "dashed", label: "Dashed" },
                        { value: "dotted", label: "Dotted" },
                      ]}
                    />
                    {props.borderStyle && props.borderStyle !== "none" && (
                      <>
                        <StackedNumberField label="Border Width (px)" value={props.borderWidth ?? 2} onChange={(v) => set("borderWidth", v)} min={1} max={10} step={1} />
                        <ColorPickerField label="Border Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
                      </>
                    )}
                    <StackedTextField label="Border Radius" value={props.borderRadius ?? "var(--button-border-radius, 6px)"} onChange={(v) => set("borderRadius", v)} placeholder="e.g. 6px or 50%" />

                    <TabSection title="Hover State" />
                    <ColorPickerField label="Text Hover Color" value={props.hoverTextColor ?? ""} onChange={(v) => set("hoverTextColor", v)} />
                    <ColorPickerField label="Background Hover" value={props.hoverBgColor ?? ""} onChange={(v) => set("hoverBgColor", v)} />
                    <InlineSelect
                      label="Hover Animation"
                      value={props.hoverAnimation ?? "none"}
                      onChange={(v) => set("hoverAnimation", v)}
                      options={[
                        { value: "none", label: "None" },
                        { value: "grow", label: "Grow" },
                        { value: "shrink", label: "Shrink" },
                        { value: "pulse", label: "Pulse" },
                      ]}
                    />

                    <TabSection title="Sizing" />
                    <InlineSelect
                      label="Size Preset"
                      value={props.sizePreset ?? "medium"}
                      onChange={(v) => set("sizePreset", v)}
                      options={[
                        { value: "small", label: "Small" },
                        { value: "medium", label: "Medium" },
                        { value: "large", label: "Large" },
                        { value: "custom", label: "Custom" },
                      ]}
                    />
                    {props.sizePreset === "custom" && (
                      <>
                        <FourSideField label="Padding (px)" value={props.customPadding ?? { top: 12, right: 24, bottom: 12, left: 24 }} onChange={(v) => set("customPadding", v)} />
                      </>
                    )}
                  </>
                )}

                {/* ── ADVANCED TAB ── */}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />

                    <TabSection title="Background" />
                    <InlineSelect
                      label="Wrapper BG Type"
                      value={bgType}
                      onChange={(v) => set("advBgType", v)}
                      options={[
                        { value: "none", label: "None" },
                        { value: "color", label: "Color" },
                      ]}
                    />
                    {bgType === "color" && (
                      <ColorPickerField label="Wrapper BG Color" value={props.advBgColor ?? ""} onChange={(v) => set("advBgColor", v)} />
                    )}

                    <TabSection title="Responsive" />
                    <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                    <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
                    <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />

                    <StackedNumberField label="Opacity (%)" value={props.opacity ?? 100} onChange={(v) => set("opacity", v)} min={0} max={100} step={1} />
                  </>
                )}
              </>
            )}
          </BlockTabBar>
        );
      },
    },
  },

  defaultProps: {
    label: "Click Me",
    linkUrl: "",
    linkTarget: "_self",
    icon: "",
    iconPosition: "before",
    fullWidth: false,
    alignment: "left",
    fontFamily: "inherit",
    fontSize: null,
    fontWeight: "600",
    textTransform: "none",
    letterSpacing: null,
    textColor: "#ffffff",
    bgColor: "var(--primary-color, #0158ad)",
    borderStyle: "none",
    borderWidth: 2,
    borderColor: "",
    borderRadius: "var(--button-border-radius, 6px)",
    hoverTextColor: "",
    hoverBgColor: "",
    hoverBorderColor: "",
    hoverAnimation: "none",
    sizePreset: "medium",
    customPadding: { top: 12, right: 24, bottom: 12, left: 24 },
    advBgType: "none",
    advBgColor: "",
    advMargin: { top: 0, right: 0, bottom: 0, left: 0 },
    hideDesktop: false,
    hideTablet: false,
    hideMobile: false,
    cssId: "",
    cssClass: "",
    customCss: "",
    zIndex: null,
    opacity: 100,
  },

  render: ({
    label,
    linkUrl,
    linkTarget,
    icon,
    iconPosition,
    fullWidth,
    alignment,
    fontFamily,
    fontSize,
    fontWeight,
    textTransform,
    letterSpacing,
    textColor,
    bgColor,
    borderStyle,
    borderWidth,
    borderColor,
    borderRadius,
    hoverTextColor,
    hoverBgColor,
    hoverBorderColor,
    hoverAnimation,
    sizePreset,
    customPadding,
    advBgType,
    advBgColor,
    advMargin,
    hideDesktop,
    hideTablet,
    hideMobile,
    cssId,
    cssClass,
    customCss,
    zIndex,
    opacity,
  }) => {
    const sizeMap = {
      small:  { paddingTop: 8,  paddingRight: 16, paddingBottom: 8,  paddingLeft: 16 },
      medium: { paddingTop: 12, paddingRight: 24, paddingBottom: 12, paddingLeft: 24 },
      large:  { paddingTop: 16, paddingRight: 32, paddingBottom: 16, paddingLeft: 32 },
      custom: customPadding ? { paddingTop: customPadding.top, paddingRight: customPadding.right, paddingBottom: customPadding.bottom, paddingLeft: customPadding.left } : {},
    };

    const padding = sizeMap[sizePreset ?? "medium"] ?? sizeMap.medium;

    const hoverCss = `
      .puck-btn-${cssId || "default"}:hover {
        ${hoverTextColor ? `color: ${hoverTextColor} !important;` : ""}
        ${hoverBgColor ? `background: ${hoverBgColor} !important;` : ""}
        ${hoverBorderColor ? `border-color: ${hoverBorderColor} !important;` : ""}
        ${hoverAnimation === "grow" ? "transform: scale(1.05);" : ""}
        ${hoverAnimation === "shrink" ? "transform: scale(0.96);" : ""}
        ${hoverAnimation === "pulse" ? "animation: puck-pulse 0.6s ease;" : ""}
      }
      .puck-btn-${cssId || "default"} { transition: all 0.2s ease; }
      @keyframes puck-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
    `;

    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const wrapBg = advBgType === "color" && advBgColor ? { backgroundColor: advBgColor } : {};

    const btnEl = (
      <button
        className={`puck-btn-${cssId || "default"}`}
        style={{
          display: fullWidth ? "flex" : "inline-flex",
          width: fullWidth ? "100%" : undefined,
          alignItems: "center",
          justifyContent: "center",
          gap: icon ? 8 : 0,
          ...padding,
          fontFamily: fontFamily && fontFamily !== "inherit" ? fontFamily : "var(--font-family)",
          fontSize: fontSize ? `${fontSize}px` : undefined,
          fontWeight: fontWeight ?? "600",
          textTransform: (textTransform ?? "none") as any,
          letterSpacing: letterSpacing != null ? `${letterSpacing}px` : undefined,
          color: textColor || "#fff",
          background: bgColor || "var(--primary-color, #0158ad)",
          border: borderStyle !== "none" ? `${borderWidth ?? 2}px ${borderStyle} ${borderColor || "transparent"}` : "none",
          borderRadius: borderRadius || "6px",
          cursor: "pointer",
          opacity: opacity != null ? opacity / 100 : 1,
          textDecoration: "none",
        }}
      >
        {icon && iconPosition === "before" && <span>{icon}</span>}
        {label || "Button"}
        {icon && iconPosition === "after" && <span>{icon}</span>}
      </button>
    );

    return (
      <div
        id={cssId || undefined}
        className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined}
        style={{ textAlign: alignment as any, zIndex: zIndex ?? undefined, marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0, marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0, ...wrapBg }}
      >
        <style>{hoverCss}{customCss ? `#${cssId || "btn-block"} { ${customCss} }` : ""}</style>
        {linkUrl
          ? <a href={linkUrl} target={linkTarget ?? "_self"} rel={linkTarget === "_blank" ? "noopener noreferrer" : undefined} style={{ textDecoration: "none", display: fullWidth ? "block" : "inline-block" }}>{btnEl}</a>
          : btnEl
        }
      </div>
    );
  },
};

// ─── Divider Component ────────────────────────────────────────────────────────

const DividerComponent = {
  label: "Divider",
  fields: {
    _tabs: {
      type: "custom",
      label: "",
      render: ({ value: _v, onChange: _onChange }: any) => {
        const { selectedItem, appState, dispatch } = usePuck();
        const props = selectedItem?.props ?? {};
        const set = (key: string, val: any) => {
          if (!selectedItem) return;
          const state = appState.data;
          let destinationZone = "root:default-zone";
          let destinationIndex = 0;
          const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
          for (const [zone, items] of Object.entries(zones)) {
            const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
            if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
          }
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...props, [key]: val } } });
        };

        const hasElement = !!props.showElement;

        return (
          <BlockTabBar blockKey="Divider">
            {(tab) => (
              <>
                {/* ── CONTENT TAB ── */}
                {tab === "content" && (
                  <>
                    <InlineSelect
                      label="Style"
                      value={props.lineStyle ?? "solid"}
                      onChange={(v) => set("lineStyle", v)}
                      options={[
                        { value: "solid", label: "Solid" },
                        { value: "dashed", label: "Dashed" },
                        { value: "dotted", label: "Dotted" },
                        { value: "double", label: "Double" },
                        { value: "gradient", label: "Gradient" },
                        { value: "wave", label: "Wave" },
                        { value: "zigzag", label: "Zigzag" },
                        { value: "shadow", label: "Shadow" },
                      ]}
                    />
                    <NumberUnitField
                      label="Width"
                      value={props.lineWidthVal ?? 100}
                      unit={props.lineWidthUnit ?? "%"}
                      onValueChange={(v) => set("lineWidthVal", v)}
                      onUnitChange={(u) => set("lineWidthUnit", u)}
                      units={["%", "px", "vw"]}
                      min={0} max={9999} step={1}
                    />
                    <AlignField
                      label="Alignment"
                      value={props.alignment ?? "center"}
                      onChange={(v) => set("alignment", v)}
                      options={[
                        { value: "left",   icon: <AlignLeft   size={15} />, title: "Left"   },
                        { value: "center", icon: <AlignCenter size={15} />, title: "Center" },
                        { value: "right",  icon: <AlignRight  size={15} />, title: "Right"  },
                      ]}
                    />
                    <ToggleField label="Add Icon / Text" value={hasElement} onChange={(v) => set("showElement", v)} />
                    {hasElement && (
                      <>
                        <InlineSelect
                          label="Element Type"
                          value={props.elementType ?? "icon"}
                          onChange={(v) => set("elementType", v)}
                          options={[
                            { value: "icon", label: "Icon / Emoji" },
                            { value: "text", label: "Text" },
                          ]}
                        />
                        {props.elementType === "text" || !props.elementType
                          ? <StackedTextField label="Text" value={props.elementText ?? ""} onChange={(v) => set("elementText", v)} placeholder="OR" />
                          : <StackedTextField label="Icon (emoji or char)" value={props.elementIcon ?? "✦"} onChange={(v) => set("elementIcon", v)} placeholder="e.g. ✦ ★ •" />
                        }
                        <InlineSelect
                          label="Element Position"
                          value={props.elementPosition ?? "center"}
                          onChange={(v) => set("elementPosition", v)}
                          options={[
                            { value: "left", label: "Left" },
                            { value: "center", label: "Center" },
                            { value: "right", label: "Right" },
                          ]}
                        />
                      </>
                    )}
                  </>
                )}

                {/* ── STYLE TAB ── */}
                {tab === "style" && (
                  <>
                    <TabSection title="Line" />
                    <StackedNumberField label="Thickness (px)" value={props.thickness ?? 1} onChange={(v) => set("thickness", v)} min={1} max={20} step={1} />
                    <ColorPickerField label="Color" value={props.lineColor ?? ""} onChange={(v) => set("lineColor", v)} />
                    <StackedTextField label="Gap (top + bottom)" value={props.gap ?? "16px"} onChange={(v) => set("gap", v)} placeholder="e.g. 16px or 1rem" />

                    {hasElement && (
                      <>
                        <TabSection title="Icon / Text Style" />
                        <StackedNumberField label="Icon Size (px)" value={props.iconSize ?? 20} onChange={(v) => set("iconSize", v)} min={10} max={80} step={1} />
                        <ColorPickerField label="Icon Color" value={props.iconColor ?? ""} onChange={(v) => set("iconColor", v)} />
                        <ColorPickerField label="Text Color" value={props.elementTextColor ?? ""} onChange={(v) => set("elementTextColor", v)} />
                        <StackedNumberField label="Text Font Size (px)" value={props.elementFontSize ?? 14} onChange={(v) => set("elementFontSize", v)} min={10} max={48} step={1} />
                        <StackedTextField label="Spacing from Line" value={props.elementSpacing ?? "12px"} onChange={(v) => set("elementSpacing", v)} placeholder="e.g. 12px" />
                      </>
                    )}
                  </>
                )}

                {/* ── ADVANCED TAB ── */}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 0, right: 0, bottom: 0, left: 0 }} onChange={(v) => set("advPadding", v)} />

                    <TabSection title="Responsive" />
                    <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                    <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
                    <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />

                  </>
                )}
              </>
            )}
          </BlockTabBar>
        );
      },
    },
  },

  defaultProps: {
    lineStyle: "solid",
    lineWidthVal: 100,
    lineWidthUnit: "%",
    alignment: "center",
    showElement: false,
    elementType: "icon",
    elementText: "OR",
    elementIcon: "✦",
    elementPosition: "center",
    thickness: 1,
    lineColor: "",
    gap: "16px",
    iconSize: 20,
    iconColor: "",
    elementTextColor: "",
    elementFontSize: 14,
    elementSpacing: "12px",
    advMargin: { top: 0, right: 0, bottom: 0, left: 0 },
    advPadding: { top: 0, right: 0, bottom: 0, left: 0 },
    hideDesktop: false,
    hideTablet: false,
    hideMobile: false,
    cssId: "",
    cssClass: "",
    zIndex: null,
  },

  render: ({
    lineStyle,
    lineWidthVal,
    lineWidthUnit,
    alignment,
    showElement,
    elementType,
    elementText,
    elementIcon,
    elementPosition,
    thickness,
    lineColor,
    gap,
    iconSize,
    iconColor,
    elementTextColor,
    elementFontSize,
    elementSpacing,
    advMargin,
    advPadding,
    hideDesktop,
    hideTablet,
    hideMobile,
    cssId,
    cssClass,
    zIndex,
  }) => {
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const color = lineColor || "#e5e7eb";
    const th = thickness || 1;
    const lineEl = (style: React.CSSProperties) => {
      if (lineStyle === "gradient") {
        return <div style={{ flex: 1, height: th, background: `linear-gradient(90deg, transparent, ${color} 30%, ${color} 70%, transparent)`, alignSelf: "center", ...style }} />;
      }
      if (lineStyle === "shadow") {
        return <div style={{ flex: 1, height: th * 4, background: `radial-gradient(ellipse at 50% 0%, ${color} 0%, transparent 70%)`, alignSelf: "center", ...style }} />;
      }
      if (lineStyle === "wave") {
        const h = Math.max(th * 4, 8);
        return (
          <div style={{ flex: 1, height: h, overflow: "hidden", alignSelf: "center", ...style }}>
            <svg width="100%" height={h} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,4 C15,0 15,8 30,4 S45,0 60,4 S75,8 90,4 S105,0 120,4 S135,8 150,4 S165,0 180,4 S195,8 210,4 S225,0 240,4 S255,8 270,4 S285,0 300,4 S315,8 330,4 S345,0 360,4 S375,8 390,4 S405,0 420,4 S435,8 450,4 S465,0 480,4 S495,8 510,4 S525,0 540,4 S555,8 570,4 S585,0 600,4" fill="none" stroke={color} strokeWidth={th} vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        );
      }
      if (lineStyle === "zigzag") {
        const h = Math.max(th * 4, 8);
        return (
          <div style={{ flex: 1, height: h, overflow: "hidden", alignSelf: "center", ...style }}>
            <svg width="100%" height={h} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="0,8 10,0 20,8 30,0 40,8 50,0 60,8 70,0 80,8 90,0 100,8 110,0 120,8 130,0 140,8 150,0 160,8 170,0 180,8 190,0 200,8 210,0 220,8 230,0 240,8 250,0 260,8 270,0 280,8 290,0 300,8 310,0 320,8 330,0 340,8 350,0 360,8 370,0 380,8 390,0 400,8 410,0 420,8 430,0 440,8 450,0 460,8 470,0 480,8 490,0 500,8 510,0 520,8 530,0 540,8 550,0 560,8 570,0 580,8 590,0 600,8" fill="none" stroke={color} strokeWidth={th} vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        );
      }
      return <div style={{ flex: 1, borderTop: `${th}px ${lineStyle || "solid"} ${color}`, ...style }} />;
    };

    const elementContent = showElement
      ? (
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0, padding: `0 ${elementSpacing || "12px"}` }}>
          {elementType === "text"
            ? <span style={{ fontSize: elementFontSize || 14, color: elementTextColor || color, whiteSpace: "nowrap" }}>{elementText || "OR"}</span>
            : <span style={{ fontSize: iconSize || 20, color: iconColor || color, lineHeight: 1 }}>{elementIcon || "✦"}</span>
          }
        </div>
      )
      : null;

    const lineWidthCss = `${lineWidthVal ?? 100}${lineWidthUnit ?? "%"}`;
    const innerAlign = elementPosition === "left" ? "flex-start" : elementPosition === "right" ? "flex-end" : "center";
    const lineWrap = showElement
      ? (
        <div style={{ display: "flex", alignItems: "center", width: lineWidthCss }}>
          {elementPosition === "center" || elementPosition === "right" ? lineEl({}) : null}
          {elementContent}
          {elementPosition === "center" || elementPosition === "left" ? lineEl({}) : null}
        </div>
      )
      : lineEl({ width: lineWidthCss });

    return (
      <div
        id={cssId || undefined}
        className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined}
        style={{
          paddingTop: (advPadding?.top ?? 0) + parseInt(gap || "16", 10),
          paddingRight: advPadding?.right ?? 0,
          paddingBottom: (advPadding?.bottom ?? 0) + parseInt(gap || "16", 10),
          paddingLeft: advPadding?.left ?? 0,
          marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0,
          marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0,
          display: "flex",
          justifyContent: alignment === "right" ? "flex-end" : alignment === "left" ? "flex-start" : "center",
          zIndex: zIndex ?? undefined,
        }}
      >
        {lineWrap}
      </div>
    );
  },
};

// ─── Video Upload Field ───────────────────────────────────────────────────────

function VideoUploadField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "error">("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const maxSizeMB = 250;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Video file too large. Maximum ${maxSizeMB}MB allowed.`);
      return;
    }
    setUploadStatus("uploading");
    setUploadError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      setUploadStatus("processing");
      const res = await fetch("/api/upload-asset", { method: "POST", body: form });
      const result = (await res.json()) as { ok: true; url: string } | { ok: false; error: string };
      if (!result.ok) throw new Error((result as any).error || "Upload failed");
      onChange((result as any).url);
      setUploadStatus("idle");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      setUploadStatus("error");
    }
  };

  const btnBase: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    padding: "5px 10px", fontSize: 12, fontWeight: 600, borderRadius: 4,
    border: "1px solid var(--p-color-border-subdued)", cursor: "pointer",
    background: "var(--p-color-bg-surface)", color: "var(--p-color-text)",
    transition: "background 0.15s, border-color 0.15s",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {value ? (
        <div style={{ padding: "8px", background: "#f3f4f6", borderRadius: 4, fontSize: 11, color: "#374151", wordBreak: "break-all" }}>
          <strong>Uploaded:</strong> {value.split("/").pop()}
        </div>
      ) : (
        <label
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 6, padding: 16, border: "2px dashed var(--p-color-border)", borderRadius: 6,
            cursor: uploadStatus === "uploading" || uploadStatus === "processing" ? "default" : "pointer",
            background: "var(--p-color-bg-surface-subdued, #f9fafb)",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 10l-3-3m0 0l-3 3m3-3v8"/><rect x="3" y="3" width="18" height="18" rx="2"/>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600 }}>
            {uploadStatus === "uploading" || uploadStatus === "processing" ? "Uploading…" : "Click to upload video"}
          </span>
          <span style={{ fontSize: 11, color: "var(--p-color-text-secondary)" }}>MP4 · MOV · WEBM · up to 250MB</span>
          <input type="file" accept="video/*" onChange={handleFileChange} disabled={uploadStatus === "uploading" || uploadStatus === "processing"} style={{ display: "none" }} />
        </label>
      )}
      {uploadStatus === "error" && uploadError && (
        <div style={{ fontSize: 11, color: "var(--p-color-text-critical, #d72c0d)" }}>{uploadError}</div>
      )}
      {value && (
        <div style={{ display: "flex", gap: 8 }}>
          <label style={{ ...btnBase, flex: 1 }}>
            Replace Video
            <input type="file" accept="video/*" onChange={handleFileChange} disabled={uploadStatus === "uploading" || uploadStatus === "processing"} style={{ display: "none" }} />
          </label>
          <button style={{ ...btnBase, color: "var(--p-color-text-critical, #d72c0d)", borderColor: "var(--p-color-border-critical, #fead9a)" }} onClick={() => onChange("")}>
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Video Component ──────────────────────────────────────────────────────────

const VideoComponent = {
  label: "Video",
  fields: {
    _tabs: {
      type: "custom",
      label: "",
      render: ({ value: _v, onChange: _onChange }: any) => {
        const { selectedItem, appState, dispatch } = usePuck();
        const props = selectedItem?.props ?? {};
        const set = (key: string, val: any) => {
          if (!selectedItem) return;
          const state = appState.data;
          let destinationZone = "root:default-zone";
          let destinationIndex = 0;
          const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
          for (const [zone, items] of Object.entries(zones)) {
            const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
            if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
          }
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...props, [key]: val } } });
        };

        return (
          <BlockTabBar blockKey="Video">
            {(tab) => (
              <>
                {/* ── CONTENT TAB ── */}
                {tab === "content" && (
                  <>
                    <InlineSelect
                      label="Source Type"
                      value={props.sourceType ?? "youtube"}
                      onChange={(v) => set("sourceType", v)}
                      options={[
                        { value: "youtube", label: "YouTube" },
                        { value: "vimeo", label: "Vimeo" },
                        { value: "self", label: "Self Hosted" },
                        { value: "upload", label: "Upload File" },
                      ]}
                    />
                    {props.sourceType === "upload" ? (
                      <VideoUploadField value={props.videoUrl ?? ""} onChange={(v) => set("videoUrl", v)} />
                    ) : (
                      <StackedTextField label="Video URL" value={props.videoUrl ?? ""} onChange={(v) => set("videoUrl", v)} placeholder="https://..." />
                    )}
                    <StackedNumberField label="Start Time (sec)" value={props.startTime ?? 0} onChange={(v) => set("startTime", v)} min={0} max={9999} step={1} />
                    <StackedNumberField label="End Time (sec)" value={props.endTime ?? null} onChange={(v) => set("endTime", v)} min={0} max={9999} step={1} />
                    <ToggleField label="Autoplay" value={!!props.autoplay} onChange={(v) => set("autoplay", v)} />
                    <ToggleField label="Loop" value={!!props.loop} onChange={(v) => set("loop", v)} />
                    <ToggleField label="Mute" value={!!props.mute} onChange={(v) => set("mute", v)} />
                    <InlineSelect
                      label="Controls"
                      value={props.controls ?? "show"}
                      onChange={(v) => set("controls", v)}
                      options={[
                        { value: "show", label: "Show" },
                        { value: "hide", label: "Hide" },
                      ]}
                    />
                    <ToggleField label="Play Inline" value={props.playInline !== false} onChange={(v) => set("playInline", v)} />
                    <StackedTextField label="Thumbnail URL" value={props.thumbnailUrl ?? ""} onChange={(v) => set("thumbnailUrl", v)} placeholder="https://..." />
                  </>
                )}

                {/* ── STYLE TAB ── */}
                {tab === "style" && (
                  <>
                    <TabSection title="Sizing" />
                    <InlineSelect
                      label="Aspect Ratio"
                      value={props.aspectRatio ?? "16:9"}
                      onChange={(v) => set("aspectRatio", v)}
                      options={[
                        { value: "16:9", label: "16:9 (Widescreen)" },
                        { value: "4:3", label: "4:3 (Standard)" },
                        { value: "1:1", label: "1:1 (Square)" },
                        { value: "custom", label: "Custom Height" },
                      ]}
                    />
                    <NumberUnitField
                      label="Width"
                      value={props.videoWidthVal ?? 100}
                      unit={props.videoWidthUnit ?? "%"}
                      onValueChange={(v) => set("videoWidthVal", v)}
                      onUnitChange={(u) => set("videoWidthUnit", u)}
                      units={["%", "px", "vw"]}
                      min={0} max={9999} step={1}
                    />
                    {props.aspectRatio === "custom" && (
                      <StackedTextField label="Custom Height" value={props.customHeight ?? "450px"} onChange={(v) => set("customHeight", v)} placeholder="e.g. 450px" />
                    )}

                    <TabSection title="Play Button" />
                    <InlineSelect
                      label="Play Button Style"
                      value={props.playBtnStyle ?? "default"}
                      onChange={(v) => set("playBtnStyle", v)}
                      options={[
                        { value: "default", label: "Default" },
                        { value: "custom", label: "Custom" },
                      ]}
                    />
                    {props.playBtnStyle === "custom" && (
                      <>
                        <StackedNumberField label="Play Icon Size (px)" value={props.playIconSize ?? 64} onChange={(v) => set("playIconSize", v)} min={20} max={200} step={4} />
                        <ColorPickerField label="Play Icon Color" value={props.playIconColor ?? "#fff"} onChange={(v) => set("playIconColor", v)} />
                        <ColorPickerField label="Play Button Background" value={props.playBtnBg ?? "rgba(0,0,0,0.5)"} onChange={(v) => set("playBtnBg", v)} />
                        <StackedTextField label="Play Button Border Radius" value={props.playBtnRadius ?? "50%"} onChange={(v) => set("playBtnRadius", v)} placeholder="e.g. 50% or 8px" />
                      </>
                    )}

                    <TabSection title="Border" />
                    <StackedTextField label="Border Radius" value={props.borderRadius ?? "0px"} onChange={(v) => set("borderRadius", v)} placeholder="e.g. 8px" />
                  </>
                )}

                {/* ── ADVANCED TAB ── */}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 0, right: 0, bottom: 0, left: 0 }} onChange={(v) => set("advPadding", v)} />

                    <TabSection title="Responsive" />
                    <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                    <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
                    <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />

                  </>
                )}
              </>
            )}
          </BlockTabBar>
        );
      },
    },
  },

  defaultProps: {
    sourceType: "youtube",
    videoUrl: "",
    startTime: 0,
    endTime: null,
    autoplay: false,
    loop: false,
    mute: false,
    controls: "show",
    playInline: true,
    thumbnailUrl: "",
    aspectRatio: "16:9",
    videoWidthVal: 100,
    videoWidthUnit: "%",
    customHeight: "450px",
    playBtnStyle: "default",
    playIconSize: 64,
    playIconColor: "#fff",
    playBtnBg: "rgba(0,0,0,0.5)",
    playBtnRadius: "50%",
    borderRadius: "0px",
    advMargin: { top: 0, right: 0, bottom: 0, left: 0 },
    advPadding: { top: 0, right: 0, bottom: 0, left: 0 },
    hideDesktop: false,
    hideTablet: false,
    hideMobile: false,
    cssId: "",
    cssClass: "",
    zIndex: null,
  },

  render: ({
    sourceType,
    videoUrl,
    startTime,
    endTime,
    autoplay,
    loop,
    mute,
    controls,
    playInline,
    thumbnailUrl,
    aspectRatio,
    videoWidthVal,
    videoWidthUnit,
    customHeight,
    playBtnStyle,
    playIconSize,
    playIconColor,
    playBtnBg,
    playBtnRadius,
    borderRadius,
    advMargin,
    advPadding,
    hideDesktop,
    hideTablet,
    hideMobile,
    cssId,
    cssClass,
    zIndex,
  }) => {
    const [playing, setPlaying] = useState(false);

    const ratioMap: Record<string, string> = { "16:9": "56.25%", "4:3": "75%", "1:1": "100%", "custom": "0" };
    const paddingBottom = ratioMap[aspectRatio ?? "16:9"] ?? "56.25%";
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");

    const buildEmbedUrl = () => {
      if (!videoUrl) return "";
      if (sourceType === "youtube") {
        const match = videoUrl.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
        const id = match?.[1] ?? "";
        const params = new URLSearchParams();
        if (autoplay || playing) params.set("autoplay", "1");
        if (loop) { params.set("loop", "1"); params.set("playlist", id); }
        if (mute) params.set("mute", "1");
        if (controls === "hide") params.set("controls", "0");
        if (startTime) params.set("start", String(startTime));
        if (endTime) params.set("end", String(endTime));
        return `https://www.youtube.com/embed/${id}?${params.toString()}`;
      }
      if (sourceType === "vimeo") {
        const match = videoUrl.match(/vimeo\.com\/(\d+)/);
        const id = match?.[1] ?? "";
        const params = new URLSearchParams();
        if (autoplay || playing) params.set("autoplay", "1");
        if (loop) params.set("loop", "1");
        if (mute) params.set("muted", "1");
        if (controls === "hide") params.set("controls", "0");
        return `https://player.vimeo.com/video/${id}?${params.toString()}`;
      }
      return videoUrl;
    };

    const isNative = sourceType === "self" || sourceType === "upload";
    // Show thumbnail overlay when: thumbnail exists, not yet playing, and not autoplaying
    const showThumbnailOverlay = !!thumbnailUrl && !playing && !autoplay;

    const containerStyle: React.CSSProperties = {
      position: "relative",
      width: `${videoWidthVal ?? 100}${videoWidthUnit ?? "%"}`,
      paddingBottom: aspectRatio === "custom" ? 0 : paddingBottom,
      height: aspectRatio === "custom" ? (customHeight || "450px") : 0,
      overflow: "hidden",
      borderRadius: borderRadius || "0px",
      backgroundColor: "#000",
    };

    if (!videoUrl && !thumbnailUrl) return (
      <div style={{ padding: 24, border: "2px dashed #e5e7eb", borderRadius: 8, color: "#9ca3af", fontSize: 14, textAlign: "center" }}>
        No video URL set. Use the property panel to add a video.
      </div>
    );

    const videoEl = isNative ? (
      <video
        key={videoUrl}
        src={videoUrl}
        autoPlay={autoplay}
        loop={loop}
        muted={mute}
        controls={controls !== "hide"}
        playsInline={playInline !== false}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
    ) : (
      <iframe
        src={buildEmbedUrl()}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );

    const thumbnailOverlay = showThumbnailOverlay ? (
      <div
        style={{ position: "absolute", inset: 0, cursor: "pointer", zIndex: 2 }}
        onClick={() => setPlaying(true)}
      >
        <img src={thumbnailUrl} alt="Video thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            width: playIconSize || 64,
            height: playIconSize || 64,
            backgroundColor: playBtnBg || "rgba(0,0,0,0.5)",
            borderRadius: playBtnStyle === "custom" ? (playBtnRadius || "50%") : "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width={(playIconSize || 64) * 0.4} height={(playIconSize || 64) * 0.4} viewBox="0 0 24 24" fill={playIconColor || "#fff"}>
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>
    ) : null;

    return (
      <div
        id={cssId || undefined}
        className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined}
        style={{
          paddingTop: advPadding?.top ?? 0, paddingRight: advPadding?.right ?? 0,
          paddingBottom: advPadding?.bottom ?? 0, paddingLeft: advPadding?.left ?? 0,
          marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0,
          marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0,
          zIndex: zIndex ?? undefined,
        }}
      >
        <div style={containerStyle}>
          {/* Always render the video/iframe underneath */}
          {videoUrl && videoEl}
          {/* Thumbnail overlay sits on top until user clicks play */}
          {thumbnailOverlay}
          {/* If no videoUrl, show thumbnail as static image */}
          {!videoUrl && thumbnailUrl && (
            <img src={thumbnailUrl} alt="Video thumbnail" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          )}
        </div>
      </div>
    );
  },
};

// ─── Social Icons Component ───────────────────────────────────────────────────

const SOCIAL_PLATFORM_SVGS: Record<string, React.ReactNode> = {
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  pinterest: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
    </svg>
  ),
  snapchat: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d="M12.065.003c.157-.003.313-.003.47 0 1.65.029 5.503.597 7.37 4.688.562 1.244.618 3.104.483 4.603l.006.004c.173.087.44.145.783.145.42 0 .896-.085 1.29-.274.17-.082.358-.12.539-.12.358 0 .72.156.953.43.284.33.329.73.114 1.083-.297.49-.946.8-1.583 1.02-.158.054-.328.107-.5.157-.405.12-.825.245-.954.484-.069.13-.068.294.007.527.334 1.04 1.165 2.703 2.986 3.735.188.106.265.335.183.534-.097.231-.366.48-.836.697-1.044.485-2.403.637-3.658.42-.143-.026-.278-.053-.407-.079-.27-.053-.513-.1-.745-.117-.34-.022-.64.037-.861.245-.125.12-.207.27-.272.453-.177.508-.293 1.17-.39 1.63-.016.079-.04.137-.069.18-.108.155-.335.248-.63.248-.186 0-.43-.042-.65-.156-.275-.14-.563-.217-.852-.217-.11 0-.22.01-.327.03-.48.084-.853.242-1.156.375-.499.214-.84.354-1.398.354-.535 0-.864-.133-1.35-.344-.303-.133-.676-.292-1.158-.376a2.45 2.45 0 00-.327-.03c-.29 0-.577.077-.852.218-.22.113-.464.155-.65.155-.295 0-.522-.093-.63-.248-.03-.043-.054-.101-.07-.18-.096-.46-.213-1.121-.389-1.63-.065-.182-.147-.332-.272-.452-.221-.208-.52-.267-.86-.245-.233.017-.476.064-.746.117-.128.026-.264.053-.406.079-1.256.217-2.614.065-3.658-.42-.47-.217-.74-.466-.836-.697-.082-.2-.005-.428.183-.534 1.821-1.032 2.652-2.695 2.986-3.735.074-.233.076-.396.007-.527-.129-.239-.549-.364-.954-.484-.172-.05-.342-.103-.5-.157-.637-.22-1.286-.53-1.583-1.02-.215-.353-.17-.754.114-1.083.233-.274.595-.43.953-.43.181 0 .369.038.539.12.393.189.868.274 1.288.274.344 0 .612-.058.785-.145l.006-.004c-.135-1.499-.08-3.359.483-4.604C6.558.597 10.41.029 12.065.003z"/>
    </svg>
  ),
};

const SOCIAL_PLATFORMS = [
  { key: "facebook",  label: "Facebook",  brandColor: "#1877F2" },
  { key: "instagram", label: "Instagram", brandColor: "#E1306C" },
  { key: "twitter",   label: "Twitter/X", brandColor: "#000000" },
  { key: "youtube",   label: "YouTube",   brandColor: "#FF0000" },
  { key: "tiktok",    label: "TikTok",    brandColor: "#000000" },
  { key: "linkedin",  label: "LinkedIn",  brandColor: "#0A66C2" },
  { key: "pinterest", label: "Pinterest", brandColor: "#E60023" },
  { key: "snapchat",  label: "Snapchat",  brandColor: "#FFFC00" },
];

const SocialIconsComponent = {
  label: "Social Icons",
  fields: {
    _tabs: {
      type: "custom",
      label: "",
      render: ({ value: _v, onChange: _onChange }: any) => {
        const { selectedItem, appState, dispatch } = usePuck();
        const props = selectedItem?.props ?? {};
        const set = (key: string, val: any) => {
          if (!selectedItem) return;
          const state = appState.data;
          let destinationZone = "root:default-zone", destinationIndex = 0;
          const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
          for (const [zone, items] of Object.entries(zones)) {
            const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
            if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
          }
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...props, [key]: val } } });
        };
        const urls: Record<string, string> = props.urls ?? {};
        const enabled: string[] = props.enabled ?? SOCIAL_PLATFORMS.map(p => p.key);
        const bgType = props.advBgType ?? "none";
        return (
          <BlockTabBar blockKey="SocialIcons">
            {(tab) => (
              <>
                {tab === "content" && (
                  <>
                    <TabSection title="Platforms" />
                    {SOCIAL_PLATFORMS.map(p => (
                      <div key={p.key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <ToggleField label={p.label} value={enabled.includes(p.key)} onChange={(v) => set("enabled", v ? [...enabled, p.key] : enabled.filter(k => k !== p.key))} />
                        </div>
                        {enabled.includes(p.key) && (
                          <StackedTextField label={`${p.label} URL`} value={urls[p.key] ?? ""} onChange={(v) => set("urls", { ...urls, [p.key]: v })} placeholder="https://..." />
                        )}
                      </div>
                    ))}
                    <ToggleField label="Open in New Tab" value={props.newTab !== false} onChange={(v) => set("newTab", v)} />
                  </>
                )}
                {tab === "style" && (
                  <>
                    <TabSection title="Icons" />
                    <InlineSelect label="Icon Style" value={props.iconStyle ?? "filled"} onChange={(v) => set("iconStyle", v)} options={[{ value: "filled", label: "Filled" }, { value: "outlined", label: "Outlined" }, { value: "minimal", label: "Minimal" }, { value: "branded", label: "Branded" }]} />
                    <StackedTextField label="Icon Size" value={props.iconSize ?? "24px"} onChange={(v) => set("iconSize", v)} placeholder="e.g. 24px" />
                    <ColorPickerField label="Icon Color" value={props.iconColor ?? ""} onChange={(v) => set("iconColor", v)} />
                    <ColorPickerField label="Icon Hover Color" value={props.iconHoverColor ?? ""} onChange={(v) => set("iconHoverColor", v)} />
                    <StackedTextField label="Spacing Between" value={props.iconSpacing ?? "12px"} onChange={(v) => set("iconSpacing", v)} placeholder="e.g. 12px" />
                    <TabSection title="Background" />
                    <ColorPickerField label="Background Color" value={props.iconBgColor ?? ""} onChange={(v) => set("iconBgColor", v)} />
                    <ColorPickerField label="Hover Background" value={props.iconHoverBg ?? ""} onChange={(v) => set("iconHoverBg", v)} />
                    <InlineSelect label="Background Shape" value={props.bgShape ?? "none"} onChange={(v) => set("bgShape", v)} options={[{ value: "none", label: "None" }, { value: "circle", label: "Circle" }, { value: "square", label: "Square" }, { value: "rounded", label: "Rounded" }]} />
                    <StackedTextField label="Background Size" value={props.bgSize ?? "40px"} onChange={(v) => set("bgSize", v)} placeholder="e.g. 40px" />
                    <TabSection title="Border" />
                    <InlineSelect label="Border Style" value={props.borderStyle ?? "none"} onChange={(v) => set("borderStyle", v)} options={[{ value: "none", label: "None" }, { value: "solid", label: "Solid" }]} />
                    {props.borderStyle === "solid" && (
                      <>
                        <StackedNumberField label="Border Width (px)" value={props.borderWidth ?? 1} onChange={(v) => set("borderWidth", v)} min={1} max={10} step={1} />
                        <ColorPickerField label="Border Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
                        <StackedTextField label="Border Radius" value={props.borderRadius ?? "0px"} onChange={(v) => set("borderRadius", v)} placeholder="e.g. 50% or 8px" />
                      </>
                    )}
                    <TabSection title="Alignment" />
                    <AlignField label="Alignment" value={props.alignment ?? "left"} onChange={(v) => set("alignment", v)} options={[{ value: "left", icon: <AlignLeft size={15} />, title: "Left" }, { value: "center", icon: <AlignCenter size={15} />, title: "Center" }, { value: "right", icon: <AlignRight size={15} />, title: "Right" }]} />
                  </>
                )}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 8, right: 0, bottom: 8, left: 0 }} onChange={(v) => set("advPadding", v)} />
                    <TabSection title="Background" />
                    <InlineSelect label="Type" value={bgType} onChange={(v) => set("advBgType", v)} options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }]} />
                    {bgType === "color" && <ColorPickerField label="Color" value={props.advBgColor ?? ""} onChange={(v) => set("advBgColor", v)} />}
                    <TabSection title="Responsive" />
                    <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                    <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
                    <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />
                  </>
                )}
              </>
            )}
          </BlockTabBar>
        );
      },
    },
  },
  defaultProps: {
    enabled: ["facebook", "instagram", "twitter", "youtube"],
    urls: {}, newTab: true,
    iconStyle: "filled", iconSize: "24px", iconColor: "", iconHoverColor: "", iconSpacing: "12px",
    iconBgColor: "", iconHoverBg: "", bgShape: "circle", bgSize: "40px",
    borderStyle: "none", borderWidth: 1, borderColor: "", borderRadius: "50%",
    alignment: "left",
    advBgType: "none", advBgColor: "", advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 8, right: 0, bottom: 8, left: 0 },
    hideDesktop: false, hideTablet: false, hideMobile: false, cssId: "", cssClass: "", zIndex: null,
  },
  render: ({ enabled, urls, newTab, iconStyle, iconSize, iconColor, iconHoverColor, iconSpacing, iconBgColor, iconHoverBg, bgShape, bgSize, borderStyle, borderWidth, borderColor, borderRadius, alignment, advBgType, advBgColor, advMargin, advPadding, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex }) => {
    const id = cssId || `social-${Math.random().toString(36).slice(2, 7)}`;
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const shapeRadius = bgShape === "circle" ? "50%" : bgShape === "rounded" ? "10px" : bgShape === "square" ? "0px" : undefined;
    const parsedSize = parseFloat(iconSize || "24") || 24;
    const hoverCss = (iconHoverColor || iconHoverBg) ? `#${id} a:hover .puck-si { ${iconHoverColor ? `color: ${iconHoverColor} !important;` : ""} ${iconHoverBg ? `background: ${iconHoverBg} !important;` : ""} transition: all 0.2s; } #${id} a .puck-si { transition: all 0.2s; }` : "";
    const platforms = SOCIAL_PLATFORMS.filter(p => (enabled ?? []).includes(p.key));
    return (
      <div id={id} className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined} style={{ paddingTop: advPadding?.top ?? 8, paddingRight: advPadding?.right ?? 0, paddingBottom: advPadding?.bottom ?? 8, paddingLeft: advPadding?.left ?? 0, marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0, marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0, zIndex: zIndex ?? undefined, ...(advBgType === "color" && advBgColor ? { backgroundColor: advBgColor } : {}) }}>
        {hoverCss && <style>{hoverCss}</style>}
        <div style={{ display: "flex", gap: iconSpacing || "12px", flexWrap: "wrap", justifyContent: alignment === "center" ? "center" : alignment === "right" ? "flex-end" : "flex-start" }}>
          {platforms.map(p => {
            const url = (urls as any)?.[p.key];
            const isBranded = iconStyle === "branded";
            const resolvedColor = isBranded ? (bgShape !== "none" ? "#fff" : p.brandColor) : (iconColor || "currentColor");
            const bgColor = bgShape !== "none" ? (isBranded ? p.brandColor : (iconBgColor || "#e5e7eb")) : undefined;
            const innerStyle: React.CSSProperties = {
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: bgShape !== "none" ? (bgSize || "40px") : parsedSize,
              height: bgShape !== "none" ? (bgSize || "40px") : parsedSize,
              backgroundColor: bgColor,
              borderRadius: shapeRadius,
              border: borderStyle === "solid" ? `${borderWidth || 1}px solid ${borderColor || resolvedColor}` : undefined,
              color: resolvedColor,
              flexShrink: 0,
            };
            const svgIcon = (
              <span style={{ width: parsedSize, height: parsedSize, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: parsedSize }}>
                {SOCIAL_PLATFORM_SVGS[p.key]}
              </span>
            );
            return url ? (
              <a key={p.key} href={url} target={newTab !== false ? "_blank" : "_self"} rel="noopener noreferrer" title={p.label} style={{ textDecoration: "none", color: "inherit" }}>
                <span className="puck-si" style={innerStyle}>{svgIcon}</span>
              </a>
            ) : (
              <span key={p.key} className="puck-si" style={{ ...innerStyle, opacity: 0.4 }} title={`${p.label} (no URL set)`}>{svgIcon}</span>
            );
          })}
        </div>
      </div>
    );
  },
};

// ─── Share Buttons Component ──────────────────────────────────────────────────

const SHARE_PLATFORMS = [
  { key: "facebook",  label: "Facebook",  brandColor: "#1877F2", icon: "f" },
  { key: "twitter",   label: "Twitter",   brandColor: "#000000", icon: "𝕏" },
  { key: "whatsapp",  label: "WhatsApp",  brandColor: "#25D366", icon: "W" },
  { key: "pinterest", label: "Pinterest", brandColor: "#E60023", icon: "P" },
  { key: "email",     label: "Email",     brandColor: "#6b7280", icon: "✉" },
  { key: "copy",      label: "Copy Link", brandColor: "#374151", icon: "🔗" },
];

const ShareButtonsComponent = {
  label: "Share Buttons",
  fields: {
    _tabs: {
      type: "custom",
      label: "",
      render: ({ value: _v, onChange: _onChange }: any) => {
        const { selectedItem, appState, dispatch } = usePuck();
        const props = selectedItem?.props ?? {};
        const set = (key: string, val: any) => {
          if (!selectedItem) return;
          const state = appState.data;
          let destinationZone = "root:default-zone", destinationIndex = 0;
          const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
          for (const [zone, items] of Object.entries(zones)) {
            const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
            if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
          }
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...props, [key]: val } } });
        };
        const enabled: string[] = props.enabled ?? SHARE_PLATFORMS.map(p => p.key);
        const labels: Record<string, string> = props.labels ?? {};
        const bgType = props.advBgType ?? "none";
        return (
          <BlockTabBar blockKey="ShareButtons">
            {(tab) => (
              <>
                {tab === "content" && (
                  <>
                    <TabSection title="Platforms" />
                    {SHARE_PLATFORMS.map(p => (
                      <div key={p.key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <ToggleField label={p.label} value={enabled.includes(p.key)} onChange={(v) => set("enabled", v ? [...enabled, p.key] : enabled.filter(k => k !== p.key))} />
                        {enabled.includes(p.key) && (
                          <StackedTextField label={`${p.label} Label`} value={labels[p.key] ?? p.label} onChange={(v) => set("labels", { ...labels, [p.key]: v })} placeholder={p.label} />
                        )}
                      </div>
                    ))}
                    <ToggleField label="Show Label" value={props.showLabel !== false} onChange={(v) => set("showLabel", v)} />
                  </>
                )}
                {tab === "style" && (
                  <>
                    <TabSection title="Button Style" />
                    <InlineSelect label="Style" value={props.btnStyle ?? "icon-text"} onChange={(v) => set("btnStyle", v)} options={[{ value: "icon-only", label: "Icon Only" }, { value: "icon-text", label: "Icon + Text" }, { value: "text-only", label: "Text Only" }]} />
                    <InlineSelect label="Size" value={props.btnSize ?? "medium"} onChange={(v) => set("btnSize", v)} options={[{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }]} />
                    <StackedTextField label="Border Radius" value={props.borderRadius ?? "6px"} onChange={(v) => set("borderRadius", v)} placeholder="e.g. 6px or 50%" />
                    <StackedTextField label="Spacing Between" value={props.spacing ?? "8px"} onChange={(v) => set("spacing", v)} placeholder="e.g. 8px" />
                    <TabSection title="Colors" />
                    <ColorPickerField label="Icon Color" value={props.iconColor ?? ""} onChange={(v) => set("iconColor", v)} />
                    <ColorPickerField label="Text Color" value={props.textColor ?? ""} onChange={(v) => set("textColor", v)} />
                    <ColorPickerField label="Background Color" value={props.bgColor ?? ""} onChange={(v) => set("bgColor", v)} />
                    <ColorPickerField label="Hover Background" value={props.hoverBg ?? ""} onChange={(v) => set("hoverBg", v)} />
                    <ToggleField label="Use Brand Colors" value={!!props.useBrandColors} onChange={(v) => set("useBrandColors", v)} />
                    <TabSection title="Typography" />
                    <StackedTextField label="Font Size" value={props.fontSize ?? "0.875rem"} onChange={(v) => set("fontSize", v)} placeholder="e.g. 0.875rem" />
                    <InlineSelect label="Font Weight" value={props.fontWeight ?? "600"} onChange={(v) => set("fontWeight", v)} options={[{ value: "400", label: "Normal" }, { value: "600", label: "Semi Bold" }, { value: "700", label: "Bold" }]} />
                    <TabSection title="Alignment" />
                    <AlignField label="Alignment" value={props.alignment ?? "left"} onChange={(v) => set("alignment", v)} options={[{ value: "left", icon: <AlignLeft size={15} />, title: "Left" }, { value: "center", icon: <AlignCenter size={15} />, title: "Center" }, { value: "right", icon: <AlignRight size={15} />, title: "Right" }]} />
                  </>
                )}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 8, right: 0, bottom: 8, left: 0 }} onChange={(v) => set("advPadding", v)} />
                    <TabSection title="Background" />
                    <InlineSelect label="Type" value={bgType} onChange={(v) => set("advBgType", v)} options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }]} />
                    {bgType === "color" && <ColorPickerField label="Color" value={props.advBgColor ?? ""} onChange={(v) => set("advBgColor", v)} />}
                    <TabSection title="Responsive" />
                    <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                    <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
                    <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />
                  </>
                )}
              </>
            )}
          </BlockTabBar>
        );
      },
    },
  },
  defaultProps: {
    enabled: ["facebook", "twitter", "whatsapp", "email", "copy"],
    labels: {}, showLabel: true,
    btnStyle: "icon-text", btnSize: "medium", borderRadius: "6px", spacing: "8px",
    iconColor: "", textColor: "", bgColor: "", hoverBg: "", useBrandColors: false,
    fontSize: "0.875rem", fontWeight: "600",
    alignment: "left",
    advBgType: "none", advBgColor: "", advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 8, right: 0, bottom: 8, left: 0 },
    hideDesktop: false, hideTablet: false, hideMobile: false, cssId: "", cssClass: "", zIndex: null,
  },
  render: ({ enabled, labels, showLabel, btnStyle, btnSize, borderRadius, spacing, iconColor, textColor, bgColor, hoverBg, useBrandColors, fontSize, fontWeight, alignment, advBgType, advBgColor, advMargin, advPadding, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex }) => {
    const [copied, setCopied] = useState(false);
    const id = cssId || `share-${Math.random().toString(36).slice(2, 7)}`;
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const sizeMap = { small: { px: "8px 12px", fs: "0.75rem" }, medium: { px: "10px 16px", fs: fontSize || "0.875rem" }, large: { px: "12px 20px", fs: "1rem" } };
    const s = sizeMap[btnSize ?? "medium"] ?? sizeMap.medium;
    const hoverCss = hoverBg ? `#${id} .puck-share-btn:hover { background: ${hoverBg} !important; transition: background 0.2s; } #${id} .puck-share-btn { transition: background 0.2s; }` : "";
    const platforms = SHARE_PLATFORMS.filter(p => (enabled ?? []).includes(p.key));
    const handleShare = (key: string) => {
      const pageUrl = typeof window !== "undefined" ? window.location.href : "#";
      const shareUrls: Record<string, string> = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
        twitter:  `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(pageUrl)}`,
        pinterest:`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(pageUrl)}`,
        email:    `mailto:?body=${encodeURIComponent(pageUrl)}`,
      };
      if (key === "copy") {
        navigator.clipboard?.writeText(pageUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
      } else if (shareUrls[key]) {
        window.open(shareUrls[key], "_blank", "noopener,noreferrer");
      }
    };
    return (
      <div id={id} className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined} style={{ paddingTop: advPadding?.top ?? 8, paddingRight: advPadding?.right ?? 0, paddingBottom: advPadding?.bottom ?? 8, paddingLeft: advPadding?.left ?? 0, marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0, marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0, zIndex: zIndex ?? undefined, ...(advBgType === "color" && advBgColor ? { backgroundColor: advBgColor } : {}) }}>
        {hoverCss && <style>{hoverCss}</style>}
        <div style={{ display: "flex", gap: spacing || "8px", flexWrap: "wrap", justifyContent: alignment === "center" ? "center" : alignment === "right" ? "flex-end" : "flex-start" }}>
          {platforms.map(p => {
            const resolvedBg = useBrandColors ? p.brandColor : (bgColor || "#f3f4f6");
            const resolvedText = useBrandColors ? "#fff" : (textColor || "var(--text-color)");
            const resolvedIcon = useBrandColors ? "#fff" : (iconColor || "var(--text-color)");
            const isCopy = p.key === "copy";
            const btnLabel = (labels as any)?.[p.key] ?? p.label;
            return (
              <button key={p.key} className="puck-share-btn" onClick={() => handleShare(p.key)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: s.px, fontSize: s.fs, fontWeight: fontWeight || "600", color: resolvedText, backgroundColor: resolvedBg, border: "none", borderRadius: borderRadius || "6px", cursor: "pointer" }}>
                {btnStyle !== "text-only" && <span style={{ color: resolvedIcon, fontWeight: 700 }}>{isCopy && copied ? "✓" : p.icon}</span>}
                {btnStyle !== "icon-only" && showLabel && <span>{isCopy && copied ? "Copied!" : btnLabel}</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  },
};

// ─── Star Rating Component ────────────────────────────────────────────────────

const StarRatingComponent = {
  label: "Star Rating",
  fields: {
    _tabs: {
      type: "custom",
      label: "",
      render: ({ value: _v, onChange: _onChange }: any) => {
        const { selectedItem, appState, dispatch } = usePuck();
        const props = selectedItem?.props ?? {};
        const set = (key: string, val: any) => {
          if (!selectedItem) return;
          const state = appState.data;
          let destinationZone = "root:default-zone", destinationIndex = 0;
          const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
          for (const [zone, items] of Object.entries(zones)) {
            const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
            if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
          }
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...props, [key]: val } } });
        };
        const bgType = props.advBgType ?? "none";
        return (
          <BlockTabBar blockKey="StarRating">
            {(tab) => (
              <>
                {tab === "content" && (
                  <>
                    <StackedNumberField label="Rating Value (0–5)" value={props.ratingValue ?? 4} onChange={(v) => set("ratingValue", v)} min={0} max={10} step={0.5} />
                    <InlineSelect label="Max Stars" value={String(props.maxStars ?? "5")} onChange={(v) => set("maxStars", Number(v))} options={[{ value: "5", label: "5 Stars" }, { value: "10", label: "10 Stars" }]} />
                    <ToggleField label="Show Number" value={props.showNumber !== false} onChange={(v) => set("showNumber", v)} />
                    <InlineSelect label="Number Position" value={props.numberPosition ?? "after"} onChange={(v) => set("numberPosition", v)} options={[{ value: "before", label: "Before Stars" }, { value: "after", label: "After Stars" }]} />
                    <StackedTextField label="Review Count" value={props.reviewCount ?? ""} onChange={(v) => set("reviewCount", v)} placeholder="e.g. (124 reviews)" />
                  </>
                )}
                {tab === "style" && (
                  <>
                    <TabSection title="Stars" />
                    <StackedTextField label="Star Size" value={props.starSize ?? "24px"} onChange={(v) => set("starSize", v)} placeholder="e.g. 24px or 1.5rem" />
                    <ColorPickerField label="Filled Color" value={props.filledColor ?? "#f59e0b"} onChange={(v) => set("filledColor", v)} />
                    <ColorPickerField label="Empty Color" value={props.emptyColor ?? "#d1d5db"} onChange={(v) => set("emptyColor", v)} />
                    <StackedTextField label="Gap Between Stars" value={props.starGap ?? "4px"} onChange={(v) => set("starGap", v)} placeholder="e.g. 4px" />
                    <TabSection title="Number" />
                    <StackedTextField label="Font Size" value={props.numFontSize ?? "1rem"} onChange={(v) => set("numFontSize", v)} placeholder="e.g. 1rem" />
                    <InlineSelect label="Font Weight" value={props.numFontWeight ?? "700"} onChange={(v) => set("numFontWeight", v)} options={[{ value: "400", label: "Normal" }, { value: "700", label: "Bold" }]} />
                    <ColorPickerField label="Color" value={props.numColor ?? ""} onChange={(v) => set("numColor", v)} />
                    <TabSection title="Alignment" />
                    <AlignField label="Alignment" value={props.alignment ?? "left"} onChange={(v) => set("alignment", v)} options={[{ value: "left", icon: <AlignLeft size={15} />, title: "Left" }, { value: "center", icon: <AlignCenter size={15} />, title: "Center" }, { value: "right", icon: <AlignRight size={15} />, title: "Right" }]} />
                  </>
                )}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 8, right: 0, bottom: 8, left: 0 }} onChange={(v) => set("advPadding", v)} />
                    <TabSection title="Background" />
                    <InlineSelect label="Type" value={bgType} onChange={(v) => set("advBgType", v)} options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }]} />
                    {bgType === "color" && <ColorPickerField label="Color" value={props.advBgColor ?? ""} onChange={(v) => set("advBgColor", v)} />}
                    <TabSection title="Responsive" />
                    <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                    <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
                    <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />
                  </>
                )}
              </>
            )}
          </BlockTabBar>
        );
      },
    },
  },
  defaultProps: {
    ratingValue: 4, maxStars: 5, showNumber: true, numberPosition: "after", reviewCount: "",
    starSize: "24px", filledColor: "#f59e0b", emptyColor: "#d1d5db", starGap: "4px",
    numFontSize: "1rem", numFontWeight: "700", numColor: "",
    alignment: "left",
    advBgType: "none", advBgColor: "", advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 8, right: 0, bottom: 8, left: 0 },
    hideDesktop: false, hideTablet: false, hideMobile: false, cssId: "", cssClass: "", zIndex: null,
  },
  render: ({ ratingValue, maxStars, showNumber, numberPosition, reviewCount, starSize, filledColor, emptyColor, starGap, numFontSize, numFontWeight, numColor, alignment, advBgType, advBgColor, advMargin, advPadding, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex }) => {
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const max = maxStars ?? 5;
    const val = Math.min(ratingValue ?? 4, max);
    const stars = Array.from({ length: max }, (_, i) => {
      const filled = i < Math.floor(val);
      const partial = !filled && i < val;
      const pct = partial ? Math.round((val - Math.floor(val)) * 100) : 0;
      const id = `star-grad-${cssId || "r"}-${i}`;
      return (
        <svg key={i} width={starSize || "24px"} height={starSize || "24px"} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          {partial && (
            <defs>
              <linearGradient id={id}>
                <stop offset={`${pct}%`} stopColor={filledColor || "#f59e0b"} />
                <stop offset={`${pct}%`} stopColor={emptyColor || "#d1d5db"} />
              </linearGradient>
            </defs>
          )}
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={filled ? (filledColor || "#f59e0b") : partial ? `url(#${id})` : (emptyColor || "#d1d5db")} />
        </svg>
      );
    });
    const numEl = showNumber && (
      <span style={{ fontSize: numFontSize || "1rem", fontWeight: numFontWeight || "700", color: numColor || "var(--text-color)", whiteSpace: "nowrap" }}>
        {val.toFixed(1)}{reviewCount ? ` ${reviewCount}` : ""}
      </span>
    );
    return (
      <div id={cssId || undefined} className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined} style={{ textAlign: alignment as any, paddingTop: advPadding?.top ?? 8, paddingRight: advPadding?.right ?? 0, paddingBottom: advPadding?.bottom ?? 8, paddingLeft: advPadding?.left ?? 0, marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0, marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0, zIndex: zIndex ?? undefined, ...(advBgType === "color" && advBgColor ? { backgroundColor: advBgColor } : {}) }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: starGap || "4px", flexWrap: "wrap", justifyContent: alignment === "center" ? "center" : alignment === "right" ? "flex-end" : "flex-start" }}>
          {numberPosition === "before" && numEl}
          {stars}
          {numberPosition !== "before" && numEl}
        </div>
      </div>
    );
  },
};

// ─── Progress Bar Component ───────────────────────────────────────────────────

const ProgressBarComponent = {
  label: "Progress Bar",
  fields: {
    _tabs: {
      type: "custom",
      label: "",
      render: ({ value: _v, onChange: _onChange }: any) => {
        const { selectedItem, appState, dispatch } = usePuck();
        const props = selectedItem?.props ?? {};
        const set = (key: string, val: any) => {
          if (!selectedItem) return;
          const state = appState.data;
          let destinationZone = "root:default-zone", destinationIndex = 0;
          const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
          for (const [zone, items] of Object.entries(zones)) {
            const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
            if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
          }
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...props, [key]: val } } });
        };
        const bgType = props.advBgType ?? "none";
        return (
          <BlockTabBar blockKey="ProgressBar">
            {(tab) => (
              <>
                {tab === "content" && (
                  <>
                    <StackedTextField label="Title" value={props.title ?? ""} onChange={(v) => set("title", v)} placeholder="Skill or metric..." />
                    <StackedNumberField label="Percentage (0–100)" value={props.percentage ?? 75} onChange={(v) => set("percentage", Math.min(100, Math.max(0, v)))} min={0} max={100} step={1} />
                    <ToggleField label="Display Percentage" value={props.displayPercentage !== false} onChange={(v) => set("displayPercentage", v)} />
                    <ToggleField label="Animate on Scroll" value={!!props.animateOnScroll} onChange={(v) => set("animateOnScroll", v)} />
                    <StackedNumberField label="Animation Duration (ms)" value={props.animDuration ?? 800} onChange={(v) => set("animDuration", v)} min={100} max={5000} step={100} />
                  </>
                )}
                {tab === "style" && (
                  <>
                    <TabSection title="Bar" />
                    <StackedNumberField label="Bar Height (px)" value={props.barHeight ?? 12} onChange={(v) => set("barHeight", v)} min={4} max={60} step={1} />
                    <ColorPickerField label="Bar Color" value={props.barColor ?? "#0158ad"} onChange={(v) => set("barColor", v)} />
                    <ColorPickerField label="Bar Background" value={props.barBg ?? "#e5e7eb"} onChange={(v) => set("barBg", v)} />
                    <StackedNumberField label="Border Radius (px)" value={props.barRadius ?? 6} onChange={(v) => set("barRadius", v)} min={0} max={50} step={1} />
                    <ToggleField label="Stripe Effect" value={!!props.stripeEffect} onChange={(v) => set("stripeEffect", v)} />
                    <ToggleField label="Animate Stripes" value={!!props.stripeAnimation} onChange={(v) => set("stripeAnimation", v)} />
                    <TabSection title="Title" />
                    <StackedTextField label="Font Size" value={props.titleFontSize ?? "0.9rem"} onChange={(v) => set("titleFontSize", v)} placeholder="e.g. 0.9rem" />
                    <InlineSelect label="Font Weight" value={props.titleFontWeight ?? "600"} onChange={(v) => set("titleFontWeight", v)} options={[{ value: "400", label: "Normal" }, { value: "600", label: "Semi Bold" }, { value: "700", label: "Bold" }]} />
                    <ColorPickerField label="Color" value={props.titleColor ?? ""} onChange={(v) => set("titleColor", v)} />
                    <InlineSelect label="Position" value={props.titlePosition ?? "above"} onChange={(v) => set("titlePosition", v)} options={[{ value: "above", label: "Above" }, { value: "inside", label: "Inside Bar" }]} />
                    <TabSection title="Percentage Label" />
                    <StackedTextField label="Font Size" value={props.labelFontSize ?? "0.8rem"} onChange={(v) => set("labelFontSize", v)} placeholder="e.g. 0.8rem" />
                    <ColorPickerField label="Color" value={props.labelColor ?? ""} onChange={(v) => set("labelColor", v)} />
                    <InlineSelect label="Position" value={props.labelPosition ?? "outside-right"} onChange={(v) => set("labelPosition", v)} options={[{ value: "inside", label: "Inside Bar" }, { value: "outside-right", label: "Outside Right" }]} />
                  </>
                )}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 8, right: 0, bottom: 8, left: 0 }} onChange={(v) => set("advPadding", v)} />
                    <TabSection title="Background" />
                    <InlineSelect label="Type" value={bgType} onChange={(v) => set("advBgType", v)} options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }]} />
                    {bgType === "color" && <ColorPickerField label="Color" value={props.advBgColor ?? ""} onChange={(v) => set("advBgColor", v)} />}
                    <TabSection title="Responsive" />
                    <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                    <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
                    <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />
                  </>
                )}
              </>
            )}
          </BlockTabBar>
        );
      },
    },
  },
  defaultProps: {
    title: "Skill", percentage: 75, displayPercentage: true, animateOnScroll: true, animDuration: 800,
    barHeight: 12, barColor: "#0158ad", barBg: "#e5e7eb", barRadius: 6, stripeEffect: false, stripeAnimation: false,
    titleFontSize: "0.9rem", titleFontWeight: "600", titleColor: "", titlePosition: "above",
    labelFontSize: "0.8rem", labelColor: "", labelPosition: "outside-right",
    advBgType: "none", advBgColor: "", advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 8, right: 0, bottom: 8, left: 0 },
    hideDesktop: false, hideTablet: false, hideMobile: false, cssId: "", cssClass: "", zIndex: null,
  },
  render: ({ title, percentage, displayPercentage, animateOnScroll, animDuration, barHeight, barColor, barBg, barRadius, stripeEffect, stripeAnimation, titleFontSize, titleFontWeight, titleColor, titlePosition, labelFontSize, labelColor, labelPosition, advBgType, advBgColor, advMargin, advPadding, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex }) => {
    const [width, setWidth] = useState(animateOnScroll ? 0 : percentage ?? 75);
    const ref = useRef<HTMLDivElement>(null);
    const pct = Math.min(100, Math.max(0, percentage ?? 75));
    useEffect(() => {
      if (!animateOnScroll) { setWidth(pct); return; }
      const el = ref.current;
      if (!el) return;
      const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setWidth(pct); obs.disconnect(); } }, { threshold: 0.3 });
      obs.observe(el);
      return () => obs.disconnect();
    }, [pct, animateOnScroll]);
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const stripeCss = stripeEffect ? `
      .puck-bar-fill-${cssId || "pb"} { background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.15) 10px, rgba(255,255,255,0.15) 20px); }
      ${stripeAnimation ? `@keyframes puck-stripe-move { to { background-position: 40px 0; } } .puck-bar-fill-${cssId || "pb"} { animation: puck-stripe-move 1s linear infinite; }` : ""}
    ` : "";
    return (
      <div ref={ref} id={cssId || undefined} className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined} style={{ paddingTop: advPadding?.top ?? 8, paddingRight: advPadding?.right ?? 0, paddingBottom: advPadding?.bottom ?? 8, paddingLeft: advPadding?.left ?? 0, marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0, marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0, zIndex: zIndex ?? undefined, ...(advBgType === "color" && advBgColor ? { backgroundColor: advBgColor } : {}) }}>
        {stripeCss && <style>{stripeCss}</style>}
        {title && titlePosition === "above" && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: titleFontSize || "0.9rem", fontWeight: titleFontWeight || "600", color: titleColor || "var(--text-color)" }}>{title}</span>
            {displayPercentage && labelPosition === "outside-right" && <span style={{ fontSize: labelFontSize || "0.8rem", color: labelColor || "var(--text-color)", fontWeight: 600 }}>{pct}%</span>}
          </div>
        )}
        <div style={{ position: "relative", height: barHeight || 12, backgroundColor: barBg || "#e5e7eb", borderRadius: barRadius ?? 6, overflow: "hidden" }}>
          <div className={`puck-bar-fill-${cssId || "pb"}`} style={{ height: "100%", width: `${width}%`, backgroundColor: barColor || "#0158ad", borderRadius: barRadius ?? 6, transition: `width ${animDuration || 800}ms ease` }}>
            {displayPercentage && labelPosition === "inside" && <span style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: labelFontSize || "0.8rem", color: labelColor || "#fff", fontWeight: 600, whiteSpace: "nowrap" }}>{pct}%</span>}
            {title && titlePosition === "inside" && <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: titleFontSize || "0.9rem", fontWeight: titleFontWeight || "600", color: titleColor || "#fff", whiteSpace: "nowrap" }}>{title}</span>}
          </div>
        </div>
      </div>
    );
  },
};

// ─── Alert Component ──────────────────────────────────────────────────────────

const AlertComponent = {
  label: "Alert",
  fields: {
    _tabs: {
      type: "custom",
      label: "",
      render: ({ value: _v, onChange: _onChange }: any) => {
        const { selectedItem, appState, dispatch } = usePuck();
        const props = selectedItem?.props ?? {};
        const set = (key: string, val: any) => {
          if (!selectedItem) return;
          const state = appState.data;
          let destinationZone = "root:default-zone", destinationIndex = 0;
          const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
          for (const [zone, items] of Object.entries(zones)) {
            const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
            if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
          }
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...props, [key]: val } } });
        };
        const bgType = props.advBgType ?? "none";
        return (
          <BlockTabBar blockKey="Alert">
            {(tab) => (
              <>
                {tab === "content" && (
                  <>
                    <StackedTextField label="Title" value={props.alertTitle ?? ""} onChange={(v) => set("alertTitle", v)} placeholder="Alert title..." />
                    <StackedTextareaField label="Message" value={props.message ?? ""} onChange={(v) => set("message", v)} placeholder="Alert message..." rows={3} />
                    <InlineSelect label="Type" value={props.alertType ?? "info"} onChange={(v) => set("alertType", v)} options={[{ value: "info", label: "Info" }, { value: "success", label: "Success" }, { value: "warning", label: "Warning" }, { value: "error", label: "Error" }, { value: "custom", label: "Custom" }]} />
                    <ToggleField label="Show Icon" value={props.showIcon !== false} onChange={(v) => set("showIcon", v)} />
                    <StackedTextField label="Custom Icon (emoji)" value={props.customIcon ?? ""} onChange={(v) => set("customIcon", v)} placeholder="e.g. 🔔" />
                    <ToggleField label="Dismissible" value={!!props.dismissible} onChange={(v) => set("dismissible", v)} />
                  </>
                )}
                {tab === "style" && (
                  <>
                    <TabSection title="Colors" />
                    <ColorPickerField label="Background Color" value={props.bgColor ?? ""} onChange={(v) => set("bgColor", v)} />
                    <ColorPickerField label="Text Color" value={props.textColor ?? ""} onChange={(v) => set("textColor", v)} />
                    <ColorPickerField label="Border Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
                    <ColorPickerField label="Icon Color" value={props.iconColor ?? ""} onChange={(v) => set("iconColor", v)} />
                    <TabSection title="Typography" />
                    <StackedTextField label="Title Font Size" value={props.titleFontSize ?? "1rem"} onChange={(v) => set("titleFontSize", v)} placeholder="e.g. 1rem" />
                    <InlineSelect label="Title Font Weight" value={props.titleFontWeight ?? "700"} onChange={(v) => set("titleFontWeight", v)} options={[{ value: "400", label: "Normal" }, { value: "700", label: "Bold" }]} />
                    <StackedTextField label="Message Font Size" value={props.msgFontSize ?? "0.9rem"} onChange={(v) => set("msgFontSize", v)} placeholder="e.g. 0.9rem" />
                    <StackedTextField label="Line Height" value={props.lineHeight ?? "1.5"} onChange={(v) => set("lineHeight", v)} placeholder="e.g. 1.5" />
                    <TabSection title="Border" />
                    <InlineSelect label="Border Style" value={props.borderStyle ?? "solid"} onChange={(v) => set("borderStyle", v)} options={[{ value: "none", label: "None" }, { value: "solid", label: "Solid" }, { value: "left-only", label: "Left Only" }]} />
                    <StackedNumberField label="Border Width (px)" value={props.borderWidth ?? 1} onChange={(v) => set("borderWidth", v)} min={1} max={10} step={1} />
                    <StackedNumberField label="Border Radius (px)" value={props.borderRadius ?? 8} onChange={(v) => set("borderRadius", v)} min={0} max={50} step={1} />
                  </>
                )}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 16, right: 16, bottom: 16, left: 16 }} onChange={(v) => set("advPadding", v)} />
                    <TabSection title="Background" />
                    <InlineSelect label="Type" value={bgType} onChange={(v) => set("advBgType", v)} options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }]} />
                    {bgType === "color" && <ColorPickerField label="Color" value={props.advBgColor ?? ""} onChange={(v) => set("advBgColor", v)} />}
                    <TabSection title="Responsive" />
                    <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                    <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
                    <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />
                  </>
                )}
              </>
            )}
          </BlockTabBar>
        );
      },
    },
  },
  defaultProps: {
    alertTitle: "", message: "This is an important message.", alertType: "info", showIcon: true, customIcon: "", dismissible: false,
    bgColor: "", textColor: "", borderColor: "", iconColor: "",
    titleFontSize: "1rem", titleFontWeight: "700", msgFontSize: "0.9rem", lineHeight: "1.5",
    borderStyle: "solid", borderWidth: 1, borderRadius: 8,
    advBgType: "none", advBgColor: "", advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 16, right: 16, bottom: 16, left: 16 },
    hideDesktop: false, hideTablet: false, hideMobile: false, cssId: "", cssClass: "", zIndex: null,
  },
  render: ({ alertTitle, message, alertType, showIcon, customIcon, dismissible, bgColor, textColor, borderColor, iconColor, titleFontSize, titleFontWeight, msgFontSize, lineHeight, borderStyle, borderWidth, borderRadius, advBgType, advBgColor, advMargin, advPadding, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex }) => {
    const [dismissed, setDismissed] = useState(false);
    const typeMap: Record<string, { bg: string; text: string; border: string; icon: string }> = {
      info:    { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe", icon: "ℹ️" },
      success: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", icon: "✅" },
      warning: { bg: "#fffbeb", text: "#92400e", border: "#fde68a", icon: "⚠️" },
      error:   { bg: "#fef2f2", text: "#991b1b", border: "#fecaca", icon: "❌" },
      custom:  { bg: "#f9fafb", text: "#111827", border: "#e5e7eb", icon: "🔔" },
    };
    const t = typeMap[alertType ?? "info"] ?? typeMap.info;
    const resolvedBg = bgColor || t.bg;
    const resolvedText = textColor || t.text;
    const resolvedBorder = borderColor || t.border;
    const resolvedIcon = customIcon || t.icon;
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    if (dismissed) return null;
    const borderCss: React.CSSProperties = borderStyle === "left-only"
      ? { borderLeft: `${borderWidth || 4}px solid ${resolvedBorder}` }
      : borderStyle !== "none"
      ? { border: `${borderWidth || 1}px solid ${resolvedBorder}` }
      : {};
    return (
      <div id={cssId || undefined} className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined} style={{ paddingTop: advPadding?.top ?? 16, paddingRight: advPadding?.right ?? 16, paddingBottom: advPadding?.bottom ?? 16, paddingLeft: advPadding?.left ?? 16, marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0, marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0, backgroundColor: resolvedBg, color: resolvedText, borderRadius: borderRadius ?? 8, zIndex: zIndex ?? undefined, position: "relative", lineHeight: lineHeight || "1.5", ...borderCss, ...(advBgType === "color" && advBgColor ? { backgroundColor: advBgColor } : {}) }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          {showIcon && <span style={{ fontSize: "1.25rem", color: iconColor || resolvedText, flexShrink: 0, lineHeight: 1.3 }}>{resolvedIcon}</span>}
          <div style={{ flex: 1 }}>
            {alertTitle && <div style={{ fontSize: titleFontSize || "1rem", fontWeight: titleFontWeight || "700", marginBottom: 4 }}>{alertTitle}</div>}
            <div style={{ fontSize: msgFontSize || "0.9rem" }}>{message}</div>
          </div>
          {dismissible && <button onClick={() => setDismissed(true)} style={{ background: "none", border: "none", cursor: "pointer", color: resolvedText, fontSize: "1.2rem", lineHeight: 1, padding: 0, opacity: 0.6, flexShrink: 0 }}>×</button>}
        </div>
      </div>
    );
  },
};

// ─── Block Quote Component ────────────────────────────────────────────────────

const BlockQuoteComponent = {
  label: "Block Quote",
  fields: {
    _tabs: {
      type: "custom",
      label: "",
      render: ({ value: _v, onChange: _onChange }: any) => {
        const { selectedItem, appState, dispatch } = usePuck();
        const props = selectedItem?.props ?? {};
        const set = (key: string, val: any) => {
          if (!selectedItem) return;
          const state = appState.data;
          let destinationZone = "root:default-zone", destinationIndex = 0;
          const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
          for (const [zone, items] of Object.entries(zones)) {
            const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
            if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
          }
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...props, [key]: val } } });
        };
        const bgType = props.advBgType ?? "none";
        return (
          <BlockTabBar blockKey="BlockQuote">
            {(tab) => (
              <>
                {tab === "content" && (
                  <>
                    <StackedTextareaField label="Quote Text" value={props.quoteText ?? ""} onChange={(v) => set("quoteText", v)} placeholder="Enter quote..." rows={4} />
                    <StackedTextField label="Author Name" value={props.authorName ?? ""} onChange={(v) => set("authorName", v)} placeholder="Author name..." />
                    <StackedTextField label="Author Title" value={props.authorTitle ?? ""} onChange={(v) => set("authorTitle", v)} placeholder="CEO, Acme Inc." />
                    <StackedField label="Author Image">
                      <ImageField label="Author Image" value={props.authorImage ?? ""} onChange={(v) => set("authorImage", v)} />
                    </StackedField>
                    <ToggleField label="Show Quote Icon" value={props.showQuoteIcon !== false} onChange={(v) => set("showQuoteIcon", v)} />
                  </>
                )}
                {tab === "style" && (
                  <>
                    <TabSection title="Quote Text" />
                    <InlineSelect label="Font Family" value={props.quoteFontFamily ?? "inherit"} onChange={(v) => set("quoteFontFamily", v)} options={[{ value: "inherit", label: "Theme Default" }, { value: "Georgia, serif", label: "Georgia" }, { value: "serif", label: "Serif" }, { value: "sans-serif", label: "Sans-serif" }]} />
                    <StackedTextField label="Font Size" value={props.quoteFontSize ?? "1.25rem"} onChange={(v) => set("quoteFontSize", v)} placeholder="e.g. 1.25rem or 20px" />
                    <InlineSelect label="Font Style" value={props.quoteFontStyle ?? "italic"} onChange={(v) => set("quoteFontStyle", v)} options={[{ value: "normal", label: "Normal" }, { value: "italic", label: "Italic" }]} />
                    <ColorPickerField label="Text Color" value={props.quoteTextColor ?? ""} onChange={(v) => set("quoteTextColor", v)} />
                    <StackedTextField label="Line Height" value={props.quoteLineHeight ?? "1.7"} onChange={(v) => set("quoteLineHeight", v)} placeholder="e.g. 1.7 or 2rem" />
                    <TabSection title="Author" />
                    <ColorPickerField label="Name Color" value={props.nameColor ?? ""} onChange={(v) => set("nameColor", v)} />
                    <StackedTextField label="Name Font Size" value={props.nameFontSize ?? "1rem"} onChange={(v) => set("nameFontSize", v)} placeholder="e.g. 1rem" />
                    <InlineSelect label="Name Font Weight" value={props.nameFontWeight ?? "700"} onChange={(v) => set("nameFontWeight", v)} options={[{ value: "400", label: "Normal" }, { value: "700", label: "Bold" }]} />
                    <ColorPickerField label="Title Color" value={props.titleColor ?? ""} onChange={(v) => set("titleColor", v)} />
                    <StackedTextField label="Title Font Size" value={props.titleFontSize ?? "0.875rem"} onChange={(v) => set("titleFontSize", v)} placeholder="e.g. 0.875rem" />
                    <StackedTextField label="Image Size" value={props.imageSize ?? "48px"} onChange={(v) => set("imageSize", v)} placeholder="e.g. 48px" />
                    <StackedTextField label="Image Border Radius" value={props.imageBorderRadius ?? "50%"} onChange={(v) => set("imageBorderRadius", v)} placeholder="e.g. 50% or 8px" />
                    <TabSection title="Quote Icon" />
                    <ColorPickerField label="Icon Color" value={props.iconColor ?? ""} onChange={(v) => set("iconColor", v)} />
                    <StackedTextField label="Icon Size" value={props.iconSize ?? "3rem"} onChange={(v) => set("iconSize", v)} placeholder="e.g. 3rem or 48px" />
                    <InlineSelect label="Icon Position" value={props.iconPosition ?? "top-left"} onChange={(v) => set("iconPosition", v)} options={[{ value: "top-left", label: "Top Left" }, { value: "top-right", label: "Top Right" }, { value: "background", label: "Background" }]} />
                    <TabSection title="Border" />
                    <InlineSelect label="Border Style" value={props.borderType ?? "left"} onChange={(v) => set("borderType", v)} options={[{ value: "none", label: "None" }, { value: "left", label: "Left Border" }, { value: "top", label: "Top Border" }, { value: "box", label: "Box" }]} />
                    <ColorPickerField label="Border Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
                    <StackedNumberField label="Border Width (px)" value={props.borderWidth ?? 4} onChange={(v) => set("borderWidth", v)} min={1} max={20} step={1} />
                    <TabSection title="Background" />
                    <ColorPickerField label="Background Color" value={props.bgColor ?? ""} onChange={(v) => set("bgColor", v)} />
                    <TabSection title="Alignment" />
                    <AlignField label="Alignment" value={props.alignment ?? "left"} onChange={(v) => set("alignment", v)} options={[{ value: "left", icon: <AlignLeft size={15} />, title: "Left" }, { value: "center", icon: <AlignCenter size={15} />, title: "Center" }, { value: "right", icon: <AlignRight size={15} />, title: "Right" }]} />
                  </>
                )}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 24, right: 24, bottom: 24, left: 24 }} onChange={(v) => set("advPadding", v)} />
                    <TabSection title="Background" />
                    <InlineSelect label="Type" value={bgType} onChange={(v) => set("advBgType", v)} options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }]} />
                    {bgType === "color" && <ColorPickerField label="Color" value={props.advBgColorWrap ?? ""} onChange={(v) => set("advBgColorWrap", v)} />}
                    <TabSection title="Border" />
                    <InlineSelect label="Border Style" value={props.advBorderStyle ?? "none"} onChange={(v) => set("advBorderStyle", v)} options={[{ value: "none", label: "None" }, { value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }]} />
                    {props.advBorderStyle !== "none" && (<><FourSideField label="Border Width (px)" value={props.advBorderWidth} onChange={(v) => set("advBorderWidth", v)} /><ColorPickerField label="Border Color" value={props.advBorderColor ?? ""} onChange={(v) => set("advBorderColor", v)} /></>)}
                    <FourSideField label="Border Radius (px)" value={props.advBorderRadius} onChange={(v) => set("advBorderRadius", v)} />
                    <TabSection title="Responsive" />
                    <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                    <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
                    <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />
                    <StackedNumberField label="Opacity (%)" value={props.opacity ?? 100} onChange={(v) => set("opacity", v)} min={0} max={100} step={1} />
                  </>
                )}
              </>
            )}
          </BlockTabBar>
        );
      },
    },
  },
  defaultProps: {
    quoteText: "The best way to predict the future is to create it.", authorName: "", authorTitle: "", authorImage: "", showQuoteIcon: true,
    quoteFontFamily: "inherit", quoteFontSize: "1.25rem", quoteFontStyle: "italic", quoteTextColor: "", quoteLineHeight: "1.7",
    nameColor: "", nameFontSize: "1rem", nameFontWeight: "700", titleColor: "", titleFontSize: "0.875rem", imageSize: "48px", imageBorderRadius: "50%",
    iconColor: "", iconSize: "3rem", iconPosition: "top-left",
    borderType: "left", borderColor: "", borderWidth: 4,
    bgColor: "",
    alignment: "left",
    advBgType: "none", advBgColorWrap: "", advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 24, right: 24, bottom: 24, left: 24 },
    advBorderStyle: "none", advBorderWidth: { top: 0, right: 0, bottom: 0, left: 0 }, advBorderColor: "", advBorderRadius: { top: 0, right: 0, bottom: 0, left: 0 },
    hideDesktop: false, hideTablet: false, hideMobile: false, cssId: "", cssClass: "", zIndex: null, opacity: 100,
  },
  render: ({ quoteText, authorName, authorTitle, authorImage, showQuoteIcon, quoteFontFamily, quoteFontSize, quoteFontStyle, quoteTextColor, quoteLineHeight, nameColor, nameFontSize, nameFontWeight, titleColor, titleFontSize, imageSize, imageBorderRadius, iconColor, iconSize, iconPosition, borderType, borderColor, borderWidth, bgColor, alignment, advBgType, advBgColorWrap, advMargin, advPadding, advBorderStyle, advBorderWidth, advBorderColor, advBorderRadius, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex, opacity }) => {
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const borderMap: Record<string, React.CSSProperties> = {
      none: {},
      left: { borderLeft: `${borderWidth || 4}px solid ${borderColor || "var(--primary-color)"}`, paddingLeft: 20 },
      top: { borderTop: `${borderWidth || 4}px solid ${borderColor || "var(--primary-color)"}`, paddingTop: 20 },
      box: { border: `${borderWidth || 2}px solid ${borderColor || "var(--primary-color)"}` },
    };
    const wrapBg = advBgType === "color" && advBgColorWrap ? { backgroundColor: advBgColorWrap } : {};
    const quoteIconSvg = (
      <svg width={iconSize || "3rem"} height={iconSize || "3rem"} viewBox="0 0 24 24" fill={iconColor || "var(--primary-color)"} style={{ opacity: 0.15 }}>
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
      </svg>
    );
    return (
      <div id={cssId || undefined} className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined} style={{ textAlign: alignment as any, paddingTop: advPadding?.top ?? 24, paddingRight: advPadding?.right ?? 24, paddingBottom: advPadding?.bottom ?? 24, paddingLeft: advPadding?.left ?? 24, marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0, marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0, zIndex: zIndex ?? undefined, opacity: opacity != null ? opacity / 100 : 1, borderTopLeftRadius: advBorderRadius?.top ?? 0, borderTopRightRadius: advBorderRadius?.right ?? 0, borderBottomRightRadius: advBorderRadius?.bottom ?? 0, borderBottomLeftRadius: advBorderRadius?.left ?? 0, ...(advBorderStyle && advBorderStyle !== "none" ? { borderStyle: advBorderStyle, borderTopWidth: advBorderWidth?.top ?? 0, borderRightWidth: advBorderWidth?.right ?? 0, borderBottomWidth: advBorderWidth?.bottom ?? 0, borderLeftWidth: advBorderWidth?.left ?? 0, borderColor: advBorderColor || "currentColor" } : {}), ...wrapBg }}>
        <blockquote style={{ margin: 0, position: "relative", backgroundColor: bgColor || "transparent", padding: bgColor ? 24 : 0, borderRadius: bgColor ? 8 : 0, ...borderMap[borderType ?? "left"] }}>
          {showQuoteIcon && iconPosition === "background" && <div style={{ position: "absolute", top: 0, right: 0, pointerEvents: "none" }}>{quoteIconSvg}</div>}
          {showQuoteIcon && iconPosition === "top-left" && <div style={{ marginBottom: 8 }}>{quoteIconSvg}</div>}
          {showQuoteIcon && iconPosition === "top-right" && <div style={{ textAlign: "right", marginBottom: 8 }}>{quoteIconSvg}</div>}
          <p style={{ fontSize: quoteFontSize || "1.25rem", fontFamily: quoteFontFamily !== "inherit" ? quoteFontFamily : undefined, fontStyle: quoteFontStyle || "italic", color: quoteTextColor || "var(--text-color)", lineHeight: quoteLineHeight || "1.7", margin: "0 0 16px 0" }}>"{quoteText}"</p>
          {(authorName || authorImage) && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: alignment === "center" ? "center" : alignment === "right" ? "flex-end" : "flex-start" }}>
              {authorImage && <img src={authorImage} alt={authorName || ""} style={{ width: imageSize || "48px", height: imageSize || "48px", borderRadius: imageBorderRadius || "50%", objectFit: "cover", flexShrink: 0 }} />}
              <div>
                {authorName && <div style={{ fontSize: nameFontSize || "1rem", fontWeight: nameFontWeight || "700", color: nameColor || "var(--text-color)" }}>{authorName}</div>}
                {authorTitle && <div style={{ fontSize: titleFontSize || "0.875rem", color: titleColor || "var(--text-color)", opacity: 0.7 }}>{authorTitle}</div>}
              </div>
            </div>
          )}
        </blockquote>
      </div>
    );
  },
};

// ─── Icons Component ─────────────────────────────────────────────────────────

const IconsComponent = {
  label: "Icon",
  fields: {
    _tabs: {
      type: "custom",
      label: "",
      render: ({ value: _v, onChange: _onChange }: any) => {
        const { selectedItem, appState, dispatch } = usePuck();
        const props = selectedItem?.props ?? {};
        const set = (key: string, val: any) => {
          if (!selectedItem) return;
          const state = appState.data;
          let destinationZone = "root:default-zone", destinationIndex = 0;
          const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
          for (const [zone, items] of Object.entries(zones)) {
            const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
            if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
          }
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...props, [key]: val } } });
        };
        const bgType = props.advBgType ?? "none";
        return (
          <BlockTabBar blockKey="Icons">
            {(tab) => (
              <>
                {tab === "content" && (
                  <>
                    <InlineSelect label="Icon Type" value={props.iconType ?? "emoji"} onChange={(v) => set("iconType", v)} options={[{ value: "emoji", label: "Emoji / Text" }, { value: "image", label: "Image Upload" }]} />
                    {(props.iconType ?? "emoji") === "emoji" ? (
                      <StackedTextField label="Icon (emoji or text)" value={props.icon ?? "★"} onChange={(v) => set("icon", v)} placeholder="e.g. ★ ♥ 🚀" />
                    ) : (
                      <ImageField label="Icon Image" value={props.iconImage ?? ""} onChange={(v) => set("iconImage", v)} />
                    )}
                    <StackedTextField label="Link URL" value={props.linkUrl ?? ""} onChange={(v) => set("linkUrl", v)} placeholder="https://..." />
                    <InlineSelect label="Link Target" value={props.linkTarget ?? "_self"} onChange={(v) => set("linkTarget", v)} options={[{ value: "_self", label: "Same Tab" }, { value: "_blank", label: "New Tab" }]} />
                    <StackedTextField label="Tooltip Text" value={props.tooltip ?? ""} onChange={(v) => set("tooltip", v)} placeholder="Hover tooltip..." />
                  </>
                )}
                {tab === "style" && (
                  <>
                    <TabSection title="Icon" />
                    <StackedTextField label="Size" value={props.iconSize ?? "48px"} onChange={(v) => set("iconSize", v)} placeholder="e.g. 48px or 3rem" />
                    <ColorPickerField label="Color" value={props.iconColor ?? ""} onChange={(v) => set("iconColor", v)} />
                    <ColorPickerField label="Hover Color" value={props.hoverColor ?? ""} onChange={(v) => set("hoverColor", v)} />
                    <InlineSelect label="Rotate" value={String(props.rotate ?? "0")} onChange={(v) => set("rotate", v)} options={[{ value: "0", label: "0°" }, { value: "90", label: "90°" }, { value: "180", label: "180°" }, { value: "270", label: "270°" }]} />
                    <TabSection title="Background" />
                    <InlineSelect label="Background Type" value={props.bgType ?? "none"} onChange={(v) => set("bgType", v)} options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }, { value: "gradient", label: "Gradient" }]} />
                    {props.bgType === "color" && <ColorPickerField label="Background Color" value={props.bgColor ?? ""} onChange={(v) => set("bgColor", v)} />}
                    {props.bgType === "gradient" && (
                      <>
                        <ColorPickerField label="Gradient Color 1" value={props.bgGrad1 ?? ""} onChange={(v) => set("bgGrad1", v)} />
                        <ColorPickerField label="Gradient Color 2" value={props.bgGrad2 ?? ""} onChange={(v) => set("bgGrad2", v)} />
                      </>
                    )}
                    <InlineSelect label="Background Shape" value={props.bgShape ?? "none"} onChange={(v) => set("bgShape", v)} options={[{ value: "none", label: "None" }, { value: "circle", label: "Circle" }, { value: "square", label: "Square" }, { value: "rounded", label: "Rounded" }]} />
                    <StackedTextField label="Background Size" value={props.bgSize ?? "80px"} onChange={(v) => set("bgSize", v)} placeholder="e.g. 80px" />
                    <ColorPickerField label="Hover Background" value={props.hoverBg ?? ""} onChange={(v) => set("hoverBg", v)} />
                    <TabSection title="Border" />
                    <InlineSelect label="Border Style" value={props.borderStyle ?? "none"} onChange={(v) => set("borderStyle", v)} options={[{ value: "none", label: "None" }, { value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }]} />
                    {props.borderStyle !== "none" && (
                      <>
                        <StackedNumberField label="Border Width (px)" value={props.borderWidth ?? 2} onChange={(v) => set("borderWidth", v)} min={1} max={10} step={1} />
                        <ColorPickerField label="Border Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
                      </>
                    )}
                    <StackedTextField label="Border Radius" value={props.borderRadius ?? "0px"} onChange={(v) => set("borderRadius", v)} placeholder="e.g. 8px or 50%" />
                    <TabSection title="Alignment" />
                    <AlignField label="Alignment" value={props.alignment ?? "left"} onChange={(v) => set("alignment", v)} options={[{ value: "left", icon: <AlignLeft size={15} />, title: "Left" }, { value: "center", icon: <AlignCenter size={15} />, title: "Center" }, { value: "right", icon: <AlignRight size={15} />, title: "Right" }]} />
                  </>
                )}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 8, right: 8, bottom: 8, left: 8 }} onChange={(v) => set("advPadding", v)} />
                    <TabSection title="Background" />
                    <InlineSelect label="Type" value={bgType} onChange={(v) => set("advBgType", v)} options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }]} />
                    {bgType === "color" && <ColorPickerField label="Color" value={props.advBgColor ?? ""} onChange={(v) => set("advBgColor", v)} />}
                    <TabSection title="Responsive" />
                    <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                    <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
                    <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />
                    <StackedNumberField label="Opacity (%)" value={props.opacity ?? 100} onChange={(v) => set("opacity", v)} min={0} max={100} step={1} />
                  </>
                )}
              </>
            )}
          </BlockTabBar>
        );
      },
    },
  },
  defaultProps: {
    iconType: "emoji", icon: "★", iconImage: "", linkUrl: "", linkTarget: "_self", tooltip: "",
    iconSize: "48px", iconColor: "", hoverColor: "", rotate: "0",
    bgType: "none", bgColor: "", bgGrad1: "", bgGrad2: "", bgShape: "none", bgSize: "80px", hoverBg: "",
    borderStyle: "none", borderWidth: 2, borderColor: "", borderRadius: "0px",
    alignment: "left",
    advBgType: "none", advBgColor: "", advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 8, right: 8, bottom: 8, left: 8 },
    hideDesktop: false, hideTablet: false, hideMobile: false, cssId: "", cssClass: "", zIndex: null, opacity: 100,
  },
  render: ({ iconType, icon, iconImage, linkUrl, linkTarget, tooltip, iconSize, iconColor, hoverColor, rotate, bgType, bgColor, bgGrad1, bgGrad2, bgShape, bgSize, hoverBg, borderStyle, borderWidth, borderColor, borderRadius, alignment, advBgType, advBgColor, advMargin, advPadding, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex, opacity }) => {
    const id = cssId || `icon-${Math.random().toString(36).slice(2, 7)}`;
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const bg = bgType === "color" ? bgColor : bgType === "gradient" && bgGrad1 && bgGrad2 ? `linear-gradient(135deg,${bgGrad1},${bgGrad2})` : undefined;
    const shapeRadius = bgShape === "circle" ? "50%" : bgShape === "rounded" ? "12px" : bgShape === "square" ? "0px" : undefined;
    const hoverCss = (hoverColor || hoverBg) ? `#${id}:hover .puck-icon-inner { ${hoverColor ? `color: ${hoverColor};` : ""} ${hoverBg ? `background: ${hoverBg};` : ""} transition: all 0.2s ease; }` : "";
    const wrapBg = advBgType === "color" && advBgColor ? { backgroundColor: advBgColor } : {};
    const isImage = (iconType ?? "emoji") === "image" && iconImage;
    const innerStyle: React.CSSProperties = {
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: bg || shapeRadius ? bgSize || "80px" : (isImage ? iconSize || "48px" : undefined),
      height: bg || shapeRadius ? bgSize || "80px" : (isImage ? iconSize || "48px" : undefined),
      background: bg || undefined,
      borderRadius: shapeRadius || (borderStyle !== "none" ? borderRadius : undefined),
      border: borderStyle !== "none" ? `${borderWidth ?? 2}px ${borderStyle} ${borderColor || "currentColor"}` : undefined,
      fontSize: iconSize || "48px",
      color: iconColor || "var(--primary-color)",
      transform: rotate && rotate !== "0" ? `rotate(${rotate}deg)` : undefined,
      opacity: opacity != null ? opacity / 100 : 1,
      cursor: linkUrl ? "pointer" : undefined,
      overflow: isImage ? "hidden" : undefined,
    };
    const iconContent = isImage
      ? <img src={iconImage} alt={tooltip || "icon"} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
      : (icon || "★");
    const inner = <span className="puck-icon-inner" style={innerStyle} title={tooltip || undefined}>{iconContent}</span>;
    return (
      <div id={id} className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined} style={{ textAlign: alignment as any, paddingTop: advPadding?.top ?? 8, paddingRight: advPadding?.right ?? 8, paddingBottom: advPadding?.bottom ?? 8, paddingLeft: advPadding?.left ?? 8, marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0, marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0, zIndex: zIndex ?? undefined, ...wrapBg }}>
        {hoverCss && <style>{hoverCss}</style>}
        {linkUrl ? <a href={linkUrl} target={linkTarget ?? "_self"} rel={linkTarget === "_blank" ? "noopener noreferrer" : undefined} style={{ textDecoration: "none", color: "inherit", display: "inline-block" }}>{inner}</a> : inner}
      </div>
    );
  },
};

// ─── Layout Block ─────────────────────────────────────────────────────────────

// ─── Slider with number input (used by Container block) ──────────────────────

function SliderNumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "PX",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  const stepBy = (dir: 1 | -1) => {
    let n = (value ?? 0) + dir * step;
    n = Math.max(min, Math.min(max, n));
    onChange(n);
  };
  const btnS: React.CSSProperties = {
    width: 22, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
    border: "1px solid var(--p-color-border)", borderRadius: 4,
    background: "var(--p-color-bg-surface)", cursor: "pointer",
    fontSize: 14, lineHeight: 1, color: "var(--p-color-text)", padding: 0, flexShrink: 0,
  };
  return (
    <FieldLabel label="">
      <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#000" }}>{label}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <button style={btnS} onClick={() => stepBy(-1)} type="button">−</button>
            <input
              type="number"
              value={value ?? 0}
              min={min}
              max={max}
              step={step}
              onChange={(e) => onChange(Number(e.target.value))}
              style={{
                width: 52, padding: "2px 4px", fontSize: 12, fontWeight: 600,
                border: "1px solid var(--p-color-border)", borderRadius: 4,
                background: "var(--p-color-bg-surface)", color: "var(--p-color-text)",
                textAlign: "center", outline: "none", MozAppearance: "textfield",
              }}
            />
            <button style={btnS} onClick={() => stepBy(1)} type="button">+</button>
            <span style={{ fontSize: 10, color: "var(--p-color-text-secondary)", fontWeight: 600, minWidth: 20 }}>{unit}</span>
          </div>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ width: "100%", accentColor: "var(--p-color-bg-fill-brand, #005bd3)", cursor: "pointer" }}
        />
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

// ─── Container Block (Elementor-style) ────────────────────────────────────────

const LayoutBlockComponent = {
  label: "Container",
  fields: {
    _tabs: {
      type: "custom",
      label: "",
      render: ({ value: _v, onChange: _onChange }: any) => {
        const { selectedItem, appState, dispatch } = usePuck();
        const props = selectedItem?.props ?? {};
        const set = (key: string, val: any) => {
          if (!selectedItem) return;
          const state = appState.data;
          let destinationZone = "root:default-zone", destinationIndex = 0;
          const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
          for (const [zone, items] of Object.entries(zones)) {
            const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
            if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
          }
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...props, [key]: val } } });
        };

        const direction = props.direction ?? "row";
        const isRow = direction === "row" || direction === "row-reverse";

        return (
          <BlockTabBar blockKey="LayoutBlock">
            {(tab) => (
              <>
                {/* ── LAYOUT TAB ── */}
                {tab === "content" && (
                  <>
                    <TabSection title="Container" />
                    <InlineSelect
                      label="Content Width"
                      value={props.contentWidth ?? "boxed"}
                      onChange={(v) => set("contentWidth", v)}
                      options={[{ value: "boxed", label: "Boxed" }, { value: "full", label: "Full Width" }]}
                    />
                    {props.contentWidth === "boxed" && (
                      <SliderNumberField label="Width" value={props.containerWidth ?? 1140} onChange={(v) => set("containerWidth", v)} min={200} max={1600} step={10} unit="PX" />
                    )}
                    <SliderNumberField label="Min Height" value={props.minHeightPx ?? 0} onChange={(v) => set("minHeightPx", v)} min={0} max={1200} step={10} unit="PX" />
                    <div style={{ fontSize: 11, color: "var(--p-color-text-secondary)", marginTop: -6 }}>To achieve full height Container use 100vh.</div>

                    <TabSection title="Items" />
                    <IconButtonGroup
                      label="Direction"
                      value={direction}
                      onChange={(v) => set("direction", v)}
                      options={[
                        { value: "row", title: "Row (→)", icon: DIR_ICONS.row },
                        { value: "column", title: "Column (↓)", icon: DIR_ICONS.column },
                        { value: "row-reverse", title: "Row Reverse (←)", icon: DIR_ICONS["row-reverse"] },
                        { value: "column-reverse", title: "Column Reverse (↑)", icon: DIR_ICONS["column-reverse"] },
                      ]}
                    />
                    <IconButtonGroup
                      label="Justify Content"
                      value={props.justifyContent ?? "flex-start"}
                      onChange={(v) => set("justifyContent", v)}
                      options={[
                        { value: "flex-start", title: "Start", icon: JUSTIFY_ICONS["flex-start"] },
                        { value: "center", title: "Center", icon: JUSTIFY_ICONS.center },
                        { value: "flex-end", title: "End", icon: JUSTIFY_ICONS["flex-end"] },
                        { value: "space-between", title: "Space Between", icon: JUSTIFY_ICONS["space-between"] },
                        { value: "space-around", title: "Space Around", icon: JUSTIFY_ICONS["space-around"] },
                        { value: "space-evenly", title: "Space Evenly", icon: JUSTIFY_ICONS["space-evenly"] },
                      ]}
                    />
                    <IconButtonGroup
                      label="Align Items"
                      value={props.alignItems ?? "stretch"}
                      onChange={(v) => set("alignItems", v)}
                      options={[
                        { value: "flex-start", title: "Top / Start", icon: ALIGN_ICONS["flex-start"] },
                        { value: "center", title: "Center", icon: ALIGN_ICONS.center },
                        { value: "flex-end", title: "Bottom / End", icon: ALIGN_ICONS["flex-end"] },
                        { value: "stretch", title: "Stretch", icon: ALIGN_ICONS.stretch },
                      ]}
                    />
                    <SliderNumberField label="Gap between elements" value={props.gap ?? 0} onChange={(v) => set("gap", v)} min={0} max={200} step={1} unit="PX" />
                    <IconButtonGroup
                      label="Wrap"
                      value={props.wrap ?? "nowrap"}
                      onChange={(v) => set("wrap", v)}
                      options={[
                        { value: "nowrap", title: "No Wrap", icon: WRAP_ICONS.nowrap },
                        { value: "wrap", title: "Wrap", icon: WRAP_ICONS.wrap },
                      ]}
                    />
                    {props.wrap === "wrap" && (
                      <div style={{ fontSize: 11, color: "var(--p-color-text-secondary)", marginTop: -6 }}>
                        Items within the container can stay in a single line (No wrap), or break into multiple lines (Wrap).
                      </div>
                    )}
                  </>
                )}

                {/* ── STYLE TAB ── */}
                {tab === "style" && (
                  <>
                    <TabSection title="Background" />
                    <InlineSelect label="Type" value={props.bgType ?? "none"} onChange={(v) => set("bgType", v)} options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }, { value: "gradient", label: "Gradient" }, { value: "image", label: "Image" }, { value: "video", label: "Video" }]} />
                    {props.bgType === "color" && <ColorPickerField label="Color" value={props.bgColor ?? ""} onChange={(v) => set("bgColor", v)} />}
                    {props.bgType === "gradient" && (
                      <>
                        <ColorPickerField label="Start Color" value={props.bgGrad1 ?? ""} onChange={(v) => set("bgGrad1", v)} />
                        <ColorPickerField label="End Color" value={props.bgGrad2 ?? ""} onChange={(v) => set("bgGrad2", v)} />
                        <InlineSelect label="Direction" value={props.bgGradDir ?? "to bottom"} onChange={(v) => set("bgGradDir", v)} options={[{ value: "to bottom", label: "Top → Bottom" }, { value: "to right", label: "Left → Right" }, { value: "to bottom right", label: "Diagonal" }, { value: "to top", label: "Bottom → Top" }]} />
                        <SliderNumberField label="Angle" value={props.bgGradAngle ?? 180} onChange={(v) => set("bgGradAngle", v)} min={0} max={360} step={1} unit="°" />
                      </>
                    )}
                    {props.bgType === "image" && (
                      <>
                        <ImageField label="Image" value={props.bgImage ?? ""} onChange={(v) => set("bgImage", v)} />
                        <InlineSelect label="Size" value={props.bgSize ?? "cover"} onChange={(v) => set("bgSize", v)} options={[{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "auto", label: "Auto" }]} />
                        <InlineSelect label="Position" value={props.bgPos ?? "center center"} onChange={(v) => set("bgPos", v)} options={[{ value: "center center", label: "Center" }, { value: "top center", label: "Top" }, { value: "bottom center", label: "Bottom" }, { value: "center left", label: "Left" }, { value: "center right", label: "Right" }]} />
                        <InlineSelect label="Repeat" value={props.bgRepeat ?? "no-repeat"} onChange={(v) => set("bgRepeat", v)} options={[{ value: "no-repeat", label: "No Repeat" }, { value: "repeat", label: "Repeat" }, { value: "repeat-x", label: "Repeat X" }, { value: "repeat-y", label: "Repeat Y" }]} />
                        <ToggleField label="Fixed (Parallax)" value={!!props.bgFixed} onChange={(v) => set("bgFixed", v)} />
                        <TabSection title="Overlay" />
                        <InlineSelect label="Overlay Type" value={props.overlayType ?? "none"} onChange={(v) => set("overlayType", v)} options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }, { value: "gradient", label: "Gradient" }]} />
                        {props.overlayType === "color" && (
                          <>
                            <ColorPickerField label="Color" value={props.overlayColor ?? "#000000"} onChange={(v) => set("overlayColor", v)} />
                            <SliderNumberField label="Opacity" value={props.overlayOpacity ?? 50} onChange={(v) => set("overlayOpacity", v)} min={0} max={100} step={1} unit="%" />
                          </>
                        )}
                        {props.overlayType === "gradient" && (
                          <>
                            <ColorPickerField label="Start Color" value={props.overlayGrad1 ?? "rgba(0,0,0,0.8)"} onChange={(v) => set("overlayGrad1", v)} />
                            <ColorPickerField label="End Color" value={props.overlayGrad2 ?? "rgba(0,0,0,0)"} onChange={(v) => set("overlayGrad2", v)} />
                          </>
                        )}
                      </>
                    )}
                    {props.bgType === "video" && (
                      <>
                        <VideoUploadField value={props.bgVideo ?? ""} onChange={(v) => set("bgVideo", v)} />
                        <ToggleField label="Loop" value={props.bgVideoLoop !== false} onChange={(v) => set("bgVideoLoop", v)} />
                        <ToggleField label="Mute" value={props.bgVideoMute !== false} onChange={(v) => set("bgVideoMute", v)} />
                        <ColorPickerField label="Fallback Color" value={props.bgColor ?? "#000"} onChange={(v) => set("bgColor", v)} />
                      </>
                    )}

                    <TabSection title="Border" />
                    <InlineSelect label="Border Type" value={props.borderStyle ?? "none"} onChange={(v) => set("borderStyle", v)} options={[{ value: "none", label: "None" }, { value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }, { value: "dotted", label: "Dotted" }, { value: "double", label: "Double" }]} />
                    {props.borderStyle !== "none" && (
                      <>
                        <FourSideField label="Border Width (px)" value={props.borderWidth4 ?? { top: 1, right: 1, bottom: 1, left: 1 }} onChange={(v) => set("borderWidth4", v)} />
                        <ColorPickerField label="Border Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
                      </>
                    )}
                    <FourSideField label="Border Radius (px)" value={props.borderRadius4 ?? { top: 0, right: 0, bottom: 0, left: 0 }} onChange={(v) => set("borderRadius4", v)} />


                    <TabSection title="Shape Divider" />
                    <InlineSelect label="Top Divider" value={props.dividerTop ?? "none"} onChange={(v) => set("dividerTop", v)} options={[{ value: "none", label: "None" }, { value: "triangle", label: "Triangle" }, { value: "curve", label: "Curve" }, { value: "wave", label: "Wave" }]} />
                    {props.dividerTop !== "none" && (
                      <>
                        <ColorPickerField label="Top Color" value={props.dividerTopColor ?? "#fff"} onChange={(v) => set("dividerTopColor", v)} />
                        <SliderNumberField label="Top Height" value={props.dividerTopHeight ?? 50} onChange={(v) => set("dividerTopHeight", v)} min={10} max={300} step={5} unit="PX" />
                        <ToggleField label="Flip Horizontal" value={!!props.dividerTopFlip} onChange={(v) => set("dividerTopFlip", v)} />
                      </>
                    )}
                    <InlineSelect label="Bottom Divider" value={props.dividerBottom ?? "none"} onChange={(v) => set("dividerBottom", v)} options={[{ value: "none", label: "None" }, { value: "triangle", label: "Triangle" }, { value: "curve", label: "Curve" }, { value: "wave", label: "Wave" }]} />
                    {props.dividerBottom !== "none" && (
                      <>
                        <ColorPickerField label="Bottom Color" value={props.dividerBottomColor ?? "#fff"} onChange={(v) => set("dividerBottomColor", v)} />
                        <SliderNumberField label="Bottom Height" value={props.dividerBottomHeight ?? 50} onChange={(v) => set("dividerBottomHeight", v)} min={10} max={300} step={5} unit="PX" />
                        <ToggleField label="Flip Horizontal" value={!!props.dividerBottomFlip} onChange={(v) => set("dividerBottomFlip", v)} />
                      </>
                    )}
                  </>
                )}

                {/* ── ADVANCED TAB ── */}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 24, right: 24, bottom: 24, left: 24 }} onChange={(v) => set("advPadding", v)} />
                    <TabSection title="Responsive" />
                    <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                    <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
                    <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />
                    <TabSection title="Motion Effects" />
                    <InlineSelect label="Entrance Animation" value={props.animation ?? "none"} onChange={(v) => set("animation", v)} options={[{ value: "none", label: "None" }, { value: "fadeIn", label: "Fade In" }, { value: "fadeInUp", label: "Fade In Up" }, { value: "fadeInDown", label: "Fade In Down" }, { value: "slideInLeft", label: "Slide In Left" }, { value: "slideInRight", label: "Slide In Right" }, { value: "zoomIn", label: "Zoom In" }]} />
                    {props.animation && props.animation !== "none" && (
                      <>
                        <SliderNumberField label="Duration (ms)" value={props.animDuration ?? 600} onChange={(v) => set("animDuration", v)} min={100} max={3000} step={100} unit="ms" />
                        <SliderNumberField label="Delay (ms)" value={props.animDelay ?? 0} onChange={(v) => set("animDelay", v)} min={0} max={3000} step={100} unit="ms" />
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </BlockTabBar>
        );
      },
    },
  },
  defaultProps: {
    contentWidth: "boxed", containerWidth: 1140, minHeightPx: 0,
    direction: "row", justifyContent: "flex-start", alignItems: "stretch", gap: 0, wrap: "nowrap",
    bgType: "none", bgColor: "", bgGrad1: "", bgGrad2: "", bgGradDir: "to bottom", bgGradAngle: 180,
    bgImage: "", bgSize: "cover", bgPos: "center center", bgRepeat: "no-repeat", bgFixed: false,
    overlayType: "none", overlayColor: "#000000", overlayOpacity: 50, overlayGrad1: "rgba(0,0,0,0.8)", overlayGrad2: "rgba(0,0,0,0)",
    bgVideo: "", bgVideoLoop: true, bgVideoMute: true,
    borderStyle: "none", borderWidth4: { top: 1, right: 1, bottom: 1, left: 1 }, borderColor: "",
    borderRadius4: { top: 0, right: 0, bottom: 0, left: 0 },
    dividerTop: "none", dividerTopColor: "#fff", dividerTopHeight: 50, dividerTopFlip: false,
    dividerBottom: "none", dividerBottomColor: "#fff", dividerBottomHeight: 50, dividerBottomFlip: false,
    advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 24, right: 24, bottom: 24, left: 24 },
    hideDesktop: false, hideTablet: false, hideMobile: false,
    animation: "none", animDuration: 600, animDelay: 0,
    cssId: "", cssClass: "", customCss: "", zIndex: null,
  },
  render: ({
    id: puckId,
    contentWidth, containerWidth, minHeightPx,
    direction, justifyContent, alignItems, gap, wrap,
    bgType, bgColor, bgGrad1, bgGrad2, bgGradDir, bgGradAngle,
    bgImage, bgSize, bgPos, bgRepeat, bgFixed,
    overlayType, overlayColor, overlayOpacity, overlayGrad1, overlayGrad2,
    bgVideo, bgVideoLoop, bgVideoMute,
    borderStyle, borderWidth4, borderColor, borderRadius4,
    dividerTop, dividerTopColor, dividerTopHeight, dividerTopFlip,
    dividerBottom, dividerBottomColor, dividerBottomHeight, dividerBottomFlip,
    advMargin, advPadding, hideDesktop, hideTablet, hideMobile,
    animation, animDuration, animDelay,
    cssId, cssClass, customCss, zIndex,
  }: any) => {
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    // Use Puck's stable auto-assigned id — never Math.random() which re-runs every render
    const uid = cssId || `pb-container-${puckId || "c"}`;

    const resolvedBg =
      bgType === "color" ? (bgColor || undefined)
      : bgType === "gradient" ? `linear-gradient(${bgGradAngle ?? 180}deg, ${bgGrad1 || "transparent"}, ${bgGrad2 || "transparent"})`
      : bgType === "image" && bgImage ? bgImage
      : bgType === "video" ? (bgColor || undefined)
      : undefined;

    const br = borderRadius4 ?? { top: 0, right: 0, bottom: 0, left: 0 };
    const bw = borderWidth4 ?? { top: 1, right: 1, bottom: 1, left: 1 };

    const outerStyle: React.CSSProperties = {
      position: "relative",
      overflow: "hidden",
      backgroundColor: bgType === "color" ? (bgColor || undefined) : bgType === "video" ? (bgColor || "#000") : undefined,
      background: bgType === "gradient" ? resolvedBg : undefined,
      backgroundImage: bgType === "image" && bgImage ? `url("${bgImage}")` : undefined,
      backgroundSize: bgType === "image" ? (bgSize || "cover") : undefined,
      backgroundPosition: bgType === "image" ? (bgPos || "center center") : undefined,
      backgroundRepeat: bgType === "image" ? (bgRepeat || "no-repeat") : undefined,
      backgroundAttachment: bgType === "image" && bgFixed ? "fixed" : undefined,
      borderStyle: borderStyle !== "none" ? borderStyle : undefined,
      borderTopWidth: borderStyle !== "none" ? (bw.top ?? 1) : 0,
      borderRightWidth: borderStyle !== "none" ? (bw.right ?? 1) : 0,
      borderBottomWidth: borderStyle !== "none" ? (bw.bottom ?? 1) : 0,
      borderLeftWidth: borderStyle !== "none" ? (bw.left ?? 1) : 0,
      borderColor: borderStyle !== "none" ? (borderColor || "transparent") : undefined,
      borderTopLeftRadius: br.top ?? 0,
      borderTopRightRadius: br.right ?? 0,
      borderBottomRightRadius: br.bottom ?? 0,
      borderBottomLeftRadius: br.left ?? 0,
      minHeight: (minHeightPx && minHeightPx > 0) ? minHeightPx : undefined,
      paddingTop: advPadding?.top ?? 24, paddingRight: advPadding?.right ?? 24,
      paddingBottom: advPadding?.bottom ?? 24, paddingLeft: advPadding?.left ?? 24,
      marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0,
      marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0,
      zIndex: zIndex ?? undefined,
      boxSizing: "border-box",
    };

    const innerStyle: React.CSSProperties = {
      position: "relative", zIndex: 2,
      display: "flex",
      flexDirection: (direction as any) || "row",
      justifyContent: justifyContent || "flex-start",
      alignItems: alignItems || "stretch",
      gap: gap ? `${gap}px` : undefined,
      flexWrap: (wrap as any) || "nowrap",
      width: "100%",
      maxWidth: contentWidth === "boxed" ? `${containerWidth || 1140}px` : undefined,
      marginLeft: contentWidth === "boxed" ? "auto" : undefined,
      marginRight: contentWidth === "boxed" ? "auto" : undefined,
      boxSizing: "border-box",
    };

    // Shape divider SVG paths
    const renderDivider = (type: string, color: string, height: number, flip: boolean, position: "top" | "bottom") => {
      const shapes: Record<string, string> = {
        triangle: "M0,0 L50,100 L100,0 Z",
        curve: "M0,100 Q50,0 100,100 Z",
        wave: "M0,60 C20,100 40,0 60,60 C80,120 100,20 100,60 L100,100 L0,100 Z",
      };
      const d = shapes[type];
      if (!d) return null;
      return (
        <div style={{
          position: "absolute", [position]: 0, left: 0, right: 0, zIndex: 3,
          height: height || 50, overflow: "hidden",
          transform: flip ? "scaleX(-1)" : undefined,
        }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
            <path d={d} fill={color || "#fff"} />
          </svg>
        </div>
      );
    };

    const animCss = (animation && animation !== "none") ? `
      @keyframes puck-${animation} {
        from { ${animation === "fadeIn" ? "opacity:0" : animation === "fadeInUp" ? "opacity:0;transform:translateY(30px)" : animation === "fadeInDown" ? "opacity:0;transform:translateY(-30px)" : animation === "slideInLeft" ? "opacity:0;transform:translateX(-40px)" : animation === "slideInRight" ? "opacity:0;transform:translateX(40px)" : "opacity:0;transform:scale(0.9)"} }
        to { opacity:1;transform:none }
      }
      #${uid} { animation: puck-${animation} ${animDuration ?? 600}ms ease ${animDelay ?? 0}ms both; }
    ` : "";

    return (
      <div id={uid} className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined} style={outerStyle}>
        {(animCss || customCss) && <style>{animCss}{customCss}</style>}
        {/* Background video */}
        {bgType === "video" && bgVideo && (
          <video autoPlay loop={bgVideoLoop !== false} muted={bgVideoMute !== false} playsInline
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
            src={bgVideo}
          />
        )}
        {/* Overlay */}
        {bgType === "image" && overlayType === "color" && overlayOpacity > 0 && (
          <div style={{ position: "absolute", inset: 0, zIndex: 1, backgroundColor: overlayColor || "#000", opacity: (overlayOpacity || 0) / 100 }} />
        )}
        {bgType === "image" && overlayType === "gradient" && (
          <div style={{ position: "absolute", inset: 0, zIndex: 1, background: `linear-gradient(to bottom, ${overlayGrad1 || "rgba(0,0,0,0.8)"}, ${overlayGrad2 || "rgba(0,0,0,0)"})` }} />
        )}
        {/* Shape dividers */}
        {dividerTop !== "none" && renderDivider(dividerTop, dividerTopColor, dividerTopHeight, !!dividerTopFlip, "top")}
        {dividerBottom !== "none" && renderDivider(dividerBottom, dividerBottomColor, dividerBottomHeight, !!dividerBottomFlip, "bottom")}
        {/* Content — zone name is unique per block instance via uid */}
        <div style={innerStyle}>
          <DropZone zone={`container-content-${uid}`} />
        </div>
      </div>
    );
  },
};

// ─── Grid Block ───────────────────────────────────────────────────────────────

const GridBlockComponent = {
  label: "Grid",
  fields: {
    _tabs: {
      type: "custom",
      label: "",
      render: ({ value: _v, onChange: _onChange }: any) => {
        const { selectedItem, appState, dispatch } = usePuck();
        const props = selectedItem?.props ?? {};
        const set = (key: string, val: any) => {
          if (!selectedItem) return;
          const state = appState.data;
          let destinationZone = "root:default-zone", destinationIndex = 0;
          const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
          for (const [zone, items] of Object.entries(zones)) {
            const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
            if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
          }
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...props, [key]: val } } });
        };
        return (
          <BlockTabBar blockKey="GridBlock">
            {(tab) => (
              <>
                {tab === "content" && (
                  <>
                    <TabSection title="Columns" />
                    <InlineSelect label="Columns (Desktop)" value={String(props.columns ?? 2)} onChange={(v) => set("columns", Number(v))} options={[{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "6", label: "6" }]} />
                    <InlineSelect label="Columns (Tablet)" value={String(props.columnsTablet ?? 2)} onChange={(v) => set("columnsTablet", Number(v))} options={[{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }]} />
                    <InlineSelect label="Columns (Mobile)" value={String(props.columnsMobile ?? 1)} onChange={(v) => set("columnsMobile", Number(v))} options={[{ value: "1", label: "1" }, { value: "2", label: "2" }]} />
                    <TabSection title="Gap" />
                    <StackedTextField label="Column Gap" value={props.columnGap ?? "16px"} onChange={(v) => set("columnGap", v)} placeholder="e.g. 16px or 1rem" />
                    <StackedTextField label="Row Gap" value={props.rowGap ?? "16px"} onChange={(v) => set("rowGap", v)} placeholder="e.g. 16px or 1rem" />
                  </>
                )}
                {tab === "style" && (
                  <>
                    <TabSection title="Alignment" />
                    <InlineSelect label="Vertical Align" value={props.alignItems ?? "stretch"} onChange={(v) => set("alignItems", v)} options={[{ value: "stretch", label: "Stretch" }, { value: "flex-start", label: "Top" }, { value: "center", label: "Center" }, { value: "flex-end", label: "Bottom" }]} />
                    <TabSection title="Background" />
                    <ColorPickerField label="Background Color" value={props.bgColor ?? ""} onChange={(v) => set("bgColor", v)} />
                    <StackedTextField label="Border Radius" value={props.borderRadius ?? "0px"} onChange={(v) => set("borderRadius", v)} placeholder="e.g. 8px" />
                  </>
                )}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 0, right: 0, bottom: 0, left: 0 }} onChange={(v) => set("advPadding", v)} />
                    <TabSection title="Responsive" />
                    <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                    <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
                    <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />
                  </>
                )}
              </>
            )}
          </BlockTabBar>
        );
      },
    },
  },
  defaultProps: {
    columns: 2, columnsTablet: 2, columnsMobile: 1,
    columnGap: "16px", rowGap: "16px",
    alignItems: "stretch", bgColor: "", borderRadius: "0px",
    advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 0, right: 0, bottom: 0, left: 0 },
    hideDesktop: false, hideTablet: false, hideMobile: false, cssId: "", cssClass: "", zIndex: null,
  },
  render: ({ id: puckId, columns, columnsTablet, columnsMobile, columnGap, rowGap, alignItems, bgColor, borderRadius, advMargin, advPadding, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex }: any) => {
    // Use Puck's stable block id so the CSS selector and DropZone names are
    // unique per instance and never change across re-renders.
    const uid = cssId || `pb-grid-${puckId || "g"}`;
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const cols = Math.max(1, columns || 2);
    return (
      <div
        id={uid}
        className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined}
        style={{
          paddingTop: advPadding?.top ?? 0, paddingRight: advPadding?.right ?? 0,
          paddingBottom: advPadding?.bottom ?? 0, paddingLeft: advPadding?.left ?? 0,
          marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0,
          marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0,
          zIndex: zIndex ?? undefined,
          backgroundColor: bgColor || undefined,
          borderRadius: borderRadius || undefined,
          boxSizing: "border-box",
        }}
      >
        <style>{`
          #${uid} > .puck-grid-inner {
            display: grid;
            grid-template-columns: repeat(${cols}, 1fr);
            gap: ${rowGap || "16px"} ${columnGap || "16px"};
            align-items: ${alignItems || "stretch"};
          }
          @media (max-width: 768px) {
            #${uid} > .puck-grid-inner { grid-template-columns: repeat(${Math.min(cols, columnsTablet || 2)}, 1fr); }
          }
          @media (max-width: 480px) {
            #${uid} > .puck-grid-inner { grid-template-columns: repeat(${Math.min(cols, columnsMobile || 1)}, 1fr); }
          }
        `}</style>
        <div className="puck-grid-inner">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} style={{ minHeight: 60, boxSizing: "border-box" }}>
              {/* Zone name includes uid so each Grid instance has its own slots */}
              <DropZone zone={`grid-${uid}-col-${i}`} />
            </div>
          ))}
        </div>
      </div>
    );
  },
};

// ─── Section Block (Container + Grid combined) ────────────────────────────────
// One drag gives a full-width section wrapper (Container styling) with a
// columned inner grid (Grid layout). All Container and Grid settings unified.

const SectionBlockComponent = {
  label: "Section",
  fields: {
    _tabs: {
      type: "custom",
      label: "",
      render: ({ value: _v, onChange: _onChange }: any) => {
        const { selectedItem, appState, dispatch } = usePuck();
        const props = selectedItem?.props ?? {};
        const set = (key: string, val: any) => {
          if (!selectedItem) return;
          const state = appState.data;
          let destinationZone = "root:default-zone", destinationIndex = 0;
          const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
          for (const [zone, items] of Object.entries(zones)) {
            const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
            if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
          }
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...props, [key]: val } } });
        };

        return (
          <BlockTabBar blockKey="SectionBlock">
            {(tab) => (
              <>
                {/* ── LAYOUT TAB (columns + container sizing) ── */}
                {tab === "content" && (
                  <>
                    <TabSection title="Section" />
                    <InlineSelect
                      label="Content Width"
                      value={props.contentWidth ?? "boxed"}
                      onChange={(v) => set("contentWidth", v)}
                      options={[{ value: "boxed", label: "Boxed" }, { value: "full", label: "Full Width" }]}
                    />
                    {props.contentWidth === "boxed" && (
                      <SliderNumberField label="Max Width" value={props.containerWidth ?? 1140} onChange={(v) => set("containerWidth", v)} min={320} max={1920} step={10} unit="PX" />
                    )}
                    <SliderNumberField label="Min Height" value={props.minHeightPx ?? 0} onChange={(v) => set("minHeightPx", v)} min={0} max={1200} step={10} unit="PX" />

                    <TabSection title="Columns" />
                    <InlineSelect
                      label="Desktop"
                      value={String(props.columns ?? 2)}
                      onChange={(v) => set("columns", Number(v))}
                      options={[{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "6", label: "6" }]}
                    />
                    <InlineSelect
                      label="Tablet"
                      value={String(props.columnsTablet ?? 2)}
                      onChange={(v) => set("columnsTablet", Number(v))}
                      options={[{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }]}
                    />
                    <InlineSelect
                      label="Mobile"
                      value={String(props.columnsMobile ?? 1)}
                      onChange={(v) => set("columnsMobile", Number(v))}
                      options={[{ value: "1", label: "1" }, { value: "2", label: "2" }]}
                    />
                    <SliderNumberField label="Column Gap" value={props.columnGapPx ?? 24} onChange={(v) => set("columnGapPx", v)} min={0} max={120} step={4} unit="PX" />
                    <SliderNumberField label="Row Gap" value={props.rowGapPx ?? 24} onChange={(v) => set("rowGapPx", v)} min={0} max={120} step={4} unit="PX" />
                    <IconButtonGroup
                      label="Align Items"
                      value={props.alignItems ?? "stretch"}
                      onChange={(v) => set("alignItems", v)}
                      options={[
                        { value: "flex-start", title: "Top", icon: ALIGN_ICONS["flex-start"] },
                        { value: "center",     title: "Center", icon: ALIGN_ICONS.center },
                        { value: "flex-end",   title: "Bottom", icon: ALIGN_ICONS["flex-end"] },
                        { value: "stretch",    title: "Stretch", icon: ALIGN_ICONS.stretch },
                      ]}
                    />
                  </>
                )}

                {/* ── STYLE TAB (background, border, shadow, dividers) ── */}
                {tab === "style" && (
                  <>
                    <TabSection title="Background" />
                    <InlineSelect label="Type" value={props.bgType ?? "none"} onChange={(v) => set("bgType", v)} options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }, { value: "gradient", label: "Gradient" }, { value: "image", label: "Image" }, { value: "video", label: "Video" }]} />
                    {props.bgType === "color" && <ColorPickerField label="Color" value={props.bgColor ?? ""} onChange={(v) => set("bgColor", v)} />}
                    {props.bgType === "gradient" && (
                      <>
                        <ColorPickerField label="Start Color" value={props.bgGrad1 ?? ""} onChange={(v) => set("bgGrad1", v)} />
                        <ColorPickerField label="End Color" value={props.bgGrad2 ?? ""} onChange={(v) => set("bgGrad2", v)} />
                        <InlineSelect label="Direction" value={props.bgGradDir ?? "to bottom"} onChange={(v) => set("bgGradDir", v)} options={[{ value: "to bottom", label: "Top → Bottom" }, { value: "to right", label: "Left → Right" }, { value: "to bottom right", label: "Diagonal ↘" }, { value: "to top", label: "Bottom → Top" }]} />
                        <SliderNumberField label="Angle" value={props.bgGradAngle ?? 180} onChange={(v) => set("bgGradAngle", v)} min={0} max={360} step={1} unit="°" />
                      </>
                    )}
                    {props.bgType === "image" && (
                      <>
                        <ImageField label="Image" value={props.bgImage ?? ""} onChange={(v) => set("bgImage", v)} />
                        <InlineSelect label="Size" value={props.bgSize ?? "cover"} onChange={(v) => set("bgSize", v)} options={[{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "auto", label: "Auto" }]} />
                        <InlineSelect label="Position" value={props.bgPos ?? "center center"} onChange={(v) => set("bgPos", v)} options={[{ value: "center center", label: "Center" }, { value: "top center", label: "Top" }, { value: "bottom center", label: "Bottom" }, { value: "center left", label: "Left" }, { value: "center right", label: "Right" }]} />
                        <InlineSelect label="Repeat" value={props.bgRepeat ?? "no-repeat"} onChange={(v) => set("bgRepeat", v)} options={[{ value: "no-repeat", label: "No Repeat" }, { value: "repeat", label: "Repeat" }, { value: "repeat-x", label: "Repeat X" }, { value: "repeat-y", label: "Repeat Y" }]} />
                        <ToggleField label="Fixed (Parallax)" value={!!props.bgFixed} onChange={(v) => set("bgFixed", v)} />
                        <TabSection title="Overlay" />
                        <InlineSelect label="Overlay Type" value={props.overlayType ?? "none"} onChange={(v) => set("overlayType", v)} options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }, { value: "gradient", label: "Gradient" }]} />
                        {props.overlayType === "color" && (
                          <>
                            <ColorPickerField label="Color" value={props.overlayColor ?? "#000000"} onChange={(v) => set("overlayColor", v)} />
                            <SliderNumberField label="Opacity" value={props.overlayOpacity ?? 50} onChange={(v) => set("overlayOpacity", v)} min={0} max={100} step={1} unit="%" />
                          </>
                        )}
                        {props.overlayType === "gradient" && (
                          <>
                            <ColorPickerField label="Gradient Start" value={props.overlayGrad1 ?? "rgba(0,0,0,0.8)"} onChange={(v) => set("overlayGrad1", v)} />
                            <ColorPickerField label="Gradient End" value={props.overlayGrad2 ?? "rgba(0,0,0,0)"} onChange={(v) => set("overlayGrad2", v)} />
                          </>
                        )}
                      </>
                    )}
                    {props.bgType === "video" && (
                      <>
                        <VideoUploadField value={props.bgVideo ?? ""} onChange={(v) => set("bgVideo", v)} />
                        <ToggleField label="Loop" value={props.bgVideoLoop !== false} onChange={(v) => set("bgVideoLoop", v)} />
                        <ToggleField label="Mute" value={props.bgVideoMute !== false} onChange={(v) => set("bgVideoMute", v)} />
                        <ColorPickerField label="Fallback Color" value={props.bgColor ?? "#000"} onChange={(v) => set("bgColor", v)} />
                      </>
                    )}

                    <TabSection title="Border" />
                    <InlineSelect label="Border Type" value={props.borderStyle ?? "none"} onChange={(v) => set("borderStyle", v)} options={[{ value: "none", label: "None" }, { value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }, { value: "dotted", label: "Dotted" }]} />
                    {props.borderStyle !== "none" && (
                      <>
                        <FourSideField label="Border Width (px)" value={props.borderWidth4 ?? { top: 1, right: 1, bottom: 1, left: 1 }} onChange={(v) => set("borderWidth4", v)} />
                        <ColorPickerField label="Border Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
                      </>
                    )}
                    <FourSideField label="Border Radius (px)" value={props.borderRadius4 ?? { top: 0, right: 0, bottom: 0, left: 0 }} onChange={(v) => set("borderRadius4", v)} />


                    <TabSection title="Shape Divider" />
                    <InlineSelect label="Top" value={props.dividerTop ?? "none"} onChange={(v) => set("dividerTop", v)} options={[{ value: "none", label: "None" }, { value: "triangle", label: "Triangle" }, { value: "curve", label: "Curve" }, { value: "wave", label: "Wave" }]} />
                    {props.dividerTop !== "none" && (
                      <>
                        <ColorPickerField label="Top Color" value={props.dividerTopColor ?? "#fff"} onChange={(v) => set("dividerTopColor", v)} />
                        <SliderNumberField label="Top Height" value={props.dividerTopHeight ?? 50} onChange={(v) => set("dividerTopHeight", v)} min={10} max={300} step={5} unit="PX" />
                        <ToggleField label="Flip Horizontal" value={!!props.dividerTopFlip} onChange={(v) => set("dividerTopFlip", v)} />
                      </>
                    )}
                    <InlineSelect label="Bottom" value={props.dividerBottom ?? "none"} onChange={(v) => set("dividerBottom", v)} options={[{ value: "none", label: "None" }, { value: "triangle", label: "Triangle" }, { value: "curve", label: "Curve" }, { value: "wave", label: "Wave" }]} />
                    {props.dividerBottom !== "none" && (
                      <>
                        <ColorPickerField label="Bottom Color" value={props.dividerBottomColor ?? "#fff"} onChange={(v) => set("dividerBottomColor", v)} />
                        <SliderNumberField label="Bottom Height" value={props.dividerBottomHeight ?? 50} onChange={(v) => set("dividerBottomHeight", v)} min={10} max={300} step={5} unit="PX" />
                        <ToggleField label="Flip Horizontal" value={!!props.dividerBottomFlip} onChange={(v) => set("dividerBottomFlip", v)} />
                      </>
                    )}
                  </>
                )}

                {/* ── ADVANCED TAB ── */}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 60, right: 0, bottom: 60, left: 0 }} onChange={(v) => set("advPadding", v)} />
                    <TabSection title="Responsive" />
                    <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                    <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
                    <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />
                    <TabSection title="Motion Effects" />
                    <InlineSelect label="Entrance Animation" value={props.animation ?? "none"} onChange={(v) => set("animation", v)} options={[{ value: "none", label: "None" }, { value: "fadeIn", label: "Fade In" }, { value: "fadeInUp", label: "Fade In Up" }, { value: "fadeInDown", label: "Fade In Down" }, { value: "slideInLeft", label: "Slide In Left" }, { value: "slideInRight", label: "Slide In Right" }, { value: "zoomIn", label: "Zoom In" }]} />
                    {props.animation && props.animation !== "none" && (
                      <>
                        <SliderNumberField label="Duration (ms)" value={props.animDuration ?? 600} onChange={(v) => set("animDuration", v)} min={100} max={3000} step={100} unit="ms" />
                        <SliderNumberField label="Delay (ms)" value={props.animDelay ?? 0} onChange={(v) => set("animDelay", v)} min={0} max={3000} step={100} unit="ms" />
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </BlockTabBar>
        );
      },
    },
  },

  defaultProps: {
    // Section / container
    contentWidth: "boxed", containerWidth: 1140, minHeightPx: 0,
    // Grid
    columns: 2, columnsTablet: 1, columnsMobile: 1,
    columnGapPx: 24, rowGapPx: 24, alignItems: "stretch",
    // Background
    bgType: "none", bgColor: "", bgGrad1: "", bgGrad2: "", bgGradDir: "to bottom", bgGradAngle: 180,
    bgImage: "", bgSize: "cover", bgPos: "center center", bgRepeat: "no-repeat", bgFixed: false,
    overlayType: "none", overlayColor: "#000000", overlayOpacity: 50,
    overlayGrad1: "rgba(0,0,0,0.8)", overlayGrad2: "rgba(0,0,0,0)",
    bgVideo: "", bgVideoLoop: true, bgVideoMute: true,
    // Border
    borderStyle: "none", borderWidth4: { top: 1, right: 1, bottom: 1, left: 1 }, borderColor: "",
    borderRadius4: { top: 0, right: 0, bottom: 0, left: 0 },
    // Shadow
    // Dividers
    dividerTop: "none", dividerTopColor: "#fff", dividerTopHeight: 50, dividerTopFlip: false,
    dividerBottom: "none", dividerBottomColor: "#fff", dividerBottomHeight: 50, dividerBottomFlip: false,
    // Spacing / visibility
    advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 60, right: 0, bottom: 60, left: 0 },
    hideDesktop: false, hideTablet: false, hideMobile: false,
    // Animation
    animation: "none", animDuration: 600, animDelay: 0,
    // Custom
    cssId: "", cssClass: "", customCss: "", zIndex: null,
  },

  render: ({
    id: puckId,
    contentWidth, containerWidth, minHeightPx,
    columns, columnsTablet, columnsMobile, columnGapPx, rowGapPx, alignItems,
    bgType, bgColor, bgGrad1, bgGrad2, bgGradDir, bgGradAngle,
    bgImage, bgSize, bgPos, bgRepeat, bgFixed,
    overlayType, overlayColor, overlayOpacity, overlayGrad1, overlayGrad2,
    bgVideo, bgVideoLoop, bgVideoMute,
    borderStyle, borderWidth4, borderColor, borderRadius4,
    dividerTop, dividerTopColor, dividerTopHeight, dividerTopFlip,
    dividerBottom, dividerBottomColor, dividerBottomHeight, dividerBottomFlip,
    advMargin, advPadding, hideDesktop, hideTablet, hideMobile,
    animation, animDuration, animDelay,
    cssId, cssClass, customCss, zIndex,
  }: any) => {
    const uid = cssId || `pb-section-${puckId || "s"}`;
    const hideClasses = [
      hideDesktop ? "puck-hide-desktop" : "",
      hideTablet  ? "puck-hide-tablet"  : "",
      hideMobile  ? "puck-hide-mobile"  : "",
    ].filter(Boolean).join(" ");

    const cols = columns || 2;
    const br = borderRadius4 ?? { top: 0, right: 0, bottom: 0, left: 0 };
    const bw = borderWidth4  ?? { top: 1, right: 1, bottom: 1, left: 1 };

    // ── outer section wrapper (background / border / shadow) ──
    const outerStyle: React.CSSProperties = {
      position: "relative",
      overflow: "hidden",
      backgroundColor: bgType === "color" ? (bgColor || undefined) : bgType === "video" ? (bgColor || "#000") : undefined,
      background: bgType === "gradient" ? `linear-gradient(${bgGradAngle ?? 180}deg, ${bgGrad1 || "transparent"}, ${bgGrad2 || "transparent"})` : undefined,
      backgroundImage: bgType === "image" && bgImage ? `url("${bgImage}")` : undefined,
      backgroundSize: bgType === "image" ? (bgSize || "cover") : undefined,
      backgroundPosition: bgType === "image" ? (bgPos || "center center") : undefined,
      backgroundRepeat: bgType === "image" ? (bgRepeat || "no-repeat") : undefined,
      backgroundAttachment: bgType === "image" && bgFixed ? "fixed" : undefined,
      borderStyle: borderStyle !== "none" ? borderStyle : undefined,
      borderTopWidth:    borderStyle !== "none" ? (bw.top    ?? 1) : 0,
      borderRightWidth:  borderStyle !== "none" ? (bw.right  ?? 1) : 0,
      borderBottomWidth: borderStyle !== "none" ? (bw.bottom ?? 1) : 0,
      borderLeftWidth:   borderStyle !== "none" ? (bw.left   ?? 1) : 0,
      borderColor: borderStyle !== "none" ? (borderColor || "transparent") : undefined,
      borderTopLeftRadius:     br.top    ?? 0,
      borderTopRightRadius:    br.right  ?? 0,
      borderBottomRightRadius: br.bottom ?? 0,
      borderBottomLeftRadius:  br.left   ?? 0,
      minHeight: (minHeightPx && minHeightPx > 0) ? minHeightPx : undefined,
      paddingTop:    advPadding?.top    ?? 60,
      paddingRight:  advPadding?.right  ?? 0,
      paddingBottom: advPadding?.bottom ?? 60,
      paddingLeft:   advPadding?.left   ?? 0,
      marginTop:    advMargin?.top    ?? 0,
      marginRight:  advMargin?.right  ?? 0,
      marginBottom: advMargin?.bottom ?? 0,
      marginLeft:   advMargin?.left   ?? 0,
      zIndex: zIndex ?? undefined,
      boxSizing: "border-box",
    };

    // ── boxed inner wrapper ──
    const innerWrapStyle: React.CSSProperties = {
      position: "relative", zIndex: 2,
      width: "100%",
      maxWidth: contentWidth === "boxed" ? `${containerWidth || 1140}px` : undefined,
      marginLeft:  contentWidth === "boxed" ? "auto" : undefined,
      marginRight: contentWidth === "boxed" ? "auto" : undefined,
      boxSizing: "border-box",
    };

    // ── shape divider renderer ──
    const renderDivider = (type: string, color: string, height: number, flip: boolean, pos: "top" | "bottom") => {
      const paths: Record<string, string> = {
        triangle: "M0,0 L50,100 L100,0 Z",
        curve:    "M0,100 Q50,0 100,100 Z",
        wave:     "M0,60 C20,100 40,0 60,60 C80,120 100,20 100,60 L100,100 L0,100 Z",
      };
      if (!paths[type]) return null;
      return (
        <div style={{ position: "absolute", [pos]: 0, left: 0, right: 0, zIndex: 3, height: height || 50, overflow: "hidden", transform: flip ? "scaleX(-1)" : undefined }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
            <path d={paths[type]} fill={color || "#fff"} />
          </svg>
        </div>
      );
    };

    // ── animation keyframes ──
    const fromMap: Record<string, string> = {
      fadeIn:      "opacity:0",
      fadeInUp:    "opacity:0;transform:translateY(30px)",
      fadeInDown:  "opacity:0;transform:translateY(-30px)",
      slideInLeft: "opacity:0;transform:translateX(-40px)",
      slideInRight:"opacity:0;transform:translateX(40px)",
      zoomIn:      "opacity:0;transform:scale(0.9)",
    };
    const animCss = (animation && animation !== "none" && fromMap[animation]) ? `
      @keyframes puck-sec-${animation} { from{${fromMap[animation]}} to{opacity:1;transform:none} }
      #${uid}{animation:puck-sec-${animation} ${animDuration ?? 600}ms ease ${animDelay ?? 0}ms both;}
    ` : "";

    return (
      <div
        id={uid}
        className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined}
        style={outerStyle}
      >
        {/* CSS */}
        {(animCss || customCss) && (
          <style>{`
            ${animCss}
            #${uid} .puck-sec-grid { display:grid; grid-template-columns:repeat(${cols},1fr); gap:${rowGapPx ?? 24}px ${columnGapPx ?? 24}px; align-items:${alignItems || "stretch"}; }
            @media(max-width:768px){ #${uid} .puck-sec-grid{ grid-template-columns:repeat(${columnsTablet || 1},1fr); } }
            @media(max-width:480px){ #${uid} .puck-sec-grid{ grid-template-columns:repeat(${columnsMobile || 1},1fr); } }
            ${customCss || ""}
          `}</style>
        )}
        {/* Also inject grid CSS even when no animation / custom CSS */}
        {!(animCss || customCss) && (
          <style>{`
            #${uid} .puck-sec-grid { display:grid; grid-template-columns:repeat(${cols},1fr); gap:${rowGapPx ?? 24}px ${columnGapPx ?? 24}px; align-items:${alignItems || "stretch"}; }
            @media(max-width:768px){ #${uid} .puck-sec-grid{ grid-template-columns:repeat(${columnsTablet || 1},1fr); } }
            @media(max-width:480px){ #${uid} .puck-sec-grid{ grid-template-columns:repeat(${columnsMobile || 1},1fr); } }
          `}</style>
        )}

        {/* Background video */}
        {bgType === "video" && bgVideo && (
          <video autoPlay loop={bgVideoLoop !== false} muted={bgVideoMute !== false} playsInline
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
            src={bgVideo}
          />
        )}

        {/* Overlay */}
        {bgType === "image" && overlayType === "color" && overlayOpacity > 0 && (
          <div style={{ position: "absolute", inset: 0, zIndex: 1, backgroundColor: overlayColor || "#000", opacity: (overlayOpacity || 0) / 100 }} />
        )}
        {bgType === "image" && overlayType === "gradient" && (
          <div style={{ position: "absolute", inset: 0, zIndex: 1, background: `linear-gradient(to bottom, ${overlayGrad1 || "rgba(0,0,0,0.8)"}, ${overlayGrad2 || "rgba(0,0,0,0)"})` }} />
        )}

        {/* Shape dividers */}
        {dividerTop    !== "none" && renderDivider(dividerTop,    dividerTopColor,    dividerTopHeight,    !!dividerTopFlip,    "top")}
        {dividerBottom !== "none" && renderDivider(dividerBottom, dividerBottomColor, dividerBottomHeight, !!dividerBottomFlip, "bottom")}

        {/* Boxed inner → grid columns */}
        <div style={innerWrapStyle}>
          <div className="puck-sec-grid">
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} style={{ minHeight: 60, boxSizing: "border-box" }}>
                <DropZone zone={`section-${uid}-col-${i}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

// ─── Shared section field helpers ────────────────────────────────────────────

function makeSectionSet(dispatch: any, selectedItem: any, appState: any) {
  return (key: string, val: any) => {
    if (!selectedItem) return;
    const state = appState.data;
    let destinationZone = "root:default-zone", destinationIndex = 0;
    const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
    for (const [zone, items] of Object.entries(zones)) {
      const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
      if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
    }
    dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...selectedItem.props, [key]: val } } });
  };
}

// Shared Style tab (Background / Border / Shadow) — same controls used by Section block
function SectionStyleFields({ props, set }: { props: any; set: (k: string, v: any) => void }) {
  return (
    <>
      <TabSection title="Background" />
      <InlineSelect label="Type" value={props.bgType ?? "none"} onChange={(v) => set("bgType", v)}
        options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }, { value: "gradient", label: "Gradient" }, { value: "image", label: "Image" }, { value: "video", label: "Video" }]} />
      {props.bgType === "color" && <ColorPickerField label="Color" value={props.bgColor ?? ""} onChange={(v) => set("bgColor", v)} />}
      {props.bgType === "gradient" && (
        <>
          <ColorPickerField label="Start Color" value={props.bgGrad1 ?? ""} onChange={(v) => set("bgGrad1", v)} />
          <ColorPickerField label="End Color" value={props.bgGrad2 ?? ""} onChange={(v) => set("bgGrad2", v)} />
          <InlineSelect label="Direction" value={props.bgGradDir ?? "to bottom"} onChange={(v) => set("bgGradDir", v)}
            options={[{ value: "to bottom", label: "Top → Bottom" }, { value: "to right", label: "Left → Right" }, { value: "to bottom right", label: "Diagonal ↘" }, { value: "to top", label: "Bottom → Top" }]} />
          <SliderNumberField label="Angle" value={props.bgGradAngle ?? 180} onChange={(v) => set("bgGradAngle", v)} min={0} max={360} step={1} unit="°" />
        </>
      )}
      {props.bgType === "image" && (
        <>
          <ImageField label="Background Image" value={props.bgImage ?? ""} onChange={(v) => set("bgImage", v)} />
          <InlineSelect label="Size" value={props.bgSize ?? "cover"} onChange={(v) => set("bgSize", v)}
            options={[{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "auto", label: "Auto" }]} />
          <InlineSelect label="Position" value={props.bgPos ?? "center center"} onChange={(v) => set("bgPos", v)}
            options={[{ value: "center center", label: "Center" }, { value: "top center", label: "Top" }, { value: "bottom center", label: "Bottom" }]} />
          <ToggleField label="Fixed (Parallax)" value={!!props.bgFixed} onChange={(v) => set("bgFixed", v)} />
          <TabSection title="Overlay" />
          <InlineSelect label="Overlay" value={props.overlayType ?? "none"} onChange={(v) => set("overlayType", v)}
            options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }]} />
          {props.overlayType === "color" && (
            <>
              <ColorPickerField label="Overlay Color" value={props.overlayColor ?? "#000000"} onChange={(v) => set("overlayColor", v)} />
              <SliderNumberField label="Opacity" value={props.overlayOpacity ?? 50} onChange={(v) => set("overlayOpacity", v)} min={0} max={100} step={1} unit="%" />
            </>
          )}
        </>
      )}
      {props.bgType === "video" && (
        <>
          <VideoUploadField value={props.bgVideo ?? ""} onChange={(v) => set("bgVideo", v)} />
          <ToggleField label="Loop" value={props.bgVideoLoop !== false} onChange={(v) => set("bgVideoLoop", v)} />
          <ToggleField label="Mute" value={props.bgVideoMute !== false} onChange={(v) => set("bgVideoMute", v)} />
          <ColorPickerField label="Fallback Color" value={props.bgColor ?? "#000"} onChange={(v) => set("bgColor", v)} />
        </>
      )}
      <TabSection title="Border" />
      <InlineSelect label="Style" value={props.borderStyle ?? "none"} onChange={(v) => set("borderStyle", v)}
        options={[{ value: "none", label: "None" }, { value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }, { value: "dotted", label: "Dotted" }]} />
      {props.borderStyle !== "none" && (
        <>
          <StackedNumberField label="Width (px)" value={props.borderWidth ?? 1} onChange={(v) => set("borderWidth", v)} min={1} max={20} step={1} />
          <ColorPickerField label="Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
          <StackedNumberField label="Radius (px)" value={props.borderRadius ?? 0} onChange={(v) => set("borderRadius", v)} min={0} max={100} step={1} />
        </>
      )}
    </>
  );
}

// Shared Advanced tab (Layout / Spacing / Columns / Responsive / Animation / Custom)
function SectionAdvancedFields({ props, set }: { props: any; set: (k: string, v: any) => void }) {
  return (
    <>
      <TabSection title="Layout" />
      <InlineSelect label="Content Width" value={props.contentWidth ?? "boxed"} onChange={(v) => set("contentWidth", v)}
        options={[{ value: "boxed", label: "Boxed" }, { value: "full", label: "Full Width" }]} />
      {props.contentWidth === "boxed" && <SliderNumberField label="Max Width" value={props.containerWidth ?? 1140} onChange={(v) => set("containerWidth", v)} min={320} max={1920} step={10} unit="PX" />}
      <SliderNumberField label="Min Height" value={props.minHeightPx ?? 0} onChange={(v) => set("minHeightPx", v)} min={0} max={1200} step={10} unit="PX" />
      <TabSection title="Spacing" />
      <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 60, right: 0, bottom: 60, left: 0 }} onChange={(v) => set("advPadding", v)} />
      <FourSideField label="Margin (px)" value={props.advMargin ?? { top: 0, right: 0, bottom: 0, left: 0 }} onChange={(v) => set("advMargin", v)} />
      <TabSection title="Columns" />
      <InlineSelect label="Desktop" value={String(props.columns ?? 1)} onChange={(v) => set("columns", Number(v))}
        options={[{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "6", label: "6" }]} />
      <InlineSelect label="Tablet" value={String(props.columnsTablet ?? 1)} onChange={(v) => set("columnsTablet", Number(v))}
        options={[{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }]} />
      <InlineSelect label="Mobile" value={String(props.columnsMobile ?? 1)} onChange={(v) => set("columnsMobile", Number(v))}
        options={[{ value: "1", label: "1" }, { value: "2", label: "2" }]} />
      <SliderNumberField label="Column Gap" value={props.columnGapPx ?? 32} onChange={(v) => set("columnGapPx", v)} min={0} max={120} step={4} unit="PX" />
      <SliderNumberField label="Row Gap" value={props.rowGapPx ?? 32} onChange={(v) => set("rowGapPx", v)} min={0} max={120} step={4} unit="PX" />
      <TabSection title="Responsive" />
      <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
      <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
      <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />
      <TabSection title="Animation" />
      <InlineSelect label="Entrance" value={props.animation ?? "none"} onChange={(v) => set("animation", v)}
        options={[{ value: "none", label: "None" }, { value: "fadeIn", label: "Fade In" }, { value: "fadeInUp", label: "Fade In Up" }, { value: "fadeInDown", label: "Fade In Down" }, { value: "slideInLeft", label: "Slide In Left" }, { value: "slideInRight", label: "Slide In Right" }, { value: "zoomIn", label: "Zoom In" }]} />
      {props.animation && props.animation !== "none" && (
        <>
          <SliderNumberField label="Duration (ms)" value={props.animDuration ?? 600} onChange={(v) => set("animDuration", v)} min={100} max={3000} step={100} unit="ms" />
          <SliderNumberField label="Delay (ms)" value={props.animDelay ?? 0} onChange={(v) => set("animDelay", v)} min={0} max={3000} step={100} unit="ms" />
        </>
      )}
    </>
  );
}

// Builds the fields object for any section template
function makeSectionFields(blockKey: string, contentRender: (props: any, set: (k: string, v: any) => void) => React.ReactNode) {
  return {
    _tabs: {
      type: "custom" as const,
      label: "",
      render: (_: any) => {
        const { selectedItem, appState, dispatch } = usePuck();
        const props = selectedItem?.props ?? {};
        const set = makeSectionSet(dispatch, selectedItem, appState);
        return (
          <BlockTabBar blockKey={blockKey}>
            {(tab) => (
              <>
                {tab === "content" && (
                  <>{contentRender(props, set)}</>
                )}
                {tab === "style" && (
                  <SectionStyleFields props={props} set={set} />
                )}
                {tab === "advanced" && (
                  <SectionAdvancedFields props={props} set={set} />
                )}
              </>
            )}
          </BlockTabBar>
        );
      },
    },
  };
}

// ─── Section canvas render helpers ───────────────────────────────────────────

// SectionCanvasWrap — renders the outer section shell and passes the stable
// uid down via React context so every SectionDZ inside can derive a unique,
// per-instance zone name.
const SectionUidCtx = createContext<string>("x");

function SectionCanvasWrap({ props, children }: { props: any; children: React.ReactNode }) {
  // Derive a stable uid from the Puck-assigned block id (never Math.random).
  const uid = props.cssId || `st-${(props.id || "x").slice(-8)}`;
  const bg =
    props.bgType === "gradient" && props.bgGrad1 && props.bgGrad2
      ? `linear-gradient(${props.bgGradAngle ?? 180}deg, ${props.bgGrad1}, ${props.bgGrad2})`
      : undefined;
  return (
    <SectionUidCtx.Provider value={uid}>
      <div id={uid} style={{
        position: "relative", overflow: "hidden",
        backgroundColor: props.bgType === "color" ? props.bgColor || undefined : undefined,
        background: bg,
        backgroundImage: props.bgType === "image" && props.bgImage ? `url("${props.bgImage}")` : undefined,
        backgroundSize: "cover", backgroundPosition: "center center",
        minHeight: props.minHeightPx > 0 ? props.minHeightPx : undefined,
        paddingTop: props.advPadding?.top ?? 60, paddingBottom: props.advPadding?.bottom ?? 60,
        paddingLeft: props.advPadding?.left ?? 0, paddingRight: props.advPadding?.right ?? 0,
        marginTop: props.advMargin?.top ?? 0, marginBottom: props.advMargin?.bottom ?? 0,
        boxSizing: "border-box",
      }}>
        {props.bgType === "video" && props.bgVideo && (
          <video autoPlay loop={props.bgVideoLoop !== false} muted={props.bgVideoMute !== false} playsInline
            src={props.bgVideo} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
        )}
        <div style={{ position: "relative", zIndex: 1, maxWidth: props.contentWidth === "boxed" ? `${props.containerWidth || 1140}px` : undefined, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
          {children}
        </div>
      </div>
    </SectionUidCtx.Provider>
  );
}

// SectionDZ — slot is a stable numeric index (0,1,2…) unique within each
// section template render. The zone name combines the block uid + slot so
// every instance on the page has completely independent DropZones.
function SectionDZ({ slot, label, icon, hint, minH = 80 }: { slot: number; label: string; icon?: string; hint?: string; minH?: number }) {
  const uid = useContext(SectionUidCtx);
  const zone = `${uid}-s${slot}`;
  return (
    <div style={{ position: "relative", minHeight: minH }}>
      <div style={{ position: "absolute", inset: 0, border: "2px dashed #d1d5db", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "10px 8px", background: "rgba(248,250,252,0.9)", color: "#9ca3af", pointerEvents: "none", zIndex: 0, boxSizing: "border-box" }}>
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
        <span style={{ fontSize: 11, fontWeight: 700, textAlign: "center", color: "#6b7280" }}>{label}</span>
        {hint && <span style={{ fontSize: 10, textAlign: "center", color: "#9ca3af", lineHeight: 1.3 }}>{hint}</span>}
      </div>
      <div style={{ position: "relative", zIndex: 1, minHeight: minH }}><DropZone zone={zone} /></div>
    </div>
  );
}

function SecGrid({ cols, gap = 32, children }: { cols: number; gap?: number; children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap, alignItems: "stretch" }}>{children}</div>;
}

// ─── Base defaultProps shared by section templates ────────────────────────────

function baseSectionProps(overrides: Record<string, unknown> = {}) {
  return {
    contentWidth: "boxed", containerWidth: 1140, minHeightPx: 0,
    columns: 1, columnsTablet: 1, columnsMobile: 1, columnGapPx: 32, rowGapPx: 32,
    bgType: "none", bgColor: "", bgGrad1: "", bgGrad2: "", bgGradDir: "to bottom", bgGradAngle: 180,
    bgImage: "", bgSize: "cover", bgPos: "center center", bgRepeat: "no-repeat", bgFixed: false,
    overlayType: "none", overlayColor: "#000000", overlayOpacity: 50,
    bgVideo: "", bgVideoLoop: true, bgVideoMute: true,
    borderStyle: "none", borderWidth: 1, borderColor: "", borderRadius: 0,
    advMargin: { top: 0, right: 0, bottom: 0, left: 0 },
    advPadding: { top: 60, right: 0, bottom: 60, left: 0 },
    hideDesktop: false, hideTablet: false, hideMobile: false,
    animation: "none", animDuration: 600, animDelay: 0,
    cssId: "", cssClass: "", zIndex: null,
    ...overrides,
  };
}

// ─── Section Template Components ─────────────────────────────────────────────

export const sectionTemplateConfig: Record<string, any> = {

  // ── Hero ──────────────────────────────────────────────────────────────────
  Section_Hero: {
    label: "Hero",
    fields: makeSectionFields("Section_Hero", (p, set) => (
      <>
        <TabSection title="Content" />
        <StackedTextField label="Badge" value={p.badge ?? ""} onChange={(v) => set("badge", v)} placeholder="e.g. New · Sale · Featured" />
        <StackedTextField label="Headline" value={p.title ?? ""} onChange={(v) => set("title", v)} placeholder="Your Page Headline" />
        <StackedTextField label="Subtext" value={p.subtitle ?? ""} onChange={(v) => set("subtitle", v)} placeholder="Short supporting tagline" />
        <TabSection title="Primary Button" />
        <StackedTextField label="Label" value={p.primaryLabel ?? ""} onChange={(v) => set("primaryLabel", v)} placeholder="Get Started" />
        <StackedTextField label="URL" value={p.primaryUrl ?? ""} onChange={(v) => set("primaryUrl", v)} placeholder="https://…" />
        <TabSection title="Secondary Button" />
        <StackedTextField label="Label" value={p.secondaryLabel ?? ""} onChange={(v) => set("secondaryLabel", v)} placeholder="Learn More (leave blank to hide)" />
        <StackedTextField label="URL" value={p.secondaryUrl ?? ""} onChange={(v) => set("secondaryUrl", v)} placeholder="https://…" />
        <TabSection title="Image" />
        <ImageField label="Hero Image" value={p.imageUrl ?? ""} onChange={(v) => set("imageUrl", v)} />
        <StackedTextField label="Alt Text" value={p.imageAlt ?? ""} onChange={(v) => set("imageAlt", v)} placeholder="Describe the image" />
        <TabSection title="Layout" />
        <InlineSelect label="Layout" value={p.heroLayout ?? "split"} onChange={(v) => set("heroLayout", v)}
          options={[{ value: "split", label: "Text + Image" }, { value: "centered", label: "Centered" }, { value: "image-bg", label: "Image Background" }]} />
        <AlignField label="Text Align" value={p.alignment ?? "text-left"} onChange={(v) => set("alignment", v)} />
        {p.heroLayout === "image-bg" && (
          <SliderNumberField label="Overlay Opacity" value={p.overlayOpacity ?? 40} onChange={(v) => set("overlayOpacity", v)} min={0} max={90} step={5} unit="%" />
        )}
      </>
    )),
    defaultProps: baseSectionProps({
      columns: 1, columnsTablet: 1,
      advPadding: { top: 80, right: 0, bottom: 80, left: 0 },
      badge: "",
      title: "Your Headline Here",
      subtitle: "A short tagline that explains your value proposition",
      primaryLabel: "Get Started",  primaryUrl: "#",
      secondaryLabel: "Learn More", secondaryUrl: "#",
      imageUrl: "", imageAlt: "Hero image",
      alignment: "text-left",
      heroLayout: "split",
      overlayOpacity: 40,
    }),
    render: (p: any) => {
      const layout = p.heroLayout ?? "split";
      const align = (p.alignment ?? "text-left").replace("text-", "") as "left" | "center" | "right";
      const justifyContent = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
      const isCentered = layout === "centered";
      const isBg = layout === "image-bg" && !!p.imageUrl;

      const outerStyle: React.CSSProperties = {
        position: "relative",
        overflow: "hidden",
        padding: `${p.advPadding?.top ?? 80}px ${p.advPadding?.right ?? 0}px ${p.advPadding?.bottom ?? 80}px ${p.advPadding?.left ?? 0}px`,
        backgroundColor: isBg ? "#111827" : (p.bgType === "color" ? p.bgColor || "#ffffff" : "#ffffff"),
        backgroundImage: isBg ? `url("${p.imageUrl}")` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxSizing: "border-box" as const,
        minHeight: p.minHeightPx > 0 ? p.minHeightPx : undefined,
      };

      const overlayStyle: React.CSSProperties = isBg ? {
        position: "absolute", inset: 0,
        backgroundColor: `rgba(0,0,0,${(p.overlayOpacity ?? 40) / 100})`,
        zIndex: 0,
      } : {};

      const textColor = isBg ? "#ffffff" : "#111827";
      const subtitleColor = isBg ? "rgba(255,255,255,0.85)" : "#6b7280";

      const textBlock = (
        <div style={{ position: "relative", zIndex: 1, textAlign: align, maxWidth: isCentered ? 720 : "100%", margin: isCentered ? "0 auto" : undefined }}>
          {p.badge && (
            <span style={{ display: "inline-block", background: "#005bd3", color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 4, marginBottom: 16, letterSpacing: "0.04em" }}>
              {p.badge}
            </span>
          )}
          <h1 style={{ fontSize: "clamp(1.75rem,4vw,3rem)", fontWeight: 800, color: textColor, lineHeight: 1.2, margin: "0 0 16px" }}>
            {p.title || "Your Headline Here"}
          </h1>
          {p.subtitle && (
            <p style={{ fontSize: "1.1rem", color: subtitleColor, lineHeight: 1.6, margin: "0 0 32px", maxWidth: 560, marginLeft: align === "center" ? "auto" : undefined, marginRight: align === "right" || align === "center" ? "auto" : undefined }}>
              {p.subtitle}
            </p>
          )}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent }}>
            {p.primaryLabel && (
              <a href={p.primaryUrl || "#"} style={{ display: "inline-block", background: "#005bd3", color: "#fff", padding: "12px 28px", borderRadius: 6, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
                {p.primaryLabel}
              </a>
            )}
            {p.secondaryLabel && (
              <a href={p.secondaryUrl || "#"} style={{ display: "inline-block", background: "transparent", color: isBg ? "#fff" : "#005bd3", padding: "12px 28px", borderRadius: 6, fontWeight: 600, fontSize: 15, textDecoration: "none", border: `2px solid ${isBg ? "rgba(255,255,255,0.6)" : "#005bd3"}` }}>
                {p.secondaryLabel}
              </a>
            )}
          </div>
        </div>
      );

      const imageBlock = p.imageUrl && !isBg ? (
        <div style={{ position: "relative", zIndex: 1, flex: "0 0 auto" }}>
          <img src={p.imageUrl} alt={p.imageAlt || ""} style={{ width: "100%", maxWidth: 520, borderRadius: 12, objectFit: "cover", display: "block" }} />
        </div>
      ) : null;

      const imagePlaceholder = !p.imageUrl && layout === "split" ? (
        <div style={{ flex: "0 0 auto", width: "100%", maxWidth: 520, minHeight: 300, background: "#f1f5f9", borderRadius: 12, border: "2px dashed #cbd5e1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#94a3b8" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Upload hero image</span>
          <span style={{ fontSize: 11 }}>Set in Content → Hero Image</span>
        </div>
      ) : null;

      if (isBg) {
        return (
          <div style={outerStyle}>
            <div style={overlayStyle} />
            <div style={{ position: "relative", zIndex: 1, maxWidth: 1140, margin: "0 auto", padding: "0 24px", boxSizing: "border-box" }}>
              {textBlock}
            </div>
          </div>
        );
      }

      if (isCentered) {
        return (
          <div style={outerStyle}>
            <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px", boxSizing: "border-box" }}>
              {textBlock}
            </div>
          </div>
        );
      }

      // Split layout
      return (
        <div style={outerStyle}>
          <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px", boxSizing: "border-box", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            {textBlock}
            {imageBlock || imagePlaceholder}
          </div>
        </div>
      );
    },
  },

  // ── About ─────────────────────────────────────────────────────────────────
  Section_About: {
    label: "About",
    fields: makeSectionFields("Section_About", (p, set) => (
      <>
        <TabSection title="Content" />
        <StackedTextField label="Badge" value={p.badge ?? ""} onChange={(v) => set("badge", v)} placeholder="About Us" />
        <StackedTextField label="Heading" value={p.title ?? ""} onChange={(v) => set("title", v)} placeholder="Who We Are" />
        <StackedTextField label="Subheading" value={p.subtitle ?? ""} onChange={(v) => set("subtitle", v)} placeholder="Our story and mission" />
        <StackedTextField label="Description" value={p.description ?? ""} onChange={(v) => set("description", v)} placeholder="A few sentences about your company…" />
        <TabSection title="Image" />
        <ImageField label="Image" value={p.imageUrl ?? ""} onChange={(v) => set("imageUrl", v)} />
        <StackedTextField label="Alt Text" value={p.imageAlt ?? ""} onChange={(v) => set("imageAlt", v)} placeholder="About image" />
        <InlineSelect label="Image Position" value={p.imagePosition ?? "left"} onChange={(v) => set("imagePosition", v)}
          options={[{ value: "left", label: "Image Left" }, { value: "right", label: "Image Right" }]} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 2, columnsTablet: 1, advPadding: { top: 80, right: 0, bottom: 80, left: 0 }, badge: "About Us", title: "Who We Are", subtitle: "Our story and mission", description: "", imageUrl: "", imageAlt: "About image", imagePosition: "left" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SecGrid cols={2} gap={48}>
          {p.imagePosition !== "right"
            ? <>{p.imageUrl ? <img src={p.imageUrl} alt={p.imageAlt || ""} style={{ width: "100%", borderRadius: 8, objectFit: "cover", maxHeight: 400 }} /> : <SectionDZ slot={0} label="About image" icon="🖼" minH={240} hint="Drop Image block" />}<SectionDZ slot={1} label={`${p.badge || "About Us"} — heading, text, stats`} icon="👤" minH={240} hint="Drop Heading, Text, Icon blocks" /></>
            : <><SectionDZ slot={1} label={`${p.badge || "About Us"} — heading, text, stats`} icon="👤" minH={240} hint="Drop Heading, Text, Icon blocks" />{p.imageUrl ? <img src={p.imageUrl} alt={p.imageAlt || ""} style={{ width: "100%", borderRadius: 8, objectFit: "cover", maxHeight: 400 }} /> : <SectionDZ slot={0} label="About image" icon="🖼" minH={240} hint="Drop Image block" />}</>}
        </SecGrid>
      </SectionCanvasWrap>
    ),
  },

  // ── Gallery ───────────────────────────────────────────────────────────────
  Section_Gallery: {
    label: "Gallery",
    fields: makeSectionFields("Section_Gallery", (p, set) => (
      <>
        <TabSection title="Heading" />
        <ToggleField label="Show Heading" value={p.showHeading !== false} onChange={(v) => set("showHeading", v)} />
        {p.showHeading !== false && <><StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Our Gallery" /><StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="A short description" /></>}
        <TabSection title="Grid" />
        <InlineSelect label="Columns" value={String(p.galleryColumns ?? 3)} onChange={(v) => set("galleryColumns", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }]} />
        <StackedNumberField label="Gap (px)" value={p.gap ?? 12} onChange={(v) => set("gap", v)} min={0} max={60} step={2} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 2, advPadding: { top: 60, right: 0, bottom: 60, left: 0 }, sectionTitle: "Our Gallery", sectionSubtitle: "", galleryColumns: 3, gap: 12, showHeading: true }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        {p.showHeading !== false && <SectionDZ slot={0} label={p.sectionTitle || "Gallery heading"} icon="H" minH={60} hint="Drop Heading block" />}
        <div style={{ marginTop: 20 }}>
          <SecGrid cols={3} gap={p.gap ?? 12}><SectionDZ slot={1} label="Image 1" icon="🖼" minH={130} /><SectionDZ slot={2} label="Image 2" icon="🖼" minH={130} /><SectionDZ slot={3} label="Image 3" icon="🖼" minH={130} /></SecGrid>
        </div>
        <div style={{ marginTop: p.gap ?? 12 }}>
          <SecGrid cols={4} gap={p.gap ?? 12}><SectionDZ slot={4} label="Image 4" icon="🖼" minH={90} /><SectionDZ slot={5} label="Image 5" icon="🖼" minH={90} /><SectionDZ slot={6} label="Image 6" icon="🖼" minH={90} /><SectionDZ slot={7} label="Image 7" icon="🖼" minH={90} /></SecGrid>
        </div>
      </SectionCanvasWrap>
    ),
  },

  // ── Testimonial ───────────────────────────────────────────────────────────
  Section_Testimonial: {
    label: "Testimonial",
    fields: makeSectionFields("Section_Testimonial", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="What Our Customers Say" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="Real reviews from real customers" />
        <TabSection title="Layout" />
        <InlineSelect label="Columns" value={String(p.reviewCount ?? 3)} onChange={(v) => set("reviewCount", Number(v))} options={[{ value: "1", label: "1 (Single)" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 1, bgType: "color", bgColor: "#f8fafc", advPadding: { top: 60, right: 0, bottom: 60, left: 0 }, sectionTitle: "What Our Customers Say", sectionSubtitle: "", reviewCount: 3 }),
    render: (p: any) => {
      const cols = Math.min(p.reviewCount ?? 3, 4);
      return (
        <SectionCanvasWrap props={p}>
          <SectionDZ slot={0} label={p.sectionTitle || "Testimonials heading"} icon="H" minH={60} hint="Drop Heading block" />
          <div style={{ marginTop: 24 }}>
            <SecGrid cols={cols} gap={24}>{Array.from({ length: cols }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={`Review ${i + 1} — quote, author, star rating`} icon="💬" minH={120} hint="Drop BlockQuote + StarRating" />)}</SecGrid>
          </div>
        </SectionCanvasWrap>
      );
    },
  },

  // ── Carousel ──────────────────────────────────────────────────────────────
  Section_Carousel: {
    label: "Carousel",
    fields: makeSectionFields("Section_Carousel", (p, set) => (
      <>
        <TabSection title="Marquee Bar" />
        <ToggleField label="Show Marquee Bar" value={p.showMarquee !== false} onChange={(v) => set("showMarquee", v)} />
        {p.showMarquee !== false && <><StackedTextField label="Text" value={p.marqueeText ?? ""} onChange={(v) => set("marqueeText", v)} placeholder="Announcement · " /><ColorPickerField label="Background" value={p.marqueeBg ?? "#1a1a1a"} onChange={(v) => set("marqueeBg", v)} /><ColorPickerField label="Text Color" value={p.marqueeColor ?? "#ffffff"} onChange={(v) => set("marqueeColor", v)} /></>}
        <TabSection title="Carousel" />
        <StackedTextField label="Section Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Featured" />
        <InlineSelect label="Cards Per Row" value={String(p.cardCount ?? 3)} onChange={(v) => set("cardCount", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 2, advPadding: { top: 60, right: 0, bottom: 60, left: 0 }, sectionTitle: "Featured", showMarquee: true, marqueeText: "Free shipping · New arrivals · Special offers · ", marqueeBg: "#1a1a1a", marqueeColor: "#ffffff", cardCount: 3 }),
    render: (p: any) => {
      const cols = p.cardCount ?? 3;
      return (
        <div>
          {p.showMarquee !== false && <div style={{ background: p.marqueeBg || "#1a1a1a", padding: "10px 0", overflow: "hidden" }}><div style={{ display: "flex", gap: 40, color: p.marqueeColor || "#fff", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", padding: "0 24px" }}>{Array.from({ length: 3 }).map((_, i) => <span key={i}>{p.marqueeText || "Announcement · "}</span>)}</div></div>}
          <SectionCanvasWrap props={p}>
            <SectionDZ slot={0} label={p.sectionTitle || "Section heading"} icon="H" minH={60} hint="Drop Heading block" />
            <div style={{ marginTop: 20 }}><SecGrid cols={cols} gap={20}>{Array.from({ length: cols }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={`Card ${i + 1}`} icon="🃏" minH={160} hint="Drop Image, Text, Button blocks" />)}</SecGrid></div>
          </SectionCanvasWrap>
        </div>
      );
    },
  },

  // ── Contact Form ─────────────────────────────────────────────────────────
  Section_Form: {
    label: "Contact Form",
    fields: makeSectionFields("Section_Form", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Get In Touch" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="We'd love to hear from you" />
        <TabSection title="Contact Info" />
        <StackedTextField label="Address" value={p.address ?? ""} onChange={(v) => set("address", v)} placeholder="123 Main St, City" />
        <StackedTextField label="Phone" value={p.phone ?? ""} onChange={(v) => set("phone", v)} placeholder="+1 (555) 000-0000" />
        <StackedTextField label="Email" value={p.email ?? ""} onChange={(v) => set("email", v)} placeholder="hello@company.com" />
        <TabSection title="Form" />
        <StackedTextField label="Submit Button" value={p.submitLabel ?? ""} onChange={(v) => set("submitLabel", v)} placeholder="Send Message" />
        <StackedTextField label="Success Message" value={p.successMessage ?? ""} onChange={(v) => set("successMessage", v)} placeholder="Thanks! We'll be in touch." />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 2, columnsTablet: 1, advPadding: { top: 80, right: 0, bottom: 80, left: 0 }, sectionTitle: "Get In Touch", sectionSubtitle: "", address: "", phone: "", email: "", submitLabel: "Send Message", successMessage: "Thanks! We'll be in touch shortly." }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "Contact heading"} icon="H" minH={60} hint="Drop Heading block" />
        <div style={{ marginTop: 28 }}>
          <SecGrid cols={2} gap={48}>
            <SectionDZ slot={1} label={`Contact info — ${p.address || "address"}, ${p.phone || "phone"}, ${p.email || "email"}`} icon="📍" minH={180} hint="Drop Text, Icon, SocialIcons blocks" />
            <SectionDZ slot={2} label={`Form → "${p.submitLabel || "Send Message"}"`} icon="📋" minH={180} hint="Drop Button block" />
          </SecGrid>
        </div>
      </SectionCanvasWrap>
    ),
  },

  // ── Countdown ─────────────────────────────────────────────────────────────
  Section_Countdown: {
    label: "Countdown",
    fields: makeSectionFields("Section_Countdown", (p, set) => (
      <>
        <TabSection title="Headline" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Sale Ends In" />
        <StackedTextField label="Subtext" value={p.subtext ?? ""} onChange={(v) => set("subtext", v)} placeholder="Don't miss our biggest sale" />
        <TabSection title="CTA Button" />
        <StackedTextField label="Label" value={p.ctaLabel ?? ""} onChange={(v) => set("ctaLabel", v)} placeholder="Shop Now" />
        <StackedTextField label="URL" value={p.ctaUrl ?? ""} onChange={(v) => set("ctaUrl", v)} placeholder="#" />
        <TabSection title="Progress Bar" />
        <ToggleField label="Show Progress Bar" value={p.showProgress !== false} onChange={(v) => set("showProgress", v)} />
        {p.showProgress !== false && <>
          <StackedTextField label="Label" value={p.progressLabel ?? ""} onChange={(v) => set("progressLabel", v)} placeholder="73% sold — only 27 left" />
          <SliderNumberField label="Value (%)" value={p.progressValue ?? 73} onChange={(v) => set("progressValue", v)} min={0} max={100} step={1} unit="%" />
          <ColorPickerField label="Bar Color" value={p.progressColor ?? "#ef4444"} onChange={(v) => set("progressColor", v)} />
        </>}
      </>
    )),
    defaultProps: baseSectionProps({ columns: 1, bgType: "color", bgColor: "#0f172a", advPadding: { top: 80, right: 0, bottom: 80, left: 0 }, sectionTitle: "Sale Ends In", subtext: "Don't miss our biggest sale of the year", ctaLabel: "Shop Now", ctaUrl: "#", showProgress: true, progressLabel: "73% sold — only 27 left", progressValue: 73, progressColor: "#ef4444" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 20 }}>
          <SectionDZ slot={0} label={`${p.sectionTitle || "Countdown headline"} — ${p.subtext || "subtext"}`} icon="⏱" minH={70} hint="Drop Heading & Text blocks" />
          <SecGrid cols={4} gap={12}><SectionDZ slot={1} label="Days" icon="📅" minH={80} hint="Number + label" /><SectionDZ slot={2} label="Hours" icon="🕐" minH={80} hint="Number + label" /><SectionDZ slot={3} label="Minutes" icon="⏰" minH={80} hint="Number + label" /><SectionDZ slot={4} label="Seconds" icon="⚡" minH={80} hint="Number + label" /></SecGrid>
          <SectionDZ slot={5} label={`"${p.ctaLabel || "Shop Now"}" button`} icon="⚡" minH={50} hint="Drop Button block" />
          {p.showProgress !== false && <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "12px 16px" }}><div style={{ fontSize: 12, color: "#cbd5e1", marginBottom: 6 }}>{p.progressLabel || "73% sold"}</div><div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 999, height: 8, overflow: "hidden" }}><div style={{ height: "100%", width: `${p.progressValue ?? 73}%`, background: p.progressColor || "#ef4444", borderRadius: 999 }} /></div></div>}
        </div>
      </SectionCanvasWrap>
    ),
  },

  // ── Media Carousel ────────────────────────────────────────────────────────
  Section_MediaCarousel: {
    label: "Media Carousel",
    fields: makeSectionFields("Section_MediaCarousel", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Featured Media" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="Short description" />
        <TabSection title="Carousel" />
        <StackedNumberField label="Thumbnail Count" value={p.thumbnailCount ?? 4} onChange={(v) => set("thumbnailCount", v)} min={2} max={8} step={1} />
        <ToggleField label="Autoplay" value={!!p.autoplay} onChange={(v) => set("autoplay", v)} />
        {p.autoplay && <SliderNumberField label="Interval (ms)" value={p.interval ?? 4000} onChange={(v) => set("interval", v)} min={1000} max={10000} step={500} unit="ms" />}
        <ToggleField label="Show Arrows" value={p.showArrows !== false} onChange={(v) => set("showArrows", v)} />
        <ToggleField label="Show Dots" value={p.showDots !== false} onChange={(v) => set("showDots", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 1, advPadding: { top: 60, right: 0, bottom: 60, left: 0 }, sectionTitle: "Featured Media", sectionSubtitle: "", thumbnailCount: 4, autoplay: false, interval: 4000, showArrows: true, showDots: true }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "Media carousel heading"} icon="H" minH={60} hint="Drop Heading block" />
        <div style={{ marginTop: 20 }}><SectionDZ slot={1} label="Main media — drop Image or Video block (YouTube/Vimeo/upload)" icon="🎞" minH={300} hint="Supports Image block and Video block" /></div>
        <div style={{ marginTop: 12 }}><SecGrid cols={p.thumbnailCount ?? 4} gap={8}>{Array.from({ length: p.thumbnailCount ?? 4 }).map((_, i) => <SectionDZ key={i} slot={i + 2} label={`Thumbnail ${i + 1}`} icon="🖼" minH={60} />)}</SecGrid></div>
      </SectionCanvasWrap>
    ),
  },

  // ── Services ──────────────────────────────────────────────────────────────
  Section_Services: {
    label: "Services",
    fields: makeSectionFields("Section_Services", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Our Services" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="What we offer" />
        <TabSection title="Grid" />
        <InlineSelect label="Per Row" value={String(p.serviceCount ?? 3)} onChange={(v) => set("serviceCount", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
        <ColorPickerField label="Accent Color" value={p.accentColor ?? "#005bd3"} onChange={(v) => set("accentColor", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 1, advPadding: { top: 70, right: 0, bottom: 70, left: 0 }, sectionTitle: "Our Services", sectionSubtitle: "", serviceCount: 3, accentColor: "#005bd3" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "Services heading"} icon="H" minH={60} hint="Drop Heading block" />
        <div style={{ marginTop: 28 }}><SecGrid cols={p.serviceCount ?? 3} gap={28}>{Array.from({ length: p.serviceCount ?? 3 }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={`Service ${i + 1} — icon, title, description`} icon="🔧" minH={140} hint="Drop Icon + Heading + Text" />)}</SecGrid></div>
      </SectionCanvasWrap>
    ),
  },

  // ── Pricing ───────────────────────────────────────────────────────────────
  Section_Pricing: {
    label: "Pricing",
    fields: makeSectionFields("Section_Pricing", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Simple, Transparent Pricing" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="No hidden fees" />
        <TabSection title="Tiers" />
        <InlineSelect label="Number of Tiers" value={String(p.tierCount ?? 3)} onChange={(v) => set("tierCount", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
        <StackedTextField label="Currency" value={p.currency ?? "$"} onChange={(v) => set("currency", v)} placeholder="$" />
        <ColorPickerField label="Accent Color" value={p.accentColor ?? "#005bd3"} onChange={(v) => set("accentColor", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 1, advPadding: { top: 80, right: 0, bottom: 80, left: 0 }, sectionTitle: "Simple, Transparent Pricing", sectionSubtitle: "", tierCount: 3, currency: "$", accentColor: "#005bd3" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "Pricing heading"} icon="H" minH={60} hint="Drop Heading block" />
        <div style={{ marginTop: 28 }}><SecGrid cols={p.tierCount ?? 3} gap={24}>{Array.from({ length: p.tierCount ?? 3 }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={i === 1 ? "Tier 2 — recommended / featured" : `Tier ${i + 1} — name, price, features, CTA`} icon={i === 1 ? "⭐" : "💳"} minH={200} hint="Drop Heading + Text + Button blocks" />)}</SecGrid></div>
      </SectionCanvasWrap>
    ),
  },

  // ── CTA ───────────────────────────────────────────────────────────────────
  Section_CTA: {
    label: "CTA",
    fields: makeSectionFields("Section_CTA", (p, set) => (
      <>
        <TabSection title="Content" />
        <StackedTextField label="Headline" value={p.headline ?? ""} onChange={(v) => set("headline", v)} placeholder="Ready to Get Started?" />
        <StackedTextField label="Subtext" value={p.subtext ?? ""} onChange={(v) => set("subtext", v)} placeholder="Supporting line" />
        <TabSection title="Primary Button" />
        <StackedTextField label="Label" value={p.primaryLabel ?? ""} onChange={(v) => set("primaryLabel", v)} placeholder="Start Free Trial" />
        <StackedTextField label="URL" value={p.primaryUrl ?? ""} onChange={(v) => set("primaryUrl", v)} placeholder="https://…" />
        <TabSection title="Secondary Button" />
        <StackedTextField label="Label" value={p.secondaryLabel ?? ""} onChange={(v) => set("secondaryLabel", v)} placeholder="Learn More" />
        <StackedTextField label="URL" value={p.secondaryUrl ?? ""} onChange={(v) => set("secondaryUrl", v)} placeholder="https://…" />
        <TabSection title="Layout" />
        <AlignField label="Alignment" value={p.alignment ?? "text-center"} onChange={(v) => set("alignment", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 1, bgType: "color", bgColor: "#005bd3", advPadding: { top: 80, right: 0, bottom: 80, left: 0 }, headline: "Ready to Get Started?", subtext: "Join thousands of happy customers today.", primaryLabel: "Start Free Trial", primaryUrl: "#", secondaryLabel: "Learn More", secondaryUrl: "#", alignment: "text-center" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <div style={{ textAlign: p.alignment?.replace("text-", "") as any || "center", display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionDZ slot={0} label={`"${p.headline || "CTA Headline"}" — heading & subtext`} icon="⚡" minH={80} hint="Drop Heading & Text blocks" />
          <SectionDZ slot={1} label={`Buttons — "${p.primaryLabel || "Primary"}" & "${p.secondaryLabel || "Secondary"}"`} icon="⊡" minH={50} hint="Drop Button blocks" />
        </div>
      </SectionCanvasWrap>
    ),
  },

  // ── FAQ ───────────────────────────────────────────────────────────────────
  Section_FAQ: {
    label: "FAQ",
    fields: makeSectionFields("Section_FAQ", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Frequently Asked Questions" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="Everything you need to know" />
        <TabSection title="Items" />
        <StackedNumberField label="FAQ Slots" value={p.faqCount ?? 4} onChange={(v) => set("faqCount", v)} min={1} max={12} step={1} />
        <ColorPickerField label="Accent Color" value={p.accentColor ?? "#005bd3"} onChange={(v) => set("accentColor", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 1, advPadding: { top: 70, right: 0, bottom: 70, left: 0 }, sectionTitle: "Frequently Asked Questions", sectionSubtitle: "", faqCount: 4, accentColor: "#005bd3" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "FAQ heading"} icon="H" minH={60} hint="Drop Heading block" />
        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 8 }}>{Array.from({ length: p.faqCount ?? 4 }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={`FAQ ${i + 1} — question & answer`} icon="❓" minH={52} hint="Drop Accordion block" />)}</div>
      </SectionCanvasWrap>
    ),
  },

  // ── Team ──────────────────────────────────────────────────────────────────
  Section_Team: {
    label: "Team",
    fields: makeSectionFields("Section_Team", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Meet Our Team" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="The people behind the product" />
        <TabSection title="Grid" />
        <InlineSelect label="Members Per Row" value={String(p.memberCount ?? 4)} onChange={(v) => set("memberCount", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 4, columnsTablet: 2, advPadding: { top: 70, right: 0, bottom: 70, left: 0 }, sectionTitle: "Meet Our Team", sectionSubtitle: "", memberCount: 4 }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "Team heading"} icon="H" minH={60} hint="Drop Heading block" />
        <div style={{ marginTop: 28 }}><SecGrid cols={p.memberCount ?? 4} gap={24}>{Array.from({ length: p.memberCount ?? 4 }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={`Member ${i + 1} — photo, name, role, bio`} icon="👤" minH={160} hint="Drop Image + Heading + Text" />)}</SecGrid></div>
      </SectionCanvasWrap>
    ),
  },

  // ── Logo Row ──────────────────────────────────────────────────────────────
  Section_Logos: {
    label: "Logo Row",
    fields: makeSectionFields("Section_Logos", (p, set) => (
      <>
        <TabSection title="Label" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Trusted By" />
        <TabSection title="Logos" />
        <StackedNumberField label="Logo Count" value={p.logoCount ?? 6} onChange={(v) => set("logoCount", v)} min={2} max={12} step={1} />
        <ToggleField label="Grayscale" value={p.grayscale !== false} onChange={(v) => set("grayscale", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 6, columnsTablet: 3, bgType: "color", bgColor: "#f8fafc", advPadding: { top: 40, right: 0, bottom: 40, left: 0 }, sectionTitle: "Trusted By", logoCount: 6, grayscale: true }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "'Trusted by' label"} icon="🏷" minH={40} hint="Drop Heading block (small)" />
        <div style={{ marginTop: 16 }}><SecGrid cols={Math.min(p.logoCount ?? 6, 6)} gap={16}>{Array.from({ length: p.logoCount ?? 6 }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={`Logo ${i + 1}`} icon="🏷" minH={50} hint="Drop Image block" />)}</SecGrid></div>
      </SectionCanvasWrap>
    ),
  },

  // ── Features ──────────────────────────────────────────────────────────────
  Section_Features: {
    label: "Features",
    fields: makeSectionFields("Section_Features", (p, set) => (
      <>
        <TabSection title="Heading" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Why Choose Us" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="What makes us different" />
        <TabSection title="Grid" />
        <InlineSelect label="Per Row" value={String(p.featureCount ?? 3)} onChange={(v) => set("featureCount", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
        <ColorPickerField label="Accent Color" value={p.accentColor ?? "#005bd3"} onChange={(v) => set("accentColor", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 3, columnsTablet: 1, bgType: "color", bgColor: "#f8fafc", advPadding: { top: 70, right: 0, bottom: 70, left: 0 }, sectionTitle: "Why Choose Us", sectionSubtitle: "", featureCount: 3, accentColor: "#005bd3" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <SectionDZ slot={0} label={p.sectionTitle || "Features heading"} icon="H" minH={60} hint="Drop Heading block" />
        <div style={{ marginTop: 28 }}><SecGrid cols={p.featureCount ?? 3} gap={32}>{Array.from({ length: p.featureCount ?? 3 }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={`Feature ${i + 1} — icon, title, description`} icon="✅" minH={130} hint="Drop Icon + Heading + Text" />)}</SecGrid></div>
      </SectionCanvasWrap>
    ),
  },

  // ── Newsletter ────────────────────────────────────────────────────────────
  Section_Newsletter: {
    label: "Newsletter",
    fields: makeSectionFields("Section_Newsletter", (p, set) => (
      <>
        <TabSection title="Content" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Stay in the Loop" />
        <StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="Get the latest updates" />
        <TabSection title="Form" />
        <StackedTextField label="Input Placeholder" value={p.placeholder ?? ""} onChange={(v) => set("placeholder", v)} placeholder="Enter your email address" />
        <StackedTextField label="Button Label" value={p.buttonLabel ?? ""} onChange={(v) => set("buttonLabel", v)} placeholder="Subscribe" />
        <StackedTextField label="Disclaimer" value={p.disclaimer ?? ""} onChange={(v) => set("disclaimer", v)} placeholder="No spam. Unsubscribe anytime." />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 1, bgType: "color", bgColor: "#eff6ff", advPadding: { top: 60, right: 0, bottom: 60, left: 0 }, sectionTitle: "Stay in the Loop", sectionSubtitle: "Get the latest updates delivered to your inbox.", placeholder: "Enter your email address", buttonLabel: "Subscribe", disclaimer: "" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", gap: 12 }}>
          <SectionDZ slot={0} label={p.sectionTitle || "Newsletter heading"} icon="✉" minH={70} hint="Drop Heading block" />
          <SectionDZ slot={1} label={`Email input: "${p.placeholder || "Enter email"}" + "${p.buttonLabel || "Subscribe"}" button`} icon="⊡" minH={50} hint="Drop Button block" />
          {p.disclaimer && <div style={{ fontSize: 11, color: "#6b7280" }}>{p.disclaimer}</div>}
        </div>
      </SectionCanvasWrap>
    ),
  },

  // ── Video Section ─────────────────────────────────────────────────────────
  Section_Video: {
    label: "Video Section",
    fields: makeSectionFields("Section_Video", (p, set) => (
      <>
        <TabSection title="Heading" />
        <ToggleField label="Show Heading" value={p.showHeading !== false} onChange={(v) => set("showHeading", v)} />
        {p.showHeading !== false && <><StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="See It In Action" /><StackedTextField label="Subtitle" value={p.sectionSubtitle ?? ""} onChange={(v) => set("sectionSubtitle", v)} placeholder="Short intro" /></>}
        <TabSection title="Video" />
        <InlineSelect label="Source" value={p.sourceType ?? "youtube"} onChange={(v) => set("sourceType", v)} options={[{ value: "youtube", label: "YouTube" }, { value: "vimeo", label: "Vimeo" }, { value: "upload", label: "Upload / Self-hosted" }]} />
        <StackedTextField label="Video URL" value={p.videoUrl ?? ""} onChange={(v) => set("videoUrl", v)} placeholder="https://youtube.com/watch?v=…" />
        <ImageField label="Thumbnail" value={p.thumbnailUrl ?? ""} onChange={(v) => set("thumbnailUrl", v)} />
        <ToggleField label="Autoplay" value={!!p.autoplay} onChange={(v) => set("autoplay", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 1, advPadding: { top: 60, right: 0, bottom: 60, left: 0 }, sectionTitle: "See It In Action", sectionSubtitle: "", videoUrl: "", sourceType: "youtube", thumbnailUrl: "", autoplay: false, showHeading: true }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        {p.showHeading !== false && <SectionDZ slot={0} label={p.sectionTitle || "Video section heading"} icon="H" minH={60} hint="Drop Heading block" />}
        <div style={{ marginTop: 20 }}>
          {p.videoUrl
            ? <div style={{ aspectRatio: "16/9", background: "#000", borderRadius: 8, overflow: "hidden" }}><iframe src={`https://www.youtube.com/embed/${p.videoUrl.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1] ?? ""}`} style={{ width: "100%", height: "100%", border: "none" }} allowFullScreen /></div>
            : <SectionDZ slot={1} label={`Video block — paste ${p.sourceType || "YouTube"} URL or upload`} icon="🎬" minH={300} hint="Drop Video block" />}
        </div>
      </SectionCanvasWrap>
    ),
  },

  // ── Stats ─────────────────────────────────────────────────────────────────
  Section_Stats: {
    label: "Stats",
    fields: makeSectionFields("Section_Stats", (p, set) => (
      <>
        <TabSection title="Heading (optional)" />
        <StackedTextField label="Title" value={p.sectionTitle ?? ""} onChange={(v) => set("sectionTitle", v)} placeholder="Leave blank to hide" />
        <TabSection title="Stats Grid" />
        <InlineSelect label="Count" value={String(p.statCount ?? 4)} onChange={(v) => set("statCount", Number(v))} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "6", label: "6" }]} />
        <ToggleField label="Show Dividers" value={p.showDividers !== false} onChange={(v) => set("showDividers", v)} />
        <ColorPickerField label="Accent Color" value={p.accentColor ?? "#005bd3"} onChange={(v) => set("accentColor", v)} />
      </>
    )),
    defaultProps: baseSectionProps({ columns: 4, columnsTablet: 2, advPadding: { top: 60, right: 0, bottom: 60, left: 0 }, sectionTitle: "", statCount: 4, showDividers: true, accentColor: "#005bd3" }),
    render: (p: any) => (
      <SectionCanvasWrap props={p}>
        {p.sectionTitle && <SectionDZ slot={0} label={p.sectionTitle} icon="H" minH={50} hint="Drop Heading block" />}
        <div style={{ marginTop: p.sectionTitle ? 24 : 0, borderTop: p.showDividers !== false ? "1px solid #e5e7eb" : undefined, borderBottom: p.showDividers !== false ? "1px solid #e5e7eb" : undefined, padding: "24px 0" }}>
          <SecGrid cols={p.statCount ?? 4} gap={24}>{Array.from({ length: p.statCount ?? 4 }).map((_, i) => <SectionDZ key={i} slot={i + 1} label={`Stat ${i + 1} — number + label`} icon="#" minH={90} hint="Drop Heading + Text blocks" />)}</SecGrid>
        </div>
      </SectionCanvasWrap>
    ),
  },

};

export const config: Config<Props, RootProps> = {
  root: {
    fields: {},
    render: ({
      children,

      theme,

      containerWidth,

      headerData,

      footerData,

      isGlobalEditor,
    }) => {
      const [hoverHeader, setHoverHeader] = useState(false);

      const [hoverFooter, setHoverFooter] = useState(false);

      const notifyParent = (zone: "header" | "footer") => {
        try {
          window.dispatchEvent(
            new CustomEvent("puck:global-select", { detail: { zone } }),
          );
        } catch {
          // ignore in SSR/static preview
        }
      };

      return (
        <div
          className="page-preview min-h-screen flex flex-col"
          data-theme={theme || "light"}
          style={{
            fontFamily: "var(--font-family)",

            backgroundColor: "var(--background-color)",

            color: "var(--text-color)",

            containerType: "inline-size",
          }}
        >
          {/* ── Above Header Zone ───────────────────────────────────────────── */}

          {!isGlobalEditor && <ConditionalZone zone="above-header" />}

          {/* ── Global Header ───────────────────────────────────────────────── */}

          {!isGlobalEditor && headerData?.content?.length > 0 && (
            <div style={{ position: "relative" }}>
              <Render config={previewConfig} data={headerData} />

              {/* Always-present overlay — sits on top, owns all hover/click */}
              <div
                className="pb-global-overlay"
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 200,
                  cursor: "pointer",
                  boxSizing: "border-box",
                  background: hoverHeader ? "rgba(1,88,173,0.12)" : "transparent",
                  border: hoverHeader ? "2px dashed #0158ad" : "2px solid transparent",
                  transition: "background 0.15s, border-color 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={() => setHoverHeader(true)}
                onMouseLeave={() => setHoverHeader(false)}
                onClick={() => notifyParent("header")}
              >
              </div>
            </div>
          )}

          {/* Main Content */}

          <main className="flex-1 w-full">
            <div
              style={{ maxWidth: "var(--container-width)", margin: "0 auto" }}
            >
              {children}
            </div>
          </main>

          {/* ── Global Footer ───────────────────────────────────────────────── */}

          {!isGlobalEditor && footerData?.content?.length > 0 && (
            <div style={{ position: "relative" }}>
              <Render config={previewConfig} data={footerData} />

              {/* Always-present overlay — owns all hover/click */}
              <div
                className="pb-global-overlay"
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 200,
                  cursor: "pointer",
                  boxSizing: "border-box",
                  background: hoverFooter ? "rgba(15,118,110,0.12)" : "transparent",
                  border: hoverFooter ? "2px dashed #0f766e" : "2px solid transparent",
                  transition: "background 0.15s, border-color 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={() => setHoverFooter(true)}
                onMouseLeave={() => setHoverFooter(false)}
                onClick={() => notifyParent("footer")}
              >
              </div>
            </div>
          )}

          {/* ── Below Footer Zone ───────────────────────────────────────────── */}

          {!isGlobalEditor && <ConditionalZone zone="below-footer" />}
        </div>
      );
    },
  },

  components: {
    ...commonComponents,

    Image: ImageComponent,

    Space: SpaceComponent,

    Button: ButtonComponent,

    Divider: DividerComponent,

    Video: VideoComponent,

    Icons: IconsComponent,

    BlockQuote: BlockQuoteComponent,

    StarRating: StarRatingComponent,

    ProgressBar: ProgressBarComponent,

    Alert: AlertComponent,

    SocialIcons: SocialIconsComponent,

    ShareButtons: ShareButtonsComponent,

    LayoutBlock: LayoutBlockComponent,

    GridBlock: GridBlockComponent,

    Section: SectionBlockComponent,

    // Section template components — appear under "Sections" category in the drawer
    ...sectionTemplateConfig,
  },
};

// Patch layout/section blocks into previewConfig for preview/SSR rendering
(previewConfig.components as any).LayoutBlock = LayoutBlockComponent;
(previewConfig.components as any).GridBlock = GridBlockComponent;
(previewConfig.components as any).Section = SectionBlockComponent;
Object.entries(sectionTemplateConfig).forEach(([k, v]) => {
  (previewConfig.components as any)[k] = v;
});