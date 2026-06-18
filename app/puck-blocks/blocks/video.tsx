// @ts-nocheck
// ─── VideoComponent ───

import type * as React from "react";
import { useState } from "react";
import { usePuck } from "@my-app/puck-editor";
import {
  ToggleField,
  StackedTextField,
  BlockTabBar,
  TabSection,
  FourSideField,
  InlineSelect,
  SliderNumberField,
  SliderUnitField,
} from "@/puck-blocks/shared";
import {
  VideoUploadField,
} from "@/puck-blocks/block-fields";

const VideoComponent = {
  label: "Video",
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
            if (idx !== -1) { destinationZone = zone; destinationIndex = idx; break; }
          }
          dispatch({ type: "replace", destinationZone, destinationIndex, data: { ...selectedItem, props: { ...(selectedItem.props ?? {}), [key]: val } } });
        };

        return (
          <BlockTabBar blockKey="Video">
            {(tab) => (
              <>
                {/* ── CONTENT TAB ── */}
                {tab === "content" && (
                  <>
                    <InlineSelect
                      label="Source Type"
                      value={props.sourceType ?? "youtube"}
                      onChange={(v) => set("sourceType", v)}
                      options={[
                        { value: "youtube", label: "YouTube" },
                        { value: "vimeo", label: "Vimeo" },
                        { value: "upload", label: "Upload File" },
                      ]}
                    />
                    {props.sourceType === "upload" ? (
                      <VideoUploadField value={props.videoUrl ?? ""} onChange={(v) => set("videoUrl", v)} />
                    ) : (
                      <StackedTextField label="Video URL" value={props.videoUrl ?? ""} onChange={(v) => set("videoUrl", v)} placeholder="https://..." />
                    )}
                    <ToggleField label="Autoplay" value={!!props.autoplay} onChange={(v) => set("autoplay", v)} />
                    <ToggleField label="Loop" value={!!props.loop} onChange={(v) => set("loop", v)} />
                    <InlineSelect
                      label="Controls"
                      value={props.controls ?? "show"}
                      onChange={(v) => set("controls", v)}
                      options={[
                        { value: "show", label: "Show" },
                        { value: "hide", label: "Hide" },
                      ]}
                    />
                    <ToggleField label="Play Inline" value={props.playInline !== false} onChange={(v) => set("playInline", v)} />
                  </>
                )}

                {/* ── STYLE TAB ── */}
                {tab === "style" && (
                  <>
                    <TabSection title="Sizing" />
                    <InlineSelect
                      label="Aspect Ratio"
                      value={props.aspectRatio ?? "16:9"}
                      onChange={(v) => set("aspectRatio", v)}
                      options={[
                        { value: "16:9", label: "16:9 (Widescreen)" },
                        { value: "4:3", label: "4:3 (Standard)" },
                        { value: "1:1", label: "1:1 (Square)" },
                      ]}
                    />
                    <SliderUnitField
                      label="Width"
                      value={props.videoWidthVal ?? 100}
                      unit="%"
                      onValueChange={(v) => set("videoWidthVal", v)}
                      onUnitChange={() => {}}
                      units={["%"]}
                      step={1}
                    />

                    <TabSection title="Border" />
                    <SliderNumberField label="Border Radius (px)" value={props.borderRadius ?? 0} onChange={(v) => set("borderRadius", v)} min={0} max={100} step={1} unit="px" />
                  </>
                )}

                {/* ── ADVANCED TAB ── */}
                {tab === "advanced" && (
                  <>
                    <TabSection title="Spacing" />
                    <FourSideField label="Margin (px)" value={props.advMargin} onChange={(v) => set("advMargin", v)} />
                    <FourSideField label="Padding (px)" value={props.advPadding ?? { top: 0, right: 0, bottom: 0, left: 0 }} onChange={(v) => set("advPadding", v)} />

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
    sourceType: "youtube",
    videoUrl: "",
    autoplay: false,
    loop: false,
    controls: "show",
    playInline: true,
    aspectRatio: "16:9",
    videoWidthVal: 100,
    videoWidthUnit: "%",
    playBtnStyle: "default",
    playIconSize: 64,
    playIconColor: "#fff",
    playBtnBg: "rgba(0,0,0,0.5)",
    playBtnRadius: 50,
    borderRadius: 0,
    advMargin: { top: 0, right: 0, bottom: 0, left: 0 },
    advPadding: { top: 0, right: 0, bottom: 0, left: 0 },
    hideDesktop: false,
    hideTablet: false,
    hideMobile: false,
    cssId: "",
    cssClass: "",
    zIndex: null,
  },

  render: ({
    sourceType,
    videoUrl,
    autoplay,
    loop,
    controls,
    playInline,
    aspectRatio,
    videoWidthVal,
    videoWidthUnit,
    playBtnStyle,
    playIconSize,
    playIconColor,
    playBtnBg,
    playBtnRadius,
    borderRadius,
    advMargin,
    advPadding,
    hideDesktop,
    hideTablet,
    hideMobile,
    cssId,
    cssClass,
    zIndex,
  }) => {
    const [playing, setPlaying] = useState(false);

    const ratioMap: Record<string, string> = { "16:9": "56.25%", "4:3": "75%", "1:1": "100%" };
    const paddingBottom = ratioMap[aspectRatio ?? "16:9"] ?? "56.25%";
    const hideClasses = [hideDesktop ? "puck-hide-desktop" : "", hideTablet ? "puck-hide-tablet" : "", hideMobile ? "puck-hide-mobile" : ""].filter(Boolean).join(" ");

    const buildEmbedUrl = (forcePlay = false) => {
      if (!videoUrl) return "";
      if (sourceType === "youtube") {
        const match = videoUrl.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
        const id = match?.[1] ?? "";
        const params = new URLSearchParams();
        if (autoplay || forcePlay) params.set("autoplay", "1");
        if (loop) { params.set("loop", "1"); params.set("playlist", id); }
        params.set("mute", "1"); // always muted
        if (controls === "hide") params.set("controls", "0");
        return `https://www.youtube.com/embed/${id}?${params.toString()}`;
      }
      if (sourceType === "vimeo") {
        const match = videoUrl.match(/vimeo\.com\/(\d+)/);
        const id = match?.[1] ?? "";
        const params = new URLSearchParams();
        if (autoplay || forcePlay) params.set("autoplay", "1");
        if (loop) params.set("loop", "1");
        params.set("muted", "1"); // always muted
        if (controls === "hide") params.set("controls", "0");
        return `https://player.vimeo.com/video/${id}?${params.toString()}`;
      }
      return videoUrl;
    };

    const isNative = sourceType === "self" || sourceType === "upload";
    const btnSize = playIconSize || 64;
    const btnBg = playBtnBg || "rgba(0,0,0,0.5)";
    const btnRadius = playBtnStyle === "custom" ? `${playBtnRadius ?? 50}px` : "50%";
    const btnColor = playIconColor || "#fff";

    const containerStyle: React.CSSProperties = {
      position: "relative",
      width: `${videoWidthVal ?? 100}%`,
      paddingBottom,
      height: 0,
      overflow: "hidden",
      borderRadius: `${borderRadius ?? 0}px`,
      backgroundColor: "#000",
    };

    if (!videoUrl) return (
      <div style={{ padding: 24, border: "2px dashed #e5e7eb", borderRadius: 8, color: "#9ca3af", fontSize: 14, textAlign: "center" }}>
        No video URL set. Use the property panel to add a video.
      </div>
    );

    const playOverlayBtn = (
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ width: btnSize, height: btnSize, backgroundColor: btnBg, borderRadius: btnRadius, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={btnSize * 0.4} height={btnSize * 0.4} viewBox="0 0 24 24" fill={btnColor}>
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
    );

    const videoEl = videoUrl ? (
      isNative ? (
        <video
          key={videoUrl}
          src={videoUrl}
          autoPlay={playing || autoplay}
          loop={loop}
          muted
          controls={controls !== "hide"}
          playsInline={playInline !== false}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <iframe
          src={buildEmbedUrl(playing)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    ) : null;

    void playOverlayBtn; void setPlaying;

    return (
      <div
        id={cssId || undefined}
        className={[cssClass].filter(Boolean).join(" ") || undefined}
        style={{
          paddingTop: advPadding?.top ?? 0, paddingRight: advPadding?.right ?? 0,
          paddingBottom: advPadding?.bottom ?? 0, paddingLeft: advPadding?.left ?? 0,
          marginTop: advMargin?.top ?? 0, marginRight: advMargin?.right ?? 0,
          marginBottom: advMargin?.bottom ?? 0, marginLeft: advMargin?.left ?? 0,
          zIndex: zIndex ?? undefined,
        }}
      >
        <div style={containerStyle}>
          {videoEl}
        </div>
      </div>
    );
  },
};

export { VideoComponent };
