import { NotificationProps, showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';

export const showSuccessNotification = (props: Omit<NotificationProps, 'icon' | 'color'>) => {
  showNotification({
    ...props,
    icon: <IconCheck />,
    color: 'teal',
  });
};

export const showErrorNotification = (props: Omit<NotificationProps, 'icon' | 'color'>) => {
  showNotification({
    ...props,
    icon: <IconX />,
    color: 'red',
  });
};
