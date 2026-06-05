export type BlockItem = {
  id: string;
  type: string;
  props: Record<string, unknown>;
  [key: string]: unknown;
};

export type SavedBlock = {
  id: string;
  name: string;
  content: BlockItem[];
  thumbnail?: string;
};

// Single source of truth: import from the server lib (type-only, erased at runtime)
export type { GlobalBlock } from "@/lib/global-blocks.server";

