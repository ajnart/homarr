import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { ActionIconProps } from "@mantine/core";
import { ActionIcon, Card, Center, Fieldset, Loader, Stack } from "@mantine/core";
import { IconGripHorizontal } from "@tabler/icons-react";

import { useWidgetInputTranslation } from "./common";
import type { CommonWidgetInputProps } from "./common";
import { useFormContext } from "./form";

export const WidgetSortedItemListInput = <TItem, TOptionValue extends UniqueIdentifier>({
  property,
  options,
  initialOptions,
  kind,
}: CommonWidgetInputProps<"sortableItemList">) => {
  const t = useWidgetInputTranslation(kind, property);
  const form = useFormContext();
  const initialValues = useMemo(() => initialOptions[property] as TOptionValue[], [initialOptions, property]);
  const values = form.values.options[property] as TOptionValue[];
  const { data, isLoading, error } = options.useData(initialValues);
  const dataMap = useMemo(
    () => new Map(data?.map((item) => [options.uniqueIdentifier(item), item as TItem])),
    [data, options],
  );
  const [tempMap, setTempMap] = useState<Map<TOptionValue, TItem>>(new Map());

  const [activeId, setActiveId] = useState<TOptionValue | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const isFirstAnnouncement = useRef(true);
  const getIndex = (id: TOptionValue) => values.indexOf(id);
  const activeIndex = activeId ? getIndex(activeId) : -1;

  useEffect(() => {
    if (!activeId) {
      isFirstAnnouncement.current = true;
    }
  }, [activeId]);

  const getItem = useCallback(
    (id: TOptionValue) => {
      if (!tempMap.has(id)) {
        return dataMap.get(id);
      }

      return tempMap.get(id);
    },
    [tempMap, dataMap],
  );

  const updateItems = (callback: (prev: TOptionValue[]) => TOptionValue[]) => {
    form.setFieldValue(`options.${property}`, callback);
  };

  const addItem = (item: TItem) => {
    setTempMap((prev) => {
      prev.set(options.uniqueIdentifier(item) as TOptionValue, item);
      return prev;
    });
    updateItems((values) => [...values, options.uniqueIdentifier(item) as TOptionValue]);
  };

  return (
    <Fieldset legend={t("label")}>
      <Stack>
        <options.addButton addItem={addItem} values={values} />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={({ active }) => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!active) {
              return;
            }

            setActiveId(active.id as TOptionValue);
          }}
          onDragEnd={({ over }) => {
            setActiveId(null);

            if (over) {
              const overIndex = getIndex(over.id as TOptionValue);
              if (activeIndex !== overIndex) {
                updateItems((items) => arrayMove(items, activeIndex, overIndex));
              }
            }
          }}
          onDragCancel={() => setActiveId(null)}
        >
          <SortableContext items={values} strategy={verticalListSortingStrategy}>
            <Stack gap="xs">
              <React.Fragment>
                {values.map((value, index) => {
                  const item = getItem(value);
                  const removeItem = () => {
                    form.setValues((previous) => {
                      const previousValues = previous.options?.[property] as TOptionValue[];
                      return {
                        ...previous,
                        options: {
                          ...previous.options,
                          [property]: previousValues.filter((id) => id !== value),
                        },
                      };
                    });
                  };

                  if (!item) {
                    return null;
                  }

                  return (
                    <MemoizedItem
                      key={value}
                      id={value}
                      index={index}
                      item={item}
                      removeItem={removeItem}
                      options={options}
                    />
                  );
                })}
                {isLoading && (
                  <Center h={256}>
                    <Loader />
                  </Center>
                )}
                {error ? <Center h={256}>{JSON.stringify(error)}</Center> : null}
              </React.Fragment>
            </Stack>
          </SortableContext>
        </DndContext>
      </Stack>
    </Fieldset>
  );
};

interface ItemProps<TItem, TOptionValue extends UniqueIdentifier> {
  id: TOptionValue;
  item: TItem;
  index: number;
  removeItem: () => void;
  options: CommonWidgetInputProps<"sortableItemList">["options"];
}

const Item = <TItem, TOptionValue extends UniqueIdentifier>({
  id,
  index,
  item,
  removeItem,
  options,
}: ItemProps<TItem, TOptionValue>) => {
  const { attributes, isDragging, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({
    id,
  });

  const Handle = (props: Partial<ActionIconProps>) => {
    return (
      <ActionIcon
        variant="transparent"
        color="gray"
        {...props}
        {...listeners}
        ref={setActivatorNodeRef}
        style={{ cursor: "grab" }}
      >
        <IconGripHorizontal />
      </ActionIcon>
    );
  };

  return (
    <Card
      withBorder
      shadow="xs"
      padding="sm"
      radius="md"
      style={
        {
          transition: [transition].filter(Boolean).join(", "),
          "--translate-x": transform ? `${Math.round(transform.x)}px` : undefined,
          "--translate-y": transform ? `${Math.round(transform.y)}px` : undefined,
          "--scale-x": transform?.scaleX ? `${transform.scaleX}` : undefined,
          "--scale-y": transform?.scaleY ? `${transform.scaleY}` : undefined,
          "--index": index,
          transform:
            "translate3d(var(--translate-x, 0), var(--translate-y, 0), 0) scaleX(var(--scale-x, 1)) scaleY(var(--scale-y, 1))",
          transformOrigin: "0 0",
          ...(isDragging
            ? {
                opacity: "var(--dragging-opacity, 0.5)",
                zIndex: 0,
              }
            : {}),
        } as React.CSSProperties
      }
      ref={setNodeRef}
    >
      <options.itemComponent
        key={index}
        item={item}
        removeItem={removeItem}
        rootAttributes={attributes}
        handle={Handle}
      />
    </Card>
  );
};

const MemoizedItem = memo(Item);
