import { db } from "@homarr/db";
import { getServerSettingByKeyAsync } from "@homarr/db/queries";

export const SearchEngineOptimization = async () => {
  const crawlingAndIndexingSetting = await getServerSettingByKeyAsync(db, "crawlingAndIndexing");

  const robotsAttributes: string[] = [];

  if (crawlingAndIndexingSetting.noIndex) {
    robotsAttributes.push("noindex");
  }

  if (crawlingAndIndexingSetting.noFollow) {
    robotsAttributes.push("nofollow");
  }

  const googleAttributes: string[] = [];

  if (crawlingAndIndexingSetting.noSiteLinksSearchBox) {
    googleAttributes.push("nositelinkssearchbox");
  }

  if (crawlingAndIndexingSetting.noTranslate) {
    googleAttributes.push("notranslate");
  }

  return (
    <>
      <meta name="robots" content={robotsAttributes.join(",")} />
      <meta name="google" content={googleAttributes.join(",")} />
    </>
  );
};
