import {
  AxiosHttpErrorHandler,
  FetchHttpErrorHandler,
  OctokitHttpErrorHandler,
  OFetchHttpErrorHandler,
  TsdavHttpErrorHandler,
} from "@homarr/common/server";

import { IntegrationHttpErrorHandler } from "./integration-http-error-handler";

export const integrationFetchHttpErrorHandler = new IntegrationHttpErrorHandler(new FetchHttpErrorHandler());
export const integrationOFetchHttpErrorHandler = new IntegrationHttpErrorHandler(new OFetchHttpErrorHandler());
export const integrationAxiosHttpErrorHandler = new IntegrationHttpErrorHandler(new AxiosHttpErrorHandler());
export const integrationTsdavHttpErrorHandler = new IntegrationHttpErrorHandler(new TsdavHttpErrorHandler());
export const integrationOctokitHttpErrorHandler = new IntegrationHttpErrorHandler(new OctokitHttpErrorHandler());
