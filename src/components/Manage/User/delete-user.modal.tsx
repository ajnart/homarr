import { Button, Group, Stack, Text } from '@mantine/core';
import { ContextModalProps, modals } from '@mantine/modals';
import { Trans, useTranslation } from 'next-i18next';
import { api } from '~/utils/api';

type InnerProps = { id: string; name: string };

export const DeleteUserModal = ({ id, innerProps }: ContextModalProps<InnerProps>) => {
  const { t } = useTranslation('manage/users');
  const utils = api.useContext();
  const { isLoading, mutateAsync } = api.user.deleteUser.useMutation({
    onSuccess: async () => {
      await utils.user.all.invalidate();
      modals.close(id);
    },
  });
  return (
    <Stack>
      <Text>{t('modals.delete.text', innerProps)} </Text>

      <Group grow>
        <Button
          onClick={() => {
            modals.close(id);
          }}
          variant="light"
          color="gray"
        >
          {t('common:cancel')}
        </Button>
        <Button
          onClick={async () => {
            await mutateAsync(innerProps);
          }}
          disabled={isLoading}
          variant="light"
          color="red"
        >
          {t('common:delete')}
        </Button>
      </Group>
    </Stack>
  );
};

export const openDeleteUserModal = (user: InnerProps) => {
  modals.openContextModal({
    modal: 'deleteUserModal',
    title: <Trans i18nKey="manage/users:modals.delete.title" values={{ name: user.name }} />,
    innerProps: user,
  });
};
