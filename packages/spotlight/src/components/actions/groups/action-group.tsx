import { Spotlight } from "@mantine/spotlight";

import type { TranslationObject } from "@homarr/translation";
import { translateIfNecessary } from "@homarr/translation";
import { useI18n } from "@homarr/translation/client";

import type { SearchGroup } from "../../../lib/group";
import type { inferSearchInteractionOptions } from "../../../lib/interaction";
import { SpotlightGroupActions } from "../group-actions";

interface SpotlightActionGroupsProps {
  groups: SearchGroup[];
  query: string;
  setMode: (mode: keyof TranslationObject["search"]["mode"]) => void;
  setChildrenOptions: (options: inferSearchInteractionOptions<"children">) => void;
}

export const SpotlightActionGroups = ({ groups, ...others }: SpotlightActionGroupsProps) => {
  const t = useI18n();

  return groups.map((group) => (
    <Spotlight.ActionsGroup key={translateIfNecessary(t, group.title)} label={translateIfNecessary(t, group.title)}>
      {/*eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <SpotlightGroupActions<any> group={group} {...others} />
    </Spotlight.ActionsGroup>
  ));
};
