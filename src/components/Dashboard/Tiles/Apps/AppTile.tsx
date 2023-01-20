import { Box, Stack, Title, UnstyledButton } from '@mantine/core';
import { NextLink } from '@mantine/next';
import { createStyles } from '@mantine/styles';
import { motion } from 'framer-motion';
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
  } = useCardStyles(false);

  function Inner() {
    return (
      <>
        <Stack
          m={0}
          p={0}
          spacing="xs"
          justify="space-around"
          align="center"
          style={{ height: '100%', width: '100%' }}
        >
          <Box hidden={false}>
            <Title order={5} size="md" ta="center" lineClamp={1} className={classes.appName}>
              {app.name}
            </Title>
          </Box>
          <motion.img
            className={classes.image}
            height="85%"
            width="85%"
            style={{
              objectFit: 'contain',
            }}
            src={app.appearance.iconUrl}
            alt={app.name}
            whileHover={{
              scale: 1.2,
              transition: { duration: 0.2 },
            }}
          />
        </Stack>
      </>
    );
  }

  return (
    <HomarrCardWrapper className={className}>
      <AppMenu app={app} />
      {!app.url || isEditMode ? (
        <UnstyledButton
          className={classes.button}
          style={{ pointerEvents: isEditMode ? 'none' : 'auto' }}
        >
          <Inner />
        </UnstyledButton>
      ) : (
        <UnstyledButton
          style={{ pointerEvents: isEditMode ? 'none' : 'auto' }}
          component={NextLink}
          href={app.behaviour.externalUrl.length > 0 ? app.behaviour.externalUrl : app.url}
          target={app.behaviour.isOpeningNewTab ? '_blank' : '_self'}
          className={cx(classes.button)}
        >
          <Inner />
        </UnstyledButton>
      )}
      <AppPing app={app} />
    </HomarrCardWrapper>
  );
};

const useStyles = createStyles((theme, _params, getRef) => ({
  image: {
    ref: getRef('image'),
    maxHeight: '90%',
    maxWidth: '90%',
  },
  appName: {
    ref: getRef('appName'),
  },
  button: {
    paddingBottom: 10,
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
}));

export const appTileDefinition = {
  component: AppTile,
  minWidth: 1,
  minHeight: 1,
  maxWidth: 12,
  maxHeight: 12,
};
