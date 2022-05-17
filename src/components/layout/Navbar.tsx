import { Group, Navbar as MantineNavbar } from '@mantine/core';
import { WeatherModule, DateModule, ModuleWrapper } from '../modules';

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
      </Group>
      <ModuleWrapper module={WeatherModule} />
      <ModuleWrapper module={WeatherModule} />
    </MantineNavbar>
  );
}
