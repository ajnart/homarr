import { getCookie, setCookies } from 'cookies-next';
import { GetServerSidePropsContext } from 'next/types';
import fs from 'fs';
import path from 'path';
import { Button, JsonInput, Space } from '@mantine/core';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { showNotification } from '@mantine/notifications';
import { Config } from '../tools/types';
import { useConfig } from '../tools/state';

export async function getServerSideProps({ req, res }: GetServerSidePropsContext) {
  let cookie = getCookie('config-name', { req, res });
  if (!cookie) {
    setCookies('config-name', 'default', { req, res, maxAge: 60 * 60 * 24 * 30 });
    cookie = 'default';
  }
  const config = fs.readFileSync(path.join('data/configs', `${cookie}.json`), 'utf8');
  return {
    props: {
      config: JSON.parse(config),
    },
  };
}

export default function TryConfig(props: any) {
  const { config: initialConfig }: { config: Config } = props;
  const { config, loadConfig, setConfig } = useConfig();
  const [value, setValue] = useState(JSON.stringify(config, null, 2));

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
      <JsonInput autosize onChange={setValue} value={value} />
      <Space my="xl" />
      <Button onClick={() => loadConfig('cringe')}>Load config cringe</Button>
      <Button onClick={() => loadConfig('default')}>Load config default</Button>
      <Button onClick={() => setConfig(JSON.parse(value))}>Save config</Button>
    </div>
  );
}
