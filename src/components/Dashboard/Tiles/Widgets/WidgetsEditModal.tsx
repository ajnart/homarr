import {
  Alert,
  Button,
  Card,
  Flex,
  Group,
  MultiSelect,
  NumberInput,
  Select,
  Slider,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { IconAlertTriangle, IconPlaylistX, IconPlus } from '@tabler/icons-react';
import { Trans, useTranslation } from 'next-i18next';
import { FC, useState } from 'react';
import { useConfigContext } from '~/config/provider';
import { useConfigStore } from '~/config/store';
import { mapObject } from '~/tools/client/objects';
import type { IDraggableListInputValue, IWidgetOptionValue } from '~/widgets/widgets';
import { IWidget } from '~/widgets/widgets';

import Widgets from '../../../../widgets';
import { InfoCard } from '../../../InfoCard/InfoCard';
import { DraggableList } from './Inputs/DraggableList';
import { LocationSelection } from './Inputs/LocationSelection';
import { StaticDraggableList } from './Inputs/StaticDraggableList';

export type WidgetEditModalInnerProps = {
  widgetId: string;
  widgetType: string;
  options: IWidget<string, any>['properties'];
  widgetOptions: IWidget<string, any>['properties'];
};

export type IntegrationOptionsValueType = IWidget<string, any>['properties'][string];

export const WidgetsEditModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<WidgetEditModalInnerProps>) => {
  const { t } = useTranslation([`modules/${innerProps.widgetType}`, 'common']);
  const [moduleProperties, setModuleProperties] = useState(innerProps.options);
  const items = Object.entries(innerProps.widgetOptions ?? {}) as [
    string,
    IntegrationOptionsValueType,
  ][];

  // Find the Key in the "Widgets" Object that matches the widgetId
  const currentWidgetDefinition = Widgets[innerProps.widgetType as keyof typeof Widgets];
  const { name: configName } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);

  if (!configName || !innerProps.options) return null;

  const handleChange = (key: string, value: IntegrationOptionsValueType) => {
    setModuleProperties((prev) => {
      const copyOfPrev: any = { ...prev };
      copyOfPrev[key] = value;
      return copyOfPrev;
    });
  };

  const handleSave = () => {
    updateConfig(
      configName,
      (prev) => {
        const currentWidget = prev.widgets.find((x) => x.id === innerProps.widgetId);
        currentWidget!.properties = moduleProperties;

        return {
          ...prev,
          widgets: [...prev.widgets.filter((x) => x.id !== innerProps.widgetId), currentWidget!],
        };
      },
      true
    );
    context.closeModal(id);
  };

  return (
    <Stack>
      {items.map(([key], index) => {
        const option = (currentWidgetDefinition as any).options[key] as IWidgetOptionValue;
        const value = moduleProperties[key] ?? option.defaultValue;

        if (!option) {
          return (
            <Alert icon={<IconAlertTriangle />} color="red">
              <Text>
                <Trans
                  i18nKey="modules/common:errors.unmappedOptions.text"
                  values={{ key }}
                  components={{ b: <b />, code: <code /> }}
                />
              </Text>
            </Alert>
          );
        }

        return (
          <WidgetOptionTypeSwitch
            key={`${key}.${index}`}
            option={option}
            widgetId={innerProps.widgetType}
            propName={key}
            value={value}
            handleChange={handleChange}
          />
        );
      })}
      <Group position="right">
        <Button onClick={() => context.closeModal(id)} variant="light">
          {t('common:cancel')}
        </Button>
        <Button onClick={handleSave}>{t('common:save')}</Button>
      </Group>
    </Stack>
  );
};

