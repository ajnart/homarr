"use client";

import { useMemo } from "react";
import type { BoxProps } from "@mantine/core";
import { Avatar, AvatarGroup, Card, Flex, SimpleGrid, Stack, Text, Tooltip, TooltipFloating } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { IconBarrierBlock, IconPercentage, IconSearch, IconWorldWww } from "@tabler/icons-react";

import { clientApi } from "@homarr/api/client";
import { useRequiredBoard } from "@homarr/boards/context";
import { formatNumber } from "@homarr/common";
import { integrationDefs } from "@homarr/definitions";
import type { DnsHoleSummary } from "@homarr/integrations/types";
import type { stringOrTranslation, TranslationFunction } from "@homarr/translation";
import { translateIfNecessary } from "@homarr/translation";
import { useI18n } from "@homarr/translation/client";
import type { TablerIcon } from "@homarr/ui";

import type { widgetKind } from ".";
import type { WidgetComponentProps, WidgetProps } from "../../definition";

export default function DnsHoleSummaryWidget({ options, integrationIds }: WidgetComponentProps<typeof widgetKind>) {
  const [summaries] = clientApi.widget.dnsHole.summary.useSuspenseQuery(
    {
      integrationIds,
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
  );
  const utils = clientApi.useUtils();

  const t = useI18n();

  clientApi.widget.dnsHole.subscribeToSummary.useSubscription(
    {
      integrationIds,
    },
    {
      onData: (data) => {
        utils.widget.dnsHole.summary.setData(
          {
            integrationIds,
          },
          (prevData) => {
            if (!prevData) {
              return undefined;
            }

            const newData = prevData.map((item) =>
              item.integration.id === data.integration.id ? { ...item, summary: data.summary } : item,
            );
            return newData;
          },
        );
      },
    },
  );

  const data = useMemo(() => summaries.flatMap(({ summary }) => summary), [summaries]);

  return (
    <SimpleGrid cols={2} spacing="xs" h="100%" p={"xs"} {...boxPropsByLayout(options.layout)}>
      {data.length > 0 ? (
        stats.map((item) => (
          <StatCard key={item.color} item={item} usePiHoleColors={options.usePiHoleColors} data={data} t={t} />
        ))
      ) : (
        <Stack h="100%" w="100%" justify="center" align="center" gap="sm" p="sm">
          <AvatarGroup spacing="md">
            {summaries.map(({ integration }) => (
              <Tooltip key={integration.id} label={integration.name}>
                <Avatar h={30} w={30} src={integrationDefs[integration.kind].iconUrl} />
              </Tooltip>
            ))}
          </AvatarGroup>
          <Text fz="md" ta="center">
            {t("widget.dnsHoleSummary.error.integrationsDisconnected")}
          </Text>
        </Stack>
      )}
    </SimpleGrid>
  );
}

const stats = [
  {
    icon: IconBarrierBlock,
    value: (data, size) =>
      formatNumber(
        data.reduce((count, { adsBlockedToday }) => count + adsBlockedToday, 0),
        size === "sm" ? 0 : 2,
      ),
    label: (t) => t("widget.dnsHoleSummary.data.adsBlockedToday"),
    color: "rgba(240, 82, 60, 0.4)", // RED
  },
  {
    icon: IconPercentage,
    value: (data, size) => {
      const totalCount = data.reduce((count, { dnsQueriesToday }) => count + dnsQueriesToday, 0);
      const blocked = data.reduce((count, { adsBlockedToday }) => count + adsBlockedToday, 0);
      return `${formatNumber(totalCount === 0 ? 0 : (blocked / totalCount) * 100, size === "sm" ? 0 : 2)}%`;
    },
    label: (t) => t("widget.dnsHoleSummary.data.adsBlockedTodayPercentage"),
    color: "rgba(255, 165, 20, 0.4)", // YELLOW
  },
  {
    icon: IconSearch,
    value: (data, size) =>
      formatNumber(
        data.reduce((count, { dnsQueriesToday }) => count + dnsQueriesToday, 0),
        size === "sm" ? 0 : 2,
      ),
    label: (t) => t("widget.dnsHoleSummary.data.dnsQueriesToday"),
    color: "rgba(0, 175, 218, 0.4)", // BLUE
  },
  {
    icon: IconWorldWww,
    value: (data, size) => {
      // We use a suffix to indicate that there might be more domains in the at least two lists.
      const suffix = data.length >= 2 ? "+" : "";
      return (
        formatNumber(
          data.reduce((count, { domainsBeingBlocked }) => count + domainsBeingBlocked, 0),
          size === "sm" ? 0 : 2,
        ) + suffix
      );
    },
    tooltip: (data, t) => (data.length >= 2 ? t("widget.dnsHoleSummary.domainsTooltip") : undefined),
    label: (t) => t("widget.dnsHoleSummary.data.domainsBeingBlocked"),
    color: "rgba(0, 176, 96, 0.4)", // GREEN
  },
] satisfies StatItem[];

interface StatItem {
  icon: TablerIcon;
  value: (summaries: DnsHoleSummary[], size: "sm" | "md") => string;
  tooltip?: (summaries: DnsHoleSummary[], t: TranslationFunction) => string | undefined;
  label: stringOrTranslation;
  color: string;
}

interface StatCardProps {
  item: StatItem;
  data: DnsHoleSummary[];
  usePiHoleColors: boolean;
  t: TranslationFunction;
}
const StatCard = ({ item, data, usePiHoleColors, t }: StatCardProps) => {
  const { ref, height, width } = useElementSize();
  const isLong = width > height + 20;
  const canStackText = height > 32;
  const hideLabel = (height <= 32 && width <= 256) || (height <= 64 && width <= 92);
  const tooltip = item.tooltip?.(data, t);
  const board = useRequiredBoard();

  return (
    <TooltipFloating label={tooltip} disabled={!tooltip} w={250} multiline>
      <Card
        ref={ref}
        className="summary-card"
        p="sm"
        radius={board.itemRadius}
        bg={usePiHoleColors ? item.color : "rgba(96, 96, 96, 0.1)"}
        style={{
          flex: 1,
        }}
      >
        <Flex
          className="summary-card-elements"
          h="100%"
          w="100%"
          align="center"
          justify="center"
          direction={isLong ? "row" : "column"}
          gap={0}
        >
          <item.icon className="summary-card-icon" size={24} style={{ minWidth: 24, minHeight: 24 }} />
          <Flex
            className="summary-card-texts"
            justify="center"
            align="center"
            direction={isLong && !canStackText ? "row" : "column"}
            style={{
              flex: isLong ? 1 : undefined,
            }}
            w="100%"
            gap={isLong ? 4 : 0}
            wrap="wrap"
          >
            <Text className="summary-card-value text-flash" ta="center" size="lg" fw="bold" maw="100%">
              {item.value(data, width <= 64 ? "sm" : "md")}
            </Text>
            {!hideLabel && (
              <Text className="summary-card-label" ta="center" size="xs" maw="100%">
                {translateIfNecessary(t, item.label)}
              </Text>
            )}
          </Flex>
        </Flex>
      </Card>
    </TooltipFloating>
  );
};

const boxPropsByLayout = (layout: WidgetProps<"dnsHoleSummary">["options"]["layout"]): BoxProps => {
  if (layout === "grid") {
    return {
      display: "grid",
      style: {
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
      },
    };
  }

  return {
    display: "flex",
    style: {
      flexDirection: layout,
    },
  };
};
