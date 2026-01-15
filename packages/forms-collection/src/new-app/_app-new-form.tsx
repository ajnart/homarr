"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { z } from "zod/v4";

import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useI18n, useScopedI18n } from "@homarr/translation/client";
import type { appManageSchema } from "@homarr/validation/app";

import { AppForm } from "./_form";

export const AppNewForm = ({
  showCreateAnother,
  showBackToOverview,
}: {
  showCreateAnother: boolean;
  showBackToOverview: boolean;
}) => {
  const tScoped = useScopedI18n("app.page.create.notification");
  const t = useI18n();
  const router = useRouter();

  const { mutate, isPending } = clientApi.app.create.useMutation({
    onError: () => {
      showErrorNotification({
        title: tScoped("error.title"),
        message: tScoped("error.message"),
      });
    },
  });

  const handleSubmit = useCallback(
    (values: z.infer<typeof appManageSchema>, redirect: boolean, afterSuccess?: () => void) => {
      mutate(values, {
        onSuccess() {
          showSuccessNotification({
            title: tScoped("success.title"),
            message: tScoped("success.message"),
          });
          afterSuccess?.();

          if (!redirect) {
            return;
          }
          void revalidatePathActionAsync("/manage/apps").then(() => {
            router.push("/manage/apps");
          });
        },
      });
    },
    [mutate, router, tScoped],
  );

  return (
    <AppForm
      buttonLabels={{
        submit: t("common.action.create"),
        submitAndCreateAnother: showCreateAnother ? t("common.action.createAnother") : undefined,
      }}
      showBackToOverview={showBackToOverview}
      handleSubmit={handleSubmit}
      isPending={isPending}
    />
  );
};
