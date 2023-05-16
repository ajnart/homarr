import { Badge, Box, Button, Card, Group, Image, Stack, Text } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { IconDeviceGamepad, IconPlayerPlay, IconPlayerStop } from '@tabler/icons-react';
import { useConfigContext } from '../../config/provider';
import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';
import { useDnsHoleControlMutation, useDnsHoleSummeryQuery } from './query';
import { PiholeApiSummaryType } from './type';
import { queryClient } from '../../tools/server/configurations/tanstack/queryClient.tool';

const definition = defineWidget({
  id: 'dns-hole-controls',
  icon: IconDeviceGamepad,
  options: {},
  gridstack: {
    minWidth: 3,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: DnsHoleControlsWidgetTile,
});

export type IDnsHoleControlsWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface DnsHoleControlsWidgetProps {
  widget: IDnsHoleControlsWidget;
}

function DnsHoleControlsWidgetTile({ widget }: DnsHoleControlsWidgetProps) {
  const { isInitialLoading, data, refetch } = useDnsHoleSummeryQuery();
  const { mutateAsync } = useDnsHoleControlMutation();
  const { t } = useTranslation('common');

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
            await queryClient.invalidateQueries({ queryKey: ['dns-hole-summary'] });
          }}
          leftIcon={<IconPlayerPlay size={20} />}
          variant="light"
          color="green"
        >
          {t('enableAll')}
        </Button>
        <Button
          onClick={async () => {
            await mutateAsync('disabled');
            await queryClient.invalidateQueries({ queryKey: ['dns-hole-summary'] });
          }}
          leftIcon={<IconPlayerStop size={20} />}
          variant="light"
          color="red"
        >
          {t('disableAll')}
        </Button>
      </Group>

      {data.status.map((status, index) => {
        const app = config?.apps.find((x) => x.id === status.appId);

        if (!app) {
          return null;
        }

        return (
          <Card withBorder key={index} p="xs">
            <Group position="apart">
              <Group>
                <Box
                  sx={(theme) => ({
                    backgroundColor:
                      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2],
                    textAlign: 'center',
                    padding: 5,
                    borderRadius: theme.radius.md,
                  })}
                >
                  <Image src={app.appearance.iconUrl} width={25} height={25} fit="contain" />
                </Box>
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
  const { t } = useTranslation('common');
  if (status === 'enabled') {
    return (
      <Badge variant="dot" color="green">
        {t('enabled')}
      </Badge>
    );
  }

  return (
    <Badge variant="dot" color="red">
      {t('disabled')}
    </Badge>
  );
};

export default definition;
