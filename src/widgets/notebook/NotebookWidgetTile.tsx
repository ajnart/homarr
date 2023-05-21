import {
  Card,
} from '@mantine/core';
import { IconNotes } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

import { defineWidget } from '../helper';
import { IWidget } from '../widgets';

const definition = defineWidget({
  id: 'notebook',
  icon: IconNotes,
  options: {
    showToolbar: {
      type: 'switch',
      defaultValue: true,
    },
  },
  gridstack: {
    minWidth: 2,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: NotebookWidget,
});

export default definition;

export type INodebookWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface NotebookWidgetProps {
  widget: INodebookWidget;
}

function NotebookWidget(props: NotebookWidgetProps) {
  const { t } = useTranslation('modules/notebook');
  return <Card>wooooooo</Card>;
}
