import { AppShell, createStyles, Group } from '@mantine/core';
import { Header } from './Header';
import { Footer } from './Footer';
import Aside from './Aside';
import { ModuleWrapper } from '../modules/moduleWrapper';
import {
  CalendarModule,
  TotalDownloadsModule,
  WeatherModule,
  DateModule,
  SystemModule,
} from '../modules';

const useStyles = createStyles((theme) => ({
  main: {},
}));

export default function Layout({ children, style }: any) {
  const drawerContent = (
    <Group my="sm" grow direction="column" style={{ width: 300 }}>
      <ModuleWrapper module={CalendarModule} />
      <ModuleWrapper module={TotalDownloadsModule} />
      <ModuleWrapper module={WeatherModule} />
      <ModuleWrapper module={DateModule} />
      <ModuleWrapper module={SystemModule} />
    </Group>
  );
  const { classes, cx } = useStyles();
  return (
    <AppShell
      aside={<Aside />}
      header={<Header data={drawerContent} />}
      footer={<Footer links={[]} />}
    >
      <main
        className={cx(classes.main)}
        style={{
          ...style,
        }}
      >
        {children}
      </main>
    </AppShell>
  );
}
