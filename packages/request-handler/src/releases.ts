import dayjs from "dayjs";

import type { IntegrationKindByCategory } from "@homarr/definitions";
import type { ReleaseResponse, ReleasesRepository } from "@homarr/integrations";
import { createIntegrationAsync } from "@homarr/integrations";

import { createCachedIntegrationRequestHandler } from "./lib/cached-integration-request-handler";

export const releasesRequestHandler = createCachedIntegrationRequestHandler<
  ReleaseResponse,
  IntegrationKindByCategory<"releasesProvider">,
  ReleasesRepository
>({
  requestAsync: async (integration, input) => {
    const instance = await createIntegrationAsync(integration);
    return instance.getLatestMatchingReleaseAsync(input.identifier, input.versionRegex);
  },
  cacheDuration: dayjs.duration(5, "minutes"),
  queryKey: "repositoriesReleases",
});
