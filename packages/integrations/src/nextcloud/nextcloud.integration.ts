import type { Agent } from "https";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import type { RequestInit as NodeFetchRequestInit } from "node-fetch";
import * as ical from "node-ical";
import { DAVClient } from "tsdav";

import { createHttpsAgentAsync } from "@homarr/core/infrastructure/http";
import { createLogger } from "@homarr/core/infrastructure/logs";

import { HandleIntegrationErrors } from "../base/errors/decorator";
import { integrationTsdavHttpErrorHandler } from "../base/errors/http";
import type { IntegrationTestingInput } from "../base/integration";
import { Integration } from "../base/integration";
import type { TestingResult } from "../base/test-connection/test-connection-service";
import type { ICalendarIntegration } from "../interfaces/calendar/calendar-integration";
import type { CalendarEvent } from "../interfaces/calendar/calendar-types";

const logger = createLogger({ module: "nextcloudIntegration" });

dayjs.extend(utc);
dayjs.extend(timezone);

@HandleIntegrationErrors([integrationTsdavHttpErrorHandler])
export class NextcloudIntegration extends Integration implements ICalendarIntegration {
  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    const client = await this.createCalendarClientAsync(await createHttpsAgentAsync(input.options));
    await client.login();

    return { success: true };
  }

  public async getCalendarEventsAsync(start: Date, end: Date, _showUnmonitored?: boolean): Promise<CalendarEvent[]> {
    const client = await this.createCalendarClientAsync();
    await client.login();

    const calendars = await client.fetchCalendars();
    // Parameters must be in ISO-8601, See https://tsdav.vercel.app/docs/caldav/fetchCalendarObjects#arguments
    const calendarEvents = (
      await Promise.all(
        calendars.map(
          async (calendar) =>
            await client.fetchCalendarObjects({
              calendar,
              timeRange: { start: start.toISOString(), end: end.toISOString() },
            }),
        ),
      )
    ).flat();

    return calendarEvents
      .map((event) => {
        // @ts-expect-error the typescript definitions for this package are wrong
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        const icalData = ical.default.parseICS(event.data) as ical.CalendarResponse;
        const veventObject = Object.values(icalData).find((data) => data.type === "VEVENT");

        if (!veventObject) {
          throw new Error(`Invalid event data object: ${JSON.stringify(event.data)}. Unable to process the calendar.`);
        }

        logger.debug(`Converting VEVENT event to ${event.etag} from Nextcloud: ${JSON.stringify(veventObject)}`);

        const eventUrlWithoutHost = new URL(event.url).pathname;
        const eventSlug = Buffer.from(eventUrlWithoutHost).toString("base64url");

        const startDates = veventObject.rrule ? veventObject.rrule.between(start, end) : [veventObject.start];

        const durationMs = veventObject.end.getTime() - veventObject.start.getTime();

        return startDates.map((startDate) => {
          const timezoneOffsetMinutes = veventObject.rrule?.origOptions.tzid
            ? dayjs(startDate).tz(veventObject.rrule.origOptions.tzid).utcOffset()
            : 0;
          const utcStartDate = new Date(startDate.getTime() - timezoneOffsetMinutes * 60 * 1000);
          const endDate = new Date(utcStartDate.getTime() + durationMs);
          const dateInMillis = utcStartDate.valueOf();

          return {
            title: veventObject.summary,
            subTitle: null,
            description: veventObject.description,
            startDate: utcStartDate,
            endDate,
            image: null,
            location: veventObject.location || null,
            indicatorColor:
              "color" in veventObject && typeof veventObject.color === "string" ? veventObject.color : "#ff8600",
            links: [
              {
                href: this.externalUrl(
                  `/apps/calendar/timeGridWeek/now/edit/sidebar/${eventSlug}/${dateInMillis / 1000}`,
                ).toString(),
                name: "Nextcloud",
                logo: "/images/apps/nextcloud.svg",
                color: undefined,
                isDark: true,
              },
            ],
          };
        });
      })
      .flat();
  }

  private async createCalendarClientAsync(agent?: Agent) {
    return new DAVClient({
      serverUrl: this.integration.url,
      credentials: {
        username: this.getSecretValue("username"),
        password: this.getSecretValue("password"),
      },
      authMethod: "Basic",
      defaultAccountType: "caldav",
      fetchOptions: {
        // tsdav is using cross-fetch which uses node-fetch for nodejs environments.
        // There is an agent property that is the same type as the http(s) agents of nodejs
        agent: agent ?? (await createHttpsAgentAsync()),
      } satisfies NodeFetchRequestInit as RequestInit,
    });
  }
}
