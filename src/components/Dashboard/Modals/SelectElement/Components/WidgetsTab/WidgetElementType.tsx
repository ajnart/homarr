import { Button, Card, Center, Grid, Stack, Text } from '@mantine/core';
import { TablerIcon } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import React, { ReactNode } from 'react';
import { AvailableElementTypes } from '../Overview/AvailableElementsOverview';
import { GenericAvailableElementType } from '../Shared/GenericElementType';

interface WidgetElementTypeProps {
  id: string;
  image: string | TablerIcon;
  disabled?: boolean;
}

export const WidgetElementType = ({ id, image, disabled }: WidgetElementTypeProps) => {
  const { t } = useTranslation(`modules/${id}`);

  return (
    <GenericAvailableElementType
      name={t('descriptor.name')}
      description={t('descriptor.description')}
      image={image}
      disabled={disabled}
    />
  );
};
