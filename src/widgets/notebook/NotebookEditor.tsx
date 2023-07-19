import { RichTextEditor, Link } from '@mantine/tiptap';
import { BubbleMenu, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useDebouncedValue } from '@mantine/hooks';
import { Loader, useMantineTheme, Container, Button, ScrollArea, Stack } from '@mantine/core';
import { IconArrowUp, IconEdit, IconEditOff } from '@tabler/icons-react';
import { INotebookWidget } from './NotebookWidgetTile';
import { useEditModeStore } from '../../components/Dashboard/Views/useEditModeStore';
import { useConfigContext } from '../../config/provider';
import { useConfigStore } from '../../config/store';

Link.configure({
  openOnClick: true,
});

export function Editor({ widget }: { widget: INotebookWidget }) {
  //Rework text content here
  const [content, setContent] = useState<string>(widget.properties.content);

  const { enabled } = useEditModeStore();
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

  //Scroll handling
  const viewport = useRef<HTMLDivElement>(null);
  const scrollToTop = () => viewport.current?.scrollTo({ top: 0, behavior: 'smooth' });
  const [scrollPosition, onScrollPositionChange] = useState({ y: 0 });

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
    <Container h="100%" p={0}>
      <ScrollArea
        h="100%"
        scrollbarSize={8}
        onScrollPositionChange={onScrollPositionChange}
        viewportRef={viewport}
        type={enabled ? 'never' : 'auto'}
      >
        <RichTextEditor
          styles={{
            root: {
              width: '100%',
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
          {// eslint-disable-next-line react/jsx-curly-brace-presence
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
          }
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
      <Stack
        pos="absolute"
        right="1rem"
        bottom="1rem"
        spacing="0.5rem"
      >
        <Button
          display={(scrollPosition.y > 0 && !enabled) ? 'block' : 'none'}
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
          //aria-label="Turn editing on/off"
        >
            {isEditing ? <IconEditOff size="1.25rem" /> : <IconEdit size="1.25rem" />}
        </Button>
      </Stack>
    </Container>
  );
}
