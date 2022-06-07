import { Group, Image, Text } from '@mantine/core';
import { NextLink } from '@mantine/next';
import * as React from 'react';
import { useConfig } from '../../tools/state';

export function Logo({ style }: any) {
  const { config } = useConfig();

  return (
    <Group spacing="xs">
      <Image
        width={50}
        src={config.settings.logo || '/imgs/logo.png'}
        style={{
          position: 'relative',
        }}
      />
      <NextLink
        href="/"
        style={{
          textDecoration: 'none',
          position: 'relative',
        }}
      >
        <Text
          sx={style}
          weight="bold"
          variant="gradient"
          gradient={{ from: 'red', to: 'orange', deg: 145 }}
        >
          {config.settings.title || 'Homarr'}
        </Text>
      </NextLink>
    </Group>
  );
}
