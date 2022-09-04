import { Group, Text, useMantineTheme } from '@mantine/core';
import { IconX as X, IconCheck as Check, IconX, IconPhoto, IconUpload } from '@tabler/icons';
import { showNotification } from '@mantine/notifications';
import { setCookie } from 'cookies-next';
import { Dropzone } from '@mantine/dropzone';
import { useTranslation } from 'next-i18next';
import { useConfig } from '../../tools/state';
import { Config } from '../../tools/types';
import { migrateToIdConfig } from '../../tools/migrate';

export default function LoadConfigComponent(props: any) {
  const { setConfig } = useConfig();
  const theme = useMantineTheme();
  const { t } = useTranslation('settings/general/config-changer');

  return (
    <Dropzone.FullScreen
      onDrop={(files) => {
        files[0].text().then((e) => {
          try {
            JSON.parse(e) as Config;
          } catch (e) {
            showNotification({
              autoClose: 5000,
              title: <Text>{t('dropzone.notifications.invalidConfig.title')}</Text>,
              color: 'red',
              icon: <X />,
              message: t('dropzone.notifications.invalidConfig.message'),
            });
            return;
          }
          const newConfig: Config = JSON.parse(e);
          showNotification({
            autoClose: 5000,
            radius: 'md',
            title: (
              <Text>
                {t('dropzone.notifications.loadedSuccessfully.title', {
                  configName: newConfig.name,
                })}
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
      <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
        <Dropzone.Accept>
          <Text size="xl" inline>
            <IconUpload
              size={50}
              stroke={1.5}
              color={theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]}
            />
            {t('dropzone.accept.text')}
          </Text>
        </Dropzone.Accept>
        <Dropzone.Reject>
          <Text size="xl" inline>
            <IconX
              size={50}
              stroke={1.5}
              color={theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]}
            />
            {t('dropzone.reject.text')}
          </Text>
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconPhoto size={50} stroke={1.5} />
        </Dropzone.Idle>
      </Group>
    </Dropzone.FullScreen>
  );
}
