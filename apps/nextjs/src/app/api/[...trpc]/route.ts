import type { NextRequest } from "next/server";
import { userAgent } from "next/server";
import { createOpenApiFetchHandler } from "trpc-to-openapi";

import { appRouter, createTRPCContext } from "@homarr/api";
import { API_KEY_HEADER_NAME, getSessionFromApiKeyAsync } from "@homarr/auth/api-key";
import { ipAddressFromHeaders } from "@homarr/common/server";
import { createLogger } from "@homarr/core/infrastructure/logs";
import { ErrorWithMetadata } from "@homarr/core/infrastructure/logs/error";
import { db } from "@homarr/db";

const logger = createLogger({ module: "trpcOpenApiRoute" });

const handlerAsync = async (req: NextRequest) => {
  const apiKeyHeaderValue = req.headers.get(API_KEY_HEADER_NAME);
  const ipAddress = ipAddressFromHeaders(req.headers);
  const { ua } = userAgent(req);

  logger.info(
    `Creating OpenAPI fetch handler for user ${apiKeyHeaderValue ? "with an api key" : "without an api key"}`,
  );

  const session = await getSessionFromApiKeyAsync(db, apiKeyHeaderValue, ipAddress, ua);

  // Fallback to JSON if no content type is set
  if (!req.headers.has("Content-Type")) {
    req.headers.set("Content-Type", "application/json");
  }

  return createOpenApiFetchHandler({
    req,
    endpoint: "/",
    router: appRouter,
    createContext: () => createTRPCContext({ session, headers: req.headers }),
    onError({ error, path, type }) {
      logger.error(new ErrorWithMetadata("tRPC Error occured", { path, type }, { cause: error }));
    },
  });
};

export {
  handlerAsync as DELETE,
  handlerAsync as GET,
  handlerAsync as PATCH,
  handlerAsync as POST,
  handlerAsync as PUT,
};
