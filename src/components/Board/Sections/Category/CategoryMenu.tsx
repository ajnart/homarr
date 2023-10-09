import { ActionIcon, List, Menu, Stack, Text, createStyles } from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconDotsVertical,
  IconEdit,
  IconRowInsertBottom,
  IconRowInsertTop,
  IconSettings,
  IconShare3,
  IconTransitionBottom,
  IconTransitionTop,
  IconTrash,
  TablerIconsProps,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo } from 'react';
import { useEditModeStore } from '~/components/Dashboard/Views/useEditModeStore';

import { AppItem, CategorySection } from '../../context';
import { useCategoryMenuActions } from './Actions/category-menu-actions';

type CategoryMenuProps = {
  category: CategorySection;
};

export const CategoryMenu = ({ category }: CategoryMenuProps) => {
  const isEditMode = useEditModeStore((x) => x.enabled);
  const editModeActions = useEditModeActions(category);
  const nonEditModeActions = useNonEditModeActions(category);
  const { t } = useTranslation(['layout/common', 'boards/common', 'common']);

  const Icon = isEditMode ? IconSettings : IconDotsVertical;
  const actions = isEditMode ? editModeActions : nonEditModeActions;

  return (
    <Menu withArrow withinPortal>
      <Menu.Target>
        <ActionIcon mr="md">
          <Icon />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {actions.map((action) => (
          <>
            {action.group && <Menu.Label key={action.group}>{t(action.group)}</Menu.Label>}
            <Menu.Item
              key={action.label}
              icon={<action.icon size="1rem" />}
              onClick={action.onClick}
              color={action.color}
            >
              {t(action.label)}
            </Menu.Item>
          </>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

const useEditModeActions = (category: CategorySection): ActionDefinition[] => {
  const { addCategoryAbove, addCategoryBelow, moveCategoryUp, moveCategoryDown, edit, remove } =
    useCategoryMenuActions(category);

  return [
    {
      icon: IconEdit,
      label: 'common:edit',
      onClick: edit,
    },
    {
      icon: IconTrash,
      color: 'red',
      label: 'common:remove',
      onClick: remove,
    },
    {
      group: 'common:changePosition',
      icon: IconTransitionTop,
      label: 'menu.moveUp',
      onClick: moveCategoryUp,
    },
    {
      icon: IconTransitionBottom,
      label: 'menu.moveDown',
      onClick: moveCategoryDown,
    },
    {
      group: 'boards/common:category.actions.add',
      icon: IconRowInsertTop,
      label: 'boards/common:category.actions.addAbove',
      onClick: addCategoryAbove,
    },
    {
      icon: IconRowInsertBottom,
      label: 'boards/common:category.actions.addBelow',
      onClick: addCategoryBelow,
    },
  ];
};

const useNonEditModeActions = (category: CategorySection): ActionDefinition[] => {
  const openAllApps = useOpenAllApps();
  const apps = useMemo(
    () => category.items.filter((x): x is AppItem => x.type === 'app'),
    [category.items.length]
  );

  return [
    {
      icon: IconShare3,
      label: 'actions.category.openAllInNewTab',
      onClick: openAllApps(apps),
    },
  ];
};

type ActionDefinition = {
  icon: (props: TablerIconsProps) => JSX.Element;
  label: string;
  onClick: () => void;
  color?: string;
  group?: string;
};

const useStyles = createStyles(() => ({
  listItem: {
    '& div': {
      maxWidth: 'calc(100% - 23px)',
    },
  },
}));

const useOpenAllApps = () => {
  const { classes } = useStyles();
  const { t } = useTranslation(['layout/common', 'common']);

  return useCallback((apps: AppItem[]) => {
    return () => {
      for (let i = 0; i < apps.length; i += 1) {
        const app = apps[i];
        const popUp = window.open(app.externalUrl ?? app.internalUrl, app.id);

        if (popUp !== null) continue;

        modals.openConfirmModal({
          title: <Text weight="bold">{t('modals.blockedPopups.title')}</Text>,
          children: (
            <Stack maw="100%">
              <Text>{t('modals.blockedPopups.text')}</Text>
              <List>
                <List.Item className={classes.listItem}>
                  {t('modals.blockedPopups.list.browserPermission')}
                </List.Item>
                <List.Item className={classes.listItem}>
                  {t('modals.blockedPopups.list.adBlockers')}
                </List.Item>
                <List.Item className={classes.listItem}>
                  {t('modals.blockedPopups.list.otherBrowser')}
                </List.Item>
              </List>
            </Stack>
          ),
          labels: {
            confirm: t('common:close'),
            cancel: '',
          },
          cancelProps: {
            display: 'none',
          },
          closeOnClickOutside: false,
        });
        break;
      }
    };
  }, []);
};
