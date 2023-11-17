import { AppShell, useMantineTheme } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { MainHeader } from '~/components/layout/header/Header';

type MainLayoutProps = {
  showExperimental?: boolean;
  headerActions?: React.ReactNode;
  contentComponents?: React.ReactNode;
  children: React.ReactNode;
  autoFocusSearch?: boolean;
};

export const MainLayout = ({
  showExperimental,
  headerActions,
  contentComponents,
  children,
  autoFocusSearch,
}: MainLayoutProps) => {
  const theme = useMantineTheme();
  const colorScheme = useColorScheme();

  return (
    <AppShell
      styles={{
        root: {
          background: colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
        },
      }}
      className="dashboard-app-shell"
    >
      <AppShell.Header>
        <MainHeader
          autoFocusSearch={autoFocusSearch}
          headerActions={headerActions}
          contentComponents={contentComponents}
          showExperimental={showExperimental}
        />
      </AppShell.Header>
      {children}
    </AppShell>
  );
};
