import { Group, Text, useMantineTheme, MantineTheme } from '@mantine/core';
import { Upload, Photo, X, Icon as TablerIcon, Check } from 'tabler-icons-react';
import { DropzoneStatus, FullScreenDropzone } from '@mantine/dropzone';
import { showNotification } from '@mantine/notifications';
import { useRef } from 'react';
import { useRouter } from 'next/router';
import { setCookies } from 'cookies-next';
import { useConfig } from '../../tools/state';
import { Config } from '../../tools/types';

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
    <FullScreenDropzone
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
          setCookies('config-name', newConfig.name, { maxAge: 60 * 60 * 24 * 30 });
          setConfig(newConfig);
        });
      }}
      accept={['application/json']}
    >
      {(status) => dropzoneChildren(status, theme)}
    </FullScreenDropzone>
  );
}
