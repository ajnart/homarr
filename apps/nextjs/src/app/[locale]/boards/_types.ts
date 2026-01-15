import type { RouterOutputs } from "@homarr/api";
import type { WidgetKind } from "@homarr/definitions";

export type Board = RouterOutputs["board"]["getHomeBoard"];
export type Section = Board["sections"][number];
export type Item = Board["items"][number];
export type ItemLayout = Item["layouts"][number];
export type SectionItem = Omit<Item, "layouts"> & ItemLayout & { type: "item" };

export type CategorySection = Extract<Section, { kind: "category" }>;
export type EmptySection = Extract<Section, { kind: "empty" }>;
export type DynamicSection = Extract<Section, { kind: "dynamic" }>;
export type DynamicSectionLayout = DynamicSection["layouts"][number];
export type DynamicSectionItem = Omit<DynamicSection, "layouts"> & DynamicSectionLayout & { type: "section" };

export type ItemOfKind<TKind extends WidgetKind> = Extract<Item, { kind: TKind }>;
