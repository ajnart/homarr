import { Flex, Group, Paper, Stack, createStyles } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Logo } from '~/components/layout/Common/Logo';
import { createDummyArray } from '~/tools/client/arrays';

import { LayoutPreviewProps } from './DesktopPreview';

export const MobileLayoutPreview = ({
  showLeftSidebar,
  showRightSidebar,
  columns = 3,
}: LayoutPreviewProps) => {
  const { classes } = usePreviewStyles();

  const elementWidth = (100 - (columns - 1) * 5) / columns;
  const elementCount = Math.floor(4 * Math.pow(columns, 1.5)) - 1;

  return (
    <Stack spacing="xs" w={122}>
      <Paper px="xs" py={4} withBorder>
        <Stack spacing={2}>
          <Group position="apart">
            <div style={{ flex: 1 }}>
              <Logo size="xs" withoutText />
            </div>
            <Group noWrap spacing={2}>
              <BaseElement width={10} height={10} />
              <BaseElement width={10} height={10} />
              <BaseElement width={10} height={10} />
              <BaseElement width={10} height={10} />
            </Group>
          </Group>
          <Group>
            <BaseElement width="100%" height={10} />
          </Group>
        </Stack>
      </Paper>

      <Flex gap={6} pos="relative">
        {showLeftSidebar && (
          <Flex pos="absolute" left={0} h="100%" align="center">
            <Paper className={classes.secondaryWrapper} p={2} withBorder h={32}>
              <IconChevronRight size={8} />
            </Paper>
          </Flex>
        )}

        <Paper
          className={classes.primaryWrapper}
          h={175}
          style={{ overflow: 'hidden' }}
          p="xs"
          withBorder
        >
          <Flex gap={5} wrap="wrap">
            {createDummyArray(elementCount).map((_item, index) => (
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
          <Flex pos="absolute" right={0} h="100%" align="center">
            <Paper className={classes.secondaryWrapper} p={2} withBorder h={32}>
              <IconChevronLeft size={8} />
            </Paper>
          </Flex>
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
