import { JsonParseErrorHandler, ZodParseErrorHandler } from "@homarr/common/server";

import { IntegrationParseErrorHandler } from "./integration-parse-error-handler";

export const integrationZodParseErrorHandler = new IntegrationParseErrorHandler(new ZodParseErrorHandler());
export const integrationJsonParseErrorHandler = new IntegrationParseErrorHandler(new JsonParseErrorHandler());
