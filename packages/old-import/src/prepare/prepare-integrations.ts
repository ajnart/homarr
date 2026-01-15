import type { ValidAnalyseConfig } from "../analyse/types";

export type PreparedIntegration = ReturnType<typeof prepareIntegrations>[number];

export const prepareIntegrations = (analyseConfigs: ValidAnalyseConfig[]) => {
  return analyseConfigs.flatMap(({ config }) => {
    return config.apps
      .map((app) =>
        app.integration?.type
          ? {
              ...app.integration,
              name: app.name,
              url: app.url,
            }
          : null,
      )
      .filter((integration) => integration !== null);
  });
};
