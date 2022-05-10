import { Aside as MantineAside, Space } from '@mantine/core';
import CalendarComponent, { CalendarModule } from '../modules/calendar/CalendarModule';
import DateComponent from '../modules/date/DateModule';
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
