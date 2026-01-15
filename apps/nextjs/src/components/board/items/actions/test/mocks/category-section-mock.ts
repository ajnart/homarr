import { createId } from "@homarr/common";

import type { CategorySection } from "~/app/[locale]/boards/_types";

export class CategorySectionMockBuilder {
  private readonly section: CategorySection;

  constructor(section?: Partial<CategorySection>) {
    this.section = {
      id: createId(),
      kind: "category",
      xOffset: 0,
      yOffset: 0,
      name: "Category",
      collapsed: false,
      ...section,
    } satisfies CategorySection;
  }

  public build(): CategorySection {
    return this.section;
  }
}
