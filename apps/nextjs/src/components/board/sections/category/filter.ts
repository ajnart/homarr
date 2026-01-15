import type { WidgetKind } from "@homarr/definitions";
import type { SettingsContextProps } from "@homarr/settings/creator";
import type { WidgetComponentProps } from "@homarr/widgets";
import { reduceWidgetOptionsWithDefaultValues } from "@homarr/widgets";

import type { Item } from "~/app/[locale]/boards/_types";

export const filterByItemKind = <TKind extends WidgetKind>(
  items: Item[],
  settings: SettingsContextProps,
  kind: TKind,
) => {
  return items
    .filter((item) => item.kind === kind)
    .map((item) => ({
      ...item,
      options: reduceWidgetOptionsWithDefaultValues(
        kind,
        settings,
        item.options,
      ) as WidgetComponentProps<TKind>["options"],
    }));
};
