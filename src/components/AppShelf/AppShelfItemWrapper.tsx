import { useMantineTheme, Card } from '@mantine/core';

export function AppShelfItemWrapper(props: any) {
  const { children, hovering } = props;
  const theme = useMantineTheme();
  return (
    <Card
      style={{
        boxShadow: hovering ? '0px 0px 3px rgba(0, 0, 0, 0.5)' : '0px 0px 1px rgba(0, 0, 0, 0.5)',
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],

        //TODO: #3 Fix this temporary fix and make the width and height dynamic / responsive
        width: 200,
        height: 180,
      }}
      radius="md"
    >
      {children}
    </Card>
  );
}
