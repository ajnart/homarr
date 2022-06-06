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
        src={config.logo ?? "/imgs/logo.png"}
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
          {/* Added the .replace to remove emojis because they get screwed up by the gradient */}
          {config.title.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '') ?? "Homarr"}
        </Text>
      </NextLink>
    </Group>
  );
}
