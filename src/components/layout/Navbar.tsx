import { Group, Navbar as MantineNavbar } from '@mantine/core';
import { WeatherModule, DateModule } from '../modules';
import { ModuleWrapper } from '../modules/moduleWrapper';

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
      <Group mt="sm" direction="column" align="center">
        <ModuleWrapper module={DateModule} />
        <ModuleWrapper module={WeatherModule} />
        <ModuleWrapper module={WeatherModule} />
      </Group>
    </MantineNavbar>
  );
}
