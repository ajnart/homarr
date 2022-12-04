import { createStyles } from '@mantine/core';
import { useConfigContext } from '../../config/provider';

export const useCardStyles = () => {
  const { config } = useConfigContext();
  const appOpacity = config?.settings.customization.appOpacity;
  return createStyles(({ colorScheme }, _params) => {
    const opacity = (appOpacity || 100) / 100;
    return {
      card: {
        backgroundColor:
          colorScheme === 'dark'
            ? `rgba(37, 38, 43, ${opacity}) !important`
            : `rgba(255, 255, 255, ${opacity}) !important`,
        borderColor:
          colorScheme === 'dark'
            ? `rgba(37, 38, 43, ${opacity})`
            : `rgba(233, 236, 239, ${opacity})`,
      },
    };
  })();
};
