import { Button, Group, MultiSelect, Stack, Title } from '@mantine/core';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { IconTrash } from '@tabler/icons-react';
import { queryClient } from '../../../tools/server/configurations/tanstack/queryClient.tool';

const data = [
  { value: 'ping', label: 'Ping queries' },
  { value: 'repository-icons', label: 'Remote/Local icons' },
  { value: 'calendar/medias', label: 'Medais from the Calendar' },
  { value: 'weather', label: 'Weather data' },
];

export function CacheButtons() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <Stack spacing="xs">
      <Title order={4}>Cache cleaning</Title>
      <MultiSelect
        value={value}
        searchable
        onChange={setValue}
        data={data}
        label="Select the cache(s) to clear"
      />
      <Group>
        <Button
          color="red"
          variant="light"
          onClick={() =>
            queryClient.invalidateQueries(value).then(() =>
              notifications.show({
                title: 'Cache cleared',
                message: `Cache for ${value.join(', ')} has been cleared`,
                color: 'teal',
                icon: <IconTrash />,
                autoClose: 5000,
              })
            )
          }
        >
          Clear selected queries
        </Button>
        <Button
          onClick={() =>
            queryClient.invalidateQueries().then(() =>
              notifications.show({
                title: 'Cache cleared',
                message: 'All cache has been cleared',
                color: 'teal',
                icon: <IconTrash />,
                autoClose: 5000,
              })
            )
          }
        >
          Clear all cache
        </Button>
      </Group>
    </Stack>
  );
}
