"use client";

import { ActionIcon, Badge, Button, Group, Select, Text } from "@mantine/core";
import { useMap } from "@mantine/hooks";
import { IconPlayerPlay, IconPower, IconRefresh } from "@tabler/icons-react";
import type { MRT_ColumnDef } from "mantine-react-table";
import { MantineReactTable } from "mantine-react-table";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { useTimeAgo } from "@homarr/common";
import type { TaskStatus } from "@homarr/cron-job-status";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import type { ScopedTranslationFunction, TranslationFunction } from "@homarr/translation";
import { useI18n, useScopedI18n } from "@homarr/translation/client";
import { useTranslatedMantineReactTable } from "@homarr/ui/hooks";
import { IconPowerOff } from "@homarr/ui/icons";

const cronExpressions = [
  {
    value: "*/1 * * * * *",
    label: (t: TranslationFunction) => t("management.page.tool.tasks.interval.seconds", { interval: 1 }),
  },
  {
    value: "*/5 * * * * *",
    label: (t: TranslationFunction) => t("management.page.tool.tasks.interval.seconds", { interval: 5 }),
  },
  {
    value: "*/10 * * * * *",
    label: (t: TranslationFunction) => t("management.page.tool.tasks.interval.seconds", { interval: 10 }),
  },
  {
    value: "*/20 * * * * *",
    label: (t: TranslationFunction) => t("management.page.tool.tasks.interval.seconds", { interval: 20 }),
  },
  {
    value: "*/30 * * * * *",
    label: (t: TranslationFunction) => t("management.page.tool.tasks.interval.seconds", { interval: 30 }),
  },
  {
    value: "* * * * *",
    label: (t: TranslationFunction) => t("management.page.tool.tasks.interval.minutes", { interval: 1 }),
  },
  {
    value: "*/5 * * * *",
    label: (t: TranslationFunction) => t("management.page.tool.tasks.interval.minutes", { interval: 5 }),
  },
  {
    value: "*/10 * * * *",
    label: (t: TranslationFunction) => t("management.page.tool.tasks.interval.minutes", { interval: 10 }),
  },
  {
    value: "*/15 * * * *",
    label: (t: TranslationFunction) => t("management.page.tool.tasks.interval.minutes", { interval: 15 }),
  },
  // Every hour
  {
    value: "0 * * * *",
    label: (t: TranslationFunction) => t("management.page.tool.tasks.interval.hours", { interval: 1 }),
  },
  // Every two hours
  {
    value: "0 */2 * * *",
    label: (t: TranslationFunction) => t("management.page.tool.tasks.interval.hours", { interval: 2 }),
  },
  // Every four hours
  {
    value: "0 */4 * * *",
    label: (t: TranslationFunction) => t("management.page.tool.tasks.interval.hours", { interval: 4 }),
  },
  // Every midnight
  {
    value: "0 0 * * */1",
    label: (t: TranslationFunction) => t("management.page.tool.tasks.interval.midnight"),
  },
  {
    value: "0 0 * * 1",
    label: (t: TranslationFunction) => t("management.page.tool.tasks.interval.weeklyMonday"),
  },
] satisfies { value: string; label: (t: TranslationFunction) => string }[];

type JobData = RouterOutputs["cronJobs"]["getJobs"][number] & {
  status?: TaskStatus | null;
  lastExecutionTime?: string;
};

