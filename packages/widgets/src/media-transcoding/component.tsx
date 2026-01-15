"use client";

import { useState } from "react";
import { Center, Divider, Group, Pagination, SegmentedControl, Stack, Text } from "@mantine/core";
import { IconClipboardList, IconCpu2, IconReportAnalytics } from "@tabler/icons-react";

import { clientApi } from "@homarr/api/client";
import { useI18n } from "@homarr/translation/client";
import type { TablerIcon } from "@homarr/ui";

import { views } from ".";
import type { WidgetComponentProps } from "../definition";
import { HealthCheckStatus } from "./health-check-status";
import { QueuePanel } from "./panels/queue.panel";
import { StatisticsPanel } from "./panels/statistics.panel";
import { WorkersPanel } from "./panels/workers.panel";

type View = (typeof views)[number];

const viewIcons = {
  workers: IconCpu2,
  queue: IconClipboardList,
  statistics: IconReportAnalytics,
} satisfies Record<View, TablerIcon>;

export default function MediaTranscodingWidget({
  integrationIds,
  options,
  width,
}: WidgetComponentProps<"mediaTranscoding">) {
  const [queuePage, setQueuePage] = useState(1);
  const queuePageSize = 10;
  const input = {
    integrationId: integrationIds[0] ?? "",
    pageSize: queuePageSize,
    page: queuePage,
  };
  const [transcodingData] = clientApi.widget.mediaTranscoding.getDataAsync.useSuspenseQuery(input, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const utils = clientApi.useUtils();
  clientApi.widget.mediaTranscoding.subscribeData.useSubscription(input, {
    onData(data) {
      utils.widget.mediaTranscoding.getDataAsync.setData(input, data);
    },
  });

  const [view, setView] = useState<View>(options.defaultView);
  const totalQueuePages = Math.ceil((transcodingData.data.queue.totalCount || 1) / queuePageSize);

  const t = useI18n("widget.mediaTranscoding");
  const isTiny = width < 256;

  return (
    <Stack gap={4} h="100%">
      {view === "workers" ? (
        <WorkersPanel workers={transcodingData.data.workers} isTiny={isTiny} />
      ) : view === "queue" ? (
        <QueuePanel queue={transcodingData.data.queue} />
      ) : (
        <StatisticsPanel statistics={transcodingData.data.statistics} />
      )}
      <Divider />
      <Group gap="xs" mb={4} ms={4} me={8}>
        <SegmentedControl
          data={views.map((value) => {
            const Icon = viewIcons[value];
            return {
              label: (
                <Center style={{ gap: 4 }}>
                  <Icon size={12} />
                  {!isTiny && (
                    <Text span size="xs">
                      {t(`tab.${value}`)}
                    </Text>
                  )}
                </Center>
              ),
              value,
            };
          })}
          value={view}
          onChange={(value) => setView(value as View)}
          size="xs"
        />

        <Group gap="xs" ml="auto">
          {view === "queue" && (
            <>
              <Pagination.Root total={totalQueuePages} value={queuePage} onChange={setQueuePage} size="xs">
                <Group gap={2} justify="center">
                  {!isTiny && <Pagination.First disabled={transcodingData.data.queue.startIndex === 1} />}
                  <Pagination.Previous disabled={transcodingData.data.queue.startIndex === 1} />
                  <Pagination.Next disabled={transcodingData.data.queue.startIndex === totalQueuePages} />
                  {!isTiny && <Pagination.Last disabled={transcodingData.data.queue.startIndex === totalQueuePages} />}
                </Group>
              </Pagination.Root>
              <Text size="xs">
                {t("currentIndex", {
                  start: String(transcodingData.data.queue.startIndex + 1),
                  end: String(transcodingData.data.queue.endIndex + 1),
                  total: String(transcodingData.data.queue.totalCount),
                })}
              </Text>
            </>
          )}

          <HealthCheckStatus statistics={transcodingData.data.statistics} />
        </Group>
      </Group>
    </Stack>
  );
}
