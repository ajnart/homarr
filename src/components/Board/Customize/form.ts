import { DEFAULT_THEME, MANTINE_COLORS, MantineColor } from '@mantine/core';
import { createFormContext } from '@mantine/form';
import { z } from 'zod';
import { boardCustomizationSchema } from '~/validations/dashboards';

export const [
  BoardCustomizationFormProvider,
  useBoardCustomizationFormContext,
  useBoardCustomizationForm,
] = createFormContext<z.infer<typeof boardCustomizationSchema>>();
