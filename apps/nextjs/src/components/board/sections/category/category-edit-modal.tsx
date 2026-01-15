import { Button, Group, Stack, TextInput } from "@mantine/core";
import { z } from "zod/v4";

import { useZodForm } from "@homarr/form";
import { createModal } from "@homarr/modals";
import { useI18n } from "@homarr/translation/client";

interface Category {
  id: string;
  name: string;
}

interface InnerProps {
  submitLabel: string;
  category: Category;
  onSuccess: (category: Category) => void;
}

export const CategoryEditModal = createModal<InnerProps>(({ actions, innerProps }) => {
  const t = useI18n();
  const form = useZodForm(z.object({ name: z.string().min(1) }), {
    initialValues: {
      name: innerProps.category.name,
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        void innerProps.onSuccess({
          ...innerProps.category,
          name: values.name,
        });
        actions.closeModal();
      })}
    >
      <Stack>
        <TextInput label={t("section.category.field.name.label")} data-autofocus {...form.getInputProps("name")} />
        <Group justify="right">
          <Button onClick={actions.closeModal} variant="subtle" color="gray">
            {t("common.action.cancel")}
          </Button>
          <Button type="submit">{innerProps.submitLabel}</Button>
        </Group>
      </Stack>
    </form>
  );
}).withOptions({});
