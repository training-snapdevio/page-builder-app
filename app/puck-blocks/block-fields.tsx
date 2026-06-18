// @ts-nocheck
// ─────────────────────────────────────────────────────────────────────────────
// Block-local field helpers — richer custom fields used by multiple blocks:
// image/video upload widgets, link-URL inputs, and the conditional drop-zone
// used by the page root. These build on the primitives in ./shared.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";

import { DropZone, FieldLabel, usePuck } from "@my-app/puck-editor";

import { StackedField } from "@/puck-blocks/shared";

// ─── Image upload field + wrapper component ──────────────────────────────────

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

// ─── Video upload field (Puck custom field def) ──────────────────────────────

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

// ─── Conditional drop zone (page root) ───────────────────────────────────────

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


// ─── Link URL fields ─────────────────────────────────────────────────────────

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


// ─── Video upload component wrapper ──────────────────────────────────────────

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

export {
  imageUploadField,
  ImageField,
  videoUploadField,
  ConditionalZone,
  URL_PATTERN,
  LinkUrlField,
  ImageLinkUrlField,
  VideoUploadField,
};
