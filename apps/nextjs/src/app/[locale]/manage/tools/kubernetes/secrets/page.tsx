import { notFound } from "next/navigation";
import { Stack, Title } from "@mantine/core";

import { api } from "@homarr/api/server";
import { auth } from "@homarr/auth/next";
import { env } from "@homarr/docker/env";
import { getScopedI18n } from "@homarr/translation/server";

import { SecretsTable } from "~/app/[locale]/manage/tools/kubernetes/secrets/secrets-table";
import { DynamicBreadcrumb } from "~/components/navigation/dynamic-breadcrumb";

export default async function SecretsPage() {
  const session = await auth();
  if (!(session?.user.permissions.includes("admin") && env.ENABLE_KUBERNETES)) {
    notFound();
  }

  const secrets = await api.kubernetes.secrets.getSecrets();
  const tSecrets = await getScopedI18n("kubernetes.secrets");
  return (
    <>
      <DynamicBreadcrumb />
      <Stack>
        <Title order={1}>{tSecrets("label")}</Title>
        <SecretsTable initialSecrets={secrets} />
      </Stack>
    </>
  );
}
