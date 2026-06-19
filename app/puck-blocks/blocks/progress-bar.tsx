// @ts-nocheck
// ─── ProgressBarComponent ───

import type * as React from "react";
import { useState, useEffect, useRef } from "react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { usePuck } from "@my-app/puck-editor";
import {
  AlignField,
  ToggleField,
  StackedTextField,
  ColorPickerField,
  BlockTabBar,
  TabSection,
  FourSideField,
  ResponsiveSpacingField,
  InlineSelect,
  SliderNumberField,
  EditorHideOverlay,
  buildResponsiveSpacingCss,
} from "@/puck-blocks/shared";

const ProgressBarComponent = {
  label: "Progress Bar",
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
          let destinationZone = "root:default-zone", destinationIndex = 0;
          const zones: Record<string, any[]> = { "root:default-zone": state.content, ...(state.zones ?? {}) };
          for (const [zone, items] of Object.entries(zones)) {
            const idx = (items as any[]).findIndex((it: any) => it.props?.id === selectedItem.props?.id);
            if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
          }
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
        };
        const bgType = props.advBgType ?? "none";
        const pbType = props.pbType ?? "line";
        const fillStyle = props.fillStyle ?? "solid";
        const showPct = props.showPercentage !== false;
        const rows: Array<{ label: string; value: number }> = props.multiRows ?? [{ label: "Row 1", value: 60 }, { label: "Row 2", value: 40 }];
        return (
          <BlockTabBar blockKey="ProgressBar">
            {(tab) => (
              <>
                {tab === "content" && (
                  <>
                    <InlineSelect label="Type" value={pbType} onChange={(v) => set("pbType", v)} options={[{ value: "line", label: "Line" }, { value: "circle", label: "Circle" }, { value: "semicircle", label: "Semi-Circle" }, { value: "step", label: "Step" }, { value: "multirow", label: "Multi Row" }]} />
                    {pbType !== "multirow" && (
                      <>
                        <StackedTextField label="Label" value={props.label ?? ""} onChange={(v) => set("label", v)} placeholder="Skill or metric..." />
                        <SliderNumberField label="Value (0–100)" value={props.value ?? 75} onChange={(v) => set("value", Math.min(100, Math.max(0, v)))} min={0} max={100} step={1} unit="%" />
                      </>
                    )}
                    <ToggleField label="Show Percentage" value={showPct} onChange={(v) => set("showPercentage", v)} />
                    {pbType === "multirow" && (
                      <>
                        <TabSection title="Rows" />
                        {rows.map((row, i) => (
                          <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 8px 4px", marginBottom: 6 }}>
                            <StackedTextField label={`Row ${i + 1} Label`} value={row.label} onChange={(v) => { const next = rows.map((r, j) => j === i ? { ...r, label: v } : r); set("multiRows", next); }} placeholder="Label..." />
                            <SliderNumberField label={`Row ${i + 1} Value`} value={row.value} onChange={(v) => { const next = rows.map((r, j) => j === i ? { ...r, value: Math.min(100, Math.max(0, v)) } : r); set("multiRows", next); }} min={0} max={100} step={1} unit="%" />
                            {rows.length > 1 && (
                              <button onClick={() => set("multiRows", rows.filter((_, j) => j !== i))} style={{ fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: "2px 0" }}>Remove row</button>
                            )}
                          </div>
                        ))}
                        <button onClick={() => set("multiRows", [...rows, { label: `Row ${rows.length + 1}`, value: 50 }])} style={{ fontSize: 12, color: "#0158ad", background: "none", border: "1px solid #0158ad", borderRadius: 4, cursor: "pointer", padding: "4px 10px", width: "100%", marginBottom: 8 }}>+ Add Row</button>
                      </>
                    )}
                  </>
                )}
                {tab === "style" && (
                  <>

                    {pbType === "line" && (
                      <>
                        <TabSection title="Line" />
                        <InlineSelect label="Fill Style" value={fillStyle} onChange={(v) => set("fillStyle", v)} options={[{ value: "solid", label: "Solid" }, { value: "striped", label: "Striped" }, { value: "gradient", label: "Gradient" }]} />
                        <ColorPickerField label="Fill Color" value={props.fillColor ?? "#0158ad"} onChange={(v) => set("fillColor", v)} />
                        {fillStyle === "gradient" && <ColorPickerField label="Gradient End Color" value={props.gradientEnd ?? "#60a5fa"} onChange={(v) => set("gradientEnd", v)} />}
                        <ColorPickerField label="Background Color" value={props.trackColor ?? "#e5e7eb"} onChange={(v) => set("trackColor", v)} />
                        <SliderNumberField label="Height (px)" value={props.lineHeight ?? 12} onChange={(v) => set("lineHeight", v)} min={4} max={60} step={1} unit="px" />
                        <SliderNumberField label="Border Radius (px)" value={props.lineRadius ?? 6} onChange={(v) => set("lineRadius", v)} min={0} max={50} step={1} unit="px" />
                      </>
                    )}

                    {pbType === "circle" && (
                      <>
                        <TabSection title="Circle" />
                        <SliderNumberField label="Size (px)" value={props.circleSize ?? 120} onChange={(v) => set("circleSize", v)} min={40} max={300} step={4} unit="px" />
                        <SliderNumberField label="Ring Thickness (px)" value={props.ringThickness ?? 10} onChange={(v) => set("ringThickness", v)} min={2} max={40} step={1} unit="px" />
                        <ColorPickerField label="Fill Color" value={props.fillColor ?? "#0158ad"} onChange={(v) => set("fillColor", v)} />
                        <ColorPickerField label="Background Color" value={props.trackColor ?? "#e5e7eb"} onChange={(v) => set("trackColor", v)} />
                        <ToggleField label="Show Label Inside" value={props.showLabelInside !== false} onChange={(v) => set("showLabelInside", v)} />
                      </>
                    )}

                    {pbType === "step" && (
                      <>
                        <TabSection title="Steps" />
                        <SliderNumberField label="Total Steps" value={props.totalSteps ?? 5} onChange={(v) => set("totalSteps", Math.max(1, v))} min={1} max={20} step={1} unit="" />
                        <SliderNumberField label="Active Step" value={props.activeStep ?? 3} onChange={(v) => set("activeStep", v)} min={0} max={props.totalSteps ?? 5} step={1} unit="" />
                        <ColorPickerField label="Active Color" value={props.fillColor ?? "#0158ad"} onChange={(v) => set("fillColor", v)} />
                        <ColorPickerField label="Inactive Color" value={props.trackColor ?? "#e5e7eb"} onChange={(v) => set("trackColor", v)} />
                        <ToggleField label="Show Step Numbers" value={!!props.showStepNumbers} onChange={(v) => set("showStepNumbers", v)} />
                      </>
                    )}

                    {pbType === "multirow" && (
                      <>
                        <TabSection title="Style" />
                        <InlineSelect label="Fill Style" value={fillStyle} onChange={(v) => set("fillStyle", v)} options={[{ value: "solid", label: "Solid" }, { value: "striped", label: "Striped" }, { value: "gradient", label: "Gradient" }]} />
                        <ColorPickerField label="Fill Color" value={props.fillColor ?? "#0158ad"} onChange={(v) => set("fillColor", v)} />
                        {fillStyle === "gradient" && <ColorPickerField label="Gradient End Color" value={props.gradientEnd ?? "#60a5fa"} onChange={(v) => set("gradientEnd", v)} />}
                        <ColorPickerField label="Background Color" value={props.trackColor ?? "#e5e7eb"} onChange={(v) => set("trackColor", v)} />
                        <SliderNumberField label="Height (px)" value={props.lineHeight ?? 12} onChange={(v) => set("lineHeight", v)} min={4} max={60} step={1} unit="px" />
                        <SliderNumberField label="Border Radius (px)" value={props.lineRadius ?? 6} onChange={(v) => set("lineRadius", v)} min={0} max={50} step={1} unit="px" />
                      </>
                    )}

                    {pbType === "semicircle" && (
                      <>
                        <TabSection title="Semi-Circle" />
                        <SliderNumberField label="Size (px)" value={props.circleSize ?? 160} onChange={(v) => set("circleSize", v)} min={60} max={400} step={4} unit="px" />
                        <SliderNumberField label="Ring Thickness (px)" value={props.ringThickness ?? 14} onChange={(v) => set("ringThickness", v)} min={2} max={60} step={1} unit="px" />
                        <ColorPickerField label="Fill Color" value={props.fillColor ?? "#0158ad"} onChange={(v) => set("fillColor", v)} />
                        <ColorPickerField label="Background Color" value={props.trackColor ?? "#e5e7eb"} onChange={(v) => set("trackColor", v)} />
                        <ToggleField label="Show Label Inside" value={props.showLabelInside !== false} onChange={(v) => set("showLabelInside", v)} />
                      </>
                    )}

                    <TabSection title="Common" />
                    <SliderNumberField label="Label Font Size (px)" value={props.labelFontSize ?? 14} onChange={(v) => set("labelFontSize", v)} min={8} max={48} step={1} unit="px" />
                    <ColorPickerField label="Label Color" value={props.labelColor ?? ""} onChange={(v) => set("labelColor", v)} />
                    {showPct && (
                      <>
                        <SliderNumberField label="Percentage Font Size (px)" value={props.pctFontSize ?? 13} onChange={(v) => set("pctFontSize", v)} min={8} max={48} step={1} unit="px" />
                        <ColorPickerField label="Percentage Color" value={props.pctColor ?? ""} onChange={(v) => set("pctColor", v)} />
                      </>
                    )}
                    <AlignField label="Alignment" value={props.alignment ?? "left"} onChange={(v) => set("alignment", v)} options={[{ value: "left", icon: <AlignLeft size={15} />, title: "Left" }, { value: "center", icon: <AlignCenter size={15} />, title: "Center" }, { value: "right", icon: <AlignRight size={15} />, title: "Right" }]} />
                    <InlineSelect label="Animation" value={props.animation ?? "none"} onChange={(v) => set("animation", v)} options={[{ value: "none", label: "None" }, { value: "fill", label: "Fill on Load" }]} />
                  </>
                )}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 8, right: 0, bottom: 8, left: 0 }} onChange={(v) => set("advPadding", v)} />
                    <TabSection title="Background" />
                    <InlineSelect label="Type" value={bgType} onChange={(v) => set("advBgType", v)} options={[{ value: "none", label: "None" }, { value: "color", label: "Color" }]} />
                    {bgType === "color" && <ColorPickerField label="Color" value={props.advBgColor ?? ""} onChange={(v) => set("advBgColor", v)} />}
                    <TabSection title="Responsive Spacing" />
                    <ResponsiveSpacingField value={props.responsiveSpacing} onChange={(v) => set("responsiveSpacing", v)} />
                    <TabSection title="Responsive" />
                    <ToggleField label="Hide on Desktop" value={!!props.hideDesktop} onChange={(v) => set("hideDesktop", v)} />
                    <ToggleField label="Hide on Tablet" value={!!props.hideTablet} onChange={(v) => set("hideTablet", v)} />
                    <ToggleField label="Hide on Mobile" value={!!props.hideMobile} onChange={(v) => set("hideMobile", v)} />
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
    label: "Skill", value: 75, showPercentage: true,
    pbType: "line",
    fillStyle: "solid", fillColor: "#0158ad", gradientEnd: "#60a5fa", trackColor: "#e5e7eb",
    lineHeight: 12, lineRadius: 6,
    circleSize: 120, ringThickness: 10,
    showLabelInside: true,
    totalSteps: 5, activeStep: 3, showStepNumbers: false,
    multiRows: [{ label: "Row 1", value: 60 }, { label: "Row 2", value: 40 }],
    labelFontSize: 14, labelColor: "",
    pctFontSize: 13, pctColor: "",
    alignment: "left", animation: "fill",
    advBgType: "none", advBgColor: "", advMargin: { top: 0, right: 0, bottom: 0, left: 0 }, advPadding: { top: 8, right: 0, bottom: 8, left: 0 },
    hideDesktop: false, responsiveSpacing: {}, hideTablet: false, hideMobile: false, cssId: "", cssClass: "", zIndex: null,
  },
  render: (props: any) => {
    const { label, value, showPercentage, pbType, fillStyle, fillColor, gradientEnd, trackColor, lineHeight, lineRadius, circleSize, ringThickness, showLabelInside, totalSteps, activeStep, showStepNumbers, multiRows, labelFontSize, labelColor, pctFontSize, pctColor, alignment, animation, advBgType, advBgColor, advMargin, advPadding, hideDesktop, hideTablet, hideMobile, cssId, cssClass, zIndex, id, responsiveSpacing } = props;
    const pct = Math.min(100, Math.max(0, value ?? 75));
    const animFill = animation === "fill";
    const [displayed, setDisplayed] = useState(animFill ? 0 : pct);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (!animFill) { setDisplayed(pct); return; }
      const el = ref.current;
      if (!el) return;
      const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setDisplayed(pct); obs.disconnect(); } }, { threshold: 0.2 });
      obs.observe(el);
      return () => obs.disconnect();
    }, [pct, animFill]);
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");
    const fc = fillColor || "#0158ad";
    const tc = trackColor || "#e5e7eb";
    const lfs = labelFontSize || 14;
    const pfs = pctFontSize || 13;
    const lc = labelColor || "var(--text-color)";
    const pc = pctColor || "var(--text-color)";
    const alignStyle: React.CSSProperties = { textAlign: alignment === "center" ? "center" : alignment === "right" ? "right" : "left" };

    const fillBg = (() => {
      if (fillStyle === "gradient") return `linear-gradient(90deg, ${fc}, ${gradientEnd || "#60a5fa"})`;
      if (fillStyle === "striped") return `${fc} repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.2) 8px, rgba(255,255,255,0.2) 16px)`;
      return fc;
    })();

    const wrapStyle: React.CSSProperties = {
      paddingTop: advPadding?.top ?? 8, paddingRight: advPadding?.right ?? 0, paddingBottom: advPadding?.bottom ?? 8, paddingLeft: advPadding?.left ?? 0,
      marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0, marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0,
      zIndex: zIndex ?? undefined, ...(advBgType === "color" && advBgColor ? { backgroundColor: advBgColor } : {}),
      ...alignStyle,
    };

    const renderLine = (rowLabel: string, rowPct: number, rowDisplayed: number, key?: number) => (
      <div key={key} style={{ marginBottom: key !== undefined ? 12 : 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8 }}>
          {rowLabel && <span style={{ fontSize: lfs, color: lc, flex: 1 }}>{rowLabel}</span>}
          {showPercentage && <span style={{ fontSize: pfs, color: pc, fontWeight: 600, flexShrink: 0 }}>{rowPct}%</span>}
        </div>
        <div className="pb-bar-track" style={{ position: "relative", height: lineHeight || 12, backgroundColor: tc, borderRadius: lineRadius ?? 6, overflow: "hidden" }}>
          <div className="pb-bar-fill" style={{ height: "100%", width: `${rowDisplayed}%`, background: fillBg, borderRadius: lineRadius ?? 6, transition: animFill ? "width 900ms ease" : undefined }} />
        </div>
      </div>
    );

    const renderCircleSvg = (sz: number, thick: number, disp: number) => {
      const r = (sz - thick) / 2;
      const cx = sz / 2, cy = sz / 2;
      const circ = 2 * Math.PI * r;
      const dash = (disp / 100) * circ;
      return (
        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={tc} strokeWidth={thick} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={fc} strokeWidth={thick} strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`} style={{ transition: animFill ? "stroke-dasharray 900ms ease" : undefined }} />
        </svg>
      );
    };

    // Semi-circle: draws only the top 180° arc
    const renderSemiCircleSvg = (sz: number, thick: number, disp: number) => {
      const r = (sz - thick) / 2;
      const cx = sz / 2;
      const cy = sz / 2;
      const halfCirc = Math.PI * r; // half circumference
      const dash = (disp / 100) * halfCirc;
      // Full circle but only top half visible — rotate so arc starts at left
      const fullCirc = 2 * Math.PI * r;
      return (
        <svg width={sz} height={sz / 2 + thick} viewBox={`0 0 ${sz} ${sz / 2 + thick}`} style={{ overflow: "visible" }}>
          {/* background track arc */}
          <path
            d={`M ${thick / 2} ${cy} A ${r} ${r} 0 0 1 ${sz - thick / 2} ${cy}`}
            fill="none" stroke={tc} strokeWidth={thick} strokeLinecap="round"
          />
          {/* fill arc */}
          <path
            d={`M ${thick / 2} ${cy} A ${r} ${r} 0 0 1 ${sz - thick / 2} ${cy}`}
            fill="none" stroke={fc} strokeWidth={thick} strokeLinecap="round"
            strokeDasharray={`${dash} ${halfCirc}`}
            style={{ transition: animFill ? "stroke-dasharray 900ms ease" : undefined }}
          />
        </svg>
      );
    };

    const type = pbType ?? "line";

    return (
      <div ref={ref} id={cssId || undefined}
        data-pb-rs={id} className={[hideClasses, cssClass].filter(Boolean).join(" ") || undefined} style={{ ...wrapStyle, position: "relative" }}>
        <EditorHideOverlay hideDesktop={hideDesktop} hideTablet={hideTablet} hideMobile={hideMobile} />
        {(() => { const rsCss = buildResponsiveSpacingCss(`[data-pb-rs="${id}"]`, responsiveSpacing); return rsCss ? <style>{rsCss}</style> : null; })()}
        {type === "line" && renderLine(label ?? "", pct, displayed)}

        {type === "circle" && (
          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ position: "relative", width: circleSize || 120, height: circleSize || 120 }}>
              {renderCircleSvg(circleSize || 120, ringThickness || 10, displayed)}
              {showLabelInside !== false && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  {showPercentage && <span style={{ fontSize: pfs, color: pc, fontWeight: 700, lineHeight: 1 }}>{pct}%</span>}
                  {label && <span style={{ fontSize: lfs * 0.78, color: lc, lineHeight: 1 }}>{label}</span>}
                </div>
              )}
            </div>
            {showLabelInside === false && label && <span style={{ fontSize: lfs, color: lc }}>{label}</span>}
          </div>
        )}

        {type === "semicircle" && (() => {
          const sz = circleSize || 160;
          const thick = ringThickness || 14;
          const halfH = sz / 2 + thick;
          return (
            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ position: "relative", width: sz, height: halfH }}>
                {renderSemiCircleSvg(sz, thick, displayed)}
                {showLabelInside !== false && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 4 }}>
                    {showPercentage && <span style={{ fontSize: pfs, color: pc, fontWeight: 700, lineHeight: 1.2 }}>{pct}%</span>}
                    {label && <span style={{ fontSize: lfs * 0.8, color: lc, marginTop: 2 }}>{label}</span>}
                  </div>
                )}
              </div>
              {showLabelInside === false && label && <span style={{ fontSize: lfs, color: lc }}>{label}</span>}
            </div>
          );
        })()}

        {type === "step" && (() => {
          const total = Math.max(1, totalSteps ?? 5);
          const active = Math.min(total, Math.max(0, activeStep ?? 3));
          return (
            <div>
              {label && <div style={{ fontSize: lfs, color: lc, marginBottom: 8 }}>{label}</div>}
              <div style={{ display: "flex", gap: 6 }}>
                {Array.from({ length: total }, (_, i) => (
                  <div key={i} style={{ flex: 1, height: lineHeight || 12, borderRadius: lineRadius ?? 6, backgroundColor: i < active ? fc : tc, display: "flex", alignItems: "center", justifyContent: "center", transition: animFill ? "background-color 400ms ease" : undefined }}>
                    {showStepNumbers && <span style={{ fontSize: Math.max(9, (lineHeight || 12) - 3), color: i < active ? "#fff" : lc }}>{i + 1}</span>}
                  </div>
                ))}
              </div>
              {showPercentage && <div style={{ fontSize: pfs, color: pc, marginTop: 6 }}>{Math.round((active / total) * 100)}%</div>}
            </div>
          );
        })()}

        {type === "multirow" && (() => {
          const rowData: Array<{ label: string; value: number }> = multiRows ?? [{ label: "Row 1", value: 60 }];
          return (
            <div>
              {rowData.map((row, i) => {
                const rowPct = Math.min(100, Math.max(0, row.value));
                return renderLine(row.label, rowPct, rowPct, i);
              })}
            </div>
          );
        })()}
      </div>
    );
  },
};

export { ProgressBarComponent };
