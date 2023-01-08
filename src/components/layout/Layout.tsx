import { AppShell, createStyles } from '@mantine/core';
import { useConfigContext } from '../../config/provider';
import { Background } from './Background';
import { Header } from './header/Header';
import { Head } from './header/Meta/Head';

const useStyles = createStyles(() => ({}));

export default function Layout({ children }: any) {
  const { cx } = useStyles();
  const { config } = useConfigContext();

  return (
    <AppShell
      fixed={false}
      header={<Header />}
      styles={{
        main: {
          minHeight: 'calc(100vh - var(--mantine-header-height))',
        },
      }}
    >
      <Head />
      <Background />
      {children}
      <style>{cx(config?.settings.customization.customCss)}</style>
    </AppShell>
  );
}
