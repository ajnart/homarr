import { ActionIcon, Avatar, Badge, Group, Table, Text } from '@mantine/core';
import { IconArchive, IconArchiveOff, IconKey, IconTrash } from '@tabler/icons';
import dayjs from 'dayjs';
import { openUserPermissionModal } from '../UserPermissionModal';
import { useUserListActions } from './actions';
import { RouterOutputs } from '../../../../utils/api';

type UserList = RouterOutputs['user']['list'];
interface UserListTableProps {
  users: UserList;
}

export const UserListTable = ({ users }: UserListTableProps) => (
  <Table sx={{ minWidth: 800 }} verticalSpacing="sm">
    <thead>
      <tr>
        <th>User</th>
        <th>Role</th>
        <th>Last active</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {users.map((u) => (
        <UserTableRow key={u.id} user={u} />
      ))}
    </tbody>
  </Table>
);

interface UserTableRowProps {
  user: UserList[number];
}

const UserTableRow = ({ user }: UserTableRowProps) => {
  const { archiveAsync, unarchiveAsync, remove } = useUserListActions();

  return (
    <tr key={user.id}>
      <td>
        <Group spacing="sm">
          <Avatar size={40} radius={40}>
            {user.username?.slice(0, 2).toUpperCase()}
          </Avatar>
          <div>
            <Text size="sm" weight={500}>
              {user.username}
            </Text>
          </div>
        </Group>
      </td>

      <td>{user.isAdmin ? 'Admin' : 'User'}</td>
      <td>{dayjs(user.lastActiveAt).fromNow()}</td>
      <td>
        {user.isEnabled ? (
          <Badge fullWidth color="green">
            Enabled
          </Badge>
        ) : (
          <Badge color="red" fullWidth>
            Archived
          </Badge>
        )}
      </td>
      <td>
        <Group>
          {user.isAdmin ? null : user.isEnabled ? (
            <>
              <ActionIcon onClick={() => openUserPermissionModal({ user })}>
                <IconKey size={16} />
              </ActionIcon>
              <ActionIcon onClick={() => archiveAsync({ id: user.id })}>
                <IconArchive color="red" size={16} />
              </ActionIcon>
            </>
          ) : (
            <>
              <ActionIcon onClick={() => unarchiveAsync({ id: user.id })}>
                <IconArchiveOff size={16} />
              </ActionIcon>
              <ActionIcon onClick={() => remove(user)}>
                <IconTrash color="red" size={16} />
              </ActionIcon>
            </>
          )}
        </Group>
      </td>
    </tr>
  );
};
