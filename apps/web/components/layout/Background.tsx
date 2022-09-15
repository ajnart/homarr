import { Global } from '@mantine/core';
import { useConfig } from '../../lib/state';

export function Background() {
  const { config } = useConfig();

  return (
    <Global
      styles={{
        body: {
          minHeight: '100vh',
          backgroundImage: `url('${config.settings.background}')` || '',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        },
      }}
    />
  );
}
