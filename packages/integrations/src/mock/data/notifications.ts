import type { Notification } from "../../interfaces/notifications/notification-types";
import type { INotificationsIntegration } from "../../interfaces/notifications/notifications-integration";

export class NotificationsMockService implements INotificationsIntegration {
  public async getNotificationsAsync(): Promise<Notification[]> {
    return await Promise.resolve(
      Array.from({ length: 10 }, (_, index) => NotificationsMockService.createNotification(index)),
    );
  }

  private static createNotification(index: number): Notification {
    return {
      id: index.toString(),
      time: new Date(Date.now() - Math.random() * 1000000), // Random time within the next 11 days
      title: `Notification ${index}`,
      body: `This is the body of notification ${index}.`,
    };
  }
}
