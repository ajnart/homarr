import { Checkbox, Group, SimpleGrid, Title } from '@mantine/core';
import * as Modules from '../../modules';
import { useConfig } from '../../tools/state';

export default function ModuleEnabler(props: any) {
  const { config, setConfig } = useConfig();
  const modules = Object.values(Modules).map((module) => module);
  return (
    <Group direction="column">
      <Title order={4}>Module enabler</Title>
      <SimpleGrid cols={2} spacing="md">
        {modules.map((module) => (
          <Checkbox
            key={module.title}
            size="md"
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
    </Group>
  );
}
