import { useState } from "react";
import { ModalShell } from "./ModalShell";
import type { SavedBlock } from "../types";
import {
  BTN_CANCEL_STYLE,
  FORM_INPUT_STYLE,
  FORM_LABEL_STYLE,
  FORM_READONLY_FIELD_STYLE,
} from "../constants";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  block: SavedBlock;
  onClose: () => void;
  onUpdated: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function EditBlockModal({ block, onClose, onUpdated }: Props) {
  const [name, setName] = useState(block.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const componentCount = block.content?.length ?? 0;
  const canUpdate = !!name.trim() && !saving;

  const handleUpdate = async () => {
    if (!name.trim()) {
      setError("Please enter a name.");
      return;
    }

    setSaving(true);
    try {
      await fetch("/api/saved-blocks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: block.id,
          name: name.trim(),
          content: block.content,
          thumbnail: block.thumbnail,
        }),
      });
      onUpdated();
      onClose();
    } catch {
      setError("Failed to update. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell>
      <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 600 }}>
        Edit Reusable Block
      </h3>
      <p style={{ margin: "0 0 16px", fontSize: 12, color: "var(--p-color-text-secondary)" }}>
        Editing: {block.name}
      </p>

      <div style={{ marginBottom: 16 }}>
        <label style={FORM_LABEL_STYLE}>Block Name</label>
        <input
          type="text"
          placeholder="Block name (e.g. Hero with CTA)"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          style={FORM_INPUT_STYLE}
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={FORM_LABEL_STYLE}>Components</label>
        <div style={FORM_READONLY_FIELD_STYLE}>
          {componentCount} component{componentCount !== 1 ? "s" : ""}
        </div>
      </div>

      {error && (
        <p style={{ color: "var(--p-color-text-critical, #d72c0d)", fontSize: 12, margin: "0 0 16px" }}>
          {error}
        </p>
      )}

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={BTN_CANCEL_STYLE}>
          Cancel
        </button>
        <button
          onClick={handleUpdate}
          disabled={!canUpdate}
          style={{
            padding: "7px 14px",
            borderRadius: "var(--p-border-radius-100, 4px)",
            border: "none",
            background: canUpdate
              ? "var(--p-color-bg-fill-brand, #005bd3)"
              : "var(--p-color-bg-fill-brand-disabled, #b3d1f0)",
            color: "var(--p-color-text-brand-on-bg-fill, #fff)",
            fontSize: 13,
            cursor: canUpdate ? "pointer" : "not-allowed",
            fontWeight: 500,
          }}
        >
          {saving ? "Updating…" : "Update Block"}
        </button>
      </div>
    </ModalShell>
  );
}

