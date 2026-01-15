import z from "zod/v4";

import packageJson from "../../../../package.json";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const infoRouter = createTRPCRouter({
  getInfo: protectedProcedure
    .input(z.void())
    .output(z.object({ version: z.string() }))
    .meta({ openapi: { method: "GET", path: "/api/info", tags: ["info"] } })
    .query(() => {
      return {
        version: packageJson.version,
      };
    }),
});
