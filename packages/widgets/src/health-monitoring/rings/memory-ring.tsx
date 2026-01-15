import { Center, RingProgress, Text } from "@mantine/core";
import { IconBrain } from "@tabler/icons-react";

import { progressColor } from "../system-health";

export const MemoryRing = ({ available, used, isTiny }: { available: number; used: number; isTiny: boolean }) => {
  const memoryUsage = formatMemoryUsage(available, used);

  return (
    <RingProgress
      className="health-monitoring-memory"
      roundCaps
      size={isTiny ? 50 : 100}
      thickness={isTiny ? 4 : 8}
      label={
        <Center style={{ flexDirection: "column" }}>
          <Text className="health-monitoring-memory-value" size={isTiny ? "8px" : "xs"}>
            {memoryUsage.memUsed.GB}GiB
          </Text>
          <IconBrain className="health-monitoring-memory-icon" size={isTiny ? 8 : 16} />
        </Center>
      }
      sections={[
        {
          value: Number(memoryUsage.memUsed.percent),
          color: progressColor(Number(memoryUsage.memUsed.percent)),
          tooltip: `${memoryUsage.memUsed.percent}%`,
        },
      ]}
    />
  );
};

export const formatMemoryUsage = (memFree: number, memUsed: number) => {
  const totalMemory = memFree + memUsed;
  const memFreeGB = (memFree / 1024 ** 3).toFixed(2);
  const memUsedGB = (memUsed / 1024 ** 3).toFixed(2);
  const memFreePercent = Math.round((memFree / totalMemory) * 100);
  const memUsedPercent = Math.round((memUsed / totalMemory) * 100);
  const memTotalGB = (totalMemory / 1024 ** 3).toFixed(2);

  return {
    memFree: { percent: memFreePercent, GB: memFreeGB },
    memUsed: { percent: memUsedPercent, GB: memUsedGB },
    memTotal: { GB: memTotalGB },
  };
};
