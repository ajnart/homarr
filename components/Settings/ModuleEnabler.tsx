import { Group, Switch } from '@mantine/core';
import * as Modules from '../modules';
import { useConfig } from '../../tools/state';

export default function ModuleEnabler(props: any) {
  const { config, setConfig } = useConfig();
  const modules = Object.values(Modules).map((module) => module);
  const enabledModules = config.settings.enabledModules ?? [];
  modules.filter((module) => enabledModules.includes(module.title));
  return (
    <Group direction="column">
      {modules.map((module) => (
        <Switch
          key={module.title}
          size="md"
          checked={enabledModules.includes(module.title)}
          label={`Enable ${module.title} module`}
          onChange={(e) => {
            if (e.currentTarget.checked) {
              setConfig({
                ...config,
                settings: {
                  ...config.settings,
                  enabledModules: [...enabledModules, module.title],
                },
              });
            } else {
              setConfig({
                ...config,
                settings: {
                  ...config.settings,
                  enabledModules: enabledModules.filter((m) => m !== module.title),
                },
              });
            }
          }}
        />
      ))}
    </Group>
  );
}
