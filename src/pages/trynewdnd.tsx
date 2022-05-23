import React, { useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Grid } from '@mantine/core';
import { SortableItem } from '../components/dnd/StorableItem';
import { AppShelfItem } from '../components/AppShelf/AppShelf';
import { useConfig } from '../tools/state';

export default function App() {
  const [activeId, setActiveId] = useState(null);
  const { config, setConfig } = useConfig();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
              <SortableItem service={service} key={service.id} id={service.id} />
            </Grid.Col>
          ))}
        </Grid>
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <AppShelfItem service={config.services.find((e) => e.id === activeId)} id={activeId} />
        ) : null}
      </DragOverlay>
    </DndContext>
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
}
