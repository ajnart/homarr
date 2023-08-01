import { Button, Group, Stack, Text } from '@mantine/core';
import { DateInput, DateTimePicker } from '@mantine/dates';
import { useForm, zodResolver } from '@mantine/form';
import { ContextModalProps, modals } from '@mantine/modals';
import dayjs from 'dayjs';
import { api } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { createInviteSchema } from '~/validations/invite';

export const CreateInviteModal = ({ id }: ContextModalProps<{}>) => {
  const apiContext = api.useContext();
  const { isLoading, mutateAsync } = api.invites.create.useMutation({
    onSuccess: async (data) => {
      await apiContext.invites.all.invalidate();
      modals.close(id);

      modals.openContextModal({
        modal: 'copyInviteModal',
        title: <Text weight="bold">Copy invitation</Text>,
        innerProps: data,
      });
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
      <Text>
        After the expiration, an invite will no longer be valid and the recipient of the invite
        won't be able to create an account.
      </Text>

      <DateTimePicker
        popoverProps={{ withinPortal: true }}
        minDate={minDate}
        maxDate={maxDate}
        withAsterisk
        valueFormat="DD MMM YYYY hh:mm A"
        label="Expiration date"
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
          Cancel
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
          Create
        </Button>
      </Group>
    </Stack>
  );
};
