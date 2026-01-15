import { objectEntries, objectKeys } from "@homarr/common";

/**
 * Permissions for boards.
 * view: Can view the board and its content. (e.g. see all items on the board, but not modify them)
 * modify: Can modify the board, its content and visual settings. (e.g. move items, change the background)
 * full: Can modify the board, its content, visual settings, access settings, delete, change the visibility and rename. (e.g. change the board name, delete the board, give access to other users)
 */
export const boardPermissions = ["view", "modify", "full"] as const;
export const boardPermissionsMap = {
  view: "board-view-all",
  modify: "board-modify-all",
  full: "board-full-all",
} satisfies Record<BoardPermission, GroupPermissionKey>;

export type BoardPermission = (typeof boardPermissions)[number];

/**
 * Permissions for integrations.
 * use: Can select the integration for an item on the board. (e.g. select pi-hole for a widget)
 * interact: Can interact with the integration. (e.g. enable / disable pi-hole)
 * full: Can modify the integration. (e.g. change the pi-hole url, secrets and access settings)
 */
export const integrationPermissions = ["use", "interact", "full"] as const;
export const integrationPermissionsMap = {
  use: "integration-use-all",
  interact: "integration-interact-all",
  full: "integration-full-all",
} satisfies Record<IntegrationPermission, GroupPermissionKey>;

export type IntegrationPermission = (typeof integrationPermissions)[number];

/**
 * Global permissions that can be assigned to groups.
 * The keys are generated through combining the key and all array items.
 * For example "board-create" is a generated key
 */
export const groupPermissions = {
  // Order is the same in the UI, inspired from order in navigation here
  board: ["create", "view-all", "modify-all", "full-all"],
  app: ["create", "use-all", "modify-all", "full-all"],
  integration: ["create", "use-all", "interact-all", "full-all"],
  "search-engine": ["create", "modify-all", "full-all"],
  media: ["upload", "view-all", "full-all"],
  other: ["view-logs"],
  admin: true,
} as const;

/**
 * In the following object is described how the permissions are related to each other.
 * For example everybody with the permission "board-modify-all" also has the permission "board-view-all".
 * Or admin has all permissions (board-full-all and integration-full-all which will resolve in an array of every permission).
 */
const groupPermissionParents = {
  "board-modify-all": ["board-view-all"],
  "board-full-all": ["board-modify-all", "board-create"],
  "app-modify-all": ["app-create"],
  "app-full-all": ["app-modify-all", "app-use-all"],
  "integration-interact-all": ["integration-use-all"],
  "integration-full-all": ["integration-interact-all", "integration-create"],
  "search-engine-modify-all": ["search-engine-create"],
  "search-engine-full-all": ["search-engine-modify-all"],
  "media-full-all": ["media-upload", "media-view-all"],
  admin: [
    "board-full-all",
    "app-full-all",
    "integration-full-all",
    "search-engine-full-all",
    "media-full-all",
    "other-view-logs",
  ],
} satisfies Partial<Record<GroupPermissionKey, GroupPermissionKey[]>>;

export const getPermissionsWithParents = (permissions: GroupPermissionKey[]): GroupPermissionKey[] => {
  const res = permissions.map((permission) => {
    return objectEntries(groupPermissionParents)
      .filter(([_key, value]: [string, GroupPermissionKey[]]) => value.includes(permission))
      .map(([key]) => getPermissionsWithParents([key]))
      .flat();
  });

  return permissions.concat(res.flat());
};

const getPermissionsInner = (permissionSet: Set<GroupPermissionKey>, permissions: GroupPermissionKey[]) => {
  permissions.forEach((permission) => {
    const children = groupPermissionParents[permission as keyof typeof groupPermissionParents];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (children) {
      getPermissionsInner(permissionSet, children);
    }

    permissionSet.add(permission);
  });
};

export const getPermissionsWithChildren = (permissions: GroupPermissionKey[]) => {
  const permissionSet = new Set<GroupPermissionKey>();
  getPermissionsInner(permissionSet, permissions);
  return Array.from(permissionSet);
};

type GroupPermissions = typeof groupPermissions;

export type GroupPermissionKey = {
  [key in keyof GroupPermissions]: GroupPermissions[key] extends readonly string[]
    ? `${key}-${GroupPermissions[key][number]}`
    : key;
}[keyof GroupPermissions];

export const groupPermissionKeys = objectKeys(groupPermissions).reduce((acc, key) => {
  const item = groupPermissions[key];
  if (typeof item !== "boolean") {
    acc.push(...item.map((subKey) => `${key}-${subKey}` as GroupPermissionKey));
  } else {
    acc.push(key as GroupPermissionKey);
  }
  return acc;
}, [] as GroupPermissionKey[]);
