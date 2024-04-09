import { Badge, Center, Flex, Image, Text } from '@mantine/core';
import { IconCurrencyBitcoin } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { api } from '~/utils/api';

import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';

const definition = defineWidget({
  id: 'bitcoin',
  icon: IconCurrencyBitcoin,
  options: {},
  gridstack: {
    minWidth: 2,
    minHeight: 1,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: CryptoCurrenciesWidgetTile,
});

export type ICryptoCurrenciesWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface CryptoCurrenciesWidgetTileProps {
  widget: ICryptoCurrenciesWidget;
}

const usDollarFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});
const eurFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'EUR',
});

function CryptoCurrenciesWidgetTile({ widget }: CryptoCurrenciesWidgetTileProps) {
  const { data: initialData, isLoading, isError } = api.cryptoCurrencies.getInitialData.useQuery(undefined, undefined);
  const { t } = useTranslation('modules/crypto-currencies');

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
    <>
      <Flex justify="space-between">
        <Image
          width={25}
          src={initialData.cryptoData.cryptoPrice.image.small}
        />
        <Badge color="orange">{new Date().toLocaleDateString()}</Badge>
      </Flex>
      <Flex mt="md" direction="row" justify="space-between">
        <Flex direction="column" justify="flex-start">
          <Text size="xs" fw={700}>
            {t('titles.recommended-fees')}
          </Text>
          <Text size="xs">
            {t('texts.fees.fastest')} 1 {' '}
            {t('texts.fees.sats-vb')}
          </Text>
          <Text size="xs">
            {t('texts.fees.half-hour')} 1 {' '}
            {t('texts.fees.sats-vb')}
          </Text>
          <Text size="xs">
            {t('texts.fees.hour')} 1 {t('texts.fees.sats-vb')}
          </Text>
          <Text size="xs">
            {t('texts.fees.minimum')} 1 {' '}
            {t('texts.fees.sats-vb')}
          </Text>
        </Flex>
        <Flex direction="column" justify="flex-start">
          <Text size="xs" fw={700}>
            {t('titles.bitcoin-price')}
          </Text>
          <Text size="xs">{usDollarFormatter.format(initialData.cryptoData.cryptoPrice.market_data.current_price.usd)}</Text>
          <Text size="xs">{eurFormatter.format(initialData.cryptoData.cryptoPrice.market_data.current_price.eur)}</Text>
        </Flex>
      </Flex>
    </>
  );
}

export default definition;
