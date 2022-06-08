import React, { useState } from 'react';
import { ColorSwatch, Group, Popover, Text, useMantineTheme, MantineTheme } from '@mantine/core';
import { useConfig } from '../../tools/state';
import { useColorTheme } from '../../tools/color';

export function ShadeSelector() {
  const { config, setConfig } = useConfig();
  const [opened, setOpened] = useState(false);

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
    <ColorSwatch
      component="button"
      type="button"
      onClick={() => setConfigShade(shade)}
      key={Number(shade)}
      color={swatch}
      size={22}
      style={{ color: theme.white, cursor: 'pointer' }}
    />
  ));

  const secondarySwatches = secondaryShades.map(({ swatch, shade }) => (
    <ColorSwatch
      component="button"
      type="button"
      onClick={() => setConfigShade(shade)}
      key={Number(shade)}
      color={swatch}
      size={22}
      style={{ color: theme.white, cursor: 'pointer' }}
    />
  ));

  return (
    <Group direction="row" spacing={3}>
      <Popover
        opened={opened}
        onClose={() => setOpened(false)}
        transitionDuration={0}
        target={
          <ColorSwatch
            component="button"
            type="button"
            color={theme.colors[primaryColor][Number(primaryShade)]}
            onClick={() => setOpened((o) => !o)}
            size={22}
            style={{ display: 'block', cursor: 'pointer' }}
          />
        }
        styles={{
          root: {
            marginRight: theme.spacing.xs,
          },
          body: {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
          },
          arrow: {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
          },
        }}
        position="bottom"
        placement="end"
        withArrow
        arrowSize={3}
      >
        <Group direction="column" spacing="xs">
          <Group spacing="xs">{primarySwatches}</Group>
          <Group spacing="xs">{secondarySwatches}</Group>
        </Group>
      </Popover>
      <Text>Primary shade</Text>
    </Group>
  );
}
