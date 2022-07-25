import { ActionIcon, Title, Tooltip, Drawer, Tabs, ScrollArea } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { useState } from 'react';
import { IconSettings } from '@tabler/icons';
import AdvancedSettings from './AdvancedSettings';
import CommonSettings from './CommonSettings';
import Credits from './Credits';

function SettingsMenu(props: any) {
  return (
    <Tabs defaultValue="Common">
      <Tabs.List grow>
        <Tabs.Tab value="Common">Common</Tabs.Tab>
        <Tabs.Tab value="Customizations">Customizations</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel data-autofocus value="Common">
        <ScrollArea style={{ height: '78vh' }} offsetScrollbars>
          <CommonSettings />
        </ScrollArea>
      </Tabs.Panel>
      <Tabs.Panel value="Customizations">
        <ScrollArea style={{ height: '78vh' }} offsetScrollbars>
          <AdvancedSettings />
        </ScrollArea>
      </Tabs.Panel>
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
        padding="lg"
        position="right"
        title={<Title order={5}>Settings</Title>}
        opened={props.opened || opened}
        onClose={() => setOpened(false)}
      >
        <SettingsMenu />
        <Credits />
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
