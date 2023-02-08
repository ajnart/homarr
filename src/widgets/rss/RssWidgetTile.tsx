import { Stack } from '@mantine/core';
import { IconRss } from '@tabler/icons';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';

const definition = defineWidget({
  id: 'rss',
  icon: IconRss,
  options: {},
  gridstack: {
    minWidth: 2,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: RssTile,
});

export type IRssWidget = IWidget<typeof definition['id'], typeof definition>;

interface RssTileProps {
  widget: IRssWidget;
}

function RssTile({ widget }: RssTileProps) {
  return <Stack>fherufgh</Stack>;
}

export default definition;
