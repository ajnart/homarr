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
import { modals } from '@mantine/modals';
import { IconDotsVertical, IconShare3 } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { CategorySection } from '~/components/Board/context';

import { useCardStyles } from '../../../layout/Common/useCardStyles';
import { useEditModeStore } from '../../Views/useEditModeStore';
import { WrapperContent } from '../WrapperContent';
import { useGridstack } from '../gridstack/use-gridstack';
import { CategoryEditMenu } from './CategoryEditMenu';

interface DashboardCategoryProps {
  section: CategorySection;
}

export const DashboardCategory = ({ section }: DashboardCategoryProps) => {
  const { refs } = useGridstack({ section });
  const isEditMode = useEditModeStore((x) => x.enabled);
  const { classes: cardClasses, cx } = useCardStyles(true);
  const { classes } = useStyles();
  const { t } = useTranslation(['layout/common', 'common']);

  //const categoryList = config?.categories.map((x) => x.name) ?? [];
  /*const [toggledCategories, setToggledCategories] = useLocalStorage({
    key: `${config?.configProperties.name}-app-shelf-toggled`,
    // This is a bit of a hack to toggle the categories on the first load, return a string[] of the categories
    defaultValue: categoryList,
  });*/

  /*const handleMenuClick = () => {
    for (let i = 0; i < apps.length; i += 1) {
      const app = apps[i];
      const popUp = window.open(app.url, app.id);

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

  // value={isEditMode ? categoryList : toggledCategories}
  /*
  onChange={(state) => {
        // Cancel if edit mode is on
        if (isEditMode) return;
        setToggledCategories([...state]);
      }}
      */

  return (
    <Accordion
      classNames={{
        item: cx(cardClasses.card, 'dashboard-gs-category'),
      }}
      mx={10}
      chevronPosition="left"
      multiple
      variant="separated"
      radius="lg"
    >
      <Accordion.Item value={section.name}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Accordion.Control icon={isEditMode && <CategoryEditMenu category={section} />}>
            <Title order={3}>{section.name}</Title>
          </Accordion.Control>
          {!isEditMode && (
            <Menu withArrow withinPortal>
              <Menu.Target>
                <ActionIcon variant="light" mr="md">
                  <IconDotsVertical />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  onClick={/*handleMenuClick*/ undefined}
                  icon={<IconShare3 size="1rem" />}
                >
                  {t('actions.category.openAllInNewTab')}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Box>
        <Accordion.Panel>
          <div
            className="grid-stack grid-stack-category"
            data-category={section.id}
            ref={refs.wrapper}
          >
            <WrapperContent items={section.items} refs={refs} />
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
