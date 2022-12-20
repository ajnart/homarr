import { Title, Drawer, Tabs, ScrollArea } from '@mantine/core';
import { useTranslation } from 'next-i18next';

import CustomizationSettings from './Customization/CustomizationSettings';
import CommonSettings from './Common/CommonSettings';
import Credits from './Common/Credits';

function SettingsMenu({ newVersionAvailable }: { newVersionAvailable: string }) {
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

export function SettingsDrawer({
  opened,
  closeDrawer,
  newVersionAvailable,
}: SettingsDrawerProps & { newVersionAvailable: string }) {
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
      <SettingsMenu newVersionAvailable={newVersionAvailable} />
      <Credits />
    </Drawer>
  );
}
