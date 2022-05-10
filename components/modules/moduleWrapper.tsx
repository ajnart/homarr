import { Card, FloatingTooltip, Tooltip, useMantineTheme } from '@mantine/core';
import { IModule } from './modules';

export default function ModuleWrapper(props: any) {
  const { module }: { module: IModule } = props;
  const theme = useMantineTheme();
  console.log(module.title);
  return (
    <Card
      mx="sm"
      radius="lg"
      shadow="sm"
      style={{
        // Make background color of the card depend on the theme
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : "white",
      }}
    >
      {<module.component />}
    </Card>
  );
}
