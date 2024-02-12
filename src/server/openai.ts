import { generateOpenApiDocument } from 'trpc-openapi';
import { appRouter } from '~/server/api/routers/app';
import { rootRouter } from '~/server/api/root';

export const openApiDocument = generateOpenApiDocument(rootRouter, {
  title: 'Homarr API',
  description: 'OpenAPI compliant REST API built of interfacing with Homarr',
  version: '1.0.0',
  baseUrl: 'http://localhost:3000/api',
  docsUrl: 'https://homarr.dev'
});