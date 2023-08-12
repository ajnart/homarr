import { ActionIcon, createStyles, rem } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Link, RichTextEditor } from '@mantine/tiptap';
import { IconArrowUp, IconEdit, IconEditOff } from '@tabler/icons-react';
import { BubbleMenu, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef, useState } from 'react';
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
  const [content, setContent] = useState(widget.properties);

  const { enabled } = useEditModeStore();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { config, name: configName } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);
  const { primaryColor } = useColorTheme();

  const { mutateAsync } = api.notebook.createOrUpdate.useMutation();

  const [debounced] = useDebouncedValue(content, 500);

  if (!config || !configName) return <WidgetLoading />;

  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: content.content,
    editable: false,
    onUpdate: (e) => {
      setContent((previous) => ({
        ...previous,
        content: e.editor.getHTML(),
      }));
    },
  });
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(isEditing);

    updateConfig(
      configName,
      (previous) => {
        const currentWidget = previous.widgets.find((x) => x.id === widget.id);
        currentWidget!.properties = debounced;

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
      configName: configName,
      content: debounced.content,
      widgetId: widget.id,
    });
  }, [isEditing]);

  return (
    <>
      {enabled === false && (
        <ActionIcon
          style={{
            zIndex: 1,
            position: 'absolute',
            top: 7,
            right: 7,
          }}
          color={primaryColor}
          variant="light"
          size={30}
          radius={'md'}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? <IconEditOff size={20} /> : <IconEdit size={20} />}
        </ActionIcon>
      )}
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
            paddingTop: 0,
            paddingBottom: theme.spacing.md,
          },
          content: {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : 'white',
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
    </>
  );
}
