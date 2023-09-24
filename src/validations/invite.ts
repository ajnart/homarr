import dayjs from 'dayjs';
import { z } from 'zod';

export const createInviteSchema = z.object({
  expiration: z
    .date()
    .min(dayjs().add(5, 'minutes').toDate())
    .max(dayjs().add(6, 'months').toDate()),
});
