import { notFound } from "next/navigation";

import { ImageProxy } from "@homarr/image-proxy";

export const GET = async (_request: Request, props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;

  const imageProxy = new ImageProxy();
  const image = await imageProxy.forwardImageAsync(id);
  if (!image) {
    notFound();
  }

  return new Response(image, {
    headers: {
      "Cache-Control": "public, max-age=3600, immutable", // Cache for 1 hour
    },
  });
};
