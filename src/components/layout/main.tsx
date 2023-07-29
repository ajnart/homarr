import { AppShell, clsx, useMantineTheme } from '@mantine/core';
import { useConfigContext } from '~/config/provider';

import { Background } from './Background';
import { Head } from './Meta/Head';
import { MainHeader } from './new-header/Header';

type MainLayoutProps = {
  headerActions?: React.ReactNode;
  children: React.ReactNode;
};

export const MainLayout = ({ headerActions, children }: MainLayoutProps) => {
  const { config } = useConfigContext();
  const theme = useMantineTheme();

  return (
    <AppShell
      styles={{
        root: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
        },
      }}
      header={<MainHeader headerActions={headerActions} />}
      className="dashboard-app-shell"
    >
      <Head />
      <Background />
      {children}
      <style>{clsx(config?.settings.customization.customCss)}</style>
    </AppShell>
  );
};
