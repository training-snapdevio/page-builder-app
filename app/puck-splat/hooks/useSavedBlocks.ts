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

      dispatch({
        type: "setData",
        data: {
          ...appState.data,
          content: [...clonedContent, ...(appState.data.content ?? [])],
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

