import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import {
  getAllGlobalBlocks,
  createGlobalBlock,
  updateGlobalBlock,
  deleteGlobalBlock,
} from "../lib/global-blocks.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const blocks = await getAllGlobalBlocks(session.shop);
  return new Response(JSON.stringify(blocks), {
    headers: { "Content-Type": "application/json" },
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  if (request.method === "POST") {
    const { name, content, zones } = await request.json();
    const block = await createGlobalBlock(session.shop, name, content, zones);
    return new Response(JSON.stringify(block), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (request.method === "PUT") {
    const { id, content, zones } = await request.json();
    const block = await updateGlobalBlock(session.shop, id, content, zones);
    return new Response(JSON.stringify(block), {
      headers: { "Content-Type": "application/json" },
    });
  }
  if (request.method === "DELETE") {
    const { id } = await request.json();
    await deleteGlobalBlock(session.shop, id);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response("Method not allowed", { status: 405 });
};
