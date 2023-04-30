import z from 'zod';

export const loginSchema = z.object({
  username: z
    .string({
      required_error: 'common.required',
    })
    .min(4, {
      message: 'common.minLength',
    })
    .max(32, {
      message: 'common.maxLength',
    }),
  password: z.string({
    required_error: 'common.required',
  }),
});

export const formRegisterSchema = z.object({
  username: z
    .string({
      required_error: 'common.required',
    })
    .min(4, {
      message: 'common.minLength',
    })
    .max(32, {
      message: 'common.maxLength',
    }),
  password: z
    .string({
      required_error: 'common.required',
    })
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm, {
      message: 'password.complex',
    })
    .min(8, {
      message: 'common.minLength',
    }),
});

export const registerSchema = formRegisterSchema;

export type ILogin = z.infer<typeof loginSchema>;
export type IRegister = z.infer<typeof registerSchema>;
