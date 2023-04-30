import { showNotification } from '@mantine/notifications';
import { IconX } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { api } from '~/utils/api';

export const useDeleteConfigMutation = (configName: string) => {
  const { t } = useTranslation(['settings/general/config-changer']);

  return api.config.deleteByName.useMutation({
    onError() {
      showNotification({
        title: t('buttons.delete.notifications.deleteFailed.title'),
        icon: <IconX />,
        color: 'red',
        autoClose: 1500,
        radius: 'md',
        message: t('buttons.delete.notifications.deleteFailed.message'),
      });
    },
  });
};
