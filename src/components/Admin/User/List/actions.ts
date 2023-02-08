import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { showSuccessNotification } from '../../../../tools/notifications';
import { queryClient } from '../../../../tools/queryClient';

export const useUserListActions = () => {
  const { mutateAsync: archiveAsync } = useArchiveUserMutation();
  const { mutateAsync: unarchiveAsync } = useUnarchiveUserMutation();

  return {
    archiveAsync,
    unarchiveAsync,
  };
};

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
