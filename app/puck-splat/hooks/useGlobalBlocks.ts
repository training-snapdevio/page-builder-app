import { useCallback, useEffect, useState } from "react";
import { usePuck } from "@my-app/puck-editor";
import type { GlobalBlock } from "../types";
import { GLOBAL_BLOCKS_REFRESH_EVENT } from "../constants";
import { replaceItemById } from "../utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type UseGlobalBlocksReturn = {
  blocks: GlobalBlock[];
  loading: boolean;
  deleting: string | null;
  fetchBlocks: () => Promise<void>;
  insertBlock: (block: GlobalBlock) => void;
  deleteBlock: (id: string) => Promise<void>;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGlobalBlocks(): UseGlobalBlocksReturn {
  const { dispatch, appState } = usePuck();
  const [blocks, setBlocks] = useState<GlobalBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/global-blocks");
      setBlocks(await res.json());
    } catch {
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlocks();
    window.addEventListener(GLOBAL_BLOCKS_REFRESH_EVENT, fetchBlocks);
    return () => window.removeEventListener(GLOBAL_BLOCKS_REFRESH_EVENT, fetchBlocks);
  }, [fetchBlocks]);

  /** Insert a GlobalBlock reference (thin pointer) into the canvas. */
  const insertBlock = useCallback(
    (block: GlobalBlock) => {
      const newItem = {
        type: "GlobalBlock",
        props: {
          id: `GlobalBlock-${crypto.randomUUID()}`,
          globalBlockId: block.id,
          _name: block.name,
        },
      };
      dispatch({
        type: "setData",
        data: {
          ...appState.data,
          content: [newItem, ...(appState.data.content ?? [])],
        },
      });
    },
    [dispatch, appState.data],
  );

  const deleteBlock = useCallback(
    async (id: string) => {
      setDeleting(id);
      try {
        await fetch("/api/global-blocks", {
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

