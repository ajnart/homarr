import { Text } from '@mantine/core';
import { openConfirmModal } from '@mantine/modals';
import { showSuccessNotification } from '../../../../tools/notifications';
import { api } from '../../../../utils/api';

export const useUserListActions = () => {
  const { mutateAsync: archiveAsync } = useArchiveUserMutation();
  const { mutateAsync: unarchiveAsync } = useEnableUserMutation();
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
      onConfirm: () => removeAsync({ id: user.id }),
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

const useRemoveUserMutation = () => {
  const utils = api.useContext();

  return api.user.remove.useMutation({
    onSuccess() {
      showSuccessNotification({
        title: 'Removed user',
        message: 'Removed user successfully.',
      });

      utils.user.list.invalidate();
      utils.user.count.invalidate();
    },
  });
};

const useArchiveUserMutation = () => {
  const utils = api.useContext();

  return api.user.archive.useMutation({
    onSuccess() {
      showSuccessNotification({
        title: 'Archived user',
        message: 'Archived user successfully.',
      });
      utils.user.list.invalidate();
    },
  });
};

const useEnableUserMutation = () => {
  const utils = api.useContext();

  return api.user.enable.useMutation({
    onSuccess() {
      showSuccessNotification({
        title: 'Unarchived user',
        message: 'Unarchived user successfully.',
      });

      utils.user.list.invalidate();
    },
  });
};
