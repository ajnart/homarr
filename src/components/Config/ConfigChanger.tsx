import { Center, Loader, Select, Tooltip } from '@mantine/core';
import { setCookie } from 'cookies-next';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { useConfig } from '../../tools/state';

export default function ConfigChanger() {
  const { config, loadConfig, setConfig, getConfigs } = useConfig();
  const [configList, setConfigList] = useState<string[]>([]);
  const [value, setValue] = useState(config.name);
  const { t } = useTranslation('settings/general/config-changer');

  useEffect(() => {
    getConfigs().then((configs) => setConfigList(configs));
  }, [config]);
  // If configlist is empty, return a loading indicator
  if (configList.length === 0) {
    return (
      <Tooltip label={"Loading your configs. This doesn't load in vercel."}>
        <Center>
          <Loader />
        </Center>
      </Tooltip>
    );
  }
  // return <Select data={[{ value: '1', label: '1' },]} onChange={(e) => console.log(e)} value="1" />;
  return (
    <Select
      label={t('configSelect.label')}
      value={value}
      defaultValue={config.name}
      onChange={(e) => {
        loadConfig(e ?? 'default');
        setCookie('config-name', e ?? 'default', {
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'strict',
        });
      }}
      data={
        // If config list is empty, return the current config
        configList.length === 0 ? [config.name] : configList
      }
    />
  );
}
