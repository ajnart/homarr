import {
  Alert,
  Button,
  Group,
  MultiSelect,
  NumberInput,
  Select,
  Slider,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { IconAlertTriangle } from '@tabler/icons';
import { Trans, useTranslation } from 'next-i18next';
import { FC, useState } from 'react';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';
import { useColorTheme } from '../../../../tools/color';
import Widgets from '../../../../widgets';
import type { IDraggableListInputValue, IWidgetOptionValue } from '../../../../widgets/widgets';
import { IWidget } from '../../../../widgets/widgets';
import { DraggableList } from './DraggableList';

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
      {items.map(([key, _], index) => {
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
            widgetId={innerProps.widgetId}
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
  const { primaryColor } = useColorTheme();

  switch (option.type) {
    case 'switch':
      return (
        <Switch
          label={t(`descriptor.settings.${key}.label`)}
          checked={value as boolean}
          onChange={(ev) => handleChange(key, ev.currentTarget.checked)}
        />
      );
    case 'text':
      return (
        <TextInput
          color={primaryColor}
          label={t(`descriptor.settings.${key}.label`)}
          value={value as string}
          onChange={(ev) => handleChange(key, ev.currentTarget.value)}
        />
      );
    case 'multi-select':
      return (
        <MultiSelect
          color={primaryColor}
          data={option.data}
          label={t(`descriptor.settings.${key}.label`)}
          value={value as string[]}
          defaultValue={option.defaultValue}
          onChange={(v) => handleChange(key, v)}
        />
      );
    case 'select':
      return (
        <Select
          color={primaryColor}
          defaultValue={option.defaultValue}
          data={option.data}
          label={t(`descriptor.settings.${key}.label`)}
          value={value as string}
          onChange={(v) => handleChange(key, v ?? option.defaultValue)}
        />
      );
    case 'number':
      return (
        <NumberInput
          color={primaryColor}
          label={t(`descriptor.settings.${key}.label`)}
          value={value as number}
          onChange={(v) => handleChange(key, v!)}
        />
      );
    case 'slider':
      return (
        <Stack spacing="xs">
          <Slider
            color={primaryColor}
            label={value}
            value={value as number}
            min={option.min}
            max={option.max}
            step={option.step}
            onChange={(v) => handleChange(key, v)}
          />
        </Stack>
      );
    case 'draggable-list':
      // eslint-disable-next-line no-case-declarations
      const typedVal = value as IDraggableListInputValue['defaultValue'];

      return (
        <Stack spacing="xs">
          <Text>{t(`descriptor.settings.${key}.label`)}</Text>
          <DraggableList
            value={typedVal}
            onChange={(v) => handleChange(key, v)}
            labels={Object.fromEntries(
              Object.entries(option.items).map(([graphName]) => [
                graphName,
                t(`descriptor.settings.${graphName}.label`),
              ])
            )}
          >
            {Object.fromEntries(
              Object.entries(option.items).map(([graphName, graph]) => [
                graphName,
                Object.entries(graph).map(([subKey, setting], i) => (
                  <WidgetOptionTypeSwitch
                    key={`${graphName}.${subKey}.${i}`}
                    option={setting as IWidgetOptionValue}
                    widgetId={widgetId}
                    propName={`${graphName}.${subKey}`}
                    value={typedVal.find((v) => v.key === graphName)?.subValues?.[subKey]}
                    handleChange={(_, newVal) =>
                      handleChange(
                        key,
                        typedVal.map((oldVal) =>
                          oldVal.key === graphName
                            ? {
                                ...oldVal,
                                subValues: {
                                  ...oldVal.subValues,
                                  [subKey]: newVal,
                                },
                              }
                            : oldVal
                        )
                      )
                    }
                  />
                )),
              ])
            )}
          </DraggableList>
        </Stack>
      );
    default:
      return null;
  }
};
