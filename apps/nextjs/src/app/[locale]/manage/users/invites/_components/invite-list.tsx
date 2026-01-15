"use client";

import { useCallback, useMemo } from "react";
import { ActionIcon, Button, Title } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { MRT_ColumnDef, MRT_Row } from "mantine-react-table";
import { MantineReactTable } from "mantine-react-table";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { useConfirmModal, useModalAction } from "@homarr/modals";
import { InviteCreateModal } from "@homarr/modals-collection";
import { useScopedI18n } from "@homarr/translation/client";
import { useTranslatedMantineReactTable } from "@homarr/ui/hooks";

dayjs.extend(relativeTime);

interface InviteListComponentProps {
  initialInvites: RouterOutputs["invite"]["getAll"];
}

export const InviteListComponent = ({ initialInvites }: InviteListComponentProps) => {
  const t = useScopedI18n("management.page.user.invite");
  const { data, isLoading } = clientApi.invite.getAll.useQuery(undefined, {
    initialData: initialInvites,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const columns = useMemo<MRT_ColumnDef<RouterOutputs["invite"]["getAll"][number]>[]>(
    () => [
      {
        accessorKey: "id",
        header: t("field.id.label"),
        grow: 100,
        Cell: ({ renderedCellValue }) => renderedCellValue,
      },
      {
        accessorKey: "creator",
        header: t("field.creator.label"),
        Cell: ({ row }) => row.original.creator.name,
      },
      {
        accessorKey: "expirationDate",
        header: t("field.expirationDate.label"),
        Cell: ({ row }) => dayjs(row.original.expirationDate).fromNow(false),
      },
    ],
    [t],
  );

  const table = useTranslatedMantineReactTable({
    columns,
    data,
    positionActionsColumn: "last",
    renderRowActions: RenderRowActions,
    enableRowSelection: true,
    enableColumnOrdering: true,
    enableGlobalFilter: false,
    enableRowActions: true,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    layoutMode: "grid-no-grow",
    getRowId: (row) => row.id,
    renderTopToolbarCustomActions: RenderTopToolbarCustomActions,
    state: {
      isLoading,
    },
    initialState: {
      sorting: [{ id: "expirationDate", desc: false }],
    },
  });

  return (
    <>
      <Title mb="md">{t("title")}</Title>
      <MantineReactTable table={table} />
    </>
  );
};

const RenderTopToolbarCustomActions = () => {
  const t = useScopedI18n("management.page.user.invite");
  const { openModal } = useModalAction(InviteCreateModal);
  const handleNewInvite = useCallback(() => {
    openModal();
  }, [openModal]);

  return <Button onClick={handleNewInvite}>{t("action.new.title")}</Button>;
};

const RenderRowActions = ({ row }: { row: MRT_Row<RouterOutputs["invite"]["getAll"][number]> }) => {
  const t = useScopedI18n("management.page.user.invite");
  const { mutate, isPending } = clientApi.invite.deleteInvite.useMutation();
  const utils = clientApi.useUtils();
  const { openConfirmModal } = useConfirmModal();
  const handleDelete = useCallback(() => {
    openConfirmModal({
      title: t("action.delete.title"),
      children: t("action.delete.description"),
      onConfirm: () => {
        mutate({ id: row.original.id });
        void utils.invite.getAll.invalidate();
      },
    });
  }, [openConfirmModal, row.original.id, mutate, utils, t]);

  return (
    <ActionIcon variant="subtle" color="red" onClick={handleDelete} loading={isPending}>
      <IconTrash color="red" size={20} stroke={1.5} />
    </ActionIcon>
  );
};
