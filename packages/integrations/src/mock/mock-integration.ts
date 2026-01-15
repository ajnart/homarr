import type { IntegrationTestingInput } from "../base/integration";
import { Integration } from "../base/integration";
import type { TestingResult } from "../base/test-connection/test-connection-service";
import type { ICalendarIntegration } from "../interfaces/calendar/calendar-integration";
import type { DnsHoleSummaryIntegration } from "../interfaces/dns-hole-summary/dns-hole-summary-integration";
import type { IDownloadClientIntegration } from "../interfaces/downloads/download-client-integration";
import type {
  IClusterHealthMonitoringIntegration,
  ISystemHealthMonitoringIntegration,
} from "../interfaces/health-monitoring/health-monitoring-integration";
import type { IIndexerManagerIntegration } from "../interfaces/indexer-manager/indexer-manager-integration";
import type { IMediaReleasesIntegration } from "../interfaces/media-releases";
import type { IMediaRequestIntegration } from "../interfaces/media-requests/media-request-integration";
import type { IMediaServerIntegration } from "../interfaces/media-server/media-server-integration";
import type { IMediaTranscodingIntegration } from "../interfaces/media-transcoding/media-transcoding-integration";
import type { NetworkControllerSummaryIntegration } from "../interfaces/network-controller-summary/network-controller-summary-integration";
import type { ISmartHomeIntegration } from "../interfaces/smart-home/smart-home-integration";
import { CalendarMockService } from "./data/calendar";
import { ClusterHealthMonitoringMockService } from "./data/cluster-health-monitoring";
import { DnsHoleMockService } from "./data/dns-hole";
import { DownloadClientMockService } from "./data/download";
import { IndexerManagerMockService } from "./data/indexer-manager";
import { MediaReleasesMockService } from "./data/media-releases";
import { MediaRequestMockService } from "./data/media-request";
import { MediaServerMockService } from "./data/media-server";
import { MediaTranscodingMockService } from "./data/media-transcoding";
import { NetworkControllerSummaryMockService } from "./data/network-controller-summary";
import { NotificationsMockService } from "./data/notifications";
import { SmartHomeMockService } from "./data/smart-home";
import { SystemHealthMonitoringMockService } from "./data/system-health-monitoring";

