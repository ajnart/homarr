import { Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { RegistrationInvite } from '@prisma/client';
import { z } from 'zod';
import { useScreenSmallerThan } from '../../../../hooks/useScreenSmallerThan';
import { getInputPropsMiddleware } from '../../../../tools/getInputPropsMiddleware';
import { showSuccessNotification } from '../../../../tools/notifications';
import { api } from '../../../../utils/api';
import { registrationInviteCreationInputSchema } from '../../../../validation/invite';

interface InviteCreateTabProps {
  onCreated: (token: string) => void;
}

export const InviteCreateTab = ({ onCreated }: InviteCreateTabProps) => {
  const { getInputProps, onSubmit } = useForm<FormType>({
    validate: zodResolver(registrationInviteCreationInputSchema),
  });
  const smallerThanSm = useScreenSmallerThan('sm');

  const { mutateAsync: handleSubmit } = useCreateInviteMutation(onCreated);

  return (
    <form onSubmit={onSubmit((v) => handleSubmit(v))}>
      <Stack>
        <Text>You can invite other users so they can enjoy your dashboards.</Text>
        <TextInput
          data-autofocus
          placeholder="Invite for John Doe"
          label="Name"
          {...getInputPropsMiddleware(getInputProps('name'))}
        />
        <Group position="right">
          <Button type="submit" fullWidth={smallerThanSm}>
            Create
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

const useCreateInviteMutation = (setToken: (v: string) => void) => {
  const utils = api.useContext();

  return api.invite.create.useMutation({
    onSuccess(data: RegistrationInvite) {
      setToken(data.token);

      showSuccessNotification({
        title: 'Invite created',
        message: 'The invite has been created successfully.',
      });

      utils.invite.list.invalidate();
      utils.invite.count.invalidate();
    },
  });
};

type FormType = z.infer<typeof registrationInviteCreationInputSchema>;
