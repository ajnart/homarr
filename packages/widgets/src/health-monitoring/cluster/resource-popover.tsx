import type { PropsWithChildren } from "react";
import { Badge, Center, Divider, Flex, Group, List, Popover, RingProgress, Stack, Text } from "@mantine/core";
import {
  IconArrowNarrowDown,
  IconArrowNarrowUp,
  IconBrain,
  IconClockHour3,
  IconCpu,
  IconDatabase,
  IconDeviceLaptop,
  IconHeartBolt,
  IconNetwork,
  IconQuestionMark,
  IconServer,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import { capitalize, humanFileSize } from "@homarr/common";
import type { ComputeResource, Resource, StorageResource } from "@homarr/integrations/types";
import { useScopedI18n } from "@homarr/translation/client";

dayjs.extend(duration);

interface ResourcePopoverProps {
  item: Resource;
}

export const ResourcePopover = ({ item, children }: PropsWithChildren<ResourcePopoverProps>) => {
  return (
    <Popover
      withArrow
      withinPortal
      radius="lg"
      shadow="sm"
      transitionProps={{
        transition: "pop",
      }}
    >
      {children}
      <Popover.Dropdown>
        <ResourceTypeEntryDetails item={item} />
      </Popover.Dropdown>
    </Popover>
  );
};

export const ResourceTypeEntryDetails = ({ item }: { item: Resource }) => {
  const t = useScopedI18n("widget.healthMonitoring.cluster.popover");
  return (
    <Stack gap={0}>
      <Group wrap="nowrap" align="start" justify="apart">
        <Group wrap="nowrap" align="center">
          <ResourceIcon type={item.type} size={35} />
          <Stack gap={0}>
            <Text fw={700} size="md">
              {item.name}
            </Text>
            <Text c={item.isRunning ? "green" : "yellow"}>{capitalize(item.status)}</Text>
          </Stack>
        </Group>
        <Group align="end">
          {item.type === "node" && <RightSection label={t("rightSection.node")} value={item.node} />}
          {item.type === "lxc" && <RightSection label={t("rightSection.vmId")} value={item.vmId} />}
          {item.type === "qemu" && <RightSection label={t("rightSection.vmId")} value={item.vmId} />}
          {item.type === "storage" && <RightSection label={t("rightSection.plugin")} value={item.storagePlugin} />}
        </Group>
      </Group>
      <Divider mt={0} mb="xs" />
      {item.type !== "storage" && <ComputeResourceDetails item={item} />}
      {item.type === "storage" && <StorageResourceDetails item={item} />}
    </Stack>
  );
};

interface RightSectionProps {
  label: string;
  value: string | number;
}

const RightSection = ({ label, value }: RightSectionProps) => {
  return (
    <Stack align="end" gap={0}>
      <Text fw={200} size="sm">
        {label}
      </Text>
      <Text c="dimmed" size="xs">
        {value}
      </Text>
    </Stack>
  );
};

const ComputeResourceDetails = ({ item }: { item: ComputeResource }) => {
  const t = useScopedI18n("widget.healthMonitoring.cluster.popover.detail");
  return (
    <List>
      <List.Item icon={<IconCpu size={16} />}>
        {t("cpu")} - {item.cpu.cores}
      </List.Item>
      <List.Item icon={<IconBrain size={16} />}>
        {t("memory")} - {humanFileSize(item.memory.used)} / {humanFileSize(item.memory.total)}
      </List.Item>
      <List.Item icon={<IconDatabase size={16} />}>
        {t("storage")} - {humanFileSize(item.storage.used)} / {humanFileSize(item.storage.total)}
      </List.Item>
      <List.Item icon={<IconClockHour3 size={16} />}>
        {t("uptime")} - {dayjs(dayjs().add(-item.uptime, "seconds")).fromNow(true)}
      </List.Item>
      {item.haState && (
        <List.Item icon={<IconHeartBolt size={16} />}>
          {t("haState")} - {capitalize(item.haState)}
        </List.Item>
      )}
      <NetStats item={item} />
      <DiskStats item={item} />
    </List>
  );
};

const StorageResourceDetails = ({ item }: { item: StorageResource }) => {
  const t = useScopedI18n("widget.healthMonitoring.cluster.popover.detail");
  const storagePercent = item.total ? (item.used / item.total) * 100 : 0;
  return (
    <Stack gap={0}>
      <Center>
        <RingProgress
          roundCaps
          size={100}
          thickness={10}
          label={<Text ta="center">{storagePercent.toFixed(1)}%</Text>}
          sections={[{ value: storagePercent, color: storagePercent > 75 ? "orange" : "green" }]}
        />
        <Group align="center" gap={0}>
          <Text>
            {t("storage")} - {humanFileSize(item.used)} / {humanFileSize(item.total)}
          </Text>
        </Group>
      </Center>
      <Flex gap="sm" mt={0} justify="end">
        <StorageType item={item} />
      </Flex>
    </Stack>
  );
};

const DiskStats = ({ item }: { item: ComputeResource }) => {
  if (!item.storage.read || !item.storage.write) {
    return null;
  }
  return (
    <List.Item icon={<IconDatabase size={16} />}>
      <Group gap="sm">
        <Group gap={0}>
          <Text>{humanFileSize(item.storage.write)}</Text>
          <IconArrowNarrowDown size={14} />
        </Group>
        <Group gap={0}>
          <Text>{humanFileSize(item.storage.read)}</Text>
          <IconArrowNarrowUp size={14} />
        </Group>
      </Group>
    </List.Item>
  );
};

const NetStats = ({ item }: { item: ComputeResource }) => {
  if (!item.network.in || !item.network.out) {
    return null;
  }
  return (
    <List.Item icon={<IconNetwork size={16} />}>
      <Group gap="sm">
        <Group gap={0}>
          <Text>{humanFileSize(item.network.in)}</Text>
          <IconArrowNarrowDown size={14} />
        </Group>
        <Group gap={0}>
          <Text>{humanFileSize(item.network.out)}</Text>
          <IconArrowNarrowUp size={14} />
        </Group>
      </Group>
    </List.Item>
  );
};

const StorageType = ({ item }: { item: StorageResource }) => {
  const t = useScopedI18n("widget.healthMonitoring.cluster.popover.detail.storageType");
  if (item.isShared) {
    return <Badge color="blue">{t("shared")}</Badge>;
  } else {
    return <Badge>{t("local")}</Badge>;
  }
};

const ResourceIcon = ({ type, size }: { type: Resource["type"]; size: number }) => {
  switch (type) {
    case "node":
      return <IconServer size={size} />;
    case "lxc":
      return <IconDeviceLaptop size={size} />;
    case "qemu":
      return <IconDeviceLaptop size={size} />;
    case "storage":
      return <IconDatabase size={size} />;
    default:
      console.error(`Unknown resource type: ${type as string}`);
      return <IconQuestionMark size={size} />;
  }
};