export class MockIntegration
  extends Integration
  implements
    DnsHoleSummaryIntegration,
    ICalendarIntegration,
    IDownloadClientIntegration,
    IClusterHealthMonitoringIntegration,
    ISystemHealthMonitoringIntegration,
    IIndexerManagerIntegration,
    IMediaReleasesIntegration,
    IMediaRequestIntegration,
    IMediaServerIntegration,
    IMediaTranscodingIntegration,
    NetworkControllerSummaryIntegration,
    ISmartHomeIntegration
{
  private static readonly dnsHole = new DnsHoleMockService();
  private static readonly calendar = new CalendarMockService();
  private static readonly downloadClient = new DownloadClientMockService();
  private static readonly clusterMonitoring = new ClusterHealthMonitoringMockService();
  private static readonly systemMonitoring = new SystemHealthMonitoringMockService();
  private static readonly indexerManager = new IndexerManagerMockService();
  private static readonly mediaReleases = new MediaReleasesMockService();
  private static readonly mediaRequest = new MediaRequestMockService();
  private static readonly mediaServer = new MediaServerMockService();
  private static readonly mediaTranscoding = new MediaTranscodingMockService();
  private static readonly networkController = new NetworkControllerSummaryMockService();
  private static readonly notifications = new NotificationsMockService();
  private static readonly smartHome = new SmartHomeMockService();

  protected async testingAsync(_: IntegrationTestingInput): Promise<TestingResult> {
    return await Promise.resolve({
      success: true,
    });
  }

  // CalendarIntegration
  getCalendarEventsAsync = MockIntegration.calendar.getCalendarEventsAsync.bind(MockIntegration.calendar);

  // DnsHoleSummaryIntegration
  getSummaryAsync = MockIntegration.dnsHole.getSummaryAsync.bind(MockIntegration.dnsHole);
  enableAsync = MockIntegration.dnsHole.enableAsync.bind(MockIntegration.dnsHole);
  disableAsync = MockIntegration.dnsHole.disableAsync.bind(MockIntegration.dnsHole);

  // IDownloadClientIntegration
  getClientJobsAndStatusAsync = MockIntegration.downloadClient.getClientJobsAndStatusAsync.bind(
    MockIntegration.downloadClient,
  );
  pauseQueueAsync = MockIntegration.downloadClient.pauseQueueAsync.bind(MockIntegration.downloadClient);
  pauseItemAsync = MockIntegration.downloadClient.pauseItemAsync.bind(MockIntegration.downloadClient);
  resumeQueueAsync = MockIntegration.downloadClient.resumeQueueAsync.bind(MockIntegration.downloadClient);
  resumeItemAsync = MockIntegration.downloadClient.resumeItemAsync.bind(MockIntegration.downloadClient);
  deleteItemAsync = MockIntegration.downloadClient.deleteItemAsync.bind(MockIntegration.downloadClient);

  // Health Monitoring Integrations
  getSystemInfoAsync = MockIntegration.systemMonitoring.getSystemInfoAsync.bind(MockIntegration.systemMonitoring);
  getClusterInfoAsync = MockIntegration.clusterMonitoring.getClusterInfoAsync.bind(MockIntegration.downloadClient);

  // IndexerManagerIntegration
  getIndexersAsync = MockIntegration.indexerManager.getIndexersAsync.bind(MockIntegration.indexerManager);
  testAllAsync = MockIntegration.indexerManager.testAllAsync.bind(MockIntegration.indexerManager);

  // MediaReleasesIntegration
  getMediaReleasesAsync = MockIntegration.mediaReleases.getMediaReleasesAsync.bind(MockIntegration.mediaReleases);

  // MediaRequestIntegration
  getSeriesInformationAsync = MockIntegration.mediaRequest.getSeriesInformationAsync.bind(MockIntegration.mediaRequest);
  requestMediaAsync = MockIntegration.mediaRequest.requestMediaAsync.bind(MockIntegration.mediaRequest);
  getRequestsAsync = MockIntegration.mediaRequest.getRequestsAsync.bind(MockIntegration.mediaRequest);
  getStatsAsync = MockIntegration.mediaRequest.getStatsAsync.bind(MockIntegration.mediaRequest);
  getUsersAsync = MockIntegration.mediaRequest.getUsersAsync.bind(MockIntegration.mediaRequest);
  approveRequestAsync = MockIntegration.mediaRequest.approveRequestAsync.bind(MockIntegration.mediaRequest);
  declineRequestAsync = MockIntegration.mediaRequest.declineRequestAsync.bind(MockIntegration.mediaRequest);

  // MediaServerIntegration
  getCurrentSessionsAsync = MockIntegration.mediaServer.getCurrentSessionsAsync.bind(MockIntegration.mediaRequest);

  // MediaTranscodingIntegration
  getStatisticsAsync = MockIntegration.mediaTranscoding.getStatisticsAsync.bind(MockIntegration.mediaTranscoding);
  getWorkersAsync = MockIntegration.mediaTranscoding.getWorkersAsync.bind(MockIntegration.mediaTranscoding);
  getQueueAsync = MockIntegration.mediaTranscoding.getQueueAsync.bind(MockIntegration.mediaTranscoding);

  // NetworkControllerSummaryIntegration
  getNetworkSummaryAsync = MockIntegration.networkController.getNetworkSummaryAsync.bind(
    MockIntegration.networkController,
  );

  // NotificationsIntegration
  getNotificationsAsync = MockIntegration.notifications.getNotificationsAsync.bind(MockIntegration.notifications);

  // SmartHomeIntegration
  getEntityStateAsync = MockIntegration.smartHome.getEntityStateAsync.bind(MockIntegration.smartHome);
  triggerAutomationAsync = MockIntegration.smartHome.triggerAutomationAsync.bind(MockIntegration.smartHome);
  triggerToggleAsync = MockIntegration.smartHome.triggerToggleAsync.bind(MockIntegration.smartHome);
}
