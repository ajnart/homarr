import { z } from 'zod';

export const registrationTokenCreationInputSchema = z.object({
  name: z.string().min(4).max(64),
});
