import { Box, Flex, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { createStyles, useMantineTheme } from '@mantine/styles';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { AppType } from '../../../../types/app';
import { useCardStyles } from '../../../layout/Common/useCardStyles';
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
    app.appearance.appNameStatus === "hover" ? app.name : undefined,
    app.behaviour.tooltipDescription
  ].filter( e => e ).join( ': ' );

  const {
    classes: { card: cardClass },
  } = useCardStyles(false);

  function Inner() {
    return (
      <Tooltip.Floating
        label={tooltipContent}
        position="right-start"
        c={ colorScheme === 'light' ? "black" : "dark.0" }
        color={ colorScheme === 'light' ? "gray.2" : "dark.4" }
        multiline
        disabled={tooltipContent === ''}
        styles={{ tooltip: { '&': { maxWidth: 300, }, }, }}
      >
        <Flex
          m={0}
          p={0}
          justify="space-around"
          align="center"
          h="100%"
          w="100%"
          className="dashboard-tile-app"
          direction={app.appearance.positionAppName ?? 'column'}
        >
          <Box w="100%" hidden={["hover", "hidden"].includes(app.appearance.appNameStatus)}>
            <Text
              w="100%"
              size="md"
              ta="center"
              weight={700}
              className={cx(classes.appName, 'dashboard-tile-app-title')}
              lineClamp={2}
            >
              {app.name}
            </Text>
          </Box>
          <Box
            w="100%"
            h="100%"
            display="flex"
            sx={{
              alignContent: 'center',
              justifyContent: 'center',
              flex: '1 1 auto',
              flexWrap: 'wrap',
            }}
          >
            <motion.img
              className={classes.image}
              height="85%"
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
          </Box>
        </Flex>
      </Tooltip.Floating>
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
          component={Link}
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
    maxHeight: '90%',
    maxWidth: '90%',
  },
  appName: {
    wordBreak: 'break-word',
  },
  button: {
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
