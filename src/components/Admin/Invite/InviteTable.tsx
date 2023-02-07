import { ActionIcon, Center, Group, Loader, ScrollArea, Table, Text, Title } from '@mantine/core';
import { openConfirmModal } from '@mantine/modals';
import { RegistrationToken } from '@prisma/client';
import { IconTrash } from '@tabler/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import { queryClient } from '../../../tools/queryClient';

export const InviteTable = () => {
  const { data: invites, isLoading, isError } = useInvitesQuery();

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

type UseInvitesQueryResponse = Omit<RegistrationToken, 'token'>[];

export const useInvitesQuery = () =>
  useQuery<UseInvitesQueryResponse>({
    queryKey: ['invite'],
    queryFn: async () => {
      const response = await axios.get('/api/invites');
      return response.data;
    },
    retry: false,
  });

interface InviteTableRowProps {
  invite: UseInvitesQueryResponse[number];
}

const InviteTableRow = ({ invite }: InviteTableRowProps) => {
  const { mutateAsync: removeAsync } = useMutation({
    mutationKey: ['invite/remove'],
    mutationFn: async (id: string) => {
      await axios.delete(`/api/invites/${id}`);
    },
    onSuccess() {
      queryClient.invalidateQueries(['invite']);
    },
  });

  const handleRemove = async (invite: UseInvitesQueryResponse[number]) => {
    openConfirmModal({
      title: <Title order={4}>Please confirm the removal</Title>,
      children: (
        <Text size="sm">
          Are you sure, that you want to remove the invation <b>{invite.name}</b>?
        </Text>
      ),
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onConfirm: async () => removeAsync(invite.id),
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
