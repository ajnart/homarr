import { cache } from "react";
import { cookies } from "next/headers";

import { db } from "@homarr/db";
import { getServerSettingByKeyAsync } from "@homarr/db/queries";
import type { ColorScheme } from "@homarr/definitions";
import { colorSchemeCookieKey } from "@homarr/definitions";

export const getCurrentColorSchemeAsync = cache(async () => {
  const cookieValue = (await cookies()).get(colorSchemeCookieKey)?.value;

  if (cookieValue) {
    return cookieValue as ColorScheme;
  }

  const appearanceSettings = await getServerSettingByKeyAsync(db, "appearance");
  return appearanceSettings.defaultColorScheme;
});
