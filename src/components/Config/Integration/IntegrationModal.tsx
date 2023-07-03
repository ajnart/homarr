import {
  Accordion,
  ActionIcon,
  Button,
  Group,
  Image,
  Loader,
  Menu,
  Modal,
  PasswordInput,
  SelectItem,
  Stack,
  Text,
  TextInput,
  Title,
  rem,
  useMantineTheme,
} from '@mantine/core';
import { AccordionItem } from '@mantine/core/lib/Accordion/AccordionItem/AccordionItem';
import { UseFormReturnType, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconCheck,
  IconCircle0Filled,
  IconCircleX,
  IconCircleXFilled,
  IconDeviceFloppy,
  IconLock,
  IconPlug,
  IconPlugConnected,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { getCookie, setCookie } from 'cookies-next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { integrationsList } from '~/components/Dashboard/Modals/EditAppModal/Tabs/IntegrationTab/Components/InputElements/IntegrationSelector';
import { useConfigContext } from '~/config/provider';
import { AppIntegrationType, IntegrationType } from '~/types/app';
import { IntegrationTypeMap } from '~/types/config';
import { api } from '~/utils/api';

import { AddIntegrationPanel } from './AddIntegrationPanel';

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
            <PasswordInput
              size="sm"
              radius="md"
              autoComplete="off"
              icon={<IconLock size="1rem" />}
              visibilityToggleLabel={undefined}
              {...form.getInputProps('password')}
            />
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
  const { t } = useTranslation('settings/integrations');

  return (
    <Accordion.Item key={integration.id} value={integration.id}>
      <Accordion.Control>{integration.name}</Accordion.Control>
      <Accordion.Panel>
        <Stack>
          <Group grow>
            <TextInput
              withAsterisk
              required
              label={'URL'}
              description={t('integration.urlDescription')}
              placeholder="http://localhost:3039"
              {...form.getInputProps(`${integration.type}.${integrationIdx}.url`)}
            />
            <TextInput
              withAsterisk
              required
              label={t('integrationName')}
              description={t('integrationNameDescription')}
              placeholder="My integration"
              {...form.getInputProps(`${integration.type}.${integrationIdx}.name`)}
            />
          </Group>
          {integration.properties.map((property, idx) => {
            if (property.type === 'private')
              return (
                <PasswordInput
                  key={property.field}
                  label={property.field}
                  {...form.getInputProps(
                    `${integration.type}.${integrationIdx}.properties.${idx}.value`
                  )}
                />
              );
            else if (property.type === 'public')
              return (
                <TextInput
                  key={property.field}
                  label={property.field}
                  {...form.getInputProps(
                    `${integration.type}.${integrationIdx}.properties.${idx}.value`
                  )}
                />
              );
          })}
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
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

export function IntegrationsAccordion({ closeModal }: { closeModal: () => void }) {
  const { t } = useTranslation('settings/integrations, common');
  const cookie = getCookie('INTEGRATIONS_PASSWORD');
  const queryClient = useQueryClient();
  const { primaryColor } = useMantineTheme();
  const queryKey = getQueryKey(api.system.checkLogin, { password: cookie?.toString() }, 'query');
  let integrationsQuery: IntegrationTypeMap | undefined = queryClient.getQueryData(queryKey);
  const mutation = api.config.save.useMutation();
  const { config, name } = useConfigContext();
  const [isLoading, setIsLoading] = useState(false);
  const [integrations, setIntegrations] = useState<IntegrationTypeMap | undefined>(
    integrationsQuery
  );
  if (!integrations) {
    return null;
  }

  const form = useForm({
    initialValues: integrationsQuery,
  });
  // Loop over integrations item
  useEffect(() => {
    if (!integrations) return;
    form.setValues(integrations);
  }, [integrations]);

  return (
    <Stack>
      <Accordion variant="separated" multiple>
        {Object.keys(integrations).map((item) => {
          if (!integrations) return null;
          const configIntegrations = integrations[item as keyof IntegrationTypeMap];
          const integrationListItem = integrationsList.find(
            (integration) => integration.value === item
          );
          if (!configIntegrations || !integrationListItem) return null;
          return (
            <Accordion.Item value={integrationListItem.value} key={integrationListItem.value}>
              <Accordion.Control
                icon={
                  <Image
                    src={integrationListItem.image}
                    withPlaceholder
                    width={24}
                    height={24}
                    alt={integrationListItem.value}
                  />
                }
              >
                {integrationListItem.label}
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
        <Accordion.Item value="add-new">
          <Accordion.Control
            chevron={
              <ActionIcon color={primaryColor} radius={'lg'} size={'md'} variant="light">
                <IconPlus />
              </ActionIcon>
            }
            icon={<IconPlug stroke={2} />}
          >
            {t('addNewIntegration')}
          </Accordion.Control>
          <Accordion.Panel>
            <AddIntegrationPanel
              globalForm={form}
              queryKey={queryKey}
              integrations={integrations}
              setIntegrations={setIntegrations}
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Group position="right">
        <Button
          type="submit"
          variant="light"
          color="red"
          leftIcon={<IconCircleX />}
          onClick={() => {
            queryClient.invalidateQueries(queryKey);
            closeModal();
          }}
        >
          {t('common:close')}
        </Button>
        <Button
          variant="light"
          loading={isLoading}
          leftIcon={<IconDeviceFloppy />}
          onClick={() => {
            setIsLoading(true);
            mutation
              .mutateAsync({
                config: {
                  ...config,
                  integrations: form.values,
                },
                name: name!,
              })
              .then(() => {
                notifications.show({
                  icon: <IconCheck />,
                  title: t('common:success'),
                  message: t('savedSuccessfully'),
                  color: 'green',
                });
                setIsLoading(false);
                setIntegrations(form.values);
                queryClient.invalidateQueries(queryKey);
              });
          }}
        >
          {t('common:save')}
        </Button>
      </Group>
    </Stack>
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
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
      onClose={() => closeModal()}
      size={rem(1000)}
    >
      <IntegrationsAccordion closeModal={closeModal} />
    </Modal>
  );
}
