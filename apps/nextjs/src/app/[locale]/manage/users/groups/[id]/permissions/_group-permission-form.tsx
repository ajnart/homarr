"use client";

import type { PropsWithChildren } from "react";
import { useCallback } from "react";
import { Button, Card, Group, Switch, Text, Transition } from "@mantine/core";

import { clientApi } from "@homarr/api/client";
import { objectEntries } from "@homarr/common";
import type { GroupPermissionKey } from "@homarr/definitions";
import { groupPermissionKeys } from "@homarr/definitions";
import { createFormContext } from "@homarr/form";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useI18n, useScopedI18n } from "@homarr/translation/client";

const [FormProvider, useFormContext, useForm] = createFormContext<FormType>();

interface PermissionFormProps {
  initialPermissions: GroupPermissionKey[];
}

export const PermissionForm = ({ children, initialPermissions }: PropsWithChildren<PermissionFormProps>) => {
  const form = useForm({
    initialValues: groupPermissionKeys.reduce((acc, key) => {
      acc[key] = initialPermissions.includes(key);
      return acc;
    }, {} as FormType),
    onValuesChange(values) {
      const currentKeys = objectEntries(values)
        .filter(([_key, value]) => Boolean(value))
        .map(([key]) => key);

      if (
        currentKeys.every((key) => initialPermissions.includes(key)) &&
        initialPermissions.every((key) => currentKeys.includes(key))
      ) {
        form.resetDirty(); // Reset dirty state if all keys are the same as initial
      }
    },
  });

  return (
    <form>
      <FormProvider form={form}>{children}</FormProvider>
    </form>
  );
};

type FormType = Record<GroupPermissionKey, boolean>;

export const PermissionSwitch = ({ name }: { name: GroupPermissionKey }) => {
  const form = useFormContext();

  const props = form.getInputProps(name, {
    withError: false,
    type: "checkbox",
  });

  return <Switch {...props} />;
};

interface SaveAffixProps {
  groupId: string;
}

export const SaveAffix = ({ groupId }: SaveAffixProps) => {
  const t = useI18n();
  const tForm = useScopedI18n("management.page.group.setting.permissions.form");
  const tNotification = useScopedI18n("group.action.changePermissions.notification");
  const form = useFormContext();
  const { mutate, isPending } = clientApi.group.savePermissions.useMutation();

  const handleSubmit = useCallback(() => {
    const values = form.getValues();
    mutate(
      {
        permissions: objectEntries(values)
          .filter(([_, value]) => value)
          .map(([key]) => key),
        groupId,
      },
      {
        onSuccess: () => {
          // Set new initial values for discard and reset dirty state
          form.setInitialValues(values);
          showSuccessNotification({
            title: tNotification("success.title"),
            message: tNotification("success.message"),
          });
        },
        onError() {
          showErrorNotification({
            title: tNotification("error.title"),
            message: tNotification("error.message"),
          });
        },
      },
    );
  }, [form, groupId, mutate, tNotification]);

  return (
    <div style={{ position: "sticky", bottom: 20 }}>
      <Transition transition="slide-up" mounted={form.isDirty()}>
        {(transitionStyles) => (
          <Card style={transitionStyles} withBorder>
            <Group justify="space-between">
              <Text fw={500}>{tForm("unsavedChanges")}</Text>
              <Group>
                <Button disabled={isPending} onClick={form.reset}>
                  {t("common.action.discard")}
                </Button>
                <Button loading={isPending} onClick={handleSubmit}>
                  {t("common.action.saveChanges")}
                </Button>
              </Group>
            </Group>
          </Card>
        )}
      </Transition>
    </div>
  );
};
