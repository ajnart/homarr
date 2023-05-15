import { Center, Dialog, Loader, Notification, Select, Tooltip } from '@mantine/core';
import { useToggle } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { setCookie } from 'cookies-next';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons';
import { useConfigContext } from '../../config/provider';

export default function ConfigChanger() {
  const router = useRouter();

  const { t } = useTranslation('settings/general/config-changer');
  const { name: configName, setConfigName } = useConfigContext();

  const { data: configs, isLoading } = useConfigsQuery();
  const [activeConfig, setActiveConfig] = useState(configName);
  const [isRefreshing, toggle] = useToggle();

  const onConfigChange = (value: string) => {
    setCookie('config-name', value ?? 'default', {
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'strict',
    });
    setActiveConfig(value);

    notifications.show({
      id: 'load-data',
      loading: true,
      title: t('configSelect.loadingNew'),
      radius: 'md',
      withCloseButton: false,
      message: t('configSelect.pleaseWait'),
      autoClose: false,
    });

    setTimeout(() => {
      notifications.update({
        id: 'load-data',
        color: 'teal',
        radius: 'md',
        withCloseButton: false,
        title: t('configSelect.loadingNew'),
        message: t('configSelect.pleaseWait'),
        icon: <IconCheck size="1rem" />,
        autoClose: 2000,
      });
    }, 3000);
    setTimeout(() => {
      router.push(`/${value}`);
      setConfigName(value);
    }, 500);
  };

  // If configlist is empty, return a loading indicator
  if (isLoading || !configs || configs.length === 0 || !configName) {
    return (
      <Tooltip label={"Loading your configs. This doesn't load in vercel."}>
        <Center>
          <Loader />
        </Center>
      </Tooltip>
    );
  }

  return (
    <>
      <Select
        label={t('configSelect.label')}
        description={t('configSelect.description', { configCount: configs.length })}
        value={activeConfig}
        onChange={onConfigChange}
        data={configs}
      />
      <Dialog
        position={{ top: 0, left: 0 }}
        unstyled
        opened={isRefreshing}
        onClose={() => toggle()}
        size="lg"
        radius="md"
      >
        <Notification
          loading
          title={t('configSelect.loadingNew')}
          radius="md"
          withCloseButton={false}
        >
          {t('configSelect.pleaseWait')}
        </Notification>
      </Dialog>
    </>
  );
}

const useConfigsQuery = () =>
  useQuery({
    queryKey: ['config/get-all'],
    queryFn: fetchConfigs,
  });

const fetchConfigs = async () => (await (await fetch('/api/configs')).json()) as string[];
