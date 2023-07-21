import { Button, Group, Modal, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '~/config/provider';
import { api } from '~/utils/api';

import { useConfigStore } from '../../../../config/store';

interface CreateConfigCopyModalProps {
  opened: boolean;
  closeModal: () => void;
  initialConfigName: string;
}

export const CreateConfigCopyModal = ({
  opened,
  closeModal,
  initialConfigName,
}: CreateConfigCopyModalProps) => {
  const { configs } = useConfigStore();
  const { config } = useConfigContext();
  const { t } = useTranslation(['settings/general/config-changer']);

  const form = useForm({
    initialValues: {
      configName: initialConfigName,
    },
    validate: {
      configName: (value) => {
        if (!value) {
          return t('modal.copy.form.configName.validation.required');
        }

        const configNames = configs.map((x) => x.value.configProperties.name);
        if (configNames.includes(value)) {
          return t('modal.copy.form.configName.validation.notUnique');
        }

        return undefined;
      },
    },
    validateInputOnChange: true,
    validateInputOnBlur: true,
  });

  const { mutateAsync } = useCopyConfigMutation();

  const handleClose = () => {
    form.setFieldValue('configName', initialConfigName);
    closeModal();
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (!form.isValid) return;

    if (!config) {
      throw new Error('config is not defiend');
    }

    const copiedConfig = config;
    copiedConfig.configProperties.name = form.values.configName;

    await mutateAsync({
      name: form.values.configName,
      config: copiedConfig,
    });
    closeModal();
  };

  return (
    <Modal
      radius="md"
      opened={opened}
      onClose={handleClose}
      title={<Title order={4}>{t('modal.copy.title')}</Title>}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label={t('modal.copy.form.configName.label')}
          placeholder={t('modal.copy.form.configName.placeholder') ?? undefined}
          {...form.getInputProps('configName')}
        />
        <Group position="right" mt="md">
          <Button type="submit" disabled={!form.isValid()}>
            {t('modal.copy.form.submitButton')}
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

const useCopyConfigMutation = () => {
  const { t } = useTranslation(['settings/general/config-changer']);
  const utils = api.useContext();

  return api.config.save.useMutation({
    onSuccess(_data, variables) {
      showNotification({
        title: t('modal.copy.events.configCopied.title'),
        icon: <IconCheck />,
        color: 'green',
        autoClose: 1500,
        radius: 'md',
        message: t('modal.copy.events.configCopied.message', { configName: variables.name }),
      });
      // Invalidate a query to fetch new config
      utils.config.all.invalidate();
    },
    onError(_error, variables) {
      showNotification({
        title: t('modal.events.configNotCopied.title'),
        icon: <IconX />,
        color: 'red',
        autoClose: 1500,
        radius: 'md',
        message: t('modal.events.configNotCopied.message', { configName: variables.name }),
      });
    },
  });
};
