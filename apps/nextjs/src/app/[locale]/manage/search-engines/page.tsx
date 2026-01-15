import { redirect } from "next/navigation";
import { ActionIcon, ActionIconGroup, Anchor, Avatar, Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconPencil, IconSearch } from "@tabler/icons-react";
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
import { SearchEngineDeleteButton } from "./_search-engine-delete-button";

const searchParamsSchema = z.object({
  search: z.string().optional(),
  pageSize: z.string().regex(/\d+/).transform(Number).catch(10),
  page: z.string().regex(/\d+/).transform(Number).catch(1),
});

interface SearchEnginesPageProps {
  searchParams: Promise<inferSearchParamsFromSchema<typeof searchParamsSchema>>;
}

export default async function SearchEnginesPage(props: SearchEnginesPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  const searchParams = searchParamsSchema.parse(await props.searchParams);
  const { items: searchEngines, totalCount } = await api.searchEngine.getPaginated(searchParams);

  const tEngine = await getScopedI18n("search.engine");

  return (
    <ManageContainer>
      <DynamicBreadcrumb />
      <Stack>
        <Title>{tEngine("page.list.title")}</Title>
        <Group justify="space-between" align="center">
          <SearchInput placeholder={`${tEngine("search")}...`} defaultValue={searchParams.search} flexExpand />
          {session.user.permissions.includes("search-engine-create") && (
            <MobileAffixButton component={Link} href="/manage/search-engines/new">
              {tEngine("page.create.title")}
            </MobileAffixButton>
          )}
        </Group>
        {searchEngines.length === 0 && <SearchEngineNoResults />}
        {searchEngines.length > 0 && (
          <Stack gap="sm">
            {searchEngines.map((searchEngine) => (
              <SearchEngineCard key={searchEngine.id} searchEngine={searchEngine} />
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

interface SearchEngineCardProps {
  searchEngine: RouterOutputs["searchEngine"]["getPaginated"]["items"][number];
}

const SearchEngineCard = async ({ searchEngine }: SearchEngineCardProps) => {
  const t = await getScopedI18n("search.engine");
  const session = await auth();

  return (
    <Card withBorder>
      <Group justify="space-between" wrap="nowrap">
        <Group align="top" justify="start" wrap="nowrap" style={{ flex: 1 }}>
          <Avatar
            size="sm"
            src={searchEngine.iconUrl}
            radius={0}
            styles={{
              image: {
                objectFit: "contain",
              },
            }}
          />
          <Stack gap={0}>
            <Text fw={500} lineClamp={1}>
              {searchEngine.name}
            </Text>
            {searchEngine.description && (
              <Text size="sm" c="gray.6" lineClamp={4}>
                {searchEngine.description}
              </Text>
            )}
            {searchEngine.type === "generic" && searchEngine.urlTemplate !== null && (
              <Anchor href={searchEngine.urlTemplate.replace("%s", "test")} lineClamp={1} size="sm">
                {searchEngine.urlTemplate}
              </Anchor>
            )}
            {searchEngine.type === "fromIntegration" && searchEngine.integrationId !== null && (
              <Text c="dimmed" size="sm">
                {t("page.list.interactive")}
              </Text>
            )}
          </Stack>
        </Group>
        <Group>
          <ActionIconGroup>
            {session?.user.permissions.includes("search-engine-modify-all") && (
              <ActionIcon
                component={Link}
                href={`/manage/search-engines/edit/${searchEngine.id}`}
                variant="subtle"
                color="gray"
                aria-label={t("page.edit.title")}
              >
                <IconPencil size={16} stroke={1.5} />
              </ActionIcon>
            )}
            {session?.user.permissions.includes("search-engine-full-all") && (
              <SearchEngineDeleteButton searchEngine={searchEngine} />
            )}
          </ActionIconGroup>
        </Group>
      </Group>
    </Card>
  );
};

const SearchEngineNoResults = async () => {
  const t = await getI18n();
  const session = await auth();

  return (
    <NoResults
      icon={IconSearch}
      title={t("search.engine.page.list.noResults.title")}
      action={{
        label: t("search.engine.page.list.noResults.action"),
        href: "/manage/search-engines/new",
        hidden: !session?.user.permissions.includes("search-engine-create"),
      }}
    />
  );
};
