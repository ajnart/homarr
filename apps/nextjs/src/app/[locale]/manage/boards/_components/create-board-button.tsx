"use client";

import { Affix, Button, Menu } from "@mantine/core";
import { IconCategoryPlus, IconChevronDown, IconFileImport } from "@tabler/icons-react";

import { useModalAction } from "@homarr/modals";
import { AddBoardModal, ImportBoardModal } from "@homarr/modals-collection";
import { useI18n } from "@homarr/translation/client";

export const CreateBoardButton = () => {
  const t = useI18n();
  const { openModal: openAddModal } = useModalAction(AddBoardModal);
  const { openModal: openImportModal } = useModalAction(ImportBoardModal);

  const buttonGroupContent = (
    <>
      <Button leftSection={<IconCategoryPlus size="1rem" />} onClick={openAddModal}>
        {t("management.page.board.action.new.label")}
      </Button>
      <Menu position="bottom-end">
        <Menu.Target>
          <Button px="xs" ms={1}>
            <IconChevronDown size="1rem" />
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item onClick={openImportModal} leftSection={<IconFileImport size="1rem" />}>
            {t("board.action.oldImport.label")}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );

  return (
    <>
      <Button.Group visibleFrom="md">{buttonGroupContent}</Button.Group>
      <Affix hiddenFrom="md" position={{ bottom: 20, right: 20 }}>
        <Button.Group>{buttonGroupContent}</Button.Group>
      </Affix>
    </>
  );
};
