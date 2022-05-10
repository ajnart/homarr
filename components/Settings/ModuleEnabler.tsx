import { Group, Switch } from '@mantine/core';
import * as Modules from '../modules';
import { useConfig } from '../../tools/state';

export default function ModuleEnabler(props: any) {
  const { config, setConfig } = useConfig();
  // Loop over each module with their title
  const modules = Object.keys(Modules);
  // Match the enabled modules with the modules array
  let enabledModules = config.settings.enabledModules ?? [];
  enabledModules = modules.filter((module) => enabledModules.includes(module));
  return (
    <Group direction="column">
      {modules.map((module: string) => (
        <Switch
          key={module}
          size="md"
          checked={enabledModules.includes(module)}
          label={`Enable ${module.replace('Module', '')} module`}
          onChange={(e) => {
            if (e.currentTarget.checked) {
              setConfig({
                ...config,
                settings: {
                  ...config.settings,
                  enabledModules: [...enabledModules, module],
                },
              });
            } else {
              setConfig({
                ...config,
                settings: {
                  ...config.settings,
                  enabledModules: enabledModules.filter((m) => m !== module),
                },
              });
            }
          }}
        />
      ))}
    </Group>
  );
}
