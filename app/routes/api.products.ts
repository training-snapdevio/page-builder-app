import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

const PRODUCTS_QUERY = `#graphql
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query, sortKey: TITLE) {
      edges {
        node {
          id
          title
          handle
          status
          priceRangeV2 {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
          featuredImage { url altText }
          images(first: 1) {
            edges { node { url altText } }
          }
        }
      }
    }
  }
`;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const search = url.searchParams.get("q") || "";
  const first = Math.min(Number(url.searchParams.get("first") || "20"), 50);

  const res = await admin.graphql(PRODUCTS_QUERY, {
    variables: { first, query: search ? `title:*${search}*` : "" },
  });
  const json = await res.json() as any;
  const edges = json?.data?.products?.edges ?? [];

  const products = edges.map((e: any) => {
    const node = e.node;
    const imgUrl = node.featuredImage?.url || node.images?.edges?.[0]?.node?.url || "";
    const imgAlt = node.featuredImage?.altText || node.images?.edges?.[0]?.node?.altText || node.title;
    const price = node.priceRangeV2?.minVariantPrice;
    return {
      id: node.id,
      title: node.title,
      handle: node.handle,
      imageUrl: imgUrl,
      imageAlt: imgAlt,
      price: price ? `${Number(price.amount).toFixed(2)}` : "",
      currency: price?.currencyCode ?? "USD",
    };
  });

  return new Response(JSON.stringify({ products }), {
    headers: { "Content-Type": "application/json" },
  });
};
