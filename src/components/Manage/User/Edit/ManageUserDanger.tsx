import { Box, Button, Checkbox, Group, LoadingOverlay, PasswordInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { IconTextSize, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { z } from 'zod';
import { api } from '~/utils/api';

export const ManageUserDanger = ({
  userId,
  username,
}: {
  userId: string;
  username: string | null;
}) => {
  const form = useForm({
    initialValues: {
      username: '',
      confirm: false,
    },
    validate: zodResolver(
      z.object({
        username: z.literal(username),
        confirm: z.literal(true),
      })
    ),
    validateInputOnBlur: true,
    validateInputOnChange: true,
  });

  const apiUtils = api.useUtils();

  const { mutate, isLoading } = api.user.deleteUser.useMutation({
    onSuccess: () => {
      window.location.href = '/manage/users';
    },
    onSettled: () => {
      void apiUtils.user.details.invalidate();
      form.reset();
    },
  });

  const { t } = useTranslation(['manage/users/edit', 'common']);

  const handleSubmit = () => {
    mutate({
      id: userId,
    });
  };

  return (
    <Box maw={500}>
      <LoadingOverlay visible={isLoading} />
      <Title order={3}>{t('sections.deletion.title')}</Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <PasswordInput
          icon={<IconTextSize size="1rem" />}
          label={t('sections.deletion.inputs.confirmUsername.label')}
          description={t('sections.deletion.inputs.confirmUsername.description')}
          mb="md"
          withAsterisk
          {...form.getInputProps('username')}
        />
        <Checkbox
          label={t('sections.deletion.inputs.confirm.label')}
          description={t('sections.deletion.inputs.confirm.description')}
          {...form.getInputProps('confirm')}
        />
        <Group position="right" mt="md">
          <Button
            disabled={!form.isDirty() || !form.isValid()}
            leftIcon={<IconTrash size="1rem" />}
            loading={isLoading}
            color="red"
            variant="light"
            type="submit"
          >
            {t('common:delete')}
          </Button>
        </Group>
      </form>
    </Box>
  );
};
