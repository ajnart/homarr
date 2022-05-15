import { Aside as MantineAside, Group } from '@mantine/core';
import { CalendarModule } from '../modules/calendar/CalendarModule';
import ModuleWrapper from '../modules/moduleWrapper';

export default function Aside() {
  return (
    <MantineAside
      height="100%"
      hiddenBreakpoint="md"
      hidden
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
