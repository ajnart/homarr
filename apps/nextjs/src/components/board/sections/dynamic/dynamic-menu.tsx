import { ActionIcon, Menu } from "@mantine/core";
import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";

import { useEditMode } from "@homarr/boards/edit-mode";
import { useConfirmModal, useModalAction } from "@homarr/modals";
import { useI18n, useScopedI18n } from "@homarr/translation/client";

import type { DynamicSectionItem } from "~/app/[locale]/boards/_types";
import { useDynamicSectionActions } from "./dynamic-actions";
import { DynamicSectionEditModal } from "./dynamic-edit-modal";

export const BoardDynamicSectionMenu = ({ section }: { section: DynamicSectionItem }) => {
  const t = useI18n();
  const tDynamic = useScopedI18n("section.dynamic");
  const tItem = useScopedI18n("item");
  const { openModal } = useModalAction(DynamicSectionEditModal);
  const { updateDynamicSection, removeDynamicSection } = useDynamicSectionActions();
  const { openConfirmModal } = useConfirmModal();
  const [isEditMode] = useEditMode();

  if (!isEditMode) return null;

  const openEditModal = () => {
    openModal({
      value: section.options,
      onSuccessfulEdit: (options) => {
        updateDynamicSection({
          itemId: section.id,
          newOptions: options,
        });
      },
    });
  };

  const openRemoveModal = () => {
    openConfirmModal({
      title: tDynamic("remove.title"),
      children: tDynamic("remove.message"),
      onConfirm: () => {
        removeDynamicSection({ id: section.id });
      },
    });
  };

  return (
    <Menu withinPortal withArrow position="right-start" arrowPosition="center">
      <Menu.Target>
        <ActionIcon variant="default" radius={"xl"} pos="absolute" top={4} right={4} style={{ zIndex: 10 }}>
          <IconDotsVertical size={"1rem"} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown miw={128}>
        <Menu.Label>{tItem("menu.label.settings")}</Menu.Label>
        <Menu.Item leftSection={<IconPencil size={16} />} onClick={openEditModal}>
          {tItem("action.edit")}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Label c="red.6">{t("common.dangerZone")}</Menu.Label>
        <Menu.Item c="red.6" leftSection={<IconTrash size={16} />} onClick={openRemoveModal}>
          {tDynamic("action.remove")}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
