import { z } from 'zod';

export const commonItemSchema = z.object({
  id: z.string().nonempty(),
  width: z.number().min(0),
  height: z.number().min(0),
  x: z.number().min(0),
  y: z.number().min(0),
});
