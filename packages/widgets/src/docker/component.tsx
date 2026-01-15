"use client";

import { useMemo } from "react";
import { ActionIcon, Avatar, Badge, Group, Stack, Text, Tooltip } from "@mantine/core";
import type { IconProps } from "@tabler/icons-react";
import { IconBrandDocker, IconPlayerPlay, IconPlayerStop, IconRotateClockwise } from "@tabler/icons-react";
import type { MRT_ColumnDef } from "mantine-react-table";
import { MantineReactTable } from "mantine-react-table";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { humanFileSize, useTimeAgo } from "@homarr/common";
import type { ContainerState } from "@homarr/docker";
import { containerStateColorMap } from "@homarr/docker/shared";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useScopedI18n } from "@homarr/translation/client";
import { useTranslatedMantineReactTable } from "@homarr/ui/hooks";

import type { WidgetComponentProps } from "../definition";

const ContainerStateBadge = ({ state }: { state: ContainerState }) => {
  const t = useScopedI18n("docker.field.state.option");

  return (
    <Badge size="xs" radius="sm" variant="light" color={containerStateColorMap[state]}>
      {t(state)}
    </Badge>
  );
};

const memoryUsageColor = (number: number, state: string) => {
  const mbUsage = number / 1024 / 1024;
  if (mbUsage === 0 && state !== "running") return "red";
  if (mbUsage < 128) return "green";
  if (mbUsage < 256) return "yellow";
  if (mbUsage < 512) return "orange";
  return "red";
};

const cpuUsageColor = (number: number, state: string) => {
  if (number === 0 && state !== "running") return "red";
  if (number < 40) return "green";
  if (number < 60) return "yellow";
  if (number < 90) return "orange";
  return "red";
};

const safeValue = (value?: number, fallback = 0) => (value !== undefined && !isNaN(value) ? value : fallback);

const actionIconIconStyle: IconProps["style"] = {
  height: "var(--ai-icon-size)",
  width: "var(--ai-icon-size)",
};

const createColumns = (
  t: ReturnType<typeof useScopedI18n<"docker">>,
): MRT_ColumnDef<RouterOutputs["docker"]["getContainers"]["containers"][number]>[] => [
  {
    id: "name",
    accessorKey: "name",
    header: t("field.name.label"),
    Cell({ renderedCellValue, row }) {
      return (
        <Group gap="xs" wrap="nowrap">
          <Avatar variant="outline" radius="md" size={20} src={row.original.iconUrl} />
          <Text p="0.5" size="sm" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {renderedCellValue}
          </Text>
        </Group>
      );
    },
  },
  {
    id: "state",
    accessorKey: "state",
    size: 100,
    header: t("field.state.label"),
    Cell({ row }) {
      return <ContainerStateBadge state={row.original.state} />;
    },
  },
  {
    id: "cpuUsage",
    sortingFn: (rowA, rowB) => {
      const cpuUsageA = safeValue(rowA.original.cpuUsage);
      const cpuUsageB = safeValue(rowB.original.cpuUsage);

      return cpuUsageA - cpuUsageB;
    },
    accessorKey: "cpuUsage",
    size: 80,
    header: t("field.stats.cpu.label"),
    Cell({ row }) {
      const cpuUsage = safeValue(row.original.cpuUsage);

      return (
        <Text size="xs" c={cpuUsageColor(cpuUsage, row.original.state)}>
          {cpuUsage.toFixed(2)}%
        </Text>
      );
    },
  },
  {
    id: "memoryUsage",
    sortingFn: (rowA, rowB) => {
      const memoryUsageA = safeValue(rowA.original.memoryUsage);
      const memoryUsageB = safeValue(rowB.original.memoryUsage);

      return memoryUsageA - memoryUsageB;
    },
    accessorKey: "memoryUsage",
    size: 80,
    header: t("field.stats.memory.label"),
    Cell({ row }) {
      const bytesUsage = safeValue(row.original.memoryUsage);

      return (
        <Text size="xs" c={memoryUsageColor(bytesUsage, row.original.state)}>
          {humanFileSize(bytesUsage)}
        </Text>
      );
    },
  },
  {
    id: "actions",
    accessorKey: "actions",
    size: 80,
    header: t("action.title"),
    enableSorting: false,
    Cell({ row }) {
      const utils = clientApi.useUtils();
      // eslint-disable-next-line no-restricted-syntax
      const onSettled = async () => {
        await utils.docker.getContainers.invalidate();
      };
      const { mutateAsync: startContainer } = clientApi.docker.startAll.useMutation({ onSettled });
      const { mutateAsync: stopContainer } = clientApi.docker.stopAll.useMutation({ onSettled });
      const { mutateAsync: restartContainer } = clientApi.docker.restartAll.useMutation({ onSettled });

      const handleActionAsync = async (action: "start" | "stop" | "restart") => {
        const mutation = action === "start" ? startContainer : action === "stop" ? stopContainer : restartContainer;

        await mutation(
          { ids: [row.original.id] },
          {
            onSuccess() {
              showSuccessNotification({
                title: t(`action.${action}.notification.success.title`),
                message: t(`action.${action}.notification.success.message`),
              });
            },
            onError() {
              showErrorNotification({
                title: t(`action.${action}.notification.error.title`),
                message: t(`action.${action}.notification.error.message`),
              });
            },
          },
        );
      };

      return (
        <Group wrap="nowrap" gap="xs">
          <Tooltip label={row.original.state === "running" ? t("action.stop.label") : t("action.start.label")}>
            <ActionIcon
              variant="subtle"
              size="xs"
              radius="100%"
              onClick={() => handleActionAsync(row.original.state === "running" ? "stop" : "start")}
            >
              {row.original.state === "running" ? (
                <IconPlayerStop style={actionIconIconStyle} />
              ) : (
                <IconPlayerPlay style={actionIconIconStyle} />
              )}
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t("action.restart.label")}>
            <ActionIcon variant="subtle" size="xs" radius="100%" onClick={() => handleActionAsync("restart")}>
              <IconRotateClockwise style={actionIconIconStyle} />
            </ActionIcon>
          </Tooltip>
        </Group>
      );
    },
  },
];

