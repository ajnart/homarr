import { getCookie, setCookies } from 'cookies-next';
import { GetServerSidePropsContext } from 'next/types';
import fs from 'fs';
import path from 'path';
import { Button, JsonInput, Select, Space } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Config } from '../tools/types';
import { useConfig } from '../tools/state';

export async function getServerSideProps({
  req,
  res,
}: GetServerSidePropsContext): Promise<{ props: { config: Config } }> {
  let cookie = getCookie('config-name', { req, res });
  if (!cookie) {
    setCookies('config-name', 'default', { req, res, maxAge: 60 * 60 * 24 * 30 });
    cookie = 'default';
  }
  // Check if the config file exists
  const configPath = path.join(process.cwd(), 'data/configs', `${cookie}.json`);
  if (!fs.existsSync(configPath)) {
    return {
      props: {
        config: {
          name: cookie.toString(),
          services: [],
          settings: {
            enabledModules: [],
            searchBar: true,
            searchUrl: 'https://www.google.com/search?q=',
          },
        },
      },
    };
  }

  const config = fs.readFileSync(configPath, 'utf8');
  // Print loaded config
  return {
    props: {
      config: JSON.parse(config),
    },
  };
}

export default function TryConfig(props: any) {
  const { config: initialConfig }: { config: Config } = props;
  const { config, loadConfig, setConfig, getConfigs } = useConfig();
  const [value, setValue] = useState(JSON.stringify(config, null, 2));
  const [configList, setConfigList] = useState([] as string[]);
  useEffect(() => {
    setValue(JSON.stringify(initialConfig, null, 2));
    setConfig(initialConfig);
  }, [initialConfig]);
  useEffect(() => {
    setValue(JSON.stringify(config, null, 2));
    // setConfig(initialConfig);
  }, [config]);

  return (
    <div>
      <h1>Try Config</h1>
      <p>
        This page is a demo of the <code>config</code> API.
      </p>
      <p>
        The <code>config</code> API is a way to store configuration data in a JSON file.
      </p>
      <p>
        Cookie loaded was <code>{initialConfig.name}</code>
      </p>
      <JsonInput autosize onChange={setValue} value={value} />
      <Space my="xl" />
      <Button onClick={() => getConfigs().then((configs) => setConfigList(configs))}>
        Get configs
      </Button>
      <Space my="xl" />
      <Select
        label="Config loader"
        onChange={(e) => {
          loadConfig(e ?? 'default');
        }}
        data={
          // If config list is empty, return the current config
          configList.length === 0 ? [config.name] : configList
        }
      />
      <Space my="xl" />
      <Button mx="md" onClick={() => setConfig(JSON.parse(value))}>
        Save config
      </Button>
      <Button
        mx="md"
        onClick={() => setCookies('config-name', 'cringe', { maxAge: 60 * 60 * 24 * 30 })}
      >
        Set cookie to config = cringe
      </Button>
    </div>
  );
}
