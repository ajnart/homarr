import dayjs from "dayjs";

import type { IntegrationKindByCategory } from "@homarr/definitions";
import { createIntegrationAsync } from "@homarr/integrations";
import type {
  FirewallCpuSummary,
  FirewallInterfacesSummary,
  FirewallMemorySummary,
  FirewallVersionSummary,
} from "@homarr/integrations/types";

import { createCachedIntegrationRequestHandler } from "./lib/cached-integration-request-handler";

export const firewallCpuRequestHandler = createCachedIntegrationRequestHandler<
  FirewallCpuSummary,
  IntegrationKindByCategory<"firewall">,
  Record<string, never>
>({
  async requestAsync(integration, _input) {
    const integrationInstance = await createIntegrationAsync(integration);
    return integrationInstance.getFirewallCpuAsync();
  },
  cacheDuration: dayjs.duration(5, "seconds"),
  queryKey: "firewallCpuSummary",
});

export const firewallMemoryRequestHandler = createCachedIntegrationRequestHandler<
  FirewallMemorySummary,
  IntegrationKindByCategory<"firewall">,
  Record<string, never>
>({
  async requestAsync(integration, _input) {
    const integrationInstance = await createIntegrationAsync(integration);
    return await integrationInstance.getFirewallMemoryAsync();
  },
  cacheDuration: dayjs.duration(15, "seconds"),
  queryKey: "firewallMemorySummary",
});

export const firewallInterfacesRequestHandler = createCachedIntegrationRequestHandler<
  FirewallInterfacesSummary[],
  IntegrationKindByCategory<"firewall">,
  Record<string, never>
>({
  async requestAsync(integration, _input) {
    const integrationInstance = await createIntegrationAsync(integration);
    return await integrationInstance.getFirewallInterfacesAsync();
  },
  cacheDuration: dayjs.duration(30, "seconds"),
  queryKey: "firewallInterfacesSummary",
});

export const firewallVersionRequestHandler = createCachedIntegrationRequestHandler<
  FirewallVersionSummary,
  IntegrationKindByCategory<"firewall">,
  Record<string, never>
>({
  async requestAsync(integration, _input) {
    const integrationInstance = await createIntegrationAsync(integration);
    return await integrationInstance.getFirewallVersionAsync();
  },
  cacheDuration: dayjs.duration(1, "hour"),
  queryKey: "firewallVersionSummary",
});
