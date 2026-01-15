import { notFound } from "next/navigation";
import { Stack, Title } from "@mantine/core";

import { api } from "@homarr/api/server";
import { auth } from "@homarr/auth/next";
import { env } from "@homarr/docker/env";
import { getScopedI18n } from "@homarr/translation/server";

import { NodesTable } from "~/app/[locale]/manage/tools/kubernetes/nodes/nodes-table";
import { DynamicBreadcrumb } from "~/components/navigation/dynamic-breadcrumb";

export default async function NodesPage() {
  const session = await auth();
  if (!(session?.user.permissions.includes("admin") && env.ENABLE_KUBERNETES)) {
    notFound();
  }

  const nodes = await api.kubernetes.nodes.getNodes();
  const tNodes = await getScopedI18n("kubernetes.nodes");
  return (
    <>
      <DynamicBreadcrumb />
      <Stack>
        <Title order={1}>{tNodes("label")}</Title>
        <NodesTable initialNodes={nodes} />
      </Stack>
    </>
  );
}
