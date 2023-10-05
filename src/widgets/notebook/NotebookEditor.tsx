import {
  ActionIcon,
  Button,
  Popover,
  ScrollArea,
  Stack,
  TextInput,
  useMantineTheme,
} from '@mantine/core';
import { useDebouncedValue, useDisclosure, useInputState } from '@mantine/hooks';
import { Link, RichTextEditor, useRichTextEditorContext } from '@mantine/tiptap';
import { IconEdit, IconEditOff, IconHighlight, IconPhoto } from '@tabler/icons-react';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import { BubbleMenu, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState } from 'react';
import { useEditModeStore } from '~/components/Dashboard/Views/useEditModeStore';
import { useConfigContext } from '~/config/provider';
import { useConfigStore } from '~/config/store';
import { useColorTheme } from '~/tools/color';
import { api } from '~/utils/api';

import { WidgetLoading } from '../loading';
import { INotebookWidget } from './NotebookWidgetTile';

export function Editor({ widget }: { widget: INotebookWidget }) {
  const [content, setContent] = useState(widget.properties.content);

  const { enabled } = useEditModeStore();
  const [isEditing, setIsEditing] = useState(false);

  const { config, name: configName } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);
  const { colors, primaryColor } = useMantineTheme();

  const { mutateAsync } = api.notebook.update.useMutation();

  const [debouncedContent] = useDebouncedValue(content, 500);

  const CustomImage = Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: { default: null },
      };
    },
  });

  const editor = useEditor({
    extensions: [
      Color,
      Highlight.configure({ multicolor: true }),
      CustomImage.configure({ inline: true }),
      Link.configure({ openOnClick: true }),
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
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
            <RichTextEditor.ColorPicker
              colors={[
                colors.dark[9],
                colors.gray[8],
                colors.red[9],
                colors.pink[7],
                colors.grape[8],
                colors.violet[9],
                colors.indigo[9],
                colors.blue[5],
                colors.cyan[9],
                colors.teal[9],
                colors.green[8],
                colors.lime[8],
                colors.yellow[5],
                colors.orange[8],
              ]}
            />
            <ColorSchemeHighlight />
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
            <EmbedImage />
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

function ColorSchemeHighlight() {
  const { editor } = useRichTextEditorContext();
  const { primaryColor } = useColorTheme();
  return (
    <RichTextEditor.Control
      onClick={() => editor?.chain().focus().toggleHighlight({ color: primaryColor }).run()}
      title="Highlight text"
    >
      <IconHighlight stroke={1.5} size="1rem" />
    </RichTextEditor.Control>
  );
}

function EmbedImage() {
  const { editor } = useRichTextEditorContext();
  const { colors, colorScheme, white } = useMantineTheme();
  const [opened, { open, close, toggle }] = useDisclosure(false);
  const [src, setSrc] = useInputState<string>('');
  const [width, setWidth] = useInputState<string>('');

  function setImage() {
    editor.commands.insertContent({
      type: 'paragraph',
      content: [
        {
          type: 'image',
          attrs: {
            width: width,
            src: src,
          },
        },
      ],
    });
    close();
  }

  return (
    <Popover
      opened={opened}
      onClose={() => {
        close();
        setSrc('');
        setWidth('');
      }}
      onOpen={() => {
        open();
        setSrc(editor == null ? '' : editor.getAttributes('image').src);
        setWidth(editor == null ? '' : editor.getAttributes('image').width);
      }}
      position="left"
      styles={{
        dropdown: {
          backgroundColor: colorScheme === 'dark' ? colors.dark[7] : white,
        },
      }}
      trapFocus
    >
      <Popover.Target>
        <RichTextEditor.Control onClick={toggle} title="Embed Image">
          <IconPhoto stroke={1.5} size="1rem" />
        </RichTextEditor.Control>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack spacing={5}>
          <TextInput
            label="Source"
            value={src || ''}
            onChange={setSrc}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setImage();
              }
            }}
            placeholder="https://example.com/"
          />
          <TextInput
            label="Width"
            value={width || ''}
            onChange={setWidth}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setImage();
              }
            }}
            placeholder="Value in % or pixels"
          />
          <Button children="Save" variant="default" mt={10} mb={5} onClick={setImage} />
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
