import type { ComponentType } from "react";
import type { Loader } from "next/dynamic";
import dynamic from "next/dynamic";
import { Center, Loader as UiLoader } from "@mantine/core";

import { objectEntries } from "@homarr/common";
import type { IntegrationKind, WidgetKind } from "@homarr/definitions";
import type { SettingsContextProps } from "@homarr/settings/creator";

import * as app from "./app";
import * as bookmarks from "./bookmarks";
import * as calendar from "./calendar";
import * as clock from "./clock";
import type { WidgetComponentProps } from "./definition";
import * as dnsHoleControls from "./dns-hole/controls";
import * as dnsHoleSummary from "./dns-hole/summary";
import * as dockerContainers from "./docker";
import * as downloads from "./downloads";
import * as firewall from "./firewall";
import * as healthMonitoring from "./health-monitoring";
import * as iframe from "./iframe";
import type { WidgetImportRecord } from "./import";
import * as indexerManager from "./indexer-manager";
import * as mediaReleases from "./media-releases";
import * as mediaRequestsList from "./media-requests/list";
import * as mediaRequestsStats from "./media-requests/stats";
import * as mediaServer from "./media-server";
import * as mediaTranscoding from "./media-transcoding";
import * as minecraftServerStatus from "./minecraft/server-status";
import * as networkControllerStatus from "./network-controller/network-status";
import * as networkControllerSummary from "./network-controller/summary";
import * as notebook from "./notebook";
import * as notifications from "./notifications";
import type { WidgetOptionDefinition } from "./options";
import * as releases from "./releases";
import * as rssFeed from "./rssFeed";
import * as smartHomeEntityState from "./smart-home/entity-state";
import * as smartHomeExecuteAutomation from "./smart-home/execute-automation";
import * as stockPrice from "./stocks";
import * as systemResources from "./system-resources";
import * as video from "./video";
import * as weather from "./weather";

export type { WidgetDefinition, WidgetOptionsSettings } from "./definition";
export type { WidgetComponentProps };

export const widgetImports = {
  clock,
  weather,
  app,
  notebook,
  iframe,
  video,
  dnsHoleSummary,
  dnsHoleControls,
  "smartHome-entityState": smartHomeEntityState,
  "smartHome-executeAutomation": smartHomeExecuteAutomation,
  stockPrice,
  mediaServer,
  calendar,
  downloads,
  "mediaRequests-requestList": mediaRequestsList,
  "mediaRequests-requestStats": mediaRequestsStats,
  networkControllerSummary,
  networkControllerStatus,
  rssFeed,
  bookmarks,
  indexerManager,
  healthMonitoring,
  mediaTranscoding,
  minecraftServerStatus,
  dockerContainers,
  releases,
  firewall,
  notifications,
  mediaReleases,
  systemResources,
} satisfies WidgetImportRecord;

export type WidgetImports = typeof widgetImports;
export type WidgetImportKey = keyof WidgetImports;

const loadedComponents = new Map<WidgetKind, ComponentType<WidgetComponentProps<WidgetKind>>>();

export const loadWidgetDynamic = <TKind extends WidgetKind>(kind: TKind) => {
  const existingComponent = loadedComponents.get(kind);
  if (existingComponent) return existingComponent;

  const newlyLoadedComponent = dynamic<WidgetComponentProps<TKind>>(
    widgetImports[kind].componentLoader as Loader<WidgetComponentProps<TKind>>,
    {
      loading: () => (
        <Center w="100%" h="100%">
          <UiLoader />
        </Center>
      ),
    },
  );

  loadedComponents.set(kind, newlyLoadedComponent as never);
  return newlyLoadedComponent;
};

export type inferSupportedIntegrations<TKind extends WidgetKind> = (WidgetImports[TKind]["definition"] extends {
  supportedIntegrations: string[];
}
  ? WidgetImports[TKind]["definition"]["supportedIntegrations"]
  : string[])[number];

export type inferSupportedIntegrationsStrict<TKind extends WidgetKind> = (WidgetImports[TKind]["definition"] extends {
  supportedIntegrations: IntegrationKind[];
}
  ? WidgetImports[TKind]["definition"]["supportedIntegrations"]
  : never[])[number];

export const reduceWidgetOptionsWithDefaultValues = (
  kind: WidgetKind,
  settings: Pick<SettingsContextProps, "enableStatusByDefault" | "forceDisableStatus">,
  currentValue: Record<string, unknown> = {},
) => {
  const definition = widgetImports[kind].definition;
  const options = definition.createOptions(settings) as Record<string, WidgetOptionDefinition>;
  return objectEntries(options).reduce(
    (prev, [key, value]) => ({
      ...prev,
      [key]: currentValue[key] ?? value.defaultValue,
    }),
    {} as Record<string, unknown>,
  );
};
