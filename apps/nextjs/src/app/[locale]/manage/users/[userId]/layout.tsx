import type { PropsWithChildren } from "react";
import { notFound } from "next/navigation";
import { Grid, GridCol, Group, Stack, Text, Title } from "@mantine/core";
import { IconSettings, IconShieldLock } from "@tabler/icons-react";

import { api } from "@homarr/api/server";
import { auth } from "@homarr/auth/next";
import { getI18n, getScopedI18n } from "@homarr/translation/server";
import { UserAvatar } from "@homarr/ui";

import { ManageContainer } from "~/components/manage/manage-container";
import { DynamicBreadcrumb } from "~/components/navigation/dynamic-breadcrumb";
import { catchTrpcNotFound } from "~/errors/trpc-catch-error";
import { NavigationLink } from "../groups/[id]/_navigation";
import { canAccessUserEditPage } from "./access";

interface LayoutProps {
  params: Promise<{ userId: string }>;
}

export default async function Layout(props: PropsWithChildren<LayoutProps>) {
  const params = await props.params;

  const { children } = props;

  const session = await auth();
  const t = await getI18n();
  const tUser = await getScopedI18n("management.page.user");
  const user = await api.user.getById({ userId: params.userId }).catch(catchTrpcNotFound);

  if (!canAccessUserEditPage(session, user.id)) {
    notFound();
  }

  const isCredentialsUser = user.provider === "credentials";

  return (
    <ManageContainer size="xl">
      <DynamicBreadcrumb
        dynamicMappings={
          new Map([
            [params.userId, user.name ?? ""],
            ["general", t("navigationStructure.manage.users.general")],
            ["security", t("navigationStructure.manage.users.security")],
          ])
        }
      />
      <Grid>
        <GridCol span={12}>
          <Group align="center">
            <UserAvatar user={user} size="lg" />
            <Stack gap={0}>
              <Title order={3}>{user.name}</Title>
              <Text c="gray.5">{t("user.name")}</Text>
            </Stack>
          </Group>
        </GridCol>
        <GridCol span={{ xs: 12, md: 4, lg: 3, xl: 2 }}>
          <Stack>
            <Stack gap={0}>
              <NavigationLink
                href={`/manage/users/${params.userId}/general`}
                label={tUser("setting.general.title")}
                icon={<IconSettings size="1rem" stroke={1.5} />}
              />
              {isCredentialsUser && (
                <NavigationLink
                  href={`/manage/users/${params.userId}/security`}
                  label={tUser("setting.security.title")}
                  icon={<IconShieldLock size="1rem" stroke={1.5} />}
                />
              )}
            </Stack>
          </Stack>
        </GridCol>
        <GridCol span={{ xs: 12, md: 8, lg: 9, xl: 10 }}>{children}</GridCol>
      </Grid>
    </ManageContainer>
  );
}
