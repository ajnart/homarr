import type { SearchMode } from "../../lib/mode";
import { pagesSearchGroup } from "./pages-search-group";

export const pageMode = {
  modeKey: "page",
  character: "/",
  groups: [pagesSearchGroup],
} satisfies SearchMode;
