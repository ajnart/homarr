import React from "react";
import { notFound } from "next/navigation";
import { Card, CardSection, Divider, Group, Stack, Text, Title } from "@mantine/core";

import { api } from "@homarr/api/server";
import { auth } from "@homarr/auth/next";
import { objectKeys } from "@homarr/common";
import type { GroupPermissionKey } from "@homarr/definitions";
import { groupPermissions } from "@homarr/definitions";
import { getI18n, getScopedI18n } from "@homarr/translation/server";

import { PermissionForm, PermissionSwitch, SaveAffix } from "./_group-permission-form";

interface GroupPermissionsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function GroupPermissionsPage(props: GroupPermissionsPageProps) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user.permissions.includes("admin")) {
    notFound();
  }

  const group = await api.group.getById({ id: params.id });
  const tPermissions = await getScopedI18n("group.permission");
  const t = await getI18n();

  return (
    <Stack>
      <Title>{t("management.page.group.setting.permissions.title")}</Title>

      <PermissionForm initialPermissions={group.permissions}>
        <Stack pos="relative">
          {objectKeys(groupPermissions).map((group) => {
            const isDanger = group === "admin";

            return (
              <Stack key={group} gap="sm">
                <Title order={2} c={isDanger ? "red.8" : undefined}>
                  {tPermissions(`${group}.title`)}
                </Title>
                <PermissionCard isDanger={isDanger} group={group} />
              </Stack>
            );
          })}

          <SaveAffix groupId={group.id} />
        </Stack>
      </PermissionForm>
    </Stack>
  );
}

interface PermissionCardProps {
  group: keyof typeof groupPermissions;
  isDanger: boolean;
}

const PermissionCard = async ({ group, isDanger }: PermissionCardProps) => {
  const t = await getScopedI18n(`group.permission.${group}.item`);
  const item = groupPermissions[group];
  const permissions = typeof item !== "boolean" ? item : ([group] as "admin"[]);

  return (
    <Card
      p="md"
      withBorder
      style={{
        borderColor: isDanger ? "var(--mantine-color-red-8)" : undefined,
      }}
    >
      <Stack gap="sm">
        {permissions.map((permission, index) => (
          <React.Fragment key={permission}>
            <PermissionRow
              name={createGroupPermissionKey(group, permission)}
              label={t(`${permission}.label`)}
              description={t(`${permission}.description`)}
            />

            {index < permissions.length - 1 && (
              <CardSection>
                <Divider />
              </CardSection>
            )}
          </React.Fragment>
        ))}
      </Stack>
    </Card>
  );
};

const createGroupPermissionKey = (group: keyof typeof groupPermissions, permission: string): GroupPermissionKey => {
  if (typeof groupPermissions[group] === "boolean") {
    return group as GroupPermissionKey;
  }

  return `${group}-${permission}` as GroupPermissionKey;
};

interface PermissionRowProps {
  name: GroupPermissionKey;
  label: string;
  description: string;
}

const PermissionRow = ({ name, label, description }: PermissionRowProps) => {
  return (
    <Group justify="space-between" align="center" wrap="nowrap">
      <Stack gap={0}>
        <Text fw={500}>{label}</Text>
        <Text c="gray.5">{description}</Text>
      </Stack>
      <PermissionSwitch name={name} />
    </Group>
  );
};
