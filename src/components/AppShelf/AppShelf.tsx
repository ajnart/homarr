import React, { useState } from 'react';
import { Grid } from '@mantine/core';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { useConfig } from '../../tools/state';

import { SortableAppShelfItem, AppShelfItem } from './AppShelfItem';

const AppShelf = (props: any) => {
  const [activeId, setActiveId] = useState(null);
  const { config, setConfig } = useConfig();
  const sensors = useSensors(
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={config.services}>
        <Grid gutter="xl" align="center">
          {config.services.map((service) => (
            <Grid.Col key={service.id} span={6} xl={2} xs={4} sm={3} md={3}>
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

export default AppShelf;
