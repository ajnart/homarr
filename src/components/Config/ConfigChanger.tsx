import { Center, Loader, Select, Tooltip } from '@mantine/core';
import { setCookies } from 'cookies-next';
import { useEffect, useState } from 'react';
import { useConfig } from '../../tools/state';

export default function ConfigChanger() {
  const { config, loadConfig, setConfig, getConfigs } = useConfig();
  const [configList, setConfigList] = useState([] as string[]);
  useEffect(() => {
    getConfigs().then((configs) => setConfigList(configs));
    // setConfig(initialConfig);
  }, [config]);
  // If configlist is empty, return a loading indicator
  if (configList.length === 0) {
    return (
      <Center>
        <Tooltip label={"Loading your configs. This doesn't load in vercel."}>
          <Loader />
        </Tooltip>
      </Center>
    );
  }
  return (
    <Select
      defaultValue={config.name}
      label="Config loader"
      onChange={(e) => {
        loadConfig(e ?? 'default');
        setCookies('config-name', e ?? 'default', { maxAge: 60 * 60 * 24 * 30 });
      }}
      data={
        // If config list is empty, return the current config
        configList.length === 0 ? [config.name] : configList
      }
    />
  );
}
