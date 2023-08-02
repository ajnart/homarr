import { DefaultMantineColor, HoverCard, HoverCardProps, SystemProp, useMantineTheme} from '@mantine/core';
import { RichTextEditor, RichTextEditorProps, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { IconInfoCircle } from '@tabler/icons-react';

interface InfoCardProps {
  bg?: SystemProp<DefaultMantineColor>;
  cardProp: Partial<RichTextEditorProps>;
  content: string;
  hoverProp?: Partial<HoverCardProps>;
  position?: "bottom" | "left" | "right" | "top" | "bottom-end" | "bottom-start" | "left-end" | "left-start" | "right-end" | "right-start" | "top-end" | "top-start"
}

export const InfoCard = ({ bg, cardProp, content, hoverProp, position }: InfoCardProps) => {
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
    <HoverCard
      position={position?? 'top'}
      radius="md"
      withArrow
      withinPortal
      {...hoverProp}
    >
      <HoverCard.Target>
        <IconInfoCircle size="1.25rem" style={{ display: 'block', opacity: 0.5 }} />
      </HoverCard.Target>
      <HoverCard.Dropdown
        bg={bg ?? colorScheme === 'light' ? "gray.2" : "dark.8"}
        maw={400}
        px="10px"
        py="5px"
      >
        <RichTextEditor
          editor={editor}
          style={{ border:"0", }}
          {...cardProp}
        >
          <RichTextEditor.Content bg="transparent"/>
        </RichTextEditor>
      </HoverCard.Dropdown>
    </HoverCard>
  )
};