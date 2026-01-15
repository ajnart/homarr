import z from "zod";

import { ResponseError } from "@homarr/common/server";
import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";
import { createLogger } from "@homarr/core/infrastructure/logs";
import { ErrorWithMetadata } from "@homarr/core/infrastructure/logs/error";

import type { IntegrationTestingInput } from "../base/integration";
import { Integration } from "../base/integration";
import { TestConnectionError } from "../base/test-connection/test-connection-error";
import type { TestingResult } from "../base/test-connection/test-connection-service";
import type { ICalendarIntegration } from "../interfaces/calendar/calendar-integration";
import type { ISmartHomeIntegration } from "../interfaces/smart-home/smart-home-integration";
import type { CalendarEvent } from "../types";
import { calendarEventSchema, calendarsSchema, entityStateSchema } from "./homeassistant-types";

const logger = createLogger({ module: "homeAssistantIntegration" });

export class HomeAssistantIntegration extends Integration implements ISmartHomeIntegration, ICalendarIntegration {
  public async getEntityStateAsync(entityId: string) {
    try {
      const response = await this.getAsync(`/api/states/${entityId}`);
      const body = await response.json();
      if (!response.ok) {
        logger.warn("Response did not indicate success");
        return {
          success: false as const,
          error: "Response did not indicate success",
        };
      }
      return entityStateSchema.safeParseAsync(body);
    } catch (err) {
      logger.error(new ErrorWithMetadata("Failed to fetch entity state", { entityId }, { cause: err }));
      return {
        success: false as const,
        error: err,
      };
    }
  }

  public async triggerAutomationAsync(entityId: string) {
    try {
      const response = await this.postAsync("/api/services/automation/trigger", {
        entity_id: entityId,
      });

      return response.ok;
    } catch (err) {
      logger.error(new ErrorWithMetadata("Failed to trigger automation", { entityId }, { cause: err }));
      return false;
    }
  }

  /**
   * Triggers a toggle action for a specific entity.
   *
   * @param entityId - The ID of the entity to toggle.
   * @returns A boolean indicating whether the toggle action was successful.
   */
  public async triggerToggleAsync(entityId: string) {
    try {
      const response = await this.postAsync("/api/services/homeassistant/toggle", {
        entity_id: entityId,
      });

      return response.ok;
    } catch (err) {
      logger.error(new ErrorWithMetadata("Failed to toggle entity", { entityId }, { cause: err }));
      return false;
    }
  }

  public async getCalendarEventsAsync(start: Date, end: Date): Promise<CalendarEvent[]> {
    const calendarsResponse = await this.getAsync("/api/calendars");
    if (!calendarsResponse.ok) throw new ResponseError(calendarsResponse);
    const calendars = await calendarsSchema.parseAsync(await calendarsResponse.json());

    return await Promise.all(
      calendars.map(async (calendar) => {
        const response = await this.getAsync(`/api/calendars/${calendar.entity_id}`, { start, end });
        if (!response.ok) throw new ResponseError(response);
        return await z.array(calendarEventSchema).parseAsync(await response.json());
      }),
    ).then((events) =>
      events.flat().map(
        (event): CalendarEvent => ({
          title: event.summary,
          subTitle: null,
          description: event.description,
          // If not reseting it to 0 o'clock it uses utc time and therefore shows as 2 o'clock
          startDate: "date" in event.start ? new Date(`${event.start.date}T00:00:00`) : new Date(event.start.dateTime),
          endDate: "date" in event.end ? new Date(`${event.end.date}T00:00:00`) : new Date(event.end.dateTime),
          image: null,
          indicatorColor: "#18bcf2",
          links: [],
          location: event.location,
        }),
      ),
    );
  }

  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    const response = await input.fetchAsync(this.url("/api/config"), {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      return TestConnectionError.StatusResult(response);
    }

    return {
      success: true,
    };
  }

  /**
   * Makes a GET request to the Home Assistant API.
   * It includes the authorization header with the API key.
   * @param path full path to the API endpoint
   * @returns the response from the API
   */
  private async getAsync(path: `/api/${string}`, queryParams?: Record<string, string | Date | number | boolean>) {
    return await fetchWithTrustedCertificatesAsync(this.url(path, queryParams), {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * Makes a POST request to the Home Assistant API.
   * It includes the authorization header with the API key.
   * @param path full path to the API endpoint
   * @param body the body of the request
   * @returns the response from the API
   */
  private async postAsync(path: `/api/${string}`, body: Record<string, string>) {
    return await fetchWithTrustedCertificatesAsync(this.url(path), {
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body),
      method: "POST",
    });
  }

  /**
   * Returns the headers required for authorization.
   * @returns the authorization headers
   */
  private getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.getSecretValue("apiKey")}`,
    };
  }
}
