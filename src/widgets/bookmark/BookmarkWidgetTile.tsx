import {
  Alert,
  Box,
  Button,
  Card,
  Flex,
  Group,
  Image,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
  createStyles,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconAlertTriangle,
  IconBookmark,
  IconLink,
  IconPlaylistX,
  IconTrash,
  IconTypography,
} from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { v4 } from 'uuid';
import { z } from 'zod';
import { IconSelector } from '../../components/IconSelector/IconSelector';
import { defineWidget } from '../helper';
import { IDraggableEditableListInputValue, IWidget } from '../widgets';

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
        const form = useForm({
          initialValues: data,
          validate: {
            name: (value) => {
              const validation = z.string().min(1).max(100).safeParse(value);
              if (validation.success) {
                return undefined;
              }

              return 'Length must be between 1 and 100';
            },
            href: (value) => {
              if (!z.string().min(1).max(200).safeParse(value).success) {
                return 'Length must be between 1 and 200';
              }

              if (!z.string().url().safeParse(value).success) {
                return 'Not a valid link';
              }

              return undefined;
            },
          },
          validateInputOnChange: true,
          validateInputOnBlur: true,
        });

        useEffect(() => {
          if (!form.isValid()) {
            return;
          }

          onChange(form.values);
        }, [form.values]);

        return (
          <form>
            <Stack>
              <TextInput
                icon={<IconTypography size="1rem" />}
                {...form.getInputProps('name')}
                label="Name"
                withAsterisk
              />
              <TextInput
                icon={<IconLink size="1rem" />}
                {...form.getInputProps('href')}
                label="URL"
                withAsterisk
              />
              <IconSelector
                defaultValue={data.iconUrl}
                onChange={(value) => {
                  if (value === undefined) {
                    onChange({ ...data, iconUrl: '' });
                    return;
                  }
                  onChange({ ...data, iconUrl: value ?? '' });
                }}
              />
              <Button
                onClick={() => deleteData()}
                leftIcon={<IconTrash size="1rem" />}
                variant="light"
                type="button"
              >
                Delete
              </Button>
              {!form.isValid() && (
                <Alert color="red" icon={<IconAlertTriangle size="1rem" />}>
                  Did not save, because there were validation errors. Please adust your inputs
                </Alert>
              )}
            </Stack>
          </form>
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
