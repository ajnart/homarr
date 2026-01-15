import type { Notification } from "./notification-types";

export interface INotificationsIntegration {
  getNotificationsAsync(): Promise<Notification[]>;
}
