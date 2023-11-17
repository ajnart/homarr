import { createTheme } from '@mantine/core';

export const theme = createTheme({
  /** Put your mantine theme override here */
  primaryColor: 'var(--mantine-color-red-5)',
  components: {
    Checkbox: {
      styles: {
        input: { cursor: 'pointer' },
        label: { cursor: 'pointer' },
      },
    },
    Switch: {
      styles: {
        input: { cursor: 'pointer' },
        label: { cursor: 'pointer' },
      },
    },
  },
});
