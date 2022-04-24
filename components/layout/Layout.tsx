import { AppShell, Center, createStyles } from '@mantine/core';
import { Header } from './Header';
import { Footer } from './Footer';

const useStyles = createStyles((theme) => ({
  main: {
    [theme.fn.smallerThan('md')]: {
      maxWidth: '90vw',
    },
    [theme.fn.largerThan('md')]: {
      width: 1200,
    },
  },
}));

export default function Layout({ children, style }: any) {
  const { classes, cx } = useStyles();
  return (
    <AppShell header={<Header links={[]} />} footer={<Footer links={[]} />}>
      <Center>
        <main
          className={cx(classes.main)}
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
