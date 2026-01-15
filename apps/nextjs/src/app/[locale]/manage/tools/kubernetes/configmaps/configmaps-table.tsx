"use client";

import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { MRT_ColumnDef } from "mantine-react-table";
import { MantineReactTable } from "mantine-react-table";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import type { KubernetesBaseResource } from "@homarr/definitions";
import type { ScopedTranslationFunction } from "@homarr/translation";
import { useScopedI18n } from "@homarr/translation/client";
import { useTranslatedMantineReactTable } from "@homarr/ui/hooks";

dayjs.extend(relativeTime);

interface ConfigMapsTableComponentProps {
  initialConfigMaps: RouterOutputs["kubernetes"]["configMaps"]["getConfigMaps"];
}

const createColumns = (
  t: ScopedTranslationFunction<"kubernetes.configmaps">,
): MRT_ColumnDef<KubernetesBaseResource>[] => [
  {
    accessorKey: "name",
    header: t("field.name.label"),
    enableClickToCopy: true,
  },
  {
    accessorKey: "namespace",
    header: t("field.namespace.label"),
    enableClickToCopy: true,
  },
  {
    accessorKey: "creationTimestamp",
    header: t("field.creationTimestamp.label"),
    Cell: ({ row }) => dayjs(row.original.creationTimestamp).fromNow(false),
  },
];

export function ConfigmapsTable(initialData: ConfigMapsTableComponentProps) {
  const tConfigMaps = useScopedI18n("kubernetes.configmaps");

  const { data } = clientApi.kubernetes.configMaps.getConfigMaps.useQuery(undefined, {
    initialData: initialData.initialConfigMaps,
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
      placeholder: tConfigMaps("table.search", { count: String(data.length) }),
      style: { minWidth: 300 },
      autoFocus: true,
    },

    columns: createColumns(tConfigMaps),
  });

  return <MantineReactTable table={table} />;
}
