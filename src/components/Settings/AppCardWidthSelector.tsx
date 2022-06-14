import React from 'react';
import { Group, Text, Slider } from '@mantine/core';
import { useConfig } from '../../tools/state';

export function AppCardWidthSelector() {
  const { config, setConfig } = useConfig();

  const MARKS = [
    { value: 0.8 },
    { value: 1 },
    { value: 1.2 },
    { value: 1.4 },
    { value: 1.6 },
    { value: 2 },
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
        label={null}
        defaultValue={config.settings.appCardWidth}
        step={0.2}
        min={0.8}
        max={2}
        marks={MARKS}
        styles={{ markLabel: { fontSize: 'xx-small' } }}
        onChange={(value) => setappCardWidth(value)}
      />
    </Group>
  );
}
