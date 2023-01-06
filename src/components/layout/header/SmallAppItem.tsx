import { Avatar, Group, Text } from '@mantine/core';

interface smallAppItem {
  label: string;
  icon?: string;
  url?: string;
}

export default function SmallAppItem(props: any) {
  const { app }: { app: smallAppItem } = props;
  return (
    <Group>
      {app.icon && <Avatar src={app.icon} />}
      <Text>{app.label}</Text>
    </Group>
  );
}
