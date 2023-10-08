import { Accordion, Group, List, Stack, Text, Title, createStyles } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo } from 'react';
import { AppItem, CategorySection } from '~/components/Board/context';

import { useEditModeStore } from '../../Dashboard/Views/useEditModeStore';
import { WrapperContent } from '../../Dashboard/Wrappers/WrapperContent';
import { useGridstack } from '../../Dashboard/Wrappers/gridstack/use-gridstack';
import { useCardStyles } from '../../layout/Common/useCardStyles';
import { CategoryMenu } from './Category/CategoryMenu';

interface DashboardCategoryProps {
  section: CategorySection;
  isOpened: boolean;
  toggle: (categoryId: string) => void;
}

export const BoardCategorySection = ({ section, isOpened, toggle }: DashboardCategoryProps) => {
  const { refs } = useGridstack({ section });
  const isEditMode = useEditModeStore((x) => x.enabled);
  const { classes: cardClasses, cx } = useCardStyles(true);
  const { t } = useTranslation(['layout/common', 'common']);
  const openAllApps = useOpenAllApps();
  const apps = useMemo(
    () => section.items.filter((x): x is AppItem => x.type === 'app'),
    [section.items.length]
  );

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
      value={isOpened || isEditMode ? [section.id] : []}
      onChange={() => !isEditMode && toggle(section.id)}
    >
      <Accordion.Item value={section.id}>
        <Group noWrap align="center">
          <Accordion.Control>
            <Title order={3}>{section.name}</Title>
          </Accordion.Control>
          <CategoryMenu category={section} />
        </Group>
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
