import { Button, Group, Stack, Text } from '@mantine/core';
import { ContextModalProps, modals } from '@mantine/modals';
import { api } from '~/utils/api';

export const DeleteInviteModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{ tokenId: string }>) => {
  const apiContext = api.useContext();
  const { isLoading, mutateAsync } = api.invites.delete.useMutation({
    onSuccess: async () => {
      await apiContext.invites.all.invalidate();
      modals.close(id);
    },
  });
  return (
    <Stack>
      <Text>
        Are you sure, that you want to delete this invitation? Users with this link will no longer
        be able to create an account using that link.
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
              tokenId: innerProps.tokenId,
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
