import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import {
  getSavedBlocks,
  createSavedBlock,
  deleteSavedBlock,
} from "../lib/saved-blocks.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const blocks = await getSavedBlocks(session.shop);
  return new Response(JSON.stringify(blocks), {
    headers: { "Content-Type": "application/json" },
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  if (request.method === "POST") {
    const { name, content, zones, blockType, thumbnail } = await request.json();
    const block = await createSavedBlock(session.shop, name, content, zones, blockType, thumbnail);
    return new Response(JSON.stringify(block), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (request.method === "DELETE") {
    const { id } = await request.json();
    await deleteSavedBlock(session.shop, id);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response("Method not allowed", { status: 405 });
};
