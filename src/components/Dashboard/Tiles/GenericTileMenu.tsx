import { ActionIcon, Menu } from '@mantine/core';
import { IconDots, IconLayoutKanban, IconPencil, IconTrash } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { useEditModeStore } from '../Views/useEditModeStore';

interface GenericTileMenuProps {
  handleClickEdit: () => void;
  handleClickChangePosition: () => void;
  handleClickDelete: () => void;
  displayEdit: boolean;
}

export const GenericTileMenu = ({
  handleClickEdit,
  handleClickChangePosition,
  handleClickDelete,
  displayEdit,
}: GenericTileMenuProps) => {
  const { t } = useTranslation('common');
  const isEditMode = useEditModeStore((x) => x.enabled);

  if (!isEditMode) {
    return null;
  }

  return (
    <Menu withinPortal withArrow position="right-start">
      <Menu.Target>
        <ActionIcon pos="absolute" top={4} right={4}>
          <IconDots />
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
