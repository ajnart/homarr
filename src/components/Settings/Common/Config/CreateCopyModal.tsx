import { Button, Group, Modal, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '../../../../config/provider';

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
  const { t } = useTranslation(['settings/general/config-changer']);
  const { config } = useConfigContext();
  const form = useForm({
    initialValues: {
      configName: initialConfigName,
    },
    validate: {
      configName: (v) => (!v ? t('modal.form.configName.validation.required') : null),
    },
  });

  const handleClose = () => {
    form.setFieldValue('configName', initialConfigName);
    closeModal();
  };

  const handleSubmit = (values: typeof form.values) => {
    if (!form.isValid) return;
    // TODO: create config file with copied data
    closeModal();
    showNotification({
      title: t('modal.events.configSaved.title'),
      icon: <IconCheck />,
      color: 'green',
      autoClose: 1500,
      radius: 'md',
      message: t('modal.events.configSaved.message', { configName: values.configName }),
    });
  };

  return (
    <Modal
      radius="md"
      opened={opened}
      onClose={handleClose}
      title={<Title order={4}>{t('modal.title')}</Title>}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label={t('modal.form.configName.label')}
          placeholder={t('modal.form.configName.placeholder')}
          {...form.getInputProps('configName')}
        />
        <Group position="right" mt="md">
          <Button type="submit">{t('modal.form.submitButton')}</Button>
        </Group>
      </form>
    </Modal>
  );
};
