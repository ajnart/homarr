import React from 'react';
import { Button, Group, Stack, Text } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useTranslation } from 'next-i18next';
import { IntegrationsType } from '../../../../types/integration';
import { integrationModuleTranslationsMap } from './WidgetsEditModal';

export type WidgetsRemoveModalInnerProps = {
  integration: keyof IntegrationsType;
};

export const WidgetsRemoveModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<WidgetsRemoveModalInnerProps>) => {
  const translationKey = integrationModuleTranslationsMap.get(innerProps.integration);
  const { t } = useTranslation([translationKey ?? '', 'common']);
  const handleDeletion = () => {
    // TODO: remove tile
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
