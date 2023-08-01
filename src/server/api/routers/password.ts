import { generate } from 'generate-password';

import { createTRPCRouter, publicProcedure } from "../trpc";

export const passwordRouter = createTRPCRouter({
  generate: publicProcedure.mutation(() => {
    return generate({
      strict: true,
      numbers: true,
      lowercase: true,
      uppercase: true,
      symbols: true,
      excludeSimilarCharacters: true,
      length: 16
    })
  }),
});