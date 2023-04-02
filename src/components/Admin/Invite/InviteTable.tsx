import { ActionIcon, Center, Group, Loader, ScrollArea, Table, Text, Title } from '@mantine/core';
import { openConfirmModal } from '@mantine/modals';
import { IconTrash } from '@tabler/icons';
import dayjs from 'dayjs';
import { showSuccessNotification } from '../../../tools/notifications';
import { RouterOutputs, api } from '../../../utils/api';

type InviteList = RouterOutputs['invite']['list'];

export const InviteTable = () => {
  const { data: invites, isLoading, isError } = api.invite.list.useQuery();

  return (
    <ScrollArea>
      <Table sx={{ minWidth: 800 }} verticalSpacing="sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Expiration date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invites?.map((u) => (
            <InviteTableRow key={u.id} invite={u} />
          ))}
        </tbody>
      </Table>
      {isLoading ? (
        <Center mt="md">
          <Loader />
        </Center>
      ) : null}
      {isError ? (
        <Text align="center" mt="md">
          An error occurred during the query
        </Text>
      ) : null}
      {invites?.length === 0 ? (
        <Text align="center" mt="md">
          No items have been found
        </Text>
      ) : null}
    </ScrollArea>
  );
};

interface InviteTableRowProps {
  invite: InviteList[number];
}

const InviteTableRow = ({ invite }: InviteTableRowProps) => {
  const { mutateAsync: removeAsync } = useInviteRemoveMutation();

  const handleRemove = async (invite: InviteList[number]) => {
    openConfirmModal({
      title: <Title order={4}>Please confirm the removal</Title>,
      children: (
        <Text size="sm">
          Are you sure, that you want to remove the invation <b>{invite.name}</b>?
        </Text>
      ),
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onConfirm: async () => removeAsync({ id: invite.id }),
    });
  };

  return (
    <tr key={invite.id}>
      <td>
        <Text size="sm" weight={500}>
          {invite.name}
        </Text>
      </td>

      <td>{dayjs(invite.expiresAt).fromNow()}</td>
      <td>
        <Group>
          <ActionIcon onClick={() => handleRemove(invite)}>
            <IconTrash color="red" size={16} />
          </ActionIcon>
        </Group>
      </td>
    </tr>
  );
};

const useInviteRemoveMutation = () => {
  const utils = api.useContext();

  return api.invite.remove.useMutation({
    onSuccess() {
      showSuccessNotification({
        title: 'Removed invite',
        message: 'Removed invite successfully.',
      });

      utils.invite.list.invalidate();
      utils.invite.count.invalidate();
    },
  });
};
