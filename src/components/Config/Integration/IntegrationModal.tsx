import { Accordion, Modal, Stack, Text, Title, rem } from '@mantine/core';
import { Form, useForm } from '@mantine/form';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { integrationsList } from '~/components/Dashboard/Modals/EditAppModal/Tabs/IntegrationTab/Components/InputElements/IntegrationSelector';
import {
  IntegrationOptionsRenderer,
  IntegrationOptionsRendererNoForm,
} from '~/components/Dashboard/Modals/EditAppModal/Tabs/IntegrationTab/Components/IntegrationOptionsRenderer/IntegrationOptionsRenderer';
import { useConfigContext } from '~/config/provider';
import { AppIntegrationType, AppType, IntegrationType } from '~/types/app';

const ModalTitle = ({ title, description }: { title: string; description: string }) => (
  <div>
    <Title order={3} style={{ marginBottom: 0 }}>
      {title}
    </Title>
    <Text color="dimmed">{description}</Text>
  </div>
);

function IntegrationDisplay({ integration }: { integration: AppIntegrationType }) {
  if (!integration.type) return null;
  return (
    <Accordion.Item value={integration.id}>
      <Accordion.Control>{integration.name}</Accordion.Control>
      <Accordion.Panel>
        <IntegrationOptionsRendererNoForm
          type={integration.type}
          properties={integration.properties}
        />
      </Accordion.Panel>
    </Accordion.Item>
  );
}

interface IntegrationGroupedType {
  type: IntegrationType;
  integration: AppIntegrationType[];
}

// export type IntegrationType =
//   | 'readarr'
//   | 'radarr'
//   | 'sonarr'
//   | 'lidarr'
//   | 'sabnzbd'
//   | 'jellyseerr'
//   | 'overseerr'
//   | 'deluge'
//   | 'qBittorrent'
//   | 'transmission'
//   | 'plex'
//   | 'jellyfin'
//   | 'nzbGet'
//   | 'pihole'
//   | 'adGuardHome';
export function IntegrationsAccordion() {
  const { config } = useConfigContext();

  console.log(config.integrations);
  if (!config.integrations) {
    config.integrations = [];
  }

  // Fill configIntegrationList with config.integrations in the
  const configIntegrationList: IntegrationGroupedType[] = [];
  config.integrations.forEach((configIntegration) => {
    const existingIntegration = configIntegrationList.find(
      (integration) => integration.type === configIntegration.type
    );
    if (existingIntegration) {
      existingIntegration.integration.push(configIntegration);
    } else {
      configIntegrationList.push({
        type: configIntegration.type!,
        integration: [configIntegration],
      });
    }
  });

  return (
    <Accordion variant="separated" multiple>
      {configIntegrationList.map((configIntegration) => {
        // Match configIntegration with integrationsList
        const integration = integrationsList.find(
          (integration) => integration.value === configIntegration.type
        );
        if (!integration) {
          return null;
        }
        return (
          <Accordion.Item value={integration.label ?? integration.value} key={integration.value}>
            <Accordion.Control
              icon={
                <Image
                  src={integration.image}
                  width={24}
                  height={24}
                  alt={integration.label ?? integration.value}
                />
              }
            >
              {integration.label ?? integration.value}
            </Accordion.Control>
            <Accordion.Panel>
              <Accordion variant="contained" radius="md" multiple>
                {configIntegration.integration.map((item) => (
                  <IntegrationDisplay integration={item} />
                ))}
              </Accordion>
            </Accordion.Panel>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}

export function IntegrationModal({
  opened,
  closeModal,
}: {
  opened: boolean;
  closeModal: () => void;
}) {
  const { t } = useTranslation('settings/integrations');
  return (
    <Modal
      title={<ModalTitle title={t('title')} description={t('description')} />}
      opened={opened}
      onClose={() => closeModal()}
      size={rem(1000)}
    >
      <IntegrationsAccordion />
    </Modal>
  );
}
