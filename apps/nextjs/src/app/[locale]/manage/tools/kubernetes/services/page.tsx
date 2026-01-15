import { notFound } from "next/navigation";
import { Stack, Title } from "@mantine/core";

import { api } from "@homarr/api/server";
import { auth } from "@homarr/auth/next";
import { env } from "@homarr/docker/env";
import { getScopedI18n } from "@homarr/translation/server";

import { ServicesTable } from "~/app/[locale]/manage/tools/kubernetes/services/services-table";
import { DynamicBreadcrumb } from "~/components/navigation/dynamic-breadcrumb";

export default async function ServicesPage() {
  const session = await auth();
  if (!(session?.user.permissions.includes("admin") && env.ENABLE_KUBERNETES)) {
    notFound();
  }

  const services = await api.kubernetes.services.getServices();
  const tServices = await getScopedI18n("kubernetes.services");
  return (
    <>
      <DynamicBreadcrumb />
      <Stack>
        <Title order={1}>{tServices("label")}</Title>
        <ServicesTable initialServices={services} />
      </Stack>
    </>
  );
}
