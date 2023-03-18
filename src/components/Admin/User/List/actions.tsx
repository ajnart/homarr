import { openConfirmModal } from '@mantine/modals';
import { Text } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { showSuccessNotification } from '../../../../tools/notifications';
import { queryClient } from '../../../../tools/queryClient';

export const useUserListActions = () => {
  const { mutateAsync: archiveAsync } = useArchiveUserMutation();
  const { mutateAsync: unarchiveAsync } = useUnarchiveUserMutation();
  const { mutateAsync: removeAsync } = useRemoveUserMutation();
  const remove = (user: { id: string; username: string | null }) => {
    openConfirmModal({
      title: 'Remove user',
      children: (
        <Text>
          Are you sure you want to remove user{' '}
          <Text span weight={500}>
            {user.username}
          </Text>
          ?
        </Text>
      ),
      onConfirm: () => removeAsync(user.id),
      labels: {
        confirm: 'Yes, remove',
        cancel: 'No, cancel',
      },
    });
  };

  return {
    archiveAsync,
    unarchiveAsync,
    remove,
  };
};

const useRemoveUserMutation = () =>
  useMutation({
    mutationKey: ['user/remove'],
    mutationFn: async (id: string) => {
      const result = await axios.delete(`/api/users/${id}`);
      return result.data;
    },
    onSuccess() {
      showSuccessNotification({
        title: 'Removed user',
        message: 'Removed user successfully.',
      });
      queryClient.invalidateQueries(['users']);
    },
  });

const useArchiveUserMutation = () =>
  useMutation({
    mutationKey: ['user/archive'],
    mutationFn: async (id: string) => {
      const result = await axios.post(`/api/users/${id}/archive`);
      return result.data;
    },
    onSuccess() {
      showSuccessNotification({
        title: 'Archived user',
        message: 'Archived user successfully.',
      });
      queryClient.invalidateQueries(['users']);
    },
  });

const useUnarchiveUserMutation = () =>
  useMutation({
    mutationKey: ['user/unarchive'],
    mutationFn: async (id: string) => {
      const result = await axios.post(`/api/users/${id}/unarchive`);
      return result.data;
    },
    onSuccess() {
      showSuccessNotification({
        title: 'Unarchived user',
        message: 'Unarchived user successfully.',
      });
      queryClient.invalidateQueries(['users']);
    },
  });
