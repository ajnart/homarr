import { Button, CopyButton, Mark, Stack, Text } from '@mantine/core';
import { ContextModalProps, modals } from '@mantine/modals';
import { Trans, useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { RouterOutputs } from '~/utils/api';

type InnerProps = RouterOutputs['invites']['create'];

export const CopyInviteModal = ({ id, innerProps }: ContextModalProps<InnerProps>) => {
  const { t } = useTranslation('manage/users/invites');
  const inviteUrl = useInviteUrl(innerProps.id, innerProps.token);

  return (
    <Stack>
      <Text>
        <Trans
          i18nKey="manage/users/invites:modals.copy.description"
          components={{
            b: <b />,
          }}
        />
      </Text>

      <Link href={`/auth/invite/${innerProps.id}?token=${innerProps.token}`}>
        {t('modals.copy.invitationLink')}
      </Link>

      <Stack spacing="xs">
        <Text weight="bold">{t('modals.copy.details.id')}:</Text>
        <Mark style={{ borderRadius: 4 }} color="gray" px={5}>
          {innerProps.id}
        </Mark>

        <Text weight="bold">{t('modals.copy.details.token')}:</Text>
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
            {t('modals.copy.button.close')}
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

export const openCopyInviteModal = (data: InnerProps) => {
  modals.openContextModal({
    modal: 'copyInviteModal',
    title: <Trans i18nKey="manage/users/invites:modals.copy.title" />,
    innerProps: data,
  });
};
