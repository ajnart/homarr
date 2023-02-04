import { ScrollArea, Stack, Text } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { useTranslation } from 'next-i18next';
import { CustomizationSettingsAccordeon } from './CustomizationAccordeon';

export default function CustomizationSettings() {
  const { height } = useViewportSize();
  const { t } = useTranslation('settings/customization/general');

  return (
    <ScrollArea style={{ height: height - 100 }} offsetScrollbars>
      <Stack mt="xs" mb="md" spacing="xs">
        <Text color="dimmed">
          {t('text')}
        </Text>
        <CustomizationSettingsAccordeon />
      </Stack>
    </ScrollArea>
  );
}
