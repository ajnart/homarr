import { Title } from '@mantine/core';
import { ContextModalProps, openContextModal } from '@mantine/modals';
import { useState } from 'react';
import { useBaseUrl } from '../../../hooks/use-base-url';
import { InviteCreateCopyTab } from './create/InviteCreateCopyTab';
import { InviteCreateTab } from './create/InviteCreateCreateTab';

export const InviteCreateModal = ({ context, id }: ContextModalProps) => {
  const baseUrl = useBaseUrl();
  const [url, setUrl] = useState<string>();
  const onCreated = (token: string) => {
    setUrl(`${baseUrl}/register?token=${token}`);
  };

  return url === undefined ? (
    <InviteCreateTab onCreated={onCreated} />
  ) : (
    <InviteCreateCopyTab url={url} closeModal={() => context.closeModal(id)} />
  );
};

export const openInviteCreateModal = () =>
  openContextModal({
    modal: 'inviteCreateModal',
    title: <Title order={4}>Create invite</Title>,
    innerProps: {},
  });
