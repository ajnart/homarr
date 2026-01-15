import type { Session } from "next-auth";

import { createLogger } from "@homarr/core/infrastructure/logs";
import type { Database } from "@homarr/db";
import { eq } from "@homarr/db";
import { apiKeys } from "@homarr/db/schema";

import { hashPasswordAsync } from "../security";
import { createSessionAsync } from "../server";

const logger = createLogger({ module: "apiKeyAuth" });

/**
 * Validate an API key from the request header and return a session if valid.
 *
 * @param db - The database instance
 * @param apiKeyHeaderValue - The value of the ApiKey header (format: "id.token")
 * @param ipAddress - The IP address of the request (for logging)
 * @param userAgent - The user agent of the request (for logging)
 * @returns A session if the API key is valid, null otherwise
 */
export const getSessionFromApiKeyAsync = async (
  db: Database,
  apiKeyHeaderValue: string | null,
  ipAddress: string | null,
  userAgent: string,
): Promise<Session | null> => {
  if (apiKeyHeaderValue === null) {
    return null;
  }

  const [apiKeyId, apiKey] = apiKeyHeaderValue.split(".");

  if (!apiKeyId || !apiKey) {
    logger.warn("Failed to authenticate with api-key", { ipAddress, userAgent, reason: "API_KEY_INVALID_FORMAT" });
    return null;
  }

  const apiKeyFromDb = await db.query.apiKeys.findFirst({
    where: eq(apiKeys.id, apiKeyId),
    columns: {
      id: true,
      apiKey: true,
      salt: true,
    },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
        },
      },
    },
  });

  if (!apiKeyFromDb) {
    logger.warn("Failed to authenticate with api-key", { ipAddress, userAgent, reason: "API_KEY_NOT_FOUND" });
    return null;
  }

  const hashedApiKey = await hashPasswordAsync(apiKey, apiKeyFromDb.salt);

  if (apiKeyFromDb.apiKey !== hashedApiKey) {
    logger.warn("Failed to authenticate with api-key", { ipAddress, userAgent, reason: "API_KEY_MISMATCH" });
    return null;
  }

  logger.info("Successfully authenticated with api-key", {
    name: apiKeyFromDb.user.name,
    id: apiKeyFromDb.user.id,
  });

  return await createSessionAsync(db, apiKeyFromDb.user);
};
