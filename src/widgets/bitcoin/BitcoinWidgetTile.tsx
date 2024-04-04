import {
  Badge,
  Blockquote,
  Card,
  Center,
  Flex,
  Image,
  Text,
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
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
    minHeight: 2,
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
  const {
    data: bitcoin,
    isLoading,
    isError,
  } = api.bitcoin.getBTCPrice.useQuery(undefined, { refetchInterval: 1000 * 60 * 30 });
  const { t } = useTranslation('modules/bitcoin');
  const { ref } = useElementSize();

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
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image
          src="https://static.vecteezy.com/system/resources/previews/000/205/146/original/vector-bitcoin-symbol-on-orange-background.jpg"
          height={160}
          alt="Norway"
        />
      </Card.Section>

      <Flex justify="flex-end" mt="xs">
        <Badge color="pink">{new Date().toLocaleDateString()}</Badge>
      </Flex>
      <Flex justify="center">
        <Blockquote icon={null} cite="– Mempool">
          <Text>{usDollarFormatter.format(bitcoin.USD)}</Text>
          <Text>{eurFormatter.format(bitcoin.EUR)}</Text>
        </Blockquote>
      </Flex>
    </Card>
  );
}

export default definition;
