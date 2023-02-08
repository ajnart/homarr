import { Button, Center, Checkbox, Group, Table, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ContextModalProps, openContextModal } from '@mantine/modals';
import { DashboardPermission } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { UseUsersQueryResponse } from './UserList';

type InnerProps = {
  user: UseUsersQueryResponse[number];
};

export const UserPermissionModal = ({ context, id, innerProps }: ContextModalProps<InnerProps>) => {
  const form = useForm<FormType>();
  useUserPermissionsQuery(innerProps.user.id, {
    onSuccess(permissions) {
      form.setValues((prev) => ({
        permissions:
          permissions?.map((p, index) => {
            const previousDashboard = prev.permissions?.find((x) => x.id === p.id);
            return {
              id: p.id,
              canRead:
                previousDashboard &&
                form.isTouched(`permissions.${previousDashboard.index}.canRead`)
                  ? previousDashboard.canRead
                  : p.permission !== null,
              canWrite:
                previousDashboard &&
                form.isTouched(`permissions.${previousDashboard.index}.canWrite`)
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
    <form onSubmit={form.onSubmit(handleSubmit)}>
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
          {form.values.permissions?.map((p, index) => (
            <tr>
              <td>
                <Text weight={500}>{p.id}</Text>
              </td>
              <td>
                <Center>
                  <Checkbox
                    {...form.getInputProps(`permissions.${index}.canRead`, { type: 'checkbox' })}
                    onChange={(ev) => {
                      form
                        .getInputProps(`permissions.${index}.canRead`, { type: 'checkbox' })
                        .onChange(ev);
                      if (!ev.target.checked) {
                        form.setFieldValue(`permissions.${index}.canWrite`, false);
                      }
                    }}
                  />
                </Center>
              </td>
              <td>
                <Center>
                  <Checkbox
                    {...form.getInputProps(`permissions.${index}.canWrite`, { type: 'checkbox' })}
                    onChange={(ev) => {
                      form
                        .getInputProps(`permissions.${index}.canWrite`, { type: 'checkbox' })
                        .onChange(ev);
                      if (ev.target.checked) {
                        form.setFieldValue(`permissions.${index}.canRead`, true);
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
        <Button
          onClick={() => {
            if (!form.isTouched('permissions')) {
              context.closeModal(id);
              return;
            }

            // open confirm modal if user is sure to cancel all current changes
          }}
        >
          Cancel
        </Button>
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
