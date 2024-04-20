import { Button, Group, Stack, Text } from '@mantine/core';
import { ContextModalProps, modals } from '@mantine/modals';
import { Trans, useTranslation } from 'next-i18next';
import { api } from '~/utils/api';

type InnerProps = { id: string; name: string; type: 'promote' | 'demote' };

export const ChangeUserRoleModal = ({ id, innerProps }: ContextModalProps<InnerProps>) => {
  const { t } = useTranslation('manage/users');
  const utils = api.useContext();
  const { isLoading, mutateAsync } = api.user.changeRole.useMutation({
    onSuccess: async () => {
      await utils.user.all.invalidate();
      await utils.user.details.invalidate();
      modals.close(id);
    },
  });
  return (
    <Stack>
      <Text>{t(`modals.change-role.${innerProps.type}.text`, innerProps)} </Text>

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
          {t('modals.change-role.confirm')}
        </Button>
      </Group>
    </Stack>
  );
};

export const openRoleChangeModal = (user: InnerProps) => {
  modals.openContextModal({
    modal: 'changeUserRoleModal',
    title: (
      <Trans
        i18nKey={`manage/users:modals.change-role.${user.type}.title`}
        values={{ name: user.name }}
      />
    ),
    innerProps: user,
  });
};
