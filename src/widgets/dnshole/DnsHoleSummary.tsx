import { Card, Center, Container, Flex, Text } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import {
  IconAd,
  IconBarrierBlock,
  IconPercentage,
  IconSearch,
  IconWorldWww,
  TablerIconsProps,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '~/config/provider';
import { formatNumber, formatPercentage } from '~/tools/client/math';
import { RouterOutputs, api } from '~/utils/api';

import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';

const availableLayouts = ['grid', 'row', 'column'] as const;
type AvailableLayout = (typeof availableLayouts)[number];

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
      defaultValue: 'grid' as AvailableLayout,
      data: availableLayouts.map((x) => ({ value: x })),
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
  const { isInitialLoading, data } = useDnsHoleSummeryQuery();

  if (isInitialLoading || !data) {
    return <WidgetLoading />;
  }

  return (
    <Container h="100%" p={0} style={constructContainerStyle(widget.properties.layout)}>
      {stats.map((item, index) => (
        <StatCard
          key={item.label ?? index}
          item={item}
          usePiHoleColors={widget.properties.usePiHoleColors}
          data={data}
        />
      ))}
    </Container>
  );
}

const stats = [
  {
    icon: IconBarrierBlock,
    value: (x) => formatNumber(x.adsBlockedToday, 2),
    label: 'card.metrics.queriesBlockedToday',
    color: 'rgba(240, 82, 60, 0.4)',
  },
  {
    icon: IconPercentage,
    value: (x) => formatPercentage(x.adsBlockedTodayPercentage, 2),
    label: 'card.metrics.queriesBlockedTodayPercentage',
    color: 'rgba(255, 165, 20, 0.4)',
  },
  {
    icon: IconSearch,
    value: (x) => formatNumber(x.dnsQueriesToday, 2),
    label: 'card.metrics.queriesToday',
    color: 'rgba(0, 175, 218, 0.4)',
  },
  {
    icon: IconWorldWww,
    value: (x) => formatNumber(x.domainsBeingBlocked, 2),
    label: 'card.metrics.domainsOnAdlist',
    color: 'rgba(0, 176, 96, 0.4)',
  },
] satisfies StatItem[];

type StatItem = {
  icon: (props: TablerIconsProps) => JSX.Element;
  value: (x: RouterOutputs['dnsHole']['summary']) => string;
  label?: string;
  color: string;
};

export const useDnsHoleSummeryQuery = () => {
  const { name: configName } = useConfigContext();

  return api.dnsHole.summary.useQuery(
    {
      configName: configName!,
    },
    {
      refetchInterval: 1000 * 60 * 2,
    }
  );
};

type StatCardProps = {
  item: StatItem;
  data: RouterOutputs['dnsHole']['summary'];
  usePiHoleColors: boolean;
};
const StatCard = ({ item, data, usePiHoleColors }: StatCardProps) => {
  const { t } = useTranslation('modules/dns-hole-summary');
  const { ref, height, width } = useElementSize();
  const isLong = width > height + 20;

  return (
    <Card
      ref={ref}
      m="0.4rem"
      p="0.2rem"
      bg={usePiHoleColors ? item.color : 'rgba(96, 96, 96, 0.1)'}
      style={{
        flex: 1,
      }}
      withBorder
    >
      <Center h="100%" w="100%">
        <Flex
          h="100%"
          w="100%"
          align="center"
          justify="space-evenly"
          direction={isLong ? 'row' : 'column'}
        >
          <item.icon size={30} style={{ margin: '0 10' }} />
          <Flex
            justify="center"
            direction="column"
            style={{
              flex: isLong ? 1 : undefined,
            }}
          >
            <Text align="center" lh={1.2} size="md" weight="bold">
              {item.value(data)}
            </Text>
            {item.label && (
              <Text align="center" lh={1.2} size="0.75rem">
                {t<string>(item.label)}
              </Text>
            )}
          </Flex>
        </Flex>
      </Center>
    </Card>
  );
};

const constructContainerStyle = (flexLayout: (typeof availableLayouts)[number]) => {
  if (flexLayout === 'grid') {
    return {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
    };
  }

  return {
    display: 'flex',
    flexDirection: flexLayout,
  };
};

export default definition;
