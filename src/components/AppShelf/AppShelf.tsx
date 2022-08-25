import React, { useState } from 'react';
import { Accordion, Grid, Paper, Stack, useMantineColorScheme } from '@mantine/core';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { useLocalStorage } from '@mantine/hooks';
import { useTranslation } from 'next-i18next';
import { useConfig } from '../../tools/state';

import { SortableAppShelfItem, AppShelfItem } from './AppShelfItem';
import { ModuleMenu, ModuleWrapper } from '../../modules/moduleWrapper';
import { DownloadsModule } from '../../modules';
import DownloadComponent from '../../modules/downloads/DownloadsModule';

const AppShelf = (props: any) => {
  const { config, setConfig } = useConfig();
  // Extract all the categories from the services in config
  const categoryList = config.services.reduce((acc, cur) => {
    if (cur.category && !acc.includes(cur.category)) {
      acc.push(cur.category);
    }
    return acc;
  }, [] as string[]);

  const [toggledCategories, setToggledCategories] = useLocalStorage({
    key: 'app-shelf-toggled',
    // This is a bit of a hack to toggle the categories on the first load, return a string[] of the categories
    defaultValue: categoryList,
  });
  const [activeId, setActiveId] = useState(null);
  const { colorScheme } = useMantineColorScheme();

  const { t } = useTranslation('layout/app-shelf');

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 500,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        delay: 500,
        tolerance: 5,
      },
    })
  );

  function handleDragStart(event: any) {
    const { active } = event;

    setActiveId(active.id);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      const newConfig = { ...config };
      const activeIndex = newConfig.services.findIndex((e) => e.id === active.id);
      const overIndex = newConfig.services.findIndex((e) => e.id === over.id);
      newConfig.services = arrayMove(newConfig.services, activeIndex, overIndex);
      setConfig(newConfig);
    }

    setActiveId(null);
  }

  const getItems = (filter?: string) => {
    // If filter is not set, return all the services without a category or a null category
    let filtered = config.services;
    if (!filter) {
      filtered = config.services.filter((e) => !e.category || e.category === null);
    }
    if (filter) {
      filtered = config.services.filter((e) => e.category === filter);
    }

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={config.services}>
          <Grid gutter="xl" align="center">
            {filtered.map((service) => (
              <Grid.Col
                key={service.id}
                span={6}
                xl={config.settings.appCardWidth || 2}
                xs={4}
                sm={3}
                md={3}
              >
                <SortableAppShelfItem service={service} key={service.id} id={service.id} />
              </Grid.Col>
            ))}
          </Grid>
        </SortableContext>
        <DragOverlay
          style={{
            // Add a shadow to the drag overlay
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
          }}
        >
          {activeId ? (
            <AppShelfItem service={config.services.find((e) => e.id === activeId)} id={activeId} />
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  };

  if (categoryList.length > 0) {
    const noCategory = config.services.filter(
      (e) => e.category === undefined || e.category === null
    );
    const downloadEnabled = config.modules?.[DownloadsModule.id]?.enabled ?? false;
    // Create an item with 0: true, 1: true, 2: true... For each category
    return (
      // TODO: Style accordion so that the bar is transparent to the user settings
      <Stack>
        <Accordion
          variant="separated"
          radius="lg"
          order={2}
          multiple
          value={toggledCategories}
          onChange={(state) => {
            setToggledCategories([...state]);
          }}
        >
          {categoryList.map((category, idx) => (
            <Accordion.Item key={category} value={idx.toString()}>
              <Accordion.Control>{category}</Accordion.Control>
              <Accordion.Panel>{getItems(category)}</Accordion.Panel>
            </Accordion.Item>
          ))}
          {/* Return the item for all services without category */}
          {noCategory && noCategory.length > 0 ? (
            <Accordion.Item key="Other" value="Other">
              <Accordion.Control>{t('accordions.others.text')}</Accordion.Control>
              <Accordion.Panel>{getItems()}</Accordion.Panel>
            </Accordion.Item>
          ) : null}
          {downloadEnabled ? (
            <Accordion.Item key="Downloads" value="Your downloads">
              <Accordion.Control>{t('accordions.downloads.text')}</Accordion.Control>
              <Accordion.Panel>
                <Paper
                  p="lg"
                  radius="lg"
                  style={{
                    background: `rgba(${colorScheme === 'dark' ? '37, 38, 43,' : '255, 255, 255,'} \
                ${(config.settings.appOpacity || 100) / 100}`,
                    borderColor: `rgba(${
                      colorScheme === 'dark' ? '37, 38, 43,' : '233, 236, 239,'
                    } \
                ${(config.settings.appOpacity || 100) / 100}`,
                  }}
                >
                  <ModuleMenu module={DownloadsModule} />
                  <DownloadComponent />
                </Paper>
              </Accordion.Panel>
            </Accordion.Item>
          ) : null}
        </Accordion>
      </Stack>
    );
  }
  return (
    <Stack>
      {getItems()}
      <ModuleWrapper mt="xl" module={DownloadsModule} />
    </Stack>
  );
};

export default AppShelf;
