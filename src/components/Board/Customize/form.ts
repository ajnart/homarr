import { createFormContext } from '@mantine/form';
import { z } from 'zod';
import { boardCustomizationSchema } from '~/validations/boards';

export const [
  BoardCustomizationFormProvider,
  useBoardCustomizationFormContext,
  useBoardCustomizationForm,
] = createFormContext<z.infer<typeof boardCustomizationSchema>>();
