import { Box, Button, Checkbox, Group, LoadingOverlay, PasswordInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useInputState } from '@mantine/hooks';
import { IconAlertTriangle, IconPassword } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { z } from 'zod';
import { api } from '~/utils/api';

export const ManageUserSecurityForm = ({ userId }: { userId: string }) => {
  const form = useForm({
    initialValues: {
      password: '',
      terminateExistingSessions: false,
      confirm: false,
    },
    validate: zodResolver(
      z.object({
        password: z.string().min(3),
        terminateExistingSessions: z.boolean(),
        confirm: z.literal(true),
      })
    ),
    validateInputOnBlur: true,
    validateInputOnChange: true,
  });

  const [checked, setChecked] = useInputState(false);

  const { t } = useTranslation(['manage/users/edit', 'common']);

  const apiUtils = api.useUtils();

  const { mutate, isLoading } = api.user.updatePassword.useMutation({
    onSettled: () => {
      void apiUtils.user.details.invalidate();
      form.reset();
    },
  });

  const handleSubmit = (values: { password: string; terminateExistingSessions: boolean }) => {
    mutate({
      newPassword: values.password,
      terminateExistingSessions: values.terminateExistingSessions,
      userId: userId,
    });
    setChecked(false);
  };

  return (
    <Box maw={500}>
      <LoadingOverlay visible={isLoading} />
      <Title order={3}>{t('sections.security.title')}</Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <PasswordInput
          icon={<IconPassword size="1rem" />}
          label={t('sections.security.inputs.password.label')}
          mb="md"
          withAsterisk
          {...form.getInputProps('password')}
        />
        <Checkbox
          label={t('sections.security.inputs.terminateExistingSessions.label')}
          description={t('sections.security.inputs.terminateExistingSessions.description')}
          mb="md"
          {...form.getInputProps('terminateExistingSessions')}
        />
        <Checkbox
          label={t('sections.security.inputs.confirm.label')}
          description={t('sections.security.inputs.confirm.description')}
          checked={checked}
          onClick={(event) => {
            setChecked(event.currentTarget.checked);
          }}
          {...form.getInputProps('confirm')}
        />
        <Group position="right" mt="md">
          <Button
            disabled={!form.isDirty() || !form.isValid()}
            leftIcon={<IconAlertTriangle size="1rem" />}
            loading={isLoading}
            color="red"
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
