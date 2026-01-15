import { notFound } from "next/navigation";
import { Stack, Title } from "@mantine/core";

import { api } from "@homarr/api/server";
import { auth } from "@homarr/auth/next";
import { getScopedI18n } from "@homarr/translation/server";

import { CrawlingAndIndexingSettings } from "~/app/[locale]/manage/settings/_components/crawling-and-indexing.settings";
import { DynamicBreadcrumb } from "~/components/navigation/dynamic-breadcrumb";
import { AnalyticsSettings } from "./_components/analytics.settings";
import { AppearanceSettingsForm } from "./_components/appearance-settings-form";
import { BoardSettingsForm } from "./_components/board-settings-form";
import { CultureSettingsForm } from "./_components/culture-settings-form";
import { SearchSettingsForm } from "./_components/search-settings-form";
import { UserSettingsForm } from "./_components/user-settings-form";

export async function generateMetadata() {
  const t = await getScopedI18n("management");
  const metaTitle = `${t("metaTitle")} • Homarr`;

  return {
    title: metaTitle,
  };
}

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user.permissions.includes("admin")) {
    notFound();
  }

  const serverSettings = await api.serverSettings.getAll();
  const tSettings = await getScopedI18n("management.page.settings");
  return (
    <>
      <DynamicBreadcrumb />
      <Stack>
        <Title order={1}>{tSettings("title")}</Title>
        <AnalyticsSettings initialData={serverSettings.analytics} />
        <CrawlingAndIndexingSettings initialData={serverSettings.crawlingAndIndexing} />
        <Stack>
          <Title order={2}>{tSettings("section.board.title")}</Title>
          <BoardSettingsForm defaultValues={serverSettings.board} />
        </Stack>
        <Stack>
          <Title order={2}>{tSettings("section.user.title")}</Title>
          <UserSettingsForm defaultValues={serverSettings.user} />
        </Stack>
        <Stack>
          <Title order={2}>{tSettings("section.search.title")}</Title>
          <SearchSettingsForm defaultValues={serverSettings.search} />
        </Stack>
        <Stack>
          <Title order={2}>{tSettings("section.appearance.title")}</Title>
          <AppearanceSettingsForm defaultValues={serverSettings.appearance} />
        </Stack>
        <Stack>
          <Title order={2}>{tSettings("section.culture.title")}</Title>
          <CultureSettingsForm defaultValues={serverSettings.culture} />
        </Stack>
      </Stack>
    </>
  );
}
