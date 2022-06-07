import { AppShell, createStyles } from '@mantine/core';
import { Header } from './Header';
import { Footer } from './Footer';
import Aside from './Aside';
import { HeaderConfig } from './HeaderConfig';

const useStyles = createStyles((theme) => ({
  main: {},
}));

export default function Layout({ children, style }: any) {
  const { classes, cx } = useStyles();
  return (
    <AppShell aside={<Aside />} header={<Header />} footer={<Footer links={[]} />}>
      <HeaderConfig />
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
