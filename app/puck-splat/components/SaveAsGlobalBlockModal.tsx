import { useState } from "react";
import { usePuck } from "@my-app/puck-editor";
import { Modal, TextField, Text, Banner, BlockStack } from "@shopify/polaris";
import type { GlobalBlock } from "../types";
import { GLOBAL_BLOCKS_REFRESH_EVENT } from "../constants";
import { replaceItemById } from "../utils";

type Props = {
  onClose: () => void;
};

/**
 * Modal rendered inside the Puck context that saves the currently selected
 * component as a global block and replaces it on the canvas with a
 * GlobalBlock reference.
 */
export function SaveAsGlobalBlockModal({ onClose }: Props) {
  const { selectedItem, appState, dispatch } = usePuck();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canSave = !!selectedItem && !!name.trim();

  const handleSave = async () => {
    if (!name.trim()) { setError("Please enter a name."); return; }
    if (!selectedItem) { setError("Select a component on the canvas first."); return; }

    setSaving(true);
    try {
      // Capture zone contents that belong to this item (e.g. DoubleColumn slots).
      const itemId = (selectedItem as any).props?.id as string | undefined;
      const relatedZones: Record<string, any[]> = {};
      if (itemId && appState.data.zones) {
        for (const [key, value] of Object.entries(appState.data.zones)) {
          if (key.startsWith(`${itemId}:`)) {
            relatedZones[key] = value as any[];
          }
        }
      }

      const res = await fetch("/api/global-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          content: [selectedItem],
          ...(Object.keys(relatedZones).length > 0 ? { zones: relatedZones } : {}),
        }),
      });
      const newBlock: GlobalBlock = await res.json();

      // Replace the canvas item with a thin GlobalBlock reference
      const globalRef = {
        type: "GlobalBlock",
        props: {
          id: `GlobalBlock-${crypto.randomUUID()}`,
          globalBlockId: newBlock.id,
          _name: newBlock.name,
        },
      };
      dispatch({
        type: "setData",
        data: replaceItemById(appState.data, (selectedItem as any).props?.id, globalRef),
      });

      window.dispatchEvent(new Event(GLOBAL_BLOCKS_REFRESH_EVENT));
      onClose();
    } catch {
      setError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Save as Global Block"
      primaryAction={{
        content: saving ? "Saving…" : "Save as Global Block",
        onAction: handleSave,
        disabled: !canSave || saving,
        loading: saving,
      }}
      secondaryActions={[{ content: "Cancel", onAction: onClose, disabled: saving }]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          <Text as="p" variant="bodySm">
            The selected component will become a global block. Editing it later will update every page that uses it.
          </Text>
          {selectedItem ? (
            <Banner tone="info">
              Selected: <strong>{(selectedItem as any).type}</strong>
            </Banner>
          ) : (
            <Banner tone="warning">
              No component selected. Click a component on the canvas first.
            </Banner>
          )}
          <TextField
            label="Global block name"
            placeholder="e.g. Hero Banner"
            value={name}
            onChange={(v) => { setName(v); setError(""); }}
            autoComplete="off"
            autoFocus
            error={error || undefined}
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
