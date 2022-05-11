import { Card, useMantineTheme } from '@mantine/core';
import { useConfig } from '../../tools/state';
import { IModule } from './modules';

export default function ModuleWrapper(props: any) {
  const { module }: { module: IModule } = props;
  const { config } = useConfig();
  const enabledModules = config.settings.enabledModules ?? [];
  // Remove 'Module' from enabled modules titles
  const isShown = enabledModules.includes(module.title);
  const theme = useMantineTheme();
  if (!isShown) {
    return null;
  }
  return (
    <Card
      hidden={!isShown}
      mx="sm"
      radius="lg"
      shadow="sm"
      style={{
        // Make background color of the card depend on the theme
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : 'white',
      }}
    >
      <module.component />
    </Card>
  );
}
