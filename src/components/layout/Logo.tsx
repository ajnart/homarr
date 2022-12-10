import { Group, Image, Text } from '@mantine/core';
import { useConfigContext } from '../../config/provider';
import { usePrimaryGradient } from './useGradient';

interface LogoProps {
  size?: 'md' | 'xs';
  withoutText?: boolean;
}

export function Logo({ size = 'md', withoutText = false }: LogoProps) {
  const { config } = useConfigContext();
  const primaryGradient = usePrimaryGradient();

  return (
    <Group spacing={size === 'md' ? 'xs' : 4} noWrap>
      <Image
        width={size === 'md' ? 50 : 12}
        src={config?.settings.customization.logoImageUrl || '/imgs/logo/logo.png'}
        style={{
          position: 'relative',
        }}
      />
      {withoutText ? null : (
        <Text
          size={size === 'md' ? 22 : 10}
          weight="bold"
          variant="gradient"
          gradient={primaryGradient}
        >
          {config?.settings.customization.pageTitle || 'Homarr'}
        </Text>
      )}
    </Group>
  );
}
