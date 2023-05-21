import { IconNotes } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

import dynamic from 'next/dynamic';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';

const Editor = dynamic(() => import('./NotebookEditor').then((module) => module.Editor), {
  ssr: false,
});

const definition = defineWidget({
  id: 'notebook',
  icon: IconNotes,
  options: {
    showToolbar: {
      type: 'switch',
      defaultValue: true,
    },
    content: {
      type: 'text',
      defaultValue:
        '<code>RichTextEditor</code> is based on <a href="https://tiptap.dev/" rel="noopener noreferrer" target="_blank">Tiptap.dev</a> and supports all of its features:</p><ul><li>General text formatting: <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strike-through</s> </li><li>Headings (h1-h6)</li><li>Sub and super scripts (<sup>&lt;sup /&gt;</sup> and <sub>&lt;sub /&gt;</sub> tags)</li><li>Ordered and bullet lists</li><li>Text align&nbsp;</li><li>And all <a href="https://tiptap.dev/extensions" target="_blank" rel="noopener noreferrer">other extensions</a></li></ul>',
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

export type INotebookWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface NotebookWidgetProps {
  widget: INotebookWidget;
}

function NotebookWidget(props: NotebookWidgetProps) {
  const { t } = useTranslation('modules/notebook');
  return <Editor widget={props.widget} />;
}
