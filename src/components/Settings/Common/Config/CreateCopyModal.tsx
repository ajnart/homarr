import { Button, Group, Modal, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'next-i18next';
import { useConfigStore } from '../../../../config/store';
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
  const { configs } = useConfigStore();
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
      title={<Title order={4}>{t('modal.copy.title')}</Title>}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label={t('modal.copy.form.configName.label')}
          placeholder={t('modal.copy.form.configName.placeholder')}
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
