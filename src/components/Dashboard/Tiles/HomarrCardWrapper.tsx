import { Card, CardProps } from '@mantine/core';
import { ReactNode } from 'react';
import { useCardStyles } from '../../layout/useCardStyles';

interface HomarrCardWrapperProps extends CardProps {
  children: ReactNode;
}

export const HomarrCardWrapper = ({ ...props }: HomarrCardWrapperProps) => {
  const {
    cx,
    classes: { card: cardClass },
  } = useCardStyles();
  return <Card {...props} className={cx(props.className, cardClass)} />;
};
