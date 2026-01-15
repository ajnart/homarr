import { Image } from "@mantine/core";

import type { LanguageIconDefinition } from "@homarr/translation";

export const LanguageIcon = ({ icon }: { icon: LanguageIconDefinition }) => {
  if (icon.type === "flag") {
    return <span className={`fi fi-${icon.flag}`} style={{ borderRadius: 4 }}></span>;
  }

  return <Image src={icon.url} style={{ width: "1.3333em", height: "1.3333em" }} fit="contain" alt="Language icon" />;
};
