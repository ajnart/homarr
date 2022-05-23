import { Button } from '@mantine/core';
import { Prism } from '@mantine/prism';
import { useState } from 'react';
import { DateModule } from '../components/modules';
import { useConfig } from '../tools/state';

export default function TryConfig(props: any) {
  const { config } = useConfig();
  const [tempConfig, setTempConfig] = useState(config);
  return (
    <>
      <Prism language="json">{JSON.stringify(tempConfig, null, 2)}</Prism>
      <Button
        onClick={() => {
          setTempConfig({
            ...tempConfig,
            modules: {
              [DateModule.title]: {
                enabled: true,
                title: DateModule.title,
                options: {
                  ...DateModule.options,
                },
              },
            },
          });
        }}
      >
        Add a module to the modules thingy
      </Button>
    </>
  );
}
