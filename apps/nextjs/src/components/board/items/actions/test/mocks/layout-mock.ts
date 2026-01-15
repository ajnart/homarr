import { createId } from "@homarr/common";

import type { Board } from "~/app/[locale]/boards/_types";

export class LayoutMockBuilder {
  private readonly layout: Board["layouts"][number];

  constructor(layout?: Partial<Board["layouts"][number]>) {
    this.layout = {
      id: createId(),
      name: "Base",
      columnCount: 12,
      breakpoint: 0,
      ...layout,
    } satisfies Board["layouts"][0];
  }

  public build(): Board["layouts"][0] {
    return this.layout;
  }
}
