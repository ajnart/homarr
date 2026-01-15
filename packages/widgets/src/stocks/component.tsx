"use client";

import { Sparkline } from "@mantine/charts";
import { Flex, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { clientApi } from "@homarr/api/client";
import { useScopedI18n } from "@homarr/translation/client";

import type { WidgetComponentProps } from "../definition";

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function calculateChange(currentPrice: number, previousClose: number) {
  return currentPrice - previousClose;
}

function calculateChangePercentage(currentPrice: number, previousClose: number) {
  return 100 * ((currentPrice - previousClose) / previousClose);
}

export default function StockPriceWidget({ options, width, height }: WidgetComponentProps<"stockPrice">) {
  const t = useScopedI18n("widget.stockPrice");
  const theme = useMantineTheme();
  const [{ data }] = clientApi.widget.stockPrice.getPriceHistory.useSuspenseQuery(options);

  const stockValuesChange = round(calculateChange(data.priceHistory.at(-1) ?? 0, data.previousClose));
  const stockValuesChangePercentage = round(
    calculateChangePercentage(data.priceHistory.at(-1) ?? 0, data.previousClose),
  );

  const stockValuesMin = Math.min(...data.priceHistory);
  const stockGraphValues = data.priceHistory.map((value) => value - stockValuesMin + 50);

  return (
    <Flex h="100%" w="100%">
      <Sparkline
        pos="absolute"
        bottom={10}
        w="100%"
        h={height > 280 ? "75%" : "50%"}
        data={stockGraphValues}
        curveType="linear"
        trendColors={{ positive: "green.7", negative: "red.7", neutral: "gray.6" }}
        fillOpacity={0.6}
        strokeWidth={2.5}
      />

      <Stack pos="absolute" top={10} left={10}>
        <Text size="xl" fw={700} lh="0.715">
          {stockValuesChange > 0 ? (
            <IconTrendingUp size="1.5rem" color={theme.colors.green[7]} />
          ) : (
            <IconTrendingDown size="1.5rem" color={theme.colors.red[7]} />
          )}
          {data.symbol}
        </Text>
        {width > 280 && height > 280 && (
          <Text size="md" lh="1">
            {data.shortName}
          </Text>
        )}
      </Stack>

      <Title pos="absolute" bottom={10} right={10} order={width > 280 ? 1 : 2} fw={700}>
        {new Intl.NumberFormat().format(round(data.priceHistory.at(-1) ?? 0))}
      </Title>

      {width > 280 && (
        <Text pos="absolute" top={10} right={10} size="xl" fw={700}>
          {new Intl.NumberFormat().format(stockValuesChange)} ({stockValuesChange > 0 ? "+" : ""}
          {new Intl.NumberFormat().format(stockValuesChangePercentage)}%)
        </Text>
      )}

      {width > 280 && (
        <Text pos="absolute" bottom={10} left={10} fw={700}>
          {t(`option.timeRange.option.${options.timeRange}.label`)}
        </Text>
      )}

      <Stack pos="absolute" top={10} left={10}>
        <Text size="xl" fw={700} lh="0.715">
          {stockValuesChange > 0 ? (
            <IconTrendingUp size="1.5rem" color={theme.colors.green[7]} />
          ) : (
            <IconTrendingDown size="1.5rem" color={theme.colors.red[7]} />
          )}
          {data.symbol}
        </Text>
        {width > 280 && height > 280 && (
          <Text size="md" lh="1">
            {data.shortName}
          </Text>
        )}
      </Stack>
    </Flex>
  );
}
