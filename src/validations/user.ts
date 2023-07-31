import { z } from 'zod';
import { CustomErrorParams } from '~/utils/i18n-zod-resolver';

export const signInSchema = z.object({
  name: z.string(),
  password: z.string(),
});

export const signUpFormSchema = z
  .object({
    username: z.string().min(3),
    password: z.string().min(8),
    passwordConfirmation: z.string().min(8),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    params: {
      i18n: { key: 'password_match' },
    } satisfies CustomErrorParams,
    path: ['passwordConfirmation'],
  });

export const createNewUserSchema = z.object({
  username: z.string(),
  email: z.string().email().optional(),
  password: z.string().min(8).max(100),
});

export const colorSchemeParser = z
  .enum(['light', 'dark', 'environment'])
  .default('environment')
  .catch('environment');

export const updateSettingsValidationSchema = z.object({
  disablePingPulse: z.boolean(),
  replaceDotsWithIcons: z.boolean(),
  language: z.string(),
});
