import { Aside as MantineAside, Group } from '@mantine/core';
import { CalendarModule } from '../modules/calendar/CalendarModule';
import ModuleWrapper from '../modules/moduleWrapper';

export default function Aside() {
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
      <Group mt="sm" direction="column">
        <ModuleWrapper module={CalendarModule} />
      </Group>
    </MantineAside>
  );
}
