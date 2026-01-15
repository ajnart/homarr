"use client";

import type { Dispatch, SetStateAction } from "react";
import { useMemo, useRef, useState } from "react";
import { ActionIcon, Center, Group, Kbd } from "@mantine/core";
import { Spotlight as MantineSpotlight } from "@mantine/spotlight";
import { IconQuestionMark, IconSearch, IconX } from "@tabler/icons-react";

import { hotkeys } from "@homarr/definitions";
import type { TranslationObject } from "@homarr/translation";
import { useI18n } from "@homarr/translation/client";

import type { inferSearchInteractionOptions } from "../lib/interaction";
import type { SearchMode } from "../lib/mode";
import { searchModes } from "../modes";
import { selectAction, spotlightStore } from "../spotlight-store";
import { SpotlightChildrenActions } from "./actions/children-actions";
import { SpotlightActionGroups } from "./actions/groups/action-group";

type SearchModeKey = keyof TranslationObject["search"]["mode"];

const defaultMode = "home";
export const Spotlight = () => {
  const searchModeState = useState<SearchModeKey>(defaultMode);
  const mode = searchModeState[0];
  const activeMode = useMemo(() => searchModes.find((searchMode) => searchMode.modeKey === mode), [mode]);

  if (!activeMode) {
    return null;
  }

  // We use the "key" below to prevent the 'Different amounts of hooks' error
  return <SpotlightWithActiveMode key={mode} modeState={searchModeState} activeMode={activeMode} />;
};

interface SpotlightWithActiveModeProps {
  modeState: [SearchModeKey, Dispatch<SetStateAction<SearchModeKey>>];
  activeMode: SearchMode;
}

const SpotlightWithActiveMode = ({ modeState, activeMode }: SpotlightWithActiveModeProps) => {
  const [query, setQuery] = useState("");
  const [mode, setMode] = modeState;
  const [childrenOptions, setChildrenOptions] = useState<inferSearchInteractionOptions<"children"> | null>(null);
  const t = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  // Works as always the same amount of hooks are executed
  const useGroups = "groups" in activeMode ? () => activeMode.groups : activeMode.useGroups;
  const groups = useGroups();

  return (
    <MantineSpotlight.Root
      shortcut={hotkeys.openSpotlight}
      yOffset={8}
      onSpotlightClose={() => {
        setMode(defaultMode);
        setChildrenOptions(null);
      }}
      query={query}
      onQueryChange={(query) => {
        if (mode !== "help" || query.length !== 1) {
          setQuery(query);
        }

        const modeToActivate = searchModes.find((mode) => mode.character === query);
        if (!modeToActivate) {
          return;
        }

        setMode(modeToActivate.modeKey);
        setQuery("");
        setTimeout(() => selectAction(0, spotlightStore));
      }}
      store={spotlightStore}
    >
      <MantineSpotlight.Search
        placeholder={`${t("search.placeholder")}...`}
        ref={inputRef}
        leftSectionWidth={activeMode.modeKey !== defaultMode ? 80 : 48}
        leftSection={
          <Group align="center" wrap="nowrap" gap="xs" w="100%" h="100%">
            <Center w={48} h="100%">
              <IconSearch stroke={1.5} />
            </Center>
            {activeMode.modeKey !== defaultMode ? <Kbd size="sm">{activeMode.character}</Kbd> : null}
          </Group>
        }
        styles={{
          section: {
            pointerEvents: "all",
          },
        }}
        rightSection={
          mode === defaultMode ? (
            <ActionIcon
              onClick={() => {
                setMode("help");
                inputRef.current?.focus();
              }}
              variant="subtle"
            >
              <IconQuestionMark stroke={1.5} />
            </ActionIcon>
          ) : (
            <ActionIcon
              onClick={() => {
                setMode(defaultMode);
                setChildrenOptions(null);
                inputRef.current?.focus();
              }}
              variant="subtle"
            >
              <IconX stroke={1.5} />
            </ActionIcon>
          )
        }
        value={query}
        onKeyDown={(event) => {
          if (query.length === 0 && mode !== defaultMode && event.key === "Backspace") {
            setMode(defaultMode);
            setChildrenOptions(null);
          }
        }}
      />

      {childrenOptions ? (
        <Group>
          <childrenOptions.DetailComponent options={childrenOptions.option as never} />
        </Group>
      ) : null}

      <MantineSpotlight.ActionsList>
        {childrenOptions ? (
          <SpotlightChildrenActions
            childrenOptions={childrenOptions}
            query={query}
            setChildrenOptions={setChildrenOptions}
          />
        ) : (
          <SpotlightActionGroups
            setMode={(mode) => {
              setMode(mode);
              setChildrenOptions(null);
              setTimeout(() => selectAction(0, spotlightStore));
            }}
            setChildrenOptions={(options) => {
              setChildrenOptions(options);

              setTimeout(() => {
                setQuery("");
                selectAction(0, spotlightStore);
              });
            }}
            query={query}
            groups={groups}
          />
        )}
      </MantineSpotlight.ActionsList>
    </MantineSpotlight.Root>
  );
};
