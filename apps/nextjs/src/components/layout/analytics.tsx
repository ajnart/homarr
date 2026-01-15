import Script from "next/script";

import { UMAMI_WEBSITE_ID } from "@homarr/analytics";
import { db } from "@homarr/db";
import { getServerSettingByKeyAsync } from "@homarr/db/queries";

export const Analytics = async () => {
  // For static pages it will not find any analytics data so we do not include the script on them
  const analytics = await getServerSettingByKeyAsync(db, "analytics").catch(() => null);

  if (analytics?.enableGeneral) {
    return <Script src="https://umami.homarr.dev/script.js" data-website-id={UMAMI_WEBSITE_ID} defer />;
  }

  return <></>;
};
