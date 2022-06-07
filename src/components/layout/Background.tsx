import { Global } from '@mantine/core';
import { useConfig } from '../../tools/state';

export function Background() {
  const { config } = useConfig();

  return (
    <Global
      styles={{
        body: {
          backgroundImage: `url('${config.settings.background}')` || '',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        },
      }}
    />
  );
}
