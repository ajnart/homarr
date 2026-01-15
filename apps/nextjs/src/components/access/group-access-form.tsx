import { useState } from "react";
import { Anchor, Button, Group, Stack, Table, TableTbody, TableTh, TableThead, TableTr } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

import { useModalAction } from "@homarr/modals";
import { useI18n, useScopedI18n } from "@homarr/translation/client";
import { Link } from "@homarr/ui";

import type { AccessQueryData } from "./access-settings";
import { AccessSelectRow } from "./access-table-rows";
import { useAccessContext } from "./context";
import type { AccessFormType } from "./form";
import { FormProvider, useForm } from "./form";
import { GroupSelectModal } from "./group-select-modal";
import type { FormProps } from "./user-access-form";

export const GroupAccessForm = <TPermission extends string>({
  accessQueryData,
  handleCountChange,
  handleSubmit,
  isPending,
}: Omit<FormProps<TPermission>, "entity">) => {
  const { defaultPermission } = useAccessContext();
  const [groups, setGroups] = useState<Map<string, AccessQueryData<string>["groups"][number]["group"]>>(
    new Map(accessQueryData.groups.map(({ group }) => [group.id, group])),
  );
  const { openModal } = useModalAction(GroupSelectModal);
  const t = useI18n();
  const tPermissions = useScopedI18n("permission");
  const form = useForm({
    initialValues: {
      items: accessQueryData.groups.map(({ group, permission }) => ({
        principalId: group.id,
        permission,
      })),
    },
  });

  const handleAddUser = () => {
    openModal({
      presentGroupIds: form.values.items.map(({ principalId: id }) => id),
      onSelect: (group) => {
        setGroups((prev) => new Map(prev).set(group.id, group));
        form.setFieldValue("items", [
          {
            principalId: group.id,
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
                <TableTh style={{ whiteSpace: "nowrap" }}>{tPermissions("field.group.label")}</TableTh>
                <TableTh>{tPermissions("field.permission.label")}</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {form.values.items.map((row, index) => (
                <AccessSelectRow
                  key={row.principalId}
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  itemContent={<GroupItemContent group={groups.get(row.principalId)!} />}
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
              {t("permission.action.saveGroup")}
            </Button>
          </Group>
        </Stack>
      </FormProvider>
    </form>
  );
};

export const GroupItemContent = ({ group }: { group: AccessQueryData<string>["groups"][number]["group"] }) => {
  return (
    <Anchor component={Link} href={`/manage/users/groups/${group.id}`} size="sm" style={{ whiteSpace: "nowrap" }}>
      {group.name}
    </Anchor>
  );
};
