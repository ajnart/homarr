import { Group } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { CalendarModule, DateModule, TotalDownloadsModule, WeatherModule } from '../modules';
import { DashdotModule } from '../modules/dash.';
import { ModuleWrapper } from '../modules/moduleWrapper';

export default function Widgets(props: any) {
  return (
    <Group my="sm" grow direction="column" style={{ width: 300 }}>
      <ModuleWrapper module={CalendarModule} />
      <ModuleWrapper module={TotalDownloadsModule} />
      <ModuleWrapper module={WeatherModule} />
      <ModuleWrapper module={DateModule} />
      <ModuleWrapper module={DashdotModule} />
    </Group>
  );
}
