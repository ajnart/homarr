import { Center, Text, UnstyledButton } from '@mantine/core';
import { NextLink } from '@mantine/next';
import { createStyles } from '@mantine/styles';
import { AppType } from '../../../../types/app';
import { useCardStyles } from '../../../layout/useCardStyles';
import { useEditModeStore } from '../../Views/useEditModeStore';
import { HomarrCardWrapper } from '../HomarrCardWrapper';
import { BaseTileProps } from '../type';
import { AppMenu } from './AppMenu';
import { AppPing } from './AppPing';

interface AppTileProps extends BaseTileProps {
  app: AppType;
}

export const AppTile = ({ className, app }: AppTileProps) => {
  const isEditMode = useEditModeStore((x) => x.enabled);

  const { cx, classes } = useStyles();

  const {
    classes: { card: cardClass },
  } = useCardStyles();

  const inner = (
    <>
      <Text align="center" weight={500} size="md" className={classes.appName}>
        {app.name}
      </Text>
      <Center style={{ height: '75%', flex: 1 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={classes.image} src={app.appearance.iconUrl} alt="" />
      </Center>
    </>
  );

  return (
    <HomarrCardWrapper className={className}>
      <AppMenu app={app} />

      {!app.url || isEditMode ? (
        <UnstyledButton
          className={classes.button}
          style={{ pointerEvents: isEditMode ? 'none' : 'auto' }}
        >
          {inner}
        </UnstyledButton>
      ) : (
        <UnstyledButton
          style={{ pointerEvents: isEditMode ? 'none' : 'auto' }}
          component={NextLink}
          href={app.url}
          target={app.behaviour.isOpeningNewTab ? '_blank' : '_self'}
          className={cx(classes.button, classes.link)}
        >
          {inner}
        </UnstyledButton>
      )}
      <AppPing app={app} />
    </HomarrCardWrapper>
  );
};

const useStyles = createStyles((theme, _params, getRef) => ({
  image: {
    ref: getRef('image'),
    maxHeight: '80%',
    maxWidth: '80%',
    transition: 'transform 100ms ease-in-out',
  },
  appName: {
    ref: getRef('appName'),
  },
  button: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  link: {
    [`&:hover .${getRef('image')}`]: {
      // TODO: add styles for image when hovering card
    },
    [`&:hover .${getRef('appName')}`]: {
      // TODO: add styles for app name when hovering card
    },
  },
}));

export const appTileDefinition = {
  component: AppTile,
  minWidth: 2,
  maxWidth: 12,
  minHeight: 2,
  maxHeight: 12,
};
