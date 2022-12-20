import { Card, CardProps } from '@mantine/core';
import { ReactNode } from 'react';
import { useCardStyles } from '../../layout/useCardStyles';
import { useEditModeStore } from '../Views/useEditModeStore';

interface HomarrCardWrapperProps extends CardProps {
  children: ReactNode;
}

export const HomarrCardWrapper = ({ ...props }: HomarrCardWrapperProps) => {
  const {
    cx,
    classes: { card: cardClass },
  } = useCardStyles();
  const isEditMode = useEditModeStore((x) => x.enabled);
  return (
    <Card
      {...props}
      className={cx(props.className, cardClass)}
      withBorder
      style={{ cursor: isEditMode ? 'move' : 'default' }}
      radius="lg"
      shadow="md"
    />
  );
};
