import { IconNotes } from '@tabler/icons-react';
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
    allowReadOnlyCheck: {
      type: 'switch',
      defaultValue: true,
    },
    content: {
      type: 'text',
      hide: true,
      defaultValue: `<p style=\"text-align: center\"><img src=\"/imgs/logo/logo.png\" width=\"25%\"></p><h2>Welcome to <strong><span style=\"color: rgb(250, 82, 82)\">Homarr</span>'s</strong> notebook widget</h2><p>The <code>notebook</code> widget focuses on usability and is designed to be as simple as possible to bring a familiar editing experience to regular users, be it markdown or office type editors. It is based on <a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"https://tiptap.dev/\">Tiptap.dev</a> and supports most of its features:</p><table><tbody><tr><td colspan=\"3\" rowspan=\"1\" style=\"background-color: rgba(95, 95, 95, 0.5)\"><h4 style=\"text-align: center\">General text formatting</h4></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p><strong>Bold</strong></p></td><td colspan=\"1\" rowspan=\"1\"><p style=\"text-align: center\"><em>Italic</em></p></td><td colspan=\"1\" rowspan=\"1\"><p style=\"text-align: right\"><u>Underline</u></p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p><s>Strike-through</s></p></td><td colspan=\"1\" rowspan=\"1\"><p style=\"text-align: center\">Text alignment</p></td><td colspan=\"1\" rowspan=\"1\"><p style=\"text-align: right\">Headings</p></td></tr></tbody></table><table><tbody><tr><td colspan=\"3\" rowspan=\"1\" style=\"background-color: rgba(95, 95, 95, 0.5)\"><h4 style=\"text-align: center\">Lists</h4></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><ol><li><p>Ordered</p></li></ol></td><td colspan=\"1\" rowspan=\"1\"><ul><li><p>Bullet</p></li></ul></td><td colspan=\"1\" rowspan=\"1\"><ul data-type=\"taskList\"><li data-checked=\"true\" data-type=\"taskItem\"><label><input type=\"checkbox\" checked=\"checked\"><span></span></label><div><p>Check</p></div></li></ul></td></tr></tbody></table><table><tbody><tr><td colspan=\"3\" rowspan=\"1\" style=\"background-color: rgba(95, 95, 95, 0.5)\"><h4 style=\"text-align: center\">Coloring</h4></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p><span style=\"color: rgb(250, 82, 82)\">Text coloring</span></p></td><td colspan=\"1\" rowspan=\"1\"><p style=\"text-align: center\"><mark data-color=\"#FA5252\" style=\"background-color: #FA5252; color: inherit\">highlighting</mark></p></td><td colspan=\"1\" rowspan=\"1\" style=\"background-color: rgb(250, 82, 82)\"><p style=\"text-align: right\">Table cells</p></td></tr></tbody></table><table><tbody><tr><td colspan=\"3\" rowspan=\"1\" style=\"background-color: rgba(95, 95, 95, 0.5)\"><h4 style=\"text-align: center\">Inserts</h4></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>Links</p></td><td colspan=\"1\" rowspan=\"1\"><p style=\"text-align: center\">Images</p></td><td colspan=\"1\" rowspan=\"1\"><p style=\"text-align: right\">Tables</p></td></tr></tbody></table><hr><blockquote><h4>Widget options</h4><ul><li><p>Show the toolbar to help you write markdown:</p><p>The toolbar at the top that helps with controls, some not available in markdown.</p></li><li><p>Allow check in read only mode:</p><p>Check boxes usable outside of editing, also allows anonymous checks.</p></li></ul></blockquote>`,
    },
  },
  gridstack: {
    minWidth: 1,
    minHeight: 1,
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
