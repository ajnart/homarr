import {
  Accordion,
  Loader,
  Menu,
  Modal,
  PasswordInput,
  Stack,
  Text,
  Title,
  rem,
} from '@mantine/core';
import { Form, useForm } from '@mantine/form';
import { modals, openModal } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconPlugConnected } from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { getCookie, getCookies, setCookie } from 'cookies-next';
import Image from 'next/image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { integrationsList } from '~/components/Dashboard/Modals/EditAppModal/Tabs/IntegrationTab/Components/InputElements/IntegrationSelector';
import {
  IntegrationOptionsRenderer,
  IntegrationOptionsRendererNoForm,
} from '~/components/Dashboard/Modals/EditAppModal/Tabs/IntegrationTab/Components/IntegrationOptionsRenderer/IntegrationOptionsRenderer';
import { useConfigContext } from '~/config/provider';
import { AppIntegrationType, AppType, IntegrationType } from '~/types/app';
import { api } from '~/utils/api';

const ModalTitle = ({ title, description }: { title: string; description: string }) => (
  <div>
    <Title order={3} style={{ marginBottom: 0 }}>
      {title}
    </Title>
    <Text color="dimmed">{description}</Text>
  </div>
);

export function IntegrationMenu({ integrationsModal }: { integrationsModal: any }) {
  const { t } = useTranslation('common');
  const cookie = getCookie('INTEGRATIONS_PASSWORD');
  const form = useForm({
    initialValues: {
      password: '',
    },
  });
  const checkLogin = api.system.checkLogin.useQuery(
    { password: cookie?.toString() },
    { enabled: !!cookie, retry: false }
  );
  const mutation = api.system.tryPassword.useMutation({
    onError(error, variables, context) {
      notifications.show({
        title: 'There was an error',
        message: error.message,
        color: 'red',
      });
    },
  });
  if (mutation.isLoading)
    return <Menu.Item icon={<Loader size={18} />}>{t('sections.integrations')}</Menu.Item>;
  return (
    <Menu.Item
      closeMenuOnClick={checkLogin.isSuccess}
      icon={<IconPlugConnected strokeWidth={1.2} size={18} />}
      {...(checkLogin.isSuccess && { onClick: integrationsModal.open })}
    >
      <Stack>
        {t('sections.integrations')}
        {!checkLogin.isSuccess && (
          <form
            onSubmit={form.onSubmit(({ password }) => {
              mutation.mutate({ password });
              setCookie('INTEGRATIONS_PASSWORD', password);
              checkLogin.refetch();
            })}
          >
            <PasswordInput autoComplete="off" {...form.getInputProps('password')} />
          </form>
        )}
      </Stack>
    </Menu.Item>
  );
}

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
  const cookie = getCookie('INTEGRATIONS_PASSWORD');
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(api.system.checkLogin, { password: cookie?.toString() }, 'query');
  let integrations: AppIntegrationType[] | undefined = queryClient.getQueryData(queryKey);
  if (!integrations) {
    integrations = [];
  }

  // Fill configIntegrationList with config.integrations in the
  const configIntegrationList: IntegrationGroupedType[] = [];
  integrations.forEach((configIntegration) => {
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
          <Accordion.Item
            value={integration.label ?? integration.value}
            key={configIntegration.type}
          >
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
