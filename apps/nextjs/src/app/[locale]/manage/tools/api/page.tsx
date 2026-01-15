import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Stack, Tabs, TabsList, TabsPanel, TabsTab } from "@mantine/core";

import { openApiDocument } from "@homarr/api";
import { api } from "@homarr/api/server";
import { auth } from "@homarr/auth/next";
import { extractBaseUrlFromHeaders } from "@homarr/common";
import { getScopedI18n } from "@homarr/translation/server";

import { SwaggerUIClient } from "~/app/[locale]/manage/tools/api/components/swagger-ui";
import { createMetaTitle } from "~/metadata";
import { ApiKeysManagement } from "./components/api-keys";

export async function generateMetadata() {
  const session = await auth();
  if (!session?.user || !session.user.permissions.includes("admin")) {
    return {};
  }

  const t = await getScopedI18n("management");

  return {
    title: createMetaTitle(t("metaTitle")),
  };
}

export default async function ApiPage() {
  const session = await auth();
  if (!session?.user || !session.user.permissions.includes("admin")) {
    notFound();
  }
  const document = openApiDocument(extractBaseUrlFromHeaders(await headers()));
  const apiKeys = await api.apiKeys.getAll();
  const t = await getScopedI18n("management.page.tool.api.tab");

  return (
    <Stack>
      <Tabs defaultValue={"documentation"}>
        <TabsList>
          <TabsTab value={"documentation"}>{t("documentation.label")}</TabsTab>
          <TabsTab value={"authentication"}>{t("apiKey.label")}</TabsTab>
        </TabsList>
        <TabsPanel value={"authentication"}>
          <ApiKeysManagement apiKeys={apiKeys} />
        </TabsPanel>
        <TabsPanel value={"documentation"}>
          <SwaggerUIClient document={document} />
        </TabsPanel>
      </Tabs>
    </Stack>
  );
}
