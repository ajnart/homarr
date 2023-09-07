import { Badge, Box, Button, Card, Group, Image, SimpleGrid, Stack, Text } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconDeviceGamepad, IconPlayerPlay, IconPlayerStop } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { api } from '~/utils/api';

import { useConfigContext } from '~/config/provider';
import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';
import { useDnsHoleSummeryQuery } from './DnsHoleSummary';
import { PiholeApiSummaryType } from './type';

const definition = defineWidget({
  id: 'dns-hole-controls',
  icon: IconDeviceGamepad,
  options: {},
  gridstack: {
    minWidth: 2,
    minHeight: 1,
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
  const utils = api.useContext();
  const { data: sessionData } = useSession();
  const { isInitialLoading, data } = useDnsHoleSummeryQuery();
  const { mutateAsync } = useDnsHoleControlMutation();
  const { width, ref } = useElementSize();
  const { t } = useTranslation('common');

  const { name: configName, config } = useConfigContext();

  if (isInitialLoading || !data || !configName) {
    return <WidgetLoading />;
  }

  return (
    <Stack justify="space-between" h={'100%'} spacing="0.25rem">
      {sessionData?.user?.isAdmin && (
        <SimpleGrid
          ref={ref}
          cols={width > 275 ? 2 : 1}
          verticalSpacing="0.25rem"
          spacing="0.25rem"
        >
          <Button
            onClick={async () => {
              await mutateAsync({
                action: 'enable',
                configName,
              });

              await utils.dnsHole.summary.invalidate();
            }}
            leftIcon={<IconPlayerPlay size={20} />}
            variant="light"
            color="green"
            h="2rem"
          >
            {t('enableAll')}
          </Button>
          <Button
            onClick={async () => {
              await mutateAsync({
                action: 'disable',
                configName,
              });
              await utils.dnsHole.summary.invalidate();
            }}
            leftIcon={<IconPlayerStop size={20} />}
            variant="light"
            color="red"
            h="2rem"
          >
            {t('disableAll')}
          </Button>
        </SimpleGrid>
      )}

      <Stack spacing="0.25rem">
        {data.status.map((status, index) => {
          const app = config?.apps.find((x) => x.id === status.appId);

          if (!app) {
            return null;
          }

          return (
            <Card withBorder={true} key={index} p="xs">
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
                  <Image src={app.appearance.iconUrl} width={40} height={40} fit="contain" />
                </Box>
                <Stack spacing="0rem">
                  <Text>{app.name}</Text>
                  <StatusBadge status={status.status} />
                </Stack>
              </Group>
            </Card>
          );
        })}
      </Stack>
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

const useDnsHoleControlMutation = () => api.dnsHole.control.useMutation();

export default definition;
