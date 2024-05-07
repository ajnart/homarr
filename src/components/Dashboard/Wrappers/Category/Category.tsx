import {
  Accordion,
  ActionIcon,
  Box,
  List,
  Menu,
  Stack,
  Text,
  Title,
  createStyles,
} from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconDotsVertical, IconShare3 } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '~/config/provider';
import { useGetExternalUrl } from '~/hooks/useExternalUrl';
import { CategoryType } from '~/types/category';

import { useCardStyles } from '../../../layout/Common/useCardStyles';
import { useEditModeStore } from '../../Views/useEditModeStore';
import { WrapperContent } from '../WrapperContent';
import { useGridstack } from '../gridstack/use-gridstack';
import { CategoryEditMenu } from './CategoryEditMenu';

interface DashboardCategoryProps {
  category: CategoryType;
}

export const DashboardCategory = ({ category }: DashboardCategoryProps) => {
  const { refs, apps, widgets } = useGridstack('category', category.id);
  const isEditMode = useEditModeStore((x) => x.enabled);
  const { config } = useConfigContext();
  const { classes: cardClasses, cx } = useCardStyles(true);
  const { classes } = useStyles();
  const { t } = useTranslation(['layout/common', 'common']);
  const getAppUrl = useGetExternalUrl();

  const categoryList = config?.categories.map((x) => x.name) ?? [];
  const [toggledCategories, setToggledCategories] = useLocalStorage({
    key: `${config?.configProperties.name}-app-shelf-toggled`,
    // This is a bit of a hack to toggle the categories on the first load, return a string[] of the categories
    defaultValue: categoryList,
  });

  const handleMenuClick = () => {
    for (let i = 0; i < apps.length; i += 1) {
      const app = apps[i];
      const appUrl = getAppUrl(app);
      const popUp = window.open(appUrl, app.id);

      if (popUp === null) {
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
    }
  };

  return (
    <Accordion
      classNames={{
        item: cx(cardClasses.card, 'dashboard-gs-category'),
      }}
      mx={10}
      chevronPosition="left"
      multiple
      value={isEditMode ? categoryList : toggledCategories}
      variant="separated"
      radius="lg"
      onChange={(state) => {
        // Cancel if edit mode is on
        if (isEditMode) return;
        setToggledCategories([...state]);
      }}
    >
      <Accordion.Item value={category.name}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Accordion.Control>
            <Title order={3}>{category.name}</Title>
          </Accordion.Control>
          {!isEditMode ? (
            <Menu withArrow withinPortal>
              <Menu.Target>
                <ActionIcon variant="light" mr="md">
                  <IconDotsVertical />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={handleMenuClick} icon={<IconShare3 size="1rem" />}>
                  {t('actions.category.openAllInNewTab')}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <CategoryEditMenu category={category} />
          )}
        </Box>
        <Accordion.Panel>
          <div
            className="grid-stack grid-stack-category"
            data-category={category.id}
            ref={refs.wrapper}
          >
            <WrapperContent apps={apps} refs={refs} widgets={widgets} />
          </div>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

const useStyles = createStyles(() => ({
  listItem: {
    '& div': {
      maxWidth: 'calc(100% - 23px)',
    },
  },
}));
