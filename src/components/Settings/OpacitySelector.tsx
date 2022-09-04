import React from 'react';
import { Text, Slider, Stack } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { useConfig } from '../../tools/state';

export function OpacitySelector() {
  const { config, setConfig } = useConfig();
  const { t } = useTranslation('settings/customization/opacity-selector');

  const MARKS = [
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 30, label: '30' },
    { value: 40, label: '40' },
    { value: 50, label: '50' },
    { value: 60, label: '60' },
    { value: 70, label: '70' },
    { value: 80, label: '80' },
    { value: 90, label: '90' },
    { value: 100, label: '100' },
  ];

  const setConfigOpacity = (opacity: number) => {
    setConfig({
      ...config,
      settings: {
        ...config.settings,
        appOpacity: opacity,
      },
    });
  };

  return (
    <Stack spacing="xs">
      <Text>{t('label')}</Text>
      <Slider
        defaultValue={config.settings.appOpacity || 100}
        step={10}
        min={10}
        marks={MARKS}
        styles={{ markLabel: { fontSize: 'xx-small' } }}
        onChange={(value) => setConfigOpacity(value)}
      />
    </Stack>
  );
}
