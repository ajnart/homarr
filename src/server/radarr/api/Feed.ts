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

import { HttpClient, RequestParams } from './http-client';

export class RadarrApi<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags CalendarFeed
   * @name V3CalendarRadarrIcsList
   * @request GET:/feed/v3/calendar/radarr.ics
   * @secure
   */
  v3CalendarRadarrIcsList = (
    query?: { pastDays?: number; futureDays?: number; tagList?: string; unmonitored?: boolean },
    params: RequestParams = {}
  ) =>
    this.request<void, any>({
      path: `/feed/v3/calendar/radarr.ics`,
      method: 'GET',
      query: query,
      secure: true,
      ...params,
    });
}
