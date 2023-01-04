import { Group, ActionIcon, Anchor, Text } from '@mantine/core';
import { IconBrandDiscord, IconBrandGithub } from '@tabler/icons';
import { useTranslation } from 'next-i18next';

import { CURRENT_VERSION } from '../../../../data/constants';

export default function Credits() {
  const { t } = useTranslation('settings/common');

  return (
    <Group position="center" mt="xs">
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
        {' '}and you !
      </Text>
    </Group>
  );
}
