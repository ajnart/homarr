import { Group, Image, Kbd, Stack, Text } from "@mantine/core";
import { IconDownload, IconSearch } from "@tabler/icons-react";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import type { IntegrationKind } from "@homarr/definitions";
import { getIntegrationKindsByCategory, getIntegrationName } from "@homarr/definitions";
import { useModalAction } from "@homarr/modals";
import { RequestMediaModal } from "@homarr/modals-collection";
import { useSettings } from "@homarr/settings";
import { useScopedI18n } from "@homarr/translation/client";

import { createChildrenOptions } from "../../lib/children";
import { createGroup } from "../../lib/group";
import type { inferSearchInteractionDefinition } from "../../lib/interaction";
import { interaction } from "../../lib/interaction";

type SearchEngine = RouterOutputs["searchEngine"]["search"][number];
type FromIntegrationSearchResult = RouterOutputs["integration"]["searchInIntegration"][number];

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type MediaRequestChildrenProps = {
  result: {
    id: number;
    image?: string;
    name: string;
    link: string;
    text?: string;
    type: "tv" | "movie";
    inLibrary: boolean;
  };
  integration: {
    kind: IntegrationKind;
    url: string;
    id: string;
  };
};

export const useFromIntegrationSearchInteraction = (
  searchEngine: SearchEngine,
  searchResult: FromIntegrationSearchResult,
): inferSearchInteractionDefinition<"link" | "javaScript" | "children"> => {
  const { openSearchInNewTab } = useSettings();

  if (searchEngine.type !== "fromIntegration") {
    throw new Error("Invalid search engine type");
  }

  if (!searchEngine.integration) {
    throw new Error("Invalid search engine integration");
  }

  if (
    getIntegrationKindsByCategory("mediaRequest").some(
      (categoryKind) => categoryKind === searchEngine.integration?.kind,
    ) &&
    "type" in searchResult
  ) {
    const type = searchResult.type;
    if (type === "person") {
      return {
        type: "link",
        href: searchResult.link,
        newTab: openSearchInNewTab,
      };
    }

    return {
      type: "children",
      ...mediaRequestsChildrenOptions({
        result: {
          ...searchResult,
          type,
        },
        integration: searchEngine.integration,
      }),
    };
  }

  return {
    type: "link",
    href: searchResult.link,
    newTab: true,
  };
};

const mediaRequestsChildrenOptions = createChildrenOptions<MediaRequestChildrenProps>({
  useActions() {
    const { openModal } = useModalAction(RequestMediaModal);
    return [
      {
        key: "request",
        hide: (option) => option.result.inLibrary,
        Component(option) {
          const t = useScopedI18n("search.mode.media");
          return (
            <Group mx="md" my="sm" wrap="nowrap">
              <IconDownload stroke={1.5} />
              {option.result.type === "tv" && <Text>{t("requestSeries")}</Text>}
              {option.result.type === "movie" && <Text>{t("requestMovie")}</Text>}
            </Group>
          );
        },
        useInteraction: interaction.javaScript((option) => ({
          onSelect() {
            openModal(
              {
                integrationId: option.integration.id,
                mediaId: option.result.id,
                mediaType: option.result.type,
              },
              {
                title(t) {
                  return t("search.engine.media.request.modal.title", { name: option.result.name });
                },
              },
            );
          },
        })),
      },
      {
        key: "open",
        Component({ integration }) {
          const tChildren = useScopedI18n("search.mode.media");
          return (
            <Group mx="md" my="sm" wrap="nowrap">
              <IconSearch stroke={1.5} />
              <Text>{tChildren("openIn", { kind: getIntegrationName(integration.kind) })}</Text>
            </Group>
          );
        },
        useInteraction({ result }) {
          const { openSearchInNewTab } = useSettings();
          return {
            type: "link",
            href: result.link,
            newTab: openSearchInNewTab,
          };
        },
      },
    ];
  },
  DetailComponent({ options }) {
    return (
      <Group mx="md" my="sm" wrap="nowrap">
        {options.result.image ? (
          <Image src={options.result.image} w={35} h={50} fit="cover" radius={"md"} />
        ) : (
          <IconSearch stroke={1.5} size={35} />
        )}
        <Stack gap={2}>
          <Text>{options.result.name}</Text>
          {options.result.text && (
            <Text c="dimmed" size="sm" lineClamp={2}>
              {options.result.text}
            </Text>
          )}
        </Stack>
      </Group>
    );
  },
});

