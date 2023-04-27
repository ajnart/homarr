import { useTranslation } from 'next-i18next';
import { Card, Center, Container, Stack, Text, useMantineTheme } from '@mantine/core';
import { IconAd, IconBarrierBlock, IconPercentage, IconSearch, IconWorldWww } from '@tabler/icons';
import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';
import { formatNumber } from '../../tools/client/math';
import { useAdHoleSummeryQuery } from './query';

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
  component: AdHoleSummaryWidgetTile,
});

export type IAdHoleSummaryWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface AdHoleSummaryWidgetProps {
  widget: IAdHoleSummaryWidget;
}

function AdHoleSummaryWidgetTile({ widget }: AdHoleSummaryWidgetProps) {
  const { t } = useTranslation('modules/dns-hole-summary');
  const { colorScheme } = useMantineTheme();
  const { isInitialLoading, data } = useAdHoleSummeryQuery();

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
        bg={widget.properties.usePiHoleColors ? 'rgb(145, 50, 37)' : 'rgb(240 82 60)'}
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
        bg={widget.properties.usePiHoleColors ? 'rgb(177, 114, 12)' : 'rgb(255 165 20)'}
        withBorder
      >
        <Center h="100%">
          <Stack align="center" spacing="xs">
            <IconPercentage size={30} />
            <div>
              <Text align="center">{(data.adsBlockedTodayPercentage * 100).toFixed(2)}%</Text>
              <Text align="center" lh={1.2} size="sm">
                {t('card.metrics.queriesBlockedTodayPercentage')}
              </Text>
            </div>
          </Stack>
        </Center>
      </Card>
      <Card
        m="xs"
        bg={widget.properties.usePiHoleColors ? 'rgb(0, 121, 151)' : 'rgb(0 175 218)'}
        withBorder
      >
        <Center h="100%">
          <Stack align="center" spacing="xs">
            <IconSearch size={30} />
            <div>
              <Text align="center">{formatNumber(data.dnsQueriesToday, 0)}</Text>
              <Text align="center" lh={1.2} size="sm">
                {t('card.metrics.queriesToday')}
              </Text>
            </div>
          </Stack>
        </Center>
      </Card>
      <Card
        m="xs"
        bg={widget.properties.usePiHoleColors ? 'rgb(0, 92, 50)' : 'rgb(0 176 96)'}
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
