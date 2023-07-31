import { Button, Mark, Stack, Text } from '@mantine/core';
import { ContextModalProps, modals } from '@mantine/modals';
import Link from 'next/link';

export const CopyRegistrationToken = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{ id: string; token: string; expire: Date }>) => {
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

      <Button
        onClick={() => {
          modals.close(id);
        }}
        variant="default"
        fullWidth
      >
        Cancel
      </Button>
    </Stack>
  );
};
