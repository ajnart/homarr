import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '../../../config/provider';
import { ConfigType } from '../../../types/config';

export const useCopyConfigMutation = (configName: string) => {
  const { config } = useConfigContext();
  const { t } = useTranslation(['settings/general/config-changer']);

  return useMutation({
    mutationKey: ['configs/copy', { configName }],
    mutationFn: () => fetchCopy(configName, config),
    onSuccess() {
      showNotification({
        title: t('modal.events.configCopied.title'),
        icon: <IconCheck />,
        color: 'green',
        autoClose: 1500,
        radius: 'md',
        message: t('modal.events.configCopied.message', { configName }),
      });
    },
    onError() {
      showNotification({
        title: t('modal.events.configNotCopied.title'),
        icon: <IconX />,
        color: 'red',
        autoClose: 1500,
        radius: 'md',
        message: t('modal.events.configNotCopied.message', { configName }),
      });
    },
  });
};

const fetchCopy = async (configName: string, config: ConfigType | undefined) => {
  if (!config) {
    throw new Error('config is not defiend');
  }

  const response = await fetch(`/api/configs/${configName}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });
  return response.json();
};
