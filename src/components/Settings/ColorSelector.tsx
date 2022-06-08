import React, { useState } from 'react';
import { ColorSwatch, Group, Popover, Text, useMantineTheme } from '@mantine/core';
import { useConfig } from '../../tools/state';
import { useColorTheme } from '../../tools/color';

interface ColorControlProps {
  type: string;
}

export function ColorSelector({ type }: ColorControlProps) {
  const { config, setConfig } = useConfig();
  const [opened, setOpened] = useState(false);

  const { primaryColor, secondaryColor, setPrimaryColor, setSecondaryColor } = useColorTheme();

  const theme = useMantineTheme();
  const colors = Object.keys(theme.colors).map((color) => ({
    swatch: theme.colors[color][6],
    color,
  }));

  const configColor = type === 'primary' ? primaryColor : secondaryColor;

  const setConfigColor = (color: string) => {
    if (type === 'primary') {
      setPrimaryColor(color);
      setConfig({
        ...config,
        settings: {
          ...config.settings,
          primaryColor: color,
        },
      });
    } else {
      setSecondaryColor(color);
      setConfig({
        ...config,
        settings: {
          ...config.settings,
          secondaryColor: color,
        },
      });
    }
  };

  const swatches = colors.map(({ color, swatch }) => (
    <ColorSwatch
      component="button"
      type="button"
      onClick={() => setConfigColor(color)}
      key={color}
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
            color={theme.colors[configColor][6]}
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
            width: 152,
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
        <Group spacing="xs">{swatches}</Group>
      </Popover>
      <Text>{type[0].toUpperCase() + type.slice(1)} color</Text>
    </Group>
  );
}
