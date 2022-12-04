import { ActionIcon, Title, Tooltip, Drawer, Tabs, ScrollArea } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { useState } from 'react';
import { IconSettings } from '@tabler/icons';
import { useTranslation } from 'next-i18next';

import CustomizationSettings from './CustomizationSettings';
import CommonSettings from './CommonSettings';
import Credits from './Credits';

function SettingsMenu() {
  const { t } = useTranslation('settings/common');

  return (
    <Tabs defaultValue="common">
      <Tabs.List grow>
        <Tabs.Tab value="common">{t('tabs.common')}</Tabs.Tab>
        <Tabs.Tab value="customization">{t('tabs.customizations')}</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel data-autofocus value="common">
        <ScrollArea style={{ height: '78vh' }} offsetScrollbars>
          <CommonSettings />
        </ScrollArea>
      </Tabs.Panel>
      <Tabs.Panel value="customization">
        <ScrollArea style={{ height: '78vh' }} offsetScrollbars>
          <CustomizationSettings />
        </ScrollArea>
      </Tabs.Panel>
    </Tabs>
  );
}

export function SettingsMenuButton(props: any) {
  useHotkeys([['ctrl+L', () => setOpened(!opened)]]);
  const { t } = useTranslation('settings/common');

  const [opened, setOpened] = useState(false);

  return (
    <>
      <Drawer
        size="xl"
        padding="lg"
        position="right"
        title={<Title order={5}>{t('title')}</Title>}
        opened={props.opened || opened}
        onClose={() => setOpened(false)}
      >
        <SettingsMenu />
        <Credits />
      </Drawer>
      <Tooltip label={t('tooltip')}>
        <ActionIcon
          variant="default"
          radius="md"
          size="xl"
          color="blue"
          style={props.style}
          onClick={() => setOpened(true)}
        >
          <IconSettings />
        </ActionIcon>
      </Tooltip>
    </>
  );
}
