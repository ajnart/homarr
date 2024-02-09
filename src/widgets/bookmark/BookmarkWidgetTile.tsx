import {
  Alert,
  Box,
  Button,
  Card,
  Divider,
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
import React from 'react';
import { v4 } from 'uuid';
import { z } from 'zod';
import { useEditModeStore } from '~/components/Dashboard/Views/useEditModeStore';
import { IconSelector } from '~/components/IconSelector/IconSelector';

import { defineWidget } from '../helper';
import { IDraggableEditableListInputValue, IWidget } from '../widgets';

interface BookmarkItem {
  id: string;
  name: string;
  href: string;
  iconUrl: string;
  openNewTab: boolean;
  hideHostname: boolean;
  hideIcon: boolean;
}

const definition = defineWidget({
  id: 'bookmark',
  icon: IconBookmark,
  options: {
    name: {
      type: 'text',
      defaultValue: '',
      info: true,
      infoLink: 'https://homarr.dev/docs/widgets/bookmarks/',
    },
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
          hideIcon: false,
        };
      },
      itemComponent({ data, onChange, delete: deleteData }) {
        const { t } = useTranslation('modules/bookmark');
        const form = useForm({
          initialValues: data,
          validate: {
            name: (value) => {
              const validation = z.string().min(1).max(100).safeParse(value);
              if (validation.success) {
                return undefined;
              }

              return t('item.validation.length', { shortest: '1', longest: '100' });
            },
            href: (value) => {
              if (!z.string().min(1).max(8192).safeParse(value).success) {
                return t('item.validation.length', { shortest: '1', longest: '200' });
              }

              if (!z.string().url().safeParse(value).success) {
                return t('item.validation.invalidLink');
              }

              return undefined;
            },
            iconUrl: (value) => {
              if (z.string().min(1).max(400).safeParse(value).success) {
                return undefined;
              }

              return t('item.validation.length', { shortest: '1', longest: '400' });
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
                label={t('item.name')}
                withAsterisk
              />
              <TextInput
                icon={<IconLink size="1rem" />}
                {...form.getInputProps('href')}
                label={t('item.url')}
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
                label={t('item.newTab')}
                checked={form.values.openNewTab}
              />
              <Switch
                {...form.getInputProps('hideHostname')}
                label={t('item.hideHostname')}
                checked={form.values.hideHostname}
              />
              <Switch
                {...form.getInputProps('hideIcon')}
                label={t('item.hideIcon')}
                checked={form.values.hideIcon}
              />
              <Button
                onClick={() => deleteData()}
                leftIcon={<IconTrash size="1rem" />}
                variant="light"
                type="button"
              >
                {t('item.delete')}
              </Button>
              {!form.isValid() && (
                <Alert color="red" icon={<IconAlertTriangle size="1rem" />}>
                  {t('item.validation.errorMsg')}
                </Alert>
              )}
            </Stack>
          </form>
        );
      },
    } satisfies IDraggableEditableListInputValue<BookmarkItem>,
    layout: {
      type: 'select',
      data: [{ value: 'autoGrid' }, { value: 'horizontal' }, { value: 'vertical' }],
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
  const { classes } = useStyles();
  const { enabled: isEditModeEnabled } = useEditModeStore();
  const { fn, colors, colorScheme } = useMantineTheme();
  const { t } = useTranslation('modules/bookmark');

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
        <Stack h="100%" spacing={0}>
          <Title size="h4" px="0.25rem">
            {widget.properties.name}
          </Title>
          <Box
            className={classes.grid}
            mr={isEditModeEnabled && widget.properties.name === '' ? 'xl' : undefined}
            h="100%"
          >
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
                bg={
                  colorScheme === 'dark' ? colors.dark[5].concat('80') : colors.blue[0].concat('80')
                }
                sx={{
                  '&:hover': { backgroundColor: fn.primaryColor().concat('40') }, //'40' = 25% opacity
                  flex: '1 1 auto',
                }}
                display="flex"
              >
                <BookmarkItemContent item={item} />
              </Card>
            ))}
          </Box>
        </Stack>
      );
    case 'horizontal':
    case 'vertical':
      const flexDirection = widget.properties.layout === 'vertical' ? 'column' : 'row';
      return (
        <Stack h="100%" spacing={0}>
          <Title size="h4" px="0.25rem">
            {widget.properties.name}
          </Title>
          <ScrollArea
            scrollbarSize={8}
            type="auto"
            h="100%"
            offsetScrollbars
            mr={isEditModeEnabled && widget.properties.name === '' ? 'xl' : undefined}
            styles={{
              viewport: {
                //mantine being mantine again... this might break. Needed for taking 100% of widget space
                '& div[style="min-width: 100%; display: table;"]': {
                  display: 'flex !important',
                  height: '100%',
                },
              },
            }}
          >
            <Flex direction={flexDirection} gap="0" h="100%" w="100%">
              {widget.properties.items.map((item: BookmarkItem, index) => (
                <div
                  key={index}
                  style={{ display: 'flex', flex: '1', flexDirection: flexDirection }}
                >
                  <Divider
                    m="3px"
                    orientation={
                      widget.properties.layout !== 'vertical' ? 'vertical' : 'horizontal'
                    }
                    color={index === 0 ? 'transparent' : undefined}
                  />
                  <Card
                    px="md"
                    py="1px"
                    component="a"
                    href={item.href}
                    target={item.openNewTab ? '_blank' : undefined}
                    radius="md"
                    bg="transparent"
                    sx={{
                      '&:hover': { backgroundColor: fn.primaryColor().concat('40') }, //'40' = 25% opacity
                      flex: '1 1 auto',
                      overflow: 'unset',
                    }}
                    display="flex"
                  >
                    <BookmarkItemContent item={item} />
                  </Card>
                </div>
              ))}
            </Flex>
          </ScrollArea>
        </Stack>
      );
    default:
      return null;
  }
}

const BookmarkItemContent = ({ item }: { item: BookmarkItem }) => {
  const { colorScheme } = useMantineTheme();
  return (
    <Group spacing="0rem 1rem">
      <Image
        hidden={item.hideIcon}
        src={item.iconUrl}
        width={47}
        height={47}
        fit="contain"
        withPlaceholder
      />
      <Stack spacing={0}>
        <Text size="md">{item.name}</Text>
        <Text
          color={colorScheme === 'dark' ? 'gray.6' : 'gray.7'}
          size="sm"
          hidden={item.hideHostname}
        >
          {new URL(item.href).hostname}
        </Text>
      </Stack>
    </Group>
  );
};

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
