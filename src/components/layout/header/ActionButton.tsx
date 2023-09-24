import { Button, ButtonProps } from '@mantine/core';
import Link from 'next/link';
import { ForwardedRef, forwardRef } from 'react';

import { useCardStyles } from '../Common/useCardStyles';

type SpecificLinkProps = {
  component: typeof Link;
  href: string;
};
type SpecificButtonProps = {
  onClick: HTMLButtonElement['onclick'];
};
type HeaderActionButtonProps = Omit<ButtonProps, 'variant' | 'className' | 'h' | 'w' | 'px'> &
  (SpecificLinkProps | SpecificButtonProps);

export const HeaderActionButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  HeaderActionButtonProps
>(({ children, ...props }, ref) => {
  const { classes } = useCardStyles(true);

  const buttonProps: ButtonProps = {
    variant: 'default',
    className: classes.card,
    h: 38,
    w: 38,
    px: 0,
    ...props,
  };

  if ('component' in props) {
    return (
      <Button
        ref={ref as ForwardedRef<HTMLAnchorElement>}
        component={props.component}
        href={props.href}
        {...buttonProps}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button ref={ref as ForwardedRef<HTMLButtonElement>} {...buttonProps}>
      {children}
    </Button>
  );
});
