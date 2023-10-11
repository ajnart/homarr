import { Alert, Divider, Tabs, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Trans, useTranslation } from 'next-i18next';
import { AppType } from '~/types/app';

import { AppForm } from '../../EditAppModal';
import { IntegrationSelector } from './InputElements/IntegrationSelector';
import { IntegrationOptionsRenderer } from './IntegrationOptionsRenderer/IntegrationOptionsRenderer';

interface IntegrationTabProps {
  form: AppForm;
}

export const IntegrationTab = ({ form }: IntegrationTabProps) => {
  return <></>; /*
  const { t } = useTranslation('layout/modals/add-app');
  const hasIntegrationSelected = form.values.integrationId?.type;

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
  );*/
};
