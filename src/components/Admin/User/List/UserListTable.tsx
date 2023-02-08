import { ActionIcon, Avatar, Badge, Group, Table, Text } from '@mantine/core';
import { IconArchive, IconArchiveOff, IconKey, IconTrash } from '@tabler/icons';
import dayjs from 'dayjs';
import { UseUsersQueryResponse } from '../UserList';
import { openUserPermissionModal } from '../UserPermissionModal';
import { useUserListActions } from './actions';

interface UserListTableProps {
  users: UseUsersQueryResponse;
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
  user: UseUsersQueryResponse[number];
}

const UserTableRow = ({ user }: UserTableRowProps) => {
  const { archiveAsync, unarchiveAsync: enableAsync } = useUserListActions();

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

      <td>{user.role === 'admin' ? 'Admin' : 'User'}</td>
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
          {user.role === 'admin' ? null : user.isEnabled ? (
            <>
              <ActionIcon onClick={() => openUserPermissionModal({ user })}>
                <IconKey size={16} />
              </ActionIcon>
              <ActionIcon onClick={() => archiveAsync(user.id)}>
                <IconArchive color="red" size={16} />
              </ActionIcon>
            </>
          ) : (
            <>
              <ActionIcon onClick={() => enableAsync(user.id)}>
                <IconArchiveOff size={16} />
              </ActionIcon>
              <ActionIcon>
                <IconTrash color="red" size={16} />
              </ActionIcon>
            </>
          )}
        </Group>
      </td>
    </tr>
  );
};
