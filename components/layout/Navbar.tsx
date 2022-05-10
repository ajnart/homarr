import { Navbar as MantineNavbar } from '@mantine/core';
import { DateModule } from '../modules/date/DateModule';
import ModuleWrapper from '../modules/moduleWrapper';

export default function Navbar() {
  return (
    <MantineNavbar
      height="100%"
      hiddenBreakpoint="md"
      hidden
      width={{
        base: 'auto',
      }}
    >
      <ModuleWrapper module={DateModule} />
    </MantineNavbar>
  );
}
