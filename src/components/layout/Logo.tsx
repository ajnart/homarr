import { Group, Text } from '@mantine/core';
import * as React from 'react';
import { CURRENT_VERSION } from '../../../data/constants';

export function Logo({ style }: any) {
  return (
    <Group>
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
          color: 'gray',
          fontStyle: 'inherit',
          fontSize: 'inherit',
          alignSelf: 'end',
          alignContent: 'start',
        }}
      >
        {CURRENT_VERSION}
      </Text>
    </Group>
  );
}
