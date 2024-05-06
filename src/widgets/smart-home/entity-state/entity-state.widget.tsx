import { Center, Loader, Stack, Text, Tooltip } from '@mantine/core';
import { IconAlertHexagon, IconBinaryTree, IconExclamationMark } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useConfigContext } from '~/config/provider';
import { api } from '~/utils/api';
import { defineWidget } from '~/widgets/helper';
import { WidgetLoading } from '~/widgets/loading';
import { IWidget } from '~/widgets/widgets';

const definition = defineWidget({
  id: 'smart-home/entity-state',
  icon: IconBinaryTree,
  options: {
    entityId: {
      type: 'text',
      defaultValue: 'sun.sun',
      info: true,
    },
    appendUnit: {
      type: 'switch',
      defaultValue: false,
      info: true,
    },
    genericToggle: {
      type: 'switch',
      defaultValue: false,
      info: true,
    },
    automationId: {
      type: 'text',
      info: true,
      defaultValue: '',
    },
    displayName: {
      type: 'text',
      defaultValue: 'Sun',
    },
    displayFriendlyName: {
      type: 'switch',
      defaultValue: false,
      info: true,
    },
  },
  gridstack: {
    minWidth: 1,
    minHeight: 1,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: EntityStateTile,
});

export type ISmartHomeEntityStateWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface SmartHomeEntityStateWidgetProps {
  widget: ISmartHomeEntityStateWidget;
}

function EntityStateTile({ widget }: SmartHomeEntityStateWidgetProps) {
  const { t } = useTranslation('modules/smart-home/entity-state');
  const { name: configName } = useConfigContext();
  const utils = api.useUtils();

  const { data, isInitialLoading, isLoading, isError, error } =
    api.smartHomeEntityState.retrieveStatus.useQuery(
      {
        configName: configName!,
        entityId: widget.properties.entityId,
      },
      {
        enabled: !!configName,
        refetchInterval: 2 * 60 * 1000,
      },
    );

  const attribute = (widget.properties.appendUnit && data?.attributes.unit_of_measurement ?
    " " + data?.attributes.unit_of_measurement : ""
  )

  const displayName = (widget.properties.displayFriendlyName && data?.attributes.friendly_name ?
    data?.attributes.friendly_name : widget.properties.displayName
  )

  const { mutateAsync: mutateTriggerAutomationAsync } = api.smartHomeEntityState.triggerAutomation.useMutation({
    onSuccess: () => {
      void utils.smartHomeEntityState.invalidate();
    },
  });

  const { mutateAsync: mutateTriggerToggleSync } = api.smartHomeEntityState.triggerToggle.useMutation({
    onSuccess: () => {
      void utils.smartHomeEntityState.invalidate();
    },
  });

  const handleClick = async () => {
    if (widget.properties.genericToggle) {
      await mutateTriggerToggleSync({
        configName: configName as string,
        widgetId: widget.id,
      });
    } 
    
    if (widget.properties.automationId) {
      await mutateTriggerAutomationAsync({
        configName: configName as string,
        widgetId: widget.id,
      });
    }
  };

  let dataComponent = null;

  if (isError) {
    dataComponent = (
      <Tooltip label={error.message} withArrow withinPortal>
        <IconAlertHexagon color="red" />
      </Tooltip>
    );
  }

  if (!dataComponent && isInitialLoading) {
    dataComponent = <WidgetLoading />;
  }

  if (!dataComponent && !data) {
    dataComponent = (
      <Tooltip label={t('entityNotFound')} withArrow withinPortal>
        <IconExclamationMark color="red" />
      </Tooltip>
    );
  }

  if (!dataComponent) {
    dataComponent = (
      <Text align="center">
        {data?.state}
        {attribute}
        {isLoading && <Loader ml="xs" size={10} />}
      </Text>
    );
  }

  return (
    <Center
      onClick={handleClick}
      sx={() => {
        return {
          cursor: widget.properties.automationId?.length > 0 ? 'pointer' : undefined,
        };
      }}
      h="100%"
      w="100%">
      <Stack align="center" spacing={3}>
        <Text align="center" weight="bold" size="lg">
          {displayName}
        </Text>
        {dataComponent}
      </Stack>
    </Center>
  );
}

export default definition;
