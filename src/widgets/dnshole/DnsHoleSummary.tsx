import { Card, Center, Container, Flex, Text } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import {
  IconAd,
  IconBarrierBlock,
  IconPercentage,
  IconSearch,
  IconWorldWww,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useConfigContext } from '~/config/provider';
import { api } from '~/utils/api';

import { formatNumber } from '../../tools/client/math';
import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';

const definition = defineWidget({
  id: 'dns-hole-summary',
  icon: IconAd,
  options: {
    usePiHoleColors: {
      type: 'switch',
      defaultValue: true,
    },
    layout: {
      type: 'select',
      defaultValue: 'grid',
      data: [{ value: 'grid' }, { value: 'row' }, { value: 'column' }],
    },
  },
  gridstack: {
    minWidth: 2,
    minHeight: 1,
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
  const flexLayout = widget.properties.layout as 'row' | 'column';

  if (isInitialLoading || !data) {
    return <WidgetLoading />;
  }

  return (
    <Container
      h="100%"
      p={0}
      style={{
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        display: flexLayout?.includes('grid') ? 'grid' : 'flex',
        flexDirection: flexLayout,
      }}
    >
      <StatCard
        icon={<IconBarrierBlock />}
        number={formatNumber(data.adsBlockedToday, 2)}
        label={t('card.metrics.queriesBlockedToday') as string}
        color={
          widget.properties.usePiHoleColors ? 'rgba(240, 82, 60, 0.4)' : 'rgba(96, 96, 96, 0.1)'
        }
      />
      <StatCard
        icon={<IconPercentage />}
        number={(data.adsBlockedTodayPercentage * 100).toFixed(2) + '%'}
        color={
          widget.properties.usePiHoleColors ? 'rgba(255, 165, 20, 0.4)' : 'rgba(96, 96, 96, 0.1)'
        }
      />
      <StatCard
        icon={<IconSearch />}
        number={formatNumber(data.dnsQueriesToday, 2)}
        label={t('card.metrics.queriesToday') as string}
        color={
          widget.properties.usePiHoleColors ? 'rgba(0, 175, 218, 0.4)' : 'rgba(96, 96, 96, 0.1)'
        }
      />
      <StatCard
        icon={<IconWorldWww />}
        number={formatNumber(data.domainsBeingBlocked, 2)}
        label={t('card.metrics.domainsOnAdlist') as string}
        color={
          widget.properties.usePiHoleColors ? 'rgba(0, 176, 96, 0.4)' : 'rgba(96, 96, 96, 0.1)'
        }
      />
    </Container>
  );
}

export const useDnsHoleSummeryQuery = () => {
  const { name: configName } = useConfigContext();

  return api.dnsHole.summary.useQuery(
    {
      configName: configName!,
    },
    {
      refetchInterval: 3 * 60 * 1000,
    }
  );
};

interface StatCardProps {
  icon: JSX.Element;
  number: string;
  label?: string;
  color?: string;
}

const StatCard = ({ icon, number, label, color }: StatCardProps) => {
  const { ref, height, width } = useElementSize();
  return (
    <Card
      ref={ref}
      m="0.4rem"
      p="0.2rem"
      sx={{
        backgroundColor: color,
        flex: '1',
      }}
      withBorder
    >
      <Center h="100%" w="100%">
        <Flex
          h="100%"
          w="100%"
          align="center"
          justify="space-evenly"
          direction={width > height + 20 ? 'row' : 'column'}
        >
          {React.cloneElement(icon, {
            size: 30,
            style: { margin: '0 10' }
          })}
          <div
            style={{
              flex: '1',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Text align="center" lh={1.2} size="md" weight="bold">
              {number}
            </Text>
            {label && (
              <Text align="center" lh={1.2} size="0.75rem">
                {label}
              </Text>
            )}
          </div>
        </Flex>
      </Center>
    </Card>
  );
};

export default definition;
