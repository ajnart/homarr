import { Button, Group, Stack, Text } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm, zodResolver } from '@mantine/form';
import { ContextModalProps, modals } from '@mantine/modals';
import dayjs from 'dayjs';
import { api } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { createRegistrationTokenSchema } from '~/validations/registration-token';

export const CreateRegistrationTokenModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{}>) => {
  const apiContext = api.useContext();
  const { isLoading, mutateAsync } = api.registrationTokens.createRegistrationToken.useMutation({
    onSuccess: async (data) => {
      await apiContext.registrationTokens.getAllInvites.invalidate();
      modals.close(id);

      modals.openContextModal({
        modal: 'copyRegistrationTokenModal',
        title: <Text weight="bold">Copy invitation</Text>,
        innerProps: data,
      })
    },
  });

  const { i18nZodResolver } = useI18nZodResolver();

  const minDate = dayjs().add(5, 'minutes').toDate();
  const maxDate = dayjs().add(6, 'months').toDate();

  const form = useForm({
    initialValues: {
      expirationDate: dayjs().add(7, 'days').toDate(),
    },
    validate: i18nZodResolver(createRegistrationTokenSchema),
  });

  return (
    <Stack>
      <Text>
        After the expiration, a token will no longer be valid and the recipient of the token won't
        be able to create an account.
      </Text>

      <DateInput
        label="Expiration date"
        withAsterisk
        popoverProps={{ withinPortal: true }}
        minDate={minDate}
        maxDate={maxDate}
        {...form.getInputProps('expirationDate')}
      />

      <Group grow>
        <Button
          onClick={() => {
            modals.close(id);
          }}
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
        >
          Create
        </Button>
      </Group>
    </Stack>
  );
};
