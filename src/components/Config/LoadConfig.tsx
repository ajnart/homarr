import { Group, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { showNotification } from '@mantine/notifications';
import { IconCheck as Check, IconPhoto, IconUpload, IconX, IconX as X } from '@tabler/icons-react';
import { setCookie } from 'cookies-next';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useConfigStore } from '../../config/store';
import { ConfigType } from '../../types/config';
import { api } from '~/utils/api';

export const LoadConfigComponent = () => {
  const theme = useMantineTheme();
  const { t } = useTranslation('settings/general/config-changer');
  const { mutateAsync: loadAsync } = useLoadConfig();

  return (
    <Dropzone.FullScreen
      onDrop={async (files) => {
        const configName = files[0].name.replaceAll('.json', '');
        const fileText = await files[0].text();

        try {
          JSON.parse(fileText) as ConfigType;
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

        const newConfig: ConfigType = JSON.parse(fileText);
        await loadAsync({ name: configName, config: newConfig });
      }}
      accept={['application/json']}
    >
      <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
        <Dropzone.Accept>
          <Stack align="center">
            <IconUpload
              size={50}
              stroke={1.5}
              color={theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]}
            />
            <Title>{t('dropzone.accept.title')}</Title>
            <Text size="xl" inline>
              {t('dropzone.accept.text')}
            </Text>
          </Stack>
        </Dropzone.Accept>
        <Dropzone.Reject>
          <Stack align="center">
            <IconX
              size={50}
              stroke={1.5}
              color={theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]}
            />
            <Title>{t('dropzone.reject.title')}</Title>
            <Text size="xl" inline>
              {t('dropzone.reject.text')}
            </Text>
          </Stack>
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconPhoto size={50} stroke={1.5} />
        </Dropzone.Idle>
      </Group>
    </Dropzone.FullScreen>
  );
};

const useLoadConfig = () => {
  const { t } = useTranslation('settings/general/config-changer');
  const { addConfig } = useConfigStore();
  const router = useRouter();
  return api.config.save.useMutation({
    async onSuccess(_data, variables) {
      await addConfig(variables.name, variables.config);

      showNotification({
        autoClose: 5000,
        radius: 'md',
        title: (
          <Text>
            {t('dropzone.notifications.loadedSuccessfully.title', {
              configName: variables.name,
            })}
          </Text>
        ),
        color: 'green',
        icon: <Check />,
        message: undefined,
      });
      setCookie('config-name', variables.name, {
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'strict',
      });
      router.push(`/${variables.name}`);
    },
  });
};
