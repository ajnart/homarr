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
  component: EntityStateTile,
});

export type ISmartHomeEntityStateWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface SmartHomeEntityStateWidgetProps {
  widget: ISmartHomeEntityStateWidget;
}

function EntityStateTile({ widget }: SmartHomeEntityStateWidgetProps) {
  const { t } = useTranslation('modules/smart-home/entity-state');
  const { name: configName } = useConfigContext();

  const { data, isInitialLoading, isLoading, isError, error } =
    api.smartHomeEntityState.retrieveStatus.useQuery(
      {
        configName: configName!,
        entityId: widget.properties.entityId,
      },
      {
        enabled: !!configName,
        refetchInterval: 2 * 60 * 1000
      }
    );

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
        {isLoading && <Loader ml="xs" size={10} />}
      </Text>
    );
  }

  return (
    <Center h="100%" w="100%">
      <Stack align="center" spacing={3}>
        <Text align="center" weight="bold" size="lg">
          {widget.properties.displayName}
        </Text>
        {dataComponent}
      </Stack>
    </Center>
  );
}

export default definition;
