import {
  ActionIcon,
  Button,
  CopyButton,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { ContextModalProps, openContextModal } from '@mantine/modals';
import { RegistrationToken } from '@prisma/client';
import { IconCheck, IconCopy } from '@tabler/icons';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { z } from 'zod';
import { getInputPropsMiddleware } from '../../../tools/getInputPropsMiddleware';
import { queryClient } from '../../../tools/queryClient';
import { registrationTokenCreationInputSchema } from '../../../validation/invite';

const useBaseUrl = () => {
  if (typeof window === 'undefined') return null;
  return window.location.origin;
};

export const InviteCreateModal = ({ context, id }: ContextModalProps) => {
  const { getInputProps, onSubmit } = useForm<FormType>({
    validate: zodResolver(registrationTokenCreationInputSchema),
  });
  const [generatedToken, setGeneratedToken] = useState<RegistrationToken>();
  const baseUrl = useBaseUrl();
  const url = `${baseUrl}/register?token=${generatedToken?.token}`;

  const { mutateAsync } = useMutation({
    mutationKey: ['invite/create'],
    mutationFn: async (data: FormType) => {
      const response = await axios.post('/api/invites', data);
      return response.data;
    },
    onSuccess(data: RegistrationToken) {
      setGeneratedToken(data);
      queryClient.invalidateQueries(['invite']);
    },
  });

  const handleSubmit = async (values: FormType) => {
    await mutateAsync(values);
  };

  return !generatedToken ? (
    <form onSubmit={onSubmit(handleSubmit)}>
      <Stack>
        <Text>You can invite other users so they can enjoy your dashboards.</Text>
        <TextInput
          placeholder="Invite for John Doe"
          label="Name"
          {...getInputPropsMiddleware(getInputProps('name'))}
        />
        <Group position="right">
          <Button type="submit">Create</Button>
        </Group>
      </Stack>
    </form>
  ) : (
    <Stack>
      <TextInput
        label="Invite link"
        readOnly
        value={url}
        rightSection={
          <CopyButton value={url} timeout={2000}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                  {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        }
      />
      <Group position="right">
        <CopyButton value={url}>
          {({ copy }) => (
            <Button
              type="submit"
              onClick={() => {
                copy();
                context.closeModal(id);
              }}
            >
              Copy and close
            </Button>
          )}
        </CopyButton>
      </Group>
    </Stack>
  );
};

type FormType = z.infer<typeof registrationTokenCreationInputSchema>;

export const openInviteCreateModal = () =>
  openContextModal({
    modal: 'inviteCreateModal',
    title: <Title order={4}>Create invite</Title>,
    innerProps: {},
  });
