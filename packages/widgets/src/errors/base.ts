import type { stringOrTranslation } from "@homarr/translation";
import type { TablerIcon } from "@homarr/ui";

export abstract class ErrorBoundaryError extends Error {
  public abstract getErrorBoundaryData(): {
    icon: TablerIcon;
    message: stringOrTranslation;
    showLogsLink: boolean;
  };
}
