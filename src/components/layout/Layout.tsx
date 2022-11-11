import { AppShell, createStyles } from '@mantine/core';
import { Header } from './header/Header';
import { Footer } from './Footer';
import Aside from './Aside';
import Navbar from './Navbar';
import { HeaderConfig } from './header/HeaderConfig';
import { Background } from './Background';
import { useConfig } from '../../tools/state';

const useStyles = createStyles((theme) => ({
  main: {},
  appShell: {
    // eslint-disable-next-line no-useless-computed-key
    ['@media screen and (display-mode: standalone)']: {
      '&': {
        paddingTop: '88px !important',
      },
    },
  },
}));

export default function Layout({ children, style }: any) {
  const { classes, cx } = useStyles();
  const { config } = useConfig();
  const widgetPosition = config?.settings?.widgetPosition === 'left';

  return (
    <AppShell
      fixed={false}
      header={<Header />}
      navbar={widgetPosition ? <Navbar /> : undefined}
      aside={widgetPosition ? undefined : <Aside />}
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
      <style>{cx(config.settings.customCSS)}</style>
    </AppShell>
  );
}
