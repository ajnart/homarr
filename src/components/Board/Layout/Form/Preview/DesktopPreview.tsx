import { Flex, Group, Paper, Stack, createStyles } from '@mantine/core';
import { Logo } from '~/components/layout/Common/Logo';
import { createDummyArray } from '~/tools/client/arrays';

export type LayoutPreviewProps = {
  showLeftSidebar?: boolean;
  showRightSidebar?: boolean;
  columns?: number;
};
export const DesktopLayoutPreview = ({
  showLeftSidebar,
  showRightSidebar,
  columns = 11,
}: LayoutPreviewProps) => {
  const { classes } = usePreviewStyles();

  const sidebarCount =
    showLeftSidebar && showRightSidebar ? 2 : showLeftSidebar || showRightSidebar ? 1 : 0;
  const elementWidth = (234 - sidebarCount * 23 - (columns - 1) * 5) / columns;
  const elementCount = Math.floor(4 * Math.pow(columns, 1.4)) - 1;
  const elementCountAfterSidebar = elementCount - sidebarCount * 2;

  return (
    <Stack spacing="xs" w={256}>
      <Paper px="xs" py={4} withBorder>
        <Stack spacing={2}>
          <Group position="apart">
            <div style={{ flex: 1 }}>
              <Logo size="xs" withoutText />
            </div>
            <BaseElement width={64} height={10} />
            <Group noWrap spacing={2} style={{ flex: 1 }} position="right">
              <BaseElement width={10} height={10} />
              <BaseElement width={10} height={10} />
              <BaseElement width={10} height={10} />
              <BaseElement width={10} height={10} />
            </Group>
          </Group>
          <Group></Group>
        </Stack>
      </Paper>

      <Flex gap={6} pos="relative">
        {showLeftSidebar && (
          <Paper h={175} className={classes.secondaryWrapper} p="xs" withBorder>
            <Flex
              gap={5}
              align="start"
              wrap="wrap"
              w={elementWidth * 2 + 5}
              style={{
                maxHeight: 'calc(100% + 10px)',
                overflowY: 'hidden',
              }}
            >
              {createDummyArray(Math.floor((elementCount / columns) * 2)).map((_item, index) => (
                <PlaceholderElement
                  height={elementWidth}
                  width={index % 4 === 0 ? elementWidth * 2 + 5 : elementWidth}
                  key={`example-item-left-sidebard-${index}`}
                  index={index}
                />
              ))}
            </Flex>
          </Paper>
        )}

        <Paper
          className={classes.primaryWrapper}
          h={175}
          style={{ overflow: 'hidden' }}
          p="xs"
          withBorder
        >
          <Flex gap={5} wrap="wrap">
            {createDummyArray(elementCountAfterSidebar).map((_item, index) => (
              <PlaceholderElement
                height={elementWidth}
                width={
                  (index % 5 === 0 || index % 7 === 0) && columns >= 2
                    ? elementWidth * 2 + 5
                    : elementWidth
                }
                key={`example-item-main-${index}`}
                index={index}
              />
            ))}
          </Flex>
        </Paper>

        {showRightSidebar && (
          <Paper h={175} className={classes.secondaryWrapper} p="xs" withBorder>
            <Flex
              gap={5}
              align="start"
              wrap="wrap"
              w={elementWidth * 2 + 5}
              style={{
                maxHeight: 'calc(100% + 10px)',
                overflowY: 'hidden',
              }}
            >
              {createDummyArray(Math.floor((elementCount / columns) * 2)).map((_item, index) => (
                <PlaceholderElement
                  height={elementWidth}
                  width={index % 4 === 0 ? elementWidth * 2 + 5 : elementWidth}
                  key={`example-item-right-sidebard-${index}`}
                  index={index}
                />
              ))}
            </Flex>
          </Paper>
        )}
      </Flex>
    </Stack>
  );
};

const usePreviewStyles = createStyles((theme) => ({
  primaryWrapper: {
    flexGrow: 2,
  },
  secondaryWrapper: {
    flexGrow: 1,
    maxWidth: 100,
  },
}));

const BaseElement = ({ height, width }: { height: number; width: number | string }) => (
  <Paper
    sx={(theme) => ({
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.gray[8] : theme.colors.gray[1],
    })}
    h={height}
    p={2}
    w={width}
  />
);

type PlaceholderElementProps = {
  height: number;
  width: number;
  index: number;
};
const PlaceholderElement = ({ height, width, index }: PlaceholderElementProps) => {
  return <BaseElement width={width} height={height} />;
};
