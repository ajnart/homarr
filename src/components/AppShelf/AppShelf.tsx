import React, { useState } from 'react';
import { Accordion, Grid, Stack, Title, useMantineColorScheme } from '@mantine/core';
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
import * as Modules from '../../modules';
import { useConfig } from '../../tools/state';

import { AppShelfItem, SortableItem } from './AppShelfItem';
import { ModuleWrapper } from '../../modules/moduleWrapper';
import { UsenetModule, TorrentsModule } from '../../modules';

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
    const modules = Object.values(Modules).map((module) => module);

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
          <Grid gutter="lg" grow={config.settings.grow}>
            {filtered.map((service) => (
              <Grid.Col key={service.id} span="content">
                <SortableItem service={service} key={service.id} id={service.id}>
                  <AppShelfItem service={service} />
                </SortableItem>
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

  return (
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
          <Accordion.Item
            style={{
              background: `rgba(${colorScheme === 'dark' ? '32, 33, 35,' : '255, 255, 255,'} \
          ${(config.settings.appOpacity || 100) / 100}`,
              borderColor: `rgba(${colorScheme === 'dark' ? '32, 33, 35,' : '233, 236, 239,'} \
          ${(config.settings.appOpacity || 100) / 100}`,
            }}
            key={category}
            value={idx.toString()}
          >
            <Accordion.Control>
              <Title
                order={5}
                style={{
                  minWidth: 0,
                }}
              >
                {category}
              </Title>
            </Accordion.Control>
            <Accordion.Panel>{getItems(category)}</Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
      {getItems()}
      <ModuleWrapper mt="xl" module={TorrentsModule} />
      <ModuleWrapper mt="xl" module={UsenetModule} />
    </Stack>
  );
};

export default AppShelf;
