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

  const { data: initialData, isLoading, isError } = api.bitcoin.getInitialData.useQuery(undefined);
  const { t } = useTranslation('modules/bitcoin');


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
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1200px-Bitcoin.svg.png"
        />
        <Badge color="orange">{new Date().toLocaleDateString()}</Badge>
      </Flex>
      <Flex mt="md" direction="row" justify="space-between">
        <Flex  direction="column" justify="flex-start">
          <Text size="xs"  fw={700}>
            {t('titles.recommended-fees')}
          </Text>
          <Text size="xs">{t('texts.fees.fastest')} {initialData.recommendedFees.fastestFee} {t('texts.fees.sats-vb')}</Text>
          <Text size="xs">{t('texts.fees.half-hour')} {initialData.recommendedFees.halfHourFee} {t('texts.fees.sats-vb')}</Text>
          <Text size="xs">{t('texts.fees.hour')} {initialData.recommendedFees.hourFee} {t('texts.fees.sats-vb')}</Text>
          <Text size="xs">{t('texts.fees.minimum')} {initialData.recommendedFees.minimumFee} {t('texts.fees.sats-vb')}</Text>
        </Flex>
        <Flex direction="column" justify="flex-start">
          <Text size="xs" fw={700}>
          {t('titles.bitcoin-price')}
          </Text>
          <Text size="xs">{usDollarFormatter.format(initialData.price.USD)}</Text>
          <Text size="xs">{eurFormatter.format(initialData.price.EUR)}</Text>
        </Flex>
      </Flex>
    </>
  );
}

export default definition;
