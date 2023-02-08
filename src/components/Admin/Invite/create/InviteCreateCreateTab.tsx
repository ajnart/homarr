import { Stack, TextInput, Text, Group, Button } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { RegistrationInvite } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';
import { useScreenSmallerThan } from '../../../../hooks/useScreenSmallerThan';
import { getInputPropsMiddleware } from '../../../../tools/getInputPropsMiddleware';
import { queryClient } from '../../../../tools/queryClient';
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
          data-autoFocus
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

const useCreateInviteMutation = (setToken: (v: string) => void) =>
  useMutation({
    mutationKey: ['invite/create'],
    mutationFn: async (data: FormType) => {
      const response = await axios.post('/api/invites', data);
      return response.data;
    },
    onSuccess(data: RegistrationInvite) {
      setToken(data.token);
      queryClient.invalidateQueries(['invite']);
    },
  });

type FormType = z.infer<typeof registrationInviteCreationInputSchema>;
