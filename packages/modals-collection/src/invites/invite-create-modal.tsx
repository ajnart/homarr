import { Button, Group, Stack, Text } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { clientApi } from "@homarr/api/client";
import { useForm } from "@homarr/form";
import { createModal, useModalAction } from "@homarr/modals";
import { useI18n, useScopedI18n } from "@homarr/translation/client";

import { InviteCopyModal } from "./invite-copy-modal";

dayjs.extend(relativeTime);

interface FormType {
  expirationDate: string;
}

export const InviteCreateModal = createModal<void>(({ actions }) => {
  const tInvite = useScopedI18n("management.page.user.invite");
  const t = useI18n();
  const { openModal } = useModalAction(InviteCopyModal);

  const utils = clientApi.useUtils();
  const { mutate, isPending } = clientApi.invite.createInvite.useMutation();
  const minDate = dayjs().add(1, "hour").toDate();
  const maxDate = dayjs().add(6, "months").toDate();

  const form = useForm<FormType>({
    initialValues: {
      expirationDate: dayjs().add(4, "hours").toDate().toISOString(),
    },
  });

  const handleSubmit = (values: FormType) => {
    mutate(
      {
        expirationDate: new Date(values.expirationDate),
      },
      {
        onSuccess: (result) => {
          void utils.invite.getAll.invalidate();
          actions.closeModal();
          openModal(result);
        },
      },
    );
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Text>{tInvite("action.new.description")}</Text>

        <DateTimePicker
          popoverProps={{ withinPortal: true }}
          minDate={minDate}
          maxDate={maxDate}
          withAsterisk
          valueFormat="DD MMM YYYY HH:mm"
          label={tInvite("field.expirationDate.label")}
          variant="filled"
          {...form.getInputProps("expirationDate")}
        />

        <Group justify="end">
          <Button onClick={actions.closeModal} variant="subtle" color="gray">
            {t("common.action.cancel")}
          </Button>
          <Button type="submit" loading={isPending}>
            {t("common.action.create")}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}).withOptions({
  defaultTitle(t) {
    return t("management.page.user.invite.action.new.title");
  },
});
