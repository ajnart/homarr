import { Center, Dialog, Loader, Notification, Select, Tooltip } from '@mantine/core';
import { useToggle } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { setCookie } from 'cookies-next';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';
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
    toggle();

    router.push(`/${value}`);
    setConfigName(value);
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
        <Notification loading title={t('configSelect.loadingNew')} radius="md" disallowClose>
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
