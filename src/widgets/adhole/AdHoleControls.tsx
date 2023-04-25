import { Badge, Button, Card, Group, Image, Stack, Text } from '@mantine/core';
import { IconDeviceGamepad, IconPlayerPlay, IconPlayerStop } from '@tabler/icons';
import { useConfigContext } from '../../config/provider';
import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';
import { useAdHoleControlMutation, useAdHoleSummeryQuery } from './query';
import { PiholeApiSummaryType } from './type';

const definition = defineWidget({
  id: 'adhole-controls',
  icon: IconDeviceGamepad,
  options: {},
  gridstack: {
    minWidth: 2,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: AdHoleControlsWidgetTile,
});

export type IAdHoleControlsWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface AdHoleControlsWidgetProps {
  widget: IAdHoleControlsWidget;
}

function AdHoleControlsWidgetTile({ widget }: AdHoleControlsWidgetProps) {
  const { isInitialLoading, data, refetch } = useAdHoleSummeryQuery();
  const { mutateAsync } = useAdHoleControlMutation();

  const { config } = useConfigContext();

  if (isInitialLoading || !data) {
    return <WidgetLoading />;
  }

  return (
    <Stack>
      <Group grow>
        <Button
          onClick={async () => {
            await mutateAsync('enabled');
            await refetch();
          }}
          leftIcon={<IconPlayerPlay size={20} />}
          variant="light"
          color="green"
        >
          Enable all
        </Button>
        <Button
          onClick={async () => {
            await mutateAsync('disabled');
            await refetch();
          }}
          leftIcon={<IconPlayerStop size={20} />}
          variant="light"
          color="red"
        >
          Disable all
        </Button>
      </Group>

      {data.status.map((status) => {
        const app = config?.apps.find((x) => x.id === status.appId);

        if (!app) {
          return null;
        }

        return (
          <Card withBorder>
            <Group position="apart">
              <Group>
                <Image src={app.appearance.iconUrl} width={20} height={20} />
                <Text>{app.name}</Text>
              </Group>

              <StatusBadge status={status.status} />
            </Group>
          </Card>
        );
      })}
    </Stack>
  );
}

const StatusBadge = ({ status }: { status: PiholeApiSummaryType['status'] }) => {
  if (status === 'enabled') {
    return (
      <Badge variant="dot" color="green">
        Enabled
      </Badge>
    );
  }

  return (
    <Badge variant="dot" color="red">
      Disabled
    </Badge>
  );
};

export default definition;
