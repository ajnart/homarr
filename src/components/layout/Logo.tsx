import { Group, Image, Text } from '@mantine/core';
import { useConfigContext } from '../../config/provider';
import { useColorTheme } from '../../tools/color';

interface LogoProps {
  size?: 'md' | 'xs';
  withoutText?: boolean;
}

export function Logo({ size = 'md', withoutText = false }: LogoProps) {
  const { config } = useConfigContext();
  const { primaryColor, secondaryColor } = useColorTheme();

  return (
    <Group spacing={size === 'md' ? 'xs' : 4} noWrap>
      <Image
        width={size === 'md' ? 50 : 20}
        src={config?.settings.customization.logoImageUrl || '/imgs/logo/logo.png'}
        style={{
          position: 'relative',
        }}
      />
      {withoutText ? null : (
        <Text
          size={size === 'md' ? 22 : 'xs'}
          weight="bold"
          variant="gradient"
          gradient={{
            from: primaryColor,
            to: secondaryColor,
            deg: 145,
          }}
        >
          {config?.settings.customization.pageTitle || 'Homarr'}
        </Text>
      )}
    </Group>
  );
}
