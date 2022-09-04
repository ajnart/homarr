import { Text } from '@mantine/core';
import { useTranslation } from 'next-i18next';

interface TipProps {
  children: React.ReactNode;
}

export default function Tip(props: TipProps) {
  const { t } = useTranslation('common');

  return (
    <Text
      style={{
        fontSize: '0.75rem',
        color: 'gray',
        marginBottom: '0.5rem',
      }}
    >
      {t('tip')}
      {props.children}
    </Text>
  );
}
