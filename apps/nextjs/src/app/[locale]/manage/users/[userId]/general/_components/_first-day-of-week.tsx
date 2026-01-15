"use client";

import { Button, Group, Radio, Stack } from "@mantine/core";
import type { DayOfWeek } from "@mantine/dates";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import type { z } from "zod/v4";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useZodForm } from "@homarr/form";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useI18n } from "@homarr/translation/client";
import { userFirstDayOfWeekSchema } from "@homarr/validation/user";

dayjs.extend(localeData);

interface FirstDayOfWeekProps {
  user: RouterOutputs["user"]["getById"];
}

const weekDays = dayjs.weekdays(false);

export const FirstDayOfWeek = ({ user }: FirstDayOfWeekProps) => {
  const t = useI18n();
  const { mutate, isPending } = clientApi.user.changeFirstDayOfWeek.useMutation({
    async onSettled() {
      await revalidatePathActionAsync(`/manage/users/${user.id}`);
    },
    onSuccess(_, variables) {
      form.setInitialValues({
        firstDayOfWeek: variables.firstDayOfWeek,
      });
      showSuccessNotification({
        message: t("user.action.changeFirstDayOfWeek.notification.success.message"),
      });
    },
    onError() {
      showErrorNotification({
        message: t("user.action.changeFirstDayOfWeek.notification.error.message"),
      });
    },
  });
  const form = useZodForm(userFirstDayOfWeekSchema, {
    initialValues: {
      firstDayOfWeek: user.firstDayOfWeek as DayOfWeek,
    },
  });

  const handleSubmit = (values: FormType) => {
    mutate({
      id: user.id,
      ...values,
    });
  };

  const inputProps = form.getInputProps("firstDayOfWeek");
  const onChange = inputProps.onChange as (value: number) => void;
  const value = (inputProps.value as number).toString();

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <Radio.Group {...inputProps} value={value} onChange={(value) => onChange(parseInt(value))}>
          <Group mt="xs">
            <Radio value="1" label={weekDays[1]} />
            <Radio value="6" label={weekDays[6]} />
            <Radio value="0" label={weekDays[0]} />
          </Group>
        </Radio.Group>

        <Group justify="end">
          <Button type="submit" loading={isPending}>
            {t("common.action.save")}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

type FormType = z.infer<typeof userFirstDayOfWeekSchema>;
