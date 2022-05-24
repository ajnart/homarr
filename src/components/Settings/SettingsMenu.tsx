import {
  ActionIcon,
  Group,
  Title,
  Text,
  Tooltip,
  SegmentedControl,
  TextInput,
  Drawer,
} from '@mantine/core';
import { useColorScheme, useHotkeys } from '@mantine/hooks';
import { useState } from 'react';
import { Settings as SettingsIcon } from 'tabler-icons-react';
import { useConfig } from '../../tools/state';
import { ColorSchemeSwitch } from '../ColorSchemeToggle/ColorSchemeSwitch';
import ConfigChanger from '../Config/ConfigChanger';
import SaveConfigComponent from '../Config/SaveConfig';
import ModuleEnabler from './ModuleEnabler';

function SettingsMenu(props: any) {
  const { config, setConfig } = useConfig();
  const colorScheme = useColorScheme();
  const { current, latest } = props;

  const matches = [
    { label: 'Google', value: 'https://google.com/search?q=' },
    { label: 'DuckDuckGo', value: 'https://duckduckgo.com/?q=' },
    { label: 'Bing', value: 'https://bing.com/search?q=' },
    { label: 'Custom', value: 'Custom' },
  ];

  const [customSearchUrl, setCustomSearchUrl] = useState(config.settings.searchUrl);
  const [searchUrl, setSearchUrl] = useState(
    matches.find((match) => match.value === config.settings.searchUrl)?.value ?? 'Custom'
  );

  return (
    <Group direction="column" grow>
      <Group grow direction="column" spacing={0}>
        <Text>Search engine</Text>
        <SegmentedControl
          fullWidth
          title="Search engine"
          value={
            // Match config.settings.searchUrl with a key in the matches array
            searchUrl
          }
          onChange={
            // Set config.settings.searchUrl to the value of the selected item
            (e) => {
              setSearchUrl(e);
              setConfig({
                ...config,
                settings: {
                  ...config.settings,
                  searchUrl: e,
                },
              });
            }
          }
          data={matches}
        />
        {searchUrl === 'Custom' && (
          <TextInput
            label="Query URL"
            placeholder="Custom query url"
            value={customSearchUrl}
            onChange={(event) => {
              setCustomSearchUrl(event.currentTarget.value);
              setConfig({
                ...config,
                settings: {
                  ...config.settings,
                  searchUrl: event.currentTarget.value,
                },
              });
            }}
          />
        )}
      </Group>
      <ModuleEnabler />
      <ColorSchemeSwitch />
      <ConfigChanger />
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
  useHotkeys([['ctrl+L', () => setOpened(!opened)]]);

  const [opened, setOpened] = useState(false);
  return (
    <>
      <Drawer
        size="auto"
        padding="xl"
        position="right"
        title={<Title order={3}>Settings</Title>}
        opened={props.opened || opened}
        onClose={() => setOpened(false)}
      >
        <SettingsMenu />
      </Drawer>
      <ActionIcon
        variant="default"
        radius="md"
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
