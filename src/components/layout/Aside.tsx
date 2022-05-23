import { Aside as MantineAside, Group } from '@mantine/core';
import { WeatherModule, DateModule, CalendarModule, TotalDownloadsModule, SystemModule } from '../modules';
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
      <Group mt="sm" grow direction="column" style={{ width: 300 }}>
        <ModuleWrapper module={CalendarModule} />
        <ModuleWrapper module={TotalDownloadsModule} />
        <ModuleWrapper module={WeatherModule} />
        <ModuleWrapper module={DateModule} />
        <ModuleWrapper module={SystemModule} />
      </Group>
    </MantineAside>
  );
}
