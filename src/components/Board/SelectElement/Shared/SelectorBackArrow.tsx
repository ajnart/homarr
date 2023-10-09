import { Button, Text } from '@mantine/core';
import { IconArrowNarrowLeft } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

interface SelectorBackArrowProps {
  onClickBack: () => void;
}

export function SelectorBackArrow({ onClickBack }: SelectorBackArrowProps) {
  const { t } = useTranslation('layout/element-selector/selector');
  return (
    <Button
      leftIcon={<IconArrowNarrowLeft />}
      onClick={onClickBack}
      styles={{ inner: { width: 'fit-content' } }}
      fullWidth
      variant="default"
      mb="md"
    >
      <Text>{t('goBack')}</Text>
    </Button>
  );
}
