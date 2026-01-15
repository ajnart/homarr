"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { DragEndEvent, DraggableAttributes, DragStartEvent } from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Anchor,
  Box,
  Button,
  Card,
  Flex,
  Group,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Transition,
} from "@mantine/core";
import { IconGripVertical } from "@tabler/icons-react";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { showSuccessNotification } from "@homarr/notifications";
import { useI18n } from "@homarr/translation/client";
import { Link, UserAvatarGroup } from "@homarr/ui";

interface GroupsTableProps {
  initialGroupIds: string[];
  groups: RouterOutputs["group"]["getAll"];
  hasFilter: boolean;
}

export const GroupsTable = ({ groups, initialGroupIds, hasFilter }: GroupsTableProps) => {
  const t = useI18n();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [groupIds, setGroupIds] = useState(groups.map((group) => group.id));
  const isDirty = useMemo(
    () => initialGroupIds.some((groupId, index) => groupIds.indexOf(groupId) !== index),
    [groupIds, initialGroupIds],
  );
  const { mutateAsync, isPending } = clientApi.group.savePositions.useMutation({
    async onSuccess() {
      await revalidatePathActionAsync("/manage/users/groups");
    },
  });
  const handleSavePositionsAsync = async () => {
    await mutateAsync(
      { positions: groupIds },
      {
        onSuccess() {
          showSuccessNotification({
            message: t("group.action.changePosition.notification.success.message"),
          });
        },
        onError() {
          showSuccessNotification({
            message: t("group.action.changePosition.notification.error.message"),
          });
        },
      },
    );
  };

  const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    setGroupIds((groupIds) => {
      const oldIndex = groupIds.indexOf(active.id as string);
      const newIndex = groupIds.indexOf(over.id as string);
      return arrayMove(groupIds, oldIndex, newIndex);
    });
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  const selectedRow = useMemo(() => {
    if (!activeId) return null;

    const current = groups.find((group) => group.id === activeId);
    if (!current) return null;

    return <Row group={current} handle={<DragHandle attributes={undefined} listeners={undefined} active />} />;
  }, [activeId, groups]);

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        id="groups-table"
      >
        <Table striped highlightOnHover>
          <TableThead>
            <TableTr>
              <TableTh>{t("group.field.name")}</TableTh>
              <TableTh>{t("group.field.members")}</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            <SortableContext items={groupIds} strategy={verticalListSortingStrategy}>
              {groupIds.map((groupId) => {
                const group = groups.find(({ id }) => id === groupId);
                if (!group) return null;

                return <DraggableRow key={group.id} group={group} disabled={hasFilter} />;
              })}
            </SortableContext>
          </TableTbody>
        </Table>

        <DragOverlay>
          {activeId && (
            <Table w="100%">
              <TableTbody>{selectedRow}</TableTbody>
            </Table>
          )}
        </DragOverlay>
      </DndContext>
      <SaveAffix
        visible={isDirty}
        onDiscard={() => setGroupIds(initialGroupIds)}
        isPending={isPending}
        onSave={handleSavePositionsAsync}
      />
    </>
  );
};

interface DraggableRowProps {
  group: RouterOutputs["group"]["getAll"][number];
  disabled?: boolean;
}

const DraggableRow = ({ group, disabled }: DraggableRowProps) => {
  const { attributes, listeners, transform, transition, setNodeRef, isDragging } = useSortable({
    id: group.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <TableTr ref={setNodeRef} style={style}>
        <TableTd colSpan={2}>&nbsp;</TableTd>
      </TableTr>
    );
  }

  return (
    <Row
      group={group}
      setNodeRef={setNodeRef}
      style={style}
      handle={<DragHandle attributes={attributes} listeners={listeners} active={false} disabled={disabled} />}
    />
  );
};

interface RowProps {
  group: RouterOutputs["group"]["getAll"][number];
  handle?: ReactNode;
  setNodeRef?: (node: HTMLElement | null) => void;
  style?: React.CSSProperties;
}

const Row = ({ group, handle, setNodeRef, style }: RowProps) => {
  return (
    <TableTr ref={setNodeRef} style={style}>
      <TableTd>
        <Group>
          {handle}
          <Anchor component={Link} href={`/manage/users/groups/${group.id}`}>
            {group.name}
          </Anchor>
        </Group>
      </TableTd>
      <TableTd>
        <UserAvatarGroup users={group.members} size="sm" limit={5} />
      </TableTd>
    </TableTr>
  );
};

interface DragHandleProps {
  attributes: DraggableAttributes | undefined;
  listeners: SyntheticListenerMap | undefined;
  active: boolean;
  disabled?: boolean;
}

const DragHandle = ({ attributes, listeners, active, disabled }: DragHandleProps) => {
  if (disabled) {
    return <Box w={40} h="100%" />;
  }

  return (
    <Flex
      align="center"
      justify="center"
      h="100%"
      w={40}
      style={{ cursor: active ? "grabbing" : "grab" }}
      {...attributes}
      {...listeners}
    >
      <IconGripVertical size={18} stroke={1.5} />
    </Flex>
  );
};

interface SaveAffixProps {
  visible: boolean;
  isPending: boolean;
  onDiscard: () => void;
  onSave: () => void;
}

const SaveAffix = ({ visible, isPending, onDiscard, onSave }: SaveAffixProps) => {
  const t = useI18n();

  return (
    <div style={{ position: "sticky", bottom: 20 }}>
      <Transition transition="slide-up" mounted={visible}>
        {(transitionStyles) => (
          <Card style={transitionStyles} withBorder>
            <Group justify="space-between">
              <Text fw={500}>{t("common.unsavedChanges")}</Text>
              <Group>
                <Button disabled={isPending} onClick={onDiscard}>
                  {t("common.action.discard")}
                </Button>
                <Button loading={isPending} onClick={onSave}>
                  {t("common.action.saveChanges")}
                </Button>
              </Group>
            </Group>
          </Card>
        )}
      </Transition>
    </div>
  );
};
