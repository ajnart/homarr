import { Group, Image, Text } from '@mantine/core';
import { useConfigContext } from '~/config/provider';
import { useScreenLargerThan } from '~/hooks/useScreenLargerThan';

import { usePrimaryGradient } from './useGradient';

interface LogoProps {
  size?: 'md' | 'xs';
  withoutText?: boolean;
}

export function Logo({ size = 'md', withoutText = false }: LogoProps) {
  const { config } = useConfigContext();
  const primaryGradient = usePrimaryGradient();
  const largerThanMd = useScreenLargerThan('md');

  return (
    <Group spacing={size === 'md' ? 'xs' : 4} noWrap>
      <Image
        width={size === 'md' ? 50 : 12}
        src={config?.settings.customization.logoImageUrl || '/imgs/logo/logo-color.svg'}
        alt="Homarr Logo"
        className="dashboard-header-logo-image"
      />
      {withoutText || !largerThanMd ? null : (
        <Text
          size={size === 'md' ? 22 : 10}
          weight="bold"
          variant="gradient"
          className="dashboard-header-logo-text"
          gradient={primaryGradient}
        >
          {config?.settings.customization.pageTitle || 'Homarr'}
        </Text>
      )}
    </Group>
  );
}
