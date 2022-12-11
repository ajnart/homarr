import { createStyles } from '@mantine/core';

export const useStyles = createStyles((theme) => ({
  styledButton: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.gray[9] : theme.colors.gray[2],
    color: theme.colorScheme === 'dark' ? theme.colors.gray[0] : theme.colors.dark[9],
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.gray[8] : theme.colors.gray[3],
    },
  },
  elementButton: {
    width: '100%',
    height: '100%',
    borderRadius: theme.radius.sm,
  },
  elementStack: {
    width: '100%',
  },
  elementName: {
    whiteSpace: 'normal',
    textAlign: 'center',
    lineHeight: 1.2,
  },
  elementText: {
    lineHeight: 1.2,
    whiteSpace: 'normal',
  },
}));
