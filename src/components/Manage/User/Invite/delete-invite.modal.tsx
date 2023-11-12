import { Button, Group, Stack, Text } from '@mantine/core';
import { ContextModalProps, modals } from '@mantine/modals';
import { useTranslation } from 'next-i18next';
import { api } from '~/utils/api';

export const DeleteInviteModal = ({ id, innerProps }: ContextModalProps<{ tokenId: string }>) => {
  const { t } = useTranslation('manage/users/invites');
  const utils = api.useContext();
  const { isLoading, mutateAsync: deleteAsync } = api.invites.delete.useMutation({
    onSuccess: async () => {
      await utils.invites.all.invalidate();
      modals.close(id);
    },
  });
  return (
    <Stack>
      <Text>{t('modals.delete.description')}</Text>

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
            await deleteAsync({
              id: innerProps.tokenId,
            });
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
