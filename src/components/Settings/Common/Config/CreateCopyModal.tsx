import { Button, Group, Modal, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'next-i18next';
import { useCopyConfigMutation } from '../../../../tools/config/mutations/useCopyConfigMutation';

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

  const form = useForm({
    initialValues: {
      configName: initialConfigName,
    },
    validate: {
      configName: (v) => (!v ? t('modal.form.configName.validation.required') : null),
    },
  });

  const { mutateAsync } = useCopyConfigMutation(form.values.configName);

  const handleClose = () => {
    form.setFieldValue('configName', initialConfigName);
    closeModal();
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (!form.isValid) return;

    await mutateAsync();
    closeModal();
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
