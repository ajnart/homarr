"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { z } from "zod/v4";

import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import type { TranslationFunction } from "@homarr/translation";
import { useScopedI18n } from "@homarr/translation/client";
import type { searchEngineManageSchema } from "@homarr/validation/search-engine";

import { SearchEngineForm } from "../_form";

export const SearchEngineNewForm = () => {
  const t = useScopedI18n("search.engine.page.create.notification");
  const router = useRouter();

  const { mutate, isPending } = clientApi.searchEngine.create.useMutation({
    onSuccess: async () => {
      showSuccessNotification({
        title: t("success.title"),
        message: t("success.message"),
      });
      await revalidatePathActionAsync("/manage/search-engines");
      router.push("/manage/search-engines");
    },
    onError: () => {
      showErrorNotification({
        title: t("error.title"),
        message: t("error.message"),
      });
    },
  });

  const handleSubmit = useCallback(
    (values: z.infer<typeof searchEngineManageSchema>) => {
      mutate(values);
    },
    [mutate],
  );

  const submitButtonTranslation = useCallback((t: TranslationFunction) => t("common.action.create"), []);

  return (
    <SearchEngineForm
      submitButtonTranslation={submitButtonTranslation}
      handleSubmit={handleSubmit}
      isPending={isPending}
    />
  );
};
