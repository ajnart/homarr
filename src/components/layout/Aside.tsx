import { Aside as MantineAside, Group } from '@mantine/core';
import { WeatherModule, DateModule, CalendarModule } from '../modules';
import { ModuleWrapper } from '../modules/moduleWrapper';

export default function Aside(props: any) {
  return (
    <MantineAside
      pr="md"
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
