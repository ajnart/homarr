import type { OldmarrWidgetKind } from "@homarr/old-schema";

export interface CommonOldmarrWidgetDefinition<
  TId extends OldmarrWidgetKind,
  TOptions extends Record<string, unknown>,
> {
  id: TId;
  options: TOptions;
}
