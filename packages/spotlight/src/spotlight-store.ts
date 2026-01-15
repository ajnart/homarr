"use client";

import { clamp } from "@mantine/hooks";
import type { SpotlightStore } from "@mantine/spotlight";
import { createSpotlight } from "@mantine/spotlight";

export const [spotlightStore, spotlightActions] = createSpotlight();

export const setSelectedAction = (index: number, store: SpotlightStore) => {
  store.updateState((state) => ({ ...state, selected: index }));
};

export const selectAction = (index: number, store: SpotlightStore): number => {
  const state = store.getState();
  const actionsList = document.getElementById(state.listId);
  const selected = actionsList?.querySelector<HTMLButtonElement>("[data-selected]");
  const actions = actionsList?.querySelectorAll<HTMLButtonElement>("[data-action]") ?? [];
  const nextIndex = index === -1 ? actions.length - 1 : index === actions.length ? 0 : index;

  const selectedIndex = clamp(nextIndex, 0, actions.length - 1);
  selected?.removeAttribute("data-selected");
  actions[selectedIndex]?.scrollIntoView({ block: "nearest" });
  actions[selectedIndex]?.setAttribute("data-selected", "true");
  setSelectedAction(selectedIndex, store);

  return selectedIndex;
};

export const selectNextAction = (store: SpotlightStore) => {
  return selectAction(store.getState().selected + 1, store);
};

export const selectPreviousAction = (store: SpotlightStore) => {
  return selectAction(store.getState().selected - 1, store);
};
export const triggerSelectedAction = (store: SpotlightStore) => {
  const state = store.getState();
  const selected = document.querySelector<HTMLButtonElement>(`#${state.listId} [data-selected]`);
  selected?.click();
};
