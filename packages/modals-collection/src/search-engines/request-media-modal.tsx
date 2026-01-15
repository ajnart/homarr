import { useMemo } from "react";
import { Button, Group, Image, LoadingOverlay, Stack, Text } from "@mantine/core";
import type { MRT_ColumnDef } from "mantine-react-table";
import { MRT_Table } from "mantine-react-table";

import { clientApi } from "@homarr/api/client";
import { createModal } from "@homarr/modals";
import { showSuccessNotification } from "@homarr/notifications";
import { useI18n } from "@homarr/translation/client";
import { useTranslatedMantineReactTable } from "@homarr/ui/hooks";

interface RequestMediaModalProps {
  integrationId: string;
  mediaId: number;
  mediaType: "movie" | "tv";
}

export const RequestMediaModal = createModal<RequestMediaModalProps>(({ actions, innerProps }) => {
  const { data, isPending: isPendingQuery } = clientApi.searchEngine.getMediaRequestOptions.useQuery({
    integrationId: innerProps.integrationId,
    mediaId: innerProps.mediaId,
    mediaType: innerProps.mediaType,
  });

  const { mutate, isPending: isPendingMutation } = clientApi.searchEngine.requestMedia.useMutation({
    onSuccess() {
      actions.closeModal();
      showSuccessNotification({
        message: t("common.notification.create.success"),
      });
    },
  });

  const isPending = isPendingQuery || isPendingMutation;
  const t = useI18n();

  const columns = useMemo<MRT_ColumnDef<Season>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("search.engine.media.request.modal.table.header.season"),
      },
      {
        accessorKey: "episodeCount",
        header: t("search.engine.media.request.modal.table.header.episodes"),
      },
    ],
    [],
  );

  const table = useTranslatedMantineReactTable({
    columns,
    data: data && "seasons" in data ? data.seasons : [],
    enableColumnActions: false,
    enableColumnFilters: false,
    enablePagination: false,
    enableSorting: false,
    enableSelectAll: true,
    enableRowSelection: true,
    mantineTableProps: {
      highlightOnHover: false,
      striped: "odd",
      withColumnBorders: true,
      withRowBorders: true,
      withTableBorder: true,
    },
    initialState: {
      density: "xs",
    },
  });

  const anySelected = Object.keys(table.getState().rowSelection).length > 0;

  const handleMutate = () => {
    const selectedSeasons = table.getSelectedRowModel().rows.flatMap((row) => row.original.seasonNumber);
    mutate({
      integrationId: innerProps.integrationId,
      mediaId: innerProps.mediaId,
      mediaType: innerProps.mediaType,
      seasons: selectedSeasons,
    });
  };

  return (
    <Stack>
      <LoadingOverlay visible={isPending} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      {data && (
        <Group wrap="nowrap" align="start">
          <Image
            src={`https://image.tmdb.org/t/p/w600_and_h900_bestv2${data.posterPath}`}
            alt="poster"
            w={100}
            radius="md"
          />
          <Text c="dimmed" style={{ flex: "1" }}>
            {data.overview}
          </Text>
        </Group>
      )}
      {innerProps.mediaType === "tv" && <MRT_Table table={table} />}
      <Group justify="end">
        <Button onClick={actions.closeModal} variant="light">
          {t("common.action.cancel")}
        </Button>
        <Button onClick={handleMutate} disabled={!anySelected && innerProps.mediaType === "tv"}>
          {t("search.engine.media.request.modal.button.send")}
        </Button>
      </Group>
    </Stack>
  );
}).withOptions({
  size: "xl",
});

interface Season {
  id: number;
  seasonNumber: number;
  name: string;
  episodeCount: number;
}
