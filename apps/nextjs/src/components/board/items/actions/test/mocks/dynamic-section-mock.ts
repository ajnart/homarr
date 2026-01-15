import { createId } from "@homarr/common";

import type { DynamicSection } from "~/app/[locale]/boards/_types";

export class DynamicSectionMockBuilder {
  private readonly section: DynamicSection;

  constructor(section?: Partial<DynamicSection>) {
    this.section = {
      id: createId(),
      kind: "dynamic",
      options: {
        title: "",
        borderColor: "",
        customCssClasses: [],
      },
      layouts: [],
      ...section,
    } satisfies DynamicSection;
  }

  public addLayout(layout?: Partial<DynamicSection["layouts"][0]>): DynamicSectionMockBuilder {
    this.section.layouts.push({
      layoutId: "1",
      height: 1,
      width: 1,
      xOffset: 0,
      yOffset: 0,
      parentSectionId: "0",
      ...layout,
    } satisfies DynamicSection["layouts"][0]);
    return this;
  }

  public build(): DynamicSection {
    return this.section;
  }
}
