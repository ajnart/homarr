"use client";

import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";

import type { IntegrationKind } from "@homarr/definitions";

interface IntegrationContextProps {
  integrations: {
    id: string;
    name: string;
    url: string;
    kind: IntegrationKind;
    permissions: {
      hasFullAccess: boolean;
      hasInteractAccess: boolean;
      hasUseAccess: boolean;
    };
  }[];
}

const IntegrationContext = createContext<IntegrationContextProps | null>(null);

export const IntegrationProvider = ({ integrations, children }: PropsWithChildren<IntegrationContextProps>) => {
  return <IntegrationContext.Provider value={{ integrations }}>{children}</IntegrationContext.Provider>;
};

export const useIntegrationsWithUseAccess = () => {
  const context = useContext(IntegrationContext);

  if (!context) {
    throw new Error("useIntegrationsWithUseAccess must be used within an IntegrationProvider");
  }

  return context.integrations.filter((integration) => integration.permissions.hasUseAccess);
};

export const useIntegrationsWithInteractAccess = () => {
  const context = useContext(IntegrationContext);

  if (!context) {
    throw new Error("useIntegrationsWithInteractAccess must be used within an IntegrationProvider");
  }

  return context.integrations.filter((integration) => integration.permissions.hasInteractAccess);
};

export const useIntegrationsWithFullAccess = () => {
  const context = useContext(IntegrationContext);

  if (!context) {
    throw new Error("useIntegrationsWithFullAccess must be used within an IntegrationProvider");
  }

  return context.integrations.filter((integration) => integration.permissions.hasFullAccess);
};
