"use client";

import { Button, Card, Stack, TextInput } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import type { z } from "zod/v4";

import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useZodForm } from "@homarr/form";
import { useI18n } from "@homarr/translation/client";
import { groupCreateSchema } from "@homarr/validation/group";

export const InitGroup = () => {
  const t = useI18n();
  const { mutateAsync } = clientApi.group.createInitialExternalGroup.useMutation({
    async onSuccess() {
      await revalidatePathActionAsync("/init");
    },
  });
  const form = useZodForm(groupCreateSchema, {
    initialValues: {
      name: "",
    },
  });

  const handleSubmitAsync = async (values: z.infer<typeof groupCreateSchema>) => {
    await mutateAsync(values, {
      onError(error) {
        if (error.data?.code === "CONFLICT") {
          form.setErrors({ name: t("common.zod.errors.custom.groupNameTaken") });
        }
      },
    });
  };

  return (
    <Card w={64 * 6} maw="90vw" withBorder>
      <form onSubmit={form.onSubmit(handleSubmitAsync)}>
        <Stack>
          <TextInput
            label={t("init.step.group.form.name.label")}
            description={t("init.step.group.form.name.description")}
            withAsterisk
            {...form.getInputProps("name")}
          />
          <Button type="submit" loading={form.submitting} rightSection={<IconArrowRight size={16} stroke={1.5} />}>
            {t("common.action.continue")}
          </Button>
        </Stack>
      </form>
    </Card>
  );
};
