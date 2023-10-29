import {
  DefaultMantineColor,
  HoverCard,
  HoverCardProps,
  SystemProp,
  useMantineTheme,
} from '@mantine/core';
import { Link, RichTextEditor, RichTextEditorProps } from '@mantine/tiptap';
import { IconInfoCircle } from '@tabler/icons-react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useTranslation } from 'next-i18next';

interface InfoCardProps {
  bg?: SystemProp<DefaultMantineColor>;
  cardProp?: Partial<RichTextEditorProps>;
  message: string;
  link?: string;
  hoverProp?: Partial<HoverCardProps>;
  position?: HoverCardProps['position'];
}

export const InfoCard = ({ bg, cardProp, message, link, hoverProp, position }: InfoCardProps) => {
  const { colorScheme } = useMantineTheme();
  const { t } = useTranslation('common');
  const content = link
    ? message + ` <a href=\"${link}\" target=\"_blank\">${t('seeMore')}</a>`
    : message;
  const editor = useEditor({
    content,
    editable: false,
    editorProps: { attributes: { style: 'padding: 0;' } },
    extensions: [StarterKit, Link],
  });

  return (
    <HoverCard position={position ?? 'top'} radius="md" withArrow withinPortal {...hoverProp}>
      <HoverCard.Target>
        <IconInfoCircle size="1.25rem" style={{ display: 'block', opacity: 0.5 }} />
      </HoverCard.Target>
      <HoverCard.Dropdown
        bg={bg ?? colorScheme === 'light' ? 'gray.2' : 'dark.8'}
        maw={400}
        px="10px"
        py="5px"
      >
        <RichTextEditor editor={editor} style={{ border: '0' }} {...cardProp}>
          <RichTextEditor.Content bg="transparent" />
        </RichTextEditor>
      </HoverCard.Dropdown>
    </HoverCard>
  );
};
