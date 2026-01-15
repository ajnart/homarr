import { Button, Group, InputWrapper, Slider, Stack, Switch, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";

import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useZodForm } from "@homarr/form";
import { createModal } from "@homarr/modals";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useI18n } from "@homarr/translation/client";
import { boardColumnCountSchema, boardCreateSchema, boardNameSchema } from "@homarr/validation/board";

export const AddBoardModal = createModal(({ actions }) => {
  const t = useI18n();
  const form = useZodForm(boardCreateSchema, {
    mode: "controlled",
    initialValues: {
      name: "",
      columnCount: 10,
      isPublic: false,
    },
  });
  const { mutate, isPending } = clientApi.board.createBoard.useMutation({
    onSettled: async () => {
      await revalidatePathActionAsync("/manage/boards");
    },
  });

  const boardNameStatus = useBoardNameStatus(form.values.name);

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        // Prevent submit before name availability check
        if (!boardNameStatus.canSubmit) return;
        mutate(values, {
          onSuccess: () => {
            actions.closeModal();
            showSuccessNotification({
              title: "Board created",
              message: `Board ${values.name} has been created`,
            });
          },
          onError() {
            showErrorNotification({
              title: "Failed to create board",
              message: `Board ${values.name} could not be created`,
            });
          },
        });
      })}
    >
      <Stack>
        <TextInput
          label={t("board.field.name.label")}
          data-autofocus
          {...form.getInputProps("name")}
          description={
            boardNameStatus.description ? (
              <Group c={boardNameStatus.description.color} gap="xs" align="center">
                {boardNameStatus.description.icon ? <boardNameStatus.description.icon size={16} /> : null}
                <span>{boardNameStatus.description.label}</span>
              </Group>
            ) : null
          }
        />
        <InputWrapper label={t("board.field.columnCount.label")} {...form.getInputProps("columnCount")}>
          <Slider
            min={boardColumnCountSchema.minValue ?? undefined}
            max={boardColumnCountSchema.maxValue ?? undefined}
            step={1}
            {...form.getInputProps("columnCount")}
          />
        </InputWrapper>

        <Switch
          label={t("board.field.isPublic.label")}
          description={t("board.field.isPublic.description")}
          {...form.getInputProps("isPublic")}
        />

        <Group justify="right">
          <Button onClick={actions.closeModal} variant="subtle" color="gray">
            {t("common.action.cancel")}
          </Button>
          <Button type="submit" loading={isPending}>
            {t("common.action.create")}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}).withOptions({
  defaultTitle: (t) => t("management.page.board.action.new.label"),
});

export const useBoardNameStatus = (name: string) => {
  const t = useI18n();
  const [debouncedName] = useDebouncedValue(name, 250);
  const { data: boardExists, isLoading } = clientApi.board.exists.useQuery(debouncedName, {
    enabled: boardNameSchema.safeParse(debouncedName).success,
  });

  return {
    canSubmit: !boardExists && !isLoading,
    description:
      debouncedName.trim() === ""
        ? undefined
        : isLoading
          ? {
              label: "Checking availability...",
            }
          : boardExists === undefined
            ? undefined
            : boardExists
              ? {
                  icon: IconAlertTriangle,
                  label: t("common.zod.errors.custom.boardAlreadyExists"), // The board ${debouncedName} already exists
                  color: "red",
                }
              : {
                  icon: IconCircleCheck,
                  label: `${debouncedName} is available`,
                  color: "green",
                },
  };
};
