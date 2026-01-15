import { Center, RingProgress, Text } from "@mantine/core";
import { IconCpu } from "@tabler/icons-react";

import { progressColor } from "../system-health";

export const CpuTempRing = ({
  fahrenheit,
  cpuTemp,
  isTiny,
}: {
  fahrenheit: boolean;
  cpuTemp: number | undefined;
  isTiny: boolean;
}) => {
  if (!cpuTemp) {
    return null;
  }

  return (
    <RingProgress
      className="health-monitoring-cpu-temperature"
      roundCaps
      size={isTiny ? 50 : 100}
      thickness={isTiny ? 4 : 8}
      label={
        <Center style={{ flexDirection: "column" }}>
          <Text className="health-monitoring-cpu-temp-value" size={isTiny ? "8px" : "xs"}>
            {fahrenheit ? `${(cpuTemp * 1.8 + 32).toFixed(1)}°F` : `${cpuTemp.toFixed(1)}°C`}
          </Text>
          <IconCpu className="health-monitoring-cpu-temp-icon" size={isTiny ? 8 : 16} />
        </Center>
      }
      sections={[
        {
          value: cpuTemp,
          color: progressColor(cpuTemp),
        },
      ]}
    />
  );
};
