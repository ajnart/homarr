import { Box, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { createStyles, useMantineTheme } from '@mantine/styles';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AppItem } from '~/components/Board/context';

import { useEditModeStore } from '../../useEditModeStore';
import { ItemWrapper } from '../ItemWrapper';
import { AppMenu } from './AppMenu';
import { AppPing } from './AppPing';

interface AppTileProps {
  app: AppItem;
  className?: string;
}

const namePositions = {
  right: 'row',
  left: 'row-reverse',
  top: 'column',
  bottom: 'column-reverse',
};

export const BoardAppItem = ({ className, app }: AppTileProps) => {
  const isEditMode = useEditModeStore((x) => x.enabled);
  const { cx, classes } = useStyles();
  const { colorScheme } = useMantineTheme();
  const tooltipContent = [app.nameStyle === 'hover' ? app.name : undefined, app.description]
    .filter((e) => e)
    .join(': ');

  const isRow = app.namePosition === 'right' || app.namePosition === 'left';

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
            flexFlow: namePositions[app.namePosition] ?? 'column',
          }}
        >
          {app.nameStyle === 'show' && (
            <Text
              className={cx(classes.appName, 'dashboard-tile-app-title')}
              fw={700}
              size={app.fontSize}
              ta="center"
              sx={{
                flex: isRow ? '1' : undefined,
              }}
              lineClamp={app.nameLineClamp}
            >
              {app.name}
            </Text>
          )}
          <motion.img
            className={cx(classes.appImage, 'dashboard-tile-app-image')}
            src={app.iconUrl!}
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

  const url = app.externalUrl ? app.externalUrl : app.internalUrl;

  return (
    <ItemWrapper className={className} p={10}>
      <AppMenu app={app} />
      {!url || isEditMode ? (
        <UnstyledButton
          className={`${classes.button} ${classes.base}`}
          style={{ pointerEvents: isEditMode ? 'none' : 'auto' }}
        >
          <Inner />
        </UnstyledButton>
      ) : (
        <UnstyledButton
          style={{ pointerEvents: isEditMode ? 'none' : 'auto' }}
          component={Link}
          href={url}
          target={app.openInNewTab ? '_blank' : '_self'}
          className={`${classes.button} ${classes.base}`}
        >
          <Inner />
        </UnstyledButton>
      )}
      <AppPing app={app} />
    </ItemWrapper>
  );
};

const useStyles = createStyles(() => ({
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
