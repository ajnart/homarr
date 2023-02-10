import { Button, Center, Checkbox, Group, Table, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ContextModalProps, openConfirmModal, openContextModal } from '@mantine/modals';
import { DashboardPermission } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { UseUsersQueryResponse } from './UserList';

type InnerProps = {
  user: UseUsersQueryResponse[number];
};

export const UserPermissionModal = ({ context, id, innerProps }: ContextModalProps<InnerProps>) => {
  const { onSubmit, getInputProps, values, setFieldValue, isTouched, setValues } =
    useForm<FormType>();
  useUserPermissionsQuery(innerProps.user.id, {
    onSuccess(permissions) {
      setValues((prev) => ({
        permissions:
          permissions?.map((p, index) => {
            const previousDashboard = prev.permissions?.find((x) => x.id === p.id);
            return {
              id: p.id,
              canRead:
                previousDashboard && isTouched(`permissions.${previousDashboard.index}.canRead`)
                  ? previousDashboard.canRead
                  : p.permission !== null,
              canWrite:
                previousDashboard && isTouched(`permissions.${previousDashboard.index}.canWrite`)
                  ? previousDashboard.canWrite
                  : p.permission?.permission === 'write',
              index,
            };
          }) ?? [],
      }));
    },
  });

  const handleSubmit = (values: FormType) => {};

  return (
    <form onSubmit={onSubmit(handleSubmit)}>
      <Table>
        <thead>
          <tr>
            <th>Dashboard</th>
            <th>
              <Text align="center">Can visit</Text>
            </th>
            <th>
              <Text align="center">Can modify</Text>
            </th>
          </tr>
        </thead>
        <tbody>
          {values.permissions?.map((p, index) => (
            <tr>
              <td>
                <Text weight={500}>{p.id}</Text>
              </td>
              <td>
                <Center>
                  <Checkbox
                    {...getInputProps(`permissions.${index}.canRead`, { type: 'checkbox' })}
                    onChange={(ev) => {
                      getInputProps(`permissions.${index}.canRead`, { type: 'checkbox' }).onChange(
                        ev
                      );
                      if (!ev.target.checked) {
                        setFieldValue(`permissions.${index}.canWrite`, false);
                      }
                    }}
                  />
                </Center>
              </td>
              <td>
                <Center>
                  <Checkbox
                    {...getInputProps(`permissions.${index}.canWrite`, { type: 'checkbox' })}
                    onChange={(ev) => {
                      getInputProps(`permissions.${index}.canWrite`, { type: 'checkbox' }).onChange(
                        ev
                      );
                      if (ev.target.checked) {
                        setFieldValue(`permissions.${index}.canRead`, true);
                      }
                    }}
                  />
                </Center>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Group position="right">
        <Button onClick={() => context.closeModal(id)}>Cancel</Button>
        <Button type="submit">Save</Button>
      </Group>
    </form>
  );
};

export const openUserPermissionModal = (innerProps: InnerProps) =>
  openContextModal({
    modal: 'userPermissionModal',
    title: <Title order={4}>Modify the permissions of {innerProps.user.username}</Title>,
    innerProps,
  });

type UseUserPermissionsQueryResult = {
  id: string;
  permission: (DashboardPermission & { permission: 'read' | 'write' }) | null;
}[];

const useUserPermissionsQuery = (
  id: string,
  { onSuccess }: { onSuccess: ((data: UseUserPermissionsQueryResult) => void) | undefined }
) =>
  useQuery<UseUserPermissionsQueryResult>({
    queryKey: ['user/permission', { id }],
    queryFn: async () => {
      const result = await axios.get(`/api/users/${id}/permissions`);
      return result.data;
    },
    onSuccess,
  });

type FormType = {
  permissions: { id: string; canRead: boolean; canWrite: boolean; index: number }[];
};
