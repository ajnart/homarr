import React, { useState } from 'react';
import { Accordion, createStyles, Grid, Group, Paper, useMantineColorScheme } from '@mantine/core';
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
import { useConfig } from '../../tools/state';

import { SortableAppShelfItem, AppShelfItem } from './AppShelfItem';
import { ModuleMenu, ModuleWrapper } from '../modules/moduleWrapper';
import { DownloadsModule } from '../modules';
import DownloadComponent from '../modules/downloads/DownloadsModule';

const useStyles = createStyles((theme, _params) => ({
  item: {
    borderBottom: 0,
    overflow: 'hidden',
    border: '1px solid transparent',
    borderRadius: theme.radius.lg,
    marginTop: theme.spacing.md,
  },

  itemOpened: {
    borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[3],
  },
}));

const AppShelf = (props: any) => {
  const { classes, cx } = useStyles(props);
  const [toggledCategories, settoggledCategories] = useLocalStorage({
    key: 'app-shelf-toggled',
    // This is a bit of a hack to get the 5 first categories to be toggled on by default
    defaultValue: { 0: true, 1: true, 2: true, 3: true, 4: true } as Record<string, boolean>,
  });
  const [activeId, setActiveId] = useState(null);
  const { config, setConfig } = useConfig();
  const { colorScheme } = useMantineColorScheme();

  const sensors = useSensors(
    useSensor(TouchSensor, {}),
    useSensor(MouseSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        delay: 250,
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
  // Extract all the categories from the services in config
  const categoryList = config.services.reduce((acc, cur) => {
    if (cur.category && !acc.includes(cur.category)) {
      acc.push(cur.category);
    }
    return acc;
  }, [] as string[]);

  const item = (filter?: string) => {
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
    // Create an item with 0: true, 1: true, 2: true... For each category
    return (
      // Return one item for each category
      <Group grow direction="column">
        <Accordion
          disableIconRotation
          classNames={classes}
          order={2}
          iconPosition="right"
          multiple
          styles={{
            item: {
              borderRadius: '20px',
            },
          }}
          initialState={toggledCategories}
          onChange={(idx) => settoggledCategories(idx)}
        >
          {categoryList.map((category, idx) => (
            <Accordion.Item key={category} label={category}>
              {item(category)}
            </Accordion.Item>
          ))}
          {/* Return the item for all services without category */}
          {noCategory && noCategory.length > 0 ? (
            <Accordion.Item key="Other" label="Other">
              {item()}
            </Accordion.Item>
          ) : null}
          <Accordion.Item key="Downloads" label="Your downloads">
            <Paper
              p="lg"
              radius="lg"
              style={{
                background: `rgba(${colorScheme === 'dark' ? '37, 38, 43,' : '255, 255, 255,'} \
                ${(config.settings.appOpacity || 100) / 100}`,
                borderColor: `rgba(${colorScheme === 'dark' ? '37, 38, 43,' : '233, 236, 239,'} \
                ${(config.settings.appOpacity || 100) / 100}`,
              }}
            >
              <ModuleMenu module={DownloadsModule} />
              <DownloadComponent />
            </Paper>
          </Accordion.Item>
        </Accordion>
      </Group>
    );
  }
  return (
    <Group grow direction="column">
      {item()}
      <ModuleWrapper mt="xl" module={DownloadsModule} />
    </Group>
  );
};

export default AppShelf;
