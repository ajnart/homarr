"use client";

import React from "react";
import { Badge, rem } from "@mantine/core";
import { IconCircleDashedCheck, IconHeartBroken } from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { MRT_ColumnDef } from "mantine-react-table";
import { MantineReactTable } from "mantine-react-table";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import type { KubernetesNamespace } from "@homarr/definitions";
import type { ScopedTranslationFunction } from "@homarr/translation";
import { useScopedI18n } from "@homarr/translation/client";
import { useTranslatedMantineReactTable } from "@homarr/ui/hooks";

dayjs.extend(relativeTime);

interface NamespacesTableComponentProps {
  initialNamespaces: RouterOutputs["kubernetes"]["namespaces"]["getNamespaces"];
}

const createColumns = (t: ScopedTranslationFunction<"kubernetes.namespaces">): MRT_ColumnDef<KubernetesNamespace>[] => [
  {
    accessorKey: "status",
    header: t("field.state.label"),

    Cell({ cell }) {
      const checkIcon = <IconCircleDashedCheck style={{ width: rem(12), height: rem(12) }} />;
      const downIcon = <IconHeartBroken style={{ width: rem(12), height: rem(12) }} />;

      const badgeKubernetesNamespaceStatusColor = cell.row.original.status === "Active" ? "green" : "yellow";
      const badgeKubernetesNamespaceStatusIcon = cell.row.original.status === "Active" ? checkIcon : downIcon;

      return (
        <Badge
          leftSection={badgeKubernetesNamespaceStatusIcon}
          color={badgeKubernetesNamespaceStatusColor}
          variant="light"
        >
          {cell.row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "name",
    header: t("field.name.label"),
    enableClickToCopy: true,
  },
  {
    accessorKey: "creationTimestamp",
    header: t("field.creationTimestamp.label"),
    Cell: ({ row }) => dayjs(row.original.creationTimestamp).fromNow(false),
  },
];

export function NamespacesTable(initialData: NamespacesTableComponentProps) {
  const tNamespaces = useScopedI18n("kubernetes.namespaces");

  const { data } = clientApi.kubernetes.namespaces.getNamespaces.useQuery(undefined, {
    initialData: initialData.initialNamespaces,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const table = useTranslatedMantineReactTable({
    data,
    enableDensityToggle: false,
    enableColumnActions: false,
    enableColumnFilters: false,
    enablePagination: false,
    enableRowSelection: true,
    positionToolbarAlertBanner: "top",
    enableTableFooter: false,
    enableBottomToolbar: false,
    positionGlobalFilter: "right",
    initialState: { density: "xs", showGlobalFilter: true },
    mantineSearchTextInputProps: {
      placeholder: tNamespaces("table.search", { count: String(data.length) }),
      style: { minWidth: 300 },
      autoFocus: true,
    },

    columns: createColumns(tNamespaces),
  });

  return <MantineReactTable table={table} />;
}
