"use client";

import { createTRPCClient, httpLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import SuperJSON from "superjson";

import type { AppRouter } from ".";
import { createHeadersCallbackForSource, getTrpcUrl } from "./shared";

export const clientApi = createTRPCReact<AppRouter>();
export const fetchApi = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: getTrpcUrl(),
      transformer: SuperJSON,
      headers: createHeadersCallbackForSource("fetch"),
    }),
  ],
});
