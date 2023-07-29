import dayjs from 'dayjs';
import { z } from 'zod';

export const createRegistrationTokenSchema = z.object({
  expiration: z
    .date()
    .min(dayjs().add(5, 'minutes').toDate())
    .max(dayjs().add(6, 'months').toDate()),
});
