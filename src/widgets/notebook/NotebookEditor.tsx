import { RichTextEditor, Link } from '@mantine/tiptap';
import { BubbleMenu, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useDebouncedValue } from '@mantine/hooks';
import { Loader, useMantineTheme } from '@mantine/core';
import { IconEdit, IconEditOff } from '@tabler/icons-react';
import { INotebookWidget } from './NotebookWidgetTile';
import { useEditModeInformationStore } from '../../hooks/useEditModeInformation';
import { useConfigContext } from '../../config/provider';
import { useConfigStore } from '../../config/store';

Link.configure({
  openOnClick: true,
});

export function Editor({ widget }: { widget: INotebookWidget }) {
  const [content, setContent] = useState<string>(widget.properties.content);
  const { editModeEnabled } = useEditModeInformationStore();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { config } = useConfigContext();
  const { name: configName } = useConfigContext();

  const updateConfig = useConfigStore((x) => x.updateConfig);
  const [debounced] = useDebouncedValue(content, 500);
  const theme = useMantineTheme();
  const mutation = useMutation({
    mutationFn: (content: string) =>
      axios.post('/api/modules/notebook', { id: widget.id, content }),
  });

  if (!config || !configName) return <Loader />;

  const editor = useEditor({
    extensions: [StarterKit, Link],
    content,
    editable: false,
    onUpdate: (e) => {
      setContent((_) => e.editor.getHTML());
    },
  });
  // Run the mutation when the debounced value changes (after 500ms)
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(isEditing);
    mutation.mutate(debounced);
  }, [isEditing]);

  return (
    <RichTextEditor
      styles={{
        root: {
          border: 'none',
        },

        toolbar: {
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : 'white',
        },
        content: {
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : 'white',
        },
      }}
      editor={editor}
    >
      {widget.properties.showToolbar === true && (
        <RichTextEditor.Toolbar>
          {editModeEnabled === false && (
            <RichTextEditor.Control
              onClick={() => setIsEditing(!isEditing)}
              aria-label="Turn editing on/off"
              title="Enable editing of the note"
            >
              {isEditing ? <IconEditOff size={15} /> : <IconEdit size={15} />}
            </RichTextEditor.Control>
          )}
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.ClearFormatting />
            <RichTextEditor.Code />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.H4 />
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
      )}
      {editor && (
        <BubbleMenu editor={editor}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Link />
          </RichTextEditor.ControlsGroup>
        </BubbleMenu>
      )}

      <RichTextEditor.Content />
    </RichTextEditor>
  );
}
