import Widgets from '../../../../widgets';
import { Button, Group, MultiSelect, Stack, Switch, TextInput } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';
import { IWidget } from '../../../../widgets/widgets';

export type WidgetEditModalInnerProps = {
  integration: string;
  options: IWidget<string, any>['properties'];
};

type IntegrationOptionsValueType = IWidget<string, any>['properties'][string];

export const WidgetsEditModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<WidgetEditModalInnerProps>) => {
  const { t } = useTranslation([`modules/${innerProps.integration}`, 'common']);
  const [moduleProperties, setModuleProperties] = useState(innerProps.options);
  const items = Object.entries(moduleProperties ?? {}) as [string, IntegrationOptionsValueType][];

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
    const currentWidgetDefinition = Widgets[innerProps.integration as keyof typeof Widgets];
    if (!Widgets) return [];

    const options = currentWidgetDefinition.options as any;
    return options[option]?.data ?? [];
  };

  const handleSave = () => {
    updateConfig(configName, (prev) => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [innerProps.integration]:
          'properties' in (prev.widgets[innerProps.integration] ?? {})
            ? {
                ...prev.widgets[innerProps.integration],
                properties: moduleProperties,
              }
            : prev.widgets[innerProps.integration],
      },
    }));
    context.closeModal(id);
  };

  return (
    <Stack>
      {items.map(([key, value]) => (
        <>
          {typeof value === 'boolean' ? (
            <Switch
              label={t(`descriptor.settings.${key}.label`)}
              checked={value}
              onChange={(ev) => handleChange(key, ev.currentTarget.checked)}
            />
          ) : null}
          {typeof value === 'string' ? (
            <TextInput
              label={t(`descriptor.settings.${key}.label`)}
              value={value}
              onChange={(ev) => handleChange(key, ev.currentTarget.value)}
            />
          ) : null}
          {typeof value === 'object' && Array.isArray(value) ? (
            <MultiSelect
              data={getMutliselectData(key)}
              label={t(`descriptor.settings.${key}.label`)}
              value={value}
              onChange={(v) => handleChange(key, v)}
            />
          ) : null}
        </>
      ))}

      <Group position="right">
        <Button onClick={() => context.closeModal(id)} variant="light">
          {t('common:actions.cancel')}
        </Button>
        <Button onClick={handleSave}>{t('common:actions.save')}</Button>
      </Group>
    </Stack>
  );
};
