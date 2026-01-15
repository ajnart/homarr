import { notFound } from "next/navigation";
import { Stack, Title } from "@mantine/core";

import { api } from "@homarr/api/server";
import { auth } from "@homarr/auth/next";
import { env } from "@homarr/docker/env";
import { getScopedI18n } from "@homarr/translation/server";

import { NamespacesTable } from "~/app/[locale]/manage/tools/kubernetes/namespaces/namespaces-table";
import { DynamicBreadcrumb } from "~/components/navigation/dynamic-breadcrumb";

export default async function NamespacesPage() {
  const session = await auth();
  if (!(session?.user.permissions.includes("admin") && env.ENABLE_KUBERNETES)) {
    notFound();
  }

  const namespaces = await api.kubernetes.namespaces.getNamespaces();
  const tNamespaces = await getScopedI18n("kubernetes.namespaces");
  return (
    <>
      <DynamicBreadcrumb />
      <Stack>
        <Title order={1}>{tNamespaces("label")}</Title>
        <NamespacesTable initialNamespaces={namespaces} />
      </Stack>
    </>
  );
}
