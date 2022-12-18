import React from 'react';
import { Button, Group, Stack, Text } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useTranslation } from 'next-i18next';

export type WidgetsRemoveModalInnerProps = {
  integration: string;
};

export const WidgetsRemoveModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<WidgetsRemoveModalInnerProps>) => {
  const { t } = useTranslation([`modules/${innerProps.integration}`, 'common']);
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
