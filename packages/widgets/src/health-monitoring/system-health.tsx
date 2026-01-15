"use client";

import {
  ActionIcon,
  Box,
  Card,
  Divider,
  Flex,
  Group,
  Indicator,
  List,
  Modal,
  Progress,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBrain,
  IconClock,
  IconCpu,
  IconCpu2,
  IconFileReport,
  IconInfoCircle,
  IconServer,
  IconTemperature,
  IconVersions,
} from "@tabler/icons-react";
import combineClasses from "clsx";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import { clientApi } from "@homarr/api/client";
import { useRequiredBoard } from "@homarr/boards/context";
import type { TranslationFunction } from "@homarr/translation";
import { useI18n } from "@homarr/translation/client";

import type { WidgetComponentProps } from "../definition";
import { CpuRing } from "./rings/cpu-ring";
import { CpuTempRing } from "./rings/cpu-temp-ring";
import { formatMemoryUsage, MemoryRing } from "./rings/memory-ring";
import classes from "./system-health.module.css";

dayjs.extend(duration);

export const SystemHealthMonitoring = ({
  options,
  integrationIds,
  width,
}: WidgetComponentProps<"healthMonitoring">) => {
  const t = useI18n();
  const [healthData] = clientApi.widget.healthMonitoring.getSystemHealthStatus.useSuspenseQuery(
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
  const [opened, { open, close }] = useDisclosure(false);
  const utils = clientApi.useUtils();
  const board = useRequiredBoard();

  clientApi.widget.healthMonitoring.subscribeSystemHealthStatus.useSubscription(
    { integrationIds },
    {
      onData(data) {
        utils.widget.healthMonitoring.getSystemHealthStatus.setData({ integrationIds }, (prevData) => {
          if (!prevData) {
            return undefined;
          }
          return prevData.map((item) =>
            item.integrationId === data.integrationId
              ? { ...item, healthInfo: data.healthInfo, updatedAt: data.timestamp }
              : item,
          );
        });
      },
    },
  );

  const isTiny = width < 256;

  return (
    <Stack h="100%" gap="sm" className="health-monitoring">
      {healthData.map(({ integrationId, integrationName, healthInfo, updatedAt }) => {
        const disksData = matchFileSystemAndSmart(healthInfo.fileSystem, healthInfo.smart);
        const memoryUsage = formatMemoryUsage(healthInfo.memAvailableInBytes, healthInfo.memUsedInBytes);
        return (
          <Stack
            gap="sm"
            key={integrationId}
            h="100%"
            className={`health-monitoring-information health-monitoring-${integrationName}`}
            p="sm"
            pos="relative"
          >
            <Box className="health-monitoring-information-card-section" pos="absolute" top={8} right={8}>
              <Indicator
                className="health-monitoring-updates-reboot-indicator"
                inline
                processing
                styles={{ indicator: { pointerEvents: "none" } }}
                color={healthInfo.rebootRequired ? "red" : healthInfo.availablePkgUpdates > 0 ? "blue" : "gray"}
                position="top-end"
                size={16}
                label={healthInfo.availablePkgUpdates > 0 ? healthInfo.availablePkgUpdates : undefined}
                disabled={!healthInfo.rebootRequired && healthInfo.availablePkgUpdates === 0}
              >
                <ActionIcon
                  className="health-monitoring-information-icon-avatar"
                  variant={"light"}
                  color="var(--mantine-color-text)"
                  size="sm"
                  radius={board.itemRadius}
                >
                  <IconInfoCircle className="health-monitoring-information-icon" size={30} onClick={open} />
                </ActionIcon>
              </Indicator>
              <Modal
                opened={opened}
                onClose={close}
                size="auto"
                title={t("widget.healthMonitoring.popover.information")}
                centered
              >
                <Stack gap="10px" className="health-monitoring-modal-stack">
                  <Divider />
                  <List className="health-monitoring-information-list" center spacing="xs">
                    <List.Item className="health-monitoring-information-processor" icon={<IconCpu2 size={30} />}>
                      {t("widget.healthMonitoring.popover.processor", { cpuModelName: healthInfo.cpuModelName })}
                    </List.Item>
                    <List.Item className="health-monitoring-information-memory" icon={<IconBrain size={30} />}>
                      {t("widget.healthMonitoring.popover.memory", { memory: memoryUsage.memTotal.GB })}
                    </List.Item>
                    <List.Item className="health-monitoring-information-memory" icon={<IconBrain size={30} />}>
                      {t("widget.healthMonitoring.popover.memoryAvailable", {
                        memoryAvailable: memoryUsage.memFree.GB,
                        percent: String(memoryUsage.memFree.percent),
                      })}
                    </List.Item>
                    <List.Item className="health-monitoring-information-version" icon={<IconVersions size={30} />}>
                      {t("widget.healthMonitoring.popover.version", {
                        version: healthInfo.version,
                      })}
                    </List.Item>
                    <List.Item className="health-monitoring-information-uptime" icon={<IconClock size={30} />}>
                      {formatUptime(healthInfo.uptime, t)}
                    </List.Item>
                    {healthInfo.loadAverage && (
                      <>
                        <List.Item className="health-monitoring-information-load-average" icon={<IconCpu size={30} />}>
                          {t("widget.healthMonitoring.popover.loadAverage")}
                        </List.Item>
                        <List m="xs" withPadding center spacing="xs" icon={<IconCpu size={30} />}>
                          <List.Item className="health-monitoring-information-load-average-1min">
                            {t("widget.healthMonitoring.popover.minute")} {healthInfo.loadAverage["1min"]}%
                          </List.Item>
                          <List.Item className="health-monitoring-information-load-average-5min">
                            {t("widget.healthMonitoring.popover.minutes", { count: "5" })}{" "}
                            {healthInfo.loadAverage["5min"]}%
                          </List.Item>
                          <List.Item className="health-monitoring-information-load-average-15min">
                            {t("widget.healthMonitoring.popover.minutes", { count: "15" })}{" "}
                            {healthInfo.loadAverage["15min"]}%
                          </List.Item>
                        </List>
                      </>
                    )}
                  </List>
                </Stack>
              </Modal>
            </Box>
            <Flex className="health-monitoring-information-card-elements" justify="center" align="center" wrap="wrap">
              {options.cpu && <CpuRing cpuUtilization={healthInfo.cpuUtilization} isTiny={isTiny} />}
              {options.cpu && (
                <CpuTempRing fahrenheit={options.fahrenheit} cpuTemp={healthInfo.cpuTemp} isTiny={isTiny} />
              )}
              {options.memory && (
                <MemoryRing
                  available={healthInfo.memAvailableInBytes}
                  used={healthInfo.memUsedInBytes}
                  isTiny={isTiny}
                />
              )}
            </Flex>
            {
              <Text className="health-monitoring-status-update-time" c="dimmed" size="xs" ta="center">
                {t("widget.healthMonitoring.popover.lastSeen", { lastSeen: dayjs(updatedAt).fromNow() })}
              </Text>
            }
            {options.fileSystem &&
              disksData.map((disk) => {
                return (
                  <Card
                    className={combineClasses(
                      `health-monitoring-disk-card health-monitoring-disk-card-${integrationName}`,
                      classes.card,
                    )}
                    style={{ overflow: "visible" }}
                    key={disk.deviceName}
                    radius={board.itemRadius}
                    p="xs"
                  >
                    <Stack gap="sm">
                      <Group
                        className="health-monitoring-disk-status"
                        justify="space-between"
                        align="center"
                        wrap="wrap"
                        gap={8}
                      >
                        <Group gap={4} wrap="nowrap">
                          <IconServer className="health-monitoring-disk-icon" size="1rem" />
                          <Text className="dihealth-monitoring-disk-name" size="xs">
                            {disk.deviceName}
                          </Text>
                        </Group>
                        <Group gap={4} wrap="nowrap">
                          <IconTemperature className="health-monitoring-disk-temperature-icon" size="1rem" />
                          <Text className="health-monitoring-disk-temperature-value" size="xs">
                            {options.fahrenheit
                              ? `${(disk.temperature * 1.8 + 32).toFixed(1)}°F`
                              : `${disk.temperature}°C`}
                          </Text>
                        </Group>
                        <Group gap={4} wrap="nowrap">
                          <IconFileReport className="health-monitoring-disk-status-icon" size="1rem" />
                          <Text className="health-monitoring-disk-status-value" size="xs">
                            {disk.overallStatus ? disk.overallStatus : "N/A"}
                          </Text>
                        </Group>
                      </Group>
                      <Progress.Root className="health-monitoring-disk-use" radius={board.itemRadius} h="md">
                        <Tooltip label={disk.used}>
                          <Progress.Section
                            value={disk.percentage}
                            color={progressColor(disk.percentage)}
                            className="health-monitoring-disk-use-percentage"
                          >
                            <Progress.Label className="health-monitoring-disk-use-value" fz="xs">
                              {t("widget.healthMonitoring.popover.used")}
                            </Progress.Label>
                          </Progress.Section>
                        </Tooltip>

                        <Tooltip
                          label={
                            Number(disk.available) / 1024 ** 4 >= 1
                              ? `${(Number(disk.available) / 1024 ** 4).toFixed(2)} TiB`
                              : `${(Number(disk.available) / 1024 ** 3).toFixed(2)} GiB`
                          }
                        >
                          <Progress.Section
                            className="health-monitoring-disk-available-percentage"
                            value={100 - disk.percentage}
                            color="default"
                          >
                            <Progress.Label className="health-monitoring-disk-available-value" fz="xs">
                              {t("widget.healthMonitoring.popover.available")}
                            </Progress.Label>
                          </Progress.Section>
                        </Tooltip>
                      </Progress.Root>
                    </Stack>
                  </Card>
                );
              })}
          </Stack>
        );
      })}
    </Stack>
  );
};

export const formatUptime = (uptimeInSeconds: number, t: TranslationFunction) => {
  const uptimeDuration = dayjs.duration(uptimeInSeconds, "seconds");
  const months = uptimeDuration.months();
  const days = uptimeDuration.days();
  const hours = uptimeDuration.hours();
  const minutes = uptimeDuration.minutes();

  return t("widget.healthMonitoring.popover.uptime", {
    months: String(months),
    days: String(days),
    hours: String(hours),
    minutes: String(minutes),
  });
};

export const progressColor = (percentage: number) => {
  if (percentage < 40) return "green";
  else if (percentage < 60) return "yellow";
  else if (percentage < 90) return "orange";
  else return "red";
};

interface FileSystem {
  deviceName: string;
  used: string;
  available: string;
  percentage: number;
}

interface SmartData {
  deviceName: string;
  temperature: number | null;
  overallStatus: string;
}

export const matchFileSystemAndSmart = (fileSystems: FileSystem[], smartData: SmartData[]) => {
  return fileSystems
    .map((fileSystem) => {
      const baseDeviceName = fileSystem.deviceName.replace(/[0-9]+$/, "");
      const smartDisk = smartData.find((smart) => smart.deviceName === baseDeviceName);

      return {
        deviceName: smartDisk?.deviceName ?? fileSystem.deviceName,
        used: fileSystem.used,
        available: fileSystem.available,
        percentage: fileSystem.percentage,
        temperature: smartDisk?.temperature ?? 0,
        overallStatus: smartDisk?.overallStatus ?? "",
      };
    })
    .sort((fileSystemA, fileSystemB) => fileSystemA.deviceName.localeCompare(fileSystemB.deviceName));
};
