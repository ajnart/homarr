import {
  Alert,
  Button,
  Group,
  MultiSelect,
  Stack,
  Switch,
  TextInput,
  Text,
  NumberInput,
  Slider,
} from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { IconAlertTriangle } from '@tabler/icons';
import { Trans, useTranslation } from 'next-i18next';
import { useState } from 'react';
import Widgets from '../../../../widgets';
import type { IWidgetOptionValue } from '../../../../widgets/widgets';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';
import { IWidget } from '../../../../widgets/widgets';
import { useColorTheme } from '../../../../tools/color';

export type WidgetEditModalInnerProps = {
  widgetId: string;
  options: IWidget<string, any>['properties'];
  widgetOptions: IWidget<string, any>['properties'];
};

type IntegrationOptionsValueType = IWidget<string, any>['properties'][string];

export const WidgetsEditModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<WidgetEditModalInnerProps>) => {
  const { t } = useTranslation([`modules/${innerProps.widgetId}`, 'common']);
  const [moduleProperties, setModuleProperties] = useState(innerProps.options);
  // const items = Object.entries(moduleProperties ?? {}) as [string, IntegrationOptionsValueType][];
  const items = Object.entries(innerProps.widgetOptions ?? {}) as [
    string,
    IntegrationOptionsValueType
  ][];

  // Find the Key in the "Widgets" Object that matches the widgetId
  const currentWidgetDefinition = Widgets[innerProps.widgetId as keyof typeof Widgets];
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

  const getMutliselectData = (option: string) => {
    const currentWidgetDefinition = Widgets[innerProps.widgetId as keyof typeof Widgets];
    if (!Widgets) return [];

    const options = currentWidgetDefinition.options as any;
    return options[option]?.data ?? [];
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
      {items.map(([key, defaultValue], index) => {
        const option = (currentWidgetDefinition as any).options[key] as IWidgetOptionValue;
        const value = moduleProperties[key] ?? defaultValue;

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
        return WidgetOptionTypeSwitch(
          option,
          index,
          t,
          key,
          value,
          handleChange,
          getMutliselectData
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
function WidgetOptionTypeSwitch(
  option: IWidgetOptionValue,
  index: number,
  t: any,
  key: string,
  value: string | number | boolean | string[],
  handleChange: (key: string, value: IntegrationOptionsValueType) => void,
  getMutliselectData: (option: string) => any
) {
  const { primaryColor, secondaryColor } = useColorTheme();
  switch (option.type) {
    case 'switch':
      return (
        <Switch
          key={`${option.type}-${index}`}
          label={t(`descriptor.settings.${key}.label`)}
          checked={value as boolean}
          onChange={(ev) => handleChange(key, ev.currentTarget.checked)}
        />
      );
    case 'text':
      return (
        <TextInput
          color={primaryColor}
          key={`${option.type}-${index}`}
          label={t(`descriptor.settings.${key}.label`)}
          value={value as string}
          onChange={(ev) => handleChange(key, ev.currentTarget.value)}
        />
      );
    case 'multi-select':
      return (
        <MultiSelect
          color={primaryColor}
          key={`${option.type}-${index}`}
          data={getMutliselectData(key)}
          label={t(`descriptor.settings.${key}.label`)}
          value={value as string[]}
          onChange={(v) => handleChange(key, v)}
        />
      );
    case 'number':
      return (
        <NumberInput
          color={primaryColor}
          key={`${option.type}-${index}`}
          label={t(`descriptor.settings.${key}.label`)}
          value={value as number}
          onChange={(v) => handleChange(key, v!)}
        />
      );
    case 'slider':
      return (
        <Stack spacing="xs">
          <Text>{t(`descriptor.settings.${key}.label`)}</Text>
          <Slider
            color={primaryColor}
            key={`${option.type}-${index}`}
            value={value as number}
            min={option.min}
            max={option.max}
            step={option.step}
            onChange={(v) => handleChange(key, v)}
          />
        </Stack>
      );
    default:
      return null;
  }
}
