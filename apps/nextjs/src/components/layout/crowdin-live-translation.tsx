import Script from "next/script";

import type { SupportedLanguage } from "@homarr/translation";

export const CrowdinLiveTranslation = (props: { locale: SupportedLanguage }) => {
  if (props.locale !== "cr") return null;

  return (
    <>
      <Script type="text/javascript" src="//cdn.crowdin.com/jipt/jipt.js"></Script>

      <Script type="text/javascript" id="crowdin-configuration">
        {`var _jipt = []; _jipt.push(['project', 'homarr_labs']);`}
      </Script>
    </>
  );
};
