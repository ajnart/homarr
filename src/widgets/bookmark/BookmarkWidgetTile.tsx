import { Text } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { IconBookmark } from '@tabler/icons';
import { IWidget } from '../widgets';
import { defineWidget } from '../helper';

const definition = defineWidget({
  id: 'bookmark',
  icon: IconBookmark,
  options: {
    items: {
      type: 'draggable-editable-list',
      defaultValue: [],
      items: [] as any, // TODO: Fix type
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

  console.log(widget.properties.bookmarkList);

  return <Text>abc</Text>;
}

export default definition;
