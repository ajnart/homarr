"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, Divider, Group, Stack, Text } from "@mantine/core";

import { clientApi } from "@homarr/api/client";
import { useRequiredBoard } from "@homarr/boards/context";
import { useConfirmModal, useModalAction } from "@homarr/modals";
import { useScopedI18n } from "@homarr/translation/client";

import { BoardRenameModal } from "~/components/board/modals/board-rename-modal";
import classes from "./danger.module.css";

export const DangerZoneSettingsContent = ({ hideVisibility }: { hideVisibility: boolean }) => {
  const board = useRequiredBoard();
  const t = useScopedI18n("board.setting");
  const router = useRouter();
  const { openConfirmModal } = useConfirmModal();
  const { openModal } = useModalAction(BoardRenameModal);
  const { mutate: changeVisibility, isPending: isChangeVisibilityPending } =
    clientApi.board.changeBoardVisibility.useMutation();
  const { mutate: deleteBoard, isPending: isDeletePending } = clientApi.board.deleteBoard.useMutation();
  const utils = clientApi.useUtils();
  const visibility = board.isPublic ? "public" : "private";

  const onRenameClick = useCallback(
    () =>
      openModal({
        id: board.id,
        previousName: board.name,
        onSuccess: (name) => router.push(`/boards/${name}/settings`),
      }),
    [board.id, board.name, router, openModal],
  );

  const onVisibilityClick = useCallback(() => {
    openConfirmModal({
      title: t(`section.dangerZone.action.visibility.confirm.${visibility}.title`),
      children: t(`section.dangerZone.action.visibility.confirm.${visibility}.description`),
      onConfirm: () => {
        changeVisibility(
          {
            id: board.id,
            visibility: visibility === "public" ? "private" : "public",
          },
          {
            onSettled() {
              void utils.board.getBoardByName.invalidate({ name: board.name });
              void utils.board.getHomeBoard.invalidate();
            },
          },
        );
      },
    });
  }, [
    board.id,
    board.name,
    changeVisibility,
    t,
    utils.board.getBoardByName,
    utils.board.getHomeBoard,
    visibility,
    openConfirmModal,
  ]);

  const onDeleteClick = useCallback(() => {
    openConfirmModal({
      title: t("section.dangerZone.action.delete.confirm.title"),
      children: t("section.dangerZone.action.delete.confirm.description"),
      onConfirm: () => {
        deleteBoard(
          { id: board.id },
          {
            onSettled: () => {
              router.push("/");
            },
          },
        );
      },
    });
  }, [board.id, deleteBoard, router, t, openConfirmModal]);

  return (
    <Stack gap="sm">
      <Divider />
      <DangerZoneRow
        label={t("section.dangerZone.action.rename.label")}
        description={t("section.dangerZone.action.rename.description")}
        buttonText={t("section.dangerZone.action.rename.button")}
        onClick={onRenameClick}
      />
      {hideVisibility ? null : (
        <>
          <Divider />
          <DangerZoneRow
            label={t("section.dangerZone.action.visibility.label")}
            description={t(`section.dangerZone.action.visibility.description.${visibility}`)}
            buttonText={t(`section.dangerZone.action.visibility.button.${visibility}`)}
            onClick={onVisibilityClick}
            isPending={isChangeVisibilityPending}
          />
        </>
      )}
      <Divider />
      <DangerZoneRow
        label={t("section.dangerZone.action.delete.label")}
        description={t("section.dangerZone.action.delete.description")}
        buttonText={t("section.dangerZone.action.delete.button")}
        onClick={onDeleteClick}
        isPending={isDeletePending}
      />
    </Stack>
  );
};

interface DangerZoneRowProps {
  label: string;
  description: string;
  buttonText: string;
  isPending?: boolean;
  onClick: () => void;
}

const DangerZoneRow = ({ label, description, buttonText, onClick, isPending }: DangerZoneRowProps) => {
  return (
    <Group justify="space-between" px="md" className={classes.dangerZoneGroup}>
      <Stack gap={0}>
        <Text fw="bold" size="sm">
          {label}
        </Text>
        <Text size="sm">{description}</Text>
      </Stack>
      <Group justify="end" w={{ base: "100%", xs: "auto" }}>
        <Button variant="subtle" color="red" loading={isPending} onClick={onClick}>
          {buttonText}
        </Button>
      </Group>
    </Group>
  );
};
