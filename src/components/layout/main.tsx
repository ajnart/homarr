import { AppShell, useMantineTheme } from '@mantine/core';

import { MainHeader } from './new-header/Header';

type MainLayoutProps = {
  children: React.ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  const theme = useMantineTheme();
  return (
    <AppShell
      styles={{
        root: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
        },
      }}
      header={<MainHeader />}
    >
      {children}
    </AppShell>
  );
};
