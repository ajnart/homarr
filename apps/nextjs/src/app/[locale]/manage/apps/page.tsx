import { Fragment } from "react";
import { redirect } from "next/navigation";
import { ActionIcon, ActionIconGroup, Anchor, Avatar, Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconBox, IconPencil } from "@tabler/icons-react";
import { z } from "zod/v4";

import type { RouterOutputs } from "@homarr/api";
import { api } from "@homarr/api/server";
import { auth } from "@homarr/auth/next";
import type { inferSearchParamsFromSchema } from "@homarr/common/types";
import { getI18n, getScopedI18n } from "@homarr/translation/server";
import { Link, SearchInput, TablePagination } from "@homarr/ui";

import { ManageContainer } from "~/components/manage/manage-container";
import { MobileAffixButton } from "~/components/manage/mobile-affix-button";
import { DynamicBreadcrumb } from "~/components/navigation/dynamic-breadcrumb";
import { NoResults } from "~/components/no-results";
import { AppDeleteButton } from "./_app-delete-button";

const searchParamsSchema = z.object({
  search: z.string().optional(),
  pageSize: z.string().regex(/\d+/).transform(Number).catch(10),
  page: z.string().regex(/\d+/).transform(Number).catch(1),
});

interface AppsPageProps {
  searchParams: Promise<inferSearchParamsFromSchema<typeof searchParamsSchema>>;
}

export default async function AppsPage(props: AppsPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  const searchParams = searchParamsSchema.parse(await props.searchParams);

  const { items: apps, totalCount } = await api.app.getPaginated(searchParams);
  const t = await getScopedI18n("app");

  return (
    <ManageContainer>
      <DynamicBreadcrumb />
      <Stack>
        <Title>{t("page.list.title")}</Title>
        <Group justify="space-between" align="center">
          <SearchInput placeholder={`${t("search")}...`} defaultValue={searchParams.search} flexExpand />
          {session.user.permissions.includes("app-create") && (
            <MobileAffixButton component={Link} href="/manage/apps/new">
              {t("page.create.title")}
            </MobileAffixButton>
          )}
        </Group>
        {apps.length === 0 && <AppNoResults />}
        {apps.length > 0 && (
          <Stack gap="sm">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </Stack>
        )}

        {/* Added margin to not hide pagination behind affix-button */}
        <Group justify="end" mb={48}>
          <TablePagination total={Math.ceil(totalCount / searchParams.pageSize)} />
        </Group>
      </Stack>
    </ManageContainer>
  );
}

interface AppCardProps {
  app: RouterOutputs["app"]["all"][number];
}

const AppCard = async ({ app }: AppCardProps) => {
  const t = await getScopedI18n("app");
  const session = await auth();

  return (
    <Card withBorder>
      <Group justify="space-between" wrap="nowrap">
        <Group align="top" justify="start" wrap="nowrap" style={{ flex: "1" }}>
          <Avatar
            size="sm"
            src={app.iconUrl}
            radius={0}
            styles={{
              image: {
                objectFit: "contain",
              },
            }}
          />
          <Stack gap={0} style={{ flex: "1" }}>
            <Text fw={500} lineClamp={1}>
              {app.name}
            </Text>
            {app.description && (
              <Text size="sm" c="gray.6" lineClamp={4}>
                {app.description.split("\n").map((line, index) => (
                  <Fragment key={index}>
                    {line}
                    <br />
                  </Fragment>
                ))}
              </Text>
            )}
            {app.href && (
              <Anchor href={app.href} lineClamp={1} size="sm" style={{ wordBreak: "break-all" }}>
                {app.href}
              </Anchor>
            )}
          </Stack>
        </Group>
        <Group>
          <ActionIconGroup>
            {session?.user.permissions.includes("app-modify-all") && (
              <ActionIcon
                component={Link}
                href={`/manage/apps/edit/${app.id}`}
                variant="subtle"
                color="gray"
                aria-label={t("page.edit.title")}
              >
                <IconPencil size={16} stroke={1.5} />
              </ActionIcon>
            )}
            {session?.user.permissions.includes("app-full-all") && <AppDeleteButton app={app} />}
          </ActionIconGroup>
        </Group>
      </Group>
    </Card>
  );
};

const AppNoResults = async () => {
  const t = await getI18n();
  const session = await auth();

  return (
    <NoResults
      icon={IconBox}
      title={t("app.page.list.noResults.title")}
      action={{
        label: t("app.page.list.noResults.action"),
        href: "/manage/apps/new",
        hidden: !session?.user.permissions.includes("app-create"),
      }}
    />
  );
};
