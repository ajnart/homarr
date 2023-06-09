import { useTranslation } from 'next-i18next';
import { Card, Center, Container, Stack, Text } from '@mantine/core';
import {
  IconAd,
  IconBarrierBlock,
  IconPercentage,
  IconSearch,
  IconWorldWww,
} from '@tabler/icons-react';
import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';
import { formatNumber } from '../../tools/client/math';
import { useDnsHoleSummeryQuery } from './query';

const definition = defineWidget({
  id: 'dns-hole-summary',
  icon: IconAd,
  options: {
    usePiHoleColors: {
      type: 'switch',
      defaultValue: true,
    },
  },
  gridstack: {
    minWidth: 2,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: DnsHoleSummaryWidgetTile,
});

export type IDnsHoleSummaryWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface DnsHoleSummaryWidgetProps {
  widget: IDnsHoleSummaryWidget;
}

function DnsHoleSummaryWidgetTile({ widget }: DnsHoleSummaryWidgetProps) {
  const { t } = useTranslation('modules/dns-hole-summary');
  const { isInitialLoading, data } = useDnsHoleSummeryQuery();

  if (isInitialLoading || !data) {
    return <WidgetLoading />;
  }

  return (
    <Container
      display="grid"
      h="100%"
      style={{
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        marginLeft: -20,
        marginRight: -20,
      }}
    >
      <Card
        m="xs"
        sx={(theme) => {
          if (!widget.properties.usePiHoleColors) {
            return {};
          }

          if (theme.colorScheme === 'dark') {
            return {
              backgroundColor: 'rgba(240, 82, 60, 0.4)',
            };
          }

          return {
            backgroundColor: 'rgba(240, 82, 60, 0.2)',
          };
        }}
        withBorder
      >
        <Center h="100%">
          <Stack align="center" spacing="xs">
            <IconBarrierBlock size={30} />
            <div>
              <Text align="center">{formatNumber(data.adsBlockedToday, 0)}</Text>
              <Text align="center" lh={1.2} size="sm">
                {t('card.metrics.queriesBlockedToday')}
              </Text>
            </div>
          </Stack>
        </Center>
      </Card>
      <Card
        m="xs"
        sx={(theme) => {
          if (!widget.properties.usePiHoleColors) {
            return {};
          }

          if (theme.colorScheme === 'dark') {
            return {
              backgroundColor: 'rgba(255, 165, 20, 0.4)',
            };
          }

          return {
            backgroundColor: 'rgba(255, 165, 20, 0.4)',
          };
        }}
        withBorder
      >
        <Center h="100%">
          <Stack align="center" spacing="xs">
            <IconPercentage size={30} />
            <Text align="center">{(data.adsBlockedTodayPercentage * 100).toFixed(2)}%</Text>
          </Stack>
        </Center>
      </Card>
      <Card
        m="xs"
        sx={(theme) => {
          if (!widget.properties.usePiHoleColors) {
            return {};
          }

          if (theme.colorScheme === 'dark') {
            return {
              backgroundColor: 'rgba(0, 175, 218, 0.4)',
            };
          }

          return {
            backgroundColor: 'rgba(0, 175, 218, 0.4)',
          };
        }}
        withBorder
      >
        <Center h="100%">
          <Stack align="center" spacing="xs">
            <IconSearch size={30} />
            <div>
              <Text align="center">{formatNumber(data.dnsQueriesToday, 3)}</Text>
              <Text align="center" lh={1.2} size="sm">
                {t('card.metrics.queriesToday')}
              </Text>
            </div>
          </Stack>
        </Center>
      </Card>
      <Card
        m="xs"
        sx={(theme) => {
          if (!widget.properties.usePiHoleColors) {
            return {};
          }

          if (theme.colorScheme === 'dark') {
            return {
              backgroundColor: 'rgba(0, 176, 96, 0.4)',
            };
          }

          return {
            backgroundColor: 'rgba(0, 176, 96, 0.4)',
          };
        }}
        withBorder
      >
        <Center h="100%">
          <Stack align="center" spacing="xs">
            <IconWorldWww size={30} />
            <div>
              <Text align="center">{formatNumber(data.domainsBeingBlocked, 0)}</Text>
              <Text align="center" lh={1.2} size="sm">
                {t('card.metrics.domainsOnAdlist')}
              </Text>
            </div>
          </Stack>
        </Center>
      </Card>
    </Container>
  );
}

export default definition;
