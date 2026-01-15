import dayjs from "dayjs";

import type { IntegrationKindByCategory } from "@homarr/definitions";
import { createIntegrationAsync } from "@homarr/integrations";
import type { TdarrQueue, TdarrStatistics, TdarrWorker } from "@homarr/integrations";

import { createCachedIntegrationRequestHandler } from "./lib/cached-integration-request-handler";

export const mediaTranscodingRequestHandler = createCachedIntegrationRequestHandler<
  MediaTranscoding,
  IntegrationKindByCategory<"mediaTranscoding">,
  { pageOffset: number; pageSize: number }
>({
  queryKey: "mediaTranscoding",
  cacheDuration: dayjs.duration(5, "minutes"),
  async requestAsync(integration, input) {
    const integrationInstance = await createIntegrationAsync(integration);
    return {
      queue: await integrationInstance.getQueueAsync(input.pageOffset, input.pageSize),
      workers: await integrationInstance.getWorkersAsync(),
      statistics: await integrationInstance.getStatisticsAsync(),
    };
  },
});

export interface MediaTranscoding {
  queue: TdarrQueue;
  workers: TdarrWorker[];
  statistics: TdarrStatistics;
}
