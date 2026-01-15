import { notFound } from "next/navigation";
import { Container, Stack, Title } from "@mantine/core";

import { auth } from "@homarr/auth/next";
import { AppNewForm } from "@homarr/forms-collection";
import { getI18n } from "@homarr/translation/server";

import { DynamicBreadcrumb } from "~/components/navigation/dynamic-breadcrumb";

export default async function AppNewPage() {
  const session = await auth();

  if (!session?.user.permissions.includes("app-create")) {
    notFound();
  }

  const t = await getI18n();

  return (
    <>
      <DynamicBreadcrumb />
      <Container>
        <Stack>
          <Title>{t("app.page.create.title")}</Title>
          <AppNewForm showBackToOverview showCreateAnother />
        </Stack>
      </Container>
    </>
  );
}
