import { createContext, useContext } from "react";

import type { DynamicSectionItem, Section, SectionItem } from "~/app/[locale]/boards/_types";
import type { UseGridstackRefs } from "./gridstack/use-gridstack";

interface SectionContextProps {
  section: Exclude<Section, { kind: "dynamic" }> | DynamicSectionItem;
  innerSections: DynamicSectionItem[];
  items: SectionItem[];
  refs: UseGridstackRefs;
}

const SectionContext = createContext<SectionContextProps | null>(null);

export const useSectionContext = () => {
  const context = useContext(SectionContext);
  if (!context) {
    throw new Error("useSectionContext must be used within a SectionContext");
  }
  return context;
};

export const SectionProvider = SectionContext.Provider;
