import { Global } from '@mantine/core';

import { useConfigContext } from '../../config/provider';

export function Background() {
  const { config } = useConfigContext();

  if (!config?.settings.customization.backgroundImageUrl) {
    return null;
  }

  return (
    <Global
      styles={{
        body: {
          minHeight: '100vh',
          backgroundImage: `url('${config?.settings.customization.backgroundImageUrl}')`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        },
      }}
    />
  );
}
