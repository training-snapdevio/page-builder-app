import { useState } from "react";
import { usePuck } from "@my-app/puck-editor";
import { Modal, TextField, Text, BlockStack } from "@shopify/polaris";

type Props = {
  onClose: () => void;
  onSaved: () => void;
};

/**
 * Modal for saving the currently selected canvas block as a reusable block.
 * Must be rendered inside the Puck context tree so that `usePuck()` is available.
 */
export function SaveBlockModal({ onClose, onSaved }: Props) {
  const { selectedItem } = usePuck();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canSave = !!selectedItem && !!name.trim();

  const handleSave = async () => {
    if (!name.trim()) { setError("Please enter a name."); return; }
    if (!selectedItem) { setError("Select a component on the canvas first."); return; }

    setSaving(true);
    try {
      await fetch("/api/saved-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          content: [selectedItem],
          thumbnail: selectedItem.type ?? "Block",
        }),
      });
      onSaved();
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
      title="Save as Reusable Block"
      primaryAction={{
        content: saving ? "Saving…" : "Save Block",
        onAction: handleSave,
        disabled: !canSave || saving,
        loading: saving,
      }}
      secondaryActions={[{ content: "Cancel", onAction: onClose }]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          <Text as="p" variant="bodySm" tone="subdued">
            {selectedItem
              ? `Saving: ${selectedItem.type}`
              : "No component selected — click a component on the canvas first."}
          </Text>
          <TextField
            label="Block name"
            placeholder="e.g. Hero with CTA"
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
