import { useState } from "react";
import { Anchor, Box, Button, Group, Stack, Table, TableTbody, TableTh, TableThead, TableTr } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

import { useModalAction } from "@homarr/modals";
import { useI18n, useScopedI18n } from "@homarr/translation/client";
import { Link, UserAvatar } from "@homarr/ui";

import type { AccessQueryData } from "./access-settings";
import { AccessDisplayRow, AccessSelectRow } from "./access-table-rows";
import { useAccessContext } from "./context";
import type { AccessFormType, HandleCountChange } from "./form";
import { FormProvider, useForm } from "./form";
import { UserSelectModal } from "./user-select-modal";

export interface FormProps<TPermission extends string> {
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
  accessQueryData: AccessQueryData<TPermission>;
  handleCountChange: HandleCountChange;
  handleSubmit: (values: AccessFormType<TPermission>) => void;
  isPending: boolean;
}

export const UsersAccessForm = <TPermission extends string>({
  entity,
  accessQueryData,
  handleCountChange,
  handleSubmit,
  isPending,
}: FormProps<TPermission>) => {
  const { defaultPermission } = useAccessContext();
  const [users, setUsers] = useState<Map<string, UserItemContentProps["user"]>>(
    new Map(accessQueryData.users.map(({ user }) => [user.id, user])),
  );
  const { openModal } = useModalAction(UserSelectModal);
  const t = useI18n();
  const tPermissions = useScopedI18n("permission");
  const form = useForm({
    initialValues: {
      items: accessQueryData.users.map(({ user, permission }) => ({
        principalId: user.id,
        permission,
      })),
    },
  });

  const handleAddUser = () => {
    const presentUserIds = form.values.items.map(({ principalId: id }) => id);

    openModal({
      presentUserIds: entity.ownerId ? presentUserIds.concat(entity.ownerId) : presentUserIds,
      onSelect: (user) => {
        setUsers((prev) => new Map(prev).set(user.id, user));
        form.setFieldValue("items", [
          {
            principalId: user.id,
            permission: defaultPermission,
          },
          ...form.values.items,
        ]);
        handleCountChange((prev) => prev + 1);
      },
    });
  };

  return (
    <form onSubmit={form.onSubmit((values) => handleSubmit(values as AccessFormType<TPermission>))}>
      <FormProvider form={form}>
        <Stack pt="sm">
          <Table>
            <TableThead>
              <TableTr>
                <TableTh>{tPermissions("field.user.label")}</TableTh>
                <TableTh>{tPermissions("field.permission.label")}</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {entity.owner && (
                <AccessDisplayRow itemContent={<UserItemContent user={entity.owner} />} permission="full" />
              )}
              {form.values.items.map((row, index) => (
                <AccessSelectRow
                  key={row.principalId}
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  itemContent={<UserItemContent user={users.get(row.principalId)!} />}
                  permission={row.permission}
                  index={index}
                  handleCountChange={handleCountChange}
                />
              ))}
            </TableTbody>
          </Table>

          <Group justify="space-between">
            <Button rightSection={<IconPlus size="1rem" />} variant="light" onClick={handleAddUser}>
              {t("common.action.add")}
            </Button>
            <Button type="submit" loading={isPending}>
              {t("permission.action.saveUser")}
            </Button>
          </Group>
        </Stack>
      </FormProvider>
    </form>
  );
};

interface UserItemContentProps {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    email: string | null;
  };
}

const UserItemContent = ({ user }: UserItemContentProps) => {
  return (
    <Group wrap="nowrap">
      <Box visibleFrom="xs">
        <UserAvatar user={user} size="sm" />
      </Box>
      <Anchor component={Link} href={`/manage/users/${user.id}`} size="sm" style={{ whiteSpace: "nowrap" }}>
        {user.name}
      </Anchor>
    </Group>
  );
};
