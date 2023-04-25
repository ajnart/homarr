import { Card, Center, Container, Stack, Text } from '@mantine/core';
import { IconAd, IconBarrierBlock, IconPercentage, IconSearch, IconWorldWww } from '@tabler/icons';
import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';
import { formatNumber } from '../../tools/client/math';
import { useAdHoleSummeryQuery } from './query';

const definition = defineWidget({
  id: 'adhole-summary',
  icon: IconAd,
  options: {},
  gridstack: {
    minWidth: 2,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: AdHoleSummaryWidgetTile,
});

export type IAdHoleSummaryWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface AdHoleSummaryWidgetProps {
  widget: IAdHoleSummaryWidget;
}

function AdHoleSummaryWidgetTile({ widget }: AdHoleSummaryWidgetProps) {
  const { isInitialLoading, data, isError } = useAdHoleSummeryQuery();

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
      <Card m="xs" withBorder>
        <Center h="100%">
          <Stack align="center">
            <IconBarrierBlock size={30} />
            <div>
              <Text align="center">{formatNumber(data.adsBlockedToday)}</Text>
              <Text align="center" size="sm">
                Ads blocked today
              </Text>
            </div>
          </Stack>
        </Center>
      </Card>
      <Card m="xs" withBorder>
        <Center h="100%">
          <Stack align="center">
            <IconPercentage size={30} />
            <div>
              <Text align="center">{data.adsBlockedTodayPercentage}%</Text>
              <Text align="center" size="sm">
                blocked today
              </Text>
            </div>
          </Stack>
        </Center>
      </Card>
      <Card m="xs" withBorder>
        <Center h="100%">
          <Stack align="center">
            <IconSearch size={30} />
            <div>
              <Text align="center">{formatNumber(data.dnsQueriesToday)}</Text>
              <Text align="center" size="sm">
                Queries today
              </Text>
            </div>
          </Stack>
        </Center>
      </Card>
      <Card m="xs" withBorder>
        <Center h="100%">
          <Stack align="center">
            <IconWorldWww size={30} />
            <div>
              <Text align="center">{formatNumber(data.domainsBeingBlocked)}</Text>
              <Text align="center" size="sm">
                Domains blocked
              </Text>
            </div>
          </Stack>
        </Center>
      </Card>
    </Container>
  );
}

export default definition;
