"use client";

import { startTransition, useCallback, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Group,
  PasswordInput,
  Stack,
  Stepper,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { IconPlus, IconUserCheck } from "@tabler/icons-react";
import { z } from "zod/v4";

import { clientApi } from "@homarr/api/client";
import type { GroupPermissionKey } from "@homarr/definitions";
import { everyoneGroup, groupPermissions } from "@homarr/definitions";
import type { IsValid } from "@homarr/form";
import { useZodForm } from "@homarr/form";
import { useModalAction } from "@homarr/modals";
import { showErrorNotification } from "@homarr/notifications";
import { useI18n, useScopedI18n } from "@homarr/translation/client";
import { CustomPasswordInput, UserAvatar } from "@homarr/ui";
import { createCustomErrorParams } from "@homarr/validation/form/i18n";
import { userPasswordSchema } from "@homarr/validation/user";

import { GroupSelectModal } from "~/components/access/group-select-modal";
import { StepperNavigationComponent } from "./stepper-navigation";

interface GroupWithPermissions {
  id: string;
  name: string;
  permissions: GroupPermissionKey[];
}

interface UserCreateStepperComponentProps {
  initialGroups: GroupWithPermissions[];
}

export const UserCreateStepperComponent = ({ initialGroups }: UserCreateStepperComponentProps) => {
  const t = useScopedI18n("management.page.user.create");
  const tUserField = useScopedI18n("user.field");

  const stepperMax = 4;
  const [active, setActive] = useState(0);
  const nextStep = useCallback(
    () => setActive((current) => (current < stepperMax ? current + 1 : current)),
    [setActive],
  );
  const prevStep = useCallback(() => setActive((current) => (current > 0 ? current - 1 : current)), [setActive]);
  const hasNext = active < stepperMax;
  const hasPrevious = active > 0;

  const { mutateAsync, isPending } = clientApi.user.create.useMutation({
    onError(error) {
      showErrorNotification({
        autoClose: false,
        id: "create-user-error",
        title: t("step.error.title"),
        message: error.message,
      });
    },
  });

  const generalForm = useZodForm(
    z.object({
      username: z.string().min(1),
      email: z.string().email().or(z.string().length(0).optional()),
    }),
    {
      initialValues: {
        username: "",
        email: "",
      },
    },
  );

  const securityForm = useZodForm(
    z
      .object({
        password: userPasswordSchema,
        confirmPassword: z.string(),
      })
      .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        params: createCustomErrorParams({
          key: "passwordsDoNotMatch",
          params: {},
        }),
      }),
    {
      initialValues: {
        password: "",
        confirmPassword: "",
      },
    },
  );

  const groupsForm = useZodForm(
    z.object({
      groups: z.array(z.string()),
    }),
    {
      initialValues: {
        groups: initialGroups.map((group) => group.id),
      },
    },
  );

  const allForms = [generalForm, securityForm, groupsForm];
  const isValidCallback: IsValid<unknown> | undefined = allForms[active]?.isValid;
  const currentFormValid = isValidCallback?.() ?? true;

  const controlledGoToNextStep = useCallback(async () => {
    if (active + 1 === stepperMax) {
      await mutateAsync({
        username: generalForm.values.username,
        email: generalForm.values.email,
        password: securityForm.values.password,
        confirmPassword: securityForm.values.confirmPassword,
        groupIds: groupsForm.values.groups,
      });
    }
    nextStep();
  }, [active, generalForm, securityForm, groupsForm, mutateAsync, nextStep]);

  const reset = useCallback(() => {
    setActive(0);
    allForms.forEach((form) => {
      form.reset();
    });
  }, [allForms]);

  return (
    <>
      <Title mb="md">{t("title")}</Title>
      <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false} mb="md">
        <Stepper.Step
          label={t("step.personalInformation.label")}
          allowStepSelect={false}
          allowStepClick={false}
          color={!generalForm.isValid() ? "red" : undefined}
        >
          <form>
            <Card p="xl" shadow="md" withBorder>
              <Stack gap="md">
                <TextInput
                  label={tUserField("username.label")}
                  variant="filled"
                  withAsterisk
                  {...generalForm.getInputProps("username")}
                />

                <TextInput label={tUserField("email.label")} variant="filled" {...generalForm.getInputProps("email")} />
              </Stack>
            </Card>
          </form>
        </Stepper.Step>
        <Stepper.Step label={t("step.security.label")} allowStepSelect={false} allowStepClick={false}>
          <form>
            <Card p="xl" shadow="md" withBorder>
              <Stack gap="md">
                <CustomPasswordInput
                  withPasswordRequirements
                  label={tUserField("password.label")}
                  variant="filled"
                  withAsterisk
                  {...securityForm.getInputProps("password")}
                />
                <PasswordInput
                  label={tUserField("passwordConfirm.label")}
                  variant="filled"
                  withAsterisk
                  {...securityForm.getInputProps("confirmPassword")}
                />
              </Stack>
            </Card>
          </form>
        </Stepper.Step>
        <Stepper.Step label={t("step.groups.label")} allowStepSelect={false} allowStepClick={false}>
          <Card p="xl" shadow="md" withBorder>
            <GroupsForm
              initialGroups={initialGroups}
              addGroup={(groupId) =>
                groupsForm.setValues((value) => ({ groups: value.groups?.concat(groupId) ?? [groupId] }))
              }
              removeGroup={(groupId) => {
                groupsForm.setValues((value) => ({ groups: value.groups?.filter((group) => group !== groupId) ?? [] }));
              }}
            />
          </Card>
        </Stepper.Step>
        <Stepper.Step label={t("step.review.label")} allowStepSelect={false} allowStepClick={false}>
          <Card p="xl" shadow="md" withBorder>
            <Stack maw={300} align="center" mx="auto">
              <UserAvatar
                size="xl"
                user={{ name: generalForm.values.username, email: generalForm.values.email ?? null, image: null }}
              />
              <Text tt="uppercase" fw="bolder" size="xl">
                {generalForm.values.username}
              </Text>
            </Stack>
          </Card>
        </Stepper.Step>
        <Stepper.Completed>
          <Card p="xl" shadow="md" withBorder>
            <Stack align="center" maw={300} mx="auto">
              <IconUserCheck size="3rem" />
              <Title order={2}>{t("step.completed.title")}</Title>
            </Stack>
          </Card>
        </Stepper.Completed>
      </Stepper>
      <StepperNavigationComponent
        hasNext={hasNext && currentFormValid}
        hasPrevious={hasPrevious}
        isComplete={active === stepperMax}
        isLoadingNextStep={isPending}
        nextStep={controlledGoToNextStep}
        prevStep={prevStep}
        reset={reset}
      />
    </>
  );
};

