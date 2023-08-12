import { ActionIcon, Menu } from '@mantine/core';
import { IconLayoutKanban, IconPencil, IconSettings, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

import { useColorTheme } from '../../../tools/color';
import { useEditModeStore } from '../Views/useEditModeStore';

interface GenericTileMenuProps {
  handleClickEdit: () => void;
  handleClickChangePosition: () => void;
  handleClickDelete: () => void;
  displayEdit: boolean;
}

export const GenericTileMenu = (
  {
    handleClickEdit,
    handleClickChangePosition,
    handleClickDelete,
    displayEdit,
  }: GenericTileMenuProps
) => {
  const { t } = useTranslation('common');
  const isEditMode = useEditModeStore((x) => x.enabled);
  const { primaryColor } = useColorTheme();

  if (!isEditMode) {
    return null;
  }

  return (
    <Menu withinPortal withArrow position="right">
      <Menu.Target>
        <ActionIcon
          style={{ zIndex: 1 }}
          size="md"
          radius="md"
          variant="light"
          pos="absolute"
          top={8}
          right={8}
        >
          <IconSettings />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown w={250}>
        <Menu.Label>{t('sections.settings')}</Menu.Label>
        {displayEdit && (
          <Menu.Item icon={<IconPencil size={16} stroke={1.5} />} onClick={handleClickEdit}>
            {t('edit')}
          </Menu.Item>
        )}
        <Menu.Item
          icon={<IconLayoutKanban size={16} stroke={1.5} />}
          onClick={handleClickChangePosition}
        >
          {t('changePosition')}
        </Menu.Item>
        <Menu.Label>{t('sections.dangerZone')}</Menu.Label>
        <Menu.Item
          color="red"
          icon={<IconTrash size={16} stroke={1.5} color="red" />}
          onClick={handleClickDelete}
        >
          {t('remove')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
