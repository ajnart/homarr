import { Alert, Divider, Tabs, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconAlertTriangle } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { ServiceType } from '../../../../../../types/service';
import { IntegrationSelector } from './Components/InputElements/IntegrationSelector';
import { IntegrationOptionsRenderer } from './Components/IntegrationOptionsRenderer/IntegrationOptionsRenderer';

interface IntegrationTabProps {
  form: UseFormReturnType<ServiceType, (values: ServiceType) => ServiceType>;
}

export const IntegrationTab = ({ form }: IntegrationTabProps) => {
  const { t } = useTranslation('');
  const hasIntegrationSelected =
    form.values.integration && Object.keys(form.values.integration.properties).length;

  return (
    <Tabs.Panel value="integration" pt="lg">
      <IntegrationSelector form={form} />

      {hasIntegrationSelected && (
        <>
          <Divider label="Integration Configuration" labelPosition="center" mt="xl" mb="md" />
          <IntegrationOptionsRenderer form={form} />
          <Alert icon={<IconAlertTriangle />} color="yellow">
            <Text>
              Please note that Homarr removes secrets from the configuration for security reasons.
              Thus, you can only either define or unset any credentials. Your credentials act as the
              main access for your integrations and you should <b>never</b> share them with anybody
              else. Make sure to <b>store and manage your secrets safely</b>.
            </Text>
          </Alert>
        </>
      )}
    </Tabs.Panel>
  );
};
