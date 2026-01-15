import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

import { extractBaseUrlFromHeaders } from "@homarr/common";

/**
 * The redirect_uri is constructed to work behind a reverse proxy. It is constructed from the headers x-forwarded-proto and x-forwarded-host.
 * @param headers
 * @param pathname
 * @returns
 */
export const createRedirectUri = (
  headers: ReadonlyHeaders | null,
  pathname: string,
  fallbackProtocol: "http" | "https" = "http",
) => {
  if (!headers) {
    return pathname;
  }

  const baseUrl = extractBaseUrlFromHeaders(headers, fallbackProtocol);

  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return `${baseUrl}${path}`;
};
