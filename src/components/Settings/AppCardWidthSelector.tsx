import React from 'react';
import { Group, Text, Slider } from '@mantine/core';
import { useConfig } from '../../tools/state';

export function AppCardWidthSelector() {
  const { config, setConfig } = useConfig();

  const MARKS = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 6, label: '6' },
    { value: 12, label: '12' },
  ];

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
    <Group direction="column" spacing="xs" grow>
      <Text>App Width</Text>
      <Slider
        defaultValue={config.settings.appCardWidth || 6}
        step={1}
        min={1}
        max={12}
        marks={MARKS}
        styles={{ markLabel: { fontSize: 'xx-small' } }}
        onChange={(value) => setappCardWidth(value)}
      />
    </Group>
  );
}
