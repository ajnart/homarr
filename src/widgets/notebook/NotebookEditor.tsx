import { ActionIcon, ScrollArea } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Link, RichTextEditor } from '@mantine/tiptap';
import { IconEdit, IconEditOff } from '@tabler/icons-react';
import { BubbleMenu, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState } from 'react';
import { useConfigStore } from '~/config/store';
import { useColorTheme } from '~/tools/color';
import { api } from '~/utils/api';

import { useEditModeStore } from '../../components/Dashboard/Views/useEditModeStore';
import { useConfigContext } from '../../config/provider';
import { WidgetLoading } from '../loading';
import { INotebookWidget } from './NotebookWidgetTile';

Link.configure({
  openOnClick: true,
});

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
    extensions: [StarterKit, Link],
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
      <ScrollArea h="100%" sx={{ borderRadius: '0.5rem' }}>
        <RichTextEditor
          p={0}
          mt={0}
          editor={editor}
          styles={(theme) => ({
            root: {
              '& .ProseMirror': {
                padding: '0  !important',
              },
              border: 'none',
            },
            toolbar: {
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : 'white',
            },
            content: {
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : 'white',
              padding: 5,
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
      </ScrollArea>
    </>
  );
}
