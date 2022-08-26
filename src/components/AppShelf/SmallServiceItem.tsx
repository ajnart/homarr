import { Avatar, Group, Text } from '@mantine/core';

interface smallServiceItem {
  label: string;
  icon?: string;
  url?: string;
}

export default function SmallServiceItem(props: any) {
  const { service }: { service: smallServiceItem } = props;
  // TODO : Use Next/link
  return (
    <Group>
      {service.icon && <Avatar src={service.icon} />}
      <Text>{service.label}</Text>
    </Group>
  );
}
