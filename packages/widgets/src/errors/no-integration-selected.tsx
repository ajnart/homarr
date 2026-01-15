import { IconPlugX } from "@tabler/icons-react";

import type { TranslationFunction } from "@homarr/translation";

import { ErrorBoundaryError } from "./base";

export class NoIntegrationSelectedError extends ErrorBoundaryError {
  constructor() {
    super("No integration selected");
  }

  public getErrorBoundaryData() {
    return {
      icon: IconPlugX,
      message: (t: TranslationFunction) => t("widget.common.error.noIntegration"),
      showLogsLink: false,
    };
  }
}
