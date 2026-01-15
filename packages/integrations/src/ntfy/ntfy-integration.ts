import { ResponseError } from "@homarr/common/server";
import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";

import { Integration } from "../base/integration";
import type { IntegrationTestingInput } from "../base/integration";
import type { TestingResult } from "../base/test-connection/test-connection-service";
import type { Notification } from "../interfaces/notifications/notification-types";
import type { INotificationsIntegration } from "../interfaces/notifications/notifications-integration";
import { ntfyNotificationSchema } from "./ntfy-schema";

export class NTFYIntegration extends Integration implements INotificationsIntegration {
  public async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    await input.fetchAsync(this.url("/v1/account"), { headers: this.getHeaders() });
    return { success: true };
  }

  private getTopicURL() {
    return this.url(`/${encodeURIComponent(super.getSecretValue("topic"))}/json`, { poll: 1 });
  }
  private getHeaders() {
    return this.hasSecretValue("apiKey") ? { Authorization: `Bearer ${super.getSecretValue("apiKey")}` } : {};
  }

  public async getNotificationsAsync() {
    const url = this.getTopicURL();
    const notifications = await Promise.all(
      (
        await fetchWithTrustedCertificatesAsync(url, { headers: this.getHeaders() })
          .then((response) => {
            if (!response.ok) throw new ResponseError(response);
            return response.text();
          })
          .catch((error) => {
            if (error instanceof Error) throw error;
            else {
              throw new Error("Error communicating with ntfy");
            }
          })
      )
        // response is provided as individual lines of JSON
        .split("\n")
        .map(async (line) => {
          // ignore empty lines
          if (line.length === 0) return null;

          const json = JSON.parse(line) as unknown;
          const parsed = await ntfyNotificationSchema.parseAsync(json);
          if (parsed.event === "message") return parsed;
          // ignore non-event messages
          else return null;
        }),
    );

    return notifications
      .filter((notification) => notification !== null)
      .map((notification): Notification => {
        const topicURL = this.externalUrl(`/${notification.topic}`);
        return {
          id: notification.id,
          time: new Date(notification.time * 1000),
          title: notification.title ?? topicURL.hostname + topicURL.pathname,
          body: notification.message,
        };
      });
  }
}
