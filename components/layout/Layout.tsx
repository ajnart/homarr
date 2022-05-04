import { AppShell, Aside, Center, createStyles } from '@mantine/core';
import { Header } from './Header';
import { Footer } from './Footer';
import CalendarComponent from '../calendar/CalendarComponent';

const useStyles = createStyles((theme) => ({
  main: {
    [theme.fn.largerThan('md')]: {
      width: 1200,
    },
  },
}));

export default function Layout({ children, style }: any) {
  const { classes, cx } = useStyles();
  return (
    <AppShell
      aside={
        <Aside
          height="auto"
          hiddenBreakpoint="md"
          hidden
          width={{
            base: 'auto',
          }}
        >
          <CalendarComponent />
        </Aside>
      }
      header={<Header links={[]} />}
      footer={<Footer links={[]} />}
    >
      <Center>
        <main
          // className={cx(classes.main)}
          style={{
            ...style,
          }}
        >
          {children}
        </main>
      </Center>
    </AppShell>
  );
}
