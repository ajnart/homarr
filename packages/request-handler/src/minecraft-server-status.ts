import dayjs from "dayjs";
import { z } from "zod/v4";

import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";
import { withTimeoutAsync } from "@homarr/core/infrastructure/http/timeout";

import { createCachedWidgetRequestHandler } from "./lib/cached-widget-request-handler";

export const minecraftServerStatusRequestHandler = createCachedWidgetRequestHandler({
  queryKey: "minecraftServerStatusApiResult",
  widgetKind: "minecraftServerStatus",
  async requestAsync(input: { domain: string; isBedrockServer: boolean }) {
    const path = `${input.isBedrockServer ? "/bedrock" : ""}/3/${input.domain}`;

    const response = await withTimeoutAsync(async (signal) =>
      fetchWithTrustedCertificatesAsync(`https://api.mcsrvstat.us${path}`, { signal }),
    );
    return responseSchema.parse(await response.json());
  },
  cacheDuration: dayjs.duration(5, "minutes"),
});

const responseSchema = z
  .object({
    online: z.literal(false),
  })
  .or(
    z.object({
      online: z.literal(true),
      players: z.object({
        online: z.number(),
        max: z.number(),
      }),
      icon: z.string().optional(),
    }),
  );

export type MinecraftServerStatus = z.infer<typeof responseSchema>;
