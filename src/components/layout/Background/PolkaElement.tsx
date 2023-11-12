import { Box } from '@mantine/core';

export const PolkaElement = ({
  rotation,
  left,
  top,
  right,
  bottom,
}: {
  rotation: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}) => {
  return (
    <Box
      style={{
        transform: `rotate(${rotation}deg)`,
        pointerEvents: 'none',
      }}
      className="polka"
      pos="absolute"
      w="20%"
      h="40%"
      top={top}
      right={right}
      left={left}
      bottom={bottom}
    />
  );
};
