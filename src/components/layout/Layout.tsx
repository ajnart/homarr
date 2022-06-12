import { AppShell, createStyles } from '@mantine/core';
import { Header } from './Header';
import { Footer } from './Footer';
import Aside from './Aside';
import Navbar from './Navbar';
import { HeaderConfig } from './HeaderConfig';
import { Background } from './Background';
import { useConfig } from '../../tools/state';

const useStyles = createStyles((theme) => ({
  main: {},
}));

export default function Layout({ children, style }: any) {
  const { classes, cx } = useStyles();
  const { config } = useConfig();
  const widgetPosition = config?.settings?.widgetPosition === 'left';

  return (
    <AppShell
      header={<Header />}
      navbar={widgetPosition ? <Navbar /> : <></>}
      aside={widgetPosition ? <></> : <Aside />}
      footer={<Footer links={[]} />}
    >
      <HeaderConfig />
      <Background />
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
