import { notFound } from "next/navigation";
import { Stack, Title } from "@mantine/core";

import { auth } from "@homarr/auth/next";
import { getI18n } from "@homarr/translation/server";

import { ManageContainer } from "~/components/manage/manage-container";
import { DynamicBreadcrumb } from "~/components/navigation/dynamic-breadcrumb";
import { SearchEngineNewForm } from "./_search-engine-new-form";

export default async function SearchEngineNewPage() {
  const session = await auth();

  if (!session?.user.permissions.includes("search-engine-create")) {
    notFound();
  }

  const t = await getI18n();

  return (
    <ManageContainer>
      <DynamicBreadcrumb />
      <Stack>
        <Title>{t("search.engine.page.create.title")}</Title>
        <SearchEngineNewForm />
      </Stack>
    </ManageContainer>
  );
}
