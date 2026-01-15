"use client";

import type { OpenAPIObject } from "openapi3-ts/oas31";
import SwaggerUI from "swagger-ui-react";

// workaround for CSS that cannot be processed by next.js, https://github.com/swagger-api/swagger-ui/issues/10045
import "../swagger-ui-dark.css";
import "../swagger-ui-overrides.css";
import "../swagger-ui.css";

interface SwaggerUIClientProps {
  document: OpenAPIObject;
}

export const SwaggerUIClient = ({ document }: SwaggerUIClientProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestInterceptor = (req: Record<string, any>) => {
    req.credentials = "omit";
    return req;
  };

  return <SwaggerUI requestInterceptor={requestInterceptor} spec={document} />;
};
