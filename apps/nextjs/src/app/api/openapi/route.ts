import { NextResponse } from "next/server";

import { openApiDocument } from "@homarr/api";
import { extractBaseUrlFromHeaders } from "@homarr/common";

export function GET(request: Request) {
  return NextResponse.json(openApiDocument(extractBaseUrlFromHeaders(request.headers)));
}