export const searchEnginesChildrenOptions = createChildrenOptions<SearchEngine>({
  useActions: (searchEngine, query) => {
    const { data } = clientApi.integration.searchInIntegration.useQuery(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      { integrationId: searchEngine.integrationId!, query },
      {
        enabled: searchEngine.type === "fromIntegration" && searchEngine.integrationId !== null && query.length > 0,
      },
    );
    const { openSearchInNewTab } = useSettings();

    if (searchEngine.type === "generic") {
      return [
        {
          key: "search",
          Component: ({ name }) => {
            const tChildren = useScopedI18n("search.mode.external.group.searchEngine.children");

            return (
              <Group mx="md" my="sm">
                <IconSearch stroke={1.5} />
                <Text>{tChildren("action.search.label", { name })}</Text>
              </Group>
            );
          },
          useInteraction: interaction.link(({ urlTemplate }, query) => ({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            href: urlTemplate!.replace("%s", query),
            newTab: openSearchInNewTab,
          })),
        },
      ];
    }

    return (data ?? []).map((searchResult, index) => ({
      key: `search-result-${index}`,
      Component: () => {
        return (
          <Group mx="md" my="sm" wrap="nowrap">
            {searchResult.image ? (
              <Image src={searchResult.image} w={35} h={50} fit="cover" radius={"md"} />
            ) : (
              <IconSearch stroke={1.5} size={35} />
            )}
            <Stack gap={2}>
              <Text>{searchResult.name}</Text>
              {searchResult.text && (
                <Text c="dimmed" size="sm" lineClamp={2}>
                  {searchResult.text}
                </Text>
              )}
            </Stack>
          </Group>
        );
      },
      useInteraction() {
        return useFromIntegrationSearchInteraction(searchEngine, searchResult);
      },
    }));
  },
  DetailComponent({ options }) {
    const tChildren = useScopedI18n("search.mode.external.group.searchEngine.children");
    return (
      <Stack mx="md" my="sm">
        <Text>{options.type === "generic" ? tChildren("detail.title") : tChildren("searchResults.title")}</Text>
        <Group>
          <img height={24} width={24} src={options.iconUrl} alt={options.name} />
          <Text>{options.name}</Text>
        </Group>
      </Stack>
    );
  },
});

export const searchEnginesSearchGroups = createGroup<SearchEngine>({
  keyPath: "short",
  title: (t) => t("search.mode.external.group.searchEngine.title"),
  Component: ({ iconUrl, name, short, description }) => {
    return (
      <Group w="100%" wrap="nowrap" justify="space-between" align="center" px="md" py="xs">
        <Group wrap="nowrap">
          <img height={24} width={24} src={iconUrl} alt={name} />
          <Stack gap={0} justify="center">
            <Text size="sm">{name}</Text>
            <Text size="xs" c="gray.6">
              {description}
            </Text>
          </Stack>
        </Group>

        <Kbd size="sm">{short}</Kbd>
      </Group>
    );
  },
  onKeyDown(event, options, query, { setChildrenOptions }) {
    if (event.code !== "Space") return;

    const engine = options.find((option) => option.short === query);
    if (!engine) return;

    setChildrenOptions(searchEnginesChildrenOptions(engine));
  },
  useInteraction: (searchEngine, query) => {
    const { openSearchInNewTab } = useSettings();
    if (searchEngine.type === "generic" && searchEngine.urlTemplate) {
      return {
        type: "link" as const,
        href: searchEngine.urlTemplate.replace("%s", query),
        newTab: openSearchInNewTab,
      };
    }

    if (searchEngine.type === "fromIntegration" && searchEngine.integrationId !== null) {
      return {
        type: "children",
        ...searchEnginesChildrenOptions(searchEngine),
      };
    }

    throw new Error(`Unable to process search engine with type ${searchEngine.type}`);
  },
  useQueryOptions(query) {
    return clientApi.searchEngine.search.useQuery({
      query: query.trim(),
      limit: 5,
    });
  },
});
