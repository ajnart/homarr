import { Slider, Stack, Text } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';

export function DashboardTilesOpacitySelector() {
  const { config, name: configName } = useConfigContext();
  const [opacity, setOpacity] = useState(config?.settings.customization.appOpacity || 100);
  const { t } = useTranslation('settings/customization/opacity-selector');

  const updateConfig = useConfigStore((x) => x.updateConfig);

  if (!configName) return null;

  const handleChange = (opacity: number) => {
    setOpacity(opacity);
    updateConfig(configName, (prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        customization: {
          ...prev.settings.customization,
          appOpacity: opacity,
        },
      },
    }));
  };

  return (
    <Stack spacing="xs" mb="md">
      <Text>{t('label')}</Text>
      <Slider
        defaultValue={opacity}
        step={10}
        min={10}
        marks={MARKS}
        styles={{ markLabel: { fontSize: 'xx-small' } }}
        onChange={handleChange}
      />
    </Stack>
  );
}

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
