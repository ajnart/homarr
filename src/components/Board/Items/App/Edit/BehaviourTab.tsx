import { Group, Stack, Switch, Tabs, Text, TextInput } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { InfoCard } from '~/components/InfoCard/InfoCard';

import { type AppForm } from '../EditAppModal';

interface BehaviourTabProps {
  form: AppForm;
}

export const BehaviourTab = ({ form }: BehaviourTabProps) => {
  const { t } = useTranslation('layout/modals/add-app');

  return (
    <Tabs.Panel value="behaviour" pt="lg">
      <Stack spacing="xs">
        <Switch
          label={t('behaviour.isOpeningNewTab.label')}
          description={t('behaviour.isOpeningNewTab.description')}
          styles={{ label: { fontWeight: 500 }, description: { marginTop: 0 } }}
          {...form.getInputProps('openInNewTab', { type: 'checkbox' })}
        />
        <Stack spacing="0.25rem">
          <Group>
            <Text size="0.875rem" weight={500}>
              {t('behaviour.tooltipDescription.label')}
            </Text>
            <InfoCard message={t('behaviour.tooltipDescription.description')} />
          </Group>
          <TextInput {...form.getInputProps('description')} />
        </Stack>
      </Stack>
    </Tabs.Panel>
  );
};
