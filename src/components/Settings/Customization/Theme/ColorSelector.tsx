import {
  ColorSwatch,
  Grid,
  Group,
  MantineTheme,
  Popover,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';
import { useColorTheme } from '../../../../tools/color';

interface ColorControlProps {
  defaultValue: MantineTheme['primaryColor'] | undefined;
  type: 'primary' | 'secondary';
}

export function ColorSelector({ type, defaultValue }: ColorControlProps) {
  const { t } = useTranslation('settings/customization/color-selector');
  const { config, name: configName } = useConfigContext();
  const [color, setColor] =
    type === 'primary'
      ? useState(config?.settings.customization.colors.primary || defaultValue)
      : useState(config?.settings.customization.colors.secondary || defaultValue);
  const [popoverOpened, popover] = useDisclosure(false);
  const { setPrimaryColor, setSecondaryColor } = useColorTheme();
  const updateConfig = useConfigStore((x) => x.updateConfig);

  const theme = useMantineTheme();
  const colors = Object.keys(theme.colors).map((color) => ({
    swatch: theme.colors[color][6],
    color,
  }));

  if (!color || !configName) return null;

  const handleSelection = (color: MantineTheme['primaryColor']) => {
    setColor(color);
    if (type === 'primary') setPrimaryColor(color);
    else setSecondaryColor(color);
    updateConfig(configName, (prev) => {
      const { colors } = prev.settings.customization;
      colors[type] = color;
      return {
        ...prev,
        settings: {
          ...prev.settings,
          customization: {
            ...prev.settings.customization,
            colors,
          },
        },
      };
    });
  };

  const swatches = colors.map(({ color, swatch }) => (
    <Grid.Col span={2} key={color}>
      <ColorSwatch
        component="button"
        type="button"
        onClick={() => handleSelection(color)}
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
        opened={popoverOpened}
        onClose={popover.close}
        position="left"
        withArrow
      >
        <Popover.Target>
          <ColorSwatch
            component="button"
            type="button"
            color={theme.colors[color][6]}
            onClick={popover.toggle}
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
