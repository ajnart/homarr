import type { UmamiEventData } from "@umami/node";
import { Umami } from "@umami/node";

import { createLogger } from "@homarr/core/infrastructure/logs";
import { count, db } from "@homarr/db";
import { getServerSettingByKeyAsync } from "@homarr/db/queries";
import { integrations, items, users } from "@homarr/db/schema";
import type { defaultServerSettings } from "@homarr/server-settings";

import { Stopwatch } from "../../common/src";
import { UMAMI_HOST_URL, UMAMI_WEBSITE_ID } from "./constants";

const logger = createLogger({ module: "analytics" });

export const sendServerAnalyticsAsync = async () => {
  const stopWatch = new Stopwatch();
  const analyticsSettings = await getServerSettingByKeyAsync(db, "analytics");

  if (!analyticsSettings.enableGeneral) {
    logger.info("Analytics are disabled. No data will be sent. Enable analytics in the settings");
    return;
  }

  const umamiInstance = new Umami();
  umamiInstance.init({
    hostUrl: UMAMI_HOST_URL,
    websiteId: UMAMI_WEBSITE_ID,
  });

  await sendIntegrationDataAsync(umamiInstance, analyticsSettings);
  await sendWidgetDataAsync(umamiInstance, analyticsSettings);
  await sendUserDataAsync(umamiInstance, analyticsSettings);

  logger.info(`Sent all analytics in ${stopWatch.getElapsedInHumanWords()}`);
};

const sendWidgetDataAsync = async (umamiInstance: Umami, analyticsSettings: typeof defaultServerSettings.analytics) => {
  if (!analyticsSettings.enableWidgetData) {
    return;
  }
  const widgetCount = await db.$count(items);

  const response = await umamiInstance.track("server-widget-data", {
    countWidgets: widgetCount,
  });
  if (response.ok) {
    return;
  }

  logger.warn("Unable to send track event data to Umami instance");
};

const sendUserDataAsync = async (umamiInstance: Umami, analyticsSettings: typeof defaultServerSettings.analytics) => {
  if (!analyticsSettings.enableUserData) {
    return;
  }
  const userCount = await db.$count(users);

  const response = await umamiInstance.track("server-user-data", {
    countUsers: userCount,
  });
  if (response.ok) {
    return;
  }

  logger.warn("Unable to send track event data to Umami instance");
};

const sendIntegrationDataAsync = async (
  umamiInstance: Umami,
  analyticsSettings: typeof defaultServerSettings.analytics,
) => {
  if (!analyticsSettings.enableIntegrationData) {
    return;
  }
  const integrationKinds = await db
    .select({ kind: integrations.kind, count: count(integrations.id) })
    .from(integrations)
    .groupBy(integrations.kind);

  const map: UmamiEventData = {};

  integrationKinds.forEach((integrationKind) => {
    map[integrationKind.kind] = integrationKind.count;
  });

  const response = await umamiInstance.track("server-integration-data-kind", map);
  if (response.ok) {
    return;
  }

  logger.warn("Unable to send track event data to Umami instance");
};
