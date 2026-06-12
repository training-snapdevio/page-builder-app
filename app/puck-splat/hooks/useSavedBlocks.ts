import { useCallback, useEffect, useState } from "react";
import { usePuck } from "@my-app/puck-editor";
import type { SavedBlock } from "../types";
import { deepCloneWithIds, collectSavedBlockIds } from "../utils";
import { SAVED_BLOCKS_REFRESH_EVENT } from "../constants";

// ─── Types ────────────────────────────────────────────────────────────────────

type UseSavedBlocksReturn = {
  blocks: SavedBlock[];
  loading: boolean;
  deleting: string | null;
  fetchBlocks: () => Promise<void>;
  insertBlock: (block: SavedBlock) => void;
  deleteBlock: (id: string) => Promise<void>;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSavedBlocks(): UseSavedBlocksReturn {
  const { dispatch, appState } = usePuck();

  const [blocks, setBlocks] = useState<SavedBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/saved-blocks");
      setBlocks(await res.json());
    } catch {
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + refresh listener
  useEffect(() => {
    fetchBlocks();
    window.addEventListener(SAVED_BLOCKS_REFRESH_EVENT, fetchBlocks);
    return () => window.removeEventListener(SAVED_BLOCKS_REFRESH_EVENT, fetchBlocks);
  }, [fetchBlocks]);

  const insertBlock = useCallback(
    (block: SavedBlock) => {
      if (!block?.content) return;

      const clonedContent = deepCloneWithIds(block.content);
      collectSavedBlockIds(clonedContent);

      // For container-type blocks (Section, Container, Grid) restore zone children.
      // Zone keys contain the saved block's original id — remap them to the new cloned id.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clonedZones: Record<string, any> = {};
      if (block.blockType === "section" && block.zones && block.content[0]) {
        const originalId = (block.content[0] as any).props?.id as string | undefined;
        const newId = (clonedContent[0] as any)?.props?.id as string | undefined;
        for (const [key, items] of Object.entries(block.zones)) {
          // Replace old id in the zone key with the new cloned id
          const remappedKey = originalId && newId ? key.replace(originalId, newId) : key;
          clonedZones[remappedKey] = deepCloneWithIds(items as import("../types").BlockItem[]);
        }
      }

      dispatch({
        type: "setData",
        data: {
          ...appState.data,
          content: [...clonedContent, ...(appState.data.content ?? [])],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          zones: { ...(appState.data.zones ?? {}), ...clonedZones } as any,
        },
      });
    },
    [dispatch, appState.data],
  );

  const deleteBlock = useCallback(
    async (id: string) => {
      setDeleting(id);
      try {
        await fetch("/api/saved-blocks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        await fetchBlocks();
      } finally {
        setDeleting(null);
      }
    },
    [fetchBlocks],
  );

  return { blocks, loading, deleting, fetchBlocks, insertBlock, deleteBlock };
}

