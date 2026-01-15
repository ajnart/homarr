import { objectEntries } from "@homarr/common";
import type { Inverse } from "@homarr/common/types";
import type { WidgetKind } from "@homarr/definitions";

import type { OldmarrBookmarkDefinition } from "./bookmark";
import type { OldmarrCalendarDefinition } from "./calendar";
import type { OldmarrDashdotDefinition } from "./dashdot";
import type { OldmarrDateDefinition } from "./date";
import type { OldmarrDlspeedDefinition } from "./dlspeed";
import type { OldmarrDnsHoleControlsDefinition } from "./dns-hole-controls";
import type { OldmarrDnsHoleSummaryDefinition } from "./dns-hole-summary";
import type { OldmarrHealthMonitoringDefinition } from "./health-monitoring";
import type { OldmarrIframeDefinition } from "./iframe";
import type { OldmarrIndexerManagerDefinition } from "./indexer-manager";
import type { OldmarrMediaRequestListDefinition } from "./media-requests-list";
import type { OldmarrMediaRequestStatsDefinition } from "./media-requests-stats";
import type { OldmarrMediaServerDefinition } from "./media-server";
import type { OldmarrMediaTranscodingDefinition } from "./media-transcoding";
import type { OldmarrNotebookDefinition } from "./notebook";
import type { OldmarrRssDefinition } from "./rss";
import type { OldmarrSmartHomeEntityStateDefinition } from "./smart-home-entity-state";
import type { OldmarrSmartHomeTriggerAutomationDefinition } from "./smart-home-trigger-automation";
import type { OldmarrTorrentStatusDefinition } from "./torrent-status";
import type { OldmarrUsenetDefinition } from "./usenet";
import type { OldmarrVideoStreamDefinition } from "./video-stream";
import type { OldmarrWeatherDefinition } from "./weather";

export type OldmarrWidgetDefinitions =
  | OldmarrWeatherDefinition
  | OldmarrDateDefinition
  | OldmarrCalendarDefinition
  | OldmarrIndexerManagerDefinition
  | OldmarrDashdotDefinition
  | OldmarrUsenetDefinition
  | OldmarrTorrentStatusDefinition
  | OldmarrDlspeedDefinition
  | OldmarrRssDefinition
  | OldmarrVideoStreamDefinition
  | OldmarrIframeDefinition
  | OldmarrMediaServerDefinition
  | OldmarrMediaRequestListDefinition
  | OldmarrMediaRequestStatsDefinition
  | OldmarrDnsHoleSummaryDefinition
  | OldmarrDnsHoleControlsDefinition
  | OldmarrBookmarkDefinition
  | OldmarrNotebookDefinition
  | OldmarrSmartHomeEntityStateDefinition
  | OldmarrSmartHomeTriggerAutomationDefinition
  | OldmarrHealthMonitoringDefinition
  | OldmarrMediaTranscodingDefinition;

export const widgetKindMapping = {
  date: "clock",
  calendar: "calendar",
  "torrents-status": "downloads",
  weather: "weather",
  rss: "rssFeed",
  "video-stream": "video",
  iframe: "iframe",
  "media-server": "mediaServer",
  "dns-hole-summary": "dnsHoleSummary",
  "dns-hole-controls": "dnsHoleControls",
  notebook: "notebook",
  "smart-home/entity-state": "smartHome-entityState",
  "smart-home/trigger-automation": "smartHome-executeAutomation",
  "media-requests-list": "mediaRequests-requestList",
  "media-requests-stats": "mediaRequests-requestStats",
  "indexer-manager": "indexerManager",
  bookmark: "bookmarks",
  "health-monitoring": "healthMonitoring",
  dashdot: "healthMonitoring",
  "media-transcoding": "mediaTranscoding",
  dlspeed: null,
  usenet: "downloads",
} satisfies Record<OldmarrWidgetDefinitions["id"], WidgetKind | null>;

export type WidgetMapping = typeof widgetKindMapping;
export type InversedWidgetMapping = Inverse<Omit<typeof widgetKindMapping, "dlspeed">>;

export const mapKind = (kind: OldmarrWidgetDefinitions["id"]): keyof InversedWidgetMapping | null =>
  objectEntries(widgetKindMapping).find(([key]) => key === kind)?.[1] ?? null;
