import { generate } from 'generate-password';

import { adminProcedure, createTRPCRouter } from '../trpc';

export const passwordRouter = createTRPCRouter({
  generate: adminProcedure.mutation(() => {
    return generate({
      strict: true,
      numbers: true,
      lowercase: true,
      uppercase: true,
      symbols: true,
      excludeSimilarCharacters: true,
      length: 16,
    });
  }),
});
