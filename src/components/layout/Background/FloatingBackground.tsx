import { Box, rgba } from '@mantine/core';
import { useColorScheme, useMouse } from '@mantine/hooks';
import { tss } from '~/utils/tss';

import { PolkaElement } from './PolkaElement';

export const FloatingBackground = () => {
  const { classes } = useStyles();
  return (
    <Box className={classes.noOverflow} pos="absolute" w="100%" h="100%" top={0} left={0}>
      <MouseBackdrop />
      <Box pos="relative" h="100%">
        <PolkaElement rotation={95} top={0} left={100} />
        <PolkaElement rotation={10} top={50} right={20} />
        <PolkaElement rotation={-4} bottom={20} left={20} />
        <PolkaElement rotation={-10} bottom={0} right={0} />
      </Box>
    </Box>
  );
};

const MouseBackdrop = () => {
  const { x, y } = useMouse();
  const colorScheme = useColorScheme();
  const radius = 40;
  return (
    <Box pos="absolute" top={0} left={0} w="100%" h="100%">
      <Box
        style={(theme) => {
          const dropColor =
            colorScheme === 'dark'
              ? rgba(theme.colors.red[8], 0.05)
              : rgba(theme.colors.red[2], 0.4);
          const boxShadow = `0px 0px ${radius}px ${radius}px ${dropColor}`;
          return {
            width: 50,
            height: 50,
            borderRadius: '5rem',
            boxShadow: boxShadow,
            backgroundColor: dropColor,
          };
        }}
        top={y - 25}
        left={x - 25}
        pos="absolute"
      ></Box>
    </Box>
  );
};

const useStyles = tss.create(() => ({
  noOverflow: {
    overflow: 'hidden',
  },
}));
