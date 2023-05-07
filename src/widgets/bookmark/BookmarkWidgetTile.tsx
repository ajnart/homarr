import {
  Box,
  Button,
  Card,
  Flex,
  Group,
  Image,
  Input,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
  createStyles,
} from '@mantine/core';
import { v4 } from 'uuid';
import { useTranslation } from 'next-i18next';
import { IconBookmark, IconLink, IconPlaylistX, IconTrash, IconTypography } from '@tabler/icons';
import { IDraggableEditableListInputValue, IWidget } from '../widgets';
import { defineWidget } from '../helper';

interface BookmarkItem {
  id: string;
  name: string;
  href: string;
  iconUrl: string;
}

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
      itemComponent({ data, onChange, delete: deleteData }) {
        return (
          <Stack>
            <TextInput
              icon={<IconTypography size="1rem" />}
              value={data.name}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
              label="Name"
            />
            <TextInput
              icon={<IconLink size="1rem" />}
              value={data.href}
              onChange={(e) => onChange({ ...data, href: e.target.value })}
              label="URL"
            />
            <Button
              onClick={() => deleteData()}
              leftIcon={<IconTrash size="1rem" />}
              variant="light"
            >
              Delete
            </Button>
          </Stack>
        );
      },
    } satisfies IDraggableEditableListInputValue<BookmarkItem>,
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
          {widget.properties.items.map((item: BookmarkItem, index) => (
            <Card
              className={classes.autoGridItem}
              key={index}
              px="xl"
              component="a"
              href={item.href}
              withBorder
            >
              <BookmarkItemContent item={item} />
            </Card>
          ))}
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
                <BookmarkItemContent item={item} />
              </Card>
            ))}
          </Flex>
        </ScrollArea>
      );
    default:
      return null;
  }
}

const BookmarkItemContent = ({ item }: { item: BookmarkItem }) => (
  <Group>
    <Image src={item.iconUrl} width={30} height={30} fit="contain" withPlaceholder />
    <Stack spacing={0}>
      <Text>{item.name}</Text>
      <Text color="dimmed" size="sm">
        {new URL(item.href).hostname}
      </Text>
    </Stack>
  </Group>
);

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
