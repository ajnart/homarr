import { Button, FileInput, Group, Stack } from "@mantine/core";
import { IconCertificate } from "@tabler/icons-react";
import { z } from "zod/v4";

import { clientApi } from "@homarr/api/client";
import type { MaybePromise } from "@homarr/common/types";
import { useZodForm } from "@homarr/form";
import { createModal } from "@homarr/modals";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useI18n } from "@homarr/translation/client";
import { checkCertificateFile } from "@homarr/validation/certificates";

interface InnerProps {
  onSuccess?: () => MaybePromise<void>;
}

export const AddCertificateModal = createModal<InnerProps>(({ actions, innerProps }) => {
  const t = useI18n();
  const form = useZodForm(
    z.object({
      file: z.file().check(checkCertificateFile),
    }),
    {
      initialValues: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        file: null!,
      },
    },
  );
  const { mutateAsync } = clientApi.certificates.addCertificate.useMutation({
    async onSuccess() {
      await innerProps.onSuccess?.();
    },
  });

  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        const formData = new FormData();
        formData.set("file", values.file);
        await mutateAsync(formData, {
          onSuccess() {
            showSuccessNotification({
              title: t("certificate.action.create.notification.success.title"),
              message: t("certificate.action.create.notification.success.message"),
            });
            actions.closeModal();
          },
          onError() {
            showErrorNotification({
              title: t("certificate.action.create.notification.error.title"),
              message: t("certificate.action.create.notification.error.message"),
            });
          },
        });
      })}
    >
      <Stack>
        <FileInput leftSection={<IconCertificate size={16} />} {...form.getInputProps("file")} />
        <Group justify="end">
          <Button onClick={actions.closeModal} variant="subtle" color="gray">
            {t("common.action.cancel")}
          </Button>
          <Button type="submit" loading={form.submitting}>
            {t("common.action.add")}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}).withOptions({
  defaultTitle(t) {
    return t("certificate.action.create.label");
  },
});
