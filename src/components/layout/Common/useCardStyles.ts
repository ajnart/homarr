import { createStyles } from '@mantine/core';
import { useOptionalBoard } from '~/components/Board/context';

export const useCardStyles = (isCategory: boolean) => {
  const board = useOptionalBoard();
  const appOpacity = board?.appOpacity ?? 100;
  return createStyles(({ colorScheme }, _params) => {
    const opacity = appOpacity / 100;

    if (colorScheme === 'dark') {
      if (isCategory) {
        return {
          card: {
            backgroundColor: `rgba(32, 33, 35, ${opacity}) !important`,
            borderColor: `rgba(37, 38, 43, ${opacity})`,
          },
        };
      }

      return {
        card: {
          backgroundColor: `rgba(37, 38, 43, ${opacity}) !important`,
          borderColor: `rgba(37, 38, 43, ${opacity})`,
        },
      };
    }

    return {
      card: {
        backgroundColor: `rgba(255, 255, 255, ${opacity}) !important`,
        borderColor: `rgba(233, 236, 239, ${opacity})`,
      },
    };
  })();
};
