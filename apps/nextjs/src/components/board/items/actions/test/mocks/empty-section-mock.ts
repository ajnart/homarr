import { createId } from "@homarr/common";

import type { EmptySection } from "~/app/[locale]/boards/_types";

export class EmptySectionMockBuilder {
  private readonly section: EmptySection;

  constructor(section?: Partial<EmptySection>) {
    this.section = {
      id: createId(),
      kind: "empty",
      xOffset: 0,
      yOffset: 0,
      ...section,
    } satisfies EmptySection;
  }

  public build(): EmptySection {
    return this.section;
  }
}
