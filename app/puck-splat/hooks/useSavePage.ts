import { useState, useCallback } from "react";
import type { Data } from "@my-app/puck-editor";
import type { PuckData } from "@/lib/page-schema";
import type { GlobalSettings } from "@/lib/settings.defaults";
import { computeContentSize } from "./useContentSize";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/** Strip runtime-only root props before persisting. */
function cleanData(data: Data, pageTitle: string): Data {
  return {
    ...data,
    root: {
      ...data.root,
      props: { title: data.root?.props?.title ?? pageTitle },
    },
  };
}

export interface UseSavePageOptions {
  /**
   * Live global settings used to preflight the rendered page size. Without
   * this the server still catches oversize pages but the user pays a network
   * round-trip to learn so.
   */
  settings: GlobalSettings;
}

export function useSavePage(slug: string, pageTitle: string, opts: UseSavePageOptions) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (data: Data): Promise<boolean> => {
      setStatus("saving");
      setError(null);

      // Client-side preflight: synchronous render+size check using the same
      // builder the server uses. Closes the race window where the user types
      // big content and clicks Save before the debounced indicator catches up.
      try {
        const size = computeContentSize(data as unknown as PuckData, opts.settings);
        if (size.isOver) {
          setError(
            `Page is too large to publish (${size.kb} KB / ${size.limitKb} KB). Remove some content and try again.`,
          );
          setStatus("error");
          setTimeout(() => { setStatus("idle"); setError(null); }, 5000);
          return false;
        }
      } catch {
        // If the size check itself fails we still let the network call run —
        // the server has its own preflight as a safety net.
      }

      try {
        const res = await fetch("/api/save-page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, data: cleanData(data, pageTitle) }),
        });

        const json = await res.json();
        if (!res.ok || !json.ok) throw new Error(json.error ?? "Save failed");

        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2500);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
        setTimeout(() => { setStatus("idle"); setError(null); }, 4000);
        return false;
      }
    },
    [slug, pageTitle, opts.settings],
  );

  return { status, error, save };
}
