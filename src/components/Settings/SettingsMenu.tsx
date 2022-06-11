import { ActionIcon, Title, Tooltip, Drawer, Tabs } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { useState } from 'react';
import { IconSettings } from '@tabler/icons';
import AdvancedSettings from './AdvancedSettings';
import CommonSettings from './CommonSettings';

function SettingsMenu(props: any) {
  return (
    <Tabs grow>
      <Tabs.Tab data-autofocus label="Common">
        <CommonSettings />
      </Tabs.Tab>
      <Tabs.Tab label="Customisations">
        <AdvancedSettings />
      </Tabs.Tab>
    </Tabs>
  );
}

export function SettingsMenuButton(props: any) {
  useHotkeys([['ctrl+L', () => setOpened(!opened)]]);

  const [opened, setOpened] = useState(false);
  return (
    <>
      <Drawer
        size="xl"
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
          <IconSettings />
        </Tooltip>
      </ActionIcon>
    </>
  );
}
