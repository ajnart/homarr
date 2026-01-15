import { fetch } from "undici";

import { extractErrorMessage } from "@homarr/common";
import { UndiciHttpAgent } from "@homarr/core/infrastructure/http";
import { withTimeoutAsync } from "@homarr/core/infrastructure/http/timeout";
import { createLogger } from "@homarr/core/infrastructure/logs";
import { ErrorWithMetadata } from "@homarr/core/infrastructure/logs/error";

const logger = createLogger({ module: "ping" });

export const sendPingRequestAsync = async (url: string) => {
  try {
    const start = performance.now();
    return await withTimeoutAsync(async (signal) => {
      return await fetch(url, {
        dispatcher: new UndiciHttpAgent({
          connect: {
            rejectUnauthorized: false, // Ping should always work, even with untrusted certificates
          },
        }),
        signal,
      });
    }).then((response) => {
      const end = performance.now();
      const durationMs = end - start;
      return { statusCode: response.status, durationMs };
    });
  } catch (error) {
    logger.error(new ErrorWithMetadata("Failed to send ping request", { url }, { cause: error }));
    return {
      error: extractErrorMessage(error),
    };
  }
};
