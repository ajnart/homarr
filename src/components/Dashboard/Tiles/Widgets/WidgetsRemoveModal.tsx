import React from 'react';
import { Button, Group, Stack, Text } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';

export type WidgetsRemoveModalInnerProps = {
  widgetId: string;
};

export const WidgetsRemoveModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<WidgetsRemoveModalInnerProps>) => {
  const { t } = useTranslation([`modules/${innerProps.widgetId}`, 'common']);
  const { name: configName } = useConfigContext();
  if (!configName) return null;
  const updateConfig = useConfigStore((x) => x.updateConfig);
  const handleDeletion = () => {
    updateConfig(configName, (prev) => ({
      ...prev,
      widgets: prev.widgets.filter((w) => w.id !== innerProps.widgetId),
    }));
    context.closeModal(id);
  };

  return (
    <Stack>
      <Text>{t('descriptor.remove.confirm')}</Text>
      <Group position="right">
        <Button onClick={() => context.closeModal(id)} variant="light">
          {t('common:actions.cancel')}
        </Button>
        <Button onClick={() => handleDeletion()}>{t('common:actions.ok')}</Button>
      </Group>
    </Stack>
  );
};
