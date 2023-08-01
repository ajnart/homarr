import { Text, TextInput, Tooltip, Stack, Switch, Tabs, Group, useMantineTheme } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

import { AppType } from '../../../../../../types/app';

interface BehaviourTabProps {
  form: UseFormReturnType<AppType, (values: AppType) => AppType>;
}

export const BehaviourTab = ({ form }: BehaviourTabProps) => {
  const { t } = useTranslation('layout/modals/add-app');
  const { colorScheme } = useMantineTheme();

  return (
    <Tabs.Panel value="behaviour" pt="xs">
      <Stack spacing="xs">
        <Switch
          label={t('behaviour.isOpeningNewTab.label')}
          description={t('behaviour.isOpeningNewTab.description')}
          styles={{ label: { fontWeight: 500, }, description: { marginTop: 0, }, }}
          {...form.getInputProps('behaviour.isOpeningNewTab', { type: 'checkbox' })}
        />
        <Stack spacing={0}>
          <Group>
            <Text size="0.875rem" weight={500}>
              {t('behaviour.tooltipDescription.label')}
            </Text>
            <Tooltip.Floating
              label={t('behaviour.tooltipDescription.description')}
              position="right-start"
              c={ colorScheme === 'light' ? "black" : "dark.0" }
              color={ colorScheme === 'light' ? "dark.0" : "dark.6" }
              styles={{ tooltip: { '&': { maxWidth: 300, }, }, }}
              multiline
            >
              <IconAlertCircle size="1.25rem" style={{ display: 'block', opacity: 0.5 }} />
            </Tooltip.Floating>
          </Group>
          <TextInput
            {...form.getInputProps('behaviour.tooltipDescription')}
          />
        </Stack>
      </Stack>
    </Tabs.Panel>
  );
};