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

import { ContentType, HttpClient, RequestParams } from './http-client';

export class RadarrApi<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Authentication
   * @name LoginCreate
   * @request POST:/login
   * @secure
   */
  loginCreate = (
    data: { Username?: string; Password?: string; RememberMe?: string },
    query?: { returnUrl?: string },
    params: RequestParams = {}
  ) =>
    this.request<void, any>({
      path: `/login`,
      method: 'POST',
      query: query,
      body: data,
      secure: true,
      type: ContentType.FormData,
      ...params,
    });
  /**
   * No description
   *
   * @tags StaticResource
   * @name LoginList
   * @request GET:/login
   * @secure
   */
  loginList = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/login`,
      method: 'GET',
      secure: true,
      ...params,
    });
}
