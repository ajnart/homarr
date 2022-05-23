import { Card, Menu, Switch, useMantineTheme } from '@mantine/core';
import { useConfig } from '../../tools/state';
import { IModule } from './modules';

export function ModuleWrapper(props: any) {
  const { module }: { module: IModule } = props;
  const { config, setConfig } = useConfig();
  const enabledModules = config.modules ?? {};
  // Remove 'Module' from enabled modules titles
  const isShown = enabledModules[module.title]?.enabled ?? false;
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
      const moduleInConfig = config.modules?.[module.title];
      // TODO: Add support for other types
      if (type === 'boolean') {
        items.push(
          <Switch
            defaultChecked={
              // Set default checked to the value of the option if it exists
              moduleInConfig?.options?.[keys[index]]?.value ?? false
            }
            key={keys[index]}
            onClick={(e) => {
              setConfig({
                ...config,
                modules: {
                  ...config.modules,
                  [module.title]: {
                    ...config.modules[module.title],
                    options: {
                      ...config.modules[module.title].options,
                      [keys[index]]: {
                        ...config.modules[module.title].options?.[keys[index]],
                        value: e.currentTarget.checked,
                      },
                    },
                  },
                },
              });
            }}
            label={values[index].name}
          />
        );
      }
    });
  }
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
