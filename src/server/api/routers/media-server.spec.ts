import { describe, it } from "vitest";

import { createInnerTRPCContext } from "../trpc";

import { appRouter } from "./app";
import { mediaRequestsRouter } from "./media-request";
import { mediaServerRouter } from "./media-server";

describe('media server', () => {
  it('', async () => {
    // arrange
    const ctx = await createInnerTRPCContext({
      session: null,
      cookies: {}
    });
    const caller = mediaServerRouter.createCaller(ctx);

    // act
    const test = await caller.all({
      configName: 'my-configuration'
    });

    // assert
    expect(test).not.toBe(undefined);
    expect(test).toBe({});
  });
});