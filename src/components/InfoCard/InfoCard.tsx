import { HoverCard, useMantineTheme} from '@mantine/core';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { IconInfoCircle } from '@tabler/icons-react';

interface InfoCardProps {
  content: string;
}

export const InfoCard = ({ content }: InfoCardProps) => {
  const { colorScheme } = useMantineTheme();
  const editor = useEditor({
    content,
    editable: false,
    editorProps: { attributes: { style: 'padding: 0;' }, },
    extensions: [
      StarterKit,
      Link,
    ],
  });

  return (
    <HoverCard position="top" withArrow withinPortal>
      <HoverCard.Target>
        <IconInfoCircle size="1.25rem" style={{ display: 'block', opacity: 0.5 }} />
      </HoverCard.Target>
      <HoverCard.Dropdown
        bg={colorScheme === 'light' ? "gray.2" : "dark.8"}
        maw={400}
        px="10px"
        py="5px"
      >
        <RichTextEditor editor={editor} style={{ border:"0", }}>
          <RichTextEditor.Content bg="transparent"/>
        </RichTextEditor>
      </HoverCard.Dropdown>
    </HoverCard>
  )
};