import { Group, Anchor, Text } from '@mantine/core';
import { useTranslation } from 'next-i18next';

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
        </Anchor>{' '}
        and you !
      </Text>
    </Group>
  );
}
