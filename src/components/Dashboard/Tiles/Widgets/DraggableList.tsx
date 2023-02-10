import { Collapse, createStyles, Stack, Text } from '@mantine/core';
import { IconChevronDown, IconGripVertical } from '@tabler/icons';
import { Reorder, useDragControls } from 'framer-motion';
import { FC, ReactNode, useState } from 'react';
import { IDraggableListInputValue } from '../../../../widgets/widgets';

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
    gap: theme.spacing.xs,
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

type DraggableListParams = {
  value: IDraggableListInputValue['defaultValue'];
  onChange: (value: IDraggableListInputValue['defaultValue']) => void;
  labels: Record<string, string>;
  children?: Record<string, ReactNode>;
};

export const DraggableList: FC<DraggableListParams> = (props) => {
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
}> = (props) => {
  const { classes, cx } = useStyles();
  const controls = useDragControls();

  const [showContent, setShowContent] = useState(false);
  const hasContent = props.children != null && Object.keys(props.children).length !== 0;

  return (
    <Reorder.Item value={props.item.key} dragListener={false} dragControls={controls} as="div">
      <div className={classes.container}>
        <div className={classes.row}>
          <IconGripVertical
            className={classes.clickableIcons}
            onPointerDown={(e) => controls.start(e)}
            size={18}
            stroke={1.5}
          />

          <div className={classes.middle}>
            <Text className={classes.symbol}>{props.label}</Text>
          </div>

          {hasContent && (
            <IconChevronDown
              className={cx(classes.clickableIcons, { [classes.rotate]: showContent })}
              onClick={() => setShowContent(!showContent)}
              size={18}
              stroke={1.5}
            />
          )}
        </div>

        {hasContent && (
          <Collapse in={showContent}>
            <Stack className={classes.collapseContent}>{props.children}</Stack>
          </Collapse>
        )}
      </div>
    </Reorder.Item>
  );
};
