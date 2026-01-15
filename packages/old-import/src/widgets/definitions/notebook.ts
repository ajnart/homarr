import type { CommonOldmarrWidgetDefinition } from "./common";

export type OldmarrNotebookDefinition = CommonOldmarrWidgetDefinition<
  "notebook",
  {
    showToolbar: boolean;
    allowReadOnlyCheck: boolean;
    content: string;
  }
>;
