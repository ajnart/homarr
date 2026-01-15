import { userAgent } from "next/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, createTRPCContext } from "@homarr/api";
import { trpcPath } from "@homarr/api/shared";
import { API_KEY_HEADER_NAME, getSessionFromApiKeyAsync } from "@homarr/auth/api-key";
import { auth } from "@homarr/auth/next";
import { ipAddressFromHeaders } from "@homarr/common/server";
import { createLogger } from "@homarr/core/infrastructure/logs";
import { ErrorWithMetadata } from "@homarr/core/infrastructure/logs/error";
import { db } from "@homarr/db";

const logger = createLogger({ module: "trpcRoute" });

/**
 * Configure basic CORS headers
 * You should extend this to match your needs
 */
function setCorsHeaders(res: Response) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Request-Method", "*");
  res.headers.set("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
  res.headers.set("Access-Control-Allow-Headers", "*");
}

export function OPTIONS() {
  const response = new Response(null, {
    status: 204,
  });
  setCorsHeaders(response);
  return response;
}

const handler = auth(async (req) => {
  // Try API key auth first, fall back to session cookie
  const apiKeyHeader = req.headers.get(API_KEY_HEADER_NAME);
  const ipAddress = ipAddressFromHeaders(req.headers);

  const { ua } = userAgent(req);

  const apiKeySession = await getSessionFromApiKeyAsync(db, apiKeyHeader, ipAddress, ua);
  const session = apiKeySession ?? req.auth;

  const response = await fetchRequestHandler({
    endpoint: trpcPath,
    router: appRouter,
    req,
    createContext: () => createTRPCContext({ session, headers: req.headers }),
    onError({ error, path, type }) {
      logger.error(new ErrorWithMetadata("tRPC Error occured", { path, type }, { cause: error }));
    },
  });

  setCorsHeaders(response);
  return response;
});

export { handler as GET, handler as POST };
