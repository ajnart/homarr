"use client";

import { Button, Fieldset, Grid, Group, Input, NumberInput, Slider, Stack, Text, TextInput } from "@mantine/core";

import { clientApi } from "@homarr/api/client";
import { createId } from "@homarr/common";
import { useZodForm } from "@homarr/form";
import { useI18n } from "@homarr/translation/client";
import { boardSaveLayoutsSchema } from "@homarr/validation/board";

import type { Board } from "../../_types";

interface Props {
  board: Board;
}
export const LayoutSettingsContent = ({ board }: Props) => {
  const t = useI18n();
  const utils = clientApi.useUtils();
  const { mutate: saveLayouts, isPending } = clientApi.board.saveLayouts.useMutation({
    onSettled() {
      void utils.board.getBoardByName.invalidate({ name: board.name });
      void utils.board.getHomeBoard.invalidate();
    },
  });
  const form = useZodForm(boardSaveLayoutsSchema.omit({ id: true }).required(), {
    initialValues: {
      layouts: board.layouts,
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        saveLayouts({
          id: board.id,
          ...values,
        });
      })}
    >
      <Stack>
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Text fw={500}>{t("board.setting.section.layout.responsive.title")}</Text>
            <Button
              variant="subtle"
              onClick={() => {
                form.setValues({
                  layouts: [
                    ...form.values.layouts,
                    {
                      id: createId(),
                      name: "",
                      columnCount: 10,
                      breakpoint: 0,
                    },
                  ],
                });
              }}
            >
              {t("board.setting.section.layout.responsive.action.add")}
            </Button>
          </Group>

          {form.values.layouts.map((layout, index) => (
            <Fieldset key={layout.id} legend={layout.name} bg="transparent">
              <Grid>
                <Grid.Col span={{ sm: 12, md: 6 }}>
                  <TextInput {...form.getInputProps(`layouts.${index}.name`)} label={t("layout.field.name.label")} />
                </Grid.Col>

                <Grid.Col span={{ sm: 12, md: 6 }}>
                  <Input.Wrapper label={t("layout.field.columnCount.label")}>
                    <Slider mt="xs" min={1} max={24} step={1} {...form.getInputProps(`layouts.${index}.columnCount`)} />
                  </Input.Wrapper>
                </Grid.Col>

                <Grid.Col span={{ sm: 12, md: 6 }}>
                  <NumberInput
                    {...form.getInputProps(`layouts.${index}.breakpoint`)}
                    label={t("layout.field.breakpoint.label")}
                    description={t("layout.field.breakpoint.description")}
                  />
                </Grid.Col>
              </Grid>
              {form.values.layouts.length >= 2 && (
                <Group justify="end">
                  <Button
                    variant="subtle"
                    onClick={() => {
                      form.setValues((previous) =>
                        previous.layouts !== undefined && previous.layouts.length >= 2
                          ? {
                              layouts: form.values.layouts.filter((filteredLayout) => filteredLayout.id !== layout.id),
                            }
                          : previous,
                      );
                    }}
                  >
                    {t("common.action.remove")}
                  </Button>
                </Group>
              )}
            </Fieldset>
          ))}
        </Stack>

        <Group justify="end">
          <Button type="submit" loading={isPending}>
            {t("common.action.saveChanges")}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
