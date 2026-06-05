/**
 * resolve-blocks.ts
 *
 * The page builder stores GlobalBlock / SavedBlock items in page data as
 * *references* (so the editor can show the "Global Block" placeholder and keep
 * one source of truth). Before a page is rendered for viewing — preview tab or
 * Shopify export — those references must be expanded into the real Puck items
 * they point at, otherwise the string renderer (which only knows concrete
 * component types) silently drops them and the page comes out blank.
 *
 * Mirrors my-app-next's resolve-global-blocks.ts / resolve-saved-blocks.ts,
 * adapted to this app's storage:
 *   • GlobalBlock items carry props.globalBlockId === GlobalBlock.id
 *     (types: "GlobalBlock" for click-insert, "GlobalBlock_<id>" for drag-drop)
 *   • SavedBlock items use type "SavedBlock_<name>" → SavedBlock.name
 *
 * Pure data transform — no server-only deps. Safe to import anywhere.
 */

import type { PuckData, PuckBlock } from "./page-schema";
import type { GlobalBlock } from "./global-blocks.server";
import type { SavedBlock } from "./saved-blocks.server";

type Block = PuckBlock & { id?: string };
type Zones = Record<string, Block[]>;

function isGlobalBlockRef(type: string): boolean {
  return type === "GlobalBlock" || type.startsWith("GlobalBlock_");
}

/** Resolve the GlobalBlock id from either the props or the "GlobalBlock_<id>" type. */
function globalBlockId(item: Block): string | undefined {
  const fromProps = (item.props as { globalBlockId?: string } | undefined)?.globalBlockId;
  if (fromProps) return fromProps;
  if (item.type.startsWith("GlobalBlock_")) return item.type.slice("GlobalBlock_".length);
  return undefined;
}

/**
 * Replace every GlobalBlock / SavedBlock reference (in content and zones) with
 * the concrete items it stands for. Zones contributed by a resolved global
 * block (nested DropZones, e.g. DoubleColumn/GridBlock slots) are merged in so
 * the renderer's `<blockId>:<zone>` lookups still resolve.
 */
export function resolvePageBlocks(
  data: PuckData,
  globalBlocksMap: Record<string, GlobalBlock>,
  savedBlocksMap: Record<string, SavedBlock>,
): PuckData {
  // Zones pulled in from resolved global blocks (their inner slot content).
  const extraZones: Zones = {};

  function resolveItems(items: Block[]): Block[] {
    const resolved: Block[] = [];
    for (const item of items ?? []) {
      const type = item?.type;
      if (!type) continue;

      if (isGlobalBlockRef(type)) {
        const gb = globalBlocksMap[globalBlockId(item) ?? ""];
        if (gb?.content?.length) {
          resolved.push(...(gb.content as Block[]));
          if (gb.zones) Object.assign(extraZones, gb.zones as Zones);
        }
        // Deleted / empty global block → reference is silently dropped.
        continue;
      }

      if (type.startsWith("SavedBlock_")) {
        const saved = savedBlocksMap[type.slice("SavedBlock_".length)];
        if (saved?.content?.length) {
          const [rootItem, ...rest] = saved.content as Block[];
          // Page-stored props (the user's field-panel edits) win over the
          // saved block's baseline props on its root item.
          resolved.push({ ...rootItem, props: { ...rootItem.props, ...item.props } });
          resolved.push(...rest);
        }
        continue;
      }

      resolved.push(item);
    }
    return resolved;
  }

  const resolvedZones: Zones = {};
  for (const [key, items] of Object.entries(data.zones ?? {})) {
    resolvedZones[key] = resolveItems(items as Block[]);
  }
  // extraZones is populated while resolving content/zones above, so merge last.
  const content = resolveItems((data.content ?? []) as Block[]);

  return {
    ...data,
    content,
    zones: { ...extraZones, ...resolvedZones },
  };
}
