import { Spotlight } from "@mantine/spotlight";

import { Link } from "@homarr/ui";

import type { inferSearchInteractionOptions } from "../../../lib/interaction";
import classes from "./action-item.module.css";

interface ChildrenActionItemProps {
  childrenOptions: inferSearchInteractionOptions<"children">;
  query: string;
  action: ReturnType<inferSearchInteractionOptions<"children">["useActions"]>[number];
  setChildrenOptions: (options: inferSearchInteractionOptions<"children">) => void;
}

export const ChildrenActionItem = ({ childrenOptions, action, query, setChildrenOptions }: ChildrenActionItemProps) => {
  const interaction = action.useInteraction(childrenOptions.option, query);

  const renderRoot =
    interaction.type === "link"
      ? (props: Record<string, unknown>) => {
          return <Link href={interaction.href} target={interaction.newTab ? "_blank" : undefined} {...props} />;
        }
      : undefined;

  const onClick =
    interaction.type === "javaScript"
      ? interaction.onSelect
      : interaction.type === "children"
        ? () => setChildrenOptions(interaction)
        : undefined;

  return (
    <Spotlight.Action
      renderRoot={renderRoot}
      onClick={onClick}
      closeSpotlightOnTrigger={interaction.type !== "children"}
      className={classes.spotlightAction}
    >
      <action.Component {...childrenOptions.option} />
    </Spotlight.Action>
  );
};
