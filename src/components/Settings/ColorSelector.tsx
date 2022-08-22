import React, { useState } from 'react';
import { ColorSwatch, Grid, Group, Popover, Text, useMantineTheme } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { useConfig } from '../../tools/state';
import { useColorTheme } from '../../tools/color';

interface ColorControlProps {
  type: string;
}

export function ColorSelector({ type }: ColorControlProps) {
  const { config, setConfig } = useConfig();
  const [opened, setOpened] = useState(false);
  const { primaryColor, secondaryColor, setPrimaryColor, setSecondaryColor } = useColorTheme();
  const { t } = useTranslation('settings/customization/color-selector');

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
    <Grid.Col span={2} key={color}>
      <ColorSwatch
        component="button"
        type="button"
        onClick={() => setConfigColor(color)}
        color={swatch}
        size={22}
        style={{ cursor: 'pointer' }}
      />
    </Grid.Col>
  ));

  return (
    <Group>
      <Popover
        width={250}
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
            color={theme.colors[configColor][6]}
            onClick={() => setOpened((o) => !o)}
            size={22}
            style={{ cursor: 'pointer' }}
          />
        </Popover.Target>
        <Popover.Dropdown>
          <Grid gutter="lg" columns={14}>
            {swatches}
          </Grid>
        </Popover.Dropdown>
      </Popover>
      <Text>
        {t('suffix', {
          color: type[0].toUpperCase() + type.slice(1),
        })}
      </Text>
    </Group>
  );
}
