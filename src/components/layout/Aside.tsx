import { Aside as MantineAside, Group } from '@mantine/core';
import { DateModule } from '../modules';
import { CalendarModule } from '../modules/calendar/CalendarModule';
import ModuleWrapper from '../modules/moduleWrapper';

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
      </Group>
    </MantineAside>
  );
}
