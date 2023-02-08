import { z } from 'zod';

export const registrationInviteCreationInputSchema = z.object({
  name: z.string().min(4).max(64),
});
