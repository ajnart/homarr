import { Group, Text, useMantineTheme, MantineTheme } from '@mantine/core';
import {
  IconUpload as Upload,
  IconPhoto as Photo,
  IconX as X,
  IconCheck as Check,
  TablerIcon,
} from '@tabler/icons';
import { showNotification } from '@mantine/notifications';
import { useRef } from 'react';
import { useRouter } from 'next/router';
import { setCookie } from 'cookies-next';
import { Dropzone } from '@mantine/dropzone';
import { useConfig } from '../../tools/state';
import { Config } from '../../tools/types';
import { migrateToIdConfig } from '../../tools/migrate';

function getIconColor(status: DropzoneStatus, theme: MantineTheme) {
  return status.accepted
    ? theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]
    : status.rejected
    ? theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]
    : theme.colorScheme === 'dark'
    ? theme.colors.dark[0]
    : theme.colors.gray[7];
}

function ImageUploadIcon({
  status,
  ...props
}: React.ComponentProps<TablerIcon> & { status: DropzoneStatus }) {
  if (status.accepted) {
    return <Upload {...props} />;
  }

  if (status.rejected) {
    return <X {...props} />;
  }

  return <Photo {...props} />;
}

export const dropzoneChildren = (status: DropzoneStatus, theme: MantineTheme) => (
  <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
    <ImageUploadIcon status={status} style={{ color: getIconColor(status, theme) }} size={80} />

    <div>
      <Text size="xl" inline>
        Drag images here or click to select files
      </Text>
      <Text size="sm" color="dimmed" inline mt={7}>
        Attach as many files as you like, each file should not exceed 5mb
      </Text>
    </div>
  </Group>
);

export default function LoadConfigComponent(props: any) {
  const { setConfig } = useConfig();
  const theme = useMantineTheme();
  const router = useRouter();
  const openRef = useRef<() => void>();

  return (
    <Dropzone.FullScreen
      onDrop={(files) => {
        files[0].text().then((e) => {
          try {
            JSON.parse(e) as Config;
          } catch (e) {
            showNotification({
              autoClose: 5000,
              title: <Text>Error</Text>,
              color: 'red',
              icon: <X />,
              message: 'could not load your config. Invalid JSON format.',
            });
            return;
          }
          const newConfig: Config = JSON.parse(e);
          showNotification({
            autoClose: 5000,
            radius: 'md',
            title: (
              <Text>
                Config <b>{newConfig.name}</b> loaded successfully
              </Text>
            ),
            color: 'green',
            icon: <Check />,
            message: undefined,
          });
          setCookie('config-name', newConfig.name, {
            maxAge: 60 * 60 * 24 * 30,
            sameSite: 'strict',
          });
          const migratedConfig = migrateToIdConfig(newConfig);
          setConfig(migratedConfig);
        });
      }}
      accept={['application/json']}
    >
      {(status: any) => dropzoneChildren(status, theme)}
    </Dropzone.FullScreen>
  );
}