export default function DockerWidget({ options, width, isEditMode }: WidgetComponentProps<"dockerContainers">) {
  const t = useScopedI18n("docker");
  const isTiny = width <= 256;

  const utils = clientApi.useUtils();
  const [{ containers, timestamp }] = clientApi.docker.getContainers.useSuspenseQuery();
  const relativeTime = useTimeAgo(timestamp);

  clientApi.docker.subscribeContainers.useSubscription(undefined, {
    onData(data) {
      utils.docker.getContainers.setData(undefined, { containers: data, timestamp: new Date() });
    },
  });

  const totalContainers = containers.length;

  const columns = useMemo(() => createColumns(t), [t]);

  const table = useTranslatedMantineReactTable({
    columns,
    data: containers,
    enablePagination: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableColumnActions: false,
    enableSorting: options.enableRowSorting && !isEditMode,
    enableStickyHeader: false,
    enableColumnOrdering: false,
    enableRowSelection: false,
    enableFullScreenToggle: false,
    enableGlobalFilter: false,
    enableDensityToggle: false,
    enableFilters: false,
    enableHiding: false,
    initialState: {
      sorting: [{ id: options.defaultSort, desc: options.descendingDefaultSort }],
      density: "xs",
    },
    mantinePaperProps: {
      flex: 1,
      withBorder: false,
      shadow: undefined,
    },
    mantineTableProps: {
      className: "docker-widget-table",
      style: {
        tableLayout: "fixed",
      },
    },
    mantineTableHeadProps: {
      fz: "xs",
    },
    mantineTableHeadCellProps: {
      p: 4,
    },
    mantineTableBodyCellProps: {
      p: 4,
    },
    mantineTableContainerProps: {
      style: {
        height: "100%",
      },
    },
  });

  return (
    <Stack gap={0} h="100%" display="flex">
      <MantineReactTable table={table} />

      {!isTiny && (
        <Group
          justify="space-between"
          style={{
            borderTop: "0.0625rem solid var(--border-color)",
          }}
          p={4}
        >
          <Group gap={4}>
            <IconBrandDocker size={20} />
            <Text size="sm">{t("table.footer", { count: totalContainers.toString() })}</Text>
          </Group>

          <Text size="sm">{t("table.updated", { when: relativeTime })}</Text>
        </Group>
      )}
    </Stack>
  );
}
