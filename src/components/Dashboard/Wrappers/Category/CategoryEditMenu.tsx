import { ActionIcon, Menu } from '@mantine/core';
import {
  IconEdit,
  IconRowInsertBottom,
  IconRowInsertTop,
  IconSettings,
  IconTransitionBottom,
  IconTransitionTop,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '~/config/provider';
import { CategoryType } from '~/types/category';

import { useCategoryActions } from './useCategoryActions';

interface CategoryEditMenuProps {
  category: CategoryType;
}

export const CategoryEditMenu = ({ category }: CategoryEditMenuProps) => {
  const { name: configName } = useConfigContext();
  const { addCategoryAbove, addCategoryBelow, moveCategoryUp, moveCategoryDown, edit, remove } =
    useCategoryActions(configName, category);
  const { t } = useTranslation(['layout/common', 'common']);

  return (
    <Menu withinPortal withArrow>
      <Menu.Target>
        <ActionIcon>
          <IconSettings />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item icon={<IconEdit size={20} />} onClick={edit}>
          {t('common:edit')}
        </Menu.Item>
        <Menu.Item icon={<IconTrash size={20} />} onClick={remove}>
          {t('common:remove')}
        </Menu.Item>
        <Menu.Label>{t('common:changePosition')}</Menu.Label>
        <Menu.Item icon={<IconTransitionTop size={20} />} onClick={moveCategoryUp}>
          {t('menu.moveUp')}
        </Menu.Item>
        <Menu.Item icon={<IconTransitionBottom size={20} />} onClick={moveCategoryDown}>
          {t('menu.moveDown')}
        </Menu.Item>
        <Menu.Label>{t('menu.addCategory', { location: '' })}</Menu.Label>
        <Menu.Item icon={<IconRowInsertTop size={20} />} onClick={addCategoryAbove}>
          {t('menu.addCategory', { location: t('menu.addAbove') })}
        </Menu.Item>
        <Menu.Item icon={<IconRowInsertBottom size={20} />} onClick={addCategoryBelow}>
          {t('menu.addCategory', { location: t('menu.addBelow') })}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
