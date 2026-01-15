import { notFound } from "next/navigation";
import { Card, Center, Stack, Text, Title } from "@mantine/core";

import { auth } from "@homarr/auth/next";
import { isProviderEnabled } from "@homarr/auth/server";
import { and, db, eq } from "@homarr/db";
import { invites } from "@homarr/db/schema";
import { getScopedI18n } from "@homarr/translation/server";

import { HomarrLogoWithTitle } from "~/components/layout/logo/homarr-logo";
import { RegistrationForm } from "./_registration-form";

interface InviteUsagePageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    token: string;
  }>;
}

export default async function InviteUsagePage(props: InviteUsagePageProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  if (!isProviderEnabled("credentials")) notFound();

  const session = await auth();
  if (session) notFound();

  const invite = await db.query.invites.findFirst({
    where: and(eq(invites.id, params.id), eq(invites.token, searchParams.token)),
    columns: {
      id: true,
      token: true,
      expirationDate: true,
    },
    with: {
      creator: {
        columns: {
          name: true,
        },
      },
    },
  });

  if (!invite || invite.expirationDate < new Date()) notFound();

  const t = await getScopedI18n("user.page.invite");

  return (
    <Center>
      <Stack align="center" mt="xl">
        <HomarrLogoWithTitle size="lg" />
        <Stack gap={6} align="center">
          <Title order={3} fw={400} ta="center">
            {t("title")}
          </Title>
          <Text size="sm" c="gray.5" ta="center">
            {t("subtitle")}
          </Text>
        </Stack>
        <Card withBorder w={64 * 6} maw="90vw">
          <RegistrationForm invite={invite} />
        </Card>
        <Text size="xs" c="gray.5" ta="center">
          {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
          {t("description", { username: invite.creator.name! })}
        </Text>
      </Stack>
    </Center>
  );
}
