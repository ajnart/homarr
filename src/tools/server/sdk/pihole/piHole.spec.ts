import Consola from 'consola';
import { describe, expect, it, vi } from 'vitest';

import { PiHoleClient } from './piHole';

describe('PiHole API client', () => {
  it('summary - throw exception when response status code is not 200', async () => {
    // arrange
    const errorLogSpy = vi.spyOn(Consola, 'error');
    const warningLogSpy = vi.spyOn(Consola, 'warn');

    fetchMock.mockResponse((request) => {
      if (request.url === 'http://pi.hole/admin/api.php?summaryRaw&auth=nice') {
        return {
          status: 404,
        };
      }

      return Promise.reject(new Error(`Bad url: ${request.url}`));
    });

    const client = new PiHoleClient('http://pi.hole', 'nice');

    // Act && Assert
    await expect(() => client.getSummary()).rejects.toThrowErrorMatchingInlineSnapshot(
      '"Status code does not indicate success: 404"'
    );

    expect(errorLogSpy).not.toHaveBeenCalled();
    expect(warningLogSpy).not.toHaveBeenCalledOnce();

    errorLogSpy.mockRestore();
  });

  it('summary -throw exception when response is empty', async () => {
    // arrange
    const errorLogSpy = vi.spyOn(Consola, 'error');
    const warningLogSpy = vi.spyOn(Consola, 'warn');

    fetchMock.mockResponse((request) => {
      if (request.url === 'http://pi.hole/admin/api.php?summaryRaw&auth=nice') {
        return JSON.stringify([]);
      }

      return Promise.reject(new Error(`Bad url: ${request.url}`));
    });

    const client = new PiHoleClient('http://pi.hole', 'nice');

    // Act && Assert
    await expect(() => client.getSummary()).rejects.toThrowErrorMatchingInlineSnapshot(
      '"Response does not indicate success. Authentication is most likely invalid: "'
    );

    expect(errorLogSpy).not.toHaveBeenCalled();
    expect(warningLogSpy).not.toHaveBeenCalledOnce();

    errorLogSpy.mockRestore();
  });

  it('summary -fetch and return object when success', async () => {
    // arrange
    const errorLogSpy = vi.spyOn(Consola, 'error');
    const warningLogSpy = vi.spyOn(Consola, 'warn');

    fetchMock.mockResponse((request) => {
      if (request.url === 'http://pi.hole/admin/api.php?summaryRaw&auth=nice') {
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

    const client = new PiHoleClient('http://pi.hole', 'nice');

    // Act
    const summary = await client.getSummary();

    // Assert
    expect(summary).toStrictEqual({
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
        relative: { days: 5, hours: 17, minutes: 52 },
      },
    });

    expect(errorLogSpy).not.toHaveBeenCalled();
    expect(warningLogSpy).not.toHaveBeenCalled();

    errorLogSpy.mockRestore();
  });

  it('enable - return true when state change is as expected', async () => {
    // arrange
    const errorLogSpy = vi.spyOn(Consola, 'error');
    const warningLogSpy = vi.spyOn(Consola, 'warn');

    let calledCount = 0;
    let countTriedRequests = 0;

    fetchMock.mockResponse((request) => {
      if (request.url === 'http://pi.hole/admin/api.php?enable&auth=nice') {
        calledCount += 1;
        return JSON.stringify({
          status: 'enabled',
        });
      }

      if (request.url === 'http://pi.hole/admin/api.php?summaryRaw&auth=nice') {
        countTriedRequests += 1;
        return JSON.stringify({
          status: 'enabled',
        });
      }

      return Promise.reject(new Error(`Bad url: ${request.url}`));
    });

    const client = new PiHoleClient('http://pi.hole', 'nice');

    // Act
    const summary = await client.enable();

    // Assert
    expect(summary).toBe(true);
    expect(calledCount).toBe(1);
    expect(countTriedRequests).toBe(1);

    expect(errorLogSpy).not.toHaveBeenCalled();
    expect(warningLogSpy).not.toHaveBeenCalled();

    errorLogSpy.mockRestore();
  });

  it('enable - return true when state change is as expected after 10 retries', async () => {
    // arrange
    const errorLogSpy = vi.spyOn(Consola, 'error');
    const warningLogSpy = vi.spyOn(Consola, 'warn');

    let calledCount = 0;
    let countTriedRequests = 0;

    fetchMock.mockResponse((request) => {
      if (request.url === 'http://pi.hole/admin/api.php?enable&auth=nice') {
        calledCount += 1;
        return JSON.stringify({
          status: 'disabled',
        });
      }

      if (request.url === 'http://pi.hole/admin/api.php?summaryRaw&auth=nice') {
        countTriedRequests += 1;
        if (countTriedRequests < 10) {
          return JSON.stringify({
            status: 'disabled',
          });
        }

        return JSON.stringify({
          status: 'enabled',
        });
      }

      return Promise.reject(new Error(`Bad url: ${request.url}`));
    });

    const client = new PiHoleClient('http://pi.hole', 'nice');

    // Act
    const summary = await client.enable();

    // Assert
    expect(summary).toBe(true);
    expect(calledCount).toBe(1);
    expect(countTriedRequests).toBe(10);

    expect(errorLogSpy).not.toHaveBeenCalled();
    expect(warningLogSpy).not.toHaveBeenCalled();

    errorLogSpy.mockRestore();
  });

  it('disable - return true when state change is as expected', async () => {
    // arrange
    const errorLogSpy = vi.spyOn(Consola, 'error');
    const warningLogSpy = vi.spyOn(Consola, 'warn');

    let calledCount = 0;
    let countTriedRequests = 0;

    fetchMock.mockResponse((request) => {
      if (request.url === 'http://pi.hole/admin/api.php?disable&auth=nice') {
        calledCount += 1;
        return JSON.stringify({
          status: 'disabled',
        });
      }

      if (request.url === 'http://pi.hole/admin/api.php?summaryRaw&auth=nice') {
        countTriedRequests += 1;
        return JSON.stringify({
          status: 'disabled',
        });
      }

      return Promise.reject(new Error(`Bad url: ${request.url}`));
    });

    const client = new PiHoleClient('http://pi.hole', 'nice');

    // Act
    const summary = await client.disable();

    // Assert
    expect(summary).toBe(true);
    expect(calledCount).toBe(1);
    expect(countTriedRequests).toBe(1);

    expect(errorLogSpy).not.toHaveBeenCalled();
    expect(warningLogSpy).not.toHaveBeenCalled();

    errorLogSpy.mockRestore();
  });

  it('disable - return true when state change is as expected after 10 retries', async () => {
    // arrange
    const errorLogSpy = vi.spyOn(Consola, 'error');
    const warningLogSpy = vi.spyOn(Consola, 'warn');

    let calledCount = 0;
    let countTriedRequests = 0;

    fetchMock.mockResponse((request) => {
      if (request.url === 'http://pi.hole/admin/api.php?disable&auth=nice') {
        calledCount += 1;
        return JSON.stringify({
          status: 'enabled',
        });
      }

      if (request.url === 'http://pi.hole/admin/api.php?summaryRaw&auth=nice') {
        countTriedRequests += 1;
        if (countTriedRequests < 10) {
          return JSON.stringify({
            status: 'enabled',
          });
        }

        return JSON.stringify({
          status: 'disabled',
        });
      }

      return Promise.reject(new Error(`Bad url: ${request.url}`));
    });

    const client = new PiHoleClient('http://pi.hole', 'nice');

    // Act
    const summary = await client.disable();

    // Assert
    expect(summary).toBe(true);
    expect(calledCount).toBe(1);
    expect(countTriedRequests).toBe(10);

    expect(errorLogSpy).not.toHaveBeenCalled();
    expect(warningLogSpy).not.toHaveBeenCalled();

    errorLogSpy.mockRestore();
  });

  it('enable - throw error when state change is not as expected', async () => {
    // arrange
    const errorLogSpy = vi.spyOn(Consola, 'error');
    const warningLogSpy = vi.spyOn(Consola, 'warn');

    let calledCount = 0;
    let countTriedRequests = 0;

    fetchMock.mockResponse((request) => {
      if (request.url === 'http://pi.hole/admin/api.php?enable&auth=nice') {
        calledCount += 1;
        return JSON.stringify({
          status: 'disabled',
        });
      }

      if (request.url === 'http://pi.hole/admin/api.php?summaryRaw&auth=nice') {
        countTriedRequests += 1;
        return JSON.stringify({
          status: 'disabled',
        });
      }

      return Promise.reject(new Error(`Bad url: ${request.url}`));
    });

    const client = new PiHoleClient('http://pi.hole', 'nice');

    // Act & Assert
    await expect(() => client.enable()).rejects.toThrowErrorMatchingInlineSnapshot(
      '"Although PiHole received the command, it failed to update it\'s status: [object Object]"'
    );

    // Assert
    expect(calledCount).toBe(1);
    expect(countTriedRequests).toBe(10);

    expect(errorLogSpy).not.toHaveBeenCalled();
    expect(warningLogSpy).not.toHaveBeenCalled();

    errorLogSpy.mockRestore();
  });

  it('disable - throw error when state change is not as expected', async () => {
    // arrange
    const errorLogSpy = vi.spyOn(Consola, 'error');
    const warningLogSpy = vi.spyOn(Consola, 'warn');

    let calledCount = 0;
    let countTriedRequests = 0;

    fetchMock.mockResponse((request) => {
      if (request.url === 'http://pi.hole/admin/api.php?disable&auth=nice') {
        calledCount += 1;
        return JSON.stringify({
          status: 'enabled',
        });
      }

      if (request.url === 'http://pi.hole/admin/api.php?summaryRaw&auth=nice') {
        countTriedRequests += 1;
        return JSON.stringify({
          status: 'enabled',
        });
      }

      return Promise.reject(new Error(`Bad url: ${request.url}`));
    });

    const client = new PiHoleClient('http://pi.hole', 'nice');

    // Act & Assert
    await expect(() => client.disable()).rejects.toThrowErrorMatchingInlineSnapshot(
      '"Although PiHole received the command, it failed to update it\'s status: [object Object]"'
    );

    // Assert
    expect(calledCount).toBe(1);
    expect(countTriedRequests).lessThanOrEqual(10);

    expect(errorLogSpy).not.toHaveBeenCalled();
    expect(warningLogSpy).not.toHaveBeenCalled();

    errorLogSpy.mockRestore();
  });

  it('disable - throw error when status code does not indicate success', async () => {
    // arrange
    const errorLogSpy = vi.spyOn(Consola, 'error');
    const warningLogSpy = vi.spyOn(Consola, 'warn');

    let calledCount = 0;

    fetchMock.mockResponse((request) => {
      if (request.url === 'http://pi.hole/admin/api.php?disable&auth=nice') {
        calledCount += 1;
        return {
          status: 404,
        };
      }

      return Promise.reject(new Error(`Bad url: ${request.url}`));
    });

    const client = new PiHoleClient('http://pi.hole', 'nice');

    // Act & Assert
    await expect(() => client.disable()).rejects.toThrowErrorMatchingInlineSnapshot(
      '"Status code does not indicate success: 404"'
    );
    expect(calledCount).toBe(1);

    expect(errorLogSpy).not.toHaveBeenCalled();
    expect(warningLogSpy).not.toHaveBeenCalled();

    errorLogSpy.mockRestore();
  });

  it('disable - throw error when response is empty', async () => {
    // arrange
    const errorLogSpy = vi.spyOn(Consola, 'error');
    const warningLogSpy = vi.spyOn(Consola, 'warn');

    let calledCount = 0;

    fetchMock.mockResponse((request) => {
      if (request.url === 'http://pi.hole/admin/api.php?disable&auth=nice') {
        calledCount += 1;
        return JSON.stringify([]);
      }

      return Promise.reject(new Error(`Bad url: ${request.url}`));
    });

    const client = new PiHoleClient('http://pi.hole', 'nice');

    // Act & Assert
    await expect(() => client.disable()).rejects.toThrowErrorMatchingInlineSnapshot(
      '"Response does not indicate success. Authentication is most likely invalid: "'
    );
    expect(calledCount).toBe(1);

    expect(errorLogSpy).not.toHaveBeenCalled();
    expect(warningLogSpy).not.toHaveBeenCalled();

    errorLogSpy.mockRestore();
  });
});
