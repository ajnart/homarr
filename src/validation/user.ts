import { literal, z } from 'zod';

export const userFilterSchema = z.union([
  literal('all'),
  literal('user-enabled'),
  literal('user-archived'),
  literal('user-non-admin'),
  literal('user-admin'),
]);