interface GroupsFormProps {
  addGroup: (groupId: string) => void;
  removeGroup: (groupId: string) => void;
  initialGroups: GroupWithPermissions[];
}

const GroupsForm = ({ addGroup, removeGroup, initialGroups }: GroupsFormProps) => {
  const t = useI18n();
  const [groups, { append, filter }] = useListState<GroupWithPermissions>(initialGroups);
  const { openModal } = useModalAction(GroupSelectModal);

  const handleAddClick = () => {
    openModal({
      presentGroupIds: groups.map((group) => group.id),
      withPermissions: true,
      onSelect({ id, name, permissions }) {
        if (!permissions) return;

        startTransition(() => {
          addGroup(id);
          append({ id, name, permissions });
        });
      },
    });
  };

  const handleGroupRemove = (id: string) => {
    filter((group) => group.id !== id);
    removeGroup(id);
  };

  return (
    <form>
      <Stack>
        <Group justify="space-between">
          <Stack gap={0}>
            <Text fw={500}>{t("management.page.user.create.step.groups.title")}</Text>
            <Text size="sm" c="gray.6">
              {t("management.page.user.create.step.groups.description", { everyoneGroup })}
            </Text>
          </Stack>
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconPlus size={16} stroke={1.5} />}
            onClick={handleAddClick}
          >
            {t("common.action.add")}
          </Button>
        </Group>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("group.field.name")}</Table.Th>
              <Table.Th>{t("permission.title")}</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {groups.map((group) => (
              <Table.Tr key={group.id}>
                <Table.Td>{group.name}</Table.Td>
                <Table.Td w="100%">
                  <Group gap="xs">
                    {Object.entries(groupPermissions)
                      .flatMap(([key, values]) =>
                        Array.isArray(values)
                          ? values.map((value) => ({ key, value: value as string }))
                          : [{ key, value: key }],
                      )
                      .filter(({ key, value }) =>
                        group.permissions.some(
                          (permission) => permission === (key === value ? key : `${key}-${value}`),
                        ),
                      )
                      .map(({ key, value }) => (
                        <PermissionBadge key={`${key}-${value}`} category={key} value={value} />
                      ))}
                  </Group>
                </Table.Td>
                <Table.Td>
                  {group.name !== everyoneGroup && (
                    <Button variant="subtle" onClick={() => handleGroupRemove(group.id)}>
                      {t("common.action.remove")}
                    </Button>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </form>
  );
};

const PermissionBadge = ({ category, value }: { category: string; value: string }) => {
  const t = useI18n();

  return (
    <Tooltip label={t(`group.permission.${category}.item.${value}.description` as never)}>
      <Badge color={category === "admin" ? "red" : "blue"} size="sm" variant="dot">
        {t(`group.permission.${category}.item.${value}.label` as never)}
      </Badge>
    </Tooltip>
  );
};
