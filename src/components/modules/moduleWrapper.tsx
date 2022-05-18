import { Card, Menu, Switch, useMantineTheme } from '@mantine/core';
import { useConfig } from '../../tools/state';
import { IModule } from './modules';

export function ModuleWrapper(props: any) {
  const { module }: { module: IModule } = props;
  const { config, setConfig } = useConfig();
  const enabledModules = config.settings.enabledModules ?? [];
  // Remove 'Module' from enabled modules titles
  const isShown = enabledModules.includes(module.title);
  const theme = useMantineTheme();
  const items: JSX.Element[] = [];
  if (module.options) {
    const keys = Object.keys(module.options);
    const values = Object.values(module.options);
    // Get the value and the name of the option
    const types = values.map((v) => typeof v.value);
    // Loop over all the types with a for each loop
    types.forEach((type, index) => {
      const optionName = `${module.title}.${keys[index]}`;
      // TODO: Add support for other types
      if (type === 'boolean') {
        items.push(
          <Switch
            defaultChecked={
              // Set default checked to the value of the option if it exists
              config.settings[optionName] ??
              (module.options && module.options[keys[index]].value) ??
              false
            }
            defaultValue={config.settings[optionName] ?? false}
            key={keys[index]}
            onClick={(e) => {
              setConfig({
                ...config,
                settings: {
                  ...config.settings,
                  enabledModules: [...config.settings.enabledModules],
                  [optionName]: e.currentTarget.checked,
                },
              });
            }}
            label={values[index].name}
          />
        );
      }
    });
  }
  // Sussy baka
  if (!isShown) {
    return null;
  }
  return (
    <Card hidden={!isShown} mx="sm" withBorder radius="lg" shadow="sm">
      {module.options && (
        <Menu
          size="md"
          shadow="xl"
          closeOnItemClick={false}
          radius="md"
          position="left"
          styles={{
            root: {
              position: 'absolute',
              top: 15,
              right: 15,
            },
            body: {
              backgroundColor:
                theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
            },
          }}
        >
          <Menu.Label>Settings</Menu.Label>
          {items.map((item) => (
            <Menu.Item key={item.key}>{item}</Menu.Item>
          ))}
        </Menu>
      )}
      <module.component />
    </Card>
  );
}
