/**
 * This is the client-side entrypoint for your tRPC API. It is used to create the `api` object which
 * contains the Next.js App-wrapper, as well as your type-safe React Query hooks.
 *
 * We also create a few inference helpers for input and output types.
 */
import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
import superjson from 'superjson';
import { env } from '~/env';
import { type RootRouter } from '~/server/api/root';
import { queryClient } from '~/tools/server/configurations/tanstack/queryClient.tool';

const getTrpcConfiguration = () => ({
  /**
   * Transformer used for data de-serialization from the server.
   *
   * @see https://trpc.io/docs/data-transformers
   */
  transformer: superjson,

  /**
   * Links used to determine request flow from client to server.
   *
   * @see https://trpc.io/docs/links
   */
  links: [
    loggerLink({
      enabled: (opts) =>
        env.NEXT_PUBLIC_NODE_ENV === 'development' ||
        (opts.direction === 'down' && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      maxURLLength: 2000,
    }),
  ],
  queryClient,
});

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // browser should use relative url
  if (env.HOSTNAME) {
    return `http://${env.HOSTNAME}:${env.NEXT_PUBLIC_PORT}`;
  }
  return `http://localhost:${env.NEXT_PUBLIC_PORT ?? 3000}`; // dev SSR should use localhost
};

/** A set of type-safe react-query hooks for your tRPC API. */
export const api = createTRPCNext<RootRouter>({
  config() {
    return getTrpcConfiguration();
  },
  /**
   * Whether tRPC should await queries when server rendering pages.
   *
   * @see https://trpc.io/docs/nextjs#ssr-boolean-default-false
   */
  ssr: false,
});

export const client = createTRPCProxyClient<RootRouter>(getTrpcConfiguration());

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<RootRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<RootRouter>;

/**
 * A tRPC client that can be used without hooks.
 */
export const trcpProxyClient = createTRPCProxyClient<RootRouter>(getTrpcConfiguration());
