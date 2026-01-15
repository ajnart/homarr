import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import DOMPurify from "isomorphic-dompurify";

import { db, eq } from "@homarr/db";
import { medias } from "@homarr/db/schema";

export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const image = await db.query.medias.findFirst({
    where: eq(medias.id, params.id),
    columns: {
      content: true,
      contentType: true,
    },
  });

  if (!image) {
    notFound();
  }

  let content = new Uint8Array(image.content);

  // Sanitize SVG content to prevent XSS attacks
  if (image.contentType === "image/svg+xml" || image.contentType === "image/svg") {
    const svgText = new TextDecoder().decode(content);
    const sanitized = DOMPurify.sanitize(svgText, {
      USE_PROFILES: { svg: true, svgFilters: true },
    });
    content = new TextEncoder().encode(sanitized);
  }

  const headers = new Headers();
  headers.set("Content-Type", image.contentType);
  headers.set("Content-Length", content.length.toString());
  headers.set("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox");
  headers.set("X-Content-Type-Options", "nosniff");

  return new NextResponse(content, {
    status: 200,
    headers,
  });
}
