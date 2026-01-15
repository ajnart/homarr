import type { z } from "zod/v4";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { AppForm } from "@homarr/forms-collection";
import { createModal } from "@homarr/modals";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useI18n, useScopedI18n } from "@homarr/translation/client";
import type { appManageSchema } from "@homarr/validation/app";

interface QuickAddAppModalProps {
  onClose: (createdApp: Omit<RouterOutputs["app"]["create"], "appId">) => void;
}

export const QuickAddAppModal = createModal<QuickAddAppModalProps>(({ actions, innerProps }) => {
  const tScoped = useScopedI18n("app.page.create.notification");
  const t = useI18n();

  const { mutate, isPending } = clientApi.app.create.useMutation({
    onError: () => {
      showErrorNotification({
        title: tScoped("error.title"),
        message: tScoped("error.message"),
      });
    },
  });

  const handleSubmit = (values: z.infer<typeof appManageSchema>) => {
    mutate(values, {
      onSuccess(app) {
        showSuccessNotification({
          title: tScoped("success.title"),
          message: tScoped("success.message"),
        });

        innerProps.onClose(app);
        actions.closeModal();
      },
    });
  };

  return (
    <AppForm
      buttonLabels={{
        submit: t("board.action.quickCreateApp.modal.createAndUse"),
        submitAndCreateAnother: undefined,
      }}
      showBackToOverview={false}
      handleSubmit={handleSubmit}
      isPending={isPending}
    />
  );
}).withOptions({
  defaultTitle(t) {
    return t("board.action.quickCreateApp.modal.title");
  },
});
