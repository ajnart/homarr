import type { Response as UndiciResponse } from "undici";

// https://stackoverflow.com/questions/46946380/fetch-api-request-timeout
export const withTimeoutAsync = async <TResponse extends Response | UndiciResponse>(
  callback: (signal: AbortSignal) => Promise<TResponse>,
  timeout = 10000,
) => {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => controller.abort(), timeout);

  return await callback(controller.signal).finally(() => {
    clearTimeout(timeoutId);
  });
};

export const fetchWithTimeoutAsync = async (...[url, requestInit]: Parameters<typeof fetch>) => {
  return await withTimeoutAsync((signal) => fetch(url, { ...requestInit, signal }));
};
