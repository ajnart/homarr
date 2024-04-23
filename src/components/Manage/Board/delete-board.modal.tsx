import { Button, Group, Stack, Text } from '@mantine/core';
import { ContextModalProps, modals } from '@mantine/modals';
import { Trans, useTranslation } from 'next-i18next';
import { api } from '~/utils/api';

type InnerProps = { boardName: string; onConfirm: () => Promise<void> };

export const DeleteBoardModal = ({ id, innerProps }: ContextModalProps<InnerProps>) => {
  const { t } = useTranslation('manage/boards');
  const utils = api.useContext();
  const { isLoading, mutateAsync } = api.config.delete.useMutation({
    onSuccess: async () => {
      await utils.boards.all.invalidate();
      modals.close(id);
    },
  });

  return (
    <Stack>
      <Text>{t('modals.delete.text')}</Text>

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
            modals.close(id);
            await innerProps.onConfirm();
            await mutateAsync({
              name: innerProps.boardName,
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

export const openDeleteBoardModal = (innerProps: InnerProps) => {
  modals.openContextModal({
    modal: 'deleteBoardModal',
    title: <Trans i18nKey="manage/boards:modals.delete.title" />,
    innerProps,
  });
};
