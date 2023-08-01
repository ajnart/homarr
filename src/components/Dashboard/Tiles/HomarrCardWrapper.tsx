import { Card, CardProps } from '@mantine/core';
import { ReactNode } from 'react';

import { useCardStyles } from '../../layout/Common/useCardStyles';
import { useEditModeStore } from '../Views/useEditModeStore';

interface HomarrCardWrapperProps extends CardProps {
  children: ReactNode;
  isCategory?: boolean;
}

export const HomarrCardWrapper = ({ ...props }: HomarrCardWrapperProps) => {
  const { isCategory = false, ...restProps } = props;
  const {
    cx,
    classes: { card: cardClass },
  } = useCardStyles(isCategory);
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
