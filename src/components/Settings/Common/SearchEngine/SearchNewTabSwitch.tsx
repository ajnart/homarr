import { Switch } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';
import { SearchEngineCommonSettingsType } from '../../../../types/settings';

interface SearchNewTabSwitchProps {
  defaultValue: boolean | undefined;
}

export function SearchNewTabSwitch({ defaultValue }: SearchNewTabSwitchProps) {
  const { t } = useTranslation('settings/general/search-engine');
  const { name: configName } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);

  const [openInNewTab, setOpenInNewTab] = useState<boolean>(defaultValue ?? true);

  if (!configName) return null;

  const toggleOpenInNewTab = () => {
    setOpenInNewTab(!openInNewTab);
    updateConfig(configName, (prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        common: {
          ...prev.settings.common,
          searchEngine: {
            ...prev.settings.common.searchEngine,
            properties: {
              ...prev.settings.common.searchEngine.properties,
              openInNewTab: !openInNewTab,
            },
          } as SearchEngineCommonSettingsType,
        },
      },
    }));
  };

  return (
    <Switch
      checked={openInNewTab}
      onChange={toggleOpenInNewTab}
      label={t('searchNewTab.label')}
    />
  );
}
