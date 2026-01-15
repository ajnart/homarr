"use client";

import { useCallback, useMemo } from "react";
import { ActionIcon, Button, Group, Stack, Text, Title } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import type { MRT_ColumnDef } from "mantine-react-table";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useConfirmModal, useModalAction } from "@homarr/modals";
import { useScopedI18n } from "@homarr/translation/client";
import { UserAvatar } from "@homarr/ui";

import { CopyApiKeyModal } from "~/app/[locale]/manage/tools/api/components/copy-api-key-modal";

interface ApiKeysManagementProps {
  apiKeys: RouterOutputs["apiKeys"]["getAll"];
}

export const ApiKeysManagement = ({ apiKeys }: ApiKeysManagementProps) => {
  const { openModal } = useModalAction(CopyApiKeyModal);
  const { openConfirmModal } = useConfirmModal();
  const { mutate: mutateCreate, isPending: isPendingCreate } = clientApi.apiKeys.create.useMutation({
    async onSuccess(data) {
      openModal({
        apiKey: data.apiKey,
      });
      await revalidatePathActionAsync("/manage/tools/api");
    },
  });
  const { mutateAsync: mutateDeleteAsync, isPending: isPendingDelete } = clientApi.apiKeys.delete.useMutation({
    async onSuccess() {
      await revalidatePathActionAsync("/manage/tools/api");
    },
  });

  const t = useScopedI18n("management.page.tool.api.tab.apiKey");
  const handleDelete = useCallback(
    (id: string) => {
      openConfirmModal({
        title: t("modal.delete.title"),
        children: t("modal.delete.text"),
        // eslint-disable-next-line no-restricted-syntax
        async onConfirm() {
          await mutateDeleteAsync({ apiKeyId: id });
        },
      });
    },
    [t, openConfirmModal, mutateDeleteAsync],
  );

  const columns = useMemo<MRT_ColumnDef<RouterOutputs["apiKeys"]["getAll"][number]>[]>(
    () => [
      {
        accessorKey: "id",
        header: t("table.header.id"),
      },
      {
        accessorKey: "user",
        header: t("table.header.createdBy"),
        Cell: ({ row }) => (
          <Group gap={"xs"}>
            <UserAvatar user={row.original.user} size={"sm"} />
            <Text>{row.original.user.name}</Text>
          </Group>
        ),
      },
      {
        header: t("table.header.actions"),
        Cell: ({ row }) => (
          <Group gap="xs">
            <ActionIcon onClick={() => handleDelete(row.original.id)} loading={isPendingDelete} c="red">
              <IconTrash size="1rem" />
            </ActionIcon>
          </Group>
        ),
      },
    ],
    [t, handleDelete, isPendingDelete],
  );

  const table = useMantineReactTable({
    columns,
    data: apiKeys,
    renderTopToolbarCustomActions: () => (
      <Button
        onClick={() => {
          mutateCreate();
        }}
        loading={isPendingCreate}
      >
        {t("button.createApiToken")}
      </Button>
    ),
    enableDensityToggle: false,
    state: {
      density: "xs",
    },
  });

  return (
    <Stack>
      <Title>{t("title")}</Title>
      <MantineReactTable table={table} />
    </Stack>
  );
};
