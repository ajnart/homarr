import { createStyles } from '@mantine/core';
import { useConfigContext } from '~/config/provider';

export const useCardStyles = (isCategory: boolean) => {
  const { config } = useConfigContext();
  const appOpacity = config?.settings.customization.appOpacity;
  return createStyles(({ colorScheme }, _params) => {
    const opacity = (appOpacity || 100) / 100;

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
