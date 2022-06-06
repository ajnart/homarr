import { Aside as MantineAside, createStyles, Group } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  WeatherModule,
  DateModule,
  CalendarModule,
  TotalDownloadsModule,
  SystemModule,
} from '../modules';
import { ModuleWrapper } from '../modules/moduleWrapper';

const useStyles = createStyles((theme) => ({
  hide: {
    [theme.fn.smallerThan('xs')]: {
      display: 'none',
    },
  },
  burger: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },
}));

export default function Aside(props: any) {
  const { classes, cx } = useStyles();
  const matches = useMediaQuery('(min-width: 800px)');

  return (
    <MantineAside
      pr="md"
      hiddenBreakpoint="sm"
      hidden
      className={cx(classes.hide)}
      style={{
        border: 'none',
      }}
      width={{
        base: 'auto',
      }}
    >
      {matches && (
        <Group my="sm" grow direction="column" style={{ width: 300 }}>
          <ModuleWrapper module={CalendarModule} />
          <ModuleWrapper module={TotalDownloadsModule} />
          <ModuleWrapper module={WeatherModule} />
          <ModuleWrapper module={DateModule} />
          <ModuleWrapper module={SystemModule} />
        </Group>
      )}
    </MantineAside>
  );
}
