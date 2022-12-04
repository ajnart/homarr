import { Button, Center, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconDownload, IconPlus, IconTrash, IconX } from '@tabler/icons';
import { useMutation } from '@tanstack/react-query';
import fileDownload from 'js-file-download';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '../../../config/provider';
import Tip from '../../layout/Tip';
import { CreateConfigCopyModal } from './ConfigActions/CreateCopyModal';

export default function ConfigActions() {
  const { t } = useTranslation(['settings/general/config-changer', 'settings/common']);
  const [createCopyModalOpened, createCopyModal] = useDisclosure(false);
  const { config } = useConfigContext();
  const { mutateAsync } = useDeleteConfigMutation(config?.configProperties.name ?? 'default');

  if (!config) return null;

  const handleDownload = () => {
    // TODO: remove secrets
    fileDownload(JSON.stringify(config, null, '\t'), `${config?.configProperties.name}.json`);
  };

  const handleDeletion = async () => {
    await mutateAsync();
  };

  return (
    <>
      <CreateConfigCopyModal
        opened={createCopyModalOpened}
        closeModal={createCopyModal.close}
        initialConfigName={config.configProperties.name}
      />
      <Group spacing="xs" position="center">
        <Button
          size="xs"
          leftIcon={<IconDownload size={18} />}
          variant="default"
          onClick={handleDownload}
        >
          {t('buttons.download')}
        </Button>
        <Button
          size="xs"
          leftIcon={<IconTrash size={18} />}
          variant="default"
          onClick={handleDeletion}
        >
          {t('buttons.delete.text')}
        </Button>
        <Button
          size="xs"
          leftIcon={<IconPlus size={18} />}
          variant="default"
          onClick={createCopyModal.open}
        >
          {t('buttons.saveCopy')}
        </Button>
      </Group>

      <Center>
        <Tip>{t('settings/common:tips.configTip')}</Tip>
      </Center>
    </>
  );
}

const useDeleteConfigMutation = (configName: string) => {
  const { t } = useTranslation(['settings/general/config-changer']);

  return useMutation({
    mutationKey: ['config/delete', { configName }],
    mutationFn: () => fetchDeletion(configName),
    onSuccess() {
      showNotification({
        title: t('buttons.delete.notifications.deleted.title'),
        icon: <IconCheck />,
        color: 'green',
        autoClose: 1500,
        radius: 'md',
        message: t('buttons.delete.notifications.deleted.message'),
      });
      // TODO: set config to default config and use fallback config if necessary
    },
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

const fetchDeletion = async (configName: string) => {
  return await (await fetch(`/api/configs/${configName}`)).json();
};
