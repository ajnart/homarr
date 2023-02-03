import { showNotification } from '@mantine/notifications';
import { IconX } from '@tabler/icons';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';

export const useDeleteConfigMutation = (configName: string) => {
  const { t } = useTranslation(['settings/general/config-changer']);

  return useMutation({
    mutationKey: ['configs/delete', { configName }],
    mutationFn: () => fetchDeletion(configName),
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

const fetchDeletion = async (configName: string) =>
  (await fetch(`/api/configs/${configName}`, { method: 'DELETE' })).json();
