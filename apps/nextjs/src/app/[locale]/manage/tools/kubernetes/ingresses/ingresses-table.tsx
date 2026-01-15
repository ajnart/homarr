"use client";

import React from "react";
import { Anchor, Flex } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { MRT_ColumnDef } from "mantine-react-table";
import { MantineReactTable } from "mantine-react-table";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { createId } from "@homarr/common";
import type { KubernetesIngress } from "@homarr/definitions";
import type { ScopedTranslationFunction } from "@homarr/translation";
import { useScopedI18n } from "@homarr/translation/client";
import { useTranslatedMantineReactTable } from "@homarr/ui/hooks";

dayjs.extend(relativeTime);

interface IngressesTableComponentProps {
  initialIngresses: RouterOutputs["kubernetes"]["ingresses"]["getIngresses"];
}

const createColumns = (t: ScopedTranslationFunction<"kubernetes.ingresses">): MRT_ColumnDef<KubernetesIngress>[] => [
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
    accessorKey: "className",
    header: t("field.className.label"),
    enableClickToCopy: true,
  },
  {
    accessorKey: "rulesAndPaths",
    header: t("field.rulesAndPaths.label"),
    Cell({ cell }) {
      const getAbsoluteUrl = (host: string) =>
        host.startsWith("http://") || host.startsWith("https://") ? host : `https://${host}`;
      return (
        <>
          {cell.row.original.rulesAndPaths.map((ruleAndPaths) => (
            <div key={ruleAndPaths.host}>
              <Flex align="flex-end">
                <Anchor href={getAbsoluteUrl(ruleAndPaths.host)} target="_blank">
                  {getAbsoluteUrl(ruleAndPaths.host)}
                </Anchor>
                <IconArrowRight size={22} stroke={2} />
              </Flex>
              {ruleAndPaths.paths.map((path) => (
                <div key={createId()}>
                  {path.serviceName}:{path.port}
                </div>
              ))}
            </div>
          ))}
        </>
      );
    },
  },
  {
    accessorKey: "creationTimestamp",
    header: t("field.creationTimestamp.label"),
    Cell: ({ row }) => dayjs(row.original.creationTimestamp).fromNow(false),
  },
];

export function IngressesTable(initialData: IngressesTableComponentProps) {
  const tIngresses = useScopedI18n("kubernetes.ingresses");

  const { data } = clientApi.kubernetes.ingresses.getIngresses.useQuery(undefined, {
    initialData: initialData.initialIngresses,
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
      placeholder: tIngresses("table.search", { count: String(data.length) }),
      style: { minWidth: 300 },
      autoFocus: true,
    },

    columns: createColumns(tIngresses),
  });

  return <MantineReactTable table={table} />;
}
