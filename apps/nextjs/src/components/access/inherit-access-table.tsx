import { Stack, Table, TableTbody, TableTh, TableThead, TableTr } from "@mantine/core";

import type { GroupPermissionKey } from "@homarr/definitions";
import { getPermissionsWithChildren } from "@homarr/definitions";
import { useScopedI18n } from "@homarr/translation/client";

import type { AccessQueryData } from "./access-settings";
import { AccessDisplayRow } from "./access-table-rows";
import { GroupItemContent } from "./group-access-form";

export interface InheritTableProps<TPermission extends string> {
  accessQueryData: AccessQueryData<TPermission>;
  mapPermissions: Partial<Record<GroupPermissionKey, TPermission>>;
  fullAccessGroupPermission: GroupPermissionKey;
}

export const InheritAccessTable = <TPermission extends string>({
  accessQueryData,
  mapPermissions,
  fullAccessGroupPermission,
}: InheritTableProps<TPermission>) => {
  const tPermissions = useScopedI18n("permission");
  return (
    <Stack pt="sm">
      <Table>
        <TableThead>
          <TableTr>
            <TableTh>{tPermissions("field.user.label")}</TableTh>
            <TableTh>{tPermissions("field.permission.label")}</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {accessQueryData.inherited.map(({ group, permission }) => {
            const entityPermission =
              permission in mapPermissions
                ? mapPermissions[permission]
                : getPermissionsWithChildren([permission]).includes(fullAccessGroupPermission)
                  ? "full"
                  : null;

            if (!entityPermission) {
              return null;
            }

            return (
              <AccessDisplayRow
                key={group.id}
                itemContent={<GroupItemContent group={group} />}
                permission={entityPermission}
              />
            );
          })}
        </TableTbody>
      </Table>
    </Stack>
  );
};
