import { Group, Text } from "@mantine/core";

import { createGroup } from "../../lib/group";
import type { ContextSpecificItem } from "./context";
import { useSpotlightContextResults } from "./context";

export const contextSpecificSearchGroups = createGroup<ContextSpecificItem>({
  title: (t) => t("search.mode.home.group.local.title"),
  keyPath: "id",
  Component(option) {
    const icon =
      typeof option.icon !== "string" ? (
        <option.icon size={24} />
      ) : (
        <img width={24} height={24} src={option.icon} alt={option.name} />
      );

    return (
      <Group w="100%" wrap="nowrap" align="center" px="md" py="xs">
        {icon}
        <Text>{option.name}</Text>
      </Group>
    );
  },
  useInteraction(option) {
    return option.interaction();
  },
  filter(query, option) {
    return option.name.toLowerCase().includes(query.toLowerCase());
  },
  useOptions() {
    return useSpotlightContextResults();
  },
});
