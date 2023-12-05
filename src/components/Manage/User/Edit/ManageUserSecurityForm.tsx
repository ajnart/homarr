import { Button, Checkbox, Group, LoadingOverlay, PasswordInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { IconAlertTriangle, IconPassword } from '@tabler/icons-react';
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
  };

  return (
    <>
      <LoadingOverlay visible={isLoading} />
      <Title order={6} mb="md">
        Security
      </Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <PasswordInput
          icon={<IconPassword size="1rem" />}
          label="Password"
          mb="md"
          withAsterisk
          {...form.getInputProps('password')}
        />
        <Checkbox
          label="Terminate existing sessions"
          description="Forces user to log in again on their devices"
          mb="md"
          {...form.getInputProps('terminateExistingSessions')}
        />
        <Checkbox
          label="Confirm"
          description="Password will be updated. Action cannot be reverted."
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
            Update Password
          </Button>
        </Group>
      </form>
    </>
  );
};
