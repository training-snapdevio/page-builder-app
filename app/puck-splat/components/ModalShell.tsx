// ─── ModalShell ───────────────────────────────────────────────────────────────

type ModalShellProps = {
  children: React.ReactNode;
};

/**
 * Compact modal shell using Polaris design tokens.
 * Individual dialogs (SaveBlockModal, etc.) render Polaris <Modal> directly —
 * this shell is kept for any remaining custom dialogs.
 */
export function ModalShell({ children }: ModalShellProps) {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 10000,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        background: "var(--p-color-bg-surface)",
        borderRadius: "var(--p-border-radius-300)",
        padding: "var(--p-space-500)",
        width: 400,
        maxWidth: "90vw",
        boxShadow: "var(--p-shadow-600)",
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── FullScreenModalShell ─────────────────────────────────────────────────────

type FullScreenModalShellProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Full-viewport modal (92 vw × 92 vh) with a fixed header bar.
 * Used for embedding a nested Puck editor (EditGlobalBlockModal).
 */
export function FullScreenModalShell({
  title,
  subtitle,
  actions,
  children,
}: FullScreenModalShellProps) {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.55)",
      zIndex: 10000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        width: "92vw",
        height: "92vh",
        background: "var(--p-color-bg-surface)",
        borderRadius: "var(--p-border-radius-300)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "var(--p-shadow-600)",
      }}>
        <div style={{
          padding: "var(--p-space-400) var(--p-space-500)",
          borderBottom: "1px solid var(--p-color-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
          background: "var(--p-color-bg-surface-secondary)",
        }}>
          <div>
            <div style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{title}</div>
            {subtitle && (
              typeof subtitle === "string"
                ? <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--p-color-text-secondary)" }}>{subtitle}</p>
                : <div style={{ marginTop: 4 }}>{subtitle}</div>
            )}
          </div>
          <div style={{ display: "flex", gap: "var(--p-space-200)", alignItems: "center" }}>{actions}</div>
        </div>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>{children}</div>
      </div>
    </div>
  );
}
