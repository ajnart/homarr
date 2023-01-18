import {
  ColorSwatch,
  Grid,
  Group,
  MantineTheme,
  Popover,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';
import { useColorTheme } from '../../../../tools/color';

interface ShadeSelectorProps {
  defaultValue: MantineTheme['primaryShade'] | undefined;
}

export function ShadeSelector({ defaultValue }: ShadeSelectorProps) {
  const { t } = useTranslation('settings/customization/shade-selector');
  const [shade, setShade] = useState(defaultValue);
  const [popoverOpened, popover] = useDisclosure(false);
  const { primaryColor, setPrimaryShade } = useColorTheme();

  const { name: configName } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);

  const theme = useMantineTheme();
  const primaryShades = theme.colors[primaryColor].map((s, i) => ({
    swatch: theme.colors[primaryColor][i],
    shade: i as MantineTheme['primaryShade'],
  }));

  if (shade === undefined || !configName) return null;

  const handleSelection = (shade: MantineTheme['primaryShade']) => {
    setPrimaryShade(shade);
    setShade(shade);
    updateConfig(configName, (prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        customization: {
          ...prev.settings.customization,
          colors: {
            ...prev.settings.customization.colors,
            shade,
          },
        },
      },
    }));
  };

  const primarySwatches = primaryShades.map(({ swatch, shade }) => (
    <Grid.Col span={1} key={Number(shade)}>
      <ColorSwatch
        component="button"
        type="button"
        onClick={() => handleSelection(shade)}
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
        opened={popoverOpened}
        onClose={popover.close}
        position="left"
        withArrow
      >
        <Popover.Target>
          <ColorSwatch
            component="button"
            type="button"
            color={theme.colors[primaryColor][Number(shade)]}
            onClick={popover.toggle}
            size={22}
            style={{ display: 'block', cursor: 'pointer' }}
          />
        </Popover.Target>
        <Popover.Dropdown>
          <Stack spacing="xs">
            <Grid gutter="lg" columns={10}>
              {primarySwatches}
            </Grid>
          </Stack>
        </Popover.Dropdown>
      </Popover>
      <Text>{t('label')}</Text>
    </Group>
  );
}
