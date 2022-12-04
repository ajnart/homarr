import { Switch } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useConfigContext } from '../../../config/provider';
import { useConfigStore } from '../../../config/store';
import { SearchEngineCommonSettingsType } from '../../../types/settings';

interface SearchEnabledSwitchProps {
  defaultValue: boolean | undefined;
}

export function SearchEnabledSwitch({ defaultValue }: SearchEnabledSwitchProps) {
  const { t } = useTranslation('settings/general/search-engine');
  const { name: configName } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);

  const [enabled, setEnabled] = useState<boolean>(defaultValue ?? true);

  if (!configName) return null;

  const toggleEnabled = () => {
    setEnabled(!enabled);
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
              enabled: !enabled,
            },
          } as SearchEngineCommonSettingsType,
        },
      },
    }));
  };

  return (
    <Switch checked={enabled} onChange={toggleEnabled} size="md" label={t('searchEnabled.label')} />
  );
}
