import { ActionIcon, ScrollArea } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Link, RichTextEditor, useRichTextEditorContext } from '@mantine/tiptap';
import { IconEdit, IconEditOff, IconHighlight } from '@tabler/icons-react';
import { BubbleMenu, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { useState } from 'react';
import { useConfigStore } from '~/config/store';
import { useColorTheme } from '~/tools/color';
import { api } from '~/utils/api';

import { useEditModeStore } from '~/components/Dashboard/Views/useEditModeStore';
import { useConfigContext } from '~/config/provider';
import { WidgetLoading } from '../loading';
import { INotebookWidget } from './NotebookWidgetTile';

export function Editor({ widget }: { widget: INotebookWidget }) {
  const [content, setContent] = useState(widget.properties.content);

  const { enabled } = useEditModeStore();
  const [isEditing, setIsEditing] = useState(false);

  const { config, name: configName } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);
  const { primaryColor } = useColorTheme();

  const { mutateAsync } = api.notebook.update.useMutation();

  const [debouncedContent] = useDebouncedValue(content, 500);

  const editor = useEditor({
    extensions: [
      Highlight.configure({ multicolor: true }),
      Image,
      Link.configure({ openOnClick: true }),
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'], })
    ],
    content,
    editable: false,
    onUpdate: (e) => {
      setContent(e.editor.getHTML());
    },
  });

  const handleEditToggle = (previous: boolean) => {
    const current = !previous;
    if (!editor) return current;
    editor.setEditable(current);

    updateConfig(
      configName!,
      (previous) => {
        const currentWidget = previous.widgets.find((x) => x.id === widget.id);
        currentWidget!.properties.content = debouncedContent;

        return {
          ...previous,
          widgets: [
            ...previous.widgets.filter((iterationWidget) => iterationWidget.id !== widget.id),
            currentWidget!,
          ],
        };
      },
      true
    );

    void mutateAsync({
      configName: configName!,
      content: debouncedContent,
      widgetId: widget.id,
    });

    return current;
  };

  if (!config || !configName) return <WidgetLoading />;

  return (
    <>
      <RichTextEditor
        p={0}
        mt={0}
        h="100%"
        editor={editor}
        styles={(theme) => ({
          root: {
            '& .ProseMirror': {
              padding: '0  !important',
            },
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : 'white',
            border: 'none',
            borderRadius: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
          },
          toolbar: {
            backgroundColor: 'transparent',
            padding: '0.5rem',
          },
          content: {
            backgroundColor: 'transparent',
            padding: '0.5rem',
          },
        })}
      >
        <RichTextEditor.Toolbar
          style={{
            display: isEditing && widget.properties.showToolbar === true ? 'flex' : 'none',
          }}
        >
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Strikethrough />
            <ColorSchemeHighlight/>
            <RichTextEditor.Code />
            <RichTextEditor.ClearFormatting />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.H4 />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.AlignLeft />
            <RichTextEditor.AlignCenter />
            <RichTextEditor.AlignRight />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Blockquote />
            <RichTextEditor.Hr />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
        {editor && (
          <BubbleMenu editor={editor}>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Link />
            </RichTextEditor.ControlsGroup>
          </BubbleMenu>
        )}

        <ScrollArea mih="4rem">
          <RichTextEditor.Content />
        </ScrollArea>
      </RichTextEditor>
      {!enabled && (
        <ActionIcon
          style={{
            zIndex: 1,
          }}
          top={7}
          right={7}
          pos="absolute"
          color={primaryColor}
          variant="light"
          size={30}
          radius={'md'}
          onClick={() => setIsEditing(handleEditToggle)}
        >
          {isEditing ? <IconEditOff size={20} /> : <IconEdit size={20} />}
        </ActionIcon>
      )}
    </>
  );
}

function ColorSchemeHighlight () {
  const { editor } = useRichTextEditorContext();
  const { primaryColor } = useColorTheme();
  return (
    <RichTextEditor.Control
      onClick={() => editor?.chain().focus().toggleHighlight({ color: primaryColor }).run()}
      title="Highlight text"
    >
      <IconHighlight stroke={1.5} size="1rem" />
    </RichTextEditor.Control>
  )
}