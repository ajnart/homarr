import { Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ContextModalProps, modals } from '@mantine/modals';
import { Trans, useTranslation } from 'next-i18next';
import { getStaticFallbackConfig } from '~/tools/config/getFallbackConfig';
import { api } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { createBoardSchemaValidation } from '~/validations/boards';

export const CreateBoardModal = ({ id }: ContextModalProps<{}>) => {
  const { t } = useTranslation('manage/boards');
  const utils = api.useUtils();
  const { isLoading, mutate } = api.config.save.useMutation({
    onSuccess: async () => {
      await utils.boards.all.invalidate();
      modals.close(id);
    },
    onError: async (error) => {
      form.setFieldError('name', error.message);
    },
  });

  const { i18nZodResolver } = useI18nZodResolver();

  const form = useForm({
    initialValues: {
      name: '',
    },
    validate: i18nZodResolver(createBoardSchemaValidation),
  });

  const handleSubmit = () => {
    const fallbackConfig = getStaticFallbackConfig(form.values.name);
    mutate({
      name: form.values.name,
      config: fallbackConfig,
      create: true,
    });
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Text>{t('modals.create.text')}</Text>

        <TextInput
          label={t('modals.create.form.name.label')}
          withAsterisk
          {...form.getInputProps('name')}
        />

        <Group grow>
          <Button
            onClick={() => {
              modals.close(id);
            }}
            variant="light"
            color="gray"
            type="button"
          >
            {t('common:cancel')}
          </Button>
          <Button
            type="submit"
            onClick={async () => {
              umami.track('Create new board');
            }}
            disabled={isLoading}
            variant="light"
            color="green"
          >
            {t('modals.create.form.submit')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export const openCreateBoardModal = () => {
  modals.openContextModal({
    modal: 'createBoardModal',
    title: <Trans i18nKey="manage/boards:modals.create.title" />,
    innerProps: {},
  });
};
