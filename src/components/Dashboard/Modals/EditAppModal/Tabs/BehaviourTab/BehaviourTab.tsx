import { Text, TextInput, Tooltip, Stack, Switch, Tabs, Group, useMantineTheme, HoverCard } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useTranslation } from 'next-i18next';

import { AppType } from '../../../../../../types/app';
import { InfoCard } from '~/components/InfoCard/InfoCard'

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
        <Stack spacing="0.25rem">
          <Group>
            <Text size="0.875rem" weight={500}>
              {t('behaviour.tooltipDescription.label')}
            </Text>
            <InfoCard message={t('behaviour.tooltipDescription.description')}/>
          </Group>
          <TextInput
            {...form.getInputProps('behaviour.tooltipDescription')}
          />
        </Stack>
      </Stack>
    </Tabs.Panel>
  );
};