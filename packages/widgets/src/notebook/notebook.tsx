"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Box,
  Button,
  ColorPicker,
  ColorSwatch,
  Group,
  NumberInput,
  Popover,
  ScrollArea,
  Stack,
  TextInput,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { getHotkeyHandler, useDisclosure } from "@mantine/hooks";
import { Link, RichTextEditor, useRichTextEditorContext } from "@mantine/tiptap";
import {
  IconCheck,
  IconCircleOff,
  IconColumnInsertLeft,
  IconColumnInsertRight,
  IconColumnRemove,
  IconDeviceFloppy,
  IconEdit,
  IconHighlight,
  IconIndentDecrease,
  IconIndentIncrease,
  IconLayoutGrid,
  IconLetterA,
  IconListCheck,
  IconPhoto,
  IconRowInsertBottom,
  IconRowInsertTop,
  IconRowRemove,
  IconTableOff,
  IconTablePlus,
  IconX,
} from "@tabler/icons-react";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import type { Editor } from "@tiptap/react";
import { useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { StarterKit } from "@tiptap/starter-kit";
import type { Node } from "prosemirror-model";

import { clientApi } from "@homarr/api/client";
import { useForm } from "@homarr/form";
import type { TranslationObject } from "@homarr/translation";
import { useI18n, useScopedI18n } from "@homarr/translation/client";
import type { TablerIcon } from "@homarr/ui";

import type { WidgetComponentProps } from "../definition";

import "@mantine/tiptap/styles.css";
import "./notebook.css";

import { useSession } from "@homarr/auth/client";
import { constructBoardPermissions } from "@homarr/auth/shared";
import { useRequiredBoard } from "@homarr/boards/context";
import { hotkeys } from "@homarr/definitions";
import { useConfirmModal } from "@homarr/modals";

const iconProps = {
  size: 30,
  stroke: 1.5,
};

const controlIconProps = {
  size: 20,
  stroke: 1.5,
};

export function Notebook({ options, setOptions, isEditMode, boardId, itemId }: WidgetComponentProps<"notebook">) {
  const [content, setContent] = useState(options.content);
  const previousContentRef = useRef(content);

  const board = useRequiredBoard();
  const { data: session } = useSession();
  const { hasChangeAccess } = constructBoardPermissions(board, session);

  const canChange = !isEditMode && hasChangeAccess;
  const [isEditing, setIsEditing] = useState(false);

  const { primaryColor } = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  const { mutateAsync } = clientApi.widget.notebook.updateContent.useMutation();

  const tControls = useScopedI18n("widget.notebook.controls");
  const t = useI18n();

  const editor = useEditor(
    {
      extensions: [
        Placeholder.configure({
          placeholder: `${t("widget.notebook.placeholder")}…`,
        }),
        Color,
        Highlight.configure({ multicolor: true }),
        Image.extend({
          addAttributes() {
            return {
              ...this.parent?.(),
              width: { default: null },
            };
          },
        }).configure({ inline: true }),
        Link.configure({
          openOnClick: true,
          validate(url) {
            return /^https?:\/\//.test(url);
          },
        }).extend({
          addAttributes() {
            return {
              ...this.parent?.(),
              target: { default: null },
            };
          },
        }),
        // we use a custom link implementation from mantine
        StarterKit.configure({ link: false }),
        Table.configure({
          resizable: true,
          lastColumnResizable: false,
        }),
        TableCell.extend({
          addAttributes() {
            return {
              ...this.parent?.(),
              backgroundColor: {
                default: undefined,
                renderHTML: (attributes) => ({
                  style: attributes.backgroundColor ? `background-color: ${attributes.backgroundColor}` : undefined,
                }),
                parseHTML: (element) => element.style.backgroundColor || undefined,
              },
            };
          },
        }),
        TableHeader,
        TableRow,
        TaskItem.configure({
          nested: true,
          onReadOnlyChecked: (node, checked) => {
            if (!options.allowReadOnlyCheck) return false;
            if (!canChange) return false;

            const event = new CustomEvent("onReadOnlyCheck", {
              detail: { node, checked },
            });
            dispatchEvent(event);
            return true;
          },
        }),
        TaskList.configure({ itemTypeName: "taskItem" }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        TextStyle,
      ],
      shouldRerenderOnTransaction: true,
      immediatelyRender: false,
      content,
      onUpdate: ({ editor }) => {
        setContent(editor.getHTML());
      },
      onCreate: ({ editor }) => {
        editor.setEditable(false);
      },
    },
    [],
  );

  const handleOnReadOnlyCheck = (event: CustomEventInit<{ node: Node; checked: boolean }>) => {
    if (!options.allowReadOnlyCheck) return;
    if (!editor) return;

    editor.state.doc.descendants((subnode, pos) => {
      if (!event.detail) return;
      if (!subnode.eq(event.detail.node)) return;

      const { tr } = editor.state;
      tr.setNodeMarkup(pos, undefined, {
        ...event.detail.node.attrs,
        checked: event.detail.checked,
      });
      editor.view.dispatch(tr);
      setContent(editor.getHTML());
      handleContentUpdate(editor.getHTML());
    });
  };

  addEventListener("onReadOnlyCheck", handleOnReadOnlyCheck);

  const handleContentUpdate = useCallback(
    (contentUpdate: string) => {
      previousContentRef.current = contentUpdate;
      setOptions({ newOptions: { content: contentUpdate } });

      // This is not available in preview mode
      if (boardId && itemId) {
        void mutateAsync({ boardId, itemId, content: contentUpdate });
      }
    },
    [boardId, itemId, mutateAsync, setOptions],
  );

  const handleEditToggleCallback = useCallback(
    (previous: boolean) => {
      const current = !previous;
      if (!editor) return current;
      editor.setEditable(current);

      if (previous) {
        handleContentUpdate(content);
      }

      return current;
    },
    [content, editor, handleContentUpdate],
  );

  const handleEditCancelCallback = useCallback(() => {
    if (!editor) return false;
    editor.setEditable(false);

    setContent(previousContentRef.current);
    editor.commands.setContent(previousContentRef.current);

    return false;
  }, [editor]);

  const { openConfirmModal } = useConfirmModal();
  const handleEditCancel = useCallback(() => {
    openConfirmModal({
      title: t("widget.notebook.dismiss.title"),
      children: t("widget.notebook.dismiss.message"),
      labels: {
        confirm: t("widget.notebook.dismiss.action.discard"),
        cancel: t("widget.notebook.dismiss.action.keepEditing"),
      },
      onConfirm: () => {
        setIsEditing(handleEditCancelCallback);
      },
    });
  }, [setIsEditing, handleEditCancelCallback, openConfirmModal, t]);

  const handleEditToggle = useCallback(() => {
    setIsEditing(handleEditToggleCallback);
  }, [setIsEditing, handleEditToggleCallback]);

  return (
    <Box h="100%">
      <RichTextEditor
        p={0}
        mt={0}
        h="100%"
        onKeyDown={isEditing ? getHotkeyHandler([[hotkeys.saveNotebook, handleEditToggle]]) : undefined}
        editor={editor}
        styles={(theme) => ({
          root: {
            backgroundColor: colorScheme === "dark" ? theme.colors.dark[6] : "white",
            border: "none",
            borderRadius: "0.5rem",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          },
          toolbar: {
            backgroundColor: "transparent",
            padding: "0.5rem",
          },
          content: {
            backgroundColor: "transparent",
            padding: "0.5rem",
            height: "100%",
          },
          typographyStylesProvider: {
            height: "100%",
          },
        })}
      >
        <RichTextEditor.Toolbar
          style={{
            display: isEditing && options.showToolbar === true ? "flex" : "none",
          }}
        >
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold title={tControls("bold")} />
            <RichTextEditor.Italic title={tControls("italic")} />
            <RichTextEditor.Strikethrough title={tControls("strikethrough")} />
            <RichTextEditor.Underline title={tControls("underline")} />
            <TextColorControl />
            <TextHighlightControl />
            <RichTextEditor.Code title={tControls("code")} />
            <RichTextEditor.ClearFormatting title={tControls("clear")} />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 title={tControls("heading", { level: "1" })} />
            <RichTextEditor.H2 title={tControls("heading", { level: "2" })} />
            <RichTextEditor.H3 title={tControls("heading", { level: "3" })} />
            <RichTextEditor.H4 title={tControls("heading", { level: "4" })} />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.AlignLeft
              title={tControls("align", {
                position: t("widget.notebook.align.left"),
              })}
            />
            <RichTextEditor.AlignCenter
              title={tControls("align", {
                position: t("widget.notebook.align.center"),
              })}
            />
            <RichTextEditor.AlignRight
              title={tControls("align", {
                position: t("widget.notebook.align.right"),
              })}
            />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Blockquote title={tControls("blockquote")} />
            <RichTextEditor.Hr title={tControls("horizontalLine")} />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.BulletList title={tControls("bulletList")} />
            <RichTextEditor.OrderedList title={tControls("orderedList")} />
            <TaskListToggle />
            {(Boolean(editor?.isActive("taskList")) ||
              Boolean(editor?.isActive("bulletList")) ||
              Boolean(editor?.isActive("orderedList"))) && (
              <>
                <ListIndentIncrease />
                <ListIndentDecrease />
              </>
            )}
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link title={tControls("link")} />
            <RichTextEditor.Unlink title={tControls("unlink")} />
            <EmbedImage />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <TableToggle />
            {editor?.isActive("table") && (
              <>
                <ColorCellControl />
                <TableToggleMerge />
                <TableAddColumnBefore />
                <TableAddColumnAfter />
                <TableRemoveColumn />
                <TableAddRowBefore />
                <TableAddRowAfter />
                <TableRemoveRow />
              </>
            )}
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
        {editor && (
          <BubbleMenu editor={editor}>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold title={tControls("bold")} />
              <RichTextEditor.Italic title={tControls("italic")} />
              <RichTextEditor.Link title={tControls("link")} />
            </RichTextEditor.ControlsGroup>
          </BubbleMenu>
        )}

        <ScrollArea
          mih="4rem"
          offsetScrollbars
          pl={12}
          pt={12}
          styles={{
            root: {
              height: "100%",
            },
            content: {
              height: "100%",
            },
          }}
        >
          <RichTextEditor.Content />
        </ScrollArea>
      </RichTextEditor>
      {canChange && (
        <>
          <ActionIcon
            title={isEditing ? t("common.action.save") : t("common.action.edit")}
            style={{
              zIndex: 1,
            }}
            top={7}
            right={7}
            pos="absolute"
            color={primaryColor}
            variant="light"
            size={30}
            radius={"md"}
            onClick={handleEditToggle}
          >
            {isEditing ? <IconDeviceFloppy {...iconProps} /> : <IconEdit {...iconProps} />}
          </ActionIcon>
          {isEditing && (
            <ActionIcon
              title={t("common.action.cancel")}
              style={{
                zIndex: 1,
              }}
              top={44}
              right={7}
              pos="absolute"
              color={primaryColor}
              variant="light"
              size={30}
              radius={"md"}
              onClick={handleEditCancel}
            >
              <IconX {...iconProps} />
            </ActionIcon>
          )}
        </>
      )}
    </Box>
  );
}

function TextHighlightControl() {
  const tControls = useScopedI18n("widget.notebook.controls");
  const { editor } = useRichTextEditorContext();
  const defaultColor = "transparent";

  const getCurrent = useCallback(() => {
    return editor?.getAttributes("highlight").color as string | undefined;
  }, [editor]);

  const update = useCallback(
    (value: string) => {
      if (value === defaultColor) {
        editor?.chain().focus().unsetHighlight().run();
        return;
      }
      editor?.chain().focus().setHighlight({ color: value }).run();
    },
    [editor, defaultColor],
  );

  return (
    <ColorControl
      defaultColor={defaultColor}
      getCurrent={getCurrent}
      update={update}
      icon={IconHighlight}
      ariaLabel={tControls("colorHighlight")}
    />
  );
}

function TextColorControl() {
  const tControls = useScopedI18n("widget.notebook.controls");
  const { editor } = useRichTextEditorContext();
  const { black, colors } = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const defaultColor = colorScheme === "dark" ? colors.dark[0] : black;

  const getCurrent = useCallback(() => {
    return editor?.getAttributes("textStyle").color as string | undefined;
  }, [editor]);

  const update = useCallback(
    (value: string) => {
      if (value === defaultColor) {
        editor?.chain().focus().unsetColor().run();
        return;
      }
      editor?.chain().focus().setColor(value).run();
    },
    [editor, defaultColor],
  );

  return (
    <ColorControl
      defaultColor={defaultColor}
      getCurrent={getCurrent}
      update={update}
      icon={IconLetterA}
      ariaLabel={tControls("colorText")}
    />
  );
}

function ColorCellControl() {
  const tControls = useScopedI18n("widget.notebook.controls");
  const { editor } = useRichTextEditorContext();

  const getCurrent = useCallback(() => {
    return editor?.getAttributes("tableCell").backgroundColor as string | undefined;
  }, [editor]);

  const update = useCallback(
    (value: string) => {
      editor?.chain().focus().setCellAttribute("backgroundColor", value).run();
    },
    [editor],
  );

  return (
    <ColorControl
      defaultColor="transparent"
      getCurrent={getCurrent}
      update={update}
      icon={IconLayoutGrid}
      ariaLabel={tControls("colorCell")}
    />
  );
}

interface ColorControlProps {
  defaultColor: string;
  getCurrent: () => string | undefined;
  update: (value: string) => void;
  icon: TablerIcon;
  ariaLabel: string;
}

const ColorControl = ({ defaultColor, getCurrent, update, icon: Icon, ariaLabel }: ColorControlProps) => {
  const { editor } = useRichTextEditorContext();
  const [color, setColor] = useState(defaultColor);
  const { colors, white } = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const [opened, { close, toggle }] = useDisclosure(false);
  const t = useI18n();

  const palette = [
    "#000000",
    colors.dark[9],
    colors.dark[6],
    colors.dark[3],
    colors.dark[0],
    "#FFFFFF",
    colors.red[9],
    colors.pink[7],
    colors.grape[8],
    colors.violet[9],
    colors.indigo[9],
    colors.blue[5],
    colors.green[6],
    "#09D630",
    colors.lime[5],
    colors.yellow[5],
    "#EB8415",
    colors.orange[9],
  ];

  const onSelection = useCallback(() => {
    setColor(getCurrent() ?? defaultColor);
  }, [getCurrent, defaultColor, setColor]);

  useEffect(() => {
    editor?.on("selectionUpdate", onSelection);

    return () => {
      editor?.off("selectionUpdate", onSelection);
    };
  });

  const handleApplyColor = useCallback(() => {
    update(color);
    close();
  }, [color, update, close]);

  const handleClearColor = useCallback(() => {
    update(defaultColor);
    setColor(defaultColor);
    close();
  }, [update, setColor, close, defaultColor]);

  return (
    <Popover
      opened={opened}
      onChange={toggle}
      styles={{
        dropdown: {
          backgroundColor: colorScheme === "dark" ? colors.dark[7] : white,
        },
      }}
    >
      <Popover.Target>
        <RichTextEditor.Control onClick={toggle} title={ariaLabel}>
          <Group gap={3} px="0.2rem">
            <Icon {...controlIconProps} />
            <ColorSwatch size={14} color={color} />
          </Group>
        </RichTextEditor.Control>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap={8}>
          <ColorPicker value={color} onChange={setColor} format="hexa" swatches={palette} swatchesPerRow={6} />
          <Group justify="right" gap={8}>
            <ActionIcon title={t("common.action.cancel")} variant="default" onClick={close}>
              <IconX stroke={1.5} size="1rem" />
            </ActionIcon>
            <ActionIcon title={t("common.action.apply")} variant="default" onClick={handleApplyColor}>
              <IconCheck stroke={1.5} size="1rem" />
            </ActionIcon>
            <ActionIcon title={t("widget.notebook.popover.clearColor")} variant="default" onClick={handleClearColor}>
              <IconCircleOff stroke={1.5} size="1rem" />
            </ActionIcon>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

function EmbedImage() {
  const tControls = useScopedI18n("widget.notebook.controls");
  const t = useI18n();
  const { editor } = useRichTextEditorContext();
  const { colors, white } = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const [opened, { open, close, toggle }] = useDisclosure(false);
  const form = useForm({
    initialValues: {
      src: (editor?.getAttributes("image").src as string | undefined) ?? "",
      width: (editor?.getAttributes("image").width as string | undefined) ?? "",
    },
  });

  const handleOpen = useCallback(() => {
    form.reset();
    open();
  }, [form, open]);

  const handleSubmit = useCallback(
    (values: { src: string; width: string }) => {
      editor?.commands.insertContent({
        type: "paragraph",
        content: [
          {
            type: "image",
            attrs: values,
          },
        ],
      });
      close();
    },
    [editor, close],
  );

  return (
    <Popover
      opened={opened}
      onClose={close}
      onOpen={handleOpen}
      position="left"
      styles={{
        dropdown: {
          backgroundColor: colorScheme === "dark" ? colors.dark[7] : white,
        },
      }}
      trapFocus
    >
      <Popover.Target>
        <RichTextEditor.Control onClick={toggle} title={tControls("image")} active={editor?.isActive("image")}>
          <IconPhoto stroke={1.5} size="1rem" />
        </RichTextEditor.Control>
      </Popover.Target>
      <Popover.Dropdown>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap={5}>
            <TextInput
              label={t("widget.notebook.popover.source")}
              placeholder="https://example.com/"
              {...form.getInputProps("src")}
            />
            <TextInput
              label={t("widget.notebook.popover.width")}
              placeholder={t("widget.notebook.popover.widthPlaceholder")}
              {...form.getInputProps("width")}
            />
            <Button type="submit" variant="default" mt={10} mb={5}>
              {t("common.action.save")}
            </Button>
          </Stack>
        </form>
      </Popover.Dropdown>
    </Popover>
  );
}

function TaskListToggle() {
  const { editor } = useRichTextEditorContext();
  const tControls = useScopedI18n("widget.notebook.controls");
  const handleToggleTaskList = useCallback(() => {
    editor?.chain().focus().toggleTaskList().run();
  }, [editor]);

  return (
    <RichTextEditor.Control
      title={tControls("checkList")}
      onClick={handleToggleTaskList}
      active={editor?.isActive("taskList")}
    >
      <IconListCheck stroke={1.5} size="1rem" />
    </RichTextEditor.Control>
  );
}

function ListIndentIncrease() {
  const { editor } = useRichTextEditorContext();
  const [itemType, setItemType] = useState("listItem");
  const tControls = useScopedI18n("widget.notebook.controls");
  const handleIncreaseIndent = useCallback(() => {
    editor?.chain().focus().sinkListItem(itemType).run();
  }, [editor, itemType]);

  editor?.on("selectionUpdate", ({ editor }) => {
    setItemType(editor.isActive("taskItem") ? "taskItem" : "listItem");
  });

  return (
    <RichTextEditor.Control
      title={tControls("increaseIndent")}
      onClick={handleIncreaseIndent}
      interactive={editor?.can().sinkListItem(itemType)}
    >
      <IconIndentIncrease stroke={1.5} size="1rem" />
    </RichTextEditor.Control>
  );
}

function ListIndentDecrease() {
  const { editor } = useRichTextEditorContext();
  const [itemType, setItemType] = useState("listItem");
  const tControls = useScopedI18n("widget.notebook.controls");

  const handleDecreaseIndent = useCallback(() => {
    editor?.chain().focus().liftListItem(itemType).run();
  }, [editor, itemType]);

  editor?.on("selectionUpdate", ({ editor }) => {
    setItemType(editor.isActive("taskItem") ? "taskItem" : "listItem");
  });

  return (
    <RichTextEditor.Control
      title={tControls("decreaseIndent")}
      onClick={handleDecreaseIndent}
      interactive={editor?.can().liftListItem(itemType)}
    >
      <IconIndentDecrease stroke={1.5} size="1rem" />
    </RichTextEditor.Control>
  );
}

const handleAddColumnBefore = (editor: Editor) => {
  editor.commands.addColumnBefore();
};

const TableAddColumnBefore = () => (
  <TableControl title="addColumnLeft" onClick={handleAddColumnBefore} icon={IconColumnInsertLeft} />
);

const handleAddColumnAfter = (editor: Editor) => {
  editor.commands.addColumnAfter();
};

const TableAddColumnAfter = () => (
  <TableControl title="addColumnRight" onClick={handleAddColumnAfter} icon={IconColumnInsertRight} />
);

const handleRemoveColumn = (editor: Editor) => {
  editor.commands.deleteColumn();
};

const TableRemoveColumn = () => (
  <TableControl title="deleteColumn" onClick={handleRemoveColumn} icon={IconColumnRemove} />
);

const handleAddRowBefore = (editor: Editor) => {
  editor.commands.addRowBefore();
};

const TableAddRowBefore = () => <TableControl title="addRowTop" onClick={handleAddRowBefore} icon={IconRowInsertTop} />;

const handleAddRowAfter = (editor: Editor) => {
  editor.commands.addRowAfter();
};

const TableAddRowAfter = () => (
  <TableControl title="addRowBelow" onClick={handleAddRowAfter} icon={IconRowInsertBottom} />
);

const handleRemoveRow = (editor: Editor) => {
  editor.commands.deleteRow();
};

const TableRemoveRow = () => <TableControl title="deleteRow" onClick={handleRemoveRow} icon={IconRowRemove} />;

interface TableControlProps {
  title: Exclude<keyof TranslationObject["widget"]["notebook"]["controls"], "align" | "heading">;
  onClick: (editor: Editor) => void;
  icon: TablerIcon;
}

const TableControl = ({ title, onClick, icon: Icon }: TableControlProps) => {
  const { editor } = useRichTextEditorContext();
  const tControls = useScopedI18n("widget.notebook.controls");
  const handleControlClick = useCallback(() => {
    if (!editor) return;
    onClick(editor);
  }, [editor, onClick]);

  return (
    <RichTextEditor.Control title={tControls(title)} onClick={handleControlClick}>
      <Icon {...controlIconProps} />
    </RichTextEditor.Control>
  );
};

function TableToggleMerge() {
  const { editor } = useRichTextEditorContext();
  const tControls = useScopedI18n("widget.notebook.controls");
  const handleToggleMerge = useCallback(() => {
    editor?.commands.mergeOrSplit();
  }, [editor]);

  return (
    <RichTextEditor.Control
      title={tControls("mergeCell")}
      onClick={handleToggleMerge}
      active={editor?.getAttributes("tableCell").colspan > 1}
    >
      <svg
        height="1.25rem"
        width="1.25rem"
        strokeWidth="0.1"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* No existing icon from tabler, taken from https://icon-sets.iconify.design/fluent/table-cells-merge-24-regular/ */}
        <path
          fill="currentColor"
          d="M15.58 11.25H8.42l.89-1.002a.75.75 0 0 0-1.12-.996l-2 2.25a.75.75 0 0 0 0 .996l2 2.25a.75.75 0 1 0 1.12-.996l-.89-1.002h7.16l-.89 1.002a.75.75 0 0 0 1.12.996l2-2.25l.011-.012a.746.746 0 0 0-.013-.987l-1.997-2.247a.75.75 0 0 0-1.121.996l.89 1.002ZM6.25 3A3.25 3.25 0 0 0 3 6.25v11.5A3.25 3.25 0 0 0 6.25 21h11.5A3.25 3.25 0 0 0 21 17.75V6.25A3.25 3.25 0 0 0 17.75 3H6.25ZM4.5 6.25c0-.966.784-1.75 1.75-1.75h11.5c.966 0 1.75.784 1.75 1.75v.25h-15v-.25ZM4.5 8h15v8h-15V8Zm15 9.5v.25a1.75 1.75 0 0 1-1.75 1.75H6.25a1.75 1.75 0 0 1-1.75-1.75v-.25h15Z"
        />
      </svg>
    </RichTextEditor.Control>
  );
}

function TableToggle() {
  const { editor } = useRichTextEditorContext();
  const isActive = editor?.isActive("table");

  const { colors, white } = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  const [opened, { open, close, toggle }] = useDisclosure(false);
  const t = useI18n();
  const tControls = useScopedI18n("widget.notebook.controls");
  const form = useForm({
    initialValues: {
      cols: 3,
      rows: 3,
    },
  });

  const handleOpen = useCallback(() => {
    form.reset();
    open();
  }, [form, open]);

  const handleSubmit = useCallback(
    (values: { rows: number; cols: number }) => {
      editor?.commands.insertTable({ ...values, withHeaderRow: false });
      close();
    },
    [editor, close],
  );

  const handleControlClick = useCallback(() => {
    if (isActive) {
      editor?.commands.deleteTable();
    } else {
      toggle();
    }
  }, [isActive, editor, toggle]);

  return (
    <Popover
      opened={opened}
      onOpen={handleOpen}
      onClose={close}
      styles={{
        dropdown: {
          backgroundColor: colorScheme === "dark" ? colors.dark[7] : white,
        },
      }}
      trapFocus
    >
      <Popover.Target>
        <RichTextEditor.Control
          title={tControls(isActive ? "deleteTable" : "addTable")}
          active={isActive}
          onClick={handleControlClick}
        >
          {isActive ? <IconTableOff stroke={1.5} size="1rem" /> : <IconTablePlus stroke={1.5} size="1rem" />}
        </RichTextEditor.Control>
      </Popover.Target>
      <Popover.Dropdown>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap={5}>
            <NumberInput label={t("widget.notebook.popover.columns")} min={1} {...form.getInputProps("cols")} />
            <NumberInput label={t("widget.notebook.popover.rows")} min={1} {...form.getInputProps("rows")} />
            <Button type="submit" variant="default" mt={10} mb={5}>
              {t("common.action.insert")}
            </Button>
          </Stack>
        </form>
      </Popover.Dropdown>
    </Popover>
  );
}
