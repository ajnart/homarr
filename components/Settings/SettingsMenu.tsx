import { ActionIcon, Group, Modal, Switch, Title, Text, Tooltip, TextInput } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { CSSProperties, useEffect, useState } from 'react';
import { Mail, Settings as SettingsIcon, X } from 'tabler-icons-react';
import { Settings, loadSettings } from '../../tools/settings';
import SaveConfigComponent from '../Config/SaveConfig';

function SettingsMenu(props: any) {
  const [config, setConfig] = useState<Settings>({
    searchUrl: 'https://www.google.com/search?q=',
    searchBar: true,
  });

  useEffect(() => {
    const config = loadSettings('settings');
    if (config) {
      setConfig(config);
    }
  }, []);
  return (
    <Group direction="column" grow>
      <TextInput
        label="Search bar querry url"
        defaultValue={config.searchUrl}
        onChange={(e) => {
          setConfig({
            ...config,
            searchUrl: e.target.value,
          });
          localStorage.setItem(
            'settings',
            JSON.stringify({
              ...config,
              searchUrl: e.target.value,
            })
          );
        }}
      />
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
      </Group>
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
        size="md"
        title={<Title order={3}>Settings</Title>}
        opened={props.opened || opened}
        onClose={() => setOpened(false)}
      >
        <SettingsMenu />
      </Modal>
      <ActionIcon
        variant="default"
        radius="xl"
        size="xl"
        color="blue"
        style={props.style}
        onClick={() => setOpened(true)}
      >
        <Tooltip label="Settings">
          <SettingsIcon />
        </Tooltip>
      </ActionIcon>
    </>
  );
}
