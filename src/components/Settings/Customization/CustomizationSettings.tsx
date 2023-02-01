import { ScrollArea, Stack, Text } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { useConfigContext } from '../../../config/provider';
import { CustomizationSettingsAccordeon } from './CustomizationAccordeon';

export default function CustomizationSettings() {
  const { config } = useConfigContext();
  const { height } = useViewportSize();

  return (
    <ScrollArea style={{ height: height - 100 }} offsetScrollbars>
      <Stack mt="xs" mb="md" spacing="xs">
        <Text color="dimmed">
          Cutomizsations allow you to configure and adjust your experience with Homarr to your
          preferences.
        </Text>
        <CustomizationSettingsAccordeon />
      </Stack>
    </ScrollArea>
  );
}
