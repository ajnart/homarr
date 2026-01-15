import type { NotificationData } from "@mantine/notifications";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

export const showSuccessNotification = (props: NotificationData) =>
  notifications.show({
    ...props,
    color: "teal",
    icon: <IconCheck size={20} />,
  });

export const showErrorNotification = (props: NotificationData) =>
  notifications.show({
    ...props,
    color: "red",
    icon: <IconX size={20} />,
  });
