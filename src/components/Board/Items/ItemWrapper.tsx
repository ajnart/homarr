import { Card, CardProps } from '@mantine/core';
import { ReactNode } from 'react';

import { useCardStyles } from '../../layout/Common/useCardStyles';
import { useEditModeStore } from '../useEditModeStore';

interface ItemWrapperProps extends CardProps {
  children: ReactNode;
}

export const ItemWrapper = ({ ...restProps }: ItemWrapperProps) => {
  const {
    cx,
    classes: { card: cardClass },
  } = useCardStyles(false);
  const isEditMode = useEditModeStore((x) => x.enabled);
  return (
    <Card
      {...restProps}
      className={cx(restProps.className, cardClass, 'dashboard-gs-generic-item')}
      withBorder
      style={{ cursor: isEditMode ? 'move' : 'default' }}
      radius="lg"
      shadow="sm"
    />
  );
};
