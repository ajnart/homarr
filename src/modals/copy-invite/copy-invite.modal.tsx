import { Button, CopyButton, Mark, Stack, Text } from '@mantine/core';
import { ContextModalProps, modals } from '@mantine/modals';
import Link from 'next/link';
import { useRouter } from 'next/router';

export const CopyInviteModal = ({
  id,
  innerProps,
}: ContextModalProps<{ id: string; token: string; expire: Date }>) => {
  const inviteUrl = useInviteUrl(innerProps.id, innerProps.token);

  return (
    <Stack>
      <Text>
        Your invitation has been generated. After this modal closes,{' '}
        <b>you'll not be able to copy this link anymore</b>. If you do no longer wish to invite said
        person, you can delete this invitation any time.
      </Text>

      <Link href={`/auth/invite/${innerProps.id}?token=${innerProps.token}`}>Invitation link</Link>

      <Stack spacing="xs">
        <Text weight="bold">ID:</Text>
        <Mark style={{ borderRadius: 4 }} color="gray" px={5}>
          {innerProps.id}
        </Mark>

        <Text weight="bold">Token:</Text>
        <Mark style={{ borderRadius: 4 }} color="gray" px={5}>
          {innerProps.token}
        </Mark>
      </Stack>

      <CopyButton value={inviteUrl}>
        {({ copy }) => (
          <Button
            onClick={() => {
              copy();
              modals.close(id);
            }}
            variant="default"
            fullWidth
          >
            Copy & Dismiss
          </Button>
        )}
      </CopyButton>
    </Stack>
  );
};

const useInviteUrl = (id: string, token: string) => {
  const router = useRouter();

  return `${window.location.href.replace(router.pathname, `/auth/invite/${id}?token=${token}`)}`;
};
