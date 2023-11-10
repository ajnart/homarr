import { Collapse, Flex, Stack, Text, createStyles } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconGripVertical } from '@tabler/icons-react';
import { Reorder, useDragControls } from 'framer-motion';
import { FC, useEffect, useRef } from 'react';
import { IDraggableEditableListInputValue } from '~/widgets/widgets';

interface DraggableListProps {
  items: {
    data: { id: string } & any;
  }[];
  value: IDraggableEditableListInputValue<any>['defaultValue'];
  onChange: (value: IDraggableEditableListInputValue<any>['defaultValue']) => void;
  options: IDraggableEditableListInputValue<any>;
}

export const DraggableList = ({ items, value, onChange, options }: DraggableListProps) => (
  <div>
    <Reorder.Group
      axis="y"
      values={items.map((x) => x.data.id)}
      onReorder={(order) => onChange(order.map((id) => value.find((v) => v.id === id)!))}
      as="div"
    >
      {items.map(({ data }) => (
        <ListItem key={data.id} item={data} label={options.getLabel(data)}>
          <options.itemComponent
            data={data}
            onChange={(data: any) => {
              onChange(
                items.map((item) => {
                  if (item.data.id === data.id) return data;
                  return item.data;
                })
              );
            }}
            delete={() => {
              onChange(items.filter((item) => item.data.id !== data.id).map((item) => item.data));
            }}
          />
        </ListItem>
      ))}
    </Reorder.Group>
  </div>
);

const ListItem: FC<{
  item: any;
  label: string | JSX.Element;
  children: JSX.Element;
}> = ({ item, label, children }) => {
  const [opened, handlers] = useDisclosure(false);
  const { classes, cx } = useStyles();
  const controls = useDragControls();

  // Workaround for mobile drag controls not working
  // https://github.com/framer/motion/issues/1597#issuecomment-1235026724
  const dragRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const touchHandler: EventListener = (e) => e.preventDefault();

    const dragItem = dragRef.current;

    if (dragItem) {
      dragItem.addEventListener('touchstart', touchHandler, { passive: false });

      return () => {
        dragItem.removeEventListener('touchstart', touchHandler);
      };
    }

    return undefined;
  }, [dragRef]);

  return (
    <Reorder.Item value={item.id} dragListener={false} dragControls={controls} as="div">
      <div className={classes.container}>
        <div className={classes.row}>
          <Flex ref={dragRef} onPointerDown={(e) => controls.start(e)}>
            <IconGripVertical className={classes.clickableIcons} size={18} stroke={1.5} />
          </Flex>

          <div className={classes.middle}>
            <Text className={classes.symbol}>{label}</Text>
          </div>

          <IconChevronDown
            className={cx(classes.clickableIcons, { [classes.rotate]: opened })}
            onClick={() => handlers.toggle()}
            size={18}
            stroke={1.5}
          />
        </div>

        <Collapse in={opened}>
          <Stack className={classes.collapseContent}>{children}</Stack>
        </Collapse>
      </div>
    </Reorder.Item>
  );
};

const useStyles = createStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.radius.md,
    border: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.white,
    marginBottom: theme.spacing.xs,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    gap: theme.spacing.sm,
  },
  middle: {
    flexGrow: 1,
  },
  symbol: {
    fontSize: 16,
  },
  clickableIcons: {
    color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[6],
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'transform .3s ease-in-out',
  },
  rotate: {
    transform: 'rotate(180deg)',
  },
  collapseContent: {
    padding: '12px 16px',
  },
}));
