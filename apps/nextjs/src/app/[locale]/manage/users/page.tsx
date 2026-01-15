import { notFound } from "next/navigation";

import { api } from "@homarr/api/server";
import { auth } from "@homarr/auth/next";
import { isProviderEnabled } from "@homarr/auth/server";
import { getScopedI18n } from "@homarr/translation/server";

import { DynamicBreadcrumb } from "~/components/navigation/dynamic-breadcrumb";
import { createMetaTitle } from "~/metadata";
import { UserListComponent } from "./_components/user-list";

export async function generateMetadata() {
  const session = await auth();
  if (!session?.user.permissions.includes("admin")) {
    return {};
  }
  const t = await getScopedI18n("management.page.user.list");

  return {
    title: createMetaTitle(t("metaTitle")),
  };
}

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user.permissions.includes("admin")) {
    return notFound();
  }

  const userList = await api.user.getAll();
  const credentialsProviderEnabled = isProviderEnabled("credentials");

  return (
    <>
      <DynamicBreadcrumb />
      <UserListComponent initialUserList={userList} credentialsProviderEnabled={credentialsProviderEnabled} />
    </>
  );
}
