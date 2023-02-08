import { Stack, TextInput, Tooltip, ActionIcon, Group, Button } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { IconCheck, IconCopy } from '@tabler/icons';
import { useScreenSmallerThan } from '../../../../hooks/useScreenSmallerThan';

interface InviteCreateCopyTabProps {
  url: string;
  closeModal: () => void;
}

export const InviteCreateCopyTab = ({ url, closeModal }: InviteCreateCopyTabProps) => {
  const { copied, copy } = useClipboard({ timeout: 2000 });
  const smallerThanSm = useScreenSmallerThan('sm');
  const handleCopy = () => {
    copy(url);
  };

  return (
    <Stack>
      <TextInput
        label="Invite link"
        readOnly
        value={url}
        rightSection={
          <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
            <ActionIcon color={copied ? 'teal' : 'gray'} onClick={handleCopy}>
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </ActionIcon>
          </Tooltip>
        }
      />
      <Group position="right">
        <Button
          type="submit"
          fullWidth={smallerThanSm}
          onClick={() => {
            handleCopy();
            closeModal();
          }}
        >
          Copy and close
        </Button>
      </Group>
    </Stack>
  );
};
