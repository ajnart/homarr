"use client";

import { useEffect, useRef } from "react";
import { Button, Grid, Group, Loader, Stack, TextInput } from "@mantine/core";
import { useDebouncedValue, useDocumentTitle, useFavicon } from "@mantine/hooks";

import { useUpdateBoard } from "@homarr/boards/updater";
import { useZodForm } from "@homarr/form";
import { IconPicker } from "@homarr/forms-collection";
import { useI18n } from "@homarr/translation/client";
import { boardSavePartialSettingsSchema } from "@homarr/validation/board";

import { createMetaTitle } from "~/metadata";
import type { Board } from "../../_types";
import { useSavePartialSettingsMutation } from "./_shared";

interface Props {
  board: Board;
}

export const GeneralSettingsContent = ({ board }: Props) => {
  const t = useI18n();
  const ref = useRef({
    pageTitle: board.pageTitle,
    logoImageUrl: board.logoImageUrl,
  });
  const { updateBoard } = useUpdateBoard();

  const { mutate: savePartialSettings, isPending } = useSavePartialSettingsMutation(board);
  const form = useZodForm(
    boardSavePartialSettingsSchema
      .pick({
        pageTitle: true,
        logoImageUrl: true,
        metaTitle: true,
        faviconImageUrl: true,
      })
      .required(),
    {
      initialValues: {
        pageTitle: board.pageTitle ?? "",
        logoImageUrl: board.logoImageUrl ?? "",
        metaTitle: board.metaTitle ?? "",
        faviconImageUrl: board.faviconImageUrl ?? "",
      },
      onValuesChange({ pageTitle }) {
        updateBoard((previous) => ({
          ...previous,
          pageTitle,
        }));
      },
    },
  );

  useLogoPreview(form.values.logoImageUrl);
  useFaviconPreview(form.values.faviconImageUrl);
  const metaTitleStatus = useMetaTitlePreview(form.values.metaTitle);

  // Cleanup for not applied changes of the page title and logo image URL
  useEffect(() => {
    return () => {
      updateBoard((previous) => ({
        ...previous,
        pageTitle: ref.current.pageTitle,
        logoImageUrl: ref.current.logoImageUrl,
      }));
    };
  }, [updateBoard]);

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        // Save the current values to the ref so that it does not reset if the form is submitted
        ref.current = {
          pageTitle: values.pageTitle,
          logoImageUrl: values.logoImageUrl,
        };
        savePartialSettings({
          id: board.id,
          ...values,
        });
      })}
    >
      <Stack>
        <Grid>
          <Grid.Col span={{ xs: 12, md: 6 }}>
            <TextInput
              label={t("board.field.pageTitle.label")}
              placeholder="Homarr"
              {...form.getInputProps("pageTitle")}
            />
          </Grid.Col>
          <Grid.Col span={{ xs: 12, md: 6 }}>
            <TextInput
              label={t("board.field.metaTitle.label")}
              placeholder={createMetaTitle(t("board.content.metaTitle", { boardName: board.name }))}
              rightSection={metaTitleStatus.isPending && <Loader size="xs" />}
              {...form.getInputProps("metaTitle")}
            />
          </Grid.Col>
          <Grid.Col span={{ xs: 12, md: 6 }}>
            <IconPicker
              {...form.getInputProps("logoImageUrl")}
              label={t("board.field.logoImageUrl.label")}
              placeholder="/logo/logo.png"
              withAsterisk={false}
            />
          </Grid.Col>
          <Grid.Col span={{ xs: 12, md: 6 }}>
            <IconPicker
              {...form.getInputProps("faviconImageUrl")}
              label={t("board.field.faviconImageUrl.label")}
              placeholder="/logo/logo.png"
              withAsterisk={false}
            />
          </Grid.Col>
        </Grid>
        <Group justify="end">
          <Button type="submit" loading={isPending}>
            {t("common.action.saveChanges")}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

const useLogoPreview = (url: string | null) => {
  const { updateBoard } = useUpdateBoard();
  const [logoDebounced] = useDebouncedValue(url ?? "", 500);

  useEffect(() => {
    updateBoard((previous) => ({
      ...previous,
      logoImageUrl: logoDebounced.length >= 1 ? logoDebounced : null,
    }));
  }, [logoDebounced, updateBoard]);
};

const useMetaTitlePreview = (title: string | null) => {
  const [metaTitleDebounced] = useDebouncedValue(title ?? "", 200);
  useDocumentTitle(metaTitleDebounced);

  return {
    isPending: (title ?? "") !== metaTitleDebounced,
  };
};

const useFaviconPreview = (url: string | null) => {
  const [faviconDebounced] = useDebouncedValue(url ?? "", 500);
  useFavicon(faviconDebounced);
};
