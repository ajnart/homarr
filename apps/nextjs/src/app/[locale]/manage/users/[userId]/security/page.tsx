import { notFound } from "next/navigation";
import { Stack, Title } from "@mantine/core";

import { api } from "@homarr/api/server";
import { auth } from "@homarr/auth/next";
import { getScopedI18n } from "@homarr/translation/server";

import { catchTrpcNotFound } from "~/errors/trpc-catch-error";
import { canAccessUserEditPage } from "../access";
import { ChangePasswordForm } from "./_components/_change-password-form";

interface Props {
  params: Promise<{
    userId: string;
  }>;
}

export default async function UserSecurityPage(props: Props) {
  const params = await props.params;
  const session = await auth();
  const tSecurity = await getScopedI18n("management.page.user.setting.security");
  const user = await api.user
    .getById({
      userId: params.userId,
    })
    .catch(catchTrpcNotFound);

  if (!canAccessUserEditPage(session, user.id)) {
    notFound();
  }

  if (user.provider !== "credentials") {
    notFound();
  }

  return (
    <Stack>
      <Title>{tSecurity("title")}</Title>

      <ChangePasswordForm user={user} />
    </Stack>
  );
}