const createColumns = (
  t: TranslationFunction,
  tTasks: ScopedTranslationFunction<"management.page.tool.tasks">,
  jobStatusMap: Map<string, TaskStatus | null>,
  triggerMutation: ReturnType<typeof clientApi.cronJobs.triggerJob.useMutation>,
  updateIntervalMutation: ReturnType<typeof clientApi.cronJobs.updateJobInterval.useMutation>,
  enableMutation: ReturnType<typeof clientApi.cronJobs.enableJob.useMutation>,
  disableMutation: ReturnType<typeof clientApi.cronJobs.disableJob.useMutation>,
  loadingStates: Map<string, { toggle: boolean; trigger: boolean; interval: boolean }>,
): MRT_ColumnDef<JobData>[] => [
  {
    accessorKey: "name",
    header: tTasks("field.name.label"),
    Cell({ row }) {
      const status = jobStatusMap.get(row.original.name);
      return (
        <Group gap="xs">
          <Text fw={500}>{tTasks(`job.${row.original.name}.label`)}</Text>
          <StatusBadge isEnabled={row.original.isEnabled} status={status ?? null} />
          {status?.lastExecutionStatus === "error" && (
            <Badge color="red" size="sm">
              {tTasks("status.error")}
            </Badge>
          )}
        </Group>
      );
    },
  },
  {
    accessorKey: "cron",
    header: tTasks("field.interval.label"),
    size: 200,
    Cell({ row }) {
      const handleIntervalChange = (newCron: string | null) => {
        if (!newCron || newCron === row.original.cron) return;

        const currentStates = loadingStates.get(row.original.name) ?? {
          toggle: false,
          trigger: false,
          interval: false,
        };
        loadingStates.set(row.original.name, {
          ...currentStates,
          interval: true,
        });

        try {
          updateIntervalMutation.mutate({
            name: row.original.name,
            cron: newCron,
          });
        } finally {
          const updatedStates = loadingStates.get(row.original.name) ?? {
            toggle: false,
            trigger: false,
            interval: false,
          };
          loadingStates.set(row.original.name, {
            ...updatedStates,
            interval: false,
          });
        }
      };

      return (
        <Select
          value={row.original.cron}
          onChange={handleIntervalChange}
          data={cronExpressions.map(({ value, label }) => ({
            value,
            label: label(t),
          }))}
          size="sm"
          disabled={loadingStates.get(row.original.name)?.interval ?? false}
          style={{ minWidth: 180 }}
        />
      );
    },
  },
  {
    accessorKey: "lastExecutionTime",
    header: tTasks("field.lastExecution.label"),
    size: 150,
    Cell({ row }) {
      const status = jobStatusMap.get(row.original.name);
      if (!status?.lastExecutionTimestamp) {
        return (
          <Text size="sm" c="dimmed">
            —
          </Text>
        );
      }
      return <TimeAgo timestamp={status.lastExecutionTimestamp} />;
    },
  },
  {
    id: "actions",
    header: tTasks("field.actions.label"),
    size: 120,
    enableSorting: false,
    Cell({ row }) {
      const status = jobStatusMap.get(row.original.name);

      const handleToggleEnabled = () => {
        const currentStates = loadingStates.get(row.original.name) ?? {
          toggle: false,
          trigger: false,
          interval: false,
        };
        loadingStates.set(row.original.name, {
          ...currentStates,
          toggle: true,
        });
        try {
          if (row.original.isEnabled) {
            disableMutation.mutate(row.original.name);
          } else {
            enableMutation.mutate(row.original.name);
          }
        } finally {
          const updatedStates = loadingStates.get(row.original.name) ?? {
            toggle: false,
            trigger: false,
            interval: false,
          };
          loadingStates.set(row.original.name, {
            ...updatedStates,
            toggle: false,
          });
        }
      };

      const handleTrigger = () => {
        if (status?.status === "running") return;

        const currentStates = loadingStates.get(row.original.name) ?? {
          toggle: false,
          trigger: false,
          interval: false,
        };
        loadingStates.set(row.original.name, {
          ...currentStates,
          trigger: true,
        });
        try {
          triggerMutation.mutate(row.original.name);
        } finally {
          const updatedStates = loadingStates.get(row.original.name) ?? {
            toggle: false,
            trigger: false,
            interval: false,
          };
          loadingStates.set(row.original.name, {
            ...updatedStates,
            trigger: false,
          });
        }
      };

      return (
        <Group gap="xs">
          {!row.original.preventManualExecution && (
            <ActionIcon
              onClick={handleTrigger}
              disabled={status?.status === "running"}
              loading={loadingStates.get(row.original.name)?.trigger ?? false}
              variant="light"
              color="green"
              size="md"
            >
              <IconPlayerPlay size={16} />
            </ActionIcon>
          )}
          <ActionIcon
            onClick={handleToggleEnabled}
            loading={loadingStates.get(row.original.name)?.toggle ?? false}
            variant="light"
            color={row.original.isEnabled ? "green" : "gray"}
            size="md"
          >
            {row.original.isEnabled ? <IconPower size={16} /> : <IconPowerOff size={16} />}
          </ActionIcon>
        </Group>
      );
    },
  },
];

interface TasksTableProps {
  initialJobs: RouterOutputs["cronJobs"]["getJobs"];
}

