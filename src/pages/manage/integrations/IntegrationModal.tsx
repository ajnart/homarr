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
  Popover,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
  rem,
  useMantineTheme,
} from '@mantine/core';
import { UseFormReturnType, useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  IconCheck,
  IconCircleX,
  IconDeviceFloppy,
  IconExternalLink,
  IconKey,
  IconLock,
  IconPassword,
  IconPlug,
  IconPlugConnected,
  IconPlus,
  IconQuestionMark,
  IconTestPipe,
  IconTrash,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { getCookie, setCookie } from 'cookies-next';
import { produce } from 'immer';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { integrationsList } from '~/components/Dashboard/Modals/EditAppModal/Tabs/IntegrationTab/Components/InputElements/IntegrationSelector';
import { useConfigContext } from '~/config/provider';
import { Integration } from '~/types/app';
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
  integrations,
  setIntegrations,
  integrationIdx,
  form,
}: {
  integration: Integration;
  integrations: IntegrationTypeMap;
  setIntegrations: (integrations: IntegrationTypeMap) => void;
  integrationIdx: number;
  form: UseFormReturnType<any>;
}) {
  if (!integration.type) return null;
  const { t } = useTranslation(['settings/integrations', 'common']);
  const mutation = api.system.testIntegration.useMutation();

  return (
    <Accordion.Item key={integration.id} value={integration.id}>
      <Accordion.Control>{integration.name}</Accordion.Control>
      <Accordion.Panel>
        <Stack>
          <Group grow>
            <TextInput
              defaultValue={integration.url}
              label={'URL'}
              description={t('integration.urlDescription')}
              placeholder="http://localhost:3039"
              rightSection={
                <Link passHref target="_blank" href={integration.url}>
                  <ActionIcon>
                    <IconExternalLink />
                  </ActionIcon>
                </Link>
              }
              {...form.getInputProps(`${integration.type}.${integrationIdx}.url`)}
            />
            <TextInput
              defaultValue={integration.name}
              label={t('integration.name')}
              description={t('integration.nameDescription')}
              placeholder="My integration"
              {...form.getInputProps(`${integration.type}.${integrationIdx}.name`)}
            />
          </Group>
          <Group grow>
            {integration.properties.map((property, idx) => {
              if (!property.value) return null;
              if (property.type === 'private')
                return (
                  <PasswordInput
                    icon={property.field === 'password' ? <IconLock /> : <IconKey />}
                    defaultValue={property.value}
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
                    icon={property.field === 'username' ? <IconUser /> : <IconQuestionMark />}
                    defaultValue={property.value}
                    key={property.field}
                    label={property.field}
                    {...form.getInputProps(
                      `${integration.type}.${integrationIdx}.properties.${idx}.value`
                    )}
                  />
                );
            })}
          </Group>
          <Group position="right">
            <Popover width="auto" position="bottom" withArrow shadow="md">
              <Popover.Target>
                <Button px="xl" variant="light" leftIcon={<IconTrash />}>
                  {t('common:delete')}
                </Button>
              </Popover.Target>
              <Popover.Dropdown>
                <Stack>
                  <Title order={3}>{t('common:delete')}</Title>
                  <Text size="sm">{t('deleteConfirmation', { name: integration.name })}</Text>
                  <Group grow>
                    <Button
                      variant="light"
                      color="red"
                      onClick={() => {
                        // Use produce to create a new object with the integration removed
                        setIntegrations(
                          produce(integrations, (draft) => {
                            draft[integration.type!].splice(integrationIdx, 1);
                            // Remove the type if there are no integrations left
                            if (draft[integration.type!].length === 0)
                              delete draft[integration.type!];
                          })
                        );
                      }}
                    >
                      {t('common:delete')}
                    </Button>
                  </Group>
                </Stack>
              </Popover.Dropdown>
            </Popover>
            <Button
              variant="light"
              px="xl"
              onClick={() => {
                mutation.mutate({
                  integration: integration,
                });
              }}
              loading={mutation.isLoading}
              color="orange"
              leftIcon={
                // If no success or error, show the test pipe, if success show the checkmark, if error show the x
                mutation.isSuccess ? <IconCheck /> : mutation.isError ? <IconX /> : <IconTestPipe />
              }
            >
              {t('common:test')}
            </Button>
          </Group>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}

export function SecretsInputs({
  integration,
  integrationIdx,
  form,
}: {
  integration: Integration;
  integrationIdx: number;
  form: UseFormReturnType<any>;
}) {
  const { t } = useTranslation('settings/integrations');
  return (
    <Group grow noWrap>
      {integration.properties.map((property, idx) => {
        if (!property.value) return null;

        switch (property.field) {
          case 'apiKey':
            return (
              <Group align="end">
                <Tooltip label={t('fields.apikey')}>
                  <ThemeIcon variant="light" radius="md" size="xl">
                    <IconKey size={rem(20)} />
                  </ThemeIcon>
                </Tooltip>
                <PasswordInput
                  styles={{ root: { width: 200 } }}
                  size="md"
                  defaultValue={property.value}
                  key={property.field}
                  label={property.field}
                  {...form.getInputProps(
                    `${integration.type}.${integrationIdx}.properties.${idx}.value`
                  )}
                />
              </Group>
            );
          case 'username':
            return (
              <Group>
                <Tooltip label={t('fields.apikey')}>
                  <ThemeIcon variant="light" radius="md" size="lg">
                    <IconUser />
                  </ThemeIcon>
                </Tooltip>
                <TextInput
                  styles={{ root: { width: 200 } }}
                  defaultValue={property.value}
                  key={property.field}
                  label={property.field}
                  {...form.getInputProps(
                    `${integration.type}.${integrationIdx}.properties.${idx}.value`
                  )}
                />
              </Group>
            );
          case 'password':
            return (
              <Group>
                <Tooltip label={t('fields.password')}>
                  <ThemeIcon variant="light" radius="md" size="lg">
                    <IconPassword />
                  </ThemeIcon>
                </Tooltip>
                <PasswordInput
                  styles={{ root: { width: 200 } }}
                  defaultValue={property.value}
                  key={property.field}
                  label={property.field}
                  {...form.getInputProps(
                    `${integration.type}.${integrationIdx}.properties.${idx}.value`
                  )}
                />
              </Group>
            );
          // Other case
          default:
            return (
              <Group>
                <Tooltip label={t('fields.unknown')}>
                  <ThemeIcon variant="light" radius="md" size="lg">
                    <IconQuestionMark />
                  </ThemeIcon>
                </Tooltip>
                <TextInput
                  styles={{ root: { width: 200 } }}
                  defaultValue={property.value}
                  key={property.field}
                  label={property.field}
                  {...form.getInputProps(
                    `${integration.type}.${integrationIdx}.properties.${idx}.value`
                  )}
                />
              </Group>
            );
        }
      })}
    </Group>
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
  [key: string]: Integration;
}

export function IntegrationsAccordion({ closeModal }: { closeModal: () => void }) {
  const { t } = useTranslation('settings/integrations, common');
  const cookie = getCookie('INTEGRATIONS_PASSWORD');
  const queryClient = useQueryClient();
  const { primaryColor } = useMantineTheme();
  const integrationsQuery: IntegrationTypeMap | undefined = queryClient.getQueryData(queryKey);
  const mutation = api.config.save.useMutation();
  const { config, name } = useConfigContext();
  const [isLoading, setIsLoading] = useState(false);
  const [integrations, setIntegrations] = useState<IntegrationTypeMap | undefined>(
    integrationsQuery
  );
  if (!integrations) {
    return null;
  }

  let form = useForm({
    initialValues: integrationsQuery,
  });

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
                        key={integration.id}
                        integrationIdx={integrationIdx}
                        form={form}
                        integration={integration}
                        integrations={integrations}
                        setIntegrations={setIntegrations}
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
            {t('settings/integrations:addNewIntegration')}
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
            console.log(integrations);
            setIsLoading(true);
            mutation
              .mutateAsync({
                config: {
                  ...config,
                  integrations: integrations,
                },
                name: name!,
              })
              .then(() => {
                notifications.show({
                  icon: <IconCheck />,
                  title: t('common:success'),
                  message: t('settings/integrations:savedSuccessfully'),
                  color: 'green',
                });
                setIsLoading(false);
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
      onClose={() =>
        modals.openConfirmModal({
          withCloseButton: false,
          title: t('CloseConfirmation'),
          children: <Text>{t('CloseConfirmationExplanation')}</Text>,
          labels: { confirm: 'Close it anyways', cancel: 'Cancel' },
          onConfirm: closeModal,
        })
      }
      fullScreen
    >
      <IntegrationsAccordion closeModal={closeModal} />
    </Modal>
  );
}
