import { Button, Group, Stack, Text } from '@mantine/core';
import { ContextModalProps, modals } from '@mantine/modals';
import { api } from '~/utils/api';

export const DeleteRegistrationTokenModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{ tokenId: string }>) => {
  const apiContext = api.useContext();
  const { isLoading, mutateAsync } = api.registrationTokens.deleteRegistrationToken.useMutation({
    onSuccess: async () => {
      await apiContext.registrationTokens.getAllInvites.invalidate();
      modals.close(id);
    },
  });
  return (
    <Stack>
      <Text>
        Are you sure, that you want to delete this invitation? Users with this link will no longer
        be able to register using that link.
      </Text>

      <Group grow>
        <Button
          onClick={() => {
            modals.close(id);
          }}
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
        >
          Delete
        </Button>
      </Group>
    </Stack>
  );
};
