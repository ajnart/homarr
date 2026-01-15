import { notFound } from "next/navigation";

import { auth } from "@homarr/auth/next";
import { env } from "@homarr/docker/env";

import { ClusterDashboard } from "~/app/[locale]/manage/tools/kubernetes/cluster-dashboard/cluster-dashboard";
import { DynamicBreadcrumb } from "~/components/navigation/dynamic-breadcrumb";

export default async function KubernetesPage() {
  const session = await auth();
  if (!(session?.user.permissions.includes("admin") && env.ENABLE_KUBERNETES)) {
    notFound();
  }

  return (
    <>
      <DynamicBreadcrumb />
      <ClusterDashboard />
    </>
  );
}
