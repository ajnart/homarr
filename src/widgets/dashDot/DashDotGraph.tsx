import { Title, createStyles, getStylesRef, useMantineTheme } from '@mantine/core';
import { useTranslation } from 'next-i18next';

import { DashDotCompactNetwork, DashDotInfo } from './DashDotCompactNetwork';
import { DashDotCompactStorage } from './DashDotCompactStorage';

interface DashDotGraphProps {
  graph: string;
  graphHeight: number;
  isCompact: boolean;
  multiView: boolean;
  dashDotUrl: string;
  usePercentages: boolean;
  info: DashDotInfo;
}

export const DashDotGraph = ({
  graph,
  graphHeight,
  isCompact,
  multiView,
  dashDotUrl,
  usePercentages,
  info,
}: DashDotGraphProps) => {
  const { t } = useTranslation('modules/dashdot');
  const { classes } = useStyles();

  if (graph === 'storage' && isCompact) {
    return <DashDotCompactStorage info={info} url={dashDotUrl} />;
  }

  if (graph === 'network' && isCompact) {
    return <DashDotCompactNetwork info={info} />;
  }

  const title = t(`card.graphs.${graph}.title`);

  return (
    <div className={classes.graphContainer}>
      <Title className={classes.graphTitle} order={4}>
        {title}
      </Title>
      <iframe
        className={classes.iframe}
        key={graph}
        title={title}
        src={useIframeSrc(dashDotUrl, graph, multiView, usePercentages)}
        style={{
          height: `${graphHeight}px`,
        }}
      />
    </div>
  );
};

const useIframeSrc = (
  dashDotUrl: string,
  graph: string,
  multiView: boolean,
  usePercentages: boolean
) => {
  const { colorScheme, colors, radius } = useMantineTheme();
  const surface = (colorScheme === 'dark' ? colors.dark[7] : colors.gray[0]).substring(1); // removes # from hex value

  return (
    `${dashDotUrl}` +
    '?singleGraphMode=true' + // obsolete in newer versions
    `&graph=${graph}` +
    `&theme=${colorScheme}` +
    `&surface=${surface}` +
    '&gap=5' +
    `&innerRadius=${radius.lg}` +
    `&multiView=${multiView}` +
    `&showPercentage=${usePercentages.toString()}` +
    '&textOffset=16' +
    '&textSize=12'
  );
};

export const useStyles = createStyles((theme, _params) => ({
  iframe: {
    flex: '1 0 auto',
    maxWidth: '100%',
    width: '100%',
    borderRadius: theme.radius.lg,
    border: 'none',
    colorScheme: 'light', // fixes white borders around iframe
  },
  graphTitle: {
    ref: getStylesRef('graphTitle'),
    position: 'absolute',
    right: 0,
    bottom: 0,
    opacity: 0,
    transition: 'opacity .1s ease-in-out',
    pointerEvents: 'none',
    marginBottom: 12,
    marginRight: 12,
  },
  graphContainer: {
    position: 'relative',
    [`&:hover .${getStylesRef('graphTitle')}`]: {
      opacity: 0.5,
    },
  },
}));
