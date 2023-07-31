import { AppShell, useMantineTheme } from '@mantine/core';

import { MainHeader } from '../Header/Header';
import { Head } from '../Meta/Head';

type MainLayoutProps = {
  headerActions?: React.ReactNode;
  children: React.ReactNode;
};

export const MainLayout = ({ headerActions, children }: MainLayoutProps) => {
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
      {children}
    </AppShell>
  );
};
