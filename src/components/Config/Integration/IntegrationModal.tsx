import {
  Accordion,
  Image,
  Loader,
  Menu,
  Modal,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  rem,
} from '@mantine/core';
import { UseFormReturnType, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconPlugConnected } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { getCookie, setCookie } from 'cookies-next';
import { useTranslation } from 'react-i18next';
import { integrationsList } from '~/components/Dashboard/Modals/EditAppModal/Tabs/IntegrationTab/Components/InputElements/IntegrationSelector';
import { AppIntegrationType, IntegrationType } from '~/types/app';
import { IntegrationTypeMap } from '~/types/config';
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

function IntegrationDisplay({
  integration,
  integrationIdx,
  form,
}: {
  integration: AppIntegrationType;
  integrationIdx: number;
  form: UseFormReturnType<any>;
}) {
  if (!integration.type) return null;

  return (
    <Accordion.Item value={integration.id}>
      <Accordion.Control>{integration.name}</Accordion.Control>
      <Accordion.Panel>
        <Stack>
          <TextInput label="url" {...form.getInputProps(`${integration.type}.${integrationIdx}.url`)} />
          {integration.properties.map((property, idx) => {
            const test = form.getInputProps(`${integration.type}.${integrationIdx}.properties.${idx}.value`);
            if (property.type === 'private')
              return (
                <PasswordInput
                  label={property.field}
                  {...form.getInputProps(`${integration.type}.${integrationIdx}.properties.${idx}.value`)}
                />
              );
            else if (property.type === 'public')
              return (
                <TextInput
                  label={property.field}
                  {...form.getInputProps(`${integration.type}.${integrationIdx}.properties.${idx}.value`)}
                />
              );
          })}
        </Stack>
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

export interface IntegrationObject {
  [key: string]: AppIntegrationType;
}

export function IntegrationsAccordion() {
  const cookie = getCookie('INTEGRATIONS_PASSWORD');
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(api.system.checkLogin, { password: cookie?.toString() }, 'query');
  let integrations: IntegrationTypeMap | undefined = queryClient.getQueryData(queryKey);
  if (!integrations) {
    return null;
  }

  const form = useForm({
    initialValues: integrations,
  });
  // Loop over integrations item

  return (
    <Accordion variant="separated" multiple>
      {Object.keys(integrations).map((item) => {
        if (!integrations) return null;
        const configIntegrations = integrations[item as keyof IntegrationTypeMap];
        console.log('CONFIG INTEGRATIONS', configIntegrations);
        const image: string | undefined = integrationsList.find(
          (i) => i.value === configIntegrations[0].type
        )?.image;
        const integration = configIntegrations[0];
        return (
          <Accordion.Item value={integration.type ?? integration.name} key={integration.type}>
            <Accordion.Control
              icon={
                <Image
                  src={image}
                  withPlaceholder
                  width={24}
                  height={24}
                  alt={integration.type ?? integration.name}
                />
              }
            >
              {integration.name}
            </Accordion.Control>
            <Accordion.Panel>
              <Accordion variant="separated" radius="md" multiple>
                {configIntegrations.map((integration, integrationIdx) => {
                  return (
                    <IntegrationDisplay
                      integrationIdx={integrationIdx}
                      form={form}
                      integration={integration}
                    />
                  );
                })}
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
