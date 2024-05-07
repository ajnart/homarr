import { Button, Group, Stack, Text } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { ContextModalProps, modals } from '@mantine/modals';
import dayjs from 'dayjs';
import { Trans, useTranslation } from 'next-i18next';
import { api } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { createInviteSchema } from '~/validations/invite';

import { openCopyInviteModal } from './copy-invite.modal';

export const CreateInviteModal = ({ id }: ContextModalProps<{}>) => {
  const { t } = useTranslation('manage/users/invites');
  const utils = api.useContext();
  const { isLoading, mutateAsync } = api.invites.create.useMutation({
    onSuccess: async (data) => {
      await utils.invites.all.invalidate();
      modals.close(id);

      openCopyInviteModal(data);
    },
  });

  const { i18nZodResolver } = useI18nZodResolver();

  const minDate = dayjs().add(5, 'minutes').toDate();
  const maxDate = dayjs().add(6, 'months').toDate();

  const form = useForm({
    initialValues: {
      expirationDate: dayjs().add(7, 'days').toDate(),
    },
    validate: i18nZodResolver(createInviteSchema),
  });

  return (
    <Stack>
      <Text>{t('modals.create.description')}</Text>

      <DateTimePicker
        popoverProps={{ withinPortal: true }}
        minDate={minDate}
        maxDate={maxDate}
        withAsterisk
        valueFormat="DD MMM YYYY HH:mm"
        label={t('modals.create.form.expires')}
        variant="filled"
        {...form.getInputProps('expirationDate')}
      />

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
            await mutateAsync({
              expiration: form.values.expirationDate,
            });
          }}
          disabled={isLoading}
          variant="light"
          color="green"
        >
          {t('modals.create.form.submit')}
        </Button>
      </Group>
    </Stack>
  );
};

export const openCreateInviteModal = () => {
  modals.openContextModal({
    modal: 'createInviteModal',
    title: <Trans i18nKey="manage/users/invites:modals.create.title" />,
    innerProps: {},
  });
};
