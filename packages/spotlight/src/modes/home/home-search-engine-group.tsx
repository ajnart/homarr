import { Box, Group, Stack, Text } from "@mantine/core";
import { IconCaretUpDown, IconSearch, IconSearchOff } from "@tabler/icons-react";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import type { Session } from "@homarr/auth";
import { useSession } from "@homarr/auth/client";
import { useSettings } from "@homarr/settings";
import type { TranslationFunction } from "@homarr/translation";
import { useI18n } from "@homarr/translation/client";
import type { TablerIcon } from "@homarr/ui";

import { createGroup } from "../../lib/group";
import type { inferSearchInteractionDefinition, SearchInteraction } from "../../lib/interaction";
import { useFromIntegrationSearchInteraction } from "../external/search-engines-search-group";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type GroupItem = {
  id: string;
  name: string;
  description?: string;
  icon: TablerIcon | string;
  useInteraction: (query: string) => inferSearchInteractionDefinition<SearchInteraction>;
};

export const homeSearchEngineGroup = createGroup<GroupItem>({
  title: (t) => t("search.mode.home.group.search.title"),
  keyPath: "id",
  Component(item) {
    const icon =
      typeof item.icon !== "string" ? (
        <item.icon size={24} />
      ) : (
        <Box w={24} h={24}>
          <img src={item.icon} alt={item.name} style={{ maxWidth: 24 }} />
        </Box>
      );

    return (
      <Group w="100%" wrap="nowrap" align="center" px="md" py="xs">
        {icon}
        <Stack gap={0}>
          <Text>{item.name}</Text>
          {item.description && (
            <Text c="gray.6" size="sm">
              {item.description}
            </Text>
          )}
        </Stack>
      </Group>
    );
  },
  useInteraction(item, query) {
    return item.useInteraction(query);
  },
  filter() {
    return true;
  },
  useQueryOptions(query) {
    const t = useI18n();
    const { data: session, status } = useSession();
    const { data: defaultSearchEngine, ...defaultSearchEngineQuery } =
      clientApi.searchEngine.getDefaultSearchEngine.useQuery(undefined, {
        enabled: status !== "loading",
      });
    const fromIntegrationEnabled = defaultSearchEngine?.type === "fromIntegration" && query.length > 0;
    const { data: results, ...resultQuery } = clientApi.integration.searchInIntegration.useQuery(
      {
        query,
        integrationId: defaultSearchEngine?.integrationId ?? "",
      },
      {
        enabled: fromIntegrationEnabled,
        select: (data) => data.slice(0, 5),
      },
    );

    return {
      isLoading:
        defaultSearchEngineQuery.isLoading || (resultQuery.isLoading && fromIntegrationEnabled) || status === "loading",
      isError: defaultSearchEngineQuery.isError || (resultQuery.isError && fromIntegrationEnabled),
      data: [
        ...createDefaultSearchEntries(defaultSearchEngine, results, session, query, t),
        {
          id: "other",
          name: t("search.mode.home.group.search.option.other.label"),
          icon: IconCaretUpDown,
          useInteraction() {
            return {
              type: "mode",
              mode: "external",
            };
          },
        },
      ],
    };
  },
});

const createDefaultSearchEntries = (
  defaultSearchEngine: RouterOutputs["searchEngine"]["getDefaultSearchEngine"] | null,
  results: RouterOutputs["integration"]["searchInIntegration"] | undefined,
  session: Session | null,
  query: string,
  t: TranslationFunction,
): GroupItem[] => {
  if (!session?.user && !defaultSearchEngine) {
    return [];
  }

  if (!defaultSearchEngine) {
    return [
      {
        id: "no-default",
        name: t("search.mode.home.group.search.option.no-default.label"),
        description: t("search.mode.home.group.search.option.no-default.description"),
        icon: IconSearchOff,
        useInteraction() {
          return {
            type: "link",
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            href: `/manage/users/${session!.user.id}/general`,
          };
        },
      },
    ];
  }

  if (defaultSearchEngine.type === "generic") {
    return [
      {
        id: "search",
        name: t("search.mode.home.group.search.option.search.label", {
          query,
          name: defaultSearchEngine.name,
        }),
        icon: defaultSearchEngine.iconUrl,
        useInteraction(query) {
          const { openSearchInNewTab } = useSettings();
          return {
            type: "link",
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            href: defaultSearchEngine.urlTemplate!.replace("%s", query),
            newTab: openSearchInNewTab,
          };
        },
      },
    ];
  }

  if (!results) {
    return [
      {
        id: "from-integration",
        name: defaultSearchEngine.name,
        icon: defaultSearchEngine.iconUrl,
        description: t("search.mode.home.group.search.option.from-integration.description"),
        useInteraction() {
          return {
            type: "none",
          };
        },
      },
    ];
  }

  return results.map((result) => ({
    id: `search-${result.id}`,
    name: result.name,
    description: result.text,
    icon: result.image ?? IconSearch,
    useInteraction() {
      return useFromIntegrationSearchInteraction(defaultSearchEngine, result);
    },
  }));
};
