'use client';

import type { FC } from "react";

interface ModalProps {
  show: boolean;
  onClose: () => void;
  message: string;
}

const Modal: FC<ModalProps> = ({ show, onClose, message }) => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        opacity: show ? 1 : 0,
        pointerEvents: show ? "auto" : "none",
        transition: "opacity 300ms ease",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--p-color-backdrop-bg, rgba(0,0,0,0.5))",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 10,
          background: "var(--p-color-bg-surface)",
          borderRadius: "var(--p-border-radius-300, 8px)",
          padding: 24,
          boxShadow: "var(--p-shadow-500, 0 20px 60px rgba(0,0,0,0.2))",
          transform: show ? "scale(1)" : "scale(0.75)",
          transition: "transform 300ms ease",
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "var(--p-color-text)",
            margin: "0 0 8px",
          }}
        >
          Success!
        </h2>
        <p style={{ color: "var(--p-color-text)", margin: 0 }}>{message}</p>
        <button
          onClick={onClose}
          style={{
            marginTop: 16,
            padding: "8px 16px",
            background: "var(--p-color-bg-fill-brand, #005bd3)",
            color: "var(--p-color-text-brand-on-bg-fill, #fff)",
            border: "none",
            borderRadius: "var(--p-border-radius-100, 4px)",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
