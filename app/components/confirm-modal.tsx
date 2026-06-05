import type { FC } from "react";
import { Modal, Text } from "@shopify/polaris";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: FC<ConfirmModalProps> = ({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      primaryAction={{ content: confirmLabel, destructive: true, onAction: onConfirm }}
      secondaryActions={[{ content: cancelLabel, onAction: onCancel }]}
    >
      <Modal.Section>
        <Text as="p" variant="bodyMd">{message}</Text>
      </Modal.Section>
    </Modal>
  );
};

export default ConfirmModal;
