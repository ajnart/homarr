import React from 'react';
import { Text, Slider, Stack } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { useConfig } from '../../tools/state';

export function AppCardWidthSelector() {
  const { config, setConfig } = useConfig();
  const { t } = useTranslation('settings/customization/app-width');

  const setappCardWidth = (appCardWidth: number) => {
    setConfig({
      ...config,
      settings: {
        ...config.settings,
        appCardWidth,
      },
    });
  };

  return (
    <Stack spacing="xs">
      <Text>{t('label')}</Text>
      <Slider
        label={config.settings.appCardWidth?.toFixed(1)}
        defaultValue={config.settings.appCardWidth ?? 0.7}
        step={0.1}
        min={0.3}
        max={1.2}
        styles={{ markLabel: { fontSize: 'xx-small' } }}
        onChange={(value) => setappCardWidth(value)}
      />
    </Stack>
  );
}
