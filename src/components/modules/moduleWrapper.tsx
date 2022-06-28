import {
  Button,
  Card,
  Group,
  Menu,
  MultiSelect,
  Switch,
  TextInput,
  useMantineColorScheme,
} from '@mantine/core';
import { useConfig } from '../../tools/state';
import { IModule } from './modules';

function getItems(module: IModule) {
  const { config, setConfig } = useConfig();
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
      if (type === 'object') {
        items.push(
          <MultiSelect
            label={module.options?.[keys[index]].name}
            data={module.options?.[keys[index]].options ?? []}
            defaultValue={(moduleInConfig?.options?.[keys[index]]?.value as string[]) ?? []}
            clearable
            searchable
            onChange={(value) => {
              setConfig({
                ...config,
                modules: {
                  ...config.modules,
                  [module.title]: {
                    ...moduleInConfig,
                    options: {
                      ...moduleInConfig?.options,
                      [keys[index]]: {
                        ...moduleInConfig?.options?.[keys[index]],
                        value,
                      },
                    },
                  },
                },
              });
            }}
          />
        );
      }
      if (type === 'string') {
        items.push(
          <form
            onSubmit={(e) => {
              e.preventDefault();
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
                        value: (e.target as any)[0].value,
                      },
                    },
                  },
                },
              });
            }}
          >
            <Group noWrap align="end" position="center" mt={0}>
              <TextInput
                key={optionName}
                id={optionName}
                name={optionName}
                label={values[index].name}
                defaultValue={(moduleInConfig?.options?.[keys[index]]?.value as string) ?? ''}
                onChange={(e) => {}}
              />

              <Button type="submit">Save</Button>
            </Group>
          </form>
        );
      }
      // TODO: Add support for other types
      if (type === 'boolean') {
        items.push(
          <Switch
            defaultChecked={
              // Set default checked to the value of the option if it exists
              (moduleInConfig?.options?.[keys[index]]?.value as boolean) ?? false
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
  return items;
}

export function ModuleWrapper(props: any) {
  const { module }: { module: IModule } = props;
  const { colorScheme } = useMantineColorScheme();
  const { config, setConfig } = useConfig();
  const enabledModules = config.modules ?? {};
  // Remove 'Module' from enabled modules titles
  const isShown = enabledModules[module.title]?.enabled ?? false;

  if (!isShown) {
    return null;
  }

  return (
    <Card
      {...props}
      hidden={!isShown}
      withBorder
      radius="lg"
      shadow="sm"
      style={{
        background: `rgba(${colorScheme === 'dark' ? '37, 38, 43,' : '255, 255, 255,'} \
          ${(config.settings.appOpacity || 100) / 100}`,
        borderColor: `rgba(${colorScheme === 'dark' ? '37, 38, 43,' : '233, 236, 239,'} \
          ${(config.settings.appOpacity || 100) / 100}`,
      }}
    >
      <ModuleMenu
        module={module}
        styles={{
          root: {
            position: 'absolute',
            top: 12,
            right: 12,
          },
        }}
      />
      <module.component />
    </Card>
  );
}

export function ModuleMenu(props: any) {
  const { module, styles } = props;
  const items: JSX.Element[] = getItems(module);
  return (
    <>
      {module.options && (
        <Menu
          size="lg"
          shadow="xl"
          closeOnItemClick={false}
          radius="md"
          position="left"
          styles={{
            root: {
              ...props?.styles?.root,
            },
            body: {
              // Add shadow and elevation to the body
              boxShadow: '0 0 14px 14px rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          <Menu.Label>Settings</Menu.Label>
          {items.map((item) => (
            <Menu.Item key={item.key}>{item}</Menu.Item>
          ))}
        </Menu>
      )}
    </>
  );
}
