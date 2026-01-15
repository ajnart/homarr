import { Paper, Text } from "@mantine/core";
import { IconBrain } from "@tabler/icons-react";

import { humanFileSize } from "@homarr/common";
import { useScopedI18n } from "@homarr/translation/client";

import type { LabelDisplayModeOption } from "..";
import { CommonChart } from "./common-chart";

export const SystemResourceMemoryChart = ({
  memoryUsageOverTime,
  totalCapacityInBytes,
  hasShadow,
  labelDisplayMode,
}: {
  memoryUsageOverTime: number[];
  totalCapacityInBytes: number;
  hasShadow: boolean;
  labelDisplayMode: LabelDisplayModeOption;
}) => {
  const chartData = memoryUsageOverTime.map((usage, index) => ({ index, usage }));
  const t = useScopedI18n("widget.systemResources.card");

  const percentageUsed =
    memoryUsageOverTime.length > 0
      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        memoryUsageOverTime[memoryUsageOverTime.length - 1]! / totalCapacityInBytes
      : undefined;

  return (
    <CommonChart
      data={chartData}
      dataKey={"index"}
      series={[{ name: "usage", color: "red.6" }]}
      title={t("memory")}
      icon={IconBrain}
      labelDisplayMode={labelDisplayMode}
      yAxisProps={{ domain: [0, totalCapacityInBytes] }}
      lastValue={percentageUsed !== undefined ? `${Math.round(percentageUsed * 100)}%` : undefined}
      chartType={hasShadow ? "area" : "line"}
      tooltipProps={{
        content: ({ payload }) => {
          if (!payload) {
            return null;
          }
          const value = payload[0] ? Number(payload[0].value) : 0;
          return (
            <Paper px={3} py={2} withBorder shadow="md" radius="md">
              <Text c="dimmed" size="xs">
                {humanFileSize(Math.round(value))} / {humanFileSize(totalCapacityInBytes)} (
                {Math.round((value / totalCapacityInBytes) * 100)}%)
              </Text>
            </Paper>
          );
        },
      }}
    />
  );
};
