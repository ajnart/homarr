import { useState } from "react";
import { Group, Stack, Tabs } from "@mantine/core";
import { IconUser, IconUserDown, IconUsersGroup } from "@tabler/icons-react";

import type { GroupPermissionKey } from "@homarr/definitions";
import { useScopedI18n } from "@homarr/translation/client";
import type { TablerIcon } from "@homarr/ui";
import { CountBadge } from "@homarr/ui";

import { AccessProvider } from "./context";
import type { AccessFormType } from "./form";
import { GroupAccessForm } from "./group-access-form";
import { InheritAccessTable } from "./inherit-access-table";
import { UsersAccessForm } from "./user-access-form";

interface GroupAccessPermission<TPermission extends string> {
  permission: TPermission;
  group: {
    id: string;
    name: string;
  };
}

interface UserAccessPermission<TPermission extends string> {
  permission: TPermission;
  user: {
    name: string | null;
    image: string | null;
    email: string | null;
    id: string;
  };
}

interface SimpleMutation<TPermission extends string> {
  mutate: (
    props: { entityId: string; permissions: { principalId: string; permission: TPermission }[] },
    options: { onSuccess: () => void },
  ) => void;
  isPending: boolean;
}

export interface AccessQueryData<TPermission extends string> {
  inherited: GroupAccessPermission<GroupPermissionKey>[];
  groups: GroupAccessPermission<TPermission>[];
  users: UserAccessPermission<TPermission>[];
}

interface Props<TPermission extends string> {
  permission: {
    items: readonly TPermission[];
    default: TPermission;
    icons: Record<TPermission, TablerIcon>;
    groupPermissionMapping: Record<TPermission, GroupPermissionKey>;
    fullAccessGroupPermission: GroupPermissionKey;
  };

  query: {
    data: AccessQueryData<TPermission>;
    invalidate: () => Promise<void>;
  };
  groupsMutation: SimpleMutation<TPermission>;
  usersMutation: SimpleMutation<TPermission>;
  entity: {
    id: string;
    ownerId: string | null;
    owner: {
      id: string;
      name: string | null;
      image: string | null;
      email: string | null;
    } | null;
  };
  translate: (key: TPermission) => string;
}

export const AccessSettings = <TPermission extends string>({
  permission,
  query,
  groupsMutation,
  usersMutation,
  entity,
  translate,
}: Props<TPermission>) => {
  const [counts, setCounts] = useState({
    user: query.data.users.length + (entity.owner ? 1 : 0),
    group: query.data.groups.length,
  });

  const handleGroupSubmit = (values: AccessFormType<TPermission>) => {
    groupsMutation.mutate(
      {
        entityId: entity.id,
        permissions: values.items,
      },
      {
        onSuccess() {
          void query.invalidate();
        },
      },
    );
  };

  const handleUserSubmit = (values: AccessFormType<TPermission>) => {
    usersMutation.mutate(
      {
        entityId: entity.id,
        permissions: values.items,
      },
      {
        onSuccess() {
          void query.invalidate();
        },
      },
    );
  };

  return (
    <AccessProvider<TPermission>
      defaultPermission={permission.default}
      icons={permission.icons}
      permissions={permission.items}
      translate={translate}
    >
      <Stack>
        <Tabs color="red" defaultValue="user">
          <Tabs.List grow>
            <TabItem value="user" count={counts.user} icon={IconUser} />
            <TabItem value="group" count={counts.group} icon={IconUsersGroup} />
            <TabItem value="inherited" count={query.data.inherited.length} icon={IconUserDown} />
          </Tabs.List>

          <Tabs.Panel value="user">
            <UsersAccessForm<TPermission>
              entity={entity}
              accessQueryData={query.data}
              handleCountChange={(callback) =>
                setCounts(({ user, ...others }) => ({
                  user: callback(user),
                  ...others,
                }))
              }
              handleSubmit={handleUserSubmit}
              isPending={usersMutation.isPending}
            />
          </Tabs.Panel>

          <Tabs.Panel value="group">
            <GroupAccessForm<TPermission>
              accessQueryData={query.data}
              handleCountChange={(callback) =>
                setCounts(({ group, ...others }) => ({
                  group: callback(group),
                  ...others,
                }))
              }
              handleSubmit={handleGroupSubmit}
              isPending={groupsMutation.isPending}
            />
          </Tabs.Panel>

          <Tabs.Panel value="inherited">
            <InheritAccessTable<TPermission>
              accessQueryData={query.data}
              fullAccessGroupPermission={permission.fullAccessGroupPermission}
              mapPermissions={permission.groupPermissionMapping}
            />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </AccessProvider>
  );
};

interface TabItemProps {
  value: "user" | "group" | "inherited";
  count: number;
  icon: TablerIcon;
}

const TabItem = ({ value, icon: Icon, count }: TabItemProps) => {
  const t = useScopedI18n("permission");

  return (
    <Tabs.Tab value={value} leftSection={<Icon stroke={1.5} size={16} />}>
      <Group gap="sm">
        {t(`tab.${value}`)}
        <CountBadge count={count} />
      </Group>
    </Tabs.Tab>
  );
};
