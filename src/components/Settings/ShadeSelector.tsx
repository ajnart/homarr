import React, { useState } from 'react';
import {
  ColorSwatch,
  Group,
  Popover,
  Text,
  useMantineTheme,
  MantineTheme,
  Stack,
  Grid,
} from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { useConfig } from '../../tools/state';
import { useColorTheme } from '../../tools/color';

export function ShadeSelector() {
  const { config, setConfig } = useConfig();
  const [opened, setOpened] = useState(false);
  const { t } = useTranslation('settings/customization/shade-selector');

  const { primaryColor, secondaryColor, primaryShade, setPrimaryShade } = useColorTheme();

  const theme = useMantineTheme();
  const primaryShades = theme.colors[primaryColor].map((s, i) => ({
    swatch: theme.colors[primaryColor][i],
    shade: i as MantineTheme['primaryShade'],
  }));
  const secondaryShades = theme.colors[secondaryColor].map((s, i) => ({
    swatch: theme.colors[secondaryColor][i],
    shade: i as MantineTheme['primaryShade'],
  }));

  const setConfigShade = (shade: MantineTheme['primaryShade']) => {
    setPrimaryShade(shade);
    setConfig({
      ...config,
      settings: {
        ...config.settings,
        primaryShade: shade,
      },
    });
  };

  const primarySwatches = primaryShades.map(({ swatch, shade }) => (
    <Grid.Col span={1} key={Number(shade)}>
      <ColorSwatch
        component="button"
        type="button"
        onClick={() => setConfigShade(shade)}
        color={swatch}
        size={22}
        style={{ cursor: 'pointer' }}
      />
    </Grid.Col>
  ));

  const secondarySwatches = secondaryShades.map(({ swatch, shade }) => (
    <Grid.Col span={1} key={Number(shade)}>
      <ColorSwatch
        component="button"
        type="button"
        onClick={() => setConfigShade(shade)}
        color={swatch}
        size={22}
        style={{ cursor: 'pointer' }}
      />
    </Grid.Col>
  ));

  return (
    <Group>
      <Popover
        width={350}
        withinPortal
        opened={opened}
        onClose={() => setOpened(false)}
        position="left"
        withArrow
      >
        <Popover.Target>
          <ColorSwatch
            component="button"
            type="button"
            color={theme.colors[primaryColor][Number(primaryShade)]}
            onClick={() => setOpened((o) => !o)}
            size={22}
            style={{ display: 'block', cursor: 'pointer' }}
          />
        </Popover.Target>
        <Popover.Dropdown>
          <Stack spacing="xs">
            <Grid gutter="lg" columns={10}>
              {primarySwatches}
              {secondarySwatches}
            </Grid>
          </Stack>
        </Popover.Dropdown>
      </Popover>
      <Text>{t('label')}</Text>
    </Group>
  );
}
