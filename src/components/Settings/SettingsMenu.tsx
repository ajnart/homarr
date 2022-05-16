import {
  ActionIcon,
  Group,
  Modal,
  Switch,
  Title,
  Text,
  Tooltip,
  SegmentedControl,
  Indicator,
  Alert,
  TextInput,
} from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { AlertCircle, Settings as SettingsIcon } from 'tabler-icons-react';
import { CURRENT_VERSION, REPO_URL } from '../../../data/constants';
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
      <Alert
        icon={<AlertCircle size={16} />}
        title="Update available"
        radius="lg"
        hidden={current === latest}
      >
        Version {latest} is available. Current: {current}
      </Alert>
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
  const [update, setUpdate] = useState(false);
  const [opened, setOpened] = useState(false);
  const [latestVersion, setLatestVersion] = useState(CURRENT_VERSION);
  useEffect(() => {
    // Fetch Data here when component first mounted
    fetch(`https://api.github.com/repos/${REPO_URL}/releases/latest`).then((res) => {
      res.json().then((data) => {
        setLatestVersion(data.tag_name);
        if (data.tag_name !== CURRENT_VERSION) {
          setUpdate(true);
        }
      });
    });
  }, []);
  return (
    <>
      <Modal
        size="xl"
        radius="md"
        title={<Title order={3}>Settings</Title>}
        opened={props.opened || opened}
        onClose={() => setOpened(false)}
      >
        <SettingsMenu current={CURRENT_VERSION} latest={latestVersion} />
      </Modal>
      <ActionIcon
        variant="default"
        radius="md"
        size="xl"
        color="blue"
        style={props.style}
        onClick={() => setOpened(true)}
      >
        <Tooltip label="Settings">
          <Indicator
            size={12}
            disabled={CURRENT_VERSION === latestVersion}
            offset={-3}
            position="top-end"
          >
            <SettingsIcon />
          </Indicator>
        </Tooltip>
      </ActionIcon>
    </>
  );
}
