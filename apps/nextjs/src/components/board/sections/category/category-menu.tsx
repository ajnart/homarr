"use client";

import React, { useMemo } from "react";
import { ActionIcon, Menu } from "@mantine/core";
import {
  IconDotsVertical,
  IconEdit,
  IconExternalLink,
  IconRowInsertBottom,
  IconRowInsertTop,
  IconTransitionBottom,
  IconTransitionTop,
  IconTrash,
} from "@tabler/icons-react";

import { useEditMode } from "@homarr/boards/edit-mode";
import type { MaybePromise } from "@homarr/common/types";
import { useScopedI18n } from "@homarr/translation/client";
import type { TablerIcon } from "@homarr/ui";

import type { CategorySection } from "~/app/[locale]/boards/_types";
import { useCategoryMenuActions } from "./category-menu-actions";

interface Props {
  category: CategorySection;
}

export const CategoryMenu = ({ category }: Props) => {
  const actions = useActions(category);
  const t = useScopedI18n("section.category");

  return (
    <Menu withArrow>
      <Menu.Target>
        <ActionIcon mr="sm" variant="transparent">
          <IconDotsVertical size={20} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {actions.map((action) => {
          return (
            <React.Fragment key={action.label}>
              {"group" in action && <Menu.Label>{t(action.group)}</Menu.Label>}
              <Menu.Item
                leftSection={<action.icon size="1rem" />}
                onClick={action.onClick}
                color={"color" in action ? action.color : undefined}
              >
                {t(action.label)}
              </Menu.Item>
            </React.Fragment>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
};

const useActions = (category: CategorySection) => {
  const [isEditMode] = useEditMode();
  const editModeActions = useEditModeActions(category);
  const nonEditModeActions = useNonEditModeActions(category);

  return useMemo(
    () => (isEditMode ? editModeActions : nonEditModeActions),
    [isEditMode, editModeActions, nonEditModeActions],
  );
};

const useEditModeActions = (category: CategorySection) => {
  const { addCategoryAbove, addCategoryBelow, moveCategoryUp, moveCategoryDown, edit, remove } =
    useCategoryMenuActions(category);

  return [
    {
      icon: IconEdit,
      label: "action.edit",
      onClick: edit,
    },
    {
      icon: IconTrash,
      color: "red",
      label: "action.remove",
      onClick: remove,
    },
    {
      group: "menu.label.changePosition",
      icon: IconTransitionTop,
      label: "action.moveUp",
      onClick: moveCategoryUp,
    },
    {
      icon: IconTransitionBottom,
      label: "action.moveDown",
      onClick: moveCategoryDown,
    },
    {
      group: "menu.label.create",
      icon: IconRowInsertTop,
      label: "action.createAbove",
      onClick: addCategoryAbove,
    },
    {
      icon: IconRowInsertBottom,
      label: "action.createBelow",
      onClick: addCategoryBelow,
    },
  ] as const satisfies ActionDefinition[];
};

const useNonEditModeActions = (category: CategorySection) => {
  const { openAllInNewTabs } = useCategoryMenuActions(category);
  return [
    {
      icon: IconExternalLink,
      label: "action.openAllInNewTabs",
      onClick: openAllInNewTabs,
    },
  ] as const satisfies ActionDefinition[];
};

interface ActionDefinition {
  icon: TablerIcon;
  label: string;
  onClick: () => MaybePromise<void>;
  color?: string;
  group?: string;
}
