import { Group, Image, Text } from '@mantine/core';
import * as React from 'react';

export function Logo({ style }: any) {
  return (
    <Group spacing="xs">
      <Image
        width={50}
        src="/imgs/logo.png"
        style={{
          position: 'relative',
        }}
      />
      <Text
        sx={style}
        weight="bold"
        variant="gradient"
        gradient={{ from: 'red', to: 'orange', deg: 145 }}
      >
        Homarr
      </Text>
    </Group>
  );
}