// Widget switch
// Widget options are computed based on their type.
// here you can define new types for options (along with editing the widgets.d.ts file)
const WidgetOptionTypeSwitch: FC<{
  option: IWidgetOptionValue;
  widgetId: string;
  propName: string;
  value: any;
  handleChange: (key: string, value: IntegrationOptionsValueType) => void;
}> = ({ option, widgetId, propName: key, value, handleChange }) => {
  const { t } = useTranslation([`modules/${widgetId}`, 'common']);
  const info = option.info ?? false;
  const link = option.infoLink ?? undefined;

  if (option.hide) return null;

  switch (option.type) {
    case 'switch':
      return (
        <Group align="center" spacing="sm">
          <Switch
            label={t(`descriptor.settings.${key}.label`)}
            checked={value as boolean}
            onChange={(ev) => handleChange(key, ev.currentTarget.checked)}
            {...option.inputProps}
          />
          {info && <InfoCard message={t(`descriptor.settings.${key}.info`)} link={link} />}
        </Group>
      );
    case 'text':
      return (
        <Stack spacing={0}>
          <Group align="center" spacing="sm">
            <Text size="0.875rem" weight="500">
              {t(`descriptor.settings.${key}.label`)}
            </Text>
            {info && <InfoCard message={t(`descriptor.settings.${key}.info`)} link={link} />}
          </Group>
          <TextInput
            value={value as string}
            onChange={(ev) => handleChange(key, ev.currentTarget.value)}
            {...option.inputProps}
          />
        </Stack>
      );
    case 'multi-select':
      const multiSelectItems = typeof option.data === 'function' ? option.data() : option.data;
      const multiSelectData = multiSelectItems.map((dataType) => {
        return !dataType.label
          ? {
              value: dataType.value,
              label: t(`descriptor.settings.${key}.data.${dataType.value}`),
            }
          : dataType;
      });
      return (
        <Stack spacing={0}>
          <Group align="center" spacing="sm">
            <Text size="0.875rem" weight="500">
              {t(`descriptor.settings.${key}.label`)}
            </Text>
            {info && <InfoCard message={t(`descriptor.settings.${key}.info`)} link={link} />}
          </Group>
          <MultiSelect
            searchable
            defaultValue={option.defaultValue}
            data={multiSelectData}
            value={value as string[]}
            onChange={(v) => handleChange(key, v)}
            withinPortal
            {...option.inputProps}
          />
        </Stack>
      );
    case 'select':
      const selectItems = typeof option.data === 'function' ? option.data() : option.data;
      const selectData = selectItems.map((dataType) => {
        return !dataType.label
          ? {
              value: dataType.value,
              label: t(`descriptor.settings.${key}.data.${dataType.value}`),
            }
          : dataType;
      });
      return (
        <Stack spacing={0}>
          <Group align="center" spacing="sm">
            <Text size="0.875rem" weight="500">
              {t(`descriptor.settings.${key}.label`)}
            </Text>
            {info && <InfoCard message={t(`descriptor.settings.${key}.info`)} link={link} />}
          </Group>
          <Select
            searchable
            defaultValue={option.defaultValue}
            data={selectData}
            value={value as string}
            onChange={(v) => handleChange(key, v ?? option.defaultValue)}
            withinPortal
            {...option.inputProps}
          />
        </Stack>
      );
    case 'number':
      return (
        <Stack spacing={0}>
          <Group align="center" spacing="sm">
            <Text size="0.875rem" weight="500">
              {t(`descriptor.settings.${key}.label`)}
            </Text>
            {info && <InfoCard message={t(`descriptor.settings.${key}.info`)} link={link} />}
          </Group>
          <NumberInput
            value={value as number}
            onChange={(v) => handleChange(key, v!)}
            {...option.inputProps}
          />
        </Stack>
      );
    case 'slider':
      return (
        <Stack spacing={0}>
          <Group align="center" spacing="sm">
            <Text size="0.875rem" weight="500">
              {t(`descriptor.settings.${key}.label`)}
            </Text>
            {info && <InfoCard message={t(`descriptor.settings.${key}.info`)} link={link} />}
          </Group>
          <Slider
            label={value}
            value={value as number}
            min={option.min}
            max={option.max}
            step={option.step}
            onChange={(v) => handleChange(key, v)}
            {...option.inputProps}
          />
        </Stack>
      );
    case 'location':
      return (
        <LocationSelection
          propName={key}
          value={value}
          handleChange={handleChange}
          widgetId={widgetId}
          info={info}
          infoLink={link}
        />
      );

    case 'draggable-list':
      /* eslint-disable no-case-declarations */
      const typedVal = value as IDraggableListInputValue['defaultValue'];

      const extractSubValue = (liName: string, settingName: string) =>
        typedVal.find((v) => v.key === liName)?.subValues?.[settingName];

      const handleSubChange = (liName: string, settingName: string) => (_: any, newVal: any) =>
        handleChange(
          key,
          typedVal.map((oldVal) =>
            oldVal.key === liName
              ? {
                  ...oldVal,
                  subValues: {
                    ...oldVal.subValues,
                    [settingName]: newVal,
                  },
                }
              : oldVal
          )
        );

      return (
        <Stack spacing="xs">
          <Group align="center" spacing="sm">
            <Text>{t(`descriptor.settings.${key}.label`)}</Text>
            {info && <InfoCard message={t(`descriptor.settings.${key}.info`)} link={link} />}
          </Group>
          <StaticDraggableList
            value={typedVal}
            onChange={(v) => handleChange(key, v)}
            labels={mapObject(option.items, (liName) =>
              t(`descriptor.settings.${key}.${liName}.label`)
            )}
          >
            {mapObject(option.items, (liName, liSettings) =>
              Object.entries(liSettings).map(([settingName, setting], i) => (
                <WidgetOptionTypeSwitch
                  key={`${liName}.${settingName}.${i}`}
                  option={setting as IWidgetOptionValue}
                  widgetId={widgetId}
                  propName={`${key}.${liName}.${settingName}`}
                  value={extractSubValue(liName, settingName)}
                  handleChange={handleSubChange(liName, settingName)}
                />
              ))
            )}
          </StaticDraggableList>
        </Stack>
      );
    case 'multiple-text':
      return (
        <Stack spacing={0}>
          <Group align="center" spacing="sm">
            <Text size="0.875rem" weight="500">
              {t(`descriptor.settings.${key}.label`)}
            </Text>
            {info && <InfoCard message={t(`descriptor.settings.${key}.info`)} link={link} />}
          </Group>
          <MultiSelect
            data={value.map((name: any) => ({ value: name, label: name }))}
            description={t(`descriptor.settings.${key}.description`)}
            defaultValue={value as string[]}
            withinPortal
            searchable
            creatable
            getCreateLabel={(query) => t('common:createItem', { item: query })}
            onChange={(values) =>
              handleChange(
                key,
                values.map((item: string) => item)
              )
            }
          />
        </Stack>
      );
    case 'draggable-editable-list':
      const { t: translateDraggableList } = useTranslation('widgets/draggable-list');
      return (
        <Stack spacing="xs">
          <Group align="center" spacing="sm">
            <Text>{t(`descriptor.settings.${key}.label`)}</Text>
            {info && <InfoCard message={t(`descriptor.settings.${key}.info`)} link={link} />}
          </Group>
          <DraggableList
            items={Array.from(value).map((v: any) => ({
              data: v,
            }))}
            value={value}
            onChange={(v) => handleChange(key, v)}
            options={option}
          />

          {Array.from(value).length === 0 && (
            <Card>
              <Stack align="center">
                <IconPlaylistX size="2rem" />
                <Stack align="center" spacing={0}>
                  <Title order={5}>{translateDraggableList('noEntries.title')}</Title>
                  <Text>{translateDraggableList('noEntries.text')}</Text>
                </Stack>
              </Stack>
            </Card>
          )}

          <Flex gap="md">
            <Button
              onClick={() => {
                handleChange('items', [...value, option.create()]);
              }}
              leftIcon={<IconPlus size={16} />}
              variant="default"
              fullWidth
            >
              {translateDraggableList('buttonAdd')}
            </Button>
          </Flex>
        </Stack>
      );

    /* eslint-enable no-case-declarations */
    default:
      return null;
  }
};
