import { notFound } from "next/navigation";
import { Alert, Anchor, Center, Group, Stack, Table, TableTbody, TableTd, TableTr, Text, Title } from "@mantine/core";
import { IconExclamationCircle } from "@tabler/icons-react";

import type { RouterOutputs } from "@homarr/api";
import { api } from "@homarr/api/server";
import { env } from "@homarr/auth/env";
import { auth } from "@homarr/auth/next";
import { isProviderEnabled } from "@homarr/auth/server";
import { everyoneGroup } from "@homarr/definitions";
import { getI18n, getScopedI18n } from "@homarr/translation/server";
import { Link, SearchInput, UserAvatar } from "@homarr/ui";

import { ReservedGroupAlert } from "../_reserved-group-alert";
import { AddGroupMember } from "./_add-group-member";
import { RemoveGroupMember } from "./_remove-group-member";

interface GroupsDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    search: string | undefined;
  }>;
}

export default async function GroupsDetailPage(props: GroupsDetailPageProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const session = await auth();

  if (!session?.user.permissions.includes("admin")) {
    notFound();
  }

  const t = await getI18n();
  const tMembers = await getScopedI18n("management.page.group.setting.members");
  const group = await api.group.getById({ id: params.id });
  const isReserved = group.name === everyoneGroup;

  const filteredMembers = searchParams.search
    ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      group.members.filter((member) => member.name?.toLowerCase().includes(searchParams.search!.trim().toLowerCase()))
    : group.members;

  const providerTypes = isProviderEnabled("credentials")
    ? env.AUTH_PROVIDERS.length > 1
      ? "mixed"
      : "credentials"
    : "external";

  return (
    <Stack>
      <Title>{tMembers("title")}</Title>

      {isReserved ? (
        <ReservedGroupAlert />
      ) : (
        providerTypes !== "credentials" && (
          <Alert variant="light" color="yellow" icon={<IconExclamationCircle size="1rem" stroke={1.5} />}>
            {t(`group.memberNotice.${providerTypes}`)}
          </Alert>
        )
      )}

      <Group justify="space-between">
        <SearchInput placeholder={`${tMembers("search")}...`} defaultValue={searchParams.search} />
        {isProviderEnabled("credentials") && !isReserved && (
          <AddGroupMember groupId={group.id} presentUserIds={group.members.map((member) => member.id)} />
        )}
      </Group>
      {filteredMembers.length === 0 && (
        <Center py="sm">
          <Text fw={500} c="gray.6">
            {tMembers("notFound")}
          </Text>
        </Center>
      )}
      <Table striped highlightOnHover>
        <TableTbody>
          {filteredMembers.map((member) => (
            <Row key={group.id} member={member} groupId={group.id} disabled={isReserved} />
          ))}
        </TableTbody>
      </Table>
    </Stack>
  );
}

interface RowProps {
  member: RouterOutputs["group"]["getById"]["members"][number];
  groupId: string;
  disabled?: boolean;
}

const Row = ({ member, groupId, disabled }: RowProps) => {
  return (
    <TableTr>
      <TableTd>
        <Group>
          <UserAvatar size="sm" user={member} />
          <Anchor component={Link} href={`/manage/users/${member.id}/general`}>
            {member.name}
          </Anchor>
        </Group>
      </TableTd>
      <TableTd w={100}>
        {member.provider === "credentials" && !disabled && <RemoveGroupMember user={member} groupId={groupId} />}
      </TableTd>
    </TableTr>
  );
};
