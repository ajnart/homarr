import { AppShell, useMantineTheme } from '@mantine/core';
import { MainHeader } from '~/components/layout/header/Header';

type MainLayoutProps = {
  showExperimental?: boolean;
  headerActions?: React.ReactNode;
  contentComponents?: React.ReactNode;
  children: React.ReactNode;
};

export const MainLayout = ({ showExperimental, headerActions, contentComponents, children }: MainLayoutProps) => {
  const theme = useMantineTheme();

  return (
    <AppShell
      styles={{
        root: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
        },
      }}
      header={<MainHeader headerActions={headerActions} contentComponents={contentComponents} showExperimental={showExperimental} />}
      className="dashboard-app-shell"
    >
      {children}
    </AppShell>
  );
};
