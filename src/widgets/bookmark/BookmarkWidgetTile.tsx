import {
  Box,
  Card,
  Flex,
  Group,
  Image,
  ScrollArea,
  Stack,
  Text,
  Title,
  createStyles,
} from '@mantine/core';
import { v4 } from 'uuid';
import { useTranslation } from 'next-i18next';
import { IconBookmark, IconBrandAmd, IconPlaylistX } from '@tabler/icons';
import { IDraggableEditableListInputValue, IWidget } from '../widgets';
import { defineWidget } from '../helper';

const definition = defineWidget({
  id: 'bookmark',
  icon: IconBookmark,
  options: {
    items: {
      type: 'draggable-editable-list',
      defaultValue: [],
      getLabel(data) {
        return data.name;
      },
      create() {
        return {
          id: v4(),
          name: 'Homarr Documentation',
          href: 'https://homarr.dev',
          iconUrl: '/imgs/logo/logo.png',
        };
      },
      itemComponent(data) {
        return <Group>To be defined...</Group>;
      },
    } satisfies IDraggableEditableListInputValue<{
      id: string;
      name: string;
      href: string;
      iconUrl: string;
    }>,
    layout: {
      type: 'select',
      data: [
        {
          label: 'Auto Grid',
          value: 'autoGrid',
        },
        {
          label: 'Horizontal',
          value: 'horizontal',
        },
        {
          label: 'Vertical',
          value: 'vertical',
        },
      ],
      defaultValue: 'autoGrid',
    },
  },
  gridstack: {
    minWidth: 1,
    minHeight: 1,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: BookmarkWidgetTile,
});

export type IBookmarkWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface BookmarkWidgetTileProps {
  widget: IBookmarkWidget;
}

function BookmarkWidgetTile({ widget }: BookmarkWidgetTileProps) {
  const { t } = useTranslation();
  const { classes } = useStyles();

  if (widget.properties.items.length === 0) {
    return (
      <Stack>
        <IconPlaylistX />
        <Stack>
          <Title>No items</Title>
        </Stack>
      </Stack>
    );
  }

  switch (widget.properties.layout) {
    case 'autoGrid':
      return (
        <Box className={classes.grid} display="grid">
          {widget.properties.items.map(
            (item: { href: string; iconUrl: string; name: string }, index) => (
              <Card
                className={classes.autoGridItem}
                key={index}
                px="xl"
                component="a"
                href={item.href}
                withBorder
              >
                <Group>
                  <Image src={item.iconUrl} width={30} height={30} fit="contain" withPlaceholder />
                  <Stack spacing={0}>
                    <Text>{item.name}</Text>
                    <Text color="dimmed" size="sm">
                      {new URL(item.href).hostname}
                    </Text>
                  </Stack>
                </Group>
              </Card>
            )
          )}
        </Box>
      );
    case 'horizontal':
    case 'vertical':
      return (
        <ScrollArea offsetScrollbars type="always" h="100%">
          <Flex
            style={{ flexDirection: widget.properties.layout === 'vertical' ? 'column' : 'row' }}
            gap="md"
          >
            {widget.properties.items.map((item, index) => (
              <Card
                key={index}
                w={widget.properties.layout === 'vertical' ? '100%' : undefined}
                px="xl"
                component="a"
                href="https://google.com"
                withBorder
              >
                <Group>
                  <IconBrandAmd />
                  <Stack spacing={0}>
                    <Text>AMD</Text>
                    <Text color="dimmed" size="sm">
                      amd.com
                    </Text>
                  </Stack>
                </Group>
              </Card>
            ))}
          </Flex>
        </ScrollArea>
      );
    default:
      return null;
  }
}

const useStyles = createStyles(() => ({
  grid: {
    display: 'grid',
    gap: 20,
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  },
  autoGridItem: {
    flex: '1 1 auto',
  },
}));

export default definition;
