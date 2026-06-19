// @ts-nocheck
import type * as React from "react";
import { useState } from "react";
import { usePuck } from "@my-app/puck-editor";
import {
  ToggleField,
  StackedTextField,
  BlockTabBar,
  TabSection,
  InlineSelect,
  SliderNumberField,
  EditorHideOverlay,
} from "@/puck-blocks/shared";
import {
  ImageField,
} from "@/puck-blocks/block-fields";

export const PhotoCollageComponent = {
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
                      value={props.layout === "mixed" ? "grid" : (props.layout ?? "grid")}
                      onChange={(v: any) => set("layout", v)}
                      options={[
                        { value: "grid",     label: "Grid"     },
                        { value: "brick",    label: "Brick"    },
                        { value: "carousel", label: "Carousel" },
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
                      value={props.borderRadius ?? 8}
                      onChange={(v: any) => set("borderRadius", v)}
                      min={0}
                      max={50}
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
    layout: "grid",
    images: [
      { url: "", alt: "Photo 1" },
      { url: "", alt: "Photo 2" },
      { url: "", alt: "Photo 3" },
    ],
    gap: 8,
    borderRadius: 8,
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
    const br = `${borderRadius ?? 8}px`;
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
          style={{ overflow: "hidden", borderRadius: br, boxShadow: shadow, position: "relative", ...cellStyle }}
        >
          <img
            src={img.url}
            alt={img.alt || `Photo ${i + 1}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              position: "absolute",
              inset: 0,
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

    let content: React.ReactNode;

    if (!imgs.length) {
      content = (
        <div style={{ background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, borderRadius: br, color: "#6b7280", fontSize: 14 }}>
          Add photos in the Content tab
        </div>
      );
    } else if (layout === "grid") {
      content = (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: gapPx }}>
          {imgs.map((img: any, i: number) => (
            <ImgCell key={i} img={img} i={i} cellStyle={{ aspectRatio: ar }} />
          ))}
        </div>
      );
    } else if (layout === "brick") {
      const FULL = 3;
      const brickW = `calc((100% - ${(FULL - 1)} * ${gapPx}) / ${FULL})`;
      const halfW = `calc((${brickW} - ${gapPx}) / 2)`;
      const rows: { items: any[]; offset: boolean }[] = [];
      let bi = 0; let rowNo = 0;
      while (bi < imgs.length) {
        const offset = rowNo % 2 === 1;
        const count = offset ? FULL - 1 : FULL;
        rows.push({ items: imgs.slice(bi, bi + count), offset });
        bi += count; rowNo += 1;
      }
      let imgIdx = 0;
      content = (
        <div style={{ display: "flex", flexDirection: "column", gap: gapPx, overflow: "hidden" }}>
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
    } else if (layout === "carousel") {
      content = (
        <div style={{ display: "flex", gap: gapPx, overflowX: "auto", paddingBottom: 6, scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
          {imgs.map((img: any, i: number) => (
            <ImgCell key={i} img={img} i={i} cellStyle={{ flex: "0 0 auto", width: "min(70%, 360px)", aspectRatio: ar, scrollSnapAlign: "start" }} />
          ))}
        </div>
      );
    } else {
      // mixed (default)
      content = (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: gapPx }}>
          {imgs.map((img: any, i: number) => {
            const cellStyle = i === 0 ? { gridColumn: "span 2", gridRow: "span 2", aspectRatio: ar } : { aspectRatio: ar };
            return <ImgCell key={i} img={img} i={i} cellStyle={cellStyle} />;
          })}
        </div>
      );
    }

    return (
      <div className={hideClasses || undefined} style={{ position: "relative" }}>
        <EditorHideOverlay hideDesktop={hideDesktop} hideTablet={hideTablet} hideMobile={hideMobile} />
        {content}
      </div>
    );
  },
};
