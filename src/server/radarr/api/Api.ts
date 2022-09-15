/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import {
  AlternativeTitleResource,
  BackupResource,
  BlocklistBulkResource,
  BlocklistResource,
  BlocklistResourcePagingResource,
  CollectionResource,
  CollectionUpdateResource,
  ColonReplacementFormat,
  CommandResource,
  CreditResource,
  CustomFilterResource,
  CustomFormatResource,
  DelayProfileResource,
  DiskSpaceResource,
  DownloadClientConfigResource,
  DownloadClientResource,
  ExtraFileResource,
  HealthResource,
  HistoryResource,
  HistoryResourcePagingResource,
  HostConfigResource,
  ImportExclusionsResource,
  ImportListConfigResource,
  ImportListResource,
  IndexerConfigResource,
  IndexerFlagResource,
  IndexerResource,
  LanguageResource,
  LogFileResource,
  LogResourcePagingResource,
  ManualImportReprocessResource,
  ManualImportResource,
  MediaManagementConfigResource,
  MetadataConfigResource,
  MetadataResource,
  MovieEditorResource,
  MovieFileListResource,
  MovieFileResource,
  MovieHistoryEventType,
  MovieResource,
  NamingConfigResource,
  NotificationResource,
  ParseResource,
  QualityDefinitionResource,
  QualityProfileResource,
  QueueBulkResource,
  QueueResource,
  QueueResourcePagingResource,
  QueueStatusResource,
  ReleaseResource,
  RemotePathMappingResource,
  RenameMovieResource,
  RestrictionResource,
  RootFolderResource,
  TagDetailsResource,
  TagResource,
  TaskResource,
  UiConfigResource,
  UpdateResource,
} from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class RadarrApi<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags AlternativeTitle
   * @name V3AlttitleList
   * @request GET:/api/v3/alttitle
   * @secure
   */
  v3AlttitleList = (
    query?: { movieId?: number; movieMetadataId?: number },
    params: RequestParams = {}
  ) =>
    this.request<AlternativeTitleResource[], any>({
      path: `/api/v3/alttitle`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags AlternativeTitle
   * @name V3AlttitleDetail
   * @request GET:/api/v3/alttitle/{id}
   * @secure
   */
  v3AlttitleDetail = (id: number, params: RequestParams = {}) =>
    this.request<AlternativeTitleResource, any>({
      path: `/api/v3/alttitle/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Backup
   * @name V3SystemBackupList
   * @request GET:/api/v3/system/backup
   * @secure
   */
  v3SystemBackupList = (params: RequestParams = {}) =>
    this.request<BackupResource[], any>({
      path: `/api/v3/system/backup`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Backup
   * @name V3SystemBackupDelete
   * @request DELETE:/api/v3/system/backup/{id}
   * @secure
   */
  v3SystemBackupDelete = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/system/backup/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Backup
   * @name V3SystemBackupRestoreCreate
   * @request POST:/api/v3/system/backup/restore/{id}
   * @secure
   */
  v3SystemBackupRestoreCreate = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/system/backup/restore/${id}`,
      method: 'POST',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Backup
   * @name V3SystemBackupRestoreUploadCreate
   * @request POST:/api/v3/system/backup/restore/upload
   * @secure
   */
  v3SystemBackupRestoreUploadCreate = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/system/backup/restore/upload`,
      method: 'POST',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Blocklist
   * @name V3BlocklistList
   * @request GET:/api/v3/blocklist
   * @secure
   */
  v3BlocklistList = (params: RequestParams = {}) =>
    this.request<BlocklistResourcePagingResource, any>({
      path: `/api/v3/blocklist`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Blocklist
   * @name V3BlocklistMovieList
   * @request GET:/api/v3/blocklist/movie
   * @secure
   */
  v3BlocklistMovieList = (query?: { movieId?: number }, params: RequestParams = {}) =>
    this.request<BlocklistResource[], any>({
      path: `/api/v3/blocklist/movie`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Blocklist
   * @name V3BlocklistDelete
   * @request DELETE:/api/v3/blocklist/{id}
   * @secure
   */
  v3BlocklistDelete = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/blocklist/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Blocklist
   * @name V3BlocklistBulkDelete
   * @request DELETE:/api/v3/blocklist/bulk
   * @secure
   */
  v3BlocklistBulkDelete = (data: BlocklistBulkResource, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/blocklist/bulk`,
      method: 'DELETE',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Calendar
   * @name V3CalendarList
   * @request GET:/api/v3/calendar
   * @secure
   */
  v3CalendarList = (
    query?: { start?: string; end?: string; unmonitored?: boolean; includeArtist?: boolean },
    params: RequestParams = {}
  ) =>
    this.request<MovieResource[], any>({
      path: `/api/v3/calendar`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Calendar
   * @name V3CalendarDetail
   * @request GET:/api/v3/calendar/{id}
   * @secure
   */
  v3CalendarDetail = (id: number, params: RequestParams = {}) =>
    this.request<MovieResource, any>({
      path: `/api/v3/calendar/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Collection
   * @name V3CollectionList
   * @request GET:/api/v3/collection
   * @secure
   */
  v3CollectionList = (query?: { tmdbId?: number }, params: RequestParams = {}) =>
    this.request<CollectionResource[], any>({
      path: `/api/v3/collection`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Collection
   * @name V3CollectionUpdate
   * @request PUT:/api/v3/collection
   * @secure
   */
  v3CollectionUpdate = (data: CollectionUpdateResource, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/collection`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Collection
   * @name V3CollectionUpdate2
   * @request PUT:/api/v3/collection/{id}
   * @originalName v3CollectionUpdate
   * @duplicate
   * @secure
   */
  v3CollectionUpdate2 = (id: string, data: CollectionResource, params: RequestParams = {}) =>
    this.request<CollectionResource, any>({
      path: `/api/v3/collection/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Collection
   * @name V3CollectionDetail
   * @request GET:/api/v3/collection/{id}
   * @secure
   */
  v3CollectionDetail = (id: number, params: RequestParams = {}) =>
    this.request<CollectionResource, any>({
      path: `/api/v3/collection/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Command
   * @name V3CommandCreate
   * @request POST:/api/v3/command
   * @secure
   */
  v3CommandCreate = (data: CommandResource, params: RequestParams = {}) =>
    this.request<CommandResource, any>({
      path: `/api/v3/command`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Command
   * @name V3CommandList
   * @request GET:/api/v3/command
   * @secure
   */
  v3CommandList = (params: RequestParams = {}) =>
    this.request<CommandResource[], any>({
      path: `/api/v3/command`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Command
   * @name V3CommandDelete
   * @request DELETE:/api/v3/command/{id}
   * @secure
   */
  v3CommandDelete = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/command/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Command
   * @name V3CommandDetail
   * @request GET:/api/v3/command/{id}
   * @secure
   */
  v3CommandDetail = (id: number, params: RequestParams = {}) =>
    this.request<CommandResource, any>({
      path: `/api/v3/command/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Credit
   * @name V3CreditList
   * @request GET:/api/v3/credit
   * @secure
   */
  v3CreditList = (
    query?: { movieId?: number; movieMetadataId?: number },
    params: RequestParams = {}
  ) =>
    this.request<CreditResource[], any>({
      path: `/api/v3/credit`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Credit
   * @name V3CreditDetail
   * @request GET:/api/v3/credit/{id}
   * @secure
   */
  v3CreditDetail = (id: number, params: RequestParams = {}) =>
    this.request<CreditResource, any>({
      path: `/api/v3/credit/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags CustomFilter
   * @name V3CustomfilterList
   * @request GET:/api/v3/customfilter
   * @secure
   */
  v3CustomfilterList = (params: RequestParams = {}) =>
    this.request<CustomFilterResource[], any>({
      path: `/api/v3/customfilter`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags CustomFilter
   * @name V3CustomfilterCreate
   * @request POST:/api/v3/customfilter
   * @secure
   */
  v3CustomfilterCreate = (data: CustomFilterResource, params: RequestParams = {}) =>
    this.request<CustomFilterResource, any>({
      path: `/api/v3/customfilter`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags CustomFilter
   * @name V3CustomfilterUpdate
   * @request PUT:/api/v3/customfilter/{id}
   * @secure
   */
  v3CustomfilterUpdate = (id: string, data: CustomFilterResource, params: RequestParams = {}) =>
    this.request<CustomFilterResource, any>({
      path: `/api/v3/customfilter/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags CustomFilter
   * @name V3CustomfilterDelete
   * @request DELETE:/api/v3/customfilter/{id}
   * @secure
   */
  v3CustomfilterDelete = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/customfilter/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags CustomFilter
   * @name V3CustomfilterDetail
   * @request GET:/api/v3/customfilter/{id}
   * @secure
   */
  v3CustomfilterDetail = (id: number, params: RequestParams = {}) =>
    this.request<CustomFilterResource, any>({
      path: `/api/v3/customfilter/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags CustomFormat
   * @name V3CustomformatCreate
   * @request POST:/api/v3/customformat
   * @secure
   */
  v3CustomformatCreate = (data: CustomFormatResource, params: RequestParams = {}) =>
    this.request<CustomFormatResource, any>({
      path: `/api/v3/customformat`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags CustomFormat
   * @name V3CustomformatList
   * @request GET:/api/v3/customformat
   * @secure
   */
  v3CustomformatList = (params: RequestParams = {}) =>
    this.request<CustomFormatResource[], any>({
      path: `/api/v3/customformat`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags CustomFormat
   * @name V3CustomformatUpdate
   * @request PUT:/api/v3/customformat/{id}
   * @secure
   */
  v3CustomformatUpdate = (id: string, data: CustomFormatResource, params: RequestParams = {}) =>
    this.request<CustomFormatResource, any>({
      path: `/api/v3/customformat/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags CustomFormat
   * @name V3CustomformatDelete
   * @request DELETE:/api/v3/customformat/{id}
   * @secure
   */
  v3CustomformatDelete = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/customformat/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags CustomFormat
   * @name V3CustomformatDetail
   * @request GET:/api/v3/customformat/{id}
   * @secure
   */
  v3CustomformatDetail = (id: number, params: RequestParams = {}) =>
    this.request<CustomFormatResource, any>({
      path: `/api/v3/customformat/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags CustomFormat
   * @name V3CustomformatSchemaList
   * @request GET:/api/v3/customformat/schema
   * @secure
   */
  v3CustomformatSchemaList = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/customformat/schema`,
      method: 'GET',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags DelayProfile
   * @name V3DelayprofileCreate
   * @request POST:/api/v3/delayprofile
   * @secure
   */
  v3DelayprofileCreate = (data: DelayProfileResource, params: RequestParams = {}) =>
    this.request<DelayProfileResource, any>({
      path: `/api/v3/delayprofile`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags DelayProfile
   * @name V3DelayprofileList
   * @request GET:/api/v3/delayprofile
   * @secure
   */
  v3DelayprofileList = (params: RequestParams = {}) =>
    this.request<DelayProfileResource[], any>({
      path: `/api/v3/delayprofile`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags DelayProfile
   * @name V3DelayprofileDelete
   * @request DELETE:/api/v3/delayprofile/{id}
   * @secure
   */
  v3DelayprofileDelete = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/delayprofile/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags DelayProfile
   * @name V3DelayprofileUpdate
   * @request PUT:/api/v3/delayprofile/{id}
   * @secure
   */
  v3DelayprofileUpdate = (id: string, data: DelayProfileResource, params: RequestParams = {}) =>
    this.request<DelayProfileResource, any>({
      path: `/api/v3/delayprofile/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags DelayProfile
   * @name V3DelayprofileDetail
   * @request GET:/api/v3/delayprofile/{id}
   * @secure
   */
  v3DelayprofileDetail = (id: number, params: RequestParams = {}) =>
    this.request<DelayProfileResource, any>({
      path: `/api/v3/delayprofile/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags DiskSpace
   * @name V3DiskspaceList
   * @request GET:/api/v3/diskspace
   * @secure
   */
  v3DiskspaceList = (params: RequestParams = {}) =>
    this.request<DiskSpaceResource[], any>({
      path: `/api/v3/diskspace`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags DownloadClient
   * @name V3DownloadclientList
   * @request GET:/api/v3/downloadclient
   * @secure
   */
  v3DownloadclientList = (params: RequestParams = {}) =>
    this.request<DownloadClientResource[], any>({
      path: `/api/v3/downloadclient`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags DownloadClient
   * @name V3DownloadclientCreate
   * @request POST:/api/v3/downloadclient
   * @secure
   */
  v3DownloadclientCreate = (data: DownloadClientResource, params: RequestParams = {}) =>
    this.request<DownloadClientResource, any>({
      path: `/api/v3/downloadclient`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags DownloadClient
   * @name V3DownloadclientUpdate
   * @request PUT:/api/v3/downloadclient/{id}
   * @secure
   */
  v3DownloadclientUpdate = (id: string, data: DownloadClientResource, params: RequestParams = {}) =>
    this.request<DownloadClientResource, any>({
      path: `/api/v3/downloadclient/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags DownloadClient
   * @name V3DownloadclientDelete
   * @request DELETE:/api/v3/downloadclient/{id}
   * @secure
   */
  v3DownloadclientDelete = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/downloadclient/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags DownloadClient
   * @name V3DownloadclientDetail
   * @request GET:/api/v3/downloadclient/{id}
   * @secure
   */
  v3DownloadclientDetail = (id: number, params: RequestParams = {}) =>
    this.request<DownloadClientResource, any>({
      path: `/api/v3/downloadclient/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags DownloadClient
   * @name V3DownloadclientSchemaList
   * @request GET:/api/v3/downloadclient/schema
   * @secure
   */
  v3DownloadclientSchemaList = (params: RequestParams = {}) =>
    this.request<DownloadClientResource[], any>({
      path: `/api/v3/downloadclient/schema`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags DownloadClient
   * @name V3DownloadclientTestCreate
   * @request POST:/api/v3/downloadclient/test
   * @secure
   */
  v3DownloadclientTestCreate = (data: DownloadClientResource, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/downloadclient/test`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags DownloadClient
   * @name V3DownloadclientTestallCreate
   * @request POST:/api/v3/downloadclient/testall
   * @secure
   */
  v3DownloadclientTestallCreate = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/downloadclient/testall`,
      method: 'POST',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags DownloadClient
   * @name V3DownloadclientActionCreate
   * @request POST:/api/v3/downloadclient/action/{name}
   * @secure
   */
  v3DownloadclientActionCreate = (
    name: string,
    data: DownloadClientResource,
    params: RequestParams = {}
  ) =>
    this.request<void, any>({
      path: `/api/v3/downloadclient/action/${name}`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags DownloadClientConfig
   * @name V3ConfigDownloadclientList
   * @request GET:/api/v3/config/downloadclient
   * @secure
   */
  v3ConfigDownloadclientList = (params: RequestParams = {}) =>
    this.request<DownloadClientConfigResource, any>({
      path: `/api/v3/config/downloadclient`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags DownloadClientConfig
   * @name V3ConfigDownloadclientUpdate
   * @request PUT:/api/v3/config/downloadclient/{id}
   * @secure
   */
  v3ConfigDownloadclientUpdate = (
    id: string,
    data: DownloadClientConfigResource,
    params: RequestParams = {}
  ) =>
    this.request<DownloadClientConfigResource, any>({
      path: `/api/v3/config/downloadclient/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags DownloadClientConfig
   * @name V3ConfigDownloadclientDetail
   * @request GET:/api/v3/config/downloadclient/{id}
   * @secure
   */
  v3ConfigDownloadclientDetail = (id: number, params: RequestParams = {}) =>
    this.request<DownloadClientConfigResource, any>({
      path: `/api/v3/config/downloadclient/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags ExtraFile
   * @name V3ExtrafileList
   * @request GET:/api/v3/extrafile
   * @secure
   */
  v3ExtrafileList = (query?: { movieId?: number }, params: RequestParams = {}) =>
    this.request<ExtraFileResource[], any>({
      path: `/api/v3/extrafile`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags FileSystem
   * @name V3FilesystemList
   * @request GET:/api/v3/filesystem
   * @secure
   */
  v3FilesystemList = (
    query?: { path?: string; includeFiles?: boolean; allowFoldersWithoutTrailingSlashes?: boolean },
    params: RequestParams = {}
  ) =>
    this.request<void, any>({
      path: `/api/v3/filesystem`,
      method: 'GET',
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags FileSystem
   * @name V3FilesystemTypeList
   * @request GET:/api/v3/filesystem/type
   * @secure
   */
  v3FilesystemTypeList = (query?: { path?: string }, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/filesystem/type`,
      method: 'GET',
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags FileSystem
   * @name V3FilesystemMediafilesList
   * @request GET:/api/v3/filesystem/mediafiles
   * @secure
   */
  v3FilesystemMediafilesList = (query?: { path?: string }, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/filesystem/mediafiles`,
      method: 'GET',
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Health
   * @name V3HealthList
   * @request GET:/api/v3/health
   * @secure
   */
  v3HealthList = (params: RequestParams = {}) =>
    this.request<HealthResource[], any>({
      path: `/api/v3/health`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Health
   * @name V3HealthDetail
   * @request GET:/api/v3/health/{id}
   * @secure
   */
  v3HealthDetail = (id: number, params: RequestParams = {}) =>
    this.request<HealthResource, any>({
      path: `/api/v3/health/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags History
   * @name V3HistoryList
   * @request GET:/api/v3/history
   * @secure
   */
  v3HistoryList = (query?: { includeMovie?: boolean }, params: RequestParams = {}) =>
    this.request<HistoryResourcePagingResource, any>({
      path: `/api/v3/history`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags History
   * @name V3HistorySinceList
   * @request GET:/api/v3/history/since
   * @secure
   */
  v3HistorySinceList = (
    query?: { date?: string; eventType?: MovieHistoryEventType; includeMovie?: boolean },
    params: RequestParams = {}
  ) =>
    this.request<HistoryResource[], any>({
      path: `/api/v3/history/since`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags History
   * @name V3HistoryMovieList
   * @request GET:/api/v3/history/movie
   * @secure
   */
  v3HistoryMovieList = (
    query?: { movieId?: number; eventType?: MovieHistoryEventType; includeMovie?: boolean },
    params: RequestParams = {}
  ) =>
    this.request<HistoryResource[], any>({
      path: `/api/v3/history/movie`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags History
   * @name V3HistoryFailedCreate
   * @request POST:/api/v3/history/failed/{id}
   * @secure
   */
  v3HistoryFailedCreate = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/history/failed/${id}`,
      method: 'POST',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags HostConfig
   * @name V3ConfigHostList
   * @request GET:/api/v3/config/host
   * @secure
   */
  v3ConfigHostList = (params: RequestParams = {}) =>
    this.request<HostConfigResource, any>({
      path: `/api/v3/config/host`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags HostConfig
   * @name V3ConfigHostUpdate
   * @request PUT:/api/v3/config/host/{id}
   * @secure
   */
  v3ConfigHostUpdate = (id: string, data: HostConfigResource, params: RequestParams = {}) =>
    this.request<HostConfigResource, any>({
      path: `/api/v3/config/host/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags HostConfig
   * @name V3ConfigHostDetail
   * @request GET:/api/v3/config/host/{id}
   * @secure
   */
  v3ConfigHostDetail = (id: number, params: RequestParams = {}) =>
    this.request<HostConfigResource, any>({
      path: `/api/v3/config/host/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags ImportExclusions
   * @name V3ExclusionsList
   * @request GET:/api/v3/exclusions
   * @secure
   */
  v3ExclusionsList = (params: RequestParams = {}) =>
    this.request<ImportExclusionsResource[], any>({
      path: `/api/v3/exclusions`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags ImportExclusions
   * @name V3ExclusionsCreate
   * @request POST:/api/v3/exclusions
   * @secure
   */
  v3ExclusionsCreate = (data: ImportExclusionsResource, params: RequestParams = {}) =>
    this.request<ImportExclusionsResource, any>({
      path: `/api/v3/exclusions`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags ImportExclusions
   * @name V3ExclusionsUpdate
   * @request PUT:/api/v3/exclusions/{id}
   * @secure
   */
  v3ExclusionsUpdate = (id: string, data: ImportExclusionsResource, params: RequestParams = {}) =>
    this.request<ImportExclusionsResource, any>({
      path: `/api/v3/exclusions/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags ImportExclusions
   * @name V3ExclusionsDelete
   * @request DELETE:/api/v3/exclusions/{id}
   * @secure
   */
  v3ExclusionsDelete = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/exclusions/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags ImportExclusions
   * @name V3ExclusionsDetail
   * @request GET:/api/v3/exclusions/{id}
   * @secure
   */
  v3ExclusionsDetail = (id: number, params: RequestParams = {}) =>
    this.request<ImportExclusionsResource, any>({
      path: `/api/v3/exclusions/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags ImportExclusions
   * @name V3ExclusionsBulkCreate
   * @request POST:/api/v3/exclusions/bulk
   * @secure
   */
  v3ExclusionsBulkCreate = (data: ImportExclusionsResource[], params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/exclusions/bulk`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags ImportList
   * @name V3ImportlistList
   * @request GET:/api/v3/importlist
   * @secure
   */
  v3ImportlistList = (params: RequestParams = {}) =>
    this.request<ImportListResource[], any>({
      path: `/api/v3/importlist`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags ImportList
   * @name V3ImportlistCreate
   * @request POST:/api/v3/importlist
   * @secure
   */
  v3ImportlistCreate = (data: ImportListResource, params: RequestParams = {}) =>
    this.request<ImportListResource, any>({
      path: `/api/v3/importlist`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags ImportList
   * @name V3ImportlistUpdate
   * @request PUT:/api/v3/importlist/{id}
   * @secure
   */
  v3ImportlistUpdate = (id: string, data: ImportListResource, params: RequestParams = {}) =>
    this.request<ImportListResource, any>({
      path: `/api/v3/importlist/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags ImportList
   * @name V3ImportlistDelete
   * @request DELETE:/api/v3/importlist/{id}
   * @secure
   */
  v3ImportlistDelete = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/importlist/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags ImportList
   * @name V3ImportlistDetail
   * @request GET:/api/v3/importlist/{id}
   * @secure
   */
  v3ImportlistDetail = (id: number, params: RequestParams = {}) =>
    this.request<ImportListResource, any>({
      path: `/api/v3/importlist/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags ImportList
   * @name V3ImportlistSchemaList
   * @request GET:/api/v3/importlist/schema
   * @secure
   */
  v3ImportlistSchemaList = (params: RequestParams = {}) =>
    this.request<ImportListResource[], any>({
      path: `/api/v3/importlist/schema`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags ImportList
   * @name V3ImportlistTestCreate
   * @request POST:/api/v3/importlist/test
   * @secure
   */
  v3ImportlistTestCreate = (data: ImportListResource, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/importlist/test`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags ImportList
   * @name V3ImportlistTestallCreate
   * @request POST:/api/v3/importlist/testall
   * @secure
   */
  v3ImportlistTestallCreate = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/importlist/testall`,
      method: 'POST',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags ImportList
   * @name V3ImportlistActionCreate
   * @request POST:/api/v3/importlist/action/{name}
   * @secure
   */
  v3ImportlistActionCreate = (name: string, data: ImportListResource, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/importlist/action/${name}`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags ImportListConfig
   * @name V3ConfigImportlistList
   * @request GET:/api/v3/config/importlist
   * @secure
   */
  v3ConfigImportlistList = (params: RequestParams = {}) =>
    this.request<ImportListConfigResource, any>({
      path: `/api/v3/config/importlist`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags ImportListConfig
   * @name V3ConfigImportlistUpdate
   * @request PUT:/api/v3/config/importlist/{id}
   * @secure
   */
  v3ConfigImportlistUpdate = (
    id: string,
    data: ImportListConfigResource,
    params: RequestParams = {}
  ) =>
    this.request<ImportListConfigResource, any>({
      path: `/api/v3/config/importlist/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags ImportListConfig
   * @name V3ConfigImportlistDetail
   * @request GET:/api/v3/config/importlist/{id}
   * @secure
   */
  v3ConfigImportlistDetail = (id: number, params: RequestParams = {}) =>
    this.request<ImportListConfigResource, any>({
      path: `/api/v3/config/importlist/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags ImportListMovies
   * @name V3ImportlistMovieList
   * @request GET:/api/v3/importlist/movie
   * @secure
   */
  v3ImportlistMovieList = (
    query?: { includeRecommendations?: boolean },
    params: RequestParams = {}
  ) =>
    this.request<void, any>({
      path: `/api/v3/importlist/movie`,
      method: 'GET',
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags ImportListMovies
   * @name V3ImportlistMovieCreate
   * @request POST:/api/v3/importlist/movie
   * @secure
   */
  v3ImportlistMovieCreate = (data: MovieResource[], params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/importlist/movie`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Indexer
   * @name V3IndexerList
   * @request GET:/api/v3/indexer
   * @secure
   */
  v3IndexerList = (params: RequestParams = {}) =>
    this.request<IndexerResource[], any>({
      path: `/api/v3/indexer`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Indexer
   * @name V3IndexerCreate
   * @request POST:/api/v3/indexer
   * @secure
   */
  v3IndexerCreate = (data: IndexerResource, params: RequestParams = {}) =>
    this.request<IndexerResource, any>({
      path: `/api/v3/indexer`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Indexer
   * @name V3IndexerUpdate
   * @request PUT:/api/v3/indexer/{id}
   * @secure
   */
  v3IndexerUpdate = (id: string, data: IndexerResource, params: RequestParams = {}) =>
    this.request<IndexerResource, any>({
      path: `/api/v3/indexer/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Indexer
   * @name V3IndexerDelete
   * @request DELETE:/api/v3/indexer/{id}
   * @secure
   */
  v3IndexerDelete = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/indexer/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Indexer
   * @name V3IndexerDetail
   * @request GET:/api/v3/indexer/{id}
   * @secure
   */
  v3IndexerDetail = (id: number, params: RequestParams = {}) =>
    this.request<IndexerResource, any>({
      path: `/api/v3/indexer/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Indexer
   * @name V3IndexerSchemaList
   * @request GET:/api/v3/indexer/schema
   * @secure
   */
  v3IndexerSchemaList = (params: RequestParams = {}) =>
    this.request<IndexerResource[], any>({
      path: `/api/v3/indexer/schema`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Indexer
   * @name V3IndexerTestCreate
   * @request POST:/api/v3/indexer/test
   * @secure
   */
  v3IndexerTestCreate = (data: IndexerResource, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/indexer/test`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Indexer
   * @name V3IndexerTestallCreate
   * @request POST:/api/v3/indexer/testall
   * @secure
   */
  v3IndexerTestallCreate = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/indexer/testall`,
      method: 'POST',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Indexer
   * @name V3IndexerActionCreate
   * @request POST:/api/v3/indexer/action/{name}
   * @secure
   */
  v3IndexerActionCreate = (name: string, data: IndexerResource, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/indexer/action/${name}`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags IndexerConfig
   * @name V3ConfigIndexerList
   * @request GET:/api/v3/config/indexer
   * @secure
   */
  v3ConfigIndexerList = (params: RequestParams = {}) =>
    this.request<IndexerConfigResource, any>({
      path: `/api/v3/config/indexer`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags IndexerConfig
   * @name V3ConfigIndexerUpdate
   * @request PUT:/api/v3/config/indexer/{id}
   * @secure
   */
  v3ConfigIndexerUpdate = (id: string, data: IndexerConfigResource, params: RequestParams = {}) =>
    this.request<IndexerConfigResource, any>({
      path: `/api/v3/config/indexer/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags IndexerConfig
   * @name V3ConfigIndexerDetail
   * @request GET:/api/v3/config/indexer/{id}
   * @secure
   */
  v3ConfigIndexerDetail = (id: number, params: RequestParams = {}) =>
    this.request<IndexerConfigResource, any>({
      path: `/api/v3/config/indexer/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags IndexerFlag
   * @name V3IndexerflagList
   * @request GET:/api/v3/indexerflag
   * @secure
   */
  v3IndexerflagList = (params: RequestParams = {}) =>
    this.request<IndexerFlagResource[], any>({
      path: `/api/v3/indexerflag`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Language
   * @name V3LanguageList
   * @request GET:/api/v3/language
   * @secure
   */
  v3LanguageList = (params: RequestParams = {}) =>
    this.request<LanguageResource[], any>({
      path: `/api/v3/language`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Language
   * @name V3LanguageDetail
   * @request GET:/api/v3/language/{id}
   * @secure
   */
  v3LanguageDetail = (id: number, params: RequestParams = {}) =>
    this.request<LanguageResource, any>({
      path: `/api/v3/language/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Localization
   * @name V3LocalizationList
   * @request GET:/api/v3/localization
   * @secure
   */
  v3LocalizationList = (params: RequestParams = {}) =>
    this.request<string, any>({
      path: `/api/v3/localization`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Log
   * @name V3LogList
   * @request GET:/api/v3/log
   * @secure
   */
  v3LogList = (params: RequestParams = {}) =>
    this.request<LogResourcePagingResource, any>({
      path: `/api/v3/log`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags LogFile
   * @name V3LogFileList
   * @request GET:/api/v3/log/file
   * @secure
   */
  v3LogFileList = (params: RequestParams = {}) =>
    this.request<LogFileResource[], any>({
      path: `/api/v3/log/file`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags LogFile
   * @name V3LogFileDetail
   * @request GET:/api/v3/log/file/{filename}
   * @secure
   */
  v3LogFileDetail = (filename: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/log/file/${filename}`,
      method: 'GET',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags ManualImport
   * @name V3ManualimportList
   * @request GET:/api/v3/manualimport
   * @secure
   */
  v3ManualimportList = (
    query?: {
      folder?: string;
      downloadId?: string;
      movieId?: number;
      filterExistingFiles?: boolean;
    },
    params: RequestParams = {}
  ) =>
    this.request<ManualImportResource[], any>({
      path: `/api/v3/manualimport`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags ManualImport
   * @name V3ManualimportCreate
   * @request POST:/api/v3/manualimport
   * @secure
   */
  v3ManualimportCreate = (data: ManualImportReprocessResource[], params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/manualimport`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags MediaCover
   * @name V3MediacoverDetail
   * @request GET:/api/v3/mediacover/{movieId}/{filename}
   * @secure
   */
  v3MediacoverDetail = (movieId: number, filename: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/mediacover/${movieId}/${filename}`,
      method: 'GET',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags MediaManagementConfig
   * @name V3ConfigMediamanagementList
   * @request GET:/api/v3/config/mediamanagement
   * @secure
   */
  v3ConfigMediamanagementList = (params: RequestParams = {}) =>
    this.request<MediaManagementConfigResource, any>({
      path: `/api/v3/config/mediamanagement`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags MediaManagementConfig
   * @name V3ConfigMediamanagementUpdate
   * @request PUT:/api/v3/config/mediamanagement/{id}
   * @secure
   */
  v3ConfigMediamanagementUpdate = (
    id: string,
    data: MediaManagementConfigResource,
    params: RequestParams = {}
  ) =>
    this.request<MediaManagementConfigResource, any>({
      path: `/api/v3/config/mediamanagement/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags MediaManagementConfig
   * @name V3ConfigMediamanagementDetail
   * @request GET:/api/v3/config/mediamanagement/{id}
   * @secure
   */
  v3ConfigMediamanagementDetail = (id: number, params: RequestParams = {}) =>
    this.request<MediaManagementConfigResource, any>({
      path: `/api/v3/config/mediamanagement/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Metadata
   * @name V3MetadataList
   * @request GET:/api/v3/metadata
   * @secure
   */
  v3MetadataList = (params: RequestParams = {}) =>
    this.request<MetadataResource[], any>({
      path: `/api/v3/metadata`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Metadata
   * @name V3MetadataCreate
   * @request POST:/api/v3/metadata
   * @secure
   */
  v3MetadataCreate = (data: MetadataResource, params: RequestParams = {}) =>
    this.request<MetadataResource, any>({
      path: `/api/v3/metadata`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Metadata
   * @name V3MetadataUpdate
   * @request PUT:/api/v3/metadata/{id}
   * @secure
   */
  v3MetadataUpdate = (id: string, data: MetadataResource, params: RequestParams = {}) =>
    this.request<MetadataResource, any>({
      path: `/api/v3/metadata/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Metadata
   * @name V3MetadataDelete
   * @request DELETE:/api/v3/metadata/{id}
   * @secure
   */
  v3MetadataDelete = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/metadata/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Metadata
   * @name V3MetadataDetail
   * @request GET:/api/v3/metadata/{id}
   * @secure
   */
  v3MetadataDetail = (id: number, params: RequestParams = {}) =>
    this.request<MetadataResource, any>({
      path: `/api/v3/metadata/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Metadata
   * @name V3MetadataSchemaList
   * @request GET:/api/v3/metadata/schema
   * @secure
   */
  v3MetadataSchemaList = (params: RequestParams = {}) =>
    this.request<MetadataResource[], any>({
      path: `/api/v3/metadata/schema`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Metadata
   * @name V3MetadataTestCreate
   * @request POST:/api/v3/metadata/test
   * @secure
   */
  v3MetadataTestCreate = (data: MetadataResource, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/metadata/test`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Metadata
   * @name V3MetadataTestallCreate
   * @request POST:/api/v3/metadata/testall
   * @secure
   */
  v3MetadataTestallCreate = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/metadata/testall`,
      method: 'POST',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Metadata
   * @name V3MetadataActionCreate
   * @request POST:/api/v3/metadata/action/{name}
   * @secure
   */
  v3MetadataActionCreate = (name: string, data: MetadataResource, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/metadata/action/${name}`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags MetadataConfig
   * @name V3ConfigMetadataList
   * @request GET:/api/v3/config/metadata
   * @secure
   */
  v3ConfigMetadataList = (params: RequestParams = {}) =>
    this.request<MetadataConfigResource, any>({
      path: `/api/v3/config/metadata`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags MetadataConfig
   * @name V3ConfigMetadataUpdate
   * @request PUT:/api/v3/config/metadata/{id}
   * @secure
   */
  v3ConfigMetadataUpdate = (id: string, data: MetadataConfigResource, params: RequestParams = {}) =>
    this.request<MetadataConfigResource, any>({
      path: `/api/v3/config/metadata/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags MetadataConfig
   * @name V3ConfigMetadataDetail
   * @request GET:/api/v3/config/metadata/{id}
   * @secure
   */
  v3ConfigMetadataDetail = (id: number, params: RequestParams = {}) =>
    this.request<MetadataConfigResource, any>({
      path: `/api/v3/config/metadata/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Movie
   * @name V3MovieList
   * @request GET:/api/v3/movie
   * @secure
   */
  v3MovieList = (query?: { tmdbId?: number }, params: RequestParams = {}) =>
    this.request<MovieResource[], any>({
      path: `/api/v3/movie`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Movie
   * @name V3MovieCreate
   * @request POST:/api/v3/movie
   * @secure
   */
  v3MovieCreate = (data: MovieResource, params: RequestParams = {}) =>
    this.request<MovieResource, any>({
      path: `/api/v3/movie`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Movie
   * @name V3MovieUpdate
   * @request PUT:/api/v3/movie/{id}
   * @secure
   */
  v3MovieUpdate = (id: string, data: MovieResource, params: RequestParams = {}) =>
    this.request<MovieResource, any>({
      path: `/api/v3/movie/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Movie
   * @name V3MovieDelete
   * @request DELETE:/api/v3/movie/{id}
   * @secure
   */
  v3MovieDelete = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/movie/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Movie
   * @name V3MovieDetail
   * @request GET:/api/v3/movie/{id}
   * @secure
   */
  v3MovieDetail = (id: number, params: RequestParams = {}) =>
    this.request<MovieResource, any>({
      path: `/api/v3/movie/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags MovieEditor
   * @name V3MovieEditorUpdate
   * @request PUT:/api/v3/movie/editor
   * @secure
   */
  v3MovieEditorUpdate = (data: MovieEditorResource, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/movie/editor`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags MovieEditor
   * @name V3MovieEditorDelete
   * @request DELETE:/api/v3/movie/editor
   * @secure
   */
  v3MovieEditorDelete = (data: MovieEditorResource, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/movie/editor`,
      method: 'DELETE',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags MovieFile
   * @name V3MoviefileList
   * @request GET:/api/v3/moviefile
   * @secure
   */
  v3MoviefileList = (
    query?: { movieId?: number; movieFileIds?: number[] },
    params: RequestParams = {}
  ) =>
    this.request<MovieFileResource[], any>({
      path: `/api/v3/moviefile`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags MovieFile
   * @name V3MoviefileUpdate
   * @request PUT:/api/v3/moviefile/{id}
   * @secure
   */
  v3MoviefileUpdate = (id: string, data: MovieFileResource, params: RequestParams = {}) =>
    this.request<MovieFileResource, any>({
      path: `/api/v3/moviefile/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags MovieFile
   * @name V3MoviefileDelete
   * @request DELETE:/api/v3/moviefile/{id}
   * @secure
   */
  v3MoviefileDelete = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/moviefile/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags MovieFile
   * @name V3MoviefileDetail
   * @request GET:/api/v3/moviefile/{id}
   * @secure
   */
  v3MoviefileDetail = (id: number, params: RequestParams = {}) =>
    this.request<MovieFileResource, any>({
      path: `/api/v3/moviefile/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags MovieFile
   * @name V3MoviefileEditorUpdate
   * @request PUT:/api/v3/moviefile/editor
   * @secure
   */
  v3MoviefileEditorUpdate = (data: MovieFileListResource, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/moviefile/editor`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags MovieFile
   * @name V3MoviefileBulkDelete
   * @request DELETE:/api/v3/moviefile/bulk
   * @secure
   */
  v3MoviefileBulkDelete = (data: MovieFileListResource, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/moviefile/bulk`,
      method: 'DELETE',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags MovieImport
   * @name V3MovieImportCreate
   * @request POST:/api/v3/movie/import
   * @secure
   */
  v3MovieImportCreate = (data: MovieResource[], params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/movie/import`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags MovieImport
   * @name V3MovieImportDetail
   * @request GET:/api/v3/movie/import/{id}
   * @secure
   */
  v3MovieImportDetail = (id: number, params: RequestParams = {}) =>
    this.request<MovieResource, any>({
      path: `/api/v3/movie/import/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags MovieLookup
   * @name V3MovieLookupTmdbList
   * @request GET:/api/v3/movie/lookup/tmdb
   * @secure
   */
  v3MovieLookupTmdbList = (query?: { tmdbId?: number }, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/movie/lookup/tmdb`,
      method: 'GET',
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags MovieLookup
   * @name V3MovieLookupImdbList
   * @request GET:/api/v3/movie/lookup/imdb
   * @secure
   */
  v3MovieLookupImdbList = (query?: { imdbId?: string }, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/movie/lookup/imdb`,
      method: 'GET',
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags MovieLookup
   * @name V3MovieLookupList
   * @request GET:/api/v3/movie/lookup
   * @secure
   */
  v3MovieLookupList = (query?: { term?: string }, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/movie/lookup`,
      method: 'GET',
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags MovieLookup
   * @name V3MovieLookupDetail
   * @request GET:/api/v3/movie/lookup/{id}
   * @secure
   */
  v3MovieLookupDetail = (id: number, params: RequestParams = {}) =>
    this.request<MovieResource, any>({
      path: `/api/v3/movie/lookup/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags NamingConfig
   * @name V3ConfigNamingList
   * @request GET:/api/v3/config/naming
   * @secure
   */
  v3ConfigNamingList = (params: RequestParams = {}) =>
    this.request<NamingConfigResource, any>({
      path: `/api/v3/config/naming`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags NamingConfig
   * @name V3ConfigNamingUpdate
   * @request PUT:/api/v3/config/naming/{id}
   * @secure
   */
  v3ConfigNamingUpdate = (id: string, data: NamingConfigResource, params: RequestParams = {}) =>
    this.request<NamingConfigResource, any>({
      path: `/api/v3/config/naming/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags NamingConfig
   * @name V3ConfigNamingDetail
   * @request GET:/api/v3/config/naming/{id}
   * @secure
   */
  v3ConfigNamingDetail = (id: number, params: RequestParams = {}) =>
    this.request<NamingConfigResource, any>({
      path: `/api/v3/config/naming/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags NamingConfig
   * @name V3ConfigNamingExamplesList
   * @request GET:/api/v3/config/naming/examples
   * @secure
   */
  v3ConfigNamingExamplesList = (
    query?: {
      RenameMovies?: boolean;
      ReplaceIllegalCharacters?: boolean;
      ColonReplacementFormat?: ColonReplacementFormat;
      StandardMovieFormat?: string;
      MovieFolderFormat?: string;
      IncludeQuality?: boolean;
      ReplaceSpaces?: boolean;
      Separator?: string;
      NumberStyle?: string;
      Id?: number;
      ResourceName?: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, any>({
      path: `/api/v3/config/naming/examples`,
      method: 'GET',
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Notification
   * @name V3NotificationList
   * @request GET:/api/v3/notification
   * @secure
   */
  v3NotificationList = (params: RequestParams = {}) =>
    this.request<NotificationResource[], any>({
      path: `/api/v3/notification`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Notification
   * @name V3NotificationCreate
   * @request POST:/api/v3/notification
   * @secure
   */
  v3NotificationCreate = (data: NotificationResource, params: RequestParams = {}) =>
    this.request<NotificationResource, any>({
      path: `/api/v3/notification`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Notification
   * @name V3NotificationUpdate
   * @request PUT:/api/v3/notification/{id}
   * @secure
   */
  v3NotificationUpdate = (id: string, data: NotificationResource, params: RequestParams = {}) =>
    this.request<NotificationResource, any>({
      path: `/api/v3/notification/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Notification
   * @name V3NotificationDelete
   * @request DELETE:/api/v3/notification/{id}
   * @secure
   */
  v3NotificationDelete = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/notification/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Notification
   * @name V3NotificationDetail
   * @request GET:/api/v3/notification/{id}
   * @secure
   */
  v3NotificationDetail = (id: number, params: RequestParams = {}) =>
    this.request<NotificationResource, any>({
      path: `/api/v3/notification/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Notification
   * @name V3NotificationSchemaList
   * @request GET:/api/v3/notification/schema
   * @secure
   */
  v3NotificationSchemaList = (params: RequestParams = {}) =>
    this.request<NotificationResource[], any>({
      path: `/api/v3/notification/schema`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Notification
   * @name V3NotificationTestCreate
   * @request POST:/api/v3/notification/test
   * @secure
   */
  v3NotificationTestCreate = (data: NotificationResource, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/notification/test`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Notification
   * @name V3NotificationTestallCreate
   * @request POST:/api/v3/notification/testall
   * @secure
   */
  v3NotificationTestallCreate = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/notification/testall`,
      method: 'POST',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Notification
   * @name V3NotificationActionCreate
   * @request POST:/api/v3/notification/action/{name}
   * @secure
   */
  v3NotificationActionCreate = (
    name: string,
    data: NotificationResource,
    params: RequestParams = {}
  ) =>
    this.request<void, any>({
      path: `/api/v3/notification/action/${name}`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Parse
   * @name V3ParseList
   * @request GET:/api/v3/parse
   * @secure
   */
  v3ParseList = (query?: { title?: string }, params: RequestParams = {}) =>
    this.request<ParseResource, any>({
      path: `/api/v3/parse`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags QualityDefinition
   * @name V3QualitydefinitionUpdate
   * @request PUT:/api/v3/qualitydefinition/{id}
   * @secure
   */
  v3QualitydefinitionUpdate = (
    id: string,
    data: QualityDefinitionResource,
    params: RequestParams = {}
  ) =>
    this.request<QualityDefinitionResource, any>({
      path: `/api/v3/qualitydefinition/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags QualityDefinition
   * @name V3QualitydefinitionDetail
   * @request GET:/api/v3/qualitydefinition/{id}
   * @secure
   */
  v3QualitydefinitionDetail = (id: number, params: RequestParams = {}) =>
    this.request<QualityDefinitionResource, any>({
      path: `/api/v3/qualitydefinition/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags QualityDefinition
   * @name V3QualitydefinitionList
   * @request GET:/api/v3/qualitydefinition
   * @secure
   */
  v3QualitydefinitionList = (params: RequestParams = {}) =>
    this.request<QualityDefinitionResource[], any>({
      path: `/api/v3/qualitydefinition`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags QualityDefinition
   * @name V3QualitydefinitionUpdateUpdate
   * @request PUT:/api/v3/qualitydefinition/update
   * @secure
   */
  v3QualitydefinitionUpdateUpdate = (
    data: QualityDefinitionResource[],
    params: RequestParams = {}
  ) =>
    this.request<void, any>({
      path: `/api/v3/qualitydefinition/update`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags QualityProfile
   * @name V3QualityprofileCreate
   * @request POST:/api/v3/qualityprofile
   * @secure
   */
  v3QualityprofileCreate = (data: QualityProfileResource, params: RequestParams = {}) =>
    this.request<QualityProfileResource, any>({
      path: `/api/v3/qualityprofile`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags QualityProfile
   * @name V3QualityprofileList
   * @request GET:/api/v3/qualityprofile
   * @secure
   */
  v3QualityprofileList = (params: RequestParams = {}) =>
    this.request<QualityProfileResource[], any>({
      path: `/api/v3/qualityprofile`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags QualityProfile
   * @name V3QualityprofileDelete
   * @request DELETE:/api/v3/qualityprofile/{id}
   * @secure
   */
  v3QualityprofileDelete = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/qualityprofile/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags QualityProfile
   * @name V3QualityprofileUpdate
   * @request PUT:/api/v3/qualityprofile/{id}
   * @secure
   */
  v3QualityprofileUpdate = (id: string, data: QualityProfileResource, params: RequestParams = {}) =>
    this.request<QualityProfileResource, any>({
      path: `/api/v3/qualityprofile/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags QualityProfile
   * @name V3QualityprofileDetail
   * @request GET:/api/v3/qualityprofile/{id}
   * @secure
   */
  v3QualityprofileDetail = (id: number, params: RequestParams = {}) =>
    this.request<QualityProfileResource, any>({
      path: `/api/v3/qualityprofile/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags QualityProfileSchema
   * @name V3QualityprofileSchemaList
   * @request GET:/api/v3/qualityprofile/schema
   * @secure
   */
  v3QualityprofileSchemaList = (params: RequestParams = {}) =>
    this.request<QualityProfileResource, any>({
      path: `/api/v3/qualityprofile/schema`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Queue
   * @name V3QueueDelete
   * @request DELETE:/api/v3/queue/{id}
   * @secure
   */
  v3QueueDelete = (
    id: number,
    query?: { removeFromClient?: boolean; blocklist?: boolean },
    params: RequestParams = {}
  ) =>
    this.request<void, any>({
      path: `/api/v3/queue/${id}`,
      method: 'DELETE',
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Queue
   * @name V3QueueDetail
   * @request GET:/api/v3/queue/{id}
   * @secure
   */
  v3QueueDetail = (id: number, params: RequestParams = {}) =>
    this.request<QueueResource, any>({
      path: `/api/v3/queue/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Queue
   * @name V3QueueBulkDelete
   * @request DELETE:/api/v3/queue/bulk
   * @secure
   */
  v3QueueBulkDelete = (
    data: QueueBulkResource,
    query?: { removeFromClient?: boolean; blocklist?: boolean },
    params: RequestParams = {}
  ) =>
    this.request<void, any>({
      path: `/api/v3/queue/bulk`,
      method: 'DELETE',
      query: query,
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Queue
   * @name V3QueueList
   * @request GET:/api/v3/queue
   * @secure
   */
  v3QueueList = (
    query?: { includeUnknownMovieItems?: boolean; includeMovie?: boolean },
    params: RequestParams = {}
  ) =>
    this.request<QueueResourcePagingResource, any>({
      path: `/api/v3/queue`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags QueueAction
   * @name V3QueueGrabCreate
   * @request POST:/api/v3/queue/grab/{id}
   * @secure
   */
  v3QueueGrabCreate = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/queue/grab/${id}`,
      method: 'POST',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags QueueAction
   * @name V3QueueGrabBulkCreate
   * @request POST:/api/v3/queue/grab/bulk
   * @secure
   */
  v3QueueGrabBulkCreate = (data: QueueBulkResource, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/queue/grab/bulk`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags QueueDetails
   * @name V3QueueDetailsList
   * @request GET:/api/v3/queue/details
   * @secure
   */
  v3QueueDetailsList = (
    query?: { movieId?: number; includeMovie?: boolean },
    params: RequestParams = {}
  ) =>
    this.request<QueueResource[], any>({
      path: `/api/v3/queue/details`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags QueueDetails
   * @name V3QueueDetailsDetail
   * @request GET:/api/v3/queue/details/{id}
   * @secure
   */
  v3QueueDetailsDetail = (id: number, params: RequestParams = {}) =>
    this.request<QueueResource, any>({
      path: `/api/v3/queue/details/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags QueueStatus
   * @name V3QueueStatusList
   * @request GET:/api/v3/queue/status
   * @secure
   */
  v3QueueStatusList = (params: RequestParams = {}) =>
    this.request<QueueStatusResource, any>({
      path: `/api/v3/queue/status`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags QueueStatus
   * @name V3QueueStatusDetail
   * @request GET:/api/v3/queue/status/{id}
   * @secure
   */
  v3QueueStatusDetail = (id: number, params: RequestParams = {}) =>
    this.request<QueueStatusResource, any>({
      path: `/api/v3/queue/status/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Release
   * @name V3ReleaseCreate
   * @request POST:/api/v3/release
   * @secure
   */
  v3ReleaseCreate = (data: ReleaseResource, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/release`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Release
   * @name V3ReleaseList
   * @request GET:/api/v3/release
   * @secure
   */
  v3ReleaseList = (query?: { movieId?: number }, params: RequestParams = {}) =>
    this.request<ReleaseResource[], any>({
      path: `/api/v3/release`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Release
   * @name V3ReleaseDetail
   * @request GET:/api/v3/release/{id}
   * @secure
   */
  v3ReleaseDetail = (id: number, params: RequestParams = {}) =>
    this.request<ReleaseResource, any>({
      path: `/api/v3/release/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags ReleasePush
   * @name V3ReleasePushCreate
   * @request POST:/api/v3/release/push
   * @secure
   */
  v3ReleasePushCreate = (data: ReleaseResource, params: RequestParams = {}) =>
    this.request<ReleaseResource[], any>({
      path: `/api/v3/release/push`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags ReleasePush
   * @name V3ReleasePushDetail
   * @request GET:/api/v3/release/push/{id}
   * @secure
   */
  v3ReleasePushDetail = (id: number, params: RequestParams = {}) =>
    this.request<ReleaseResource, any>({
      path: `/api/v3/release/push/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags RemotePathMapping
   * @name V3RemotepathmappingCreate
   * @request POST:/api/v3/remotepathmapping
   * @secure
   */
  v3RemotepathmappingCreate = (data: RemotePathMappingResource, params: RequestParams = {}) =>
    this.request<RemotePathMappingResource, any>({
      path: `/api/v3/remotepathmapping`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags RemotePathMapping
   * @name V3RemotepathmappingList
   * @request GET:/api/v3/remotepathmapping
   * @secure
   */
  v3RemotepathmappingList = (params: RequestParams = {}) =>
    this.request<RemotePathMappingResource[], any>({
      path: `/api/v3/remotepathmapping`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags RemotePathMapping
   * @name V3RemotepathmappingDelete
   * @request DELETE:/api/v3/remotepathmapping/{id}
   * @secure
   */
  v3RemotepathmappingDelete = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/remotepathmapping/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags RemotePathMapping
   * @name V3RemotepathmappingUpdate
   * @request PUT:/api/v3/remotepathmapping/{id}
   * @secure
   */
  v3RemotepathmappingUpdate = (
    id: string,
    data: RemotePathMappingResource,
    params: RequestParams = {}
  ) =>
    this.request<RemotePathMappingResource, any>({
      path: `/api/v3/remotepathmapping/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags RemotePathMapping
   * @name V3RemotepathmappingDetail
   * @request GET:/api/v3/remotepathmapping/{id}
   * @secure
   */
  v3RemotepathmappingDetail = (id: number, params: RequestParams = {}) =>
    this.request<RemotePathMappingResource, any>({
      path: `/api/v3/remotepathmapping/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags RenameMovie
   * @name V3RenameList
   * @request GET:/api/v3/rename
   * @secure
   */
  v3RenameList = (query?: { movieId?: number }, params: RequestParams = {}) =>
    this.request<RenameMovieResource[], any>({
      path: `/api/v3/rename`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Restriction
   * @name V3RestrictionList
   * @request GET:/api/v3/restriction
   * @secure
   */
  v3RestrictionList = (params: RequestParams = {}) =>
    this.request<RestrictionResource[], any>({
      path: `/api/v3/restriction`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Restriction
   * @name V3RestrictionCreate
   * @request POST:/api/v3/restriction
   * @secure
   */
  v3RestrictionCreate = (data: RestrictionResource, params: RequestParams = {}) =>
    this.request<RestrictionResource, any>({
      path: `/api/v3/restriction`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Restriction
   * @name V3RestrictionUpdate
   * @request PUT:/api/v3/restriction/{id}
   * @secure
   */
  v3RestrictionUpdate = (id: string, data: RestrictionResource, params: RequestParams = {}) =>
    this.request<RestrictionResource, any>({
      path: `/api/v3/restriction/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Restriction
   * @name V3RestrictionDelete
   * @request DELETE:/api/v3/restriction/{id}
   * @secure
   */
  v3RestrictionDelete = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/restriction/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Restriction
   * @name V3RestrictionDetail
   * @request GET:/api/v3/restriction/{id}
   * @secure
   */
  v3RestrictionDetail = (id: number, params: RequestParams = {}) =>
    this.request<RestrictionResource, any>({
      path: `/api/v3/restriction/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags RootFolder
   * @name V3RootfolderCreate
   * @request POST:/api/v3/rootfolder
   * @secure
   */
  v3RootfolderCreate = (data: RootFolderResource, params: RequestParams = {}) =>
    this.request<RootFolderResource, any>({
      path: `/api/v3/rootfolder`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags RootFolder
   * @name V3RootfolderList
   * @request GET:/api/v3/rootfolder
   * @secure
   */
  v3RootfolderList = (params: RequestParams = {}) =>
    this.request<RootFolderResource[], any>({
      path: `/api/v3/rootfolder`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags RootFolder
   * @name V3RootfolderDelete
   * @request DELETE:/api/v3/rootfolder/{id}
   * @secure
   */
  v3RootfolderDelete = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/rootfolder/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags RootFolder
   * @name V3RootfolderDetail
   * @request GET:/api/v3/rootfolder/{id}
   * @secure
   */
  v3RootfolderDetail = (id: number, params: RequestParams = {}) =>
    this.request<RootFolderResource, any>({
      path: `/api/v3/rootfolder/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags System
   * @name V3SystemStatusList
   * @request GET:/api/v3/system/status
   * @secure
   */
  v3SystemStatusList = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/system/status`,
      method: 'GET',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags System
   * @name V3SystemRoutesList
   * @request GET:/api/v3/system/routes
   * @secure
   */
  v3SystemRoutesList = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/system/routes`,
      method: 'GET',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags System
   * @name V3SystemRoutesDuplicateList
   * @request GET:/api/v3/system/routes/duplicate
   * @secure
   */
  v3SystemRoutesDuplicateList = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/system/routes/duplicate`,
      method: 'GET',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags System
   * @name V3SystemShutdownCreate
   * @request POST:/api/v3/system/shutdown
   * @secure
   */
  v3SystemShutdownCreate = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/system/shutdown`,
      method: 'POST',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags System
   * @name V3SystemRestartCreate
   * @request POST:/api/v3/system/restart
   * @secure
   */
  v3SystemRestartCreate = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/system/restart`,
      method: 'POST',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name V3TagList
   * @request GET:/api/v3/tag
   * @secure
   */
  v3TagList = (params: RequestParams = {}) =>
    this.request<TagResource[], any>({
      path: `/api/v3/tag`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name V3TagCreate
   * @request POST:/api/v3/tag
   * @secure
   */
  v3TagCreate = (data: TagResource, params: RequestParams = {}) =>
    this.request<TagResource, any>({
      path: `/api/v3/tag`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name V3TagUpdate
   * @request PUT:/api/v3/tag/{id}
   * @secure
   */
  v3TagUpdate = (id: string, data: TagResource, params: RequestParams = {}) =>
    this.request<TagResource, any>({
      path: `/api/v3/tag/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name V3TagDelete
   * @request DELETE:/api/v3/tag/{id}
   * @secure
   */
  v3TagDelete = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/tag/${id}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Tag
   * @name V3TagDetail
   * @request GET:/api/v3/tag/{id}
   * @secure
   */
  v3TagDetail = (id: number, params: RequestParams = {}) =>
    this.request<TagResource, any>({
      path: `/api/v3/tag/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags TagDetails
   * @name V3TagDetailList
   * @request GET:/api/v3/tag/detail
   * @secure
   */
  v3TagDetailList = (params: RequestParams = {}) =>
    this.request<TagDetailsResource[], any>({
      path: `/api/v3/tag/detail`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags TagDetails
   * @name V3TagDetailDetail
   * @request GET:/api/v3/tag/detail/{id}
   * @secure
   */
  v3TagDetailDetail = (id: number, params: RequestParams = {}) =>
    this.request<TagDetailsResource, any>({
      path: `/api/v3/tag/detail/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Task
   * @name V3SystemTaskList
   * @request GET:/api/v3/system/task
   * @secure
   */
  v3SystemTaskList = (params: RequestParams = {}) =>
    this.request<TaskResource[], any>({
      path: `/api/v3/system/task`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Task
   * @name V3SystemTaskDetail
   * @request GET:/api/v3/system/task/{id}
   * @secure
   */
  v3SystemTaskDetail = (id: number, params: RequestParams = {}) =>
    this.request<TaskResource, any>({
      path: `/api/v3/system/task/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags UiConfig
   * @name V3ConfigUiList
   * @request GET:/api/v3/config/ui
   * @secure
   */
  v3ConfigUiList = (params: RequestParams = {}) =>
    this.request<UiConfigResource, any>({
      path: `/api/v3/config/ui`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags UiConfig
   * @name V3ConfigUiUpdate
   * @request PUT:/api/v3/config/ui/{id}
   * @secure
   */
  v3ConfigUiUpdate = (id: string, data: UiConfigResource, params: RequestParams = {}) =>
    this.request<UiConfigResource, any>({
      path: `/api/v3/config/ui/${id}`,
      method: 'PUT',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags UiConfig
   * @name V3ConfigUiDetail
   * @request GET:/api/v3/config/ui/{id}
   * @secure
   */
  v3ConfigUiDetail = (id: number, params: RequestParams = {}) =>
    this.request<UiConfigResource, any>({
      path: `/api/v3/config/ui/${id}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Update
   * @name V3UpdateList
   * @request GET:/api/v3/update
   * @secure
   */
  v3UpdateList = (params: RequestParams = {}) =>
    this.request<UpdateResource[], any>({
      path: `/api/v3/update`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags UpdateLogFile
   * @name V3LogFileUpdateList
   * @request GET:/api/v3/log/file/update
   * @secure
   */
  v3LogFileUpdateList = (params: RequestParams = {}) =>
    this.request<LogFileResource[], any>({
      path: `/api/v3/log/file/update`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags UpdateLogFile
   * @name V3LogFileUpdateDetail
   * @request GET:/api/v3/log/file/update/{filename}
   * @secure
   */
  v3LogFileUpdateDetail = (filename: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/api/v3/log/file/update/${filename}`,
      method: 'GET',
      secure: true,
      ...params,
    });
}
