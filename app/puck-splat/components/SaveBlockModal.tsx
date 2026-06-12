import { useState } from "react";
import { usePuck } from "@my-app/puck-editor";
import { Modal, TextField, Text, BlockStack } from "@shopify/polaris";

type Props = {
  onClose: () => void;
  onSaved: () => void;
};

/**
 * Modal for saving the currently selected canvas block (or Section with its
 * zone contents) as a reusable block/section.
 * Must be rendered inside the Puck context tree so that `usePuck()` is available.
 */
export function SaveBlockModal({ onClose, onSaved }: Props) {
  const { selectedItem, appState } = usePuck();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Container-type blocks that use DropZones (Section, Container, Grid)
  const CONTAINER_TYPES = ["Section", "Container", "Grid"];
  const isSection = selectedItem ? CONTAINER_TYPES.includes(selectedItem.type as string) : false;
  const canSave = !!selectedItem && !!name.trim();

  // Collect all zones that belong to this block (and recursively to child containers).
  // Zone keys include the block's id regardless of container type.
  const collectZones = (): Record<string, unknown[]> => {
    if (!selectedItem) return {};
    const id = selectedItem.props?.id as string | undefined;
    if (!id) return {};
    const allZones = (appState.data.zones ?? {}) as Record<string, unknown[]>;
    const result: Record<string, unknown[]> = {};
    for (const [key, val] of Object.entries(allZones)) {
      if (key.includes(id)) {
        result[key] = val;
      }
    }
    return result;
  };

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
          zones: collectZones(),
          blockType: isSection ? "section" : "block",
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
      title={isSection ? "Save as Custom Section" : "Save as Reusable Block"}
      primaryAction={{
        content: saving ? "Saving…" : isSection ? "Save Section" : "Save Block",
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
              ? isSection
                ? "Saves this section and all blocks inside it as a reusable custom section."
                : `Saving: ${selectedItem.type}`
              : "No component selected — click a component on the canvas first."}
          </Text>
          <TextField
            label={isSection ? "Section name" : "Block name"}
            placeholder={isSection ? "e.g. My Hero Section" : "e.g. Hero with CTA"}
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
