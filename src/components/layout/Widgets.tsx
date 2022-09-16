import { Stack } from '@mantine/core';
import { CalendarModule, DateModule, TotalDownloadsModule, WeatherModule } from '../../modules';
import { DashdotModule } from '../../modules/dashdot';
import { ModuleWrapper } from '../../modules/moduleWrapper';

export default function Widgets(props: any) {
  return (
    <Stack my={16} style={{ width: 300 }}>
      <ModuleWrapper module={CalendarModule} />
      <ModuleWrapper module={TotalDownloadsModule} />
      <ModuleWrapper module={WeatherModule} />
      <ModuleWrapper module={DateModule} />
      <ModuleWrapper module={DashdotModule} />
    </Stack>
  );
}
