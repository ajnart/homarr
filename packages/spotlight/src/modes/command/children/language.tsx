import { Group, Stack, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

import { localeConfigurations, supportedLanguages } from "@homarr/translation";
import { useChangeLocale, useCurrentLocale, useI18n } from "@homarr/translation/client";
import { LanguageIcon } from "@homarr/ui";

import { createChildrenOptions } from "../../../lib/children";

export const languageChildrenOptions = createChildrenOptions<Record<string, unknown>>({
  useActions: (_, query) => {
    const normalizedQuery = query.trim().toLowerCase();
    const currentLocale = useCurrentLocale();
    return supportedLanguages
      .map((localeKey) => ({ localeKey, configuration: localeConfigurations[localeKey] }))
      .filter(
        ({ configuration }) =>
          configuration.name.toLowerCase().includes(normalizedQuery) ||
          configuration.translatedName.toLowerCase().includes(normalizedQuery),
      )
      .sort(
        (languageA, languageB) =>
          Math.min(
            languageA.configuration.name.toLowerCase().indexOf(normalizedQuery),
            languageA.configuration.translatedName.toLowerCase().indexOf(normalizedQuery),
          ) -
          Math.min(
            languageB.configuration.name.toLowerCase().indexOf(normalizedQuery),
            languageB.configuration.translatedName.toLowerCase().indexOf(normalizedQuery),
          ),
      )
      .map(({ localeKey, configuration }) => ({
        key: localeKey,
        Component() {
          return (
            <Group mx="md" my="sm" wrap="nowrap" justify="space-between" w="100%">
              <Group wrap="nowrap">
                <LanguageIcon icon={localeConfigurations[localeKey].icon} />
                <Group wrap="nowrap" gap="xs">
                  <Text>{configuration.name}</Text>
                  <Text size="xs" c="dimmed" inherit>
                    ({configuration.translatedName})
                  </Text>
                </Group>
              </Group>
              {localeKey === currentLocale && <IconCheck color="currentColor" size={24} />}
            </Group>
          );
        },
        useInteraction() {
          const { changeLocale } = useChangeLocale();

          return { type: "javaScript", onSelect: () => changeLocale(localeKey) };
        },
      }));
  },
  DetailComponent: () => {
    const t = useI18n();

    return (
      <Stack mx="md" my="sm">
        <Text>{t("search.mode.command.group.globalCommand.option.language.children.detail.title")}</Text>
      </Stack>
    );
  },
});
