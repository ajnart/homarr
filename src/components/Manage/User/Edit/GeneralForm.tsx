import { Box, Button, Group, TextInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { IconAt, IconCheck, IconLetterCase } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { z } from 'zod';
import { api } from '~/utils/api';

export const ManageUserGeneralForm = ({
  userId,
  defaultUsername,
  defaultEmail,
}: {
  userId: string;
  defaultUsername: string;
  defaultEmail: string;
}) => {
  const form = useForm({
    initialValues: {
      username: defaultUsername,
      eMail: defaultEmail,
    },
    validate: zodResolver(
      z.object({
        username: z.string(),
        eMail: z.string().email().or(z.literal('')),
      })
    ),
    validateInputOnBlur: true,
    validateInputOnChange: true,
  });
  const { t } = useTranslation(['manage/users/edit', 'common']);

  const utils = api.useUtils();

  const { mutate, isLoading } = api.user.updateDetails.useMutation({
    onSettled: async () => {
      await utils.user.invalidate();
      form.resetDirty();
    },
  });

  function handleSubmit() {
    mutate({
      userId: userId,
      username: form.values.username,
      eMail: form.values.eMail,
    });
  }

  return (
    <Box maw={500}>
      <Title order={3}>{t('sections.general.title')}</Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          icon={<IconLetterCase size="1rem" />}
          label={t('sections.general.inputs.username.label')}
          mb="md"
          withAsterisk
          {...form.getInputProps('username')}
        />
        <TextInput
          icon={<IconAt size="1rem" />}
          label={t('sections.general.inputs.eMail.label')}
          {...form.getInputProps('eMail')}
        />
        <Group position="right" mt="md">
          <Button
            disabled={!form.isDirty() || !form.isValid() || isLoading}
            loading={isLoading}
            leftIcon={<IconCheck size="1rem" />}
            color="green"
            variant="light"
            type="submit"
          >
            {t('common:save')}
          </Button>
        </Group>
      </form>
    </Box>
  );
};
