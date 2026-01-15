import { createId } from "@homarr/common";

import type { Board, DynamicSection, EmptySection, Item, Section } from "~/app/[locale]/boards/_types";
import { DynamicSectionMockBuilder } from "./dynamic-section-mock";
import { EmptySectionMockBuilder } from "./empty-section-mock";
import { ItemMockBuilder } from "./item-mock";
import { LayoutMockBuilder } from "./layout-mock";

export class BoardMockBuilder {
  private readonly board: Board;

  constructor(board?: Partial<Omit<Board, "groupPermissions" | "userPermissions" | "sections" | "items" | "layouts">>) {
    this.board = {
      id: createId(),
      backgroundImageRepeat: "no-repeat",
      backgroundImageAttachment: "scroll",
      backgroundImageSize: "cover",
      backgroundImageUrl: null,
      primaryColor: "#ffffff",
      secondaryColor: "#000000",
      iconColor: null,
      itemRadius: "lg",
      pageTitle: "Board",
      metaTitle: "Board",
      logoImageUrl: null,
      faviconImageUrl: null,
      name: "board",
      opacity: 100,
      isPublic: true,
      disableStatus: false,
      customCss: "",
      creatorId: createId(),
      creator: {
        id: createId(),
        image: null,
        name: "User",
        email: null,
      },
      groupPermissions: [],
      userPermissions: [],
      sections: [],
      items: [],
      layouts: [
        {
          id: createId(),
          name: "Base",
          columnCount: 12,
          breakpoint: 0,
        },
      ],
      ...board,
    };
  }

  public addEmptySection(emptySection?: Partial<EmptySection>): BoardMockBuilder {
    return this.addSection(new EmptySectionMockBuilder(emptySection).build());
  }

  public addDynamicSection(dynamicSection?: Partial<DynamicSection>): BoardMockBuilder {
    return this.addSection(new DynamicSectionMockBuilder(dynamicSection).build());
  }

  public addSection(section: Section): BoardMockBuilder {
    this.board.sections.push(section);
    return this;
  }

  public addSections(sections: Section[]): BoardMockBuilder {
    this.board.sections.push(...sections);
    return this;
  }

  public addItem(item?: Partial<Item>): BoardMockBuilder {
    this.board.items.push(new ItemMockBuilder(item).build());
    return this;
  }

  public addItems(items: Item[]): BoardMockBuilder {
    this.board.items.push(...items);
    return this;
  }

  public addLayout(layout?: Partial<Board["layouts"][number]>): BoardMockBuilder {
    this.board.layouts.push(new LayoutMockBuilder(layout).build());
    return this;
  }

  public build(): Board {
    return this.board;
  }
}
