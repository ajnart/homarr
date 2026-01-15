import { Spotlight } from "@mantine/spotlight";

import { useI18n } from "@homarr/translation/client";

export const SpotlightNoResults = () => {
  const t = useI18n();

  return <Spotlight.Empty>{t("search.nothingFound")}</Spotlight.Empty>;
};
