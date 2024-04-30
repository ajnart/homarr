import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Flex,
  Group,
  Image,
  Modal,
  NumberInput,
  NumberInputHandlers,
  Stack,
  Text,
  Title,
  Tooltip,
  UnstyledButton,
  rem,
} from '@mantine/core';
import { useDisclosure, useElementSize } from '@mantine/hooks';
import {
  IconClockPause,
  IconDeviceGamepad,
  IconPlayerPlay,
  IconPlayerStop,
} from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useRef, useState } from 'react';
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
  const [opened, { close, open }] = useDisclosure(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const hoursHandlers = useRef<NumberInputHandlers>();
  const minutesHandlers = useRef<NumberInputHandlers>();
  const [appId, setAppId] = useState('');
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

  const toggleDns = async (
    action: 'enable' | 'disable',
    appsToChange?: string[],
    hours: number = 0,
    minutes: number = 0
  ) => {
    const duration = hours * 3600 + minutes * 60;
    await mutateAsync(
      {
        action,
        duration,
        configName,
        appsToChange,
      },
      {
        onSettled: () => {
          trpcUtils.dnsHole.summary.invalidate();

          setTimeout(
            () => {
              trpcUtils.dnsHole.summary.invalidate();
            },
            (duration + 3) * 1000
          );
        },
      }
    );
    setHours(0);
    setMinutes(0);
    setAppId('');
  };

  return (
    <Stack w={'100%'} spacing="0.25rem">
      {enableControls && widget.properties.showToggleAllButtons && (
        <Flex gap="xs">
          <Tooltip label={t('enableAll')}>
            <Button
              onClick={() => toggleDns('enable', getDnsStatus()?.disabled)}
              disabled={
                getDnsStatus()?.disabled.length === 0 || fetchingDnsSummary || changingStatus
              }
              variant="light"
              color="green"
              fullWidth
              h="2rem"
            >
              <IconPlayerPlay size={20} />
            </Button>
          </Tooltip>

          <Tooltip label={t('setTimer')}>
            <Button
              onClick={open}
              disabled={
                getDnsStatus()?.enabled.length === 0 || fetchingDnsSummary || changingStatus
              }
              variant="light"
              color="yellow"
              fullWidth
              h="2rem"
            >
              <IconClockPause size={20} />
            </Button>
          </Tooltip>

          <Tooltip label={t('disableAll')}>
            <Button
              onClick={() => toggleDns('disable', getDnsStatus()?.enabled)}
              disabled={
                getDnsStatus()?.enabled.length === 0 || fetchingDnsSummary || changingStatus
              }
              variant="light"
              color="red"
              fullWidth
              h="2rem"
            >
              <IconPlayerStop size={20} />
            </Button>
          </Tooltip>
        </Flex>
      )}

      <Modal
        withinPortal
        radius="lg"
        shadow="sm"
        size="sm"
        opened={opened}
        onClose={close}
        title={t('modules/dns-hole-controls:durationModal.title')}
      >
        <Flex direction="column" align="center" justify="center">
          <Stack align="flex-end">
            <Group spacing={5}>
              <Text>{t('modules/dns-hole-controls:durationModal.hours')}</Text>
              <ActionIcon
                size={35}
                variant="default"
                onClick={() => hoursHandlers.current?.decrement()}
              >
                –
              </ActionIcon>
              <NumberInput
                hideControls
                value={hours}
                onChange={(val) => setHours(Number(val))}
                handlersRef={hoursHandlers}
                max={23}
                min={0}
                step={1}
                styles={{ input: { width: rem(54), textAlign: 'center' } }}
              />
              <ActionIcon
                size={35}
                variant="default"
                onClick={() => hoursHandlers.current?.increment()}
              >
                +
              </ActionIcon>
            </Group>
            <Group spacing={5}>
              <Text>{t('modules/dns-hole-controls:durationModal.minutes')}</Text>
              <ActionIcon
                size={35}
                variant="default"
                onClick={() => minutesHandlers.current?.decrement()}
              >
                –
              </ActionIcon>
              <NumberInput
                hideControls
                value={minutes}
                onChange={(val) => setMinutes(Number(val))}
                handlersRef={minutesHandlers}
                max={59}
                min={0}
                step={1}
                styles={{ input: { width: rem(54), textAlign: 'center' } }}
              />
              <ActionIcon
                size={35}
                variant="default"
                onClick={() => minutesHandlers.current?.increment()}
              >
                +
              </ActionIcon>
            </Group>
          </Stack>
          <Text ta="center" c="dimmed" mb={5}>
            {t('modules/dns-hole-controls:durationModal.unlimited')}
          </Text>
          <Button
            variant="light"
            color="red"
            leftIcon={<IconClockPause size={20} />}
            h="2rem"
            w="12rem"
            onClick={() => {
              toggleDns(
                'disable',
                appId !== '' ? [appId] : getDnsStatus()?.enabled,
                hours,
                minutes
              );
              close();
            }}
          >
            {t('modules/dns-hole-controls:durationModal.set')}
          </Button>
        </Flex>
      </Modal>

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
                <Stack spacing="0rem" align="center">
                  <Text>{app.name}</Text>
                  <Flex direction="row" gap="md">
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
                    <ActionIcon
                      size={20}
                      radius="xl"
                      variant="default"
                      onClick={() => {
                        setAppId(app.id);
                        open();
                      }}
                    >
                      <IconClockPause size={20} color="red" />
                    </ActionIcon>
                  </Flex>
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
