import dayjs from "dayjs";

import { EVERY_MINUTE } from "@homarr/cron-jobs-core/expressions";
import { calendarMonthRequestHandler } from "@homarr/request-handler/calendar";
import { createRequestIntegrationJobHandler } from "@homarr/request-handler/lib/cached-request-integration-job-handler";

import { createCronJob } from "../../lib";

export const mediaOrganizerJob = createCronJob("mediaOrganizer", EVERY_MINUTE).withCallback(
  createRequestIntegrationJobHandler(calendarMonthRequestHandler.handler, {
    widgetKinds: ["calendar"],
    getInput: {
      // Request handler will run for all specified months
      calendar: (options) => {
        const inputs = [];

        const startOffset = -Number(options.filterPastMonths);
        const endOffset = Number(options.filterFutureMonths);

        for (let offsetMonths = startOffset; offsetMonths <= endOffset; offsetMonths++) {
          const year = dayjs().subtract(offsetMonths, "months").year();
          const month = dayjs().subtract(offsetMonths, "months").month();

          inputs.push({
            year,
            month,
            releaseType: options.releaseType,
            showUnmonitored: options.showUnmonitored,
          });
        }

        return inputs;
      },
    },
  }),
);
