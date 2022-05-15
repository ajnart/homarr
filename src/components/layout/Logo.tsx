import { Group, Image, Text } from '@mantine/core';
import * as React from 'react';
import { CURRENT_VERSION } from '../../../data/constants';

export function Logo({ style }: any) {
  return (
    <Group>
      <Image
        width={50}
        src="/imgs/logo.png"
        style={{
          position: 'relative',
          left: 15,
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
      <Text
        style={{
          position: 'relative',
          left: -14,
          bottom: -2,
          color: 'gray',
          fontStyle: 'inherit',
          fontSize: 'inherit',
          alignSelf: 'center',
          alignContent: 'center',
        }}
      >
        {CURRENT_VERSION}
      </Text>
    </Group>
  );
}
