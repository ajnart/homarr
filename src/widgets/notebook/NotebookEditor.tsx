import { Button, Container, Loader, ScrollArea, Stack, useMantineTheme } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Link, RichTextEditor } from '@mantine/tiptap';
import { IconArrowUp, IconEdit, IconEditOff } from '@tabler/icons-react';
import { BubbleMenu, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef, useState } from 'react';
import { useConfigStore } from '~/config/store';

import { useEditModeStore } from '../../components/Dashboard/Views/useEditModeStore';
import { useConfigContext } from '../../config/provider';
import { INotebookWidget } from './NotebookWidgetTile';
import { api } from '~/utils/api';

Link.configure({
  openOnClick: true,
});

export function Editor({ widget }: { widget: INotebookWidget }) {
  const [content, setContent] = useState(widget.properties);

  const { enabled } = useEditModeStore();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { config, name: configName } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);

  const { mutateAsync } = api.notebook.createOrUpdate.useMutation();

  const { colorScheme, colors } = useMantineTheme();

  const [debounced] = useDebouncedValue(content, 500);

  const viewport = useRef<HTMLDivElement>(null);
  const scrollToTop = () => viewport.current?.scrollTo({ top: 0, behavior: 'smooth' });
  const [scrollPosition, onScrollPositionChange] = useState({ y: 0 });

  if (!config || !configName) return <Loader />;

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
      widgetId: widget.id
    });
  }, [isEditing]);

  return (
    <Container h="100%" p={0}>
      <ScrollArea
        h="100%"
        scrollbarSize={8}
        onScrollPositionChange={onScrollPositionChange}
        viewportRef={viewport}
        type={enabled ? 'never' : 'auto'}
      >
        <RichTextEditor
          w="100%"
          styles={{
            root: {
              border: 'none',
            },

            toolbar: {
              backgroundColor: colorScheme === 'dark' ? colors.dark[6] : 'white',
            },

            content: {
              backgroundColor: colorScheme === 'dark' ? colors.dark[6] : 'white',
            },
          }}
          editor={editor}
        >
          <RichTextEditor.Toolbar display={isEditing ? 'flex' : 'none'}>
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
      <Stack pos="absolute" right="1rem" bottom="1rem" spacing="0.5rem">
        <Button
          display={scrollPosition.y > 0 && !enabled ? 'block' : 'none'}
          size="xs"
          radius="xl"
          w="fit-content"
          h="fit-content"
          p="0.625rem"
          onClick={scrollToTop}
        >
          <IconArrowUp size="1.25rem" />
        </Button>
        <Button
          display={!enabled ? 'block' : 'none'}
          size="xs"
          radius="xl"
          w="fit-content"
          h="fit-content"
          p="0.625rem"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? <IconEditOff size="1.25rem" /> : <IconEdit size="1.25rem" />}
        </Button>
      </Stack>
    </Container>
  );
}
