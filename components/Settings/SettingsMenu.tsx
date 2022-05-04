import { ActionIcon, Group, Modal, Switch, Title, Text, Tooltip, TextInput } from '@mantine/core';
import { useState } from 'react';
import { Settings as SettingsIcon } from 'tabler-icons-react';
import { useConfig } from '../../tools/state';
import SaveConfigComponent from '../Config/SaveConfig';

function SettingsMenu(props: any) {
  const { config, setConfig } = useConfig();

  return (
    <Group direction="column" grow>
      <TextInput
        label="Search bar querry url"
        defaultValue={config.settings.searchUrl}
        onChange={(e) =>
          setConfig({
            ...config,
            settings: {
              ...config.settings,
              searchUrl: e.target.value,
            },
          })
        }
      />
      <Group direction="column">
        <Switch
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
