import { Group, Image, Text, useMantineTheme } from '@mantine/core';
import { useOptionalBoard } from '~/components/Board/context';
import { useScreenLargerThan } from '~/hooks/useScreenLargerThan';

import { usePrimaryGradient } from './useGradient';

interface LogoProps {
  size?: 'md' | 'xs';
  withoutText?: boolean;
}

export function Logo({ size = 'md', withoutText = false }: LogoProps) {
  const theme = useMantineTheme();
  const board = useOptionalBoard();
  const primaryGradient = usePrimaryGradient();
  const largerThanMd = useScreenLargerThan('md');

  return (
    <Group spacing={size === 'md' ? 'xs' : 4} noWrap>
      <Image
        src={board?.logoImageUrl || '/imgs/logo/logo-color.svg'}
        width="unset"
        height={size === 'md' ? 38 : 12}
        styles={{
          image: {
            objectFit: 'contain !important' as 'contain',
          },
        }}
        alt="Homarr Logo"
        className="dashboard-header-logo-image"
      />
      {withoutText || !largerThanMd ? null : (
        <Text
          size={size === 'md' ? 22 : 10}
          gradient={primaryGradient}
          variant="gradient"
          weight="bold"
          className="dashboard-header-logo-text"
        >
          {board?.pageTitle || 'Homarr'}
        </Text>
      )}
    </Group>
  );
}
