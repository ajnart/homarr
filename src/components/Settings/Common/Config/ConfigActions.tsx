import {
  ActionIcon,
  Alert,
  Center,
  createStyles,
  Flex,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { openConfirmModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconCheck,
  IconCopy,
  IconDownload,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import fileDownload from 'js-file-download';
import { Trans, useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';
import Tip from '../../../layout/Tip';
import { CreateConfigCopyModal } from './CreateCopyModal';
import { api } from '~/utils/api';

export default function ConfigActions() {
  const { t } = useTranslation(['settings/general/config-changer', 'settings/common', 'common']);
  const [createCopyModalOpened, createCopyModal] = useDisclosure(false);
  const { config } = useConfigContext();
  const { mutateAsync } = useDeleteConfigMutation();

  if (!config) return null;

  const handleDownload = () => {
    fileDownload(JSON.stringify(config, null, '\t'), `${config?.configProperties.name}.json`);
  };

  const handleDeletion = async () => {
    openConfirmModal({
      title: t('modal.confirmDeletion.title'),
      children: (
        <>
          <Alert icon={<IconAlertTriangle />} mb="md">
            <Trans
              i18nKey="settings/general/config-changer:modal.confirmDeletion.warningText"
              values={{ configName: config.configProperties.name ?? 'default' }}
              components={{ b: <b />, code: <code /> }}
            />
          </Alert>
          <Text>{t('modal.confirmDeletion.text')}</Text>
        </>
      ),
      labels: {
        confirm: (
          <Trans
            i18nKey="settings/general/config-changer:modal.confirmDeletion.buttons.confirm"
            values={{ configName: config.configProperties.name ?? 'default' }}
            components={{ b: <b />, code: <code /> }}
          />
        ),
        cancel: t('common:cancel'),
      },
      zIndex: 201,
      onConfirm: async () => {
        const response = await mutateAsync({
          name: config?.configProperties.name ?? 'default',
        });
      },
    });
  };

  const { classes } = useStyles();
  const { colors } = useMantineTheme();

  return (
    <>
      <CreateConfigCopyModal
        opened={createCopyModalOpened}
        closeModal={createCopyModal.close}
        initialConfigName={config.configProperties.name}
      />
      <Flex gap="xs" mt="xs" justify="stretch">
        <ActionIcon className={classes.actionIcon} onClick={handleDownload} variant="default">
          <IconDownload size={20} />
          <Text size="sm">{t('buttons.download')}</Text>
        </ActionIcon>
        <ActionIcon
          className={classes.actionIcon}
          onClick={handleDeletion}
          color="red"
          variant="light"
        >
          <IconTrash color={colors.red[2]} size={20} />
          <Text size="sm">{t('buttons.delete.text')}</Text>
        </ActionIcon>
        <ActionIcon className={classes.actionIcon} onClick={createCopyModal.open} variant="default">
          <IconCopy size={20} />
          <Text size="sm">{t('buttons.saveCopy')}</Text>
        </ActionIcon>
      </Flex>

      <Center>
        <Tip>{t('settings/common:tips.configTip')}</Tip>
      </Center>
    </>
  );
}

const useDeleteConfigMutation = () => {
  const { t } = useTranslation(['settings/general/config-changer']);
  const router = useRouter();
  const { removeConfig } = useConfigStore();

  return api.config.delete.useMutation({
    onError(error) {
      if (error.data?.code === 'FORBIDDEN') {
        showNotification({
          title: t('buttons.delete.notifications.deleteFailedDefaultConfig.title'),
          icon: <IconX />,
          color: 'red',
          autoClose: 1500,
          radius: 'md',
          message: t('buttons.delete.notifications.deleteFailedDefaultConfig.message'),
        });
      }
      showNotification({
        title: t('buttons.delete.notifications.deleteFailed.title'),
        icon: <IconX />,
        color: 'red',
        autoClose: 1500,
        radius: 'md',
        message: t('buttons.delete.notifications.deleteFailed.message'),
      });
    },
    onSuccess(data, variables) {
      showNotification({
        title: t('buttons.delete.notifications.deleted.title'),
        icon: <IconCheck />,
        color: 'green',
        autoClose: 1500,
        radius: 'md',
        message: t('buttons.delete.notifications.deleted.message'),
      });

      removeConfig(variables.name);

      router.push('/');
    },
  });
};

const useStyles = createStyles(() => ({
  actionIcon: {
    width: 'auto',
    height: 'auto',
    maxWidth: 'auto',
    maxHeight: 'auto',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    rowGap: 10,
    padding: 10,
  },
}));
