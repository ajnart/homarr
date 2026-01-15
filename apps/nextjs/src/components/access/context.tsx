import { createContext, useContext } from "react";

import type { TablerIcon } from "@homarr/ui";

const AccessContext = createContext<{
  permissions: readonly string[];
  icons: Record<string, TablerIcon>;
  translate: (key: string) => string;
  defaultPermission: string;
} | null>(null);

export const useAccessContext = <TPermission extends string>() => {
  const context = useContext(AccessContext);

  if (!context) {
    throw new Error("useAccessContext must be used within a AccessProvider");
  }

  return {
    icons: context.icons as Record<TPermission, TablerIcon>,
    getSelectData: () =>
      context.permissions.map((permission) => ({ value: permission, label: context.translate(permission) })),
    permissions: context.permissions as readonly TPermission[],
    translate: context.translate as (key: TPermission) => string,
    defaultPermission: context.defaultPermission as TPermission,
  };
};

export const AccessProvider = <TPermission extends string>({
  defaultPermission,
  permissions,
  icons,
  translate,
  children,
}: {
  defaultPermission: TPermission;
  permissions: readonly TPermission[];
  icons: Record<TPermission, TablerIcon>;
  translate: (key: TPermission) => string;
  children: React.ReactNode;
}) => {
  return (
    <AccessContext.Provider
      value={{
        defaultPermission,
        permissions,
        icons,
        translate: translate as (key: string) => string,
      }}
    >
      {children}
    </AccessContext.Provider>
  );
};
