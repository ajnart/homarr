import { useEffect, useMemo, useRef } from "react";
import { ActionIcon, Menu } from "@mantine/core";
import { IconCopy, IconDotsVertical, IconLayoutKanban, IconPencil, IconTrash } from "@tabler/icons-react";

import { clientApi } from "@homarr/api/client";
import { useEditMode } from "@homarr/boards/edit-mode";
import { useConfirmModal, useModalAction } from "@homarr/modals";
import { useSettings } from "@homarr/settings";
import { useI18n, useScopedI18n } from "@homarr/translation/client";
import { widgetImports } from "@homarr/widgets";
import { WidgetEditModal } from "@homarr/widgets/modals";

import type { SectionItem } from "~/app/[locale]/boards/_types";
import { useSectionContext } from "../sections/section-context";
import { useItemActions } from "./item-actions";
import { ItemMoveModal } from "./item-move-modal";

export const BoardItemMenu = ({
  offset,
  item,
  resetErrorBoundary,
}: {
  offset: number;
  item: SectionItem;
  resetErrorBoundary?: () => void;
}) => {
  const refResetErrorBoundaryOnNextRender = useRef(false);
  const tItem = useScopedI18n("item");
  const t = useI18n();
  const { openModal } = useModalAction(WidgetEditModal);
  const { openModal: openMoveModal } = useModalAction(ItemMoveModal);
  const { openConfirmModal } = useConfirmModal();
  const [isEditMode] = useEditMode();
  const { updateItemOptions, updateItemAdvancedOptions, updateItemIntegrations, duplicateItem, removeItem } =
    useItemActions();
  const { data: integrationData, isPending } = clientApi.integration.all.useQuery();
  const currentDefinition = useMemo(() => widgetImports[item.kind].definition, [item.kind]);
  const { gridstack } = useSectionContext().refs;
  const settings = useSettings();

  // Reset error boundary on next render if item has been edited
  useEffect(() => {
    if (refResetErrorBoundaryOnNextRender.current) {
      resetErrorBoundary?.();
      refResetErrorBoundaryOnNextRender.current = false;
    }
  }, [item, resetErrorBoundary]);

  if (!isEditMode || isPending) return null;

  const openEditModal = () => {
    openModal(
      {
        kind: item.kind,
        value: {
          advancedOptions: item.advancedOptions,
          options: item.options,
          integrationIds: item.integrationIds,
        },
        onSuccessfulEdit: ({ options, integrationIds, advancedOptions }) => {
          updateItemOptions({
            itemId: item.id,
            newOptions: options,
          });
          updateItemAdvancedOptions({
            itemId: item.id,
            newAdvancedOptions: advancedOptions,
          });
          updateItemIntegrations({
            itemId: item.id,
            newIntegrations: integrationIds,
          });
          refResetErrorBoundaryOnNextRender.current = true;
        },
        integrationData: (integrationData ?? []).filter(
          (integration) =>
            "supportedIntegrations" in currentDefinition &&
            (currentDefinition.supportedIntegrations as string[]).some((kind) => kind === integration.kind),
        ),
        integrationSupport: "supportedIntegrations" in currentDefinition,
        settings,
      },
      {
        title(t) {
          return `${t("item.edit.title")} - ${t(`widget.${item.kind}.name`)}`;
        },
      },
    );
  };

  const openRemoveModal = () => {
    openConfirmModal({
      title: tItem("remove.title"),
      children: tItem("remove.message"),
      onConfirm: () => {
        removeItem({ itemId: item.id });
      },
    });
  };

  return (
    <Menu withinPortal withArrow position="right-start" arrowPosition="center">
      <Menu.Target>
        <ActionIcon variant="default" radius={"xl"} pos="absolute" top={offset} right={offset} style={{ zIndex: 10 }}>
          <IconDotsVertical size={"1rem"} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown miw={128}>
        <Menu.Label>{tItem("menu.label.settings")}</Menu.Label>
        <Menu.Item leftSection={<IconPencil size={16} />} onClick={openEditModal}>
          {tItem("action.edit")}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconLayoutKanban size={16} />}
          onClick={() => {
            if (!gridstack.current) return;
            openMoveModal({ item, columnCount: gridstack.current.getColumn(), gridStack: gridstack.current });
          }}
        >
          {tItem("action.moveResize")}
        </Menu.Item>
        <Menu.Item leftSection={<IconCopy size={16} />} onClick={() => duplicateItem({ itemId: item.id })}>
          {tItem("action.duplicate")}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Label c="red.6">{t("common.dangerZone")}</Menu.Label>
        <Menu.Item c="red.6" leftSection={<IconTrash size={16} />} onClick={openRemoveModal}>
          {tItem("action.remove")}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
