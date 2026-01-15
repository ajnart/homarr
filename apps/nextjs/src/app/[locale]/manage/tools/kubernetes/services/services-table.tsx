"use client";

import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { MRT_ColumnDef } from "mantine-react-table";
import { MantineReactTable } from "mantine-react-table";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { createId } from "@homarr/common";
import type { KubernetesService } from "@homarr/definitions";
import type { ScopedTranslationFunction } from "@homarr/translation";
import { useScopedI18n } from "@homarr/translation/client";
import { useTranslatedMantineReactTable } from "@homarr/ui/hooks";

dayjs.extend(relativeTime);

interface ServicesTableComponentProps {
  initialServices: RouterOutputs["kubernetes"]["services"]["getServices"];
}

const createColumns = (t: ScopedTranslationFunction<"kubernetes.services">): MRT_ColumnDef<KubernetesService>[] => [
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
    accessorKey: "type",
    header: t("field.type.label"),
  },
  {
    accessorKey: "ports",
    header: t("field.ports.label"),
    Cell({ cell }) {
      return cell.row.original.ports?.map((port) => <div key={createId()}>{port}</div>);
    },
  },
  {
    accessorKey: "targetPorts",
    header: t("field.targetPorts.label"),
    Cell({ cell }) {
      return cell.row.original.targetPorts?.map((targetPort) => <div key={createId()}>{targetPort}</div>);
    },
  },
  {
    accessorKey: "clusterIP",
    header: t("field.clusterIP.label"),
    enableClickToCopy: true,
  },
  {
    accessorKey: "creationTimestamp",
    header: t("field.creationTimestamp.label"),
    Cell: ({ row }) => dayjs(row.original.creationTimestamp).fromNow(false),
  },
];

export function ServicesTable(initialData: ServicesTableComponentProps) {
  const tServices = useScopedI18n("kubernetes.services");

  const { data } = clientApi.kubernetes.services.getServices.useQuery(undefined, {
    initialData: initialData.initialServices,
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
      placeholder: tServices("table.search", { count: String(data.length) }),
      style: { minWidth: 300 },
      autoFocus: true,
    },
    columns: createColumns(tServices),
  });

  return <MantineReactTable table={table} />;
}
