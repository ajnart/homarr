import { NextRequest } from "next/server";

import { createHandlersAsync } from "@homarr/auth";
import { createLogger } from "@homarr/core/infrastructure/logs";
import type { SupportedAuthProvider } from "@homarr/definitions";

const logger = createLogger({ module: "nextAuthRoute" });

export const GET = async (req: NextRequest) => {
  const { handlers } = await createHandlersAsync(extractProvider(req), isSecureCookieEnabled(req));

  return await handlers.GET(reqWithTrustedOrigin(req));
};
export const POST = async (req: NextRequest) => {
  const { handlers } = await createHandlersAsync(extractProvider(req), isSecureCookieEnabled(req));
  return await handlers.POST(reqWithTrustedOrigin(req));
};

/**
 * wheter to use secure cookies or not, is only supported for https.
 * For http it will not add the cookie as it is not considered secure.
 * @param req request containing the url
 * @returns true if the request is https, false otherwise
 */
const isSecureCookieEnabled = (req: NextRequest): boolean => {
  const url = new URL(req.url);
  return url.protocol === "https:";
};

/**
 * This method extracts the used provider from the url and allows us to override the getUserByEmail method in the adapter.
 * @param req request containing the url
 * @returns the provider or "unknown" if the provider could not be extracted
 */
const extractProvider = (req: NextRequest): SupportedAuthProvider | "unknown" => {
  const url = new URL(req.url);

  if (url.pathname.includes("oidc")) {
    return "oidc";
  }

  if (url.pathname.includes("credentials")) {
    return "credentials";
  }

  if (url.pathname.includes("ldap")) {
    return "ldap";
  }

  return "unknown";
};

/**
 * This is a workaround to allow the authentication to work with behind a proxy.
 * See https://github.com/nextauthjs/next-auth/issues/10928#issuecomment-2162893683
 */
const reqWithTrustedOrigin = (req: NextRequest): NextRequest => {
  const proto = req.headers.get("x-forwarded-proto");
  const host = req.headers.get("x-forwarded-host");
  if (!proto || !host) {
    logger.warn("Missing x-forwarded-proto or x-forwarded-host headers.");
    return req;
  }

  const envOrigin = `${proto}://${host}`;
  const { href, origin } = req.nextUrl;
  logger.debug(`Rewriting origin from ${origin} to ${envOrigin}`);
  return new NextRequest(href.replace(origin, envOrigin), req);
};
