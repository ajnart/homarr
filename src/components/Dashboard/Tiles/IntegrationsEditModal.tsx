import { Button, Group, MultiSelect, Stack, Switch, TextInput } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useConfigContext } from '../../../config/provider';
import { useConfigStore } from '../../../config/store';
import { DashDotGraphType, IntegrationsType } from '../../../types/integration';

export type IntegrationEditModalInnerProps<
  TIntegrationKey extends keyof IntegrationsType = keyof IntegrationsType
> = {
  integration: TIntegrationKey;
  options: IntegrationOptions<TIntegrationKey> | undefined;
  labels: IntegrationOptionLabels<IntegrationOptions<TIntegrationKey>>;
};

export const IntegrationsEditModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<IntegrationEditModalInnerProps>) => {
  const translationKey = integrationModuleTranslationsMap.get(innerProps.integration);
  const { t } = useTranslation([translationKey ?? '', 'common']);
  const [moduleProperties, setModuleProperties] = useState(innerProps.options);
  const items = Object.entries(moduleProperties ?? {}) as [
    keyof typeof innerProps.options,
    IntegrationOptionsValueType
  ][];

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
    updateConfig(configName, (prev) => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [innerProps.integration]:
          'properties' in (prev.integrations[innerProps.integration] ?? {})
            ? {
                ...prev.integrations[innerProps.integration],
                properties: moduleProperties,
              }
            : prev.integrations[innerProps.integration],
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
              label={t(innerProps.labels[key as keyof typeof innerProps.labels])}
              checked={value}
              onChange={(ev) => handleChange(key, ev.currentTarget.checked)}
            />
          ) : null}
          {typeof value === 'string' ? (
            <TextInput
              label={t(innerProps.labels[key])}
              value={value}
              onChange={(ev) => handleChange(key, ev.currentTarget.value)}
            />
          ) : null}
          {typeof value === 'object' && Array.isArray(value) ? (
            <MultiSelect
              data={['cpu', 'gpu', 'ram', 'storage', 'network']}
              value={value}
              onChange={(v) => handleChange(key, v as DashDotGraphType[])}
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

type PropertiesOf<
  TKey extends keyof IntegrationsType,
  T extends IntegrationsType[TKey]
> = T extends { properties: unknown } ? T['properties'] : {};

export type IntegrationOptions<TKey extends keyof IntegrationsType> = PropertiesOf<
  TKey,
  IntegrationsType[TKey]
>;

export type IntegrationOptionLabels<TIntegrationOptions> = {
  [key in keyof TIntegrationOptions]: string;
};

type IntegrationOptionsValueType = boolean | string | DashDotGraphType[];

export const integrationModuleTranslationsMap = new Map<keyof IntegrationsType, string>([
  ['calendar', 'modules/calendar'],
  ['clock', 'modules/date'],
  ['weather', 'modules/weather'],
  ['dashDot', 'modules/dashdot'],
  ['bitTorrent', 'modules/torrents-status'],
  ['useNet', 'modules/usenet'],
  ['torrentNetworkTraffic', 'modules/dlspeed'],
]);
