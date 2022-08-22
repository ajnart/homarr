import { Group, ActionIcon, Anchor, Text } from '@mantine/core';
import { IconBrandDiscord, IconBrandGithub } from '@tabler/icons';
import { useTranslation } from 'next-i18next';

import { CURRENT_VERSION } from '../../../data/constants';

export default function Credits(props: any) {
  const { t } = useTranslation('settings/common');

  return (
    <Group position="center" mt="xs">
      <Group spacing={0}>
        <ActionIcon<'a'> component="a" href="https://github.com/ajnart/homarr" size="lg">
          <IconBrandGithub size={18} />
        </ActionIcon>
        <Text
          style={{
            position: 'relative',
            fontSize: '0.90rem',
            color: 'gray',
          }}
        >
          {CURRENT_VERSION}
        </Text>
      </Group>
      <Group spacing={1}>
        <Text
          style={{
            fontSize: '0.90rem',
            textAlign: 'center',
            color: 'gray',
          }}
        >
          {t('credits.madeWithLove')}
          <Anchor
            href="https://github.com/ajnart"
            style={{ color: 'inherit', fontStyle: 'inherit', fontSize: 'inherit' }}
          >
            ajnart
          </Anchor>
        </Text>
        <ActionIcon<'a'> component="a" href="https://discord.gg/aCsmEV5RgA" size="lg">
          <IconBrandDiscord size={18} />
        </ActionIcon>
      </Group>
    </Group>
  );
}
