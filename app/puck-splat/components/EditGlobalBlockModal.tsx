import { useState } from "react";
import { Puck } from "@my-app/puck-editor";
import { FullScreenModalShell } from "./ModalShell";
import { DrawerItemCard } from "./DrawerItemCard";
import type { GlobalBlock } from "../types";
import { BTN_CANCEL_STYLE, DRAWER_GRID_STYLES, GLOBAL_BLOCKS_REFRESH_EVENT, MODAL_PUCK_STYLES } from "../constants";
import { config } from "@/puck.config";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  block: GlobalBlock;
  onClose: () => void;
  theme: "light" | "dark";
};

// ─── Component ────────────────────────────────────────────────────────────────
export function EditGlobalBlockModal({ block, onClose, theme }: Props) {
  const [editData, setEditData] = useState<any>({
    root: { props: { title: "", theme } },
    content: block.content ?? [],
    zones: {},
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/global-blocks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: block.id, content: editData.content }),
      });
      if (!res.ok) throw new Error("Server error");
      window.dispatchEvent(new Event(GLOBAL_BLOCKS_REFRESH_EVENT));
      onClose();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FullScreenModalShell
      title={`🌐 Edit Global Block: ${block.name}`}
      subtitle={
        <div style={{
          background: '#fef3c7',
          color: '#b45309',
          border: '1px solid #fde68a',
          borderRadius: 6,
          padding: '10px 14px',
          fontSize: 13,
          fontWeight: 500,
          marginBottom: 8,
        }}>
          ⚠️ Changes will reflect on <b>every page</b> using this block.
        </div>
      }
      actions={
        <>
          {error && <span style={{ fontSize: 12, color: "#ef4444" }}>{error}</span>}
          <button onClick={onClose} disabled={saving} style={BTN_CANCEL_STYLE}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "6px 14px",
              fontSize: 12,
              background: saving ? "#7fb0e5" : "#0158ad",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: saving ? "not-allowed" : "pointer",
              fontWeight: 500,
            }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </>
      }
    >
      {/* Override Puck height so it fills the modal body (not 100dvh) */}
      <style>{MODAL_PUCK_STYLES}</style>
      <style>{DRAWER_GRID_STYLES}</style>
      <Puck
        config={config}
        data={{
          ...editData,
          root: {
            ...editData.root,
            props: {
              ...editData.root.props,
              theme,
            },
          },
        }}
        onChange={(newData: any) => setEditData(newData)}
        overrides={{
          headerActions: () => <></>,
          drawerItem: ({ name }) => <DrawerItemCard name={name} />,
        }}
      />
    </FullScreenModalShell>
  );
}

