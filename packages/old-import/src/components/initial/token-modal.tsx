import { Button, Group, PasswordInput, Stack } from "@mantine/core";
import { z } from "zod/v4";

import { useZodForm } from "@homarr/form";
import { createModal } from "@homarr/modals";
import { showErrorNotification } from "@homarr/notifications";
import { useI18n, useScopedI18n } from "@homarr/translation/client";

// We don't have access to the API client here, so we need to import it from the API package
// In the future we should consider having the used router also in this package
import { clientApi } from "../../../../api/src/client";

interface InnerProps {
  checksum: string;
  onSuccessAsync: (token: string) => Promise<void>;
}

const formSchema = z.object({
  token: z.string().min(1).max(256),
});

export const ImportTokenModal = createModal<InnerProps>(({ actions, innerProps }) => {
  const t = useI18n();
  const tTokenModal = useScopedI18n("init.step.import.tokenModal");
  const { mutate, isPending } = clientApi.import.validateToken.useMutation();
  const form = useZodForm(formSchema, { initialValues: { token: "" } });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(
      { checksum: innerProps.checksum, token: values.token },
      {
        onSuccess(isValid) {
          if (isValid) {
            actions.closeModal();
            void innerProps.onSuccessAsync(values.token);
          } else {
            showErrorNotification({
              title: tTokenModal("notification.error.title"),
              message: tTokenModal("notification.error.message"),
            });
          }
        },
      },
    );
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <PasswordInput
          {...form.getInputProps("token")}
          label={tTokenModal("field.token.label")}
          description={tTokenModal("field.token.description")}
          withAsterisk
        />
        <Group justify="end">
          <Button variant="subtle" color="gray" onClick={actions.closeModal}>
            {t("common.action.cancel")}
          </Button>
          <Button type="submit" loading={isPending}>
            {t("common.action.confirm")}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}).withOptions({ defaultTitle: (t) => t("init.step.import.tokenModal.title") });
