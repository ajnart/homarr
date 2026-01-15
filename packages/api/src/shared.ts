import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query";

/**
 * Creates a headers callback for a given source
 * It will set the x-trpc-source header and cookies if needed
 * @param source trpc source request comes from
 * @returns headers callback
 */
export function createHeadersCallbackForSource(source: string) {
  return async () => {
    const headers = new Headers();
    headers.set("x-trpc-source", source);

    const cookies = await importCookiesAsync();
    // We need to set cookie for ssr requests (for example with useSuspenseQuery or middleware)
    if (cookies) {
      headers.set("cookie", cookies);
    }

    return headers;
  };
}

/**
 * This is a workarround as cookies are not passed to the server
 * when using useSuspenseQuery or middleware
 * @returns cookie string on server or null on client
 */
async function importCookiesAsync() {
  if (typeof window !== "undefined") {
    return null;
  }

  const { cookies } = await import("next/headers");

  return (await cookies())
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join(";");
}

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  return `http://${process.env.HOSTNAME ?? "localhost"}:3000`;
}

export const trpcPath = "/api/trpc";

/**
 * Creates the full url for the trpc api endpoint
 * @returns
 */
export function getTrpcUrl() {
  return `${getBaseUrl()}${trpcPath}`;
}

export const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
};
