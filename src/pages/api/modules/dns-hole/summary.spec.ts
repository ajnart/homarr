import Consola from 'consola';
import { describe, it, vi, expect } from 'vitest';
import { createMocks } from 'node-mocks-http';

import GetSummary from './summary';
import { ConfigType } from '../../../../types/config';

const mockedGetConfig = vi.fn();

describe('DNS hole', () => {
  it('combine and return aggregated data', async () => {
    // arrange
    const { req, res } = createMocks({
      method: 'GET',
    });

    vi.mock('./../../../../tools/config/getConfig.ts', () => ({
      get getConfig() {
        return mockedGetConfig;
      },
    }));

    mockedGetConfig.mockReturnValue({
      apps: [
        {
          url: 'http://pi.hole',
          integration: {
            type: 'pihole',
            properties: [
              {
                field: 'password',
                type: 'private',
                value: 'hf3829fj238g8',
              },
            ],
          },
        },
      ],
    } as ConfigType);
    const errorLogSpy = vi.spyOn(Consola, 'error');
    const warningLogSpy = vi.spyOn(Consola, 'warn');

    fetchMock.mockResponse((request) => {
      if (request.url === 'http://pi.hole/admin/api.php?summaryRaw&auth=hf3829fj238g8') {
        return JSON.stringify({
          domains_being_blocked: 780348,
          dns_queries_today: 36910,
          ads_blocked_today: 9700,
          ads_percentage_today: 26.280142,
          unique_domains: 6217,
          queries_forwarded: 12943,
          queries_cached: 13573,
          clients_ever_seen: 20,
          unique_clients: 17,
          dns_queries_all_types: 36910,
          reply_UNKNOWN: 947,
          reply_NODATA: 3313,
          reply_NXDOMAIN: 1244,
          reply_CNAME: 5265,
          reply_IP: 25635,
          reply_DOMAIN: 97,
          reply_RRNAME: 4,
          reply_SERVFAIL: 28,
          reply_REFUSED: 0,
          reply_NOTIMP: 0,
          reply_OTHER: 0,
          reply_DNSSEC: 0,
          reply_NONE: 0,
          reply_BLOB: 377,
          dns_queries_all_replies: 36910,
          privacy_level: 0,
          status: 'enabled',
          gravity_last_updated: {
            file_exists: true,
            absolute: 1682216493,
            relative: {
              days: 5,
              hours: 17,
              minutes: 52,
            },
          },
        });
      }

      return Promise.reject(new Error(`Bad url: ${request.url}`));
    });

    // Act
    await GetSummary(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(200);
    expect(res.finished).toBe(true);
    expect(JSON.parse(res._getData())).toEqual({
      adsBlockedToday: 9700,
      adsBlockedTodayPercentage: 0.26280140883229475,
      dnsQueriesToday: 36910,
      domainsBeingBlocked: 780348,
      status: [
        {
          status: 'enabled',
        },
      ],
    });

    expect(errorLogSpy).not.toHaveBeenCalled();
    expect(warningLogSpy).not.toHaveBeenCalled();

    errorLogSpy.mockRestore();
  });

  it('combine and return aggregated data when multiple instances', async () => {
    // arrange
    const { req, res } = createMocks({
      method: 'GET',
    });

    vi.mock('./../../../../tools/config/getConfig.ts', () => ({
      get getConfig() {
        return mockedGetConfig;
      },
    }));

    mockedGetConfig.mockReturnValue({
      apps: [
        {
          id: 'app1',
          url: 'http://pi.hole',
          integration: {
            type: 'pihole',
            properties: [
              {
                field: 'password',
                type: 'private',
                value: 'hf3829fj238g8',
              },
            ],
          },
        },
        {
          id: 'app2',
          url: 'http://pi2.hole',
          integration: {
            type: 'pihole',
            properties: [
              {
                field: 'password',
                type: 'private',
                value: 'ayaka',
              },
            ],
          },
        },
      ],
    } as ConfigType);
    const errorLogSpy = vi.spyOn(Consola, 'error');
    const warningLogSpy = vi.spyOn(Consola, 'warn');

    fetchMock.mockResponse((request) => {
      if (request.url === 'http://pi.hole/admin/api.php?summaryRaw&auth=hf3829fj238g8') {
        return JSON.stringify({
          domains_being_blocked: 3,
          dns_queries_today: 8,
          ads_blocked_today: 5,
          ads_percentage_today: 26,
          unique_domains: 4,
          queries_forwarded: 2,
          queries_cached: 2,
          clients_ever_seen: 2,
          unique_clients: 3,
          dns_queries_all_types: 3,
          reply_UNKNOWN: 2,
          reply_NODATA: 3,
          reply_NXDOMAIN: 5,
          reply_CNAME: 6,
          reply_IP: 5,
          reply_DOMAIN: 3,
          reply_RRNAME: 2,
          reply_SERVFAIL: 2,
          reply_REFUSED: 0,
          reply_NOTIMP: 0,
          reply_OTHER: 0,
          reply_DNSSEC: 0,
          reply_NONE: 0,
          reply_BLOB: 1,
          dns_queries_all_replies: 36910,
          privacy_level: 0,
          status: 'enabled',
          gravity_last_updated: {
            file_exists: true,
            absolute: 1682216493,
            relative: {
              days: 5,
              hours: 17,
              minutes: 52,
            },
          },
        });
      }

      if (request.url === 'http://pi2.hole/admin/api.php?summaryRaw&auth=ayaka') {
        return JSON.stringify({
          domains_being_blocked: 1,
          dns_queries_today: 3,
          ads_blocked_today: 2,
          ads_percentage_today: 47,
          unique_domains: 4,
          queries_forwarded: 4,
          queries_cached: 2,
          clients_ever_seen: 2,
          unique_clients: 2,
          dns_queries_all_types: 1,
          reply_UNKNOWN: 3,
          reply_NODATA: 2,
          reply_NXDOMAIN: 1,
          reply_CNAME: 3,
          reply_IP: 2,
          reply_DOMAIN: 97,
          reply_RRNAME: 4,
          reply_SERVFAIL: 28,
          reply_REFUSED: 0,
          reply_NOTIMP: 0,
          reply_OTHER: 0,
          reply_DNSSEC: 0,
          reply_NONE: 0,
          reply_BLOB: 2,
          dns_queries_all_replies: 4,
          privacy_level: 0,
          status: 'disabled',
          gravity_last_updated: {
            file_exists: true,
            absolute: 1682216493,
            relative: {
              days: 5,
              hours: 17,
              minutes: 52,
            },
          },
        });
      }

      return Promise.reject(new Error(`Bad url: ${request.url}`));
    });

    // Act
    await GetSummary(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(200);
    expect(res.finished).toBe(true);
    expect(JSON.parse(res._getData())).toStrictEqual({
      adsBlockedToday: 7,
      adsBlockedTodayPercentage: 0.6363636363636364,
      dnsQueriesToday: 11,
      domainsBeingBlocked: 4,
      status: [
        {
          appId: 'app1',
          status: 'enabled',
        },
        {
          appId: 'app2',
          status: 'disabled',
        },
      ],
    });

    expect(errorLogSpy).not.toHaveBeenCalled();
    expect(warningLogSpy).not.toHaveBeenCalled();

    errorLogSpy.mockRestore();
  });
});
