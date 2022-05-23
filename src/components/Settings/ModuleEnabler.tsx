import { Group, Switch } from '@mantine/core';
import * as Modules from '../modules';
import { useConfig } from '../../tools/state';

export default function ModuleEnabler(props: any) {
  const { config, setConfig } = useConfig();
  const modules = Object.values(Modules).map((module) => module);
  return (
    <Group direction="column">
      {modules.map((module) => (
        <Switch
          key={module.title}
          size="md"
          checked={config.modules?.[module.title]?.enabled ?? false}
          label={`Enable ${module.title} module`}
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
    </Group>
  );
}
