import type { ResponseError } from "@homarr/common/server";

import type { IntegrationErrorData } from "../integration-error";
import { IntegrationError } from "../integration-error";

export class IntegrationResponseError extends IntegrationError {
  constructor(integration: IntegrationErrorData, { cause }: { cause: ResponseError }) {
    super(integration, "Response from integration did not indicate success", { cause });
    this.name = IntegrationResponseError.name;
  }

  get cause(): ResponseError {
    return super.cause as ResponseError;
  }
}
