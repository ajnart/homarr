"use client";

import { useMemo } from "react";
import { Box, Center, List, Text, useMantineTheme } from "@mantine/core";
import { IconCircleCheckFilled, IconCircleXFilled } from "@tabler/icons-react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import objectSupport from "dayjs/plugin/objectSupport";
import relativeTime from "dayjs/plugin/relativeTime";

import { clientApi } from "@homarr/api/client";
import { useI18n } from "@homarr/translation/client";

import type { WidgetComponentProps } from "../../definition";

dayjs.extend(objectSupport);
dayjs.extend(relativeTime);
dayjs.extend(duration);

export default function NetworkControllerSummaryWidget({
  integrationIds,
}: WidgetComponentProps<"networkControllerSummary">) {
  const [summaries] = clientApi.widget.networkController.summary.useSuspenseQuery(
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

  clientApi.widget.networkController.subscribeToSummary.useSubscription(
    {
      integrationIds,
    },
    {
      onData: (data) => {
        utils.widget.networkController.summary.setData(
          {
            integrationIds,
          },
          (prevData) => {
            if (!prevData) {
              return undefined;
            }

            return prevData.map((item) =>
              item.integration.id === data.integration.id ? { ...item, summary: data.summary } : item,
            );
          },
        );
      },
    },
  );

  const data = useMemo(() => summaries.flatMap(({ summary }) => summary), [summaries]);

  return (
    <Box h="100%" p="sm">
      <Center h={"100%"}>
        <List spacing={"xs"} center>
          <List.Item icon={<StatusIcon status={data[0]?.wanStatus} />}>WAN</List.Item>
          <List.Item icon={<StatusIcon status={data[0]?.www.status} />}>
            <Text>
              WWW
              <Text c={"dimmed"} size={"md"} ms={"xs"} span>
                {data[0]?.www.latency}ms
              </Text>
            </Text>
          </List.Item>
          <List.Item icon={<StatusIcon status={data[0]?.wifi.status} />}>Wi-Fi</List.Item>
          <List.Item icon={<StatusIcon status={data[0]?.vpn.status} />}>
            <Text>
              VPN
              <Text c={"dimmed"} size={"md"} ms={"xs"} span>
                {t("widget.networkControllerSummary.card.vpn.countConnected", { count: `${data[0]?.vpn.users}` })}
              </Text>
            </Text>
          </List.Item>
        </List>
      </Center>
    </Box>
  );
}

const StatusIcon = ({ status }: { status?: "enabled" | "disabled" }) => {
  const mantineTheme = useMantineTheme();
  if (status === "enabled") {
    return <IconCircleCheckFilled size={20} color={mantineTheme.colors.green[6]} />;
  }
  return <IconCircleXFilled size={20} color={mantineTheme.colors.red[6]} />;
};
