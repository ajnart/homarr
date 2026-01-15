import type { MantineColor, RingProgressProps } from "@mantine/core";
import { Card, Center, Group, RingProgress, ScrollArea, Stack, Text, Title, Tooltip } from "@mantine/core";
import { IconDatabaseHeart, IconFileDescription, IconHeartbeat, IconTransform } from "@tabler/icons-react";

import { useRequiredBoard } from "@homarr/boards/context";
import { humanFileSize } from "@homarr/common";
import type { TdarrPieSegment, TdarrStatistics } from "@homarr/integrations";
import { useI18n } from "@homarr/translation/client";
import type { TablerIcon } from "@homarr/ui";

const PIE_COLORS: MantineColor[] = ["cyan", "grape", "gray", "orange", "pink"];

interface StatisticsPanelProps {
  statistics: TdarrStatistics;
}

export function StatisticsPanel(props: StatisticsPanelProps) {
  const t = useI18n("widget.mediaTranscoding.panel.statistics");

  const allLibs = props.statistics;

  // Check if Tdarr hs any Files
  if (!(allLibs.totalFileCount > 0)) {
    return (
      <Center style={{ flex: "1" }}>
        <Title order={6}>{t("empty")}</Title>
      </Center>
    );
  }

  return (
    <ScrollArea h="100%">
      <Group wrap="wrap" justify="center" p={4} w="100%" gap="xs">
        <StatisticItem icon={IconTransform} label={t("transcodesCount")} value={props.statistics.totalTranscodeCount} />
        <StatisticItem
          icon={IconHeartbeat}
          label={t("healthChecksCount")}
          value={props.statistics.totalHealthCheckCount}
        />
        <StatisticItem icon={IconFileDescription} label={t("filesCount")} value={props.statistics.totalFileCount} />
        <StatisticItem
          icon={IconDatabaseHeart}
          label={t("savedSpace")}
          value={humanFileSize(Math.floor(allLibs.totalSavedSpace))}
        />
      </Group>
      <Group justify="center" wrap="wrap" grow>
        <StatisticRingProgress items={allLibs.transcodeStatus} label={t("transcodes")} />
        <StatisticRingProgress items={allLibs.healthCheckStatus} label={t("healthChecks")} />
        <StatisticRingProgress items={allLibs.videoCodecs} label={t("videoCodecs")} />
        <StatisticRingProgress items={allLibs.videoContainers} label={t("videoContainers")} />
        <StatisticRingProgress items={allLibs.videoResolutions} label={t("videoResolutions")} />
      </Group>
    </ScrollArea>
  );
}

interface StatisticRingProgressProps {
  items: TdarrPieSegment[];
  label: string;
}

const StatisticRingProgress = ({ items, label }: StatisticRingProgressProps) => {
  return (
    <Stack align="center" gap={0} miw={60}>
      <Text size="10px" ta="center" style={{ whiteSpace: "nowrap" }}>
        {label}
      </Text>
      <RingProgress size={60} thickness={6} sections={toRingProgressSections(items)} />
    </Stack>
  );
};

function toRingProgressSections(segments: TdarrPieSegment[]): RingProgressProps["sections"] {
  const total = segments.reduce((prev, curr) => prev + curr.value, 0);
  return segments.map((segment, index) => ({
    value: (segment.value * 100) / total,
    tooltip: `${segment.name}: ${segment.value}`,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    color: PIE_COLORS[index % PIE_COLORS.length]!, // Ensures a valid color in the case that index > PIE_COLORS.length
  }));
}

interface StatisticItemProps {
  icon: TablerIcon;
  value: string | number;
  label: string;
}

function StatisticItem(props: StatisticItemProps) {
  const board = useRequiredBoard();
  return (
    <Tooltip label={props.label}>
      <Card p={0} withBorder radius={board.itemRadius} miw={48} flex={1}>
        <Group justify="center" align="center" gap="xs" w="100%" wrap="nowrap">
          <props.icon size={16} style={{ minWidth: 16 }} />
          <Text size="md">{props.value}</Text>
        </Group>
      </Card>
    </Tooltip>
  );
}
