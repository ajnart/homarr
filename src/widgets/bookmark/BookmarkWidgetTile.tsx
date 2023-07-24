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
  Switch,
  Text,
  TextInput,
  Title,
  createStyles,
  useMantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconAlertTriangle,
  IconBookmark,
  IconLink,
  IconPlaylistX,
  IconTrash,
  IconTypography,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { v4 } from 'uuid';
import { z } from 'zod';

import { useEditModeStore } from '../../components/Dashboard/Views/useEditModeStore';
import { IconSelector } from '../../components/IconSelector/IconSelector';
import { defineWidget } from '../helper';
import { IDraggableEditableListInputValue, IWidget } from '../widgets';

interface BookmarkItem {
  id: string;
  name: string;
  href: string;
  iconUrl: string;
  openNewTab: boolean;
  hideHostname: boolean;
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
          openNewTab: false,
          hideHostname: false,
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
            iconUrl: (value) => {
              if (z.string().min(1).max(400).safeParse(value).success) {
                return undefined;
              }

              return 'Length must be between 1 and 100';
            },
          },
          validateInputOnChange: true,
          validateInputOnBlur: true,
        });

        useEffect(() => {
          if (!form.isValid()) {
            return;
          }

          onChange({ ...form.values, openNewTab: form.values.openNewTab });
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
                value={form.values.iconUrl}
                onChange={(value) => {
                  form.setFieldValue('iconUrl', value ?? '');
                }}
              />
              <Switch
                {...form.getInputProps('openNewTab')}
                label="Open in new tab"
                checked={form.values.openNewTab}
              />
              <Switch
                {...form.getInputProps('hideHostname')}
                label="Hide Hostname"
                checked={form.values.hideHostname}
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
    maxWidth: 24,
    maxHeight: 24,
  },
  component: BookmarkWidgetTile,
});

export type IBookmarkWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface BookmarkWidgetTileProps {
  widget: IBookmarkWidget;
}

function BookmarkWidgetTile({ widget }: BookmarkWidgetTileProps) {
  const { t } = useTranslation('modules/bookmark');
  const { classes } = useStyles();
  const { enabled: isEditModeEnabled } = useEditModeStore();
  const { fn, colors, colorScheme } = useMantineTheme();

  if (widget.properties.items.length === 0) {
    return (
      <Stack align="center">
        <IconPlaylistX />
        <Stack spacing={0}>
          <Title order={5} align="center">
            {t('card.noneFound.title')}
          </Title>
          <Text align="center" size="sm">
            {t('card.noneFound.text')}
          </Text>
        </Stack>
      </Stack>
    );
  }

  switch (widget.properties.layout) {
    case 'autoGrid':
      return (
        <Box className={classes.grid} mr={isEditModeEnabled ? 'xl' : undefined} h="100%">
          {widget.properties.items.map((item: BookmarkItem, index) => (
            <Card
              className={classes.autoGridItem}
              key={index}
              px="xl"
              radius="md"
              component="a"
              href={item.href}
              target={item.openNewTab ? '_blank' : undefined}
              withBorder
              sx={{
                backgroundColor: colorScheme === 'dark' ? colors.dark[5].concat('80') : colors.blue[0].concat('80'),
                '&:hover': { backgroundColor: fn.primaryColor().concat('80'),}, //'40' = 25% opacity
                flex:'1 1 auto',
              }}
              display="flex"
            >
              <BookmarkItemContent item={item} />
            </Card>
          ))}
        </Box>
      );
    case 'horizontal':
    case 'vertical':
      return (
        <ScrollArea
          scrollbarSize={8}
          type="auto"
          h="100%"
          mr={isEditModeEnabled ? 'xl' : undefined}
          styles={{
            viewport:{
              //mantine being mantine again... this might break
              '& div[style="min-width: 100%; display: table;"]':{
                height:'100%',
              },
            },
          }}
        >
          <Flex
            style={{ flexDirection: widget.properties.layout === 'vertical' ? 'column' : 'row' }}
            gap="0"
            h="100%"
          >
            {widget.properties.items.map((item: BookmarkItem, index) => (
              <Card
                key={index}
                px="md"
                py="0"
                component="a"
                href={item.href}
                target={item.openNewTab ? '_blank' : undefined}
                sx={{
                  border:'0.1rem solid transparent',
                  borderRadius:'0',
                  borderBottomColor:(widget.properties.layout === 'vertical' && index < widget.properties.items.length - 1) ? '#343740' : 'transparent',
                  borderRightColor:(widget.properties.layout === 'horizontal' && index < widget.properties.items.length - 1) ? '#343740' : 'transparent',
                  backgroundColor: 'transparent',
                  '&:hover': { backgroundColor: fn.primaryColor().concat('40'),}, //'40' = 25% opacity
                  flex:'1 1 auto'
                }}
                display="flex"
              >
                <BookmarkItemContent item={item}/>
              </Card>
            ))}
          </Flex>
        </ScrollArea>
      );
    default:
      return null;
  }
}

const BookmarkItemContent = ({ item }: { item: BookmarkItem }) => {
  const { colorScheme } = useMantineTheme();
  return (
  <Group spacing="0rem 1rem">
    <Image src={item.iconUrl} width={47} height={47} fit="contain" withPlaceholder />
    <Stack spacing={0}>
      <Text size="md">{item.name}</Text>
      <Text
        color={colorScheme === 'dark' ? "gray.6" : "gray.7"}
        size="sm"
        hidden={item.hideHostname}
      >
        {new URL(item.href).hostname}
      </Text>
    </Stack>
  </Group>
)};

const useStyles = createStyles(() => ({
  grid: {
    display: 'grid',
    gap: 10,
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  },
  autoGridItem: {
    flex: '1 1 auto',
  },
}));

export default definition;
