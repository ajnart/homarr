"use client";

import {
  Anchor,
  Button,
  Collapse,
  ColorInput,
  ColorSwatch,
  Grid,
  Group,
  InputWrapper,
  isLightColor,
  Select,
  Slider,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconX } from "@tabler/icons-react";

import { useZodForm } from "@homarr/form";
import { useI18n } from "@homarr/translation/client";
import { boardSavePartialSettingsSchema } from "@homarr/validation/board";

import type { Board } from "../../_types";
import { generateColors } from "../../(content)/_theme";
import { useSavePartialSettingsMutation } from "./_shared";

interface Props {
  board: Board;
}

const hexRegex = /^#[0-9a-fA-F]{6}$/;

const progressPercentageLabel = (value: number) => `${value}%`;

export const ColorSettingsContent = ({ board }: Props) => {
  const form = useZodForm(boardSavePartialSettingsSchema, {
    initialValues: {
      primaryColor: board.primaryColor,
      secondaryColor: board.secondaryColor,
      opacity: board.opacity,
      iconColor: board.iconColor ?? "",
      itemRadius: board.itemRadius,
    },
  });
  const [showPreview, { toggle }] = useDisclosure(false);
  const t = useI18n();
  const theme = useMantineTheme();
  const { mutate: savePartialSettings, isPending } = useSavePartialSettingsMutation(board);

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        savePartialSettings({
          id: board.id,
          ...values,
        });
      })}
    >
      <Stack>
        <Grid>
          <Grid.Col span={{ sm: 12, md: 6 }}>
            <Stack gap="xs">
              <ColorInput
                label={t("board.field.primaryColor.label")}
                format="hex"
                swatches={Object.values(theme.colors).map((color) => color[6])}
                {...form.getInputProps("primaryColor")}
              />
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ sm: 12, md: 6 }}>
            <ColorInput
              label={t("board.field.secondaryColor.label")}
              format="hex"
              swatches={Object.values(theme.colors).map((color) => color[6])}
              {...form.getInputProps("secondaryColor")}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Anchor onClick={toggle}>{showPreview ? t("common.preview.hide") : t("common.preview.show")}</Anchor>
          </Grid.Col>
          <Grid.Col span={12}>
            <Collapse in={showPreview}>
              <Stack>
                <ColorsPreview previewColor={form.values.primaryColor} />
                <ColorsPreview previewColor={form.values.secondaryColor} />
              </Stack>
            </Collapse>
          </Grid.Col>
          <Grid.Col span={{ sm: 12, md: 6 }}>
            <InputWrapper label={t("board.field.opacity.label")}>
              <Slider
                my={6}
                min={0}
                max={100}
                step={5}
                label={progressPercentageLabel}
                {...form.getInputProps("opacity")}
              />
            </InputWrapper>
          </Grid.Col>
          <Grid.Col span={{ sm: 12, md: 6 }}>
            <Group align="end">
              <ColorInput
                label={t("board.field.iconColor.label")}
                format="hex"
                swatches={Object.values(theme.colors).map((color) => color[6])}
                flex={1}
                {...form.getInputProps("iconColor")}
              />
              <Button
                variant="subtle"
                leftSection={<IconX />}
                onClick={() => form.setFieldValue("iconColor", "")}
                disabled={!form.values.iconColor}
              >
                {t("board.field.clearColor.label")}
              </Button>
            </Group>
          </Grid.Col>
          <Grid.Col span={{ sm: 12, md: 6 }}>
            <Select
              label={t("board.field.itemRadius.label")}
              description={t("board.field.itemRadius.description")}
              data={[
                { label: t("board.field.itemRadius.option.xs"), value: "xs" },
                { label: t("board.field.itemRadius.option.sm"), value: "sm" },
                { label: t("board.field.itemRadius.option.md"), value: "md" },
                { label: t("board.field.itemRadius.option.lg"), value: "lg" },
                { label: t("board.field.itemRadius.option.xl"), value: "xl" },
              ]}
              {...form.getInputProps("itemRadius")}
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

interface ColorsPreviewProps {
  previewColor: string | undefined;
}

const ColorsPreview = ({ previewColor }: ColorsPreviewProps) => {
  const theme = useMantineTheme();

  const colors = previewColor && hexRegex.test(previewColor) ? generateColors(previewColor) : generateColors("#000000");

  return (
    <Group gap={0} wrap="nowrap">
      {colors.map((color, index) => (
        <ColorSwatch
          key={index}
          color={color}
          w="10%"
          pb="10%"
          c={isLightColor(color) ? "black" : "white"}
          radius={0}
          styles={{
            colorOverlay: {
              borderTopLeftRadius: index === 0 ? theme.radius.md : 0,
              borderBottomLeftRadius: index === 0 ? theme.radius.md : 0,
              borderTopRightRadius: index === 9 ? theme.radius.md : 0,
              borderBottomRightRadius: index === 9 ? theme.radius.md : 0,
            },
          }}
        >
          <Stack align="center" gap={4}>
            <Text visibleFrom="md" fw={500} size="lg">
              {index}
            </Text>
            <Text visibleFrom="md" fw={500} size="xs" tt="uppercase">
              {color}
            </Text>
          </Stack>
        </ColorSwatch>
      ))}
    </Group>
  );
};
