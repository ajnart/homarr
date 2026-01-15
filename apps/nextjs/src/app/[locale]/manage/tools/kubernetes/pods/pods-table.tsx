"use client";

import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { MRT_ColumnDef } from "mantine-react-table";
import { MantineReactTable } from "mantine-react-table";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import type { KubernetesPod } from "@homarr/definitions";
import type { ScopedTranslationFunction } from "@homarr/translation";
import { useScopedI18n } from "@homarr/translation/client";
import { useTranslatedMantineReactTable } from "@homarr/ui/hooks";

dayjs.extend(relativeTime);

interface PodsTableComponentProps {
  initialPods: RouterOutputs["kubernetes"]["pods"]["getPods"];
}

const createColumns = (t: ScopedTranslationFunction<"kubernetes.pods">): MRT_ColumnDef<KubernetesPod>[] => [
  {
    accessorKey: "name",
    header: t("field.name.label"),
  },
  {
    accessorKey: "namespace",
    header: t("field.namespace.label"),
  },
  {
    accessorKey: "image",
    header: t("field.image.label"),
  },
  {
    accessorKey: "applicationType",
    header: t("field.applicationType.label"),
  },
  {
    accessorKey: "status",
    header: t("field.status.label"),
  },
  {
    accessorKey: "creationTimestamp",
    header: t("field.creationTimestamp.label"),
    Cell: ({ row }) => dayjs(row.original.creationTimestamp).fromNow(false),
  },
];

export function PodsTable(initialData: PodsTableComponentProps) {
  const tPods = useScopedI18n("kubernetes.pods");

  const { data } = clientApi.kubernetes.pods.getPods.useQuery(undefined, {
    initialData: initialData.initialPods,
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
    initialState: { density: "xs", showGlobalFilter: true, expanded: true },
    mantineSearchTextInputProps: {
      placeholder: tPods("table.search", { count: String(data.length) }),
      style: { minWidth: 300 },
      autoFocus: true,
    },
    enableGrouping: true,
    columns: createColumns(tPods),
  });

  return <MantineReactTable table={table} />;
}
