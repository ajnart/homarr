import { notFound } from "next/navigation";
import { Stack, Title } from "@mantine/core";

import { api } from "@homarr/api/server";
import { auth } from "@homarr/auth/next";
import { getScopedI18n } from "@homarr/translation/server";

import { DynamicBreadcrumb } from "~/components/navigation/dynamic-breadcrumb";
import { createMetaTitle } from "~/metadata";
import { TasksTable } from "./_components/tasks-table";

export async function generateMetadata() {
  const session = await auth();
  if (!session?.user.permissions.includes("admin")) {
    return {};
  }
  const t = await getScopedI18n("management");

  return {
    title: createMetaTitle(t("metaTitle")),
  };
}

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user.permissions.includes("admin")) {
    notFound();
  }

  const jobs = await api.cronJobs.getJobs();
  const tTasks = await getScopedI18n("management.page.tool.tasks");

  return (
    <>
      <DynamicBreadcrumb />
      <Stack>
        <Title order={1}>{tTasks("title")}</Title>
        <TasksTable initialJobs={jobs} />
      </Stack>
    </>
  );
}
