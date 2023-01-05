import { Drawer, Tabs, Title } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '../../config/provider';
import { useConfigStore } from '../../config/store';

import CommonSettings from './Common/CommonSettings';
import CustomizationSettings from './Customization/CustomizationSettings';

function SettingsMenu({ newVersionAvailable }: { newVersionAvailable: string }) {
  const { t } = useTranslation('settings/common');

  return (
    <Tabs defaultValue="common">
      <Tabs.List grow>
        <Tabs.Tab value="common">{t('tabs.common')}</Tabs.Tab>
        <Tabs.Tab value="customization">{t('tabs.customizations')}</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel data-autofocus value="common">
        <CommonSettings />
      </Tabs.Panel>
      <Tabs.Panel value="customization">
        <CustomizationSettings />
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
  const { config, name: configName } = useConfigContext();
  const { updateConfig } = useConfigStore();

  return (
    <Drawer
      size="xl"
      padding="lg"
      position="right"
      title={<Title order={5}>{t('title')}</Title>}
      opened={opened}
      onClose={() => {
        closeDrawer();
        if (!configName || !config) {
          return;
        }

        updateConfig(configName, (_) => config, false, true);
      }}
    >
      <SettingsMenu newVersionAvailable={newVersionAvailable} />
    </Drawer>
  );
}
