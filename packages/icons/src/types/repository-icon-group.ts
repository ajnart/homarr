import type { RepositoryIcon } from "./repository-icon";

export interface RepositoryIconGroup {
  icons: RepositoryIcon[];
  success: boolean;
  slug: string;
}
