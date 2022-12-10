import React, { ReactNode } from 'react';
import {
  Button,
  Center,
  createStyles,
  Grid,
  Group,
  NumberInput,
  Select,
  SelectItem,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useTranslation } from 'next-i18next';
import { ClockIntegrationType, IntegrationsType } from '../../../types/integration';
import { integrationModuleTranslationsMap } from './IntegrationsEditModal';
import { TileBaseType } from '../../../types/tile';
import {
  IconArrowsUpDown,
  IconCalendarTime,
  IconClock,
  IconCloudRain,
  IconFileDownload,
} from '@tabler/icons';
import { ServiceIcon } from './Service/ServiceIcon';
import { useForm } from '@mantine/form';
import { Tiles } from './tilesDefinitions';
import { useConfigContext } from '../../../config/provider';
import { useConfigStore } from '../../../config/store';

export type IntegrationChangePositionModalInnerProps = {
  integration: keyof IntegrationsType;
  module: TileBaseType;
};

export const IntegrationChangePositionModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<IntegrationChangePositionModalInnerProps>) => {
  const translationKey = integrationModuleTranslationsMap.get(innerProps.integration);
  const { t } = useTranslation([translationKey ?? '', 'common']);
  const { classes } = useStyles();
  const { name: configName } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);
  const form = useForm<FormType>({
    initialValues: {
      x: innerProps.module.shape.location.x,
      y: innerProps.module.shape.location.y,
      width: innerProps.module.shape.size.width.toString(),
      height: innerProps.module.shape.size.height.toString(),
    },
  });
  if (!configName) return null;
  null;
  const handleSubmit = (values: FormType) => {
    updateConfig(configName, (prev) => {
      return {
        ...prev,
        integrations: {
          ...prev.integrations,
          [innerProps.integration]: {
            ...prev.integrations[innerProps.integration],
            shape: {
              location: {
                x: values.x,
                y: values.y,
              },
              size: {
                height: parseInt(values.height),
                width: parseInt(values.width),
              },
            },
          },
        },
      };
    });
    context.closeModal(id);
  };

  const widthData = useWidthData(innerProps.integration);
  const heightData = useHeightData(innerProps.integration);

  return (
    <Stack>
      <Stack spacing={0}>
        <Center>
          <div className={classes.icon}>{integrationIcons[innerProps.integration]}</div>
        </Center>
        <Text align="center" size="sm">
          Change position of
        </Text>
        <Title align="center" order={4}>
          {t('descriptor.name')}
        </Title>
      </Stack>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Grid>
            <Grid.Col span={12} xs={6}>
              <NumberInput label="X Position" required {...form.getInputProps('x')} />
            </Grid.Col>
            <Grid.Col span={12} xs={6}>
              <NumberInput label="Y Position" required {...form.getInputProps('y')} />
            </Grid.Col>
            <Grid.Col span={12} xs={6}>
              <Select data={widthData} label="Width" required {...form.getInputProps('width')} />
            </Grid.Col>
            <Grid.Col span={12} xs={6}>
              <Select data={heightData} label="Height" required {...form.getInputProps('height')} />
            </Grid.Col>
          </Grid>
          <Group position="right">
            <Button onClick={() => context.closeModal(id)} variant="light">
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit">{t('common:actions.save')}</Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  );
};

type FormType = {
  x: number;
  y: number;
  width: string;
  height: string;
};

// TODO: define width of gridstack somewhere (64)
const useWidthData = (integration: keyof IntegrationsType): SelectItem[] => {
  const tileDefinitions = Tiles[integration];
  const offset = tileDefinitions.minWidth ?? 2;
  const length = (tileDefinitions.maxWidth ?? 12) - offset;
  return Array.from({ length }, (_, i) => i + offset).map((n) => ({
    value: n.toString(),
    label: `${64 * n}px`,
  }));
};

const useHeightData = (integration: keyof IntegrationsType): SelectItem[] => {
  const tileDefinitions = Tiles[integration];
  const offset = tileDefinitions.minHeight ?? 2;
  const length = (tileDefinitions.maxHeight ?? 12) - offset;
  return Array.from({ length }, (_, i) => i + offset).map((n) => ({
    value: n.toString(),
    label: `${64 * n}px`,
  }));
};

const integrationIcons = {
  useNet: <IconFileDownload size="100%" />,
  bitTorrent: <IconFileDownload size="100%" />,
  calendar: <IconCalendarTime size="100%" />,
  clock: <IconClock size="100%" />,
  weather: <IconCloudRain size="100%" />,
  dashDot: <ServiceIcon size="100%" service="dashdot" />,
  torrentNetworkTraffic: <IconArrowsUpDown size="100%" />,
};

const useStyles = createStyles(() => ({
  icon: {
    height: 120,
    width: 120,
  },
}));
