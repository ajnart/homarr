import {
  ActionIcon,
  Group,
  Modal,
  Switch,
  Title,
  Text,
  Tooltip,
  SegmentedControl,
} from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { useState } from 'react';
import { Settings as SettingsIcon } from 'tabler-icons-react';
import { useConfig } from '../../tools/state';
import { ColorSchemeSwitch } from '../ColorSchemeToggle/ColorSchemeSwitch';
import SaveConfigComponent from '../Config/SaveConfig';

function SettingsMenu(props: any) {
  const { config, setConfig } = useConfig();
  const colorScheme = useColorScheme();
  const matches = [
    { label: 'Google', value: 'https://google.com/search?q=' },
    { label: 'DuckDuckGo', value: 'https://duckduckgo.com/?q=' },
    { label: 'Bing', value: 'https://bing.com/search?q=' },
  ];
  return (
    <Group direction="column" grow>
      <Group>
        <SegmentedControl
          title="Search engine"
          defaultValue={
            // Match config.settings.searchUrl with a key in the matches array
            matches.find((match) => match.value === config.settings.searchUrl)?.value || 'Google'
          }
          onChange={
            // Set config.settings.searchUrl to the value of the selected item
            (e) =>
              setConfig({
                ...config,
                settings: {
                  ...config.settings,
                  searchUrl: e,
                },
              })
          }
          data={matches}
        />
        <Text>Search engine</Text>
      </Group>
      <Group direction="column">
        <Switch
          size="md"
          onChange={(e) =>
            setConfig({
              ...config,
              settings: {
                ...config.settings,
                searchBar: e.currentTarget.checked,
              },
            })
          }
          checked={config.settings.searchBar}
          label="Enable search bar"
        />
      </Group>
      <ColorSchemeSwitch />
      <SaveConfigComponent />
      <Text
        style={{
          alignSelf: 'center',
          fontSize: '0.75rem',
          textAlign: 'center',
          color: '#a0aec0',
        }}
      >
        tip: You can upload your config file by dragging and dropping it onto the page
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
