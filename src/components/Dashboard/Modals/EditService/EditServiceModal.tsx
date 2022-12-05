import { Button, createStyles, Group, Stack, Tabs, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ContextModalProps } from '@mantine/modals';
import { hideNotification, showNotification } from '@mantine/notifications';
import {
  IconAccessPoint,
  IconAdjustments,
  IconBrush,
  IconClick,
  IconDeviceFloppy,
  IconDoorExit,
  IconPlug,
} from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { ServiceType } from '../../../../types/service';
import { AppearanceTab } from './Tabs/AppereanceTab/AppereanceTab';
import { BehaviourTab } from './Tabs/BehaviourTab/BehaviourTab';
import { GeneralTab } from './Tabs/GeneralTab/GeneralTab';
import { IntegrationTab } from './Tabs/IntegrationTab/IntegrationTab';
import { NetworkTab } from './Tabs/NetworkTab/NetworkTab';

export const EditServiceModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{ service: ServiceType }>) => {
  const { t } = useTranslation();
  const { classes } = useStyles();

  const form = useForm<ServiceType>({
    initialValues: innerProps.service,
  });

  const onSubmit = (values: ServiceType) => {
    console.log('form submitted');
    console.log(values);
  };

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

  return (
    <>
      <Stack spacing={0} align="center" my="lg">
        {form.values.appearance.iconUrl ? (
          // disabled because image target is too dynamic for next image cache
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={classes.serviceImage}
            src={form.values.appearance.iconUrl}
            width={120}
            height={120}
            alt="service icon"
          />
        ) : (
          <Image src="/favicon-squared.png" width={120} height={120} />
        )}

        <Text align="center" weight="bold" size="lg" mt="md">
          {form.values.name ?? 'New Service'}
        </Text>
      </Stack>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Tabs defaultValue="general">
          <Tabs.List grow>
            <Tabs.Tab value="general" icon={<IconAdjustments size={14} />}>
              General
            </Tabs.Tab>
            <Tabs.Tab value="behaviour" icon={<IconClick size={14} />}>
              Behaviour
            </Tabs.Tab>
            <Tabs.Tab value="network" icon={<IconAccessPoint size={14} />}>
              Network
            </Tabs.Tab>
            <Tabs.Tab value="appearance" icon={<IconBrush size={14} />}>
              Appearance
            </Tabs.Tab>
            <Tabs.Tab value="integration" icon={<IconPlug size={14} />}>
              Integration
            </Tabs.Tab>
          </Tabs.List>

          <GeneralTab form={form} />
          <BehaviourTab form={form} />
          <NetworkTab form={form} />
          <AppearanceTab form={form} />
          <IntegrationTab form={form} />
        </Tabs>

        <Group position="right" mt={100}>
          <Button
            leftIcon={<IconDoorExit size={20} />}
            px={50}
            variant="light"
            color="gray"
            onClick={tryCloseModal}
          >
            Cancel
          </Button>
          <Button type="submit" leftIcon={<IconDeviceFloppy size={20} />} px={50}>
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
