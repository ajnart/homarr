import { DnsCacheManager } from "dns-caching";

import { createLogger } from "@homarr/core/infrastructure/logs";

import { dnsEnv } from "./env";

// Add global type augmentation for homarr
declare global {
  var homarr: {
    dnsCacheManager?: DnsCacheManager;
    // add other properties if needed
  };
}

const logger = createLogger({ module: "dns" });

// Initialize global.homarr if not present
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
global.homarr ??= {};
global.homarr.dnsCacheManager ??= new DnsCacheManager({
  cacheMaxEntries: 1000,
  forceMinTtl: 5 * 60 * 1000, // 5 minutes
  logger,
});

if (dnsEnv.ENABLE_DNS_CACHING) {
  global.homarr.dnsCacheManager.initialize();
}
