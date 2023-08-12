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
      defaultValue: `<h2>Welcome to <strong>Homarr's</strong> notebook widget</h2><p>The <code>notebook</code> widget focuses on usability and is designed to be as simple as possible to bring a familiar editing experience to regular users. It is based on <a target="_blank" rel="noopener noreferrer nofollow" href="https://tiptap.dev/">Tiptap.dev</a> and supports all of its features:</p><ul><li><p>General text formatting: <strong>bold</strong>, <em>italic</em>, underline, <s>strike-through</s></p></li><li><p>Headings (h1-h6)</p></li><li><p>Sub and super scripts (&lt;sup /&gt; and &lt;sub /&gt; tags)</p></li><li><p>Ordered and bullet lists</p></li><li><p>Text align&nbsp;</p></li></ul><h3>Widget options</h3><p>This widget has two options :</p><ul><li><p>Show toolbar : Shows the toolbar when the widget is in the local edit mode.</p></li><li><p>Content : Allows you to copy-paste the content of your notebook (in markdown form)</p></li></ul>`,
    },
  },
  gridstack: {
    minWidth: 3,
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
  return <Editor widget={props.widget} />;
}
