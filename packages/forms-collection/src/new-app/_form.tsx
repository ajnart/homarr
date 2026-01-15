"use client";

import type { ChangeEventHandler } from "react";
import { useEffect, useRef } from "react";
import { Button, Checkbox, Collapse, Group, Stack, Textarea, TextInput } from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import type { z } from "zod/v4";

import { clientApi } from "@homarr/api/client";
import { useZodForm } from "@homarr/form";
import { useI18n } from "@homarr/translation/client";
import { Link } from "@homarr/ui";
import { appManageSchema } from "@homarr/validation/app";

import { IconPicker } from "../icon-picker/icon-picker";
import { findBestIconMatch } from "./icon-matcher";

type FormType = z.infer<typeof appManageSchema>;

interface AppFormProps {
  showBackToOverview: boolean;
  buttonLabels: {
    submit: string;
    submitAndCreateAnother?: string;
  };
  initialValues?: FormType;
  handleSubmit: (values: FormType, redirect: boolean, afterSuccess?: () => void) => void;
  isPending: boolean;
}

export const AppForm = ({
  buttonLabels,
  showBackToOverview,
  handleSubmit: originalHandleSubmit,
  initialValues,
  isPending,
}: AppFormProps) => {
  const t = useI18n();

  const form = useZodForm(appManageSchema, {
    initialValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      iconUrl: initialValues?.iconUrl ?? "",
      href: initialValues?.href ?? "",
      pingUrl: initialValues?.pingUrl ?? "",
    },
  });

  // Debounce the name value with 200ms delay
  const [debouncedName] = useDebouncedValue(form.values.name, 200);

  const shouldCreateAnother = useRef(false);
  const handleSubmit = (values: FormType) => {
    const redirect = !shouldCreateAnother.current;
    const afterSuccess = shouldCreateAnother.current
      ? () => {
          form.reset();
          shouldCreateAnother.current = false;
        }
      : undefined;
    originalHandleSubmit(values, redirect, afterSuccess);
  };

  const [opened, { open, close }] = useDisclosure((initialValues?.pingUrl?.length ?? 0) > 0);

  const handleClickDifferentUrlPing: ChangeEventHandler<HTMLInputElement> = () => {
    if (!opened) {
      open();
    } else {
      close();
      form.setFieldValue("pingUrl", "");
    }
  };

  // Auto-select icon based on app name with debounced search
  const { data: iconsData } = clientApi.icon.findIcons.useQuery(
    {
      searchText: debouncedName,
    },
    {
      enabled: debouncedName.length > 3,
    },
  );

  useEffect(() => {
    if (debouncedName && !form.values.iconUrl && iconsData?.icons) {
      const bestMatch = findBestIconMatch(debouncedName, iconsData.icons);
      if (bestMatch) {
        form.setFieldValue("iconUrl", bestMatch);
      }
    }
  }, [debouncedName, iconsData]);

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput {...form.getInputProps("name")} withAsterisk label={t("app.field.name.label")} />
        <IconPicker {...form.getInputProps("iconUrl")} />
        <Textarea
          {...form.getInputProps("description")}
          label={t("app.field.description.label")}
          autosize
          minRows={2}
          resize="vertical"
        />
        <TextInput {...form.getInputProps("href")} label={t("app.field.url.label")} />

        <Checkbox
          checked={opened}
          onChange={handleClickDifferentUrlPing}
          label={t("app.field.useDifferentUrlForPing.checkbox.label")}
          description={t("app.field.useDifferentUrlForPing.checkbox.description")}
          mt="md"
        />

        <Collapse in={opened}>
          <TextInput {...form.getInputProps("pingUrl")} />
        </Collapse>

        <Group justify="end">
          {showBackToOverview && (
            <Button variant="default" component={Link} href="/manage/apps">
              {t("common.action.backToOverview")}
            </Button>
          )}
          {buttonLabels.submitAndCreateAnother && (
            <Button
              type="submit"
              onClick={() => {
                shouldCreateAnother.current = true;
              }}
              loading={isPending}
            >
              {buttonLabels.submitAndCreateAnother}
            </Button>
          )}
          <Button type="submit" loading={isPending}>
            {buttonLabels.submit}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
