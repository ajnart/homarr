import { ActionIcon, Title, Tooltip, Drawer, Tabs, ScrollArea } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { useState } from 'react';
import { IconSettings } from '@tabler/icons';
import { useTranslation } from 'next-i18next';

import CustomizationSettings from './Customization/CustomizationSettings';
import CommonSettings from './Common/CommonSettings';
import Credits from './Common/Credits';

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

interface SettingsDrawerProps {
  opened: boolean;
  closeDrawer: () => void;
}

export function SettingsDrawer({ opened, closeDrawer }: SettingsDrawerProps) {
  const { t } = useTranslation('settings/common');

  return (
    <Drawer
      size="xl"
      padding="lg"
      position="right"
      title={<Title order={5}>{t('title')}</Title>}
      opened={opened}
      onClose={closeDrawer}
    >
      <SettingsMenu />
      <Credits />
    </Drawer>
  );
}
