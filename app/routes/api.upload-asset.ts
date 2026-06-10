/**
 * POST /api/upload-asset
 *
 * Uploads a file (image / video) to Shopify Files and returns the public CDN
 * URL. Solves the data-URL problem for the page builder: uploaded videos and
 * large images were being inlined as `data:` URLs which exceed Shopify's
 * 512 KB page-body limit and get stripped by Shopify's HTML sanitizer.
 *
 * Flow (per Shopify Files docs):
 *   1. stagedUploadsCreate → returns a presigned upload URL + form params
 *   2. POST the file to that URL
 *   3. fileCreate → registers the asset against the shop
 *   4. For VIDEO: poll node(id) until the CDN sources are populated
 *
 * Request: multipart/form-data with field `file`
 * Response: { ok: true; url: string } | { ok: false; error: string }
 */
import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

type AdminClient = Awaited<ReturnType<typeof authenticate.admin>>["admin"];

const VIDEO_PROCESSING_TIMEOUT_MS = 120_000;
const VIDEO_POLL_INTERVAL_MS = 2_000;

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  const { admin } = await authenticate.admin(request);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ ok: false, error: "Expected multipart/form-data" }, 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return json({ ok: false, error: "Missing `file` field" }, 400);
  }

  const mimeType = file.type || "application/octet-stream";
  const isVideo = mimeType.startsWith("video/");
  const isImage = mimeType.startsWith("image/");
  const resource = isVideo ? "VIDEO" : isImage ? "IMAGE" : "FILE";
  const contentType = isVideo ? "VIDEO" : isImage ? "IMAGE" : "FILE";

  try {
    // 1. Get a presigned staged-upload target.
    const staged = await stagedUploadsCreate(admin, {
      filename: file.name || `asset-${Date.now()}`,
      mimeType,
      fileSize: String(file.size),
      resource,
    });

    // 2. Upload the file bytes to the staged URL.
    const uploadForm = new FormData();
    for (const { name, value } of staged.parameters) {
      uploadForm.append(name, value);
    }
    uploadForm.append("file", file);

    const uploadRes = await fetch(staged.url, { method: "POST", body: uploadForm });
    if (!uploadRes.ok) {
      const text = await uploadRes.text().catch(() => "");
      throw new Error(`Staged upload failed (${uploadRes.status}): ${text.slice(0, 200)}`);
    }

    // 3. Register the file against the shop.
    const fileId = await fileCreate(admin, staged.resourceUrl, contentType);

    // 4. Resolve to a playable CDN URL. Images are usable immediately; videos
    //    require waiting for Shopify's transcoder.
    const url = isVideo
      ? await pollVideoSourceUrl(admin, fileId)
      : await pollImageUrl(admin, fileId);

    return json({ ok: true, url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ ok: false, error: message }, 500);
  }
};

// ─── Shopify GraphQL helpers ──────────────────────────────────────────────────

const STAGED_UPLOADS_CREATE = `#graphql
  mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters { name value }
      }
      userErrors { field message }
    }
  }
`;

const FILE_CREATE = `#graphql
  mutation FileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files { id fileStatus }
      userErrors { field message }
    }
  }
`;

const NODE_VIDEO = `#graphql
  query VideoNode($id: ID!) {
    node(id: $id) {
      ... on Video {
        id
        fileStatus
        fileErrors { code details message }
        sources { url mimeType format height width fileSize }
      }
    }
  }
`;

const NODE_IMAGE = `#graphql
  query ImageNode($id: ID!) {
    node(id: $id) {
      ... on MediaImage {
        id
        fileStatus
        fileErrors { code details message }
        image { url }
      }
    }
  }
`;

type StagedTarget = {
  url: string;
  resourceUrl: string;
  parameters: { name: string; value: string }[];
};

async function stagedUploadsCreate(
  admin: AdminClient,
  input: { filename: string; mimeType: string; fileSize: string; resource: string },
): Promise<StagedTarget> {
  const res = await admin.graphql(STAGED_UPLOADS_CREATE, {
    variables: {
      input: [{ ...input, httpMethod: "POST" }],
    },
  });
  const json = (await res.json()) as {
    data?: {
      stagedUploadsCreate?: {
        stagedTargets?: StagedTarget[];
        userErrors?: { field: string; message: string }[];
      };
    };
  };
  const errors = json.data?.stagedUploadsCreate?.userErrors ?? [];
  if (errors.length) {
    throw new Error(`stagedUploadsCreate: ${errors.map((e) => e.message).join(", ")}`);
  }
  const target = json.data?.stagedUploadsCreate?.stagedTargets?.[0];
  if (!target) throw new Error("stagedUploadsCreate returned no target");
  return target;
}

async function fileCreate(
  admin: AdminClient,
  resourceUrl: string,
  contentType: string,
): Promise<string> {
  const res = await admin.graphql(FILE_CREATE, {
    variables: {
      files: [{ originalSource: resourceUrl, contentType }],
    },
  });
  const json = (await res.json()) as {
    data?: {
      fileCreate?: {
        files?: { id: string }[];
        userErrors?: { field: string; message: string }[];
      };
    };
  };
  const errors = json.data?.fileCreate?.userErrors ?? [];
  if (errors.length) {
    throw new Error(`fileCreate: ${errors.map((e) => e.message).join(", ")}`);
  }
  const id = json.data?.fileCreate?.files?.[0]?.id;
  if (!id) throw new Error("fileCreate returned no file ID");
  return id;
}

async function pollImageUrl(admin: AdminClient, id: string): Promise<string> {
  for (let i = 0; i < 30; i++) {
    const res = await admin.graphql(NODE_IMAGE, { variables: { id } });
    const json = (await res.json()) as {
      data?: {
        node?: {
          fileStatus?: string;
          fileErrors?: { message: string }[];
          image?: { url?: string };
        };
      };
    };
    const node = json.data?.node;
    if (node?.fileErrors?.length) {
      throw new Error(node.fileErrors.map((e) => e.message).join(", "));
    }
    if (node?.image?.url) return node.image.url;
    await sleep(1000);
  }
  throw new Error("Image upload did not become ready in time");
}

async function pollVideoSourceUrl(admin: AdminClient, id: string): Promise<string> {
  const deadline = Date.now() + VIDEO_PROCESSING_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const res = await admin.graphql(NODE_VIDEO, { variables: { id } });
    const json = (await res.json()) as {
      data?: {
        node?: {
          fileStatus?: string;
          fileErrors?: { message: string }[];
          sources?: { url: string; format: string; fileSize: number }[];
        };
      };
    };
    const node = json.data?.node;
    if (node?.fileErrors?.length) {
      throw new Error(node.fileErrors.map((e) => e.message).join(", "));
    }
    if (node?.fileStatus === "READY" && node.sources && node.sources.length > 0) {
      // Prefer mp4 if present, otherwise the largest source (highest quality).
      const mp4 = node.sources.find((s) => s.format === "mp4");
      const picked = mp4 ?? node.sources.reduce((a, b) => (a.fileSize > b.fileSize ? a : b));
      return picked.url;
    }
    if (node?.fileStatus === "FAILED") {
      throw new Error("Shopify failed to process the uploaded video");
    }
    await sleep(VIDEO_POLL_INTERVAL_MS);
  }
  throw new Error(
    "Video is still processing on Shopify. It will appear shortly once Shopify finishes transcoding — re-save the page in a minute.",
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
