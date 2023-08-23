import { Button, Group, MultiSelect, Stack, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

import { queryClient } from '../../../tools/server/configurations/tanstack/queryClient.tool';
import { useTranslation } from 'react-i18next';

export function CacheButtons() {
  const [value, setValue] = useState<string[]>([]);

  const { t } = useTranslation('settings/general/cache-buttons')

  const data = [
    { value: 'ping', label: t('selector.data.ping') },
    { value: 'repository-icons', label: t('selector.data.repositoryIcons') },
    { value: 'calendar/medias', label: t('selector.data.calendar&medias') },
    { value: 'weather', label: t('selector.data.weather') },
  ];

  return (
    <Stack spacing="xs">
      <Title order={4}>{t('title')}</Title>
      <MultiSelect
        value={value}
        searchable
        onChange={setValue}
        data={data}
        label={t('selector.label')}
      />
      <Group>
        <Button
          color="red"
          variant="light"
          onClick={() =>
            queryClient.invalidateQueries(value).then(() =>
              notifications.show({
                title: t('buttons.notificationTitle'),
                message:
                  value.length > 1 ?
                  t('buttons.clearSelect.notificationMessageMulti', {values: value.join(', ')}) :
                  t('buttons.clearSelect.notificationMessageSingle', {value: value[0]}),
                color: 'teal',
                icon: <IconTrash />,
                autoClose: 5000,
              })
            )
          }
        >
          {t('buttons.clearSelect.text')}
        </Button>
        <Button
          onClick={() =>
            queryClient.invalidateQueries().then(() =>
              notifications.show({
                title: t('buttons.notificationTitle'),
                message: t('buttons.clearAll.notificationMessage'),
                color: 'teal',
                icon: <IconTrash />,
                autoClose: 5000,
              })
            )
          }
        >
          {t('buttons.clearAll.text')}
        </Button>
      </Group>
    </Stack>
  );
}
