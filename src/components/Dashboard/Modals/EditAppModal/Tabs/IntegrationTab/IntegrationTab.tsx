import { Alert, Divider, Tabs, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Trans, useTranslation } from 'next-i18next';
import { AppType } from '~/types/app';

import { IntegrationSelector } from './Components/InputElements/IntegrationSelector';
import { IntegrationOptionsRenderer } from './Components/IntegrationOptionsRenderer/IntegrationOptionsRenderer';

interface IntegrationTabProps {
  form: UseFormReturnType<AppType, (values: AppType) => AppType>;
}

export const IntegrationTab = ({ form }: IntegrationTabProps) => {
  const { t } = useTranslation('layout/modals/add-app');
  const hasIntegrationSelected = form.values.integration?.type;

  return (
    <Tabs.Panel value="integration" pt="lg">
      <IntegrationSelector form={form} />

      {hasIntegrationSelected && (
        <>
          <Divider label={t('integration.type.label')} labelPosition="center" mt="xl" mb="md" />
          <Text size="sm" color="dimmed" mb="lg">
            {t('integration.secrets.description')}
          </Text>
          <IntegrationOptionsRenderer form={form} />
          <Alert icon={<IconAlertTriangle />} color="yellow">
            <Text>
              <Trans i18nKey="layout/modals/add-app:integration.secrets.warning" />
            </Text>
          </Alert>
        </>
      )}
    </Tabs.Panel>
  );
};
