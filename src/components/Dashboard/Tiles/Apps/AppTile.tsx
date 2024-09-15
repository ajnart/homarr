import { Box, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { createStyles, useMantineTheme } from '@mantine/styles';
import { motion } from 'framer-motion';
import { useExternalUrl } from '~/hooks/useExternalUrl';
import { AppType } from '~/types/app';

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
  const { colorScheme } = useMantineTheme();
  const tooltipContent = [
    app.appearance.appNameStatus === 'hover' ? app.name : undefined,
    app.behaviour.tooltipDescription,
  ]
    .filter((e) => e)
    .join(': ');

  const isRow = app.appearance.positionAppName.includes('row');
  const href = useExternalUrl(app);

  function Inner() {
    return (
      <Tooltip.Floating
        label={tooltipContent}
        position="right-start"
        c={colorScheme === 'light' ? 'black' : 'dark.0'}
        color={colorScheme === 'light' ? 'gray.2' : 'dark.4'}
        multiline
        disabled={!tooltipContent}
        styles={{ tooltip: { maxWidth: 300 } }}
      >
        <Box
          className={`${classes.base} ${cx(classes.appContent, 'dashboard-tile-app')}`}
          h="100%"
          sx={{
            flexFlow: app.appearance.positionAppName ?? 'column',
          }}
        >
          {app.appearance.appNameStatus === 'normal' && (
            <Text
              className={cx(classes.appName, 'dashboard-tile-app-title')}
              fw={700}
              size={app.appearance.appNameFontSize}
              ta="center"
              sx={{
                flex: isRow ? '1' : undefined,
              }}
              lineClamp={app.appearance.lineClampAppName}
            >
              {app.name}
            </Text>
          )}
          <motion.img
            className={cx(classes.appImage, 'dashboard-tile-app-image')}
            src={app.appearance.iconUrl}
            alt={app.name}
            whileHover={{ scale: 0.9 }}
            initial={{ scale: 0.8 }}
            style={{
              width: isRow ? 0 : undefined,
            }}
          />
        </Box>
      </Tooltip.Floating>
    );
  }

  return (
    <HomarrCardWrapper className={className} p={10}>
      <AppMenu app={app} />
      {!app.url || isEditMode ? (
        <UnstyledButton
          className={`${classes.button} ${classes.base}`}
          style={{ pointerEvents: isEditMode ? 'none' : 'auto' }}
        >
          <Inner />
        </UnstyledButton>
      ) : (
        <UnstyledButton
          style={{ pointerEvents: isEditMode ? 'none' : 'auto' }}
          component="a"
          rel="noreferrer"
          href={href}
          target={app.behaviour.isOpeningNewTab ? '_blank' : '_self'}
          className={`${classes.button} ${classes.base}`}
        >
          <Inner />
        </UnstyledButton>
      )}
      <AppPing app={app} />
    </HomarrCardWrapper>
  );
};

const useStyles = createStyles((theme, _params, getRef) => ({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContent: {
    gap: 0,
    overflow: 'visible',
    flexGrow: 5,
  },
  appImage: {
    maxHeight: '100%',
    maxWidth: '100%',
    overflow: 'auto',
    flex: 1,
    objectFit: 'contain',
  },
  appName: {
    wordBreak: 'break-word',
  },
  button: {
    height: '100%',
    width: '100%',
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
