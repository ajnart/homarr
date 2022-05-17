import { Aside as MantineAside, Group } from '@mantine/core';
import { WeatherModule, DateModule, ModuleWrapper, CalendarModule } from '../modules';

export default function Aside(props: any) {
  return (
    <MantineAside
      hiddenBreakpoint="md"
      hidden
      style={{
        border: 'none',
      }}
      width={{
        base: 'auto',
      }}
    >
      <Group mt="sm" grow direction="column">
        <ModuleWrapper module={CalendarModule} />
        <ModuleWrapper module={DateModule} />
        <ModuleWrapper module={WeatherModule} />
      </Group>
    </MantineAside>
  );
}
