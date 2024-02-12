import { defineWidget } from '~/widgets/helper';
import { IconSettingsAutomation } from '@tabler/icons-react';
import { IWidget } from '~/widgets/widgets';
import { useConfigContext } from '~/config/provider';
import { api } from '~/utils/api';
import { Center, Stack, Text } from '@mantine/core';

const definition = defineWidget({
  id: 'smart-home/trigger-automation',
  icon: IconSettingsAutomation,
  options: {
    automationId: {
      type: 'text',
      info: true,
      defaultValue: ''
    },
    displayName: {
      type: 'text',
      defaultValue: 'Sun',
    },
  },
  gridstack: {
    minWidth: 1,
    minHeight: 1,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: TriggerAutomationTile,
});

export type ISmartHomeTriggerAutomationWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface SmartHomeTriggerAutomationWidgetProps {
  widget: ISmartHomeTriggerAutomationWidget;
}

function TriggerAutomationTile({ widget }: SmartHomeTriggerAutomationWidgetProps) {
  const { name: configName } = useConfigContext();
  const utils = api.useUtils();

  const { mutateAsync: mutateTriggerAutomationAsync } = api.smartHomeEntityState.triggerAutomation.useMutation({
    onSuccess: () => {
      void utils.smartHomeEntityState.invalidate();
    }
  });

  const handleClick = async () => {
    await mutateTriggerAutomationAsync({
      configName: configName as string,
      widgetId: widget.id
    });
  }

  return (
    <Center onClick={handleClick} style={{ cursor: 'pointer' }} h="100%" w="100%">
      <Stack align="center" spacing={3}>
        <Text align="center" weight="bold" size="lg">
          {widget.properties.displayName}
        </Text>
      </Stack>
    </Center>
  );
}

export default definition;