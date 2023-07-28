import { z } from 'zod';

export const signInSchema = z.object({
  name: z.string(),
  password: z.string(),
});

export const signUpFormSchema = z.object({
  username: z.string(),
  password: z.string().min(8),
  acceptTos: z.boolean(),
});
