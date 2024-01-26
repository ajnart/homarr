import {
  Badge,
  Box,
  Button,
  Card,
  Center,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconDeviceGamepad, IconPlayerPlay, IconPlayerStop } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '~/config/provider';
import { api } from '~/utils/api';

import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';
import { useDnsHoleSummeryQuery } from './DnsHoleSummary';

const definition = defineWidget({
  id: 'dns-hole-controls',
  icon: IconDeviceGamepad,
  options: {
    showToggleAllButtons: {
      type: 'switch',
      defaultValue: true,
    },
  },
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

/**
 *
 * @param fetching - a expression that return a boolean if the data is been fetched
 * @param currentStatus the current status of the dns integration, either enabled or disabled
 * @returns
 */
const dnsLightStatus = (
  fetching: boolean,
  currentStatus: 'enabled' | 'disabled'
): 'blue' | 'green' | 'red' => {
  if (fetching) {
    return 'blue';
  }
  if (currentStatus === 'enabled') {
    return 'green';
  }
  return 'red';
};

function DnsHoleControlsWidgetTile({ widget }: DnsHoleControlsWidgetProps) {
  const { data: sessionData } = useSession();
  const { isInitialLoading, data, isFetching: fetchingDnsSummary } = useDnsHoleSummeryQuery();
  const { mutateAsync, isLoading: changingStatus } = useDnsHoleControlMutation();
  const { width, ref } = useElementSize();
  const { t } = useTranslation(['common', 'modules/dns-hole-controls']);

  const enableControls = sessionData?.user.isAdmin ?? false;

  const { name: configName, config } = useConfigContext();

  const trpcUtils = api.useUtils();

  if (isInitialLoading || !data || !configName) {
    return <WidgetLoading />;
  }

  if (data.status.length === 0) {
    return (
      <Center h="100%">
        <Stack align="center">
          <IconDeviceGamepad size={40} strokeWidth={1} />
          <Title align="center" order={6}>
            {t('modules/dns-hole-controls:descriptor.errors.general.title')}
          </Title>
          <Text align="center">
            {t('modules/dns-hole-controls:descriptor.errors.general.text')}
          </Text>
        </Stack>
      </Center>
    );
  }

  type getDnsStatusAcc = {
    enabled: string[];
    disabled: string[];
  };

  const getDnsStatus = () => {
    const dnsList = data?.status.reduce(
      (acc: getDnsStatusAcc, dns) => {
        if (dns.status === 'enabled') {
          acc.enabled.push(dns.appId);
        } else if (dns.status === 'disabled') {
          acc.disabled.push(dns.appId);
        }
        return acc;
      },
      { enabled: [], disabled: [] }
    );

    if (dnsList.enabled.length === 0 && dnsList.disabled.length === 0) {
      return undefined;
    }
    return dnsList;
  };

  const toggleDns = async (action: 'enable' | 'disable', appsToChange?: string[]) => {
    await mutateAsync(
      {
        action,
        configName,
        appsToChange,
      },
      {
        onSettled: () => {
          trpcUtils.dnsHole.summary.invalidate();
        },
      }
    );
  };

  return (
    <Stack justify="space-between" h={'100%'} spacing="0.25rem">
      {enableControls && widget.properties.showToggleAllButtons && (
        <SimpleGrid
          ref={ref}
          cols={width > 275 ? 2 : 1}
          verticalSpacing="0.25rem"
          spacing="0.25rem"
        >
          <Button
            onClick={() => toggleDns('enable', getDnsStatus()?.disabled)}
            disabled={getDnsStatus()?.disabled.length === 0 || fetchingDnsSummary || changingStatus}
            leftIcon={<IconPlayerPlay size={20} />}
            variant="light"
            color="green"
            h="2rem"
          >
            {t('enableAll')}
          </Button>
          <Button
            onClick={() => toggleDns('disable', getDnsStatus()?.enabled)}
            disabled={getDnsStatus()?.enabled.length === 0 || fetchingDnsSummary || changingStatus}
            leftIcon={<IconPlayerStop size={20} />}
            variant="light"
            color="red"
            h="2rem"
          >
            {t('disableAll')}
          </Button>
        </SimpleGrid>
      )}

      <Stack
        spacing="0.25rem"
        display="flex"
        style={{
          flex: '1',
          justifyContent:
            enableControls && widget.properties.showToggleAllButtons ? 'flex-end' : 'space-evenly',
        }}
      >
        {data.status.map((dnsHole, index) => {
          const app = config?.apps.find((x) => x.id === dnsHole.appId);

          if (!app) {
            return null;
          }

          return (
            <Card withBorder={true} key={dnsHole.appId} p="xs" radius="md">
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
                  <UnstyledButton
                    onClick={() =>
                      toggleDns(dnsHole.status === 'enabled' ? 'disable' : 'enable', [app.id])
                    }
                    disabled={fetchingDnsSummary || changingStatus}
                    style={{ pointerEvents: enableControls ? 'auto' : 'none' }}
                  >
                    <Badge
                      variant="dot"
                      color={dnsLightStatus(fetchingDnsSummary || changingStatus, dnsHole.status)}
                      styles={(theme) => ({
                        root: {
                          '&:hover': {
                            background:
                              theme.colorScheme === 'dark'
                                ? theme.colors.dark[4]
                                : theme.colors.gray[2],
                          },
                          '&:active': {
                            background:
                              theme.colorScheme === 'dark'
                                ? theme.colors.dark[5]
                                : theme.colors.gray[3],
                          },
                        },
                      })}
                    >
                      {t(dnsHole.status)}
                    </Badge>
                  </UnstyledButton>
                </Stack>
              </Group>
            </Card>
          );
        })}
      </Stack>
    </Stack>
  );
}
const useDnsHoleControlMutation = () => api.dnsHole.control.useMutation();

export default definition;
