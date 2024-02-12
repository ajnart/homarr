import { NextApiRequest, NextApiResponse } from 'next';
import cors from 'nextjs-cors';
import { createOpenApiNextHandler } from 'trpc-openapi';
import { createTRPCContext } from '~/server/api/trpc';
import { rootRouter } from '~/server/api/root';
import Consola from 'consola';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Setup CORS
  await cors(req, res);

  // Handle incoming OpenAPI requests
  return createOpenApiNextHandler({
    router: rootRouter,
    createContext: createTRPCContext,
    onError({ error, path }) {
      Consola.error(`tRPC OpenAPI error on ${path}: ${error}`);
    }
  })(req, res);
};

export default handler;