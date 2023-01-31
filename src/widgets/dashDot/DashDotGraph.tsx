import { createStyles, Stack, Title, useMantineTheme } from '@mantine/core';
import { DashDotGraph as GraphType } from './types';

interface DashDotGraphProps {
  graph: GraphType;
  isCompact: boolean;
  dashDotUrl: string;
  usePercentages: boolean;
}

export const DashDotGraph = ({
  graph,
  isCompact,
  dashDotUrl,
  usePercentages,
}: DashDotGraphProps) => {
  const { classes } = useStyles();
  return (
    <Stack
      className={classes.graphStack}
      w="100%"
      maw="251px"
      style={{
        width: isCompact ? (graph.twoSpan ? '100%' : 'calc(50% - 10px)') : undefined,
      }}
    >
      <Title className={classes.graphTitle} order={4}>
        {graph.name}
      </Title>
      <iframe
        className={classes.iframe}
        key={graph.name}
        title={graph.name}
        src={useIframeSrc(dashDotUrl, graph, isCompact, usePercentages)}
      />
    </Stack>
  );
};

const useIframeSrc = (
  dashDotUrl: string,
  graph: GraphType,
  isCompact: boolean,
  usePercentages: boolean
) => {
  const { colorScheme, colors, radius } = useMantineTheme();
  const surface = (colorScheme === 'dark' ? colors.dark[7] : colors.gray[0]).substring(1); // removes # from hex value

  const graphId = graph.id === 'memory' ? 'ram' : graph.id;

  return (
    `${dashDotUrl}` +
    '?singleGraphMode=true' +
    `&graph=${graphId}` +
    `&theme=${colorScheme}` +
    `&surface=${surface}` +
    `&gap=${isCompact ? 10 : 5}` +
    `&innerRadius=${radius.lg}` +
    `&multiView=${graph.isMultiView}` +
    `&showPercentage=${usePercentages ? 'true' : 'false'}`
  );
};

export const useStyles = createStyles((theme, _params, getRef) => ({
  iframe: {
    flex: '1 0 auto',
    maxWidth: '100%',
    height: '140px',
    borderRadius: theme.radius.lg,
    border: 'none',
    colorScheme: 'light', // fixes white borders around iframe
  },
  graphTitle: {
    ref: getRef('graphTitle'),
    position: 'absolute',
    right: 0,
    opacity: 0,
    transition: 'opacity .1s ease-in-out',
    pointerEvents: 'none',
    marginTop: 10,
    marginRight: 25,
  },
  graphStack: {
    position: 'relative',
    [`&:hover .${getRef('graphTitle')}`]: {
      opacity: 0.5,
    },
  },
}));
