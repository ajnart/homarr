import { Collapse, Flex, Stack, Text, createStyles } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconGripVertical } from '@tabler/icons-react';
import { Reorder, useDragControls } from 'framer-motion';
import { FC, ReactNode, useEffect, useRef } from 'react';
import { IDraggableListInputValue } from '~/widgets/widgets';

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

type StaticDraggableListParams = {
  value: IDraggableListInputValue['defaultValue'];
  onChange: (value: IDraggableListInputValue['defaultValue']) => void;
  labels: Record<string, string>;
  children?: Record<string, ReactNode>;
};

export const StaticDraggableList: FC<StaticDraggableListParams> = (props) => {
  const keys = props.value.map((v) => v.key);

  return (
    <div>
      <Reorder.Group
        axis="y"
        values={keys}
        onReorder={(order) =>
          props.onChange(order.map((key) => props.value.find((v) => v.key === key)!))
        }
        as="div"
      >
        {props.value.map((item) => (
          <ListItem key={item.key} item={item} label={props.labels[item.key]}>
            {props.children?.[item.key]}
          </ListItem>
        ))}
      </Reorder.Group>
    </div>
  );
};

const ListItem: FC<{
  item: IDraggableListInputValue['defaultValue'][number];
  label: string;
  children?: ReactNode;
}> = (props) => {
  const { classes, cx } = useStyles();
  const controls = useDragControls();

  const [opened, handlers] = useDisclosure(false);
  const hasContent = props.children != null && Object.keys(props.children).length !== 0;

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
    <Reorder.Item value={props.item.key} dragListener={false} dragControls={controls} as="div">
      <div className={classes.container}>
        <div className={classes.row}>
          <Flex ref={dragRef} onPointerDown={(e) => controls.start(e)}>
            <IconGripVertical className={classes.clickableIcons} size={18} stroke={1.5} />
          </Flex>

          <div className={classes.middle}>
            <Text className={classes.symbol}>{props.label}</Text>
          </div>

          {hasContent && (
            <IconChevronDown
              className={cx(classes.clickableIcons, { [classes.rotate]: opened })}
              onClick={() => handlers.toggle()}
              size={18}
              stroke={1.5}
            />
          )}
        </div>

        {hasContent && (
          <Collapse in={opened}>
            <Stack className={classes.collapseContent}>{props.children}</Stack>
          </Collapse>
        )}
      </div>
    </Reorder.Item>
  );
};
