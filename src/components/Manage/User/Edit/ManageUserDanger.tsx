import { Button, Checkbox, Group, LoadingOverlay, PasswordInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { IconPassword, IconTrash } from '@tabler/icons-react';
import { z } from 'zod';
import { api } from '~/utils/api';

export const ManageUserDanger = ({ userId, username }: { userId: string, username: string }) => {
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
    onSettled: () => {
      void apiUtils.user.details.invalidate();
      form.reset();
    },
  });

  const handleSubmit = () => {
    mutate({
      id: userId,
    });
  };

  return (
    <>
      <LoadingOverlay visible={isLoading} />
      <Title order={6} mb="md">
        Account deletion
      </Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <PasswordInput
          icon={<IconPassword size="1rem" />}
          label="Confirm username"
          description="Type username to confirm deletion"
          mb="md"
          withAsterisk
          {...form.getInputProps('username')}
        />
        <Checkbox
          label="Delete permanently"
          description="I am aware that this action is permanent and all account data will be lost."
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
            Delete
          </Button>
        </Group>
      </form>
    </>
  );
};
