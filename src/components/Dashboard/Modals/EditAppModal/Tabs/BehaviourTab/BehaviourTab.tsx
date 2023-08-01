import { Text, TextInput, Tooltip, Stack, Switch, Tabs, Group, useMantineTheme, HoverCard } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

import { AppType } from '../../../../../../types/app';

interface BehaviourTabProps {
  form: UseFormReturnType<AppType, (values: AppType) => AppType>;
}

export const BehaviourTab = ({ form }: BehaviourTabProps) => {
  const { t } = useTranslation('layout/modals/add-app');
  const { primaryColor } = useMantineTheme();

  return (
    <Tabs.Panel value="behaviour" pt="xs">
      <Stack spacing="xs">
        <Switch
          label={t('behaviour.isOpeningNewTab.label')}
          description={t('behaviour.isOpeningNewTab.description')}
          styles={{ label: { fontWeight: 500, }, description: { marginTop: 0, }, }}
          {...form.getInputProps('behaviour.isOpeningNewTab', { type: 'checkbox' })}
        />
        <Group>
        <TextInput placeholder='Your widget description...'
            {...form.getInputProps('behaviour.tooltipDescription')}
          />
        <HoverCard width={280} shadow="md" radius="md">
        <HoverCard.Target>
        <IconAlertCircle size="1.25rem" color={primaryColor} />
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text size="sm">
          {t('behaviour.tooltipDescription.description')}  
          </Text>
        </HoverCard.Dropdown>
      </HoverCard>
      </Group>
      </Stack>
    </Tabs.Panel>
  );
};