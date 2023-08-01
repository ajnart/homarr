import { Button, Group, Stack, Text } from '@mantine/core';
import { ContextModalProps, modals } from '@mantine/modals';
import { api } from '~/utils/api';

export const DeleteUserModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{ userId: string; username: string }>) => {
  const apiContext = api.useContext();
  const { isLoading, mutateAsync } = api.user.deleteUser.useMutation({
    onSuccess: async () => {
      await apiContext.user.all.invalidate();
      modals.close(id);
    },
  });
  return (
    <Stack>
      <Text>
        Are you sure, that you want to delete the user {innerProps.username}? This will delete data
        associated with this account, but not any created dashboards by this user.
      </Text>

      <Group grow>
        <Button
          onClick={() => {
            modals.close(id);
          }}
          variant="light"
          color="gray"
        >
          Cancel
        </Button>
        <Button
          onClick={async () => {
            await mutateAsync({
              userId: innerProps.userId,
            });
          }}
          disabled={isLoading}
          variant="light"
          color="red"
        >
          Delete
        </Button>
      </Group>
    </Stack>
  );
};
