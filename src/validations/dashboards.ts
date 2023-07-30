import { z } from 'zod';

export const createDashboardSchemaValidation = z.object({
  name: z.string().min(2).max(25),
});
