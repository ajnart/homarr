import { ActionIcon, Menu } from '@mantine/core';
import {
  IconTransitionTop,
  IconTransitionBottom,
  IconRowInsertTop,
  IconRowInsertBottom,
  IconEdit,
  IconTrash,
  IconSettings,
} from '@tabler/icons-react';
import { useConfigContext } from '../../../../config/provider';
import { CategoryType } from '../../../../types/category';
import { useCategoryActions } from './useCategoryActions';

interface CategoryEditMenuProps {
  category: CategoryType;
}

export const CategoryEditMenu = ({ category }: CategoryEditMenuProps) => {
  const { name: configName } = useConfigContext();
  const { addCategoryAbove, addCategoryBelow, moveCategoryUp, moveCategoryDown, edit, remove } =
    useCategoryActions(configName, category);

  return (
    <Menu withinPortal withArrow>
      <Menu.Target>
        <ActionIcon>
          <IconSettings />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item icon={<IconEdit size={20} />} onClick={edit}>
          Edit
        </Menu.Item>
        <Menu.Item icon={<IconTrash size={20} />} onClick={remove}>
          Remove
        </Menu.Item>
        <Menu.Label>Change positon</Menu.Label>
        <Menu.Item icon={<IconTransitionTop size={20} />} onClick={moveCategoryUp}>
          Move up
        </Menu.Item>
        <Menu.Item icon={<IconTransitionBottom size={20} />} onClick={moveCategoryDown}>
          Move down
        </Menu.Item>
        <Menu.Label>Add category</Menu.Label>
        <Menu.Item icon={<IconRowInsertTop size={20} />} onClick={addCategoryAbove}>
          Add category above
        </Menu.Item>
        <Menu.Item icon={<IconRowInsertBottom size={20} />} onClick={addCategoryBelow}>
          Add category below
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
