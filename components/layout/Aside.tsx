import { Aside as MantineAside } from '@mantine/core';
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
      <ModuleWrapper module={CalendarModule} />
    </MantineAside>
  );
}
