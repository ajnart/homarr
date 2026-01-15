import { createId } from "@homarr/common";

import type { Item } from "~/app/[locale]/boards/_types";

export class ItemMockBuilder {
  private readonly item: Item;

  constructor(item?: Partial<Item>) {
    this.item = {
      id: createId(),
      kind: "app",
      options: {},
      layouts: [],
      integrationIds: [],
      advancedOptions: {
        title: null,
        customCssClasses: [],
        borderColor: "",
      },
      ...item,
    } satisfies Item;
  }

  public addLayout(layout?: Partial<Item["layouts"][0]>): ItemMockBuilder {
    this.item.layouts.push({
      layoutId: "1",
      height: 1,
      width: 1,
      xOffset: 0,
      yOffset: 0,
      sectionId: "0",
      ...layout,
    } satisfies Item["layouts"][0]);
    return this;
  }

  public build(): Item {
    return this.item;
  }
}
