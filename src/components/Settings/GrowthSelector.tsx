import { Switch } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useConfig } from '../../tools/state';

export function GrowthSelector() {
  const { config, setConfig } = useConfig();
  const defaultPosition = config?.settings?.grow || false;
  const [growState, setGrowState] = useState(defaultPosition);
  const { t } = useTranslation('settings/common.json');
  const toggleGrowState = () => {
    setGrowState(!growState);
    setConfig({
      ...config,
      settings: {
        ...config.settings,
        grow: !growState,
      },
    });
  };

  return (
    <Switch
      label={t('settings/common:grow')}
      checked={growState === true}
      onChange={() => toggleGrowState()}
      size="md"
    />
  );
}
