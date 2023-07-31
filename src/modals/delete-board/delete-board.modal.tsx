import { Button, Group, Stack, Text } from '@mantine/core';
import { ContextModalProps, modals } from '@mantine/modals';
import { api } from '~/utils/api';

export const DeleteBoardModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{ boardName: string; onConfirm: () => Promise<void> }>) => {
  const apiContext = api.useContext();
  const { isLoading, mutateAsync } = api.config.delete.useMutation({
    onSuccess: async () => {
      await apiContext.config.all.invalidate();
      modals.close(id);
    },
  });

  return (
    <Stack>
      <Text>
        Are you sure, that you want to delete this board? This action cannot be undone and your data
        will be lost permanently.
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
            modals.close(id);
            await innerProps.onConfirm();
            await mutateAsync({
              name: innerProps.boardName,
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
