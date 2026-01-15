import type { InputPropsFor } from "@homarr/form/types";
import { useScopedI18n } from "@homarr/translation/client";
import { SelectWithDescription } from "@homarr/ui";

import type { SidebarBehaviour } from "../../settings";

export const SidebarBehaviourSelect = (props: InputPropsFor<SidebarBehaviour, SidebarBehaviour, HTMLButtonElement>) => {
  const tSidebarBehaviour = useScopedI18n("board.action.oldImport.form.sidebarBehavior");

  return (
    <SelectWithDescription
      withAsterisk
      label={tSidebarBehaviour("label")}
      description={tSidebarBehaviour("description")}
      data={[
        {
          value: "last-section",
          label: tSidebarBehaviour("option.lastSection.label"),
          description: tSidebarBehaviour("option.lastSection.description"),
        },
        {
          value: "remove-items",
          label: tSidebarBehaviour("option.removeItems.label"),
          description: tSidebarBehaviour("option.removeItems.description"),
        },
      ]}
      {...props}
      onChange={(value) => (value ? props.onChange(value as SidebarBehaviour) : null)}
    />
  );
};
