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
import { loadGoogleFont } from "@/puck-splat/utils";

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
  const allEqual = t === r && r === b && b === l;
  const [linked, setLinked] = useState(allEqual);

  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  const setAll = (n: number) => { const c = clamp(n); onChange({ top: c, right: c, bottom: c, left: c }); };
  const setSide = (side: "top" | "right" | "bottom" | "left", n: number) =>
    onChange({ top: t, right: r, bottom: b, left: l, [side]: clamp(n) });

  const numBox = (val: number, onCh: (n: number) => void) => (
    <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--p-color-border)", borderRadius: 6, background: "var(--p-color-bg-surface)", height: 28, overflow: "hidden", flexShrink: 0 }}>
      <input
        type="number"
        value={val}
        min={min}
        max={max}
        onChange={(e) => onCh(Number(e.target.value))}
        style={{ width: 36, padding: "0 6px", fontSize: 12, fontWeight: 500, border: "none", outline: "none", background: "transparent", color: "var(--p-color-text)", textAlign: "right", MozAppearance: "textfield" } as any}
      />
      <span style={{ padding: "0 7px", fontSize: 11, fontWeight: 500, color: "var(--p-color-text-secondary)", background: "var(--p-color-bg-surface-secondary, #f6f6f7)", borderLeft: "1px solid var(--p-color-border)", height: "100%", display: "flex", alignItems: "center", userSelect: "none", flexShrink: 0 }}>
        px
      </span>
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
            {numBox(t, (n) => setAll(n))}
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
          {(["top", "right", "bottom", "left"] as const).map((side) => (
            <div key={side} style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "var(--p-color-text-secondary)" }}>
                {side === "top" ? "T" : side === "right" ? "R" : side === "bottom" ? "B" : "L"}
              </span>
              {numBox(v[side] ?? 0, (n) => setSide(side, n))}
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

  PhotoCollage: {
    layout: "mixed" | "grid" | "brick" | "carousel";
    images: { url: string; alt?: string }[];
    gap: number;
    borderRadius: number;
    objectFit: "cover" | "contain" | "fill";
    aspectRatio: "1:1" | "4:3" | "16:9" | "3:2";
    hoverEffect: "none" | "zoom" | "darken";
    boxShadow: boolean;
    shadowStrength: "subtle" | "medium" | "strong";
    hideDesktop: boolean;
    hideTablet: boolean;
    hideMobile: boolean;
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
    const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">(
      "idle",
    );
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [lastAction, setLastAction] = useState<"upload" | "replace">("upload");
    const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isReplace: boolean) => {
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

      setLastAction(isReplace ? "replace" : "upload");
      setUploadStatus("uploading");
      setUploadError(null);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);

      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/upload-asset", { method: "POST", body: form });
        const result = (await res.json()) as
          | { ok: true; url: string }
          | { ok: false; error: string };
        if (!result.ok) throw new Error(result.error || "Upload failed");

        onChange(result.url);
        setUploadStatus("success");
        successTimerRef.current = setTimeout(() => setUploadStatus("idle"), 3000);
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
                (e.currentTarget.style.borderColor = "#1a1a1a")
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
                  <div style={{ fontSize: useCompactPreview ? 10 : 12, fontWeight: 600, color: "var(--p-color-text)" }}>
                    {useCompactPreview ? "Upload" : "Click to upload"}
                  </div>
                  {!useCompactPreview && (
                    <div style={{ fontSize: 11, color: "var(--p-color-text-secondary)" }}>
                      PNG · JPG · WEBP
                    </div>
                  )}
                </div>
              )}

              {/* Uploading overlay */}
              {uploadStatus === "uploading" && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.82)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: "var(--p-border-radius-200, 8px)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "pb-spin 0.8s linear infinite" }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  <style>{`@keyframes pb-spin{to{transform:rotate(360deg)}}`}</style>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#1a1a1a" }}>
                    {lastAction === "replace" ? "Replacing…" : "Uploading…"}
                  </span>
                </div>
              )}

              {/* Success overlay */}
              {uploadStatus === "success" && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(240,253,244,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: "var(--p-border-radius-200, 8px)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#166534" }}>
                    {lastAction === "replace" ? "Image replaced" : "Image uploaded"}
                  </span>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, false)}
                disabled={uploadStatus === "uploading"}
                style={{ display: "none" }}
              />
            </label>
          </div>

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
                Replace
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, true)}
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
            <>
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
              
              <div
                style={{
                  marginTop: 12,
                  borderRadius: "var(--p-border-radius-200, 8px)",
                  overflow: "hidden",
                  border: "1px solid var(--p-color-border-subdued)",
                  backgroundColor: "#000",
                }}
              >
                <video
                  src={value}
                  controls
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "200px",
                    display: "block",
                  }}
                />
              </div>
            </>
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
              <LinkUrlField label="Facebook URL" value={value} onChange={onChange} />
            ),
          },

          twitter: {
            type: "custom",
            label: "Twitter / X URL",
            render: ({ value, onChange }) => (
              <LinkUrlField label="Twitter/X URL" value={value} onChange={onChange} />
            ),
          },

          instagram: {
            type: "custom",
            label: "Instagram URL",
            render: ({ value, onChange }) => (
              <LinkUrlField label="Instagram URL" value={value} onChange={onChange} />
            ),
          },

          linkedin: {
            type: "custom",
            label: "LinkedIn URL",
            render: ({ value, onChange }) => (
              <LinkUrlField label="LinkedIn URL" value={value} onChange={onChange} />
            ),
          },

          github: {
            type: "custom",
            label: "GitHub URL",
            render: ({ value, onChange }) => (
              <LinkUrlField label="GitHub URL" value={value} onChange={onChange} />
            ),
          },

          youtube: {
            type: "custom",
            label: "YouTube URL",
            render: ({ value, onChange }) => (
              <LinkUrlField label="YouTube URL" value={value} onChange={onChange} />
            ),
          },

          tiktok: {
            type: "custom",
            label: "TikTok URL",
            render: ({ value, onChange }) => (
              <LinkUrlField label="TikTok URL" value={value} onChange={onChange} />
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

  MarqueeBar: {
    label: "Info Bar",
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
            dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
          };
          return (
            <BlockTabBar blockKey="MarqueeBar">
              {(tab) => (
                <>
                  {tab === "content" && (
                    <>
                      <TabSection title="Text" />
                      <StackedTextField label="Announcement Text" value={props.text ?? ""} onChange={(v) => set("text", v)} placeholder="Free Shipping · Sale Now On ·" />
                      <SliderNumberField label="Repeat Count" value={props.repeat ?? 10} onChange={(v) => set("repeat", v)} min={1} max={30} step={1} unit="" />
                      <TabSection title="Scroll" />
                      <AlignField
                        label="Direction"
                        value={props.direction ?? "left"}
                        onChange={(v) => set("direction", v)}
                        options={[
                          { value: "left",  icon: <ArrowLeft  size={15} />, title: "Left"  },
                          { value: "right", icon: <ArrowRight size={15} />, title: "Right" },
                        ]}
                      />
                      <SliderNumberField label="Speed (s)" value={props.speed ?? 20} onChange={(v) => set("speed", v)} min={2} max={120} step={1} unit="S" />
                      <ToggleField label="Pause on Hover" value={props.pauseOnHover !== false} onChange={(v) => set("pauseOnHover", v)} />
                    </>
                  )}
                  {tab === "style" && (
                    <>
                      <TabSection title="Colors" />
                      <ColorPickerField label="Background Color" value={props.backgroundColor ?? "#000000"} onChange={(v) => set("backgroundColor", v)} />
                      <ColorPickerField label="Text Color" value={props.textColor ?? "#ffffff"} onChange={(v) => set("textColor", v)} />
                      <TabSection title="Typography" />
                      <SliderNumberField label="Font Size (px)" value={props.fontSize ?? 14} onChange={(v) => set("fontSize", v)} min={10} max={36} step={1} unit="PX" />
                      <InlineSelect
                        label="Font Weight"
                        value={String(props.fontWeight ?? "500")}
                        onChange={(v) => set("fontWeight", v)}
                        options={[
                          { value: "400", label: "Normal" },
                          { value: "500", label: "Medium" },
                          { value: "600", label: "Semi Bold" },
                          { value: "700", label: "Bold" },
                        ]}
                      />
                      <InlineSelect
                        label="Text Transform"
                        value={props.textTransform ?? "uppercase"}
                        onChange={(v) => set("textTransform", v)}
                        options={[
                          { value: "uppercase",  label: "Uppercase"  },
                          { value: "capitalize", label: "Capitalize" },
                          { value: "lowercase",  label: "Lowercase"  },
                        ]}
                      />
                      <TabSection title="Spacing" />
                      <SliderNumberField label="Padding (px)" value={props.padding ?? 10} onChange={(v) => set("padding", v)} min={0} max={60} step={2} unit="PX" />
                      <SliderNumberField label="Item Gap (px)" value={props.itemGap ?? 40} onChange={(v) => set("itemGap", v)} min={8} max={200} step={4} unit="PX" />
                    </>
                  )}
                  {tab === "advanced" && (
                    <>
                      <TabSection title="Responsive" />
                      <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                      <ToggleField label="Hide on Tablet"  value={!!props.hideTablet}  onChange={(v) => set("hideTablet", v)} />
                      <ToggleField label="Hide on Mobile"  value={!!props.hideMobile}  onChange={(v) => set("hideMobile", v)} />
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
      text: "🔥 Free Shipping on All Orders | 30 Days Return | COD Available 🔥",
      speed: 20,
      direction: "left",
      pauseOnHover: true,
      backgroundColor: "#000000",
      textColor: "#ffffff",
      fontSize: 14,
      fontWeight: "500",
      textTransform: "uppercase",
      padding: 10,
      itemGap: 40,
      repeat: 10,
      hideDesktop: false,
      hideTablet: false,
      hideMobile: false,
    },

    render: ({ text, speed, direction, pauseOnHover, backgroundColor, textColor, fontSize, fontWeight, textTransform, padding, itemGap, repeat, hideDesktop, hideTablet, hideMobile }: any) => {
      const [hovered, setHovered] = useState(false);
      const animationName = direction === "right" ? "mqRight" : "mqLeft";
      const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
      const repeatedText = Array.from({ length: repeat ?? 10 }).map((_, i) => (
        <span key={i} style={{ marginRight: itemGap ?? 40 }}>{text}</span>
      ));
      return (
        <div
          onMouseEnter={() => pauseOnHover && setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ width: "100%", overflow: "hidden", whiteSpace: "nowrap", backgroundColor, color: textColor, fontSize, fontWeight, textTransform: textTransform as any, padding: `${padding ?? 10}px 0`, boxSizing: "border-box" }}
        >
          <div style={{ display: "inline-block", animation: `${animationName} ${speed}s linear infinite`, animationPlayState: pauseOnHover && hovered ? "paused" : "running" }}>
            {repeatedText}
          </div>
          <style>{`
            @keyframes mqLeft  { 0% { transform:translateX(0) }  100% { transform:translateX(-50%) } }
            @keyframes mqRight { 0% { transform:translateX(-50%) } 100% { transform:translateX(0) } }
          `}</style>
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
              data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } },
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
                        onChange={(v) => set("level", v === "custom" ? "custom" : Number(v))}
                        options={[
                          { value: "1", label: "H1" }, { value: "2", label: "H2" },
                          { value: "3", label: "H3" }, { value: "4", label: "H4" },
                          { value: "5", label: "H5" }, { value: "6", label: "H6" },
                          { value: "custom", label: "Custom" },
                        ]}
                      />
                      {props.level === "custom" && (
                        <SliderNumberField label="Font Size (px)" value={props.fontSize ?? 32} onChange={(v) => set("fontSize", v)} min={8} max={200} step={1} unit="px" />
                      )}
                      <LinkUrlField value={props.linkUrl ?? ""} onChange={(v) => set("linkUrl", v)} />
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
                        onChange={(v) => { set("fontFamily", v); loadGoogleFont(v); }}
                        options={[
                          { value: "inherit",                       label: "Theme Default" },
                          { value: "Arial, Helvetica, sans-serif",   label: "Arial" },
                          { value: "Georgia, serif",                 label: "Georgia" },
                          { value: "'Courier New', monospace",       label: "Courier New" },
                          { value: "Impact, sans-serif",             label: "Impact" },
                          { value: "Inter, sans-serif",              label: "Inter" },
                          { value: "Poppins, sans-serif",            label: "Poppins" },
                          { value: "'Roboto Serif', serif",          label: "Roboto Serif" },
                          { value: "'New York', 'New York Small', 'Times New Roman', serif", label: "New York" },
                          { value: "'Open Sans', sans-serif",        label: "Open Sans" },
                        ]}
                      />
                      <InlineSelect
                        label="Font Weight"
                        value={String(props.fontWeight ?? "700")}
                        onChange={(v) => set("fontWeight", v)}
                        options={[
                          { value: "400", label: "Normal" },
                          { value: "600", label: "Semi Bold" },
                          { value: "900", label: "Bold" },
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
                        value={props.textTransform ?? "capitalize"}
                        onChange={(v) => set("textTransform", v)}
                        options={[
                          { value: "capitalize", label: "Capitalize" },
                          { value: "uppercase", label: "Uppercase" },
                          { value: "lowercase", label: "Lowercase" },
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
                      <SliderNumberField label="Line Height" value={props.lineHeight ?? 1.4} onChange={(v) => set("lineHeight", v)} min={0.5} max={5} step={0.05} unit="" />
                      <SliderNumberField label="Letter Spacing (px)" value={props.letterSpacing ?? 0} onChange={(v) => set("letterSpacing", v)} min={-10} max={50} step={0.5} unit="px" />

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
                      <SliderNumberField label="Subtitle Size (px)" value={props.subtitleSize ?? 18} onChange={(v) => set("subtitleSize", v)} min={10} max={64} step={1} unit="px" />


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
                          <SliderNumberField label="Divider Length (px)" value={props.dividerLength ?? 60} onChange={(v) => set("dividerLength", v)} min={20} max={300} step={5} unit="px" />
                          {props.dividerType !== "line-with-icon" && (
                            <SliderNumberField label="Divider Thickness (px)" value={props.dividerThickness ?? 3} onChange={(v) => set("dividerThickness", v)} min={1} max={50} step={1} unit="px" />
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
                          <SliderNumberField label="Angle (deg)" value={props.advGradientAngle ?? 135} onChange={(v) => set("advGradientAngle", v)} min={0} max={360} step={15} unit="°" />
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

                      <SliderNumberField label="Opacity (%)" value={props.opacity ?? 100} onChange={(v) => set("opacity", v)} min={0} max={100} step={1}
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
      linkTarget: "_blank",
      // Style – typography
      fontFamily: "inherit",
      fontSize: null,
      fontWeight: "700",
      fontStyle: "normal",
      textTransform: "capitalize",
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
      const Tag = (level === "custom" ? "p" : `h${level || 1}`) as keyof JSX.IntrinsicElements;

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
        level === "custom" ? (fontSize ? `${fontSize}px` : "1rem")
        : level === 1 ? "var(--h1-size, 2.5rem)"
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
            fontSize: level === "custom" ? (fontSize ? `${fontSize}px` : "1rem") : defaultFontSize,
            fontWeight: fontWeight ?? "700",
            fontFamily: fontFamily && fontFamily !== "inherit" ? fontFamily : "var(--heading-font)",
            fontStyle: fontStyle ?? "normal",
            textTransform: (textTransform ?? "capitalize") as any,
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
          className={[cssClass].filter(Boolean).join(" ") || undefined}
          style={wrapperStyle}
        >
          {customCss && <style>{`#${cssId || "heading-block"} { ${customCss} }`}</style>}
          {linkUrl
            ? <a href={linkUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>{headingEl}</a>
            : headingEl
          }

          {subtitle && (
            <p style={{
              fontSize: subtitleSize ? `${subtitleSize}px` : "var(--base-font-size, 1rem)",
              color: subtitleColor || "var(--text-color)",
              marginTop: 8,
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
            dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
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
                    </>
                  )}

                  {/* ── STYLE TAB ── */}
                  {tab === "style" && (
                    <>
                      <TabSection title="Typography" />
                      <InlineSelect
                        label="Font Family"
                        value={props.fontFamily ?? "inherit"}
                        onChange={(v) => { set("fontFamily", v); loadGoogleFont(v); }}
                        options={[
                          { value: "inherit",                       label: "Theme Default" },
                          { value: "Arial, Helvetica, sans-serif",   label: "Arial" },
                          { value: "Georgia, serif",                 label: "Georgia" },
                          { value: "'Courier New', monospace",       label: "Courier New" },
                          { value: "Impact, sans-serif",             label: "Impact" },
                          { value: "Inter, sans-serif",              label: "Inter" },
                          { value: "Poppins, sans-serif",            label: "Poppins" },
                          { value: "'Roboto Serif', serif",          label: "Roboto Serif" },
                          { value: "'New York', 'New York Small', 'Times New Roman', serif", label: "New York" },
                          { value: "'Open Sans', sans-serif",        label: "Open Sans" },
                        ]}
                      />
                      <SliderNumberField label="Font Size (px)" value={props.fontSize ?? 16} onChange={(v) => set("fontSize", v)} min={8} max={120} step={1} unit="px" />
                      <InlineSelect
                        label="Font Weight"
                        value={String(props.fontWeight ?? "400")}
                        onChange={(v) => set("fontWeight", v)}
                        options={[
                          { value: "400", label: "Normal" },
                          { value: "600", label: "Semi Bold" },
                          { value: "900", label: "Bold" },
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
                      <SliderNumberField label="Line Height" value={props.lineHeight ?? 1.6} onChange={(v) => set("lineHeight", v)} min={0.8} max={5} step={0.05} unit="" />
                      <SliderNumberField label="Letter Spacing (px)" value={props.letterSpacing ?? 0} onChange={(v) => set("letterSpacing", v)} min={-10} max={50} step={0.5} unit="px" />
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
                        value={props.textTransform ?? "capitalize"}
                        onChange={(v) => set("textTransform", v)}
                        options={[
                          { value: "capitalize", label: "Capitalize" },
                          { value: "uppercase", label: "Uppercase" },
                          { value: "lowercase", label: "Lowercase" },
                        ]}
                      />

                      <TabSection title="Color" />
                      <ColorPickerField
                        label="Text Color"
                        value={props.textColor ?? ""}
                        onChange={(v) => set("textColor", v)}
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
                          <SliderNumberField label="Angle (deg)" value={props.advGradientAngle ?? 135} onChange={(v) => set("advGradientAngle", v)} min={0} max={360} step={15} unit="°" />
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

                      <SliderNumberField label="Opacity (%)" value={props.opacity ?? 100} onChange={(v) => set("opacity", v)} min={0} max={100} step={1} unit="%" />
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
      textTransform: "capitalize",
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
          className={[cssClass].filter(Boolean).join(" ") || undefined}
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
            dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
          };
          return (
            <BlockTabBar blockKey="Article">
              {(tab) => (
                <>
                  {tab === "content" && (
                    <>
                      <TabSection title="Article" />
                      <StackedTextField label="Title" value={props.articleTitle ?? ""} onChange={(v) => set("articleTitle", v)} placeholder="Enter article title..." />
                      <StackedTextareaField label="Body" value={props.body ?? ""} onChange={(v) => set("body", v)} placeholder="Enter article body..." rows={6} />
                      <StackedTextField label="Author" value={props.author ?? ""} onChange={(v) => set("author", v)} placeholder="e.g., Jane Smith" />
                      <ToggleField label="Show Author" value={props.showAuthor !== false} onChange={(v) => set("showAuthor", v)} />
                      <StackedDateField label="Published Date" value={props.publishDate ?? ""} onChange={(v) => set("publishDate", v)} />
                      <ToggleField label="Show Date" value={props.showDate !== false} onChange={(v) => set("showDate", v)} />
                      <TabSection title="Featured Image" />
                      <ImageField label="Featured Image" value={props.featuredImage ?? ""} onChange={(v: any) => set("featuredImage", v)} />
                    </>
                  )}
                  {tab === "style" && (
                    <>
                      <TabSection title="Colors" />
                      <ColorPickerField label="Title Color" value={props.titleColor ?? ""} onChange={(v) => set("titleColor", v)} />
                      <ColorPickerField label="Body Color" value={props.bodyColor ?? ""} onChange={(v) => set("bodyColor", v)} />
                      <ColorPickerField label="Author Color" value={props.authorColor ?? ""} onChange={(v) => set("authorColor", v)} />
                      <ColorPickerField label="Date Color" value={props.dateColor ?? ""} onChange={(v) => set("dateColor", v)} />

                      <TabSection title="Title Typography" />
                      <InlineSelect label="Font Family" value={props.titleFontFamily ?? "inherit"} onChange={(v) => { set("titleFontFamily", v); loadGoogleFont(v); }} options={[{ value: "inherit", label: "Theme Default" }, { value: "Arial, Helvetica, sans-serif", label: "Arial" }, { value: "Georgia, serif", label: "Georgia" }, { value: "'Courier New', monospace", label: "Courier New" }, { value: "Impact, sans-serif", label: "Impact" }, { value: "Inter, sans-serif", label: "Inter" }, { value: "Poppins, sans-serif", label: "Poppins" }, { value: "'Roboto Serif', serif", label: "Roboto Serif" }, { value: "'New York', 'New York Small', 'Times New Roman', serif", label: "New York" }, { value: "'Open Sans', sans-serif", label: "Open Sans" }]} />
                      <SliderNumberField label="Font Size (px)" value={props.titleFontSize ?? 32} onChange={(v) => set("titleFontSize", v)} min={10} max={120} step={1} unit="px" />
                      <InlineSelect label="Font Weight" value={String(props.titleFontWeight ?? "700")} onChange={(v) => set("titleFontWeight", v)} options={[{value:"400",label:"Normal"},{value:"600",label:"Semi Bold"},{value:"900",label:"Bold"}]} />
                      <SliderNumberField label="Line Height" value={props.titleLineHeight ?? 1.3} onChange={(v) => set("titleLineHeight", v)} min={0.8} max={3} step={0.05} unit="" />
                      <AlignField label="Text Alignment" value={props.titleAlign ?? "left"} onChange={(v) => set("titleAlign", v)} options={[{value:"left",icon:<AlignLeft size={15}/>,title:"Left"},{value:"center",icon:<AlignCenter size={15}/>,title:"Center"},{value:"right",icon:<AlignRight size={15}/>,title:"Right"}]} />

                      <TabSection title="Body Typography" />
                      <InlineSelect label="Font Family" value={props.bodyFontFamily ?? "inherit"} onChange={(v) => { set("bodyFontFamily", v); loadGoogleFont(v); }} options={[{ value: "inherit", label: "Theme Default" }, { value: "Arial, Helvetica, sans-serif", label: "Arial" }, { value: "Georgia, serif", label: "Georgia" }, { value: "'Courier New', monospace", label: "Courier New" }, { value: "Impact, sans-serif", label: "Impact" }, { value: "Inter, sans-serif", label: "Inter" }, { value: "Poppins, sans-serif", label: "Poppins" }, { value: "'Roboto Serif', serif", label: "Roboto Serif" }, { value: "'New York', 'New York Small', 'Times New Roman', serif", label: "New York" }, { value: "'Open Sans', sans-serif", label: "Open Sans" }]} />
                      <SliderNumberField label="Font Size (px)" value={props.bodyFontSize ?? 16} onChange={(v) => set("bodyFontSize", v)} min={10} max={60} step={1} unit="px" />
                      <InlineSelect label="Font Weight" value={String(props.bodyFontWeight ?? "400")} onChange={(v) => set("bodyFontWeight", v)} options={[{value:"400",label:"Normal"},{value:"600",label:"Semi Bold"},{value:"900",label:"Bold"}]} />
                      <SliderNumberField label="Line Height" value={props.bodyLineHeight ?? 1.75} onChange={(v) => set("bodyLineHeight", v)} min={0.8} max={4} step={0.05} unit="" />

                      <TabSection title="Author Typography" />
                      <InlineSelect label="Font Family" value={props.authorFontFamily ?? "inherit"} onChange={(v) => { set("authorFontFamily", v); loadGoogleFont(v); }} options={[{ value: "inherit", label: "Theme Default" }, { value: "Arial, Helvetica, sans-serif", label: "Arial" }, { value: "Georgia, serif", label: "Georgia" }, { value: "'Courier New', monospace", label: "Courier New" }, { value: "Impact, sans-serif", label: "Impact" }, { value: "Inter, sans-serif", label: "Inter" }, { value: "Poppins, sans-serif", label: "Poppins" }, { value: "'Roboto Serif', serif", label: "Roboto Serif" }, { value: "'New York', 'New York Small', 'Times New Roman', serif", label: "New York" }, { value: "'Open Sans', sans-serif", label: "Open Sans" }]} />
                      <SliderNumberField label="Font Size (px)" value={props.authorFontSize ?? 14} onChange={(v) => set("authorFontSize", v)} min={10} max={40} step={1} unit="px" />
                      <InlineSelect label="Font Weight" value={String(props.authorFontWeight ?? "400")} onChange={(v) => set("authorFontWeight", v)} options={[{value:"400",label:"Normal"},{value:"600",label:"Semi Bold"},{value:"900",label:"Bold"}]} />

                      <TabSection title="Date Typography" />
                      <InlineSelect label="Font Family" value={props.dateFontFamily ?? "inherit"} onChange={(v) => { set("dateFontFamily", v); loadGoogleFont(v); }} options={[{ value: "inherit", label: "Theme Default" }, { value: "Arial, Helvetica, sans-serif", label: "Arial" }, { value: "Georgia, serif", label: "Georgia" }, { value: "'Courier New', monospace", label: "Courier New" }, { value: "Impact, sans-serif", label: "Impact" }, { value: "Inter, sans-serif", label: "Inter" }, { value: "Poppins, sans-serif", label: "Poppins" }, { value: "'Roboto Serif', serif", label: "Roboto Serif" }, { value: "'New York', 'New York Small', 'Times New Roman', serif", label: "New York" }, { value: "'Open Sans', sans-serif", label: "Open Sans" }]} />
                      <SliderNumberField label="Font Size (px)" value={props.dateFontSize ?? 13} onChange={(v) => set("dateFontSize", v)} min={10} max={40} step={1} unit="px" />
                      <InlineSelect label="Font Weight" value={String(props.dateFontWeight ?? "400")} onChange={(v) => set("dateFontWeight", v)} options={[{value:"400",label:"Normal"},{value:"600",label:"Semi Bold"},{value:"900",label:"Bold"}]} />

                      <TabSection title="Featured Image" />
                      <InlineSelect label="Object Fit" value={props.imageFit ?? "cover"} onChange={(v) => set("imageFit", v)} options={[{value:"cover",label:"Cover"},{value:"contain",label:"Contain"},{value:"fill",label:"Fill"}]} />
                      <SliderNumberField label="Border Radius (px)" value={props.imageBorderRadius ?? 8} onChange={(v) => set("imageBorderRadius", v)} min={0} max={100} step={1} unit="px" />
                      <SliderNumberField label="Margin Bottom (px)" value={props.imageMarginBottom ?? 24} onChange={(v) => set("imageMarginBottom", v)} min={0} max={120} step={4} unit="px" />
                    </>
                  )}
                  {tab === "advanced" && (
                    <>
                      <TabSection title="Spacing" />
                      <FourSideField label="Margin"  value={props.advMargin  ?? { top: 0, right: 0, bottom: 0, left: 0 }}   onChange={(v) => set("advMargin", v)} />
                      <FourSideField label="Padding" value={props.advPadding ?? { top: 48, right: 24, bottom: 48, left: 24 }} onChange={(v) => set("advPadding", v)} />
                      <TabSection title="Responsive" />
                      <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                      <ToggleField label="Hide on Tablet"  value={!!props.hideTablet}  onChange={(v) => set("hideTablet", v)} />
                      <ToggleField label="Hide on Mobile"  value={!!props.hideMobile}  onChange={(v) => set("hideMobile", v)} />
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
      articleTitle: "Article Title",
      author: "Jane Smith",
      showAuthor: true,
      publishDate: "",
      showDate: true,
      body: "<p></p>",
      featuredImage: "",
      imagePosition: "top",
      imageHeight: 400,
      imageBorderRadius: 8,
      imageFit: "cover",
      imageMarginBottom: 24,
      titleAlign: "left",
      titleColor: "",
      titleFontFamily: "inherit",
      titleFontSize: 32,
      titleFontWeight: "700",
      titleLineHeight: 1.3,
      bodyColor: "",
      bodyFontFamily: "inherit",
      bodyFontSize: 16,
      bodyFontWeight: "400",
      bodyLineHeight: 1.75,
      authorColor: "",
      authorFontFamily: "inherit",
      authorFontSize: 14,
      authorFontWeight: "400",
      dateColor: "",
      dateFontFamily: "inherit",
      dateFontSize: 13,
      dateFontWeight: "400",
      advMargin:  { top: 0,  right: 0,  bottom: 0,  left: 0  },
      advPadding: { top: 48, right: 24, bottom: 48, left: 24 },
      hideDesktop: false,
      hideTablet:  false,
      hideMobile:  false,
    },

    render: ({
      articleTitle, author, showAuthor, publishDate, showDate, body,
      featuredImage, imagePosition, imageHeight, imageBorderRadius, imageFit, imageMarginBottom,
      titleAlign, titleColor, titleFontFamily, titleFontSize, titleFontWeight, titleLineHeight,
      bodyColor, bodyFontFamily, bodyFontSize, bodyFontWeight, bodyLineHeight,
      authorColor, authorFontFamily, authorFontSize, authorFontWeight,
      dateColor, dateFontFamily, dateFontSize, dateFontWeight,
      advMargin, advPadding, hideDesktop, hideTablet, hideMobile,
    }: any) => {
      const m  = advMargin  ?? { top: 0,  right: 0,  bottom: 0,  left: 0  };
      const pd = advPadding ?? { top: 48, right: 24, bottom: 48, left: 24 };
      const hideClasses = [
        hideDesktop ? "puck-hide-desktop" : "",
        hideTablet  ? "puck-hide-tablet"  : "",
        hideMobile  ? "puck-hide-mobile"  : "",
      ].filter(Boolean).join(" ");
      const radius = imageBorderRadius ?? 8;
      const imgH = imageHeight ?? 400;
      const isHorizontal = imagePosition === "left" || imagePosition === "right";
      const fit = imageFit ?? "cover";
      const imgMarginBottom = imageMarginBottom ?? 24;

      const imgStyle: React.CSSProperties = {
        width: "100%",
        height: imgH,
        objectFit: fit as React.CSSProperties["objectFit"],
        display: "block",
      };

      const formatDate = (d: string) => {
        if (!d) return "";
        const parsed = new Date(d);
        return isNaN(parsed.getTime()) ? d : parsed.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      };

      const imageBox = featuredImage ? (
        <div style={{
          flexShrink: 0,
          minWidth: 0,
          width: isHorizontal ? "44%" : "100%",
          marginBottom: isHorizontal ? 0 : imgMarginBottom,
          borderRadius: radius,
          overflow: "hidden",
        }}>
          <img src={featuredImage} alt={articleTitle || "Featured image"} style={imgStyle} />
        </div>
      ) : null;

      const metaVisible = (showAuthor !== false && !!author) || (showDate !== false && !!publishDate);

      const articleContent = (
        <div style={{ flex: 1, minWidth: 0 }}>
          {articleTitle && (
            <h1 style={{
              fontSize: titleFontSize ? `${titleFontSize}px` : "2rem",
              fontWeight: Number(titleFontWeight ?? 700),
              fontFamily: titleFontFamily && titleFontFamily !== "inherit" ? titleFontFamily : "var(--heading-font)",
              color: titleColor || "var(--primary-color)",
              textAlign: titleAlign as React.CSSProperties["textAlign"],
              lineHeight: titleLineHeight ?? 1.3,
              marginBottom: 10,
            }}>
              {articleTitle}
            </h1>
          )}
          {metaVisible && (
            <div style={{
              display: "flex",
              gap: 12,
              marginBottom: 28,
              flexWrap: "wrap",
              justifyContent: titleAlign === "center" ? "center" : titleAlign === "right" ? "flex-end" : "flex-start",
            }}>
              {showAuthor !== false && author && (
                <span style={{
                  fontSize: authorFontSize ? `${authorFontSize}px` : 14,
                  fontWeight: Number(authorFontWeight ?? 400),
                  fontFamily: authorFontFamily && authorFontFamily !== "inherit" ? authorFontFamily : undefined,
                  color: authorColor || "var(--text-color)",
                }}>
                  By <strong>{author}</strong>
                </span>
              )}
              {showDate !== false && publishDate && (
                <span style={{
                  fontSize: dateFontSize ? `${dateFontSize}px` : 13,
                  fontWeight: Number(dateFontWeight ?? 400),
                  fontFamily: dateFontFamily && dateFontFamily !== "inherit" ? dateFontFamily : undefined,
                  color: dateColor || "var(--text-color)",
                }}>
                  {formatDate(publishDate)}
                </span>
              )}
            </div>
          )}
          <div style={{
            fontSize: bodyFontSize ? `${bodyFontSize}px` : "1rem",
            lineHeight: bodyLineHeight ?? 1.75,
            color: bodyColor || "var(--text-color)",
            fontWeight: Number(bodyFontWeight ?? 400),
            fontFamily: bodyFontFamily && bodyFontFamily !== "inherit" ? bodyFontFamily : undefined,
          }}>
            {body}
          </div>
        </div>
      );

      return (
        <div
          className={hideClasses || undefined}
          style={{
            marginTop: m.top, marginRight: m.right, marginBottom: m.bottom, marginLeft: m.left,
            paddingTop: pd.top, paddingRight: pd.right, paddingBottom: pd.bottom, paddingLeft: pd.left,
          }}
        >
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            {isHorizontal ? (
              <div style={{ display: "flex", flexDirection: imagePosition === "left" ? "row" : "row-reverse", gap: 48, alignItems: "flex-start" }}>
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


  // ─── Photo Collage ───────────────────────────────────────────────────────

  PhotoCollage: {
    label: "Photo Collage",
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
              data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } },
            });
          };
          const [photoOpenIdx, setPhotoOpenIdx] = useState<number | null>(null);
          const [photoConfirmIdx, setPhotoConfirmIdx] = useState<number | null>(null);

          return (
            <BlockTabBar blockKey="PhotoCollage">
              {(tab: any) => (
                <>
                  {tab === "content" && (
                    <>
                      <TabSection title="Layout" />
                      <InlineSelect
                        label="Layout Type"
                        value={props.layout ?? "mixed"}
                        onChange={(v: any) => set("layout", v)}
                        options={[
                          { value: "mixed",    label: "Mixed Sizes" },
                          { value: "grid",     label: "Grid"        },
                          { value: "brick",    label: "Brick"       },
                          { value: "carousel", label: "Carousel"    },
                        ]}
                      />
                      <TabSection title="Photos" />
                      {(() => {
                        const imgs: any[] = (props.images as any[]) ?? [];
                        const openIdx = photoOpenIdx;
                        const confirmIdx = photoConfirmIdx;
                        const updateImage = (i: number, key: string, val: any) => {
                          const cur = [...(((selectedItem?.props as any)?.images as any[]) ?? [])];
                          cur[i] = { ...cur[i], [key]: val };
                          set("images", cur);
                        };
                        const deleteImage = (i: number) => {
                          const cur = (((selectedItem?.props as any)?.images as any[]) ?? []);
                          set("images", cur.filter((_: any, idx: number) => idx !== i));
                          setPhotoConfirmIdx(null);
                          setPhotoOpenIdx(null);
                        };
                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {imgs.map((img: any, i: number) => {
                              const open = openIdx === i;
                              const confirm = confirmIdx === i;
                              return (
                                <div key={i} style={{ border: "1px solid var(--p-color-border, #e1e3e5)", borderRadius: 8, background: "var(--p-color-bg-surface, #fff)", overflow: "hidden" }}>
                                  {/* Header row */}
                                  <div
                                    onClick={() => { if (!confirm) setPhotoOpenIdx(open ? null : i); }}
                                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", cursor: confirm ? "default" : "pointer", userSelect: "none", background: open ? "var(--p-color-bg-surface-secondary, #f6f6f7)" : "transparent", borderBottom: (open || confirm) ? "1px solid var(--p-color-border, #e1e3e5)" : "none" }}
                                  >
                                    <div style={{ width: 36, height: 36, borderRadius: 5, overflow: "hidden", background: "var(--p-color-bg-surface-secondary, #f3f4f6)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--p-color-border, #e1e3e5)" }}>
                                      {img.url
                                        ? <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--p-color-icon-subdued, #8c9196)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                                      }
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--p-color-text, #202223)", lineHeight: 1.3 }}>Photo {i + 1}</div>
                                      <div style={{ fontSize: 11, color: "var(--p-color-text-subdued, #6d7175)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>
                                        {img.alt || (img.url ? "No alt text" : "No image selected")}
                                      </div>
                                    </div>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--p-color-icon-subdued, #8c9196)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
                                      <path d="m6 9 6 6 6-6"/>
                                    </svg>
                                    <button
                                      onClick={(e: any) => { e.stopPropagation(); setPhotoConfirmIdx(i); setPhotoOpenIdx(null); }}
                                      title="Remove photo"
                                      style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 5, border: "1px solid var(--p-color-border, #e1e3e5)", background: "var(--p-color-bg-surface, #fff)", color: "var(--p-color-text-critical, #d72c0d)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                        <path d="M10 11v6"/><path d="M14 11v6"/>
                                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                      </svg>
                                    </button>
                                  </div>
                                  {/* Delete confirmation */}
                                  {confirm && (
                                    <div style={{ padding: "12px 12px 14px", background: "#fff8f8", display: "flex", flexDirection: "column", gap: 10 }}>
                                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 6, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#d72c0d" }}>
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                        </div>
                                        <div>
                                          <div style={{ fontSize: 12, fontWeight: 600, color: "#202223", marginBottom: 2 }}>Remove Photo {i + 1}?</div>
                                          <div style={{ fontSize: 11, color: "#6d7175", lineHeight: 1.5 }}>This photo will be removed from the collage. This action cannot be undone.</div>
                                        </div>
                                      </div>
                                      <div style={{ display: "flex", gap: 6 }}>
                                        <button
                                          onClick={(e: any) => { e.stopPropagation(); setPhotoConfirmIdx(null); }}
                                          style={{ flex: 1, padding: "6px 0", fontSize: 12, fontWeight: 600, borderRadius: 6, border: "1px solid var(--p-color-border, #e1e3e5)", background: "var(--p-color-bg-surface, #fff)", color: "var(--p-color-text, #202223)", cursor: "pointer" }}
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={(e: any) => { e.stopPropagation(); deleteImage(i); }}
                                          style={{ flex: 1, padding: "6px 0", fontSize: 12, fontWeight: 600, borderRadius: 6, border: "none", background: "#d72c0d", color: "#fff", cursor: "pointer" }}
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  {/* Expanded fields */}
                                  {open && !confirm && (
                                    <div style={{ padding: "10px 10px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
                                      <ImageField label="Photo" value={img.url ?? ""} onChange={(v: any) => updateImage(i, "url", v)} />
                                      <StackedTextField label="Alt Text" value={img.alt ?? ""} onChange={(v: any) => updateImage(i, "alt", v)} placeholder="Describe the image…" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            <button
                              onClick={() => { const cur = (((selectedItem?.props as any)?.images as any[]) ?? []); set("images", [...cur, { url: "", alt: "" }]); setPhotoOpenIdx(cur.length); }}
                              style={{ marginTop: 2, width: "100%", padding: "8px 0", border: "1.5px dashed var(--p-color-border-interactive, #0158ad)", borderRadius: 8, color: "var(--p-color-text-interactive, #0158ad)", background: "transparent", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                              Add Photo
                            </button>
                          </div>
                        );
                      })()}
                    </>
                  )}

                  {tab === "style" && (
                    <>
                      <TabSection title="Spacing" />
                      <SliderNumberField
                        label="Gap Between Photos (px)"
                        value={props.gap ?? 8}
                        onChange={(v: any) => set("gap", v)}
                        min={0}
                        max={40}
                        step={2}
                        unit="px"
                      />
                      <SliderNumberField
                        label="Border Radius (px)"
                        value={props.borderRadius ?? 0}
                        onChange={(v: any) => set("borderRadius", v)}
                        min={0}
                        max={20}
                        step={1}
                        unit="px"
                      />
                      <TabSection title="Image Styling" />
                      <InlineSelect
                        label="Object Fit"
                        value={props.objectFit ?? "cover"}
                        onChange={(v: any) => set("objectFit", v)}
                        options={[
                          { value: "cover",   label: "Cover"   },
                          { value: "contain", label: "Contain" },
                          { value: "fill",    label: "Fill"    },
                        ]}
                      />
                      <InlineSelect
                        label="Aspect Ratio"
                        value={props.aspectRatio ?? "1:1"}
                        onChange={(v: any) => set("aspectRatio", v)}
                        options={[
                          { value: "1:1",  label: "1:1"  },
                          { value: "4:3",  label: "4:3"  },
                          { value: "16:9", label: "16:9" },
                          { value: "3:2",  label: "3:2"  },
                        ]}
                      />
                      <TabSection title="Effects" />
                      <InlineSelect
                        label="Hover Effect"
                        value={props.hoverEffect ?? "none"}
                        onChange={(v: any) => set("hoverEffect", v)}
                        options={[
                          { value: "none",   label: "None"   },
                          { value: "zoom",   label: "Zoom"   },
                          { value: "darken", label: "Darken" },
                        ]}
                      />
                      <ToggleField
                        label="Box Shadow"
                        value={!!props.boxShadow}
                        onChange={(v: any) => set("boxShadow", v)}
                      />
                      {props.boxShadow && (
                        <InlineSelect
                          label="Shadow Strength"
                          value={props.shadowStrength ?? "subtle"}
                          onChange={(v: any) => set("shadowStrength", v)}
                          options={[
                            { value: "subtle", label: "Subtle" },
                            { value: "medium", label: "Medium" },
                            { value: "strong", label: "Strong" },
                          ]}
                        />
                      )}
                    </>
                  )}

                  {tab === "advanced" && (
                    <>
                      <TabSection title="Responsive" />
                      <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v: any) => set("hideDesktop", v)} />
                      <ToggleField label="Hide on Tablet"  value={!!props.hideTablet}  onChange={(v: any) => set("hideTablet", v)}  />
                      <ToggleField label="Hide on Mobile"  value={!!props.hideMobile}  onChange={(v: any) => set("hideMobile", v)}  />
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
      layout: "mixed",
      images: [
        { url: "", alt: "Photo 1" },
        { url: "", alt: "Photo 2" },
        { url: "", alt: "Photo 3" },
      ],
      gap: 8,
      borderRadius: 0,
      objectFit: "cover",
      aspectRatio: "1:1",
      hoverEffect: "none",
      boxShadow: false,
      shadowStrength: "subtle",
      hideDesktop: false,
      hideTablet: false,
      hideMobile: false,
    },

    render: ({ layout, images, gap, borderRadius, objectFit, aspectRatio, hoverEffect, boxShadow, shadowStrength, hideDesktop, hideTablet, hideMobile }: any) => {
      const imgs = ((images as any[]) ?? []).filter((img: any) => img.url);
      const gapPx = `${gap ?? 8}px`;
      const br = `${borderRadius ?? 0}px`;
      const fit = objectFit ?? "cover";
      const shadow = !boxShadow
        ? "none"
        : shadowStrength === "strong"
          ? "0 8px 24px rgba(0,0,0,0.3)"
          : shadowStrength === "medium"
            ? "0 4px 12px rgba(0,0,0,0.2)"
            : "0 2px 6px rgba(0,0,0,0.12)";
      const hideClasses = [
        hideDesktop ? "puck-hide-desktop" : "",
        hideTablet  ? "puck-hide-tablet"  : "",
        hideMobile  ? "puck-hide-mobile"  : "",
      ].filter(Boolean).join(" ");

      const arMap: Record<string, string> = { "1:1": "1/1", "4:3": "4/3", "16:9": "16/9", "3:2": "3/2" };
      const ar = arMap[aspectRatio as string] ?? "1/1";

      const getHoverStyle = (hovered: boolean): Record<string, string> => {
        if (!hovered) return {};
        if (hoverEffect === "zoom")   return { transform: "scale(1.05)" };
        if (hoverEffect === "darken") return { filter: "brightness(0.75)" };
        return {};
      };

      const ImgCell = ({ img, i, cellStyle, fitOverride }: { img: any; i: number; cellStyle: any; fitOverride?: string }) => {
        const [hovered, setHovered] = useState(false);
        return (
          <div
            key={i}
            className="pb-collage-item"
            style={{ overflow: "hidden", borderRadius: br, boxShadow: shadow, ...cellStyle }}
          >
            <img
              src={img.url}
              alt={img.alt || `Photo ${i + 1}`}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: (fitOverride ?? fit) as any,
                display: "block",
                transition: "transform 0.3s ease, filter 0.3s ease",
                ...getHoverStyle(hovered),
              }}
            />
          </div>
        );
      };

      if (!imgs.length) {
        return (
          <div className={hideClasses || undefined} style={{ background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, borderRadius: br, color: "#6b7280", fontSize: 14 }}>
            Add photos in the Content tab
          </div>
        );
      }

      // ── GRID: uniform cells forced to the chosen aspect ratio ──
      if (layout === "grid") {
        return (
          <div className={hideClasses || undefined} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: gapPx }}>
            {imgs.map((img: any, i: number) => (
              <ImgCell key={i} img={img} i={i} cellStyle={{ aspectRatio: ar }} />
            ))}
          </div>
        );
      }

      // ── BRICK: staggered brick wall — EVERY tile is identical in width & height.
      //    Full rows hold N bricks; offset rows hold N-1 bricks flanked by a half
      //    brick at each end, so every row is exactly the container width (no
      //    overflow) and the seams stagger like real brickwork. Aspect ratio
      //    controls tile proportions. ──
      if (layout === "brick") {
        const FULL = 3;     // bricks in a full row
        const brickW = `calc((100% - ${(FULL - 1)} * ${gapPx}) / ${FULL})`;
        const halfW = `calc((${brickW} - ${gapPx}) / 2)`;
        const rows: { items: any[]; offset: boolean }[] = [];
        let bi = 0;
        let rowNo = 0;
        while (bi < imgs.length) {
          const offset = rowNo % 2 === 1;
          const count = offset ? FULL - 1 : FULL;
          rows.push({ items: imgs.slice(bi, bi + count), offset });
          bi += count;
          rowNo += 1;
        }
        let imgIdx = 0;
        return (
          <div className={hideClasses || undefined} style={{ display: "flex", flexDirection: "column", gap: gapPx, overflow: "hidden" }}>
            {rows.map(({ items, offset }: { items: any[]; offset: boolean }, rIdx: number) => (
              <div key={rIdx} style={{ display: "flex", gap: gapPx }}>
                {offset && <div style={{ flex: `0 0 ${halfW}` }} />}
                {items.map((img: any, cIdx: number) => (
                  <ImgCell key={cIdx} img={img} i={imgIdx++} cellStyle={{ flex: `0 0 ${brickW}`, aspectRatio: ar }} fitOverride="cover" />
                ))}
                {offset && <div style={{ flex: `0 0 ${halfW}` }} />}
              </div>
            ))}
          </div>
        );
      }

      // ── CAROUSEL: horizontal scrolling strip; each photo a fixed-width slide. ──
      if (layout === "carousel") {
        return (
          <div
            className={hideClasses || undefined}
            style={{ display: "flex", gap: gapPx, overflowX: "auto", paddingBottom: 6, scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
          >
            {imgs.map((img: any, i: number) => (
              <ImgCell
                key={i}
                img={img}
                i={i}
                cellStyle={{ flex: "0 0 auto", width: "min(70%, 360px)", aspectRatio: ar, scrollSnapAlign: "start" }}
              />
            ))}
          </div>
        );
      }

      // mixed (default): first image spans 2×2, all cells use aspect ratio
      return (
        <div className={hideClasses || undefined} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: gapPx }}>
          {imgs.map((img: any, i: number) => {
            const cellStyle = i === 0
              ? { gridColumn: "span 2", gridRow: "span 2" }
              : { aspectRatio: ar };
            return <ImgCell key={i} img={img} i={i} cellStyle={cellStyle} />;
          })}
        </div>
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

const URL_PATTERN = /^(https?:\/\/|mailto:|tel:|#|\/)/;

function LinkUrlField({ value, onChange, label = "Link URL" }: { value: string; onChange: (v: string) => void; label?: string }) {
  const [draft, setDraft] = useState(value);
  const [touched, setTouched] = useState(false);
  useEffect(() => { setDraft(value); }, [value]);

  const isValid = !draft || URL_PATTERN.test(draft);
  const error = touched && draft && !isValid
    ? 'URL must start with https://, http://, mailto:, tel:, / or #'
    : null;

  const commit = (raw: string) => {
    const v = raw.trim();
    setTouched(true);
    if (v && !URL_PATTERN.test(v)) {
      // invalid — keep draft as-is for the user to correct, don't save
      setDraft(v);
    } else {
      setDraft(v);
      onChange(v);
    }
  };

  return (
    <StackedField label={label}>
      <>
        <input
          type="url"
          value={draft}
          placeholder="https://..."
          onChange={(e) => { setDraft(e.target.value); setTouched(false); }}
          onBlur={(e) => commit(e.target.value)}
          style={{
            width: "100%", padding: "5px 8px", fontSize: 12,
            border: `1px solid ${error ? "#d72c0d" : "var(--p-color-border)"}`,
            borderRadius: "var(--p-border-radius-100, 4px)",
            outline: "none", boxSizing: "border-box",
            background: "var(--p-color-bg-surface)", color: "var(--p-color-text)",
          }}
        />
        {error && <div style={{ color: "#d72c0d", fontSize: 11, marginTop: 3 }}>{error}</div>}
      </>
    </StackedField>
  );
}

function ImageLinkUrlField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <LinkUrlField value={value} onChange={onChange} />;
}

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
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
        };

        const hasCaption = !!(props.caption ?? "");
        const isCustomH = (props.heightMode ?? "auto") === "custom";
        const borderStyleVal = props.borderStyle ?? "none";
        const hoverEffectVal = props.hoverEffect ?? "none";
        const captionPosVal = props.captionPosition ?? "below";
        const imgWidthVal = props.imgWidth ?? 100;
        const imgWidthUnit = props.imgWidthUnit ?? "%";
        const isLessThan100 = imgWidthUnit !== "%" || imgWidthVal < 100;
        const bgType = props.advBgType ?? "none";
        const [showImgError, setShowImgError] = useState(false);

        useEffect(() => {
          if (props.imageUrl) { setShowImgError(false); return; }
          const handler = () => { setShowImgError(true); setTimeout(() => setShowImgError(false), 5000); };
          window.addEventListener("pb:image-validation-failed", handler);
          return () => window.removeEventListener("pb:image-validation-failed", handler);
        }, [props.imageUrl]);

        return (
          <BlockTabBar blockKey="Image">
            {(tab) => (
              <>
                {/* ── CONTENT TAB ── */}
                {tab === "content" && (
                  <>
                    <ImageField label="Image" value={props.imageUrl ?? ""} onChange={(v) => set("imageUrl", v)} />
                    {showImgError && (
                      <div style={{ color: "#d72c0d", fontSize: 11, marginTop: -4, marginBottom: 6, paddingLeft: 2 }}>
                        Image is required before publishing.
                      </div>
                    )}
                    <StackedTextField label="Alt Text" value={props.altText ?? ""} onChange={(v) => set("altText", v)} placeholder="Describe the image..." />
                    <StackedTextField label="Caption" value={props.caption ?? ""} onChange={(v) => set("caption", v)} placeholder="Optional caption..." />
                    <ImageLinkUrlField value={props.linkUrl ?? ""} onChange={(v) => set("linkUrl", v)} />
                  </>
                )}

                {/* ── STYLE TAB ── */}
                {tab === "style" && (
                  <>
                    <TabSection title="Sizing" />
                    <NumberUnitField
                      label="Width"
                      value={imgWidthVal}
                      unit={imgWidthUnit}
                      onValueChange={(v) => set("imgWidth", imgWidthUnit === "%" ? Math.min(v, 100) : v)}
                      onUnitChange={(u) => { set("imgWidthUnit", u); if (u === "%" && imgWidthVal > 100) set("imgWidth", 100); }}
                      units={["%", "px", "vw"]}
                      min={0} max={imgWidthUnit === "%" ? 100 : 9999} step={1}
                    />
                    <InlineSelect
                      label="Height"
                      value={props.heightMode ?? "auto"}
                      onChange={(v) => set("heightMode", v)}
                      options={[
                        { value: "auto", label: "Auto" },
                        { value: "custom", label: "Custom" },
                      ]}
                    />
                    {isCustomH && (
                      <>
                        <SliderNumberField label="Height (px)" value={props.imgHeight ?? 300} onChange={(v) => set("imgHeight", v)} min={10} max={2000} step={10} unit="px" />
                        <InlineSelect
                          label="Object Fit"
                          value={props.objectFit ?? "cover"}
                          onChange={(v) => set("objectFit", v)}
                          options={[
                            { value: "cover", label: "Cover" },
                            { value: "contain", label: "Contain" },
                            { value: "fill", label: "Fill" },
                          ]}
                        />
                      </>
                    )}

                    <TabSection title="Border" />
                    <InlineSelect
                      label="Border Style"
                      value={borderStyleVal}
                      onChange={(v) => set("borderStyle", v)}
                      options={[
                        { value: "none", label: "None" },
                        { value: "solid", label: "Solid" },
                        { value: "dashed", label: "Dashed" },
                        { value: "dotted", label: "Dotted" },
                      ]}
                    />
                    {borderStyleVal !== "none" && (
                      <>
                        <SliderNumberField label="Border Width (px)" value={props.borderWidth ?? 1} onChange={(v) => set("borderWidth", v)} min={1} max={20} step={1} unit="px" />
                        <ColorPickerField label="Border Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
                        <SliderNumberField label="Border Radius (px)" value={props.borderRadius ?? 0} onChange={(v) => set("borderRadius", v)} min={0} max={200} step={1} unit="px" />
                      </>
                    )}

                    <TabSection title="Effects" />
                    <SliderNumberField label="Opacity (%)" value={props.opacity ?? 100} onChange={(v) => set("opacity", v)} min={0} max={100} step={1} unit="%" />
                    <InlineSelect
                      label="Hover Effect"
                      value={hoverEffectVal}
                      onChange={(v) => set("hoverEffect", v)}
                      options={[
                        { value: "none", label: "None" },
                        { value: "zoom", label: "Zoom" },
                        { value: "grayscale", label: "Grayscale" },
                        { value: "blur", label: "Blur" },
                        { value: "brightness", label: "Brightness" },
                      ]}
                    />
                    {hoverEffectVal === "blur" && (
                      <SliderNumberField label="CSS Blur (px)" value={props.cssBlur ?? 4} onChange={(v) => set("cssBlur", v)} min={1} max={20} step={1} unit="px" />
                    )}
                    {hoverEffectVal === "brightness" && (
                      <SliderNumberField label="CSS Brightness (%)" value={props.cssBrightness ?? 130} onChange={(v) => set("cssBrightness", v)} min={50} max={200} step={5} unit="%" />
                    )}

                    {hasCaption && (
                      <>
                        <TabSection title="Caption Style" />
                        <InlineSelect
                          label="Caption Position"
                          value={captionPosVal}
                          onChange={(v) => set("captionPosition", v)}
                          options={[
                            { value: "below", label: "Below" },
                            { value: "overlay", label: "Overlay" },
                          ]}
                        />
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
                        <ColorPickerField label="Caption Color" value={props.captionColor ?? ""} onChange={(v) => set("captionColor", v)} />
                        <SliderNumberField label="Caption Font Size (px)" value={props.captionFontSize ?? 13} onChange={(v) => set("captionFontSize", v)} min={10} max={32} step={1} unit="px" />
                        {captionPosVal === "overlay" && (
                          <ColorPickerField label="Caption Background" value={props.captionBackground ?? ""} onChange={(v) => set("captionBackground", v)} />
                        )}
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

                    {isLessThan100 && (
                      <>
                        <TabSection title="Image Alignment" />
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

                    <TabSection title="Entrance Animation" />
                    <InlineSelect
                      label="Animation"
                      value={props.entranceAnim ?? "none"}
                      onChange={(v) => set("entranceAnim", v)}
                      options={[
                        { value: "none",     label: "None" },
                        { value: "fade-in",  label: "Fade In" },
                        { value: "slide-up", label: "Slide Up" },
                        { value: "zoom-in",  label: "Zoom In" },
                      ]}
                    />

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
    imgWidth: 100,
    imgWidthUnit: "%",
    heightMode: "auto",
    imgHeight: 300,
    objectFit: "cover",
    borderStyle: "none",
    borderWidth: 1,
    borderColor: "",
    borderRadius: 0,
    opacity: 100,
    hoverEffect: "none",
    cssBlur: 4,
    cssBrightness: 130,
    captionPosition: "below",
    captionColor: "",
    captionFontSize: 13,
    captionBackground: "",
    captionAlign: "center",
    alignment: "left",
    entranceAnim: "none",
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
    imgWidth,
    imgWidthUnit,
    heightMode,
    imgHeight,
    objectFit,
    borderStyle,
    borderWidth,
    borderColor,
    borderRadius,
    opacity,
    hoverEffect,
    cssBlur,
    cssBrightness,
    captionPosition,
    captionColor,
    captionFontSize,
    captionBackground,
    captionAlign,
    alignment,
    entranceAnim,
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
    const [imgLoading, setImgLoading] = useState(true);
    const prevSrc = useRef<string>("");

    useEffect(() => {
      if (imageUrl !== prevSrc.current) {
        setImgLoading(true);
        prevSrc.current = imageUrl;
      }
    }, [imageUrl]);

    const wrapBgStyle: React.CSSProperties = advBgType === "color" && advBgColor
      ? { backgroundColor: advBgColor }
      : {};

    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");

    const imgId = cssId || "img-blk";
    const isCustomH = (heightMode ?? "auto") === "custom";
    const wUnit = imgWidthUnit ?? "%";
    const widthVal = `${imgWidth ?? 100}${wUnit}`;
    const heightVal = isCustomH && imgHeight ? `${imgHeight}px` : "auto";
    const brPx = `${Number(borderRadius) || 0}px`;

    const animCss = entranceAnim && entranceAnim !== "none" ? `
      @keyframes pb-img-fadein{from{opacity:0}to{opacity:1}}
      @keyframes pb-img-slideup{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
      @keyframes pb-img-zoomin{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
      #${imgId}.pb-img-animate{animation:${entranceAnim === "fade-in" ? "pb-img-fadein" : entranceAnim === "slide-up" ? "pb-img-slideup" : "pb-img-zoomin"} 0.5s ease both}
    ` : "";

    const hoverCss = hoverEffect && hoverEffect !== "none" ? `
      #${imgId} .pb-img-inner{overflow:hidden}
      #${imgId} .pb-img-inner img{transition:all 0.35s ease}
      #${imgId}:hover .pb-img-inner img{${
        hoverEffect === "zoom" ? "transform:scale(1.08);" :
        hoverEffect === "grayscale" ? "filter:grayscale(1);" :
        hoverEffect === "blur" ? `filter:blur(${Number(cssBlur) || 4}px);` :
        `filter:brightness(${Number(cssBrightness) || 130}%);`
      }}
    ` : "";

    if (!imageUrl) return (
      <div style={{ padding: 16, textAlign: "center", color: "#9ca3af", fontSize: 14, border: "2px dashed #e5e7eb", borderRadius: brPx }}>
        No image selected. Use the property panel to add an image.
      </div>
    );

    const imgEl = (
      <>
        {imgLoading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6", zIndex: 1 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "pb-img-spin 1s linear infinite" }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
        )}
        <img
          src={imageUrl}
          alt={altText ?? ""}
          loading="lazy"
          onLoad={() => setImgLoading(false)}
          onError={() => setImgLoading(false)}
          style={{
            width: "100%",
            height: heightVal,
            objectFit: isCustomH ? (objectFit as any ?? "cover") : undefined,
            display: "block",
            borderStyle: borderStyle !== "none" ? borderStyle : undefined,
            borderWidth: borderStyle !== "none" ? (borderWidth || 1) : undefined,
            borderColor: borderStyle !== "none" ? (borderColor || "#e5e7eb") : undefined,
            opacity: (opacity ?? 100) / 100,
          }}
        />
      </>
    );

    const captionEl = caption ? (
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
            padding: "6px 0",
            textAlign: captionAlign as any,
            fontStyle: "italic",
          }}>
            {caption}
          </div>
        )
    ) : null;

    const marginL = alignment === "center" || alignment === "right" ? "auto" : undefined;
    const marginR = alignment === "center" || alignment === "left" ? "auto" : undefined;

    return (
      <div
        id={imgId}
        className={[`puck-img-wrap-outer`, entranceAnim && entranceAnim !== "none" ? "pb-img-animate" : "", cssClass].filter(Boolean).join(" ") || undefined}
        style={{
          paddingTop: advPadding?.top ?? 0, paddingRight: advPadding?.right ?? 0,
          paddingBottom: advPadding?.bottom ?? 0, paddingLeft: advPadding?.left ?? 0,
          marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0,
          marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0,
          zIndex: zIndex ?? undefined,
          ...wrapBgStyle,
        }}
      >
        <style>{`@keyframes pb-img-spin{to{transform:rotate(360deg)}}`}{animCss}{hoverCss}{customCss ? `#${imgId}{${customCss}}` : ""}</style>
        <div
          className="pb-img-inner"
          style={{
            display: "block",
            width: widthVal,
            maxWidth: "100%",
            marginLeft: marginL,
            marginRight: marginR,
            position: "relative",
            overflow: "hidden",
            borderRadius: brPx,
          }}
        >
          {linkUrl
            ? <a href={linkUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", position: "relative" }}>{imgEl}</a>
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
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
        };

        return (
          <BlockTabBar blockKey="Space">
            {(tab) => (
              <>
                {/* ── CONTENT TAB ── */}
                {tab === "content" && (
                  <>
                    <SliderNumberField label="Height Desktop (px)" value={props.heightDesktop ?? 32} onChange={(v) => set("heightDesktop", v)} min={0} max={500} step={4} unit="PX" />
                    <SliderNumberField label="Height Tablet (px)"  value={props.heightTablet  ?? 0}  onChange={(v) => set("heightTablet", v)}  min={0} max={500} step={4} unit="PX" />
                    <SliderNumberField label="Height Mobile (px)"  value={props.heightMobile  ?? 0}  onChange={(v) => set("heightMobile", v)}  min={0} max={500} step={4} unit="PX" />
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

  render: ({ id, heightDesktop, heightDesktopUnit, heightTablet, heightTabletUnit, heightMobile, heightMobileUnit, backgroundColor, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex }: any) => {
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const toCssLen = (val: any, unit: any, fallback: string): string => {
      if (val == null || val === "") return fallback;
      const s = String(val);
      if (/[a-z%]+$/i.test(s)) return s; // already has a unit
      return `${s}${unit || "px"}`;
    };
    const hD = toCssLen(heightDesktop, heightDesktopUnit, "32px");
    const hT = toCssLen(heightTablet,  heightTabletUnit,  hD);
    const hM = toCssLen(heightMobile,  heightMobileUnit,  hT);
    const uid = `sp-${id || "x"}`;
    const responsiveCss = `
      .${uid} { height: ${hD}; }
      @media (max-width: 1024px) { .${uid} { height: ${hT}; } }
      @media (max-width: 640px) { .${uid} { height: ${hM}; } }
    `;
    return (
      <div
        id={cssId || undefined}
        className={[uid, cssClass].filter(Boolean).join(" ") || undefined}
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
        const getZoneInfo = () => {
          const state = appState.data;
          let destinationZone = "root:default-zone";
          let destinationIndex = 0;
          const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
          for (const [zone, items] of Object.entries(zones)) {
            const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem?.props?.id);
            if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
          }
          return { destinationZone, destinationIndex };
        };
        const set = (key: string, val: any) => {
          if (!selectedItem) return;
          const { destinationZone, destinationIndex } = getZoneInfo();
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
        };
        const setMany = (patch: Record<string, any>) => {
          if (!selectedItem) return;
          const { destinationZone, destinationIndex } = getZoneInfo();
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), ...patch } } });
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
                    <LinkUrlField value={props.linkUrl ?? ""} onChange={(v) => set("linkUrl", v)} />
                    <InlineSelect
                      label="Icon Type"
                      value={props.iconType ?? "none"}
                      onChange={(v) => setMany({ iconType: v, icon: "" })}
                      options={[
                        { value: "none", label: "None" },
                        { value: "emoji", label: "Emoji" },
                        { value: "svg", label: "SVG" },
                        { value: "image", label: "Upload" },
                      ]}
                    />
                    {props.iconType !== "none" && (
                      props.iconType === "emoji" ? (
                        <StackedTextField label="Icon (emoji)" value={props.icon ?? ""} onChange={(v) => set("icon", v)} placeholder="e.g. 🚀" />
                      ) : props.iconType === "image" ? (
                        <ImageField label="Icon Image" value={props.icon ?? ""} onChange={(v) => set("icon", v)} />
                      ) : (
                        <StackedField label="Icon (SVG code)">
                          <textarea
                            value={props.icon ?? ""}
                            onChange={(e) => set("icon", e.target.value)}
                            placeholder="<svg>...</svg>"
                            style={{ width: "100%", height: 60, padding: "5px 8px", border: "1px solid var(--p-color-border)", borderRadius: "var(--p-border-radius-100, 4px)", fontSize: 12, fontFamily: "monospace", boxSizing: "border-box", outline: "none", resize: "vertical", background: "var(--p-color-bg-surface)", color: "var(--p-color-text)" }}
                          />
                        </StackedField>
                      )
                    )}
                    <ToggleField label="Full Width" value={!!props.fullWidth} onChange={(v) => set("fullWidth", v)} />
                    {!props.fullWidth && (
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
                    )}
                  </>
                )}

                {/* ── STYLE TAB ── */}
                {tab === "style" && (
                  <>
                    <TabSection title="Typography" />
                    <InlineSelect
                      label="Font Family"
                      value={props.fontFamily ?? "inherit"}
                      onChange={(v) => { set("fontFamily", v); loadGoogleFont(v); }}
                      options={[
                        { value: "inherit",                       label: "Theme Default" },
                        { value: "Arial, Helvetica, sans-serif",   label: "Arial" },
                        { value: "Georgia, serif",                 label: "Georgia" },
                        { value: "'Courier New', monospace",       label: "Courier New" },
                        { value: "Impact, sans-serif",             label: "Impact" },
                        { value: "Inter, sans-serif",              label: "Inter" },
                        { value: "Poppins, sans-serif",            label: "Poppins" },
                        { value: "'Roboto Serif', serif",          label: "Roboto Serif" },
                        { value: "'New York', 'New York Small', 'Times New Roman', serif", label: "New York" },
                        { value: "'Open Sans', sans-serif",        label: "Open Sans" },
                      ]}
                    />
                    <SliderNumberField label="Font Size (px)" value={props.fontSize ?? 16} onChange={(v) => set("fontSize", v)} min={8} max={64} step={1} unit="px" />
                    <InlineSelect
                      label="Font Weight"
                      value={String(props.fontWeight ?? "400")}
                      onChange={(v) => set("fontWeight", v)}
                      options={[
                        { value: "400", label: "Normal" },
                        { value: "600", label: "Semi Bold" },
                        { value: "900", label: "Bold" },
                      ]}
                    />
                    <InlineSelect
                      label="Text Transform"
                      value={props.textTransform ?? "capitalize"}
                      onChange={(v) => set("textTransform", v)}
                      options={[
                        { value: "capitalize", label: "Capitalize" },
                        { value: "uppercase", label: "Uppercase" },
                        { value: "lowercase", label: "Lowercase" },
                      ]}
                    />
                    <SliderNumberField label="Letter Spacing (px)" value={props.letterSpacing ?? 0} onChange={(v) => set("letterSpacing", v)} min={-5} max={20} step={0.5} unit="px" />

                    {props.iconType !== "none" && (
                      <>
                        <TabSection title="Icon" />
                        <InlineSelect
                          label="Icon Position"
                          value={props.iconPosition ?? "before"}
                          onChange={(v) => set("iconPosition", v)}
                          options={[
                            { value: "before", label: "Before Label" },
                            { value: "after", label: "After Label" },
                          ]}
                        />
                        {props.iconType === "emoji" && (
                          <SliderNumberField label="Icon Size (px)" value={props.iconSize ?? 20} onChange={(v) => set("iconSize", v)} min={10} max={80} step={1} unit="px" />
                        )}
                        {(props.iconType === "svg" || props.iconType === "image") && (
                          <>
                            <SliderNumberField label="Icon Width (px)" value={props.iconWidth ?? 20} onChange={(v) => set("iconWidth", v)} min={10} max={100} step={1} unit="px" />
                            <SliderNumberField label="Icon Height (px)" value={props.iconHeight ?? 20} onChange={(v) => set("iconHeight", v)} min={10} max={100} step={1} unit="px" />
                          </>
                        )}
                        {props.iconType === "svg" && (
                          <>
                            <ColorPickerField label="Icon Color" value={props.iconColor ?? ""} onChange={(v) => set("iconColor", v)} />
                            <ColorPickerField label="Icon Hover Color" value={props.iconHoverColor ?? ""} onChange={(v) => set("iconHoverColor", v)} />
                          </>
                        )}
                        <SliderNumberField label="Icon Gap (px)" value={props.iconGap ?? 8} onChange={(v) => set("iconGap", v)} min={0} max={40} step={1} unit="px" />
                      </>
                    )}

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
                        <SliderNumberField label="Border Width (px)" value={props.borderWidth ?? 2} onChange={(v) => set("borderWidth", v)} min={1} max={10} step={1} unit="px" />
                        <ColorPickerField label="Border Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
                      </>
                    )}
                    <SliderNumberField label="Border Radius (px)" value={typeof props.borderRadius === "number" ? props.borderRadius : 6} onChange={(v) => set("borderRadius", v)} min={0} max={100} step={1} unit="PX" />

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

                    <TabSection title="Entrance Animation" />
                    <InlineSelect
                      label="Animation"
                      value={props.entranceAnimation ?? "none"}
                      onChange={(v) => set("entranceAnimation", v)}
                      options={[
                        { value: "none",        label: "None" },
                        { value: "fadeIn",       label: "Fade In" },
                        { value: "fadeInUp",     label: "Fade In Up" },
                        { value: "fadeInDown",   label: "Fade In Down" },
                        { value: "slideInLeft",  label: "Slide In Left" },
                        { value: "slideInRight", label: "Slide In Right" },
                        { value: "zoomIn",       label: "Zoom In" },
                        { value: "bounce",       label: "Bounce" },
                      ]}
                    />
                    {(props.entranceAnimation && props.entranceAnimation !== "none") && (
                      <>
                        <SliderNumberField label="Duration (ms)" value={props.animDuration ?? 600} onChange={(v) => set("animDuration", v)} min={100} max={2000} step={50} unit="MS" />
                        <SliderNumberField label="Delay (ms)" value={props.animDelay ?? 0} onChange={(v) => set("animDelay", v)} min={0} max={3000} step={50} unit="MS" />
                      </>
                    )}

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

                    <SliderNumberField label="Opacity (%)" value={props.opacity ?? 100} onChange={(v) => set("opacity", v)} min={0} max={100} step={1} unit="%" />
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
    linkTarget: "_blank",
    iconType: "none",
    icon: "",
    iconPosition: "before",
    iconSize: 20,
    iconWidth: 20,
    iconHeight: 20,
    iconColor: "",
    iconHoverColor: "",
    iconGap: 8,
    fullWidth: false,
    alignment: "left",
    fontFamily: "inherit",
    fontSize: null,
    fontWeight: "400",
    textTransform: "capitalize",
    letterSpacing: null,
    textColor: "#ffffff",
    bgColor: "var(--primary-color, #0158ad)",
    borderStyle: "none",
    borderWidth: 2,
    borderColor: "",
    borderRadius: 6,
    hoverTextColor: "",
    hoverBgColor: "",
    hoverBorderColor: "",
    hoverAnimation: "none",
    entranceAnimation: "none",
    animDuration: 600,
    animDelay: 0,
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
    iconType,
    icon,
    iconPosition,
    iconSize,
    iconWidth,
    iconHeight,
    iconColor,
    iconHoverColor,
    iconGap,
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
    entranceAnimation,
    animDuration,
    animDelay,
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
  }: any) => {
    const sizeMap: Record<string, React.CSSProperties> = {
      small:  { paddingTop: 8,  paddingRight: 16, paddingBottom: 8,  paddingLeft: 16 },
      medium: { paddingTop: 12, paddingRight: 24, paddingBottom: 12, paddingLeft: 24 },
      large:  { paddingTop: 16, paddingRight: 32, paddingBottom: 16, paddingLeft: 32 },
      custom: customPadding ? { paddingTop: customPadding.top, paddingRight: customPadding.right, paddingBottom: customPadding.bottom, paddingLeft: customPadding.left } : {},
    };

    const padding = sizeMap[sizePreset ?? "medium"] ?? sizeMap.medium;

    // Numeric borderRadius → px string; string passthrough for legacy values; 0 means sharp corners
    const borderRadiusValue = typeof borderRadius === "number" ? `${borderRadius}px` : (borderRadius != null && borderRadius !== "" ? borderRadius : "6px");

    const btnClass = `puck-btn-${cssId || "b"}`;

    // Entrance animation keyframes
    const entranceFromMap: Record<string, string> = {
      fadeIn:       "opacity:0",
      fadeInUp:     "opacity:0;transform:translateY(20px)",
      fadeInDown:   "opacity:0;transform:translateY(-20px)",
      slideInLeft:  "opacity:0;transform:translateX(-30px)",
      slideInRight: "opacity:0;transform:translateX(30px)",
      zoomIn:       "opacity:0;transform:scale(0.85)",
      bounce:       "opacity:0;transform:translateY(-20px)",
    };
    const anim = entranceAnimation && entranceAnimation !== "none" ? entranceAnimation : null;
    const animCss = anim && entranceFromMap[anim] ? `
      @keyframes puck-btn-${anim} { from{${entranceFromMap[anim]}} to{opacity:1;transform:none} }
      .${btnClass}-wrap { animation: puck-btn-${anim} ${animDuration ?? 600}ms ease ${animDelay ?? 0}ms both; }
    ` : "";

    const hoverCss = `
      .${btnClass}:hover {
        ${hoverTextColor ? `color: ${hoverTextColor} !important;` : ""}
        ${hoverBgColor ? `background: ${hoverBgColor} !important;` : ""}
        ${hoverBorderColor ? `border-color: ${hoverBorderColor} !important;` : ""}
        ${hoverAnimation === "grow" ? "transform: scale(1.05);" : ""}
        ${hoverAnimation === "shrink" ? "transform: scale(0.96);" : ""}
        ${hoverAnimation === "pulse" ? "animation: puck-pulse 0.6s ease;" : ""}
      }
      ${iconType === "svg" && iconHoverColor ? `.${btnClass}:hover svg { color: ${iconHoverColor} !important; fill: ${iconHoverColor} !important; }` : ""}
      .${btnClass} { transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease, transform 0.2s ease, opacity 0.2s ease; }
      @keyframes puck-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
    `;

    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const wrapBg = advBgType === "color" && advBgColor ? { backgroundColor: advBgColor } : {};

    const showIcon = iconType !== "none" && icon;
    const iconEl = showIcon && (
      iconType === "emoji" ? (
        <span style={{ fontSize: iconSize ?? 20, lineHeight: 1 }}>{icon}</span>
      ) : iconType === "image" ? (
        <img src={icon} alt="" style={{ width: iconWidth ?? 20, height: iconHeight ?? 20, objectFit: "contain", display: "block", flexShrink: 0 }} />
      ) : icon && icon.trimStart().startsWith("<svg") ? (
        <span
          style={{ display: "inline-flex", alignItems: "center", width: iconWidth ?? 20, height: iconHeight ?? 20, flexShrink: 0, color: iconColor || "currentColor", fill: iconColor || "currentColor" }}
          dangerouslySetInnerHTML={{ __html: icon.replace(/<svg\b/, `<svg style="width:${iconWidth ?? 20}px;height:${iconHeight ?? 20}px;color:${iconColor || "currentColor"};fill:${iconColor || "currentColor"}"`) }}
        />
      ) : (
        <svg
          width={iconWidth ?? 20}
          height={iconHeight ?? 20}
          viewBox="0 0 24 24"
          dangerouslySetInnerHTML={{ __html: icon }}
          style={{ color: iconColor || "currentColor", fill: "currentColor" }}
        />
      )
    );

    const btnEl = (
      <button
        className={btnClass}
        style={{
          display: fullWidth ? "flex" : "inline-flex",
          width: fullWidth ? "100%" : undefined,
          alignItems: "center",
          justifyContent: "center",
          gap: showIcon ? (iconGap ?? 8) : 0,
          ...padding,
          fontFamily: fontFamily && fontFamily !== "inherit" ? fontFamily : "var(--font-family)",
          fontSize: fontSize ? `${fontSize}px` : undefined,
          fontWeight: fontWeight ?? "400",
          textTransform: (textTransform ?? "capitalize") as any,
          letterSpacing: letterSpacing != null ? `${letterSpacing}px` : undefined,
          color: textColor || "#fff",
          background: bgColor || "var(--primary-color, #0158ad)",
          border: borderStyle !== "none" ? `${borderWidth ?? 2}px ${borderStyle} ${borderColor || "transparent"}` : "none",
          borderRadius: borderRadiusValue,
          cursor: "pointer",
          opacity: opacity != null ? opacity / 100 : 1,
          textDecoration: "none",
        }}
      >
        {showIcon && iconPosition === "before" && iconEl}
        {label || "Button"}
        {showIcon && iconPosition === "after" && iconEl}
      </button>
    );

    return (
      <div
        id={cssId || undefined}
        className={[cssClass].filter(Boolean).join(" ") || undefined}
        style={{ textAlign: !fullWidth ? (alignment as any) : undefined, zIndex: zIndex ?? undefined, marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0, marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0, ...wrapBg }}
      >
        <style>{animCss}{hoverCss}{customCss ? `.${btnClass} { ${customCss} }` : ""}</style>
        {/* key on anim+duration+delay forces remount → replays animation in editor when settings change */}
        <div className={`${btnClass}-wrap`} key={`${anim}-${animDuration}-${animDelay}`} style={{ display: fullWidth ? "block" : "inline-block" }}>
          {linkUrl
            ? <a href={linkUrl} target={linkTarget ?? "_blank"} rel="noopener noreferrer" style={{ textDecoration: "none", display: fullWidth ? "block" : "inline-block" }}>{btnEl}</a>
            : btnEl
          }
        </div>
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
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
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
                            { value: "image", label: "Image" },
                          ]}
                        />
                        {props.elementType === "text"
                          ? <StackedTextField label="Text" value={props.elementText ?? ""} onChange={(v) => set("elementText", v)} placeholder="OR" />
                          : props.elementType === "image"
                          ? <ImageField label="Image" value={props.elementImage ?? ""} onChange={(v) => set("elementImage", v)} />
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
                        <SliderUnitField
                          label="Width"
                          value={props.lineWidthVal ?? 100}
                          unit={props.lineWidthUnit ?? "%"}
                          onValueChange={(v) => set("lineWidthVal", v)}
                          onUnitChange={(u) => set("lineWidthUnit", u)}
                          units={["%", "px", "vw"]}
                          step={1}
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
                      </>
                    )}
                  </>
                )}

                {/* ── STYLE TAB ── */}
                {tab === "style" && (
                  <>
                    <TabSection title="Line" />
                    <SliderNumberField label="Thickness (px)" value={props.thickness ?? 1} onChange={(v) => set("thickness", v)} min={1} max={20} step={1} unit="px" />
                    {(props.lineStyle ?? "solid") !== "gradient" && (
                      <ColorPickerField label="Color" value={props.lineColor ?? ""} onChange={(v) => set("lineColor", v)} />
                    )}
                    {(props.lineStyle ?? "solid") === "gradient" && (
                      <>
                        <ColorPickerField label="Start Color" value={props.gradientStart ?? "#e5e7eb"} onChange={(v) => set("gradientStart", v)} />
                        <ColorPickerField label="End Color"   value={props.gradientEnd   ?? "#e5e7eb"} onChange={(v) => set("gradientEnd", v)} />
                      </>
                    )}
                    <SliderNumberField label="Gap (px)" value={props.gap ?? 16} onChange={(v) => set("gap", v)} min={0} max={120} step={1} unit="px" />

                    {hasElement && (
                      <>
                        <TabSection title="Icon / Text Style" />
                        {(props.elementType ?? "icon") !== "image" && (
                          <>
                            <SliderNumberField label="Icon Size (px)" value={props.iconSize ?? 20} onChange={(v) => set("iconSize", v)} min={10} max={80} step={1} unit="px" />
                            <ColorPickerField label="Icon Color" value={props.iconColor ?? ""} onChange={(v) => set("iconColor", v)} />
                            <ColorPickerField label="Text Color" value={props.elementTextColor ?? ""} onChange={(v) => set("elementTextColor", v)} />
                            <SliderNumberField label="Text Font Size (px)" value={props.elementFontSize ?? 14} onChange={(v) => set("elementFontSize", v)} min={10} max={48} step={1} unit="px" />
                          </>
                        )}
                        {(props.elementType ?? "icon") === "image" && (
                          <>
                            <SliderNumberField label="Image Width (px)" value={props.elementImageWidth ?? 40} onChange={(v) => set("elementImageWidth", v)} min={8} max={300} step={1} unit="px" />
                            <SliderNumberField label="Image Height (px)" value={props.elementImageHeight ?? 40} onChange={(v) => set("elementImageHeight", v)} min={8} max={300} step={1} unit="px" />
                            <SliderNumberField label="Image Border Radius (px)" value={props.elementImageRadius ?? 0} onChange={(v) => set("elementImageRadius", v)} min={0} max={150} step={1} unit="px" />
                          </>
                        )}
                        <SliderNumberField label="Spacing from Line (px)" value={props.elementSpacing ?? 12} onChange={(v) => set("elementSpacing", v)} min={0} max={60} step={1} unit="px" />
                      </>
                    )}
                  </>
                )}

                {/* ── ADVANCED TAB ── */}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />

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
    elementImage: "",
    elementImageWidth: 40,
    elementImageHeight: 40,
    elementImageRadius: 0,
    elementPosition: "center",
    thickness: 1,
    lineColor: "",
    gradientStart: "#e5e7eb",
    gradientEnd: "#e5e7eb",
    gap: 16,
    iconSize: 20,
    iconColor: "",
    elementTextColor: "",
    elementFontSize: 14,
    elementSpacing: 12,
    advMargin: { top: 0, right: 0, bottom: 0, left: 0 },
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
    elementImage,
    elementImageWidth,
    elementImageHeight,
    elementImageRadius,
    elementPosition,
    thickness,
    lineColor,
    gradientStart,
    gradientEnd,
    gap,
    iconSize,
    iconColor,
    elementTextColor,
    elementFontSize,
    elementSpacing,
    advMargin,
    hideDesktop,
    hideTablet,
    hideMobile,
    cssId,
    cssClass,
    zIndex,
  }: any) => {
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const color = lineColor || "#e5e7eb";
    const th = Number(thickness) || 1;

    const lineEl = (style: React.CSSProperties) => {
      if (lineStyle === "gradient") {
        const c1 = gradientStart || "#e5e7eb";
        const c2 = gradientEnd   || "#e5e7eb";
        return <div style={{ flex: 1, height: th, background: `linear-gradient(90deg, ${c1}, ${c2})`, alignSelf: "center", ...style }} />;
      }
      if (lineStyle === "shadow") {
        return <div style={{ flex: 1, height: th * 4, background: `radial-gradient(ellipse at 50% 0%, ${color} 0%, transparent 70%)`, alignSelf: "center", ...style }} />;
      }
      if (lineStyle === "wave") {
        const h = Math.max(th * 6, 12);
        const mid = h / 2;
        return (
          <div style={{ flex: 1, height: h, overflow: "visible", alignSelf: "center", ...style }}>
            <svg width="100%" height={h} viewBox={`0 0 600 ${h}`} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d={`M0,${mid} C15,${mid - mid * 0.8} 15,${mid + mid * 0.8} 30,${mid} S45,${mid - mid * 0.8} 60,${mid} S75,${mid + mid * 0.8} 90,${mid} S105,${mid - mid * 0.8} 120,${mid} S135,${mid + mid * 0.8} 150,${mid} S165,${mid - mid * 0.8} 180,${mid} S195,${mid + mid * 0.8} 210,${mid} S225,${mid - mid * 0.8} 240,${mid} S255,${mid + mid * 0.8} 270,${mid} S285,${mid - mid * 0.8} 300,${mid} S315,${mid + mid * 0.8} 330,${mid} S345,${mid - mid * 0.8} 360,${mid} S375,${mid + mid * 0.8} 390,${mid} S405,${mid - mid * 0.8} 420,${mid} S435,${mid + mid * 0.8} 450,${mid} S465,${mid - mid * 0.8} 480,${mid} S495,${mid + mid * 0.8} 510,${mid} S525,${mid - mid * 0.8} 540,${mid} S555,${mid + mid * 0.8} 570,${mid} S585,${mid - mid * 0.8} 600,${mid}`} fill="none" stroke={color} strokeWidth={th} vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        );
      }
      if (lineStyle === "zigzag") {
        const h = Math.max(th * 6, 12);
        const pts = Array.from({ length: 61 }, (_, i) => `${i * 10},${i % 2 === 0 ? h : 0}`).join(" ");
        return (
          <div style={{ flex: 1, height: h, overflow: "visible", alignSelf: "center", ...style }}>
            <svg width="100%" height={h} viewBox={`0 0 600 ${h}`} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points={pts} fill="none" stroke={color} strokeWidth={th} vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        );
      }
      return <div style={{ flex: 1, borderTop: `${th}px ${lineStyle || "solid"} ${color}`, alignSelf: "center", ...style }} />;
    };

    const iconVal = (elementIcon as string) || "";
    const hasIconContent = elementType === "text" ? true : elementType === "image" ? !!(elementImage as string) : !!iconVal.trim();
    const elementContent = showElement && hasIconContent
      ? (
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0, padding: `0 ${elementSpacing ?? 12}px` }}>
          {elementType === "text"
            ? <span style={{ fontSize: elementFontSize || 14, color: elementTextColor || color, whiteSpace: "nowrap" }}>{elementText || "OR"}</span>
            : elementType === "image"
            ? <img src={elementImage as string} alt="" style={{ width: elementImageWidth || 40, height: elementImageHeight || 40, objectFit: "contain", display: "block", borderRadius: `${elementImageRadius ?? 0}px` }} />
            : <span style={{ fontSize: iconSize || 20, color: iconColor || color, lineHeight: 1 }}>{iconVal}</span>
          }
        </div>
      )
      : null;

    const lineWidthCss = `${lineWidthVal ?? 100}${lineWidthUnit ?? "%"}`;
    const outerJustify = showElement
      ? (alignment === "right" ? "flex-end" : alignment === "left" ? "flex-start" : "center")
      : "center";

    const lineWrap = showElement && elementContent
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
        className={[cssClass].filter(Boolean).join(" ") || undefined}
        style={{
          paddingTop: gap ?? 16,
          paddingBottom: gap ?? 16,
          marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0,
          marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0,
          display: "flex",
          justifyContent: outerJustify,
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
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              borderRadius: 6,
              overflow: "hidden",
              border: "1px solid var(--p-color-border-subdued)",
              backgroundColor: "#000",
            }}
          >
            <video
              src={value}
              controls
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "240px",
                display: "block",
              }}
            />
          </div>
          <div style={{ padding: "8px", background: "#f3f4f6", borderRadius: 4, fontSize: 11, color: "#374151", wordBreak: "break-all" }}>
            <strong>Uploaded:</strong> {value.split("/").pop()}
          </div>
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
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
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
                    <ToggleField label="Autoplay" value={!!props.autoplay} onChange={(v) => set("autoplay", v)} />
                    <ToggleField label="Loop" value={!!props.loop} onChange={(v) => set("loop", v)} />
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
                      ]}
                    />
                    <SliderUnitField
                      label="Width"
                      value={props.videoWidthVal ?? 100}
                      unit="%"
                      onValueChange={(v) => set("videoWidthVal", v)}
                      onUnitChange={() => {}}
                      units={["%"]}
                      step={1}
                    />

                    <TabSection title="Border" />
                    <SliderNumberField label="Border Radius (px)" value={props.borderRadius ?? 0} onChange={(v) => set("borderRadius", v)} min={0} max={100} step={1} unit="px" />
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
    autoplay: false,
    loop: false,
    controls: "show",
    playInline: true,
    aspectRatio: "16:9",
    videoWidthVal: 100,
    videoWidthUnit: "%",
    playBtnStyle: "default",
    playIconSize: 64,
    playIconColor: "#fff",
    playBtnBg: "rgba(0,0,0,0.5)",
    playBtnRadius: 50,
    borderRadius: 0,
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
    autoplay,
    loop,
    controls,
    playInline,
    aspectRatio,
    videoWidthVal,
    videoWidthUnit,
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

    const ratioMap: Record<string, string> = { "16:9": "56.25%", "4:3": "75%", "1:1": "100%" };
    const paddingBottom = ratioMap[aspectRatio ?? "16:9"] ?? "56.25%";
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");

    const buildEmbedUrl = (forcePlay = false) => {
      if (!videoUrl) return "";
      if (sourceType === "youtube") {
        const match = videoUrl.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
        const id = match?.[1] ?? "";
        const params = new URLSearchParams();
        if (autoplay || forcePlay) params.set("autoplay", "1");
        if (loop) { params.set("loop", "1"); params.set("playlist", id); }
        params.set("mute", "1"); // always muted
        if (controls === "hide") params.set("controls", "0");
        return `https://www.youtube.com/embed/${id}?${params.toString()}`;
      }
      if (sourceType === "vimeo") {
        const match = videoUrl.match(/vimeo\.com\/(\d+)/);
        const id = match?.[1] ?? "";
        const params = new URLSearchParams();
        if (autoplay || forcePlay) params.set("autoplay", "1");
        if (loop) params.set("loop", "1");
        params.set("muted", "1"); // always muted
        if (controls === "hide") params.set("controls", "0");
        return `https://player.vimeo.com/video/${id}?${params.toString()}`;
      }
      return videoUrl;
    };

    const isNative = sourceType === "self" || sourceType === "upload";
    const btnSize = playIconSize || 64;
    const btnBg = playBtnBg || "rgba(0,0,0,0.5)";
    const btnRadius = playBtnStyle === "custom" ? `${playBtnRadius ?? 50}px` : "50%";
    const btnColor = playIconColor || "#fff";

    const containerStyle: React.CSSProperties = {
      position: "relative",
      width: `${videoWidthVal ?? 100}%`,
      paddingBottom,
      height: 0,
      overflow: "hidden",
      borderRadius: `${borderRadius ?? 0}px`,
      backgroundColor: "#000",
    };

    if (!videoUrl) return (
      <div style={{ padding: 24, border: "2px dashed #e5e7eb", borderRadius: 8, color: "#9ca3af", fontSize: 14, textAlign: "center" }}>
        No video URL set. Use the property panel to add a video.
      </div>
    );

    const playOverlayBtn = (
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ width: btnSize, height: btnSize, backgroundColor: btnBg, borderRadius: btnRadius, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={btnSize * 0.4} height={btnSize * 0.4} viewBox="0 0 24 24" fill={btnColor}>
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
    );

    const videoEl = videoUrl ? (
      isNative ? (
        <video
          key={videoUrl}
          src={videoUrl}
          autoPlay={playing || autoplay}
          loop={loop}
          muted
          controls={controls !== "hide"}
          playsInline={playInline !== false}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <iframe
          src={buildEmbedUrl(playing)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    ) : null;

    void playOverlayBtn; void setPlaying;

    return (
      <div
        id={cssId || undefined}
        className={[cssClass].filter(Boolean).join(" ") || undefined}
        style={{
          paddingTop: advPadding?.top ?? 0, paddingRight: advPadding?.right ?? 0,
          paddingBottom: advPadding?.bottom ?? 0, paddingLeft: advPadding?.left ?? 0,
          marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0,
          marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0,
          zIndex: zIndex ?? undefined,
        }}
      >
        <div style={containerStyle}>
          {videoEl}
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
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
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
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                      {SOCIAL_PLATFORMS.map((pl, i) => {
                        const isOn = enabled.includes(pl.key);
                        return (
                          <div key={pl.key}>
                            {/* Platform row: name left, toggle right */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
                              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--p-color-text)" }}>{pl.label}</span>
                              <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", flexShrink: 0 }}>
                                <input
                                  type="checkbox"
                                  checked={isOn}
                                  onChange={(e) => set("enabled", e.target.checked ? [...enabled, pl.key] : enabled.filter(k => k !== pl.key))}
                                  style={{ display: "none" }}
                                />
                                <span style={{
                                  display: "inline-block", width: 32, height: 18, borderRadius: 9,
                                  background: isOn ? "#1a1a1a" : "#d1d5db",
                                  position: "relative", transition: "background 0.15s",
                                }}>
                                  <span style={{
                                    position: "absolute", top: 2, left: isOn ? 16 : 2,
                                    width: 14, height: 14, borderRadius: "50%", background: "#fff",
                                    transition: "left 0.15s",
                                  }} />
                                </span>
                              </label>
                            </div>
                            {/* URL input only when enabled */}
                            {isOn && (
                              <div style={{ paddingBottom: 6 }}>
                                <input
                                  type="url"
                                  value={urls[pl.key] ?? ""}
                                  placeholder={`${pl.label} URL…`}
                                  onChange={(e) => set("urls", { ...urls, [pl.key]: e.target.value })}
                                  style={{
                                    width: "100%", padding: "4px 8px", fontSize: 12, boxSizing: "border-box",
                                    border: "1px solid var(--p-color-border)", borderRadius: 4,
                                    background: "var(--p-color-bg-surface)", color: "var(--p-color-text)",
                                    outline: "none",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <ToggleField label="Open in New Tab" value={props.newTab !== false} onChange={(v) => set("newTab", v)} />
                  </>
                )}
                {tab === "style" && (
                  <>
                    <TabSection title="Icons" />
                    <InlineSelect label="Icon Style" value={props.iconStyle ?? "filled"} onChange={(v) => set("iconStyle", v)} options={[{ value: "filled", label: "Filled" }, { value: "outlined", label: "Outlined" }, { value: "minimal", label: "Minimal" }, { value: "branded", label: "Branded" }]} />
                    <SliderNumberField label="Icon Size (px)" value={props.iconSize ?? 24} onChange={(v) => set("iconSize", v)} min={10} max={80} step={1} unit="px" />
                    <ColorPickerField label="Icon Color" value={props.iconColor ?? ""} onChange={(v) => set("iconColor", v)} />
                    <ColorPickerField label="Icon Hover Color" value={props.iconHoverColor ?? ""} onChange={(v) => set("iconHoverColor", v)} />
                    <SliderNumberField label="Spacing Between (px)" value={props.iconSpacing ?? 12} onChange={(v) => set("iconSpacing", v)} min={0} max={80} step={1} unit="px" />
                    <TabSection title="Background" />
                    <ColorPickerField label="Background Color" value={props.iconBgColor ?? ""} onChange={(v) => set("iconBgColor", v)} />
                    <ColorPickerField label="Hover Background" value={props.iconHoverBg ?? ""} onChange={(v) => set("iconHoverBg", v)} />
                    <InlineSelect label="Background Shape" value={props.bgShape ?? "none"} onChange={(v) => set("bgShape", v)} options={[{ value: "none", label: "None" }, { value: "circle", label: "Circle" }, { value: "square", label: "Square" }, { value: "rounded", label: "Rounded" }]} />
                    <SliderNumberField label="Background Size (px)" value={props.bgSize ?? 40} onChange={(v) => set("bgSize", v)} min={16} max={120} step={1} unit="px" />
                    <TabSection title="Border" />
                    <InlineSelect label="Border Style" value={props.borderStyle ?? "none"} onChange={(v) => set("borderStyle", v)} options={[{ value: "none", label: "None" }, { value: "solid", label: "Solid" }]} />
                    {props.borderStyle === "solid" && (
                      <>
                        <SliderNumberField label="Border Width (px)" value={props.borderWidth ?? 1} onChange={(v) => set("borderWidth", v)} min={1} max={10} step={1} unit="px" />
                        <ColorPickerField label="Border Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
                        <SliderNumberField label="Border Radius (px)" value={props.borderRadius ?? 0} onChange={(v) => set("borderRadius", v)} min={0} max={50} step={1} unit="px" />
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
    iconStyle: "filled", iconSize: 24, iconColor: "", iconHoverColor: "", iconSpacing: 12,
    iconBgColor: "", iconHoverBg: "", bgShape: "circle", bgSize: 40,
    borderStyle: "none", borderWidth: 1, borderColor: "", borderRadius: 0,
    alignment: "left",
    advBgType: "none", advBgColor: "", advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 8, right: 0, bottom: 8, left: 0 },
    hideDesktop: false, hideTablet: false, hideMobile: false, cssId: "", cssClass: "", zIndex: null,
  },
  render: ({ enabled, urls, newTab, iconStyle, iconSize, iconColor, iconHoverColor, iconSpacing, iconBgColor, iconHoverBg, bgShape, bgSize, borderStyle, borderWidth, borderColor, borderRadius, alignment, advBgType, advBgColor, advMargin, advPadding, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex }) => {
    const id = cssId || `social-icons-blk`;
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const sz = Number(iconSize) || 24;
    const bgsz = Number(bgSize) || 40;
    const spacing = Number(iconSpacing) ?? 12;
    const shapeRadius = bgShape === "circle" ? "50%" : bgShape === "rounded" ? "10px" : bgShape === "square" ? "0px" : undefined;
    const isOutlined = iconStyle === "outlined";
    const isMinimal = iconStyle === "minimal";
    const isBranded = iconStyle === "branded";
    const hoverCss = (iconHoverColor || iconHoverBg) ? `#${id} a:hover .puck-si { ${iconHoverColor ? `color: ${iconHoverColor} !important;` : ""} ${iconHoverBg ? `background: ${iconHoverBg} !important;` : ""} transition: all 0.2s; } #${id} a .puck-si { transition: all 0.2s; }` : "";
    const platforms = SOCIAL_PLATFORMS.filter(p => (enabled ?? []).includes(p.key));
    return (
      <div id={id} className={[cssClass].filter(Boolean).join(" ") || undefined} style={{ paddingTop: advPadding?.top ?? 8, paddingRight: advPadding?.right ?? 0, paddingBottom: advPadding?.bottom ?? 8, paddingLeft: advPadding?.left ?? 0, marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0, marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0, zIndex: zIndex ?? undefined, ...(advBgType === "color" && advBgColor ? { backgroundColor: advBgColor } : {}) }}>
        {hoverCss && <style>{hoverCss}</style>}
        <div style={{ display: "flex", gap: spacing, flexWrap: "wrap", justifyContent: alignment === "center" ? "center" : alignment === "right" ? "flex-end" : "flex-start" }}>
          {platforms.map(p => {
            const url = (urls as any)?.[p.key];
            const resolvedColor = isBranded
              ? (bgShape !== "none" ? "#fff" : p.brandColor)
              : isOutlined
              ? (iconColor || p.brandColor)
              : isMinimal
              ? (iconColor || p.brandColor)
              : (iconColor || "currentColor");
            const bgColor = isMinimal
              ? undefined
              : bgShape !== "none"
              ? (isBranded ? p.brandColor : (iconBgColor || "#e5e7eb"))
              : isOutlined
              ? "transparent"
              : undefined;
            const borderW = isOutlined ? 2 : (borderStyle === "solid" ? (borderWidth || 1) : 0);
            const borderC = isOutlined ? (iconColor || p.brandColor) : (borderColor || resolvedColor);
            const hasContainer = bgShape !== "none" || isOutlined;
            const innerStyle: React.CSSProperties = {
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: hasContainer ? bgsz : sz,
              height: hasContainer ? bgsz : sz,
              backgroundColor: bgColor,
              borderRadius: isOutlined ? (shapeRadius ?? "8px") : shapeRadius,
              ...(borderW > 0 ? { borderWidth: borderW, borderStyle: "solid", borderColor: borderC, boxSizing: "border-box" } : {}),
              color: resolvedColor,
              flexShrink: 0,
            };
            const svgIcon = (
              <span style={{ width: sz, height: sz, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: sz }}>
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
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
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
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                      {SHARE_PLATFORMS.map((pl, i) => {
                        const isOn = enabled.includes(pl.key);
                        return (
                          <div key={pl.key}>
                            {/* Platform row: name left, toggle right */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
                              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--p-color-text)" }}>{pl.label}</span>
                              <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", flexShrink: 0 }}>
                                <input
                                  type="checkbox"
                                  checked={isOn}
                                  onChange={(e) => set("enabled", e.target.checked ? [...enabled, pl.key] : enabled.filter(k => k !== pl.key))}
                                  style={{ display: "none" }}
                                />
                                <span style={{
                                  display: "inline-block", width: 32, height: 18, borderRadius: 9,
                                  background: isOn ? "#1a1a1a" : "#d1d5db",
                                  position: "relative", transition: "background 0.15s",
                                }}>
                                  <span style={{
                                    position: "absolute", top: 2, left: isOn ? 16 : 2,
                                    width: 14, height: 14, borderRadius: "50%", background: "#fff",
                                    transition: "left 0.15s",
                                  }} />
                                </span>
                              </label>
                            </div>
                            {/* Custom label input only when enabled */}
                            {isOn && (
                              <div style={{ paddingBottom: 6 }}>
                                <input
                                  type="text"
                                  value={labels[pl.key] ?? pl.label}
                                  placeholder={pl.label}
                                  onChange={(e) => set("labels", { ...labels, [pl.key]: e.target.value })}
                                  style={{
                                    width: "100%", padding: "4px 8px", fontSize: 12, boxSizing: "border-box",
                                    border: "1px solid var(--p-color-border)", borderRadius: 4,
                                    background: "var(--p-color-bg-surface)", color: "var(--p-color-text)",
                                    outline: "none",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
                {tab === "style" && (
                  <>
                    <TabSection title="Button Style" />
                    <InlineSelect label="Style" value={props.btnStyle ?? "icon-text"} onChange={(v) => set("btnStyle", v)} options={[{ value: "icon-only", label: "Icon Only" }, { value: "icon-text", label: "Icon + Text" }, { value: "text-only", label: "Text Only" }]} />
                    <InlineSelect label="Size" value={props.btnSize ?? "medium"} onChange={(v) => set("btnSize", v)} options={[{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }]} />
                    <SliderNumberField label="Border Radius (px)" value={props.borderRadius ?? 6} onChange={(v) => set("borderRadius", v)} min={0} max={50} step={1} unit="px" />
                    <SliderNumberField label="Spacing Between (px)" value={props.spacing ?? 8} onChange={(v) => set("spacing", v)} min={0} max={60} step={1} unit="px" />
                    <TabSection title="Colors" />
                    <ColorPickerField label="Icon Color" value={props.iconColor ?? ""} onChange={(v) => set("iconColor", v)} />
                    <ColorPickerField label="Text Color" value={props.textColor ?? ""} onChange={(v) => set("textColor", v)} />
                    <ColorPickerField label="Background Color" value={props.bgColor ?? ""} onChange={(v) => set("bgColor", v)} />
                    <ColorPickerField label="Hover Background" value={props.hoverBg ?? ""} onChange={(v) => set("hoverBg", v)} />
                    <ToggleField label="Use Brand Colors" value={!!props.useBrandColors} onChange={(v) => set("useBrandColors", v)} />
                    <TabSection title="Typography" />
                    <SliderNumberField label="Font Size (px)" value={props.fontSize ?? 14} onChange={(v) => set("fontSize", v)} min={8} max={36} step={1} unit="px" />
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
    btnStyle: "icon-text", btnSize: "medium", borderRadius: 6, spacing: 8,
    iconColor: "", textColor: "", bgColor: "", hoverBg: "", useBrandColors: false,
    fontSize: 14, fontWeight: "600",
    alignment: "left",
    advBgType: "none", advBgColor: "", advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 8, right: 0, bottom: 8, left: 0 },
    hideDesktop: false, hideTablet: false, hideMobile: false, cssId: "", cssClass: "", zIndex: null,
  },
  render: ({ enabled, labels, showLabel, btnStyle, btnSize, borderRadius, spacing, iconColor, textColor, bgColor, hoverBg, useBrandColors, fontSize, fontWeight, alignment, advBgType, advBgColor, advMargin, advPadding, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex }) => {
    const [copied, setCopied] = useState(false);
    const id = cssId || `share-${Math.random().toString(36).slice(2, 7)}`;
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const resolvedFontSize = `${Number(fontSize) || 14}px`;
    const sizeMap = { small: { px: "8px 12px", fs: "12px" }, medium: { px: "10px 16px", fs: resolvedFontSize }, large: { px: "12px 20px", fs: "16px" } };
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
      <div id={id} className={[cssClass].filter(Boolean).join(" ") || undefined} style={{ paddingTop: advPadding?.top ?? 8, paddingRight: advPadding?.right ?? 0, paddingBottom: advPadding?.bottom ?? 8, paddingLeft: advPadding?.left ?? 0, marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0, marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0, zIndex: zIndex ?? undefined, ...(advBgType === "color" && advBgColor ? { backgroundColor: advBgColor } : {}) }}>
        {hoverCss && <style>{hoverCss}</style>}
        <div style={{ display: "flex", gap: `${Number(spacing) || 8}px`, flexWrap: "wrap", justifyContent: alignment === "center" ? "center" : alignment === "right" ? "flex-end" : "flex-start" }}>
          {platforms.map(p => {
            const resolvedBg = useBrandColors ? p.brandColor : (bgColor || "#f3f4f6");
            const resolvedText = useBrandColors ? "#fff" : (textColor || "var(--text-color)");
            const resolvedIcon = useBrandColors ? "#fff" : (iconColor || "var(--text-color)");
            const isCopy = p.key === "copy";
            const btnLabel = (labels as any)?.[p.key] ?? p.label;
            return (
              <button key={p.key} className="puck-share-btn" onClick={() => handleShare(p.key)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: s.px, fontSize: s.fs, fontWeight: fontWeight || "600", color: resolvedText, backgroundColor: resolvedBg, border: "none", borderRadius: `${borderRadius != null ? Number(borderRadius) : 6}px`, cursor: "pointer" }}>
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
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
        };
        const bgType = props.advBgType ?? "none";
        return (
          <BlockTabBar blockKey="StarRating">
            {(tab) => (
              <>
                {tab === "content" && (
                  <>
                    {(() => {
                      const rv = props.ratingValue ?? 4;
                      const filledClr = props.filledColor ?? "#f59e0b";
                      const emptyClr = props.emptyColor ?? "#d1d5db";
                      return (
                        <StackedField label={`Rating Value — ${rv}`}>
                          <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "4px 0" }}>
                            {[1,2,3,4,5].map((n) => {
                              const isHalf = rv === n - 0.5;
                              const isFull = rv >= n;
                              return (
                                <span
                                  key={n}
                                  title={`Set ${n}`}
                                  onClick={() => {
                                    // clicking same full star → go to half; clicking full star at half → go to prev
                                    if (isFull && rv === n) set("ratingValue", n - 0.5);
                                    else set("ratingValue", n);
                                  }}
                                  style={{ fontSize: 24, lineHeight: 1, cursor: "pointer", userSelect: "none",
                                    color: isFull ? filledClr : isHalf ? filledClr : emptyClr,
                                    opacity: isHalf ? 0.6 : 1 }}
                                >
                                  {isHalf ? "½" : "★"}
                                </span>
                              );
                            })}
                            <span
                              title="Clear"
                              onClick={() => set("ratingValue", 0)}
                              style={{ fontSize: 12, marginLeft: 6, cursor: "pointer", color: "var(--p-color-text-subdued, #6b7280)", userSelect: "none" }}
                            >✕</span>
                          </div>
                        </StackedField>
                      );
                    })()}
                    <ToggleField label="Show Number" value={props.showNumber !== false} onChange={(v) => set("showNumber", v)} />
                    <InlineSelect label="Number Position" value={props.numberPosition ?? "after"} onChange={(v) => set("numberPosition", v)} options={[{ value: "before", label: "Before Stars" }, { value: "after", label: "After Stars" }]} />
                    <StackedField label="Review Count">
                      <input
                        type="number"
                        min={0}
                        value={props.reviewCount ?? 0}
                        onChange={(e) => set("reviewCount", Math.max(0, parseInt(e.target.value) || 0))}
                        style={{ width: "100%", padding: "4px 8px", fontSize: 12, boxSizing: "border-box", border: "1px solid var(--p-color-border)", borderRadius: 4, background: "var(--p-color-bg-surface)", color: "var(--p-color-text)", outline: "none" }}
                      />
                    </StackedField>
                  </>
                )}
                {tab === "style" && (
                  <>
                    <TabSection title="Stars" />
                    <SliderNumberField label="Star Size (px)" value={typeof props.starSize === "number" ? props.starSize : parseInt(props.starSize ?? "24") || 24} onChange={(v) => set("starSize", `${v}px`)} min={8} max={96} step={1} unit="px" />
                    <ColorPickerField label="Filled Color" value={props.filledColor ?? "#f59e0b"} onChange={(v) => set("filledColor", v)} />
                    <ColorPickerField label="Empty Color" value={props.emptyColor ?? "#d1d5db"} onChange={(v) => set("emptyColor", v)} />
                    <SliderNumberField label="Gap Between Stars (px)" value={typeof props.starGap === "number" ? props.starGap : parseInt(props.starGap ?? "4") || 4} onChange={(v) => set("starGap", `${v}px`)} min={0} max={32} step={1} unit="px" />
                    <TabSection title="Number" />
                    <SliderNumberField label="Font Size (px)" value={typeof props.numFontSize === "number" ? props.numFontSize : parseInt(props.numFontSize ?? "16") || 16} onChange={(v) => set("numFontSize", `${v}px`)} min={8} max={72} step={1} unit="px" />
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
    ratingValue: 4, showNumber: true, numberPosition: "after", reviewCount: 0,
    starSize: "24px", filledColor: "#f59e0b", emptyColor: "#d1d5db", starGap: "4px",
    numFontSize: "16px", numFontWeight: "700", numColor: "",
    alignment: "left",
    advBgType: "none", advBgColor: "", advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 8, right: 0, bottom: 8, left: 0 },
    hideDesktop: false, hideTablet: false, hideMobile: false, cssId: "", cssClass: "", zIndex: null,
  },
  render: ({ ratingValue, showNumber, numberPosition, reviewCount, starSize, filledColor, emptyColor, starGap, numFontSize, numFontWeight, numColor, alignment, advBgType, advBgColor, advMargin, advPadding, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex }) => {
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const max = 5;
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
      <span style={{ fontSize: numFontSize || "16px", fontWeight: numFontWeight || "700", color: numColor || "var(--text-color)", whiteSpace: "nowrap" }}>
        {val.toFixed(1)}{reviewCount ? ` (${reviewCount} reviews)` : ""}
      </span>
    );
    return (
      <div id={cssId || undefined} className={[cssClass].filter(Boolean).join(" ") || undefined} style={{ textAlign: alignment as any, paddingTop: advPadding?.top ?? 8, paddingRight: advPadding?.right ?? 0, paddingBottom: advPadding?.bottom ?? 8, paddingLeft: advPadding?.left ?? 0, marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0, marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0, zIndex: zIndex ?? undefined, ...(advBgType === "color" && advBgColor ? { backgroundColor: advBgColor } : {}) }}>
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
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
        };
        const bgType = props.advBgType ?? "none";
        const pbType = props.pbType ?? "line";
        const fillStyle = props.fillStyle ?? "solid";
        const showPct = props.showPercentage !== false;
        const rows: Array<{ label: string; value: number }> = props.multiRows ?? [{ label: "Row 1", value: 60 }, { label: "Row 2", value: 40 }];
        return (
          <BlockTabBar blockKey="ProgressBar">
            {(tab) => (
              <>
                {tab === "content" && (
                  <>
                    <StackedTextField label="Label" value={props.label ?? ""} onChange={(v) => set("label", v)} placeholder="Skill or metric..." />
                    <SliderNumberField label="Value (0–100)" value={props.value ?? 75} onChange={(v) => set("value", Math.min(100, Math.max(0, v)))} min={0} max={100} step={1} unit="%" />
                    <ToggleField label="Show Percentage" value={showPct} onChange={(v) => set("showPercentage", v)} />
                  </>
                )}
                {tab === "style" && (
                  <>
                    <TabSection title="Type" />
                    <InlineSelect label="Type" value={pbType} onChange={(v) => set("pbType", v)} options={[{ value: "line", label: "Line" }, { value: "circle", label: "Circle" }, { value: "step", label: "Step" }, { value: "multirow", label: "Multi Row" }, { value: "circlecard", label: "Circle Card" }]} />

                    {pbType === "line" && (
                      <>
                        <TabSection title="Line" />
                        <InlineSelect label="Fill Style" value={fillStyle} onChange={(v) => set("fillStyle", v)} options={[{ value: "solid", label: "Solid" }, { value: "striped", label: "Striped" }, { value: "gradient", label: "Gradient" }]} />
                        <ColorPickerField label="Fill Color" value={props.fillColor ?? "#0158ad"} onChange={(v) => set("fillColor", v)} />
                        {fillStyle === "gradient" && <ColorPickerField label="Gradient End Color" value={props.gradientEnd ?? "#60a5fa"} onChange={(v) => set("gradientEnd", v)} />}
                        <ColorPickerField label="Background Color" value={props.trackColor ?? "#e5e7eb"} onChange={(v) => set("trackColor", v)} />
                        <SliderNumberField label="Height (px)" value={props.lineHeight ?? 12} onChange={(v) => set("lineHeight", v)} min={4} max={60} step={1} unit="px" />
                        <SliderNumberField label="Border Radius (px)" value={props.lineRadius ?? 6} onChange={(v) => set("lineRadius", v)} min={0} max={50} step={1} unit="px" />
                      </>
                    )}

                    {pbType === "circle" && (
                      <>
                        <TabSection title="Circle" />
                        <SliderNumberField label="Size (px)" value={props.circleSize ?? 120} onChange={(v) => set("circleSize", v)} min={40} max={300} step={4} unit="px" />
                        <SliderNumberField label="Ring Thickness (px)" value={props.ringThickness ?? 10} onChange={(v) => set("ringThickness", v)} min={2} max={40} step={1} unit="px" />
                        <ColorPickerField label="Fill Color" value={props.fillColor ?? "#0158ad"} onChange={(v) => set("fillColor", v)} />
                        <ColorPickerField label="Background Color" value={props.trackColor ?? "#e5e7eb"} onChange={(v) => set("trackColor", v)} />
                        <ToggleField label="Show Label Inside" value={props.showLabelInside !== false} onChange={(v) => set("showLabelInside", v)} />
                      </>
                    )}

                    {pbType === "step" && (
                      <>
                        <TabSection title="Steps" />
                        <SliderNumberField label="Total Steps" value={props.totalSteps ?? 5} onChange={(v) => set("totalSteps", Math.max(1, v))} min={1} max={20} step={1} unit="" />
                        <SliderNumberField label="Active Step" value={props.activeStep ?? 3} onChange={(v) => set("activeStep", v)} min={0} max={props.totalSteps ?? 5} step={1} unit="" />
                        <ColorPickerField label="Active Color" value={props.fillColor ?? "#0158ad"} onChange={(v) => set("fillColor", v)} />
                        <ColorPickerField label="Inactive Color" value={props.trackColor ?? "#e5e7eb"} onChange={(v) => set("trackColor", v)} />
                        <ToggleField label="Show Step Numbers" value={!!props.showStepNumbers} onChange={(v) => set("showStepNumbers", v)} />
                      </>
                    )}

                    {pbType === "multirow" && (
                      <>
                        <TabSection title="Rows" />
                        {rows.map((row, i) => (
                          <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 8px 4px", marginBottom: 6 }}>
                            <StackedTextField label={`Row ${i + 1} Label`} value={row.label} onChange={(v) => { const next = rows.map((r, j) => j === i ? { ...r, label: v } : r); set("multiRows", next); }} placeholder="Label..." />
                            <SliderNumberField label={`Row ${i + 1} Value`} value={row.value} onChange={(v) => { const next = rows.map((r, j) => j === i ? { ...r, value: Math.min(100, Math.max(0, v)) } : r); set("multiRows", next); }} min={0} max={100} step={1} unit="%" />
                            {rows.length > 1 && (
                              <button onClick={() => set("multiRows", rows.filter((_, j) => j !== i))} style={{ fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: "2px 0" }}>Remove row</button>
                            )}
                          </div>
                        ))}
                        <button onClick={() => set("multiRows", [...rows, { label: `Row ${rows.length + 1}`, value: 50 }])} style={{ fontSize: 12, color: "#0158ad", background: "none", border: "1px solid #0158ad", borderRadius: 4, cursor: "pointer", padding: "4px 10px", width: "100%", marginBottom: 8 }}>+ Add Row</button>
                        <TabSection title="Style" />
                        <InlineSelect label="Fill Style" value={fillStyle} onChange={(v) => set("fillStyle", v)} options={[{ value: "solid", label: "Solid" }, { value: "striped", label: "Striped" }, { value: "gradient", label: "Gradient" }]} />
                        <ColorPickerField label="Fill Color" value={props.fillColor ?? "#0158ad"} onChange={(v) => set("fillColor", v)} />
                        {fillStyle === "gradient" && <ColorPickerField label="Gradient End Color" value={props.gradientEnd ?? "#60a5fa"} onChange={(v) => set("gradientEnd", v)} />}
                        <ColorPickerField label="Background Color" value={props.trackColor ?? "#e5e7eb"} onChange={(v) => set("trackColor", v)} />
                        <SliderNumberField label="Height (px)" value={props.lineHeight ?? 12} onChange={(v) => set("lineHeight", v)} min={4} max={60} step={1} unit="px" />
                        <SliderNumberField label="Border Radius (px)" value={props.lineRadius ?? 6} onChange={(v) => set("lineRadius", v)} min={0} max={50} step={1} unit="px" />
                      </>
                    )}

                    {pbType === "circlecard" && (
                      <>
                        <TabSection title="Circle Card" />
                        <SliderNumberField label="Size (px)" value={props.circleSize ?? 120} onChange={(v) => set("circleSize", v)} min={40} max={300} step={4} unit="px" />
                        <SliderNumberField label="Ring Thickness (px)" value={props.ringThickness ?? 10} onChange={(v) => set("ringThickness", v)} min={2} max={40} step={1} unit="px" />
                        <ColorPickerField label="Fill Color" value={props.fillColor ?? "#0158ad"} onChange={(v) => set("fillColor", v)} />
                        <ColorPickerField label="Card Background Color" value={props.cardBg ?? "#ffffff"} onChange={(v) => set("cardBg", v)} />
                        <ToggleField label="Show Label Below" value={props.showLabelBelow !== false} onChange={(v) => set("showLabelBelow", v)} />
                      </>
                    )}

                    <TabSection title="Common" />
                    <SliderNumberField label="Label Font Size (px)" value={props.labelFontSize ?? 14} onChange={(v) => set("labelFontSize", v)} min={8} max={48} step={1} unit="px" />
                    <ColorPickerField label="Label Color" value={props.labelColor ?? ""} onChange={(v) => set("labelColor", v)} />
                    {showPct && (
                      <>
                        <SliderNumberField label="Percentage Font Size (px)" value={props.pctFontSize ?? 13} onChange={(v) => set("pctFontSize", v)} min={8} max={48} step={1} unit="px" />
                        <ColorPickerField label="Percentage Color" value={props.pctColor ?? ""} onChange={(v) => set("pctColor", v)} />
                      </>
                    )}
                    <AlignField label="Alignment" value={props.alignment ?? "left"} onChange={(v) => set("alignment", v)} options={[{ value: "left", icon: <AlignLeft size={15} />, title: "Left" }, { value: "center", icon: <AlignCenter size={15} />, title: "Center" }, { value: "right", icon: <AlignRight size={15} />, title: "Right" }]} />
                    <InlineSelect label="Animation" value={props.animation ?? "none"} onChange={(v) => set("animation", v)} options={[{ value: "none", label: "None" }, { value: "fill", label: "Fill on Load" }]} />
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
    label: "Skill", value: 75, showPercentage: true,
    pbType: "line",
    fillStyle: "solid", fillColor: "#0158ad", gradientEnd: "#60a5fa", trackColor: "#e5e7eb",
    lineHeight: 12, lineRadius: 6,
    circleSize: 120, ringThickness: 10,
    showLabelInside: true, showLabelBelow: true,
    totalSteps: 5, activeStep: 3, showStepNumbers: false,
    multiRows: [{ label: "Row 1", value: 60 }, { label: "Row 2", value: 40 }],
    cardBg: "#ffffff",
    labelFontSize: 14, labelColor: "",
    pctFontSize: 13, pctColor: "",
    alignment: "left", animation: "fill",
    advBgType: "none", advBgColor: "", advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 8, right: 0, bottom: 8, left: 0 },
    hideDesktop: false, hideTablet: false, hideMobile: false, cssId: "", cssClass: "", zIndex: null,
  },
  render: (props: any) => {
    const { label, value, showPercentage, pbType, fillStyle, fillColor, gradientEnd, trackColor, lineHeight, lineRadius, circleSize, ringThickness, showLabelInside, showLabelBelow, totalSteps, activeStep, showStepNumbers, multiRows, cardBg, labelFontSize, labelColor, pctFontSize, pctColor, alignment, animation, advBgType, advBgColor, advMargin, advPadding, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex } = props;
    const pct = Math.min(100, Math.max(0, value ?? 75));
    const animFill = animation === "fill";
    const [displayed, setDisplayed] = useState(animFill ? 0 : pct);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (!animFill) { setDisplayed(pct); return; }
      const el = ref.current;
      if (!el) return;
      const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setDisplayed(pct); obs.disconnect(); } }, { threshold: 0.2 });
      obs.observe(el);
      return () => obs.disconnect();
    }, [pct, animFill]);
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const uid = cssId || "pb-blk";
    const fc = fillColor || "#0158ad";
    const tc = trackColor || "#e5e7eb";
    const lfs = labelFontSize || 14;
    const pfs = pctFontSize || 13;
    const lc = labelColor || "var(--text-color)";
    const pc = pctColor || "var(--text-color)";
    const alignStyle: React.CSSProperties = { textAlign: alignment === "center" ? "center" : alignment === "right" ? "right" : "left" };

    const fillBg = (() => {
      if (fillStyle === "gradient") return `linear-gradient(90deg, ${fc}, ${gradientEnd || "#60a5fa"})`;
      if (fillStyle === "striped") return `${fc} repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.2) 8px, rgba(255,255,255,0.2) 16px)`;
      return fc;
    })();

    const wrapStyle: React.CSSProperties = {
      paddingTop: advPadding?.top ?? 8, paddingRight: advPadding?.right ?? 0, paddingBottom: advPadding?.bottom ?? 8, paddingLeft: advPadding?.left ?? 0,
      marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0, marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0,
      zIndex: zIndex ?? undefined, ...(advBgType === "color" && advBgColor ? { backgroundColor: advBgColor } : {}),
      ...alignStyle,
    };

    const renderLine = (rowLabel: string, rowPct: number, rowDisplayed: number, key?: number) => (
      <div key={key} style={{ marginBottom: key !== undefined ? 10 : 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
          {rowLabel && <span style={{ fontSize: lfs, color: lc }}>{rowLabel}</span>}
          {showPercentage && <span style={{ fontSize: pfs, color: pc, fontWeight: 600 }}>{rowPct}%</span>}
        </div>
        <div style={{ position: "relative", height: lineHeight || 12, backgroundColor: tc, borderRadius: lineRadius ?? 6, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${rowDisplayed}%`, background: fillBg, borderRadius: lineRadius ?? 6, transition: animFill ? "width 900ms ease" : undefined }} />
        </div>
      </div>
    );

    const renderCircleSvg = (sz: number, thick: number, p: number, disp: number, isCard = false) => {
      const r = (sz - thick) / 2;
      const cx = sz / 2, cy = sz / 2;
      const circ = 2 * Math.PI * r;
      const dash = (disp / 100) * circ;
      return (
        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={cx} cy={cy} r={r} fill={isCard ? (cardBg || "#fff") : "none"} stroke={tc} strokeWidth={thick} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={fc} strokeWidth={thick} strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`} style={{ transition: animFill ? "stroke-dasharray 900ms ease" : undefined }} />
        </svg>
      );
    };

    const type = pbType ?? "line";

    return (
      <div ref={ref} id={cssId || undefined} className={[cssClass].filter(Boolean).join(" ") || undefined} style={wrapStyle}>

        {type === "line" && renderLine(label ?? "", pct, displayed)}

        {type === "circle" && (
          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ position: "relative", width: circleSize || 120, height: circleSize || 120 }}>
              {renderCircleSvg(circleSize || 120, ringThickness || 10, pct, displayed)}
              {showLabelInside !== false && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  {showPercentage && <span style={{ fontSize: pfs, color: pc, fontWeight: 700, lineHeight: 1.1 }}>{pct}%</span>}
                  {label && <span style={{ fontSize: lfs * 0.78, color: lc, marginTop: 2 }}>{label}</span>}
                </div>
              )}
            </div>
            {showLabelInside === false && label && <span style={{ fontSize: lfs, color: lc }}>{label}</span>}
          </div>
        )}

        {type === "step" && (() => {
          const total = Math.max(1, totalSteps ?? 5);
          const active = Math.min(total, Math.max(0, activeStep ?? 3));
          return (
            <div>
              {label && <div style={{ fontSize: lfs, color: lc, marginBottom: 8 }}>{label}</div>}
              <div style={{ display: "flex", gap: 6 }}>
                {Array.from({ length: total }, (_, i) => (
                  <div key={i} style={{ flex: 1, height: lineHeight || 12, borderRadius: lineRadius ?? 6, backgroundColor: i < active ? fc : tc, display: "flex", alignItems: "center", justifyContent: "center", transition: animFill ? "background-color 400ms ease" : undefined }}>
                    {showStepNumbers && <span style={{ fontSize: Math.max(9, (lineHeight || 12) - 3), color: i < active ? "#fff" : lc }}>{i + 1}</span>}
                  </div>
                ))}
              </div>
              {showPercentage && <div style={{ fontSize: pfs, color: pc, marginTop: 6 }}>{Math.round((active / total) * 100)}%</div>}
            </div>
          );
        })()}

        {type === "multirow" && (() => {
          const rows: Array<{ label: string; value: number }> = multiRows ?? [{ label: "Row 1", value: 60 }];
          return (
            <div>
              {rows.map((row, i) => renderLine(row.label, Math.min(100, Math.max(0, row.value)), animFill ? 0 : Math.min(100, Math.max(0, row.value)), i))}
            </div>
          );
        })()}

        {type === "circlecard" && (
          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 10, padding: 16, backgroundColor: cardBg || "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <div style={{ position: "relative", width: circleSize || 120, height: circleSize || 120 }}>
              {renderCircleSvg(circleSize || 120, ringThickness || 10, pct, displayed, true)}
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {showPercentage && <span style={{ fontSize: pfs, color: pc, fontWeight: 700 }}>{pct}%</span>}
              </div>
            </div>
            {showLabelBelow !== false && label && <span style={{ fontSize: lfs, color: lc, fontWeight: 600 }}>{label}</span>}
          </div>
        )}
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
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
        };
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
                    <ImageField label="Custom Icon" value={props.customIcon ?? ""} onChange={(v) => set("customIcon", v)} />
                    <ToggleField label="Dismissible" value={!!props.dismissible} onChange={(v) => set("dismissible", v)} />
                  </>
                )}
                {tab === "style" && (
                  <>
                    {(props.alertType ?? "info") === "custom" && (
                      <>
                        <TabSection title="Colors" />
                        <ColorPickerField label="Background Color" value={props.bgColor ?? ""} onChange={(v) => set("bgColor", v)} />
                        <ColorPickerField label="Text Color" value={props.textColor ?? ""} onChange={(v) => set("textColor", v)} />
                        <ColorPickerField label="Border Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
                        <ColorPickerField label="Icon Color" value={props.iconColor ?? ""} onChange={(v) => set("iconColor", v)} />
                      </>
                    )}
                    <TabSection title="Typography" />
                    <SliderNumberField label="Title Font Size (px)" value={props.titleFontSize ?? 16} onChange={(v) => set("titleFontSize", v)} min={8} max={72} step={1} unit="px" />
                    <InlineSelect label="Title Font Weight" value={props.titleFontWeight ?? "700"} onChange={(v) => set("titleFontWeight", v)} options={[{ value: "400", label: "Normal" }, { value: "700", label: "Bold" }]} />
                    <SliderNumberField label="Message Font Size (px)" value={props.msgFontSize ?? 14} onChange={(v) => set("msgFontSize", v)} min={8} max={48} step={1} unit="px" />
                    <SliderNumberField label="Line Height" value={props.lineHeight ?? 15} onChange={(v) => set("lineHeight", v)} min={10} max={30} step={1} unit="" />
                    <TabSection title="Border" />
                    <InlineSelect label="Border Style" value={props.borderStyle ?? "solid"} onChange={(v) => set("borderStyle", v)} options={[{ value: "none", label: "None" }, { value: "solid", label: "Solid" }, { value: "left-only", label: "Left Only" }]} />
                    <SliderNumberField label="Border Width (px)" value={props.borderWidth ?? 1} onChange={(v) => set("borderWidth", v)} min={1} max={10} step={1} unit="px" />
                    <SliderNumberField label="Border Radius (px)" value={props.borderRadius ?? 8} onChange={(v) => set("borderRadius", v)} min={0} max={50} step={1} unit="px" />
                  </>
                )}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 16, right: 16, bottom: 16, left: 16 }} onChange={(v) => set("advPadding", v)} />
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
    titleFontSize: 16, titleFontWeight: "700", msgFontSize: 14, lineHeight: 15,
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
    const isCustomType = (alertType ?? "info") === "custom";
    const resolvedBg = (isCustomType && bgColor) ? bgColor : t.bg;
    const resolvedText = (isCustomType && textColor) ? textColor : t.text;
    const resolvedBorder = (isCustomType && borderColor) ? borderColor : t.border;
    const isImgIcon = customIcon && (customIcon.startsWith("http") || customIcon.startsWith("/") || customIcon.startsWith("data:"));
    const resolvedIcon = isImgIcon ? null : (customIcon || t.icon);
    const titleFs = `${Number(titleFontSize) || 16}px`;
    const msgFs = `${Number(msgFontSize) || 14}px`;
    const lh = Number(lineHeight) ? Number(lineHeight) / 10 : 1.5;
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    if (dismissed) return null;
    const borderCss: React.CSSProperties = borderStyle === "left-only"
      ? { borderLeft: `${borderWidth || 4}px solid ${resolvedBorder}` }
      : borderStyle !== "none"
      ? { border: `${borderWidth || 1}px solid ${resolvedBorder}` }
      : {};
    return (
      <div id={cssId || undefined} className={[cssClass].filter(Boolean).join(" ") || undefined} style={{ paddingTop: advPadding?.top ?? 16, paddingRight: advPadding?.right ?? 16, paddingBottom: advPadding?.bottom ?? 16, paddingLeft: advPadding?.left ?? 16, marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0, marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0, backgroundColor: resolvedBg, color: resolvedText, borderRadius: borderRadius ?? 8, zIndex: zIndex ?? undefined, position: "relative", lineHeight: lh, ...borderCss, ...(advBgType === "color" && advBgColor ? { backgroundColor: advBgColor } : {}) }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          {showIcon && (isImgIcon
            ? <img src={customIcon} alt="icon" style={{ width: "1.5rem", height: "1.5rem", objectFit: "contain", flexShrink: 0 }} />
            : <span style={{ fontSize: "1.25rem", color: (isCustomType && iconColor) ? iconColor : resolvedText, flexShrink: 0, lineHeight: 1.3 }}>{resolvedIcon}</span>
          )}
          <div style={{ flex: 1 }}>
            {alertTitle && <div style={{ fontSize: titleFs, fontWeight: titleFontWeight || "700", marginBottom: 4 }}>{alertTitle}</div>}
            <div style={{ fontSize: msgFs }}>{message}</div>
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
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
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
                    <ImageField label="Author Image" value={props.authorImage ?? ""} onChange={(v) => set("authorImage", v)} />
                    <ToggleField label="Show Quote Icon" value={props.showQuoteIcon !== false} onChange={(v) => set("showQuoteIcon", v)} />
                  </>
                )}
                {tab === "style" && (
                  <>
                    <TabSection title="Quote Text" />
                    <InlineSelect label="Font Family" value={props.quoteFontFamily ?? "inherit"} onChange={(v) => { set("quoteFontFamily", v); loadGoogleFont(v); }} options={[{ value: "inherit", label: "Theme Default" }, { value: "Arial, Helvetica, sans-serif", label: "Arial" }, { value: "Georgia, serif", label: "Georgia" }, { value: "'Courier New', monospace", label: "Courier New" }, { value: "Impact, sans-serif", label: "Impact" }, { value: "Inter, sans-serif", label: "Inter" }, { value: "Poppins, sans-serif", label: "Poppins" }, { value: "'Roboto Serif', serif", label: "Roboto Serif" }, { value: "'New York', 'New York Small', 'Times New Roman', serif", label: "New York" }, { value: "'Open Sans', sans-serif", label: "Open Sans" }]} />
                    <SliderNumberField label="Font Size (px)" value={typeof props.quoteFontSize === "number" ? props.quoteFontSize : parseInt(props.quoteFontSize ?? "20") || 20} onChange={(v) => set("quoteFontSize", `${v}px`)} min={8} max={72} step={1} unit="px" />
                    <InlineSelect label="Font Style" value={props.quoteFontStyle ?? "italic"} onChange={(v) => set("quoteFontStyle", v)} options={[{ value: "normal", label: "Normal" }, { value: "italic", label: "Italic" }]} />
                    <ColorPickerField label="Text Color" value={props.quoteTextColor ?? ""} onChange={(v) => set("quoteTextColor", v)} />
                    <SliderNumberField label="Line Height" value={typeof props.quoteLineHeight === "number" ? props.quoteLineHeight : parseFloat(props.quoteLineHeight ?? "1.7") || 1.7} onChange={(v) => set("quoteLineHeight", v)} min={1} max={3} step={0.1} unit="" />
                    <TabSection title="Author" />
                    <ColorPickerField label="Name Color" value={props.nameColor ?? ""} onChange={(v) => set("nameColor", v)} />
                    <SliderNumberField label="Name Font Size (px)" value={typeof props.nameFontSize === "number" ? props.nameFontSize : parseInt(props.nameFontSize ?? "16") || 16} onChange={(v) => set("nameFontSize", `${v}px`)} min={8} max={48} step={1} unit="px" />
                    <InlineSelect label="Name Font Weight" value={props.nameFontWeight ?? "700"} onChange={(v) => set("nameFontWeight", v)} options={[{ value: "400", label: "Normal" }, { value: "700", label: "Bold" }]} />
                    <ColorPickerField label="Title Color" value={props.titleColor ?? ""} onChange={(v) => set("titleColor", v)} />
                    <SliderNumberField label="Title Font Size (px)" value={typeof props.titleFontSize === "number" ? props.titleFontSize : parseInt(props.titleFontSize ?? "14") || 14} onChange={(v) => set("titleFontSize", `${v}px`)} min={8} max={36} step={1} unit="px" />
                    <SliderNumberField label="Image Size (px)" value={typeof props.imageSize === "number" ? props.imageSize : parseInt(props.imageSize ?? "48") || 48} onChange={(v) => set("imageSize", `${v}px`)} min={24} max={160} step={1} unit="px" />
                    <SliderNumberField label="Image Border Radius (px)" value={typeof props.imageBorderRadius === "number" ? props.imageBorderRadius : parseInt(props.imageBorderRadius ?? "50") || 50} onChange={(v) => set("imageBorderRadius", `${v}px`)} min={0} max={100} step={1} unit="px" />
                    <TabSection title="Quote Icon" />
                    <ColorPickerField label="Icon Color" value={props.iconColor ?? ""} onChange={(v) => set("iconColor", v)} />
                    <SliderNumberField label="Icon Size (px)" value={typeof props.iconSize === "number" ? props.iconSize : parseInt(props.iconSize ?? "48") || 48} onChange={(v) => set("iconSize", `${v}px`)} min={16} max={96} step={1} unit="px" />
                    <InlineSelect label="Icon Position" value={props.iconPosition ?? "top-left"} onChange={(v) => set("iconPosition", v)} options={[{ value: "top-left", label: "Top Left" }, { value: "top-right", label: "Top Right" }]} />
                    <TabSection title="Border" />
                    <InlineSelect label="Border Style" value={props.borderType ?? "left"} onChange={(v) => set("borderType", v)} options={[{ value: "none", label: "None" }, { value: "left", label: "Left Border" }, { value: "top", label: "Top Border" }, { value: "box", label: "Box" }]} />
                    <ColorPickerField label="Border Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
                    <SliderNumberField label="Border Width (px)" value={props.borderWidth ?? 4} onChange={(v) => set("borderWidth", v)} min={1} max={20} step={1} unit="px" />
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
    quoteFontFamily: "inherit", quoteFontSize: "20px", quoteFontStyle: "italic", quoteTextColor: "", quoteLineHeight: 1.7,
    nameColor: "", nameFontSize: "16px", nameFontWeight: "700", titleColor: "", titleFontSize: "14px", imageSize: "48px", imageBorderRadius: "50px",
    iconColor: "", iconSize: "48px", iconPosition: "top-left",
    borderType: "left", borderColor: "", borderWidth: 4,
    bgColor: "",
    alignment: "left",
    advBgType: "none", advBgColorWrap: "", advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 24, right: 24, bottom: 24, left: 24 },
    advBorderStyle: "none", advBorderWidth: { top: 0, right: 0, bottom: 0, left: 0 }, advBorderColor: "", advBorderRadius: { top: 0, right: 0, bottom: 0, left: 0 },
    hideDesktop: false, hideTablet: false, hideMobile: false, cssId: "", cssClass: "", zIndex: null,
  },
  render: ({ quoteText, authorName, authorTitle, authorImage, showQuoteIcon, quoteFontFamily, quoteFontSize, quoteFontStyle, quoteTextColor, quoteLineHeight, nameColor, nameFontSize, nameFontWeight, titleColor, titleFontSize, imageSize, imageBorderRadius, iconColor, iconSize, iconPosition, borderType, borderColor, borderWidth, bgColor, alignment, advBgType, advBgColorWrap, advMargin, advPadding, advBorderStyle, advBorderWidth, advBorderColor, advBorderRadius, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex }) => {
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
      <div id={cssId || undefined} className={[cssClass].filter(Boolean).join(" ") || undefined} style={{ textAlign: alignment as any, paddingTop: advPadding?.top ?? 24, paddingRight: advPadding?.right ?? 24, paddingBottom: advPadding?.bottom ?? 24, paddingLeft: advPadding?.left ?? 24, marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0, marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0, zIndex: zIndex ?? undefined, borderTopLeftRadius: advBorderRadius?.top ?? 0, borderTopRightRadius: advBorderRadius?.right ?? 0, borderBottomRightRadius: advBorderRadius?.bottom ?? 0, borderBottomLeftRadius: advBorderRadius?.left ?? 0, ...(advBorderStyle && advBorderStyle !== "none" ? { borderStyle: advBorderStyle, borderTopWidth: advBorderWidth?.top ?? 0, borderRightWidth: advBorderWidth?.right ?? 0, borderBottomWidth: advBorderWidth?.bottom ?? 0, borderLeftWidth: advBorderWidth?.left ?? 0, borderColor: advBorderColor || "currentColor" } : {}), ...wrapBg }}>
        <blockquote style={{ margin: 0, position: "relative", backgroundColor: bgColor || "transparent", padding: bgColor ? 24 : 0, borderRadius: bgColor ? 8 : 0, ...borderMap[borderType ?? "left"] }}>
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

// ─── Layout Block ─────────────────────────────────────────────────────────────

// ─── Slider with number input (used by Container block) ──────────────────────

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
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
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
      <div id={uid} className={[cssClass].filter(Boolean).join(" ") || undefined} style={outerStyle}>
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
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
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
        className={[cssClass].filter(Boolean).join(" ") || undefined}
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
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
        };

        return (
          <BlockTabBar blockKey="SectionBlock">
            {(tab) => (
              <>
                {/* ── LAYOUT TAB ── */}
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
    bgType, bgColor, bgGrad1, bgGrad2, bgGradDir: _bgGradDir, bgGradAngle,
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
        className={[cssClass].filter(Boolean).join(" ") || undefined}
        style={outerStyle}
      >
        {/* CSS */}
        {(animCss || customCss) && (
          <style>{`${animCss}${customCss || ""}`}</style>
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

        {/* Boxed inner → free-flow drop zone */}
        <div style={innerWrapStyle}>
          <DropZone zone={`section-${uid}-content`} />
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
          <SliderNumberField label="Width (px)" value={props.borderWidth ?? 1} onChange={(v) => set("borderWidth", v)} min={1} max={20} step={1} unit="px" />
          <ColorPickerField label="Color" value={props.borderColor ?? ""} onChange={(v) => set("borderColor", v)} />
          <SliderNumberField label="Radius (px)" value={props.borderRadius ?? 0} onChange={(v) => set("borderRadius", v)} min={0} max={100} step={1} unit="px" />
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
        <LinkUrlField label="URL" value={p.primaryUrl ?? ""} onChange={(v) => set("primaryUrl", v)} />
        <TabSection title="Secondary Button" />
        <StackedTextField label="Label" value={p.secondaryLabel ?? ""} onChange={(v) => set("secondaryLabel", v)} placeholder="Learn More (leave blank to hide)" />
        <LinkUrlField label="URL" value={p.secondaryUrl ?? ""} onChange={(v) => set("secondaryUrl", v)} />
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
        <SliderNumberField label="Gap (px)" value={p.gap ?? 12} onChange={(v) => set("gap", v)} min={0} max={60} step={2} unit="px" />
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
        <LinkUrlField label="URL" value={p.primaryUrl ?? ""} onChange={(v) => set("primaryUrl", v)} />
        <TabSection title="Secondary Button" />
        <StackedTextField label="Label" value={p.secondaryLabel ?? ""} onChange={(v) => set("secondaryLabel", v)} placeholder="Learn More" />
        <LinkUrlField label="URL" value={p.secondaryUrl ?? ""} onChange={(v) => set("secondaryUrl", v)} />
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