export const TasksTable = ({ initialJobs }: TasksTableProps) => {
  const t = useI18n();
  const tTasks = useScopedI18n("management.page.tool.tasks");

  const { data: jobs } = clientApi.cronJobs.getJobs.useQuery(undefined, {
    initialData: initialJobs,
    refetchOnMount: false,
  });

  const jobStatusMap = useMap<string, TaskStatus | null>(initialJobs.map(({ name }) => [name, null] as const));

  const loadingStates = useMap<string, { toggle: boolean; trigger: boolean; interval: boolean }>();

  clientApi.cronJobs.subscribeToStatusUpdates.useSubscription(undefined, {
    onData: (data) => {
      jobStatusMap.set(data.name, data);
    },
  });

  const triggerMutation = clientApi.cronJobs.triggerJob.useMutation({
    onError() {
      showErrorNotification({
        title: t("common.error"),
        message: tTasks("trigger.error.message"),
      });
    },
    onSuccess() {
      showSuccessNotification({
        title: t("common.success"),
        message: tTasks("trigger.success.message"),
      });
    },
  });
  const updateIntervalMutation = clientApi.cronJobs.updateJobInterval.useMutation({
    onError() {
      showErrorNotification({
        title: t("common.error"),
        message: tTasks("interval.update.error.message"),
      });
    },
    onSuccess: async () => {
      await utils.cronJobs.getJobs.invalidate();
      showSuccessNotification({
        title: t("common.success"),
        message: tTasks("interval.update.success.message"),
      });
    },
  });
  const enableMutation = clientApi.cronJobs.enableJob.useMutation({
    onError() {
      showErrorNotification({
        title: t("common.error"),
        message: tTasks("toggle.error.message"),
      });
    },
    onSuccess: async () => {
      await utils.cronJobs.getJobs.invalidate();
      showSuccessNotification({
        title: t("common.success"),
        message: tTasks("enable.success.message"),
      });
    },
  });
  const disableMutation = clientApi.cronJobs.disableJob.useMutation({
    onError() {
      showErrorNotification({
        title: t("common.error"),
        message: tTasks("toggle.error.message"),
      });
    },
    onSuccess: async () => {
      await utils.cronJobs.getJobs.invalidate();
      showSuccessNotification({
        title: t("common.success"),
        message: tTasks("disable.success.message"),
      });
    },
  });

  // Utils for refresh functionality
  const utils = clientApi.useUtils();
  const handleRefreshAsync = async () => {
    try {
      await utils.cronJobs.getJobs.invalidate();
      showSuccessNotification({
        title: t("common.success"),
        message: tTasks("refresh.success.message"),
      });
    } catch {
      showErrorNotification({
        title: t("common.error"),
        message: tTasks("refresh.error.message"),
      });
    }
  };

  const table = useTranslatedMantineReactTable({
    data: jobs,
    enableDensityToggle: false,
    enableColumnActions: false,
    enableColumnFilters: false,
    enablePagination: false,
    enableRowSelection: false,
    enableTableFooter: false,
    enableBottomToolbar: false,
    enableRowActions: false,
    enableColumnOrdering: false,
    enableSorting: false,
    enableSortingRemoval: false,
    positionGlobalFilter: "right",
    mantineSearchTextInputProps: {
      placeholder: tTasks("table.search", { count: String(jobs.length) }),
      style: { minWidth: 300 },
    },
    initialState: { density: "xs", showGlobalFilter: true },
    renderTopToolbarCustomActions: () => (
      <Button variant="default" rightSection={<IconRefresh size="1rem" />} onClick={handleRefreshAsync}>
        {tTasks("action.refresh.label")}
      </Button>
    ),
    columns: createColumns(
      t,
      tTasks,
      jobStatusMap,
      triggerMutation,
      updateIntervalMutation,
      enableMutation,
      disableMutation,
      loadingStates,
    ),
  });

  return <MantineReactTable table={table} />;
};

interface StatusBadgeProps {
  isEnabled: boolean;
  status: TaskStatus | null;
}

const StatusBadge = ({ isEnabled, status }: StatusBadgeProps) => {
  const tTasks = useScopedI18n("management.page.tool.tasks");

  if (!isEnabled) {
    return (
      <Badge color="yellow" size="sm">
        {tTasks("status.disabled")}
      </Badge>
    );
  }

  if (!status) return null;

  if (status.status === "running") {
    return (
      <Badge color="green" size="sm">
        {tTasks("status.running")}
      </Badge>
    );
  }

  return (
    <Badge variant="default" size="sm">
      {tTasks("status.idle")}
    </Badge>
  );
};

const TimeAgo = ({ timestamp }: { timestamp: string }) => {
  const timeAgo = useTimeAgo(new Date(timestamp));

  return (
    <Text size="sm" c="dimmed">
      {timeAgo}
    </Text>
  );
};
