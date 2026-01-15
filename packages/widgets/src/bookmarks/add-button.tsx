"use client";

import { Button } from "@mantine/core";

import { useModalAction } from "@homarr/modals";
import { useI18n } from "@homarr/translation/client";

import type { SortableItemListInput } from "../options";
import { AppSelectModal } from "./app-select-modal";

export const BookmarkAddButton: SortableItemListInput<
  {
    name: string;
    description: string | null;
    id: string;
    iconUrl: string;
    href: string | null;
    pingUrl: string | null;
  },
  string
>["AddButton"] = ({ addItem, values }) => {
  const { openModal } = useModalAction(AppSelectModal);
  const t = useI18n();

  return (
    <Button onClick={() => openModal({ onSelect: addItem, presentAppIds: values })}>
      {t("widget.bookmarks.option.items.add")}
    </Button>
  );
};
