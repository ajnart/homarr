"use client";

import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { MRT_ColumnDef } from "mantine-react-table";
import { MantineReactTable } from "mantine-react-table";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import type { KubernetesSecret } from "@homarr/definitions";
import type { ScopedTranslationFunction } from "@homarr/translation";
import { useScopedI18n } from "@homarr/translation/client";
import { useTranslatedMantineReactTable } from "@homarr/ui/hooks";

dayjs.extend(relativeTime);

interface SecretsTableComponentProps {
  initialSecrets: RouterOutputs["kubernetes"]["secrets"]["getSecrets"];
}

const createColumns = (t: ScopedTranslationFunction<"kubernetes.secrets">): MRT_ColumnDef<KubernetesSecret>[] => [
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
    enableClickToCopy: true,
  },
  {
    accessorKey: "creationTimestamp",
    header: t("field.creationTimestamp.label"),
    Cell: ({ row }) => dayjs(row.original.creationTimestamp).fromNow(false),
  },
];

export function SecretsTable(initialData: SecretsTableComponentProps) {
  const tSecrets = useScopedI18n("kubernetes.secrets");

  const { data } = clientApi.kubernetes.secrets.getSecrets.useQuery(undefined, {
    initialData: initialData.initialSecrets,
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
      placeholder: tSecrets("table.search", { count: String(data.length) }),
      style: { minWidth: 300 },
      autoFocus: true,
    },

    columns: createColumns(tSecrets),
  });

  return <MantineReactTable table={table} />;
}
