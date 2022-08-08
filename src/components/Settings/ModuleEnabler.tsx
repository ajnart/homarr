import { Checkbox, SimpleGrid, Stack, Title } from '@mantine/core';
import * as Modules from '../../modules';
import { useConfig } from '../../tools/state';

export default function ModuleEnabler(props: any) {
  const { config, setConfig } = useConfig();
  const modules = Object.values(Modules).map((module) => module);
  return (
    <Stack>
      <Title order={4}>Module enabler</Title>
      <SimpleGrid cols={3} spacing="xs">
        {modules.map((module) => (
          <Checkbox
            key={module.title}
            size="lg"
            style={{ cursor: 'pointer' }}
            checked={config.modules?.[module.title]?.enabled ?? false}
            label={`${module.title}`}
            onChange={(e) => {
              setConfig({
                ...config,
                modules: {
                  ...config.modules,
                  [module.title]: {
                    ...config.modules?.[module.title],
                    enabled: e.currentTarget.checked,
                  },
                },
              });
            }}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
