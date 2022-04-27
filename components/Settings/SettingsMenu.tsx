import { ActionIcon, Group, Modal, Switch, Title, Text, Tooltip } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { CSSProperties, useEffect, useState } from 'react';
import { Mail, Settings, X } from 'tabler-icons-react';
import { Config, loadConfig } from '../../tools/config';
import SaveConfigComponent from '../Config/SaveConfig';

function SettingsMenu(props: any) {
  const [config, setConfig] = useState<Config>({
    searchBar: true,
  });

  useEffect(() => {
    const config = loadConfig('settings');
    if (config) {
      setConfig(config);
    }
  }, []);
  return (
    <Group direction="column">
      <Switch
        onChange={(e) => {
          setConfig({
            ...config,
            searchBar: e.target.checked,
          });
          localStorage.setItem(
            'settings',
            JSON.stringify({
              ...config,
              searchBar: e.target.checked,
            })
          );
        }}
        checked={config.searchBar}
        label="Enable search bar"
      />
      <SaveConfigComponent />
      <Text
        style={{
          alignSelf: 'center',
          fontSize: '0.75rem',
          textAlign: 'center',
          color: '#a0aec0',
        }}
      >
        tip: You can upload your config file by dragging and dropping it into the page
      </Text>
    </Group>
  );
}

export function SettingsMenuButton(props: any) {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Modal
        size={'xl'}
        title={<Title order={3}>Settings</Title>}
        opened={props.opened || opened}
        onClose={() => setOpened(false)}
      >
        <SettingsMenu />
      </Modal>
      <ActionIcon
        variant="default"
        radius="xl"
        size={'xl'}
        color={'blue'}
        style={props.style}
        onClick={() => setOpened(true)}
      >
        <Tooltip label="Settings">
          <Settings />
        </Tooltip>
      </ActionIcon>
    </>
  );
}
