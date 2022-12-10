import { Alert, Button, createStyles, Group, Stack, Tabs, Text, ThemeIcon } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ContextModalProps } from '@mantine/modals';
import { hideNotification, showNotification } from '@mantine/notifications';
import {
  IconAccessPoint,
  IconAdjustments,
  IconAlertTriangle,
  IconBrush,
  IconClick,
  IconPlug,
} from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { useState } from 'react';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';
import { ServiceType } from '../../../../types/service';
import { AppearanceTab } from './Tabs/AppereanceTab/AppereanceTab';
import { BehaviourTab } from './Tabs/BehaviourTab/BehaviourTab';
import { GeneralTab } from './Tabs/GeneralTab/GeneralTab';
import { IntegrationTab } from './Tabs/IntegrationTab/IntegrationTab';
import { NetworkTab } from './Tabs/NetworkTab/NetworkTab';
import { DebouncedServiceIcon } from './Tabs/Shared/DebouncedServiceIcon';
import { EditServiceModalTab } from './Tabs/type';

const serviceUrlRegex =
  '(https?://(?:www.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^\\s]{2,}|www.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^\\s]{2,}|https?://(?:www.|(?!www))[a-zA-Z0-9]+.[^\\s]{2,}|www.[a-zA-Z0-9]+.[^\\s]{2,})';

export const EditServiceModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{ service: ServiceType }>) => {
  const { t } = useTranslation();
  const { classes } = useStyles();
  const { name: configName, config } = useConfigContext();
  const updateConfig = useConfigStore((store) => store.updateConfig);

  const form = useForm<ServiceType>({
    initialValues: innerProps.service,
    validate: {
      name: (name) => (!name ? 'Name is required' : null),
      url: (url) => {
        if (!url) {
          return 'Url is required';
        }

        if (!url.match(serviceUrlRegex)) {
          return 'Value is not a valid url';
        }

        return null;
      },
      appearance: {
        iconUrl: (url: string) => {
          if (url.length < 1) {
            return 'This field is required';
          }

          return null;
        },
      },
      behaviour: {
        onClickUrl: (url: string) => {
          if (url === undefined || url.length < 1) {
            return null;
          }

          if (!url.match(serviceUrlRegex)) {
            return 'Uri override is not a valid uri';
          }

          return null;
        },
      },
    },
    validateInputOnChange: true,
  });

  const onSubmit = (values: ServiceType) => {
    if (!configName) {
      return;
    }

    updateConfig(configName, (previousConfig) => ({
      ...previousConfig,
      services: [...previousConfig.services.filter((x) => x.id !== form.values.id), form.values],
    }));

    // also close the parent modal
    context.closeAll();
  };

  const [activeTab, setActiveTab] = useState<EditServiceModalTab>('general');

  const tryCloseModal = () => {
    if (form.isDirty()) {
      showNotification({
        id: 'unsaved-edit-service-modal-changes',
        title: 'You have unsaved changes',
        message: (
          <Stack>
            <Text color="dimmed">If you close, your changes will be discarded and not saved.</Text>
            <Button
              onClick={() => {
                context.closeModal(id);
                hideNotification('unsaved-edit-service-modal-changes');
              }}
              variant="light"
            >
              Close anyway
            </Button>
          </Stack>
        ),
      });
      return;
    }

    context.closeModal(id);
  };

  const validationErrors = Object.keys(form.errors);

  const ValidationErrorIndicator = ({ keys }: { keys: string[] }) => {
    const relevantErrors = validationErrors.filter((x) => keys.includes(x));

    return (
      <ThemeIcon opacity={relevantErrors.length === 0 ? 0 : 1} color="red" variant="light">
        <IconAlertTriangle size={15} />
      </ThemeIcon>
    );
  };

  return (
    <>
      {configName === undefined ||
        (config === undefined && (
          <Alert color="red">
            There was an unexpected problem loading the configuration. Functionality might be
            restricted. Please report this incident.
          </Alert>
        ))}
      <Stack spacing={0} align="center" my="lg">
        <DebouncedServiceIcon form={form} width={120} height={120} />

        <Text align="center" weight="bold" size="lg" mt="md">
          {form.values.name ?? 'New Service'}
        </Text>
      </Stack>

      <form onSubmit={form.onSubmit(onSubmit)}>
        <Tabs
          value={activeTab}
          onTabChange={(tab) => setActiveTab(tab as EditServiceModalTab)}
          defaultValue="general"
        >
          <Tabs.List grow>
            <Tabs.Tab
              rightSection={<ValidationErrorIndicator keys={['name', 'url']} />}
              icon={<IconAdjustments size={14} />}
              value="general"
            >
              General
            </Tabs.Tab>
            <Tabs.Tab
              rightSection={<ValidationErrorIndicator keys={['behaviour.onClickUrl']} />}
              icon={<IconClick size={14} />}
              value="behaviour"
            >
              Behaviour
            </Tabs.Tab>
            <Tabs.Tab
              rightSection={<ValidationErrorIndicator keys={[]} />}
              icon={<IconAccessPoint size={14} />}
              value="network"
            >
              Network
            </Tabs.Tab>
            <Tabs.Tab
              rightSection={<ValidationErrorIndicator keys={['appearance.iconUrl']} />}
              icon={<IconBrush size={14} />}
              value="appearance"
            >
              Appearance
            </Tabs.Tab>
            <Tabs.Tab
              rightSection={<ValidationErrorIndicator keys={[]} />}
              icon={<IconPlug size={14} />}
              value="integration"
            >
              Integration
            </Tabs.Tab>
          </Tabs.List>

          <GeneralTab form={form} openTab={(targetTab) => setActiveTab(targetTab)} />
          <BehaviourTab form={form} />
          <NetworkTab form={form} />
          <AppearanceTab form={form} />
          <IntegrationTab form={form} />
        </Tabs>

        <Group position="right" mt={100}>
          <Button onClick={tryCloseModal} px={50} variant="light" color="gray">
            Cancel
          </Button>
          <Button disabled={!form.isValid()} px={50} type="submit">
            Save
          </Button>
        </Group>
      </form>
    </>
  );
};

const useStyles = createStyles(() => ({
  serviceImage: {
    objectFit: 'contain',
  },
}));
