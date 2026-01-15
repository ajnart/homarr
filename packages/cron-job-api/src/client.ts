import { createTRPCClient, httpLink } from "@trpc/client";

import type { JobRouter } from ".";
import { CRON_JOB_API_KEY_HEADER, CRON_JOB_API_PATH, CRON_JOB_API_PORT } from "./constants";
import { env } from "./env";

export const cronJobApi = createTRPCClient<JobRouter>({
  links: [
    httpLink({
      url: `${getBaseUrl()}${CRON_JOB_API_PATH}`,
      headers: {
        [CRON_JOB_API_KEY_HEADER]: env.CRON_JOB_API_KEY,
      },
    }),
  ],
});

function getBaseUrl() {
  return `http://localhost:${CRON_JOB_API_PORT}`;
}
