import { notFound } from "next/navigation";
import { Card, Group, Stack, Text, Title } from "@mantine/core";

import { api } from "@homarr/api/server";
import { auth } from "@homarr/auth/next";
import { everyoneGroup } from "@homarr/definitions";
import { getScopedI18n } from "@homarr/translation/server";
import { UserAvatar } from "@homarr/ui";

import { DangerZoneItem, DangerZoneRoot } from "~/components/manage/danger-zone";
import { DeleteGroup } from "./_delete-group";
import { RenameGroupForm } from "./_rename-group-form";
import { ReservedGroupAlert } from "./_reserved-group-alert";
import { TransferGroupOwnership } from "./_transfer-group-ownership";

interface GroupsDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function GroupsDetailPage(props: GroupsDetailPageProps) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user.permissions.includes("admin")) {
    notFound();
  }

  const group = await api.group.getById({ id: params.id });
  const tGeneral = await getScopedI18n("management.page.group.setting.general");
  const tGroupAction = await getScopedI18n("group.action");
  const isReserved = group.name === everyoneGroup;

  return (
    <Stack>
      <Title>{tGeneral("title")}</Title>

      {isReserved && <ReservedGroupAlert />}

      <RenameGroupForm group={group} disabled={isReserved} />

      <Title order={2}>{tGeneral("owner")}</Title>
      <Card>
        {group.owner ? (
          <Group>
            <UserAvatar user={group.owner} size={"lg"} />
            <Stack align={"start"} gap={3}>
              <Text fw={"bold"}>{group.owner.name}</Text>
              <Text>{group.owner.email}</Text>
              <Text c={"dimmed"} size={"sm"}>
                {tGeneral("ownerOfGroup")}
              </Text>
            </Stack>
          </Group>
        ) : (
          <Group>
            <Stack align={"start"} gap={3}>
              <Text c={"dimmed"} size={"sm"}>
                {tGeneral("ownerOfGroupDeleted")}
              </Text>
            </Stack>
          </Group>
        )}
      </Card>

      {!isReserved && (
        <DangerZoneRoot>
          <DangerZoneItem
            label={tGroupAction("transfer.label")}
            description={tGroupAction("transfer.description")}
            action={<TransferGroupOwnership group={group} />}
          />

          <DangerZoneItem
            label={tGroupAction("delete.label")}
            description={tGroupAction("delete.description")}
            action={<DeleteGroup group={group} />}
          />
        </DangerZoneRoot>
      )}
    </Stack>
  );
}
