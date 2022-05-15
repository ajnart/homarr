import { Group, Navbar as MantineNavbar } from '@mantine/core';
import { DateModule } from '../modules/date/DateModule';
import ModuleWrapper from '../modules/moduleWrapper';

export default function Navbar() {
  return (
    <MantineNavbar
      hiddenBreakpoint="lg"
      hidden
      style={{
        border: 'none',
      }}
      width={{
        base: 'auto',
      }}
    >
      <Group mt="sm" direction="column">
        <ModuleWrapper module={DateModule} />
      </Group>
    </MantineNavbar>
  );
}
