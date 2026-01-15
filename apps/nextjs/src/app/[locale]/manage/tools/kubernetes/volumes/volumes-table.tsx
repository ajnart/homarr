"use client";

import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { MRT_ColumnDef } from "mantine-react-table";
import { MantineReactTable } from "mantine-react-table";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import type { KubernetesVolume } from "@homarr/definitions";
import type { ScopedTranslationFunction } from "@homarr/translation";
import { useScopedI18n } from "@homarr/translation/client";
import { useTranslatedMantineReactTable } from "@homarr/ui/hooks";

dayjs.extend(relativeTime);

interface VolumesTableComponentProps {
  initialVolumes: RouterOutputs["kubernetes"]["volumes"]["getVolumes"];
}

const createColumns = (t: ScopedTranslationFunction<"kubernetes.volumes">): MRT_ColumnDef<KubernetesVolume>[] => [
  {
    accessorKey: "status",
    header: t("field.status.label"),
  },
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
    accessorKey: "storage",
    header: t("field.storage.label"),
  },
  {
    accessorKey: "storageClassName",
    header: t("field.storageClassName.label"),
    enableClickToCopy: true,
  },
  {
    accessorKey: "volumeMode",
    header: t("field.volumeMode.label"),
  },
  {
    accessorKey: "volumeName",
    header: t("field.volumeName.label"),
    enableClickToCopy: true,
  },
  {
    accessorKey: "accessModes",
    header: t("field.accessModes.label"),
    Cell({ cell }) {
      return cell.row.original.accessModes.map((accessMode) => <div key={accessMode}>{accessMode}</div>);
    },
  },
  {
    accessorKey: "creationTimestamp",
    header: t("field.creationTimestamp.label"),
    Cell: ({ row }) => dayjs(row.original.creationTimestamp).fromNow(false),
  },
];

export function VolumesTable(initialData: VolumesTableComponentProps) {
  const tVolumes = useScopedI18n("kubernetes.volumes");

  const { data } = clientApi.kubernetes.volumes.getVolumes.useQuery(undefined, {
    initialData: initialData.initialVolumes,
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
      placeholder: tVolumes("table.search", { count: String(data.length) }),
      style: { minWidth: 300 },
      autoFocus: true,
    },

    columns: createColumns(tVolumes),
  });

  return <MantineReactTable table={table} />;
}
