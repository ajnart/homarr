import ICAL from "ical.js";

import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";

import type { IntegrationTestingInput } from "../base/integration";
import { Integration } from "../base/integration";
import { TestConnectionError } from "../base/test-connection/test-connection-error";
import type { TestingResult } from "../base/test-connection/test-connection-service";
import type { ICalendarIntegration } from "../interfaces/calendar/calendar-integration";
import type { CalendarEvent } from "../interfaces/calendar/calendar-types";

export class ICalIntegration extends Integration implements ICalendarIntegration {
  async getCalendarEventsAsync(start: Date, end: Date): Promise<CalendarEvent[]> {
    const response = await fetchWithTrustedCertificatesAsync(super.getSecretValue("url"));
    const result = await response.text();
    const jcal = ICAL.parse(result) as unknown[];
    const comp = new ICAL.Component(jcal);

    return comp.getAllSubcomponents("vevent").reduce((prev, vevent) => {
      const event = new ICAL.Event(vevent);
      const startDate = event.startDate.toJSDate();
      const endDate = event.endDate.toJSDate();

      if (startDate > end) return prev;
      if (endDate < start) return prev;

      return prev.concat({
        title: event.summary,
        subTitle: null,
        description: event.description,
        startDate,
        endDate,
        image: null,
        location: event.location,
        indicatorColor: "red",
        links: [],
      });
    }, [] as CalendarEvent[]);
  }

  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    const response = await input.fetchAsync(super.getSecretValue("url"));
    if (!response.ok) return TestConnectionError.StatusResult(response);

    const result = await response.text();

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const jcal = ICAL.parse(result);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const comp = new ICAL.Component(jcal);
      return comp.getAllSubcomponents("vevent").length > 0
        ? { success: true }
        : TestConnectionError.ParseResult({
            name: "Calendar parse error",
            message: "No events found",
            cause: new Error("No events found"),
          });
    } catch (error) {
      return TestConnectionError.ParseResult({
        name: "Calendar parse error",
        message: "Failed to parse calendar",
        cause: error as Error,
      });
    }
  }
}
