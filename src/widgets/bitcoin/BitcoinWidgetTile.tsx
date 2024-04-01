import { Blockquote, Badge, Center, Flex, Group, Stack, Text, Title } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import {

  IconCurrencyBitcoin,
  IconInfoCircle

} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { api } from '~/utils/api';

import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';

const definition = defineWidget({
  id: 'bitcoin',
  icon: IconCurrencyBitcoin,
  options: {
    dashName: {
      type: 'text',
      defaultValue: 'Bitcoin',
    },
    graphHeight: {
      type: 'number',
      defaultValue: 115,
      inputProps: {
        step: 5,
        stepHoldDelay: 500,
        stepHoldInterval: 100,
      },
    },
  },
  gridstack: {
    minWidth: 2,
    minHeight: 1,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: BitcoinWidgetTile,
});

export type IBitcoinWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface BitcoinWidgetTileProps {
  widget: IBitcoinWidget;
}

const usDollarFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});
const eurFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'EUR',
});
function BitcoinWidgetTile({ widget }: BitcoinWidgetTileProps) {
  /* hooks go here */
  const {
    data: bitcoin,
    isLoading,
    isError,
  } = api.bitcoin.getBTCPrice.useQuery(undefined, { refetchInterval: 1000 * 60 * 30 });
  const { t } = useTranslation('modules/bitcoin');
  const { width, ref } = useElementSize();
  const infoIcon = <IconInfoCircle/>;
  if (isLoading) {
    return <WidgetLoading />;
  }
  if (isError) {
    return (
      <Center>
        <Text weight={500}>{t('error')}</Text>
      </Center>
    );
  }
  /* return JSX */
  return (
    <Stack w="100%" ref={ref} spacing={0}>
      <Flex justify="space-between">
      <Title size={'h5'}>Bitcoin Prices</Title>
      <Badge color="red">{new Date().toLocaleDateString()}</Badge>
      </Flex>
      <Flex justify="flex-end">
      <Blockquote cite="– Mempool">
          <Text>{usDollarFormatter.format(bitcoin.USD)}</Text>
          <Text>{eurFormatter.format(bitcoin.EUR)}</Text>
        </Blockquote>
      </Flex>

    </Stack>
  );
}

export default definition;
