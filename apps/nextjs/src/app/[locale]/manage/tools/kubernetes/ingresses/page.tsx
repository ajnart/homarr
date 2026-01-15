import { notFound } from "next/navigation";
import { Stack, Title } from "@mantine/core";

import { api } from "@homarr/api/server";
import { auth } from "@homarr/auth/next";
import { env } from "@homarr/docker/env";
import { getScopedI18n } from "@homarr/translation/server";

import { IngressesTable } from "~/app/[locale]/manage/tools/kubernetes/ingresses/ingresses-table";
import { DynamicBreadcrumb } from "~/components/navigation/dynamic-breadcrumb";

export default async function NamespacesPage() {
  const session = await auth();
  if (!(session?.user.permissions.includes("admin") && env.ENABLE_KUBERNETES)) {
    notFound();
  }

  const ingresses = await api.kubernetes.ingresses.getIngresses();
  const tIngresses = await getScopedI18n("kubernetes.ingresses");
  return (
    <>
      <DynamicBreadcrumb />
      <Stack>
        <Title order={1}>{tIngresses("label")}</Title>
        <IngressesTable initialIngresses={ingresses} />
      </Stack>
    </>
  );
}
