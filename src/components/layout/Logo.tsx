import { Group, Image, Text } from '@mantine/core';
import { NextLink } from '@mantine/next';
import * as React from 'react';
import { useColorTheme } from '../../tools/color';
import { useConfig } from '../../tools/state';

export function Logo({ style, withoutText }: any) {
  const { config } = useConfig();
  const { primaryColor, secondaryColor } = useColorTheme();

  return (
    <Group spacing="xs" noWrap>
      <Image
        width={50}
        src={config.settings.logo || '/imgs/logo/logo.png'}
        style={{
          position: 'relative',
        }}
      />
      {withoutText ? null : (
        <Text
          sx={style}
          weight="bold"
          variant="gradient"
          gradient={{
            from: primaryColor,
            to: secondaryColor,
            deg: 145,
          }}
        >
          {config.settings.title || 'Homarr'}
        </Text>
      )}
    </Group>
  );
}
