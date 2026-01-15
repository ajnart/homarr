import { Center, RingProgress, Text } from "@mantine/core";
import { IconCpu } from "@tabler/icons-react";

import { progressColor } from "../system-health";

export const CpuRing = ({ cpuUtilization, isTiny }: { cpuUtilization: number; isTiny: boolean }) => {
  return (
    <RingProgress
      className="health-monitoring-cpu"
      roundCaps
      size={isTiny ? 50 : 100}
      thickness={isTiny ? 4 : 8}
      label={
        <Center style={{ flexDirection: "column" }}>
          <Text
            className="health-monitoring-cpu-utilization-value"
            size={isTiny ? "8px" : "xs"}
          >{`${cpuUtilization.toFixed(2)}%`}</Text>
          <IconCpu className="health-monitoring-cpu-utilization-icon" size={isTiny ? 8 : 16} />
        </Center>
      }
      sections={[
        {
          value: Number(cpuUtilization.toFixed(2)),
          color: progressColor(Number(cpuUtilization.toFixed(2))),
        },
      ]}
    />
  );
};
