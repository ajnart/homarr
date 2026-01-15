import dayjs from "dayjs";

import type { IntegrationKindByCategory } from "@homarr/definitions";
import { createIntegrationAsync } from "@homarr/integrations";
import type { MediaRequestStats } from "@homarr/integrations/types";

import { createCachedIntegrationRequestHandler } from "./lib/cached-integration-request-handler";

export const mediaRequestStatsRequestHandler = createCachedIntegrationRequestHandler<
  MediaRequestStats,
  IntegrationKindByCategory<"mediaRequest">,
  Record<string, never>
>({
  async requestAsync(integration, _input) {
    const integrationInstance = await createIntegrationAsync(integration);
    return {
      stats: await integrationInstance.getStatsAsync(),
      users: await integrationInstance.getUsersAsync(),
    };
  },
  cacheDuration: dayjs.duration(1, "minute"),
  queryKey: "mediaRequestStats",
});
