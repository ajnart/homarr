import { Alert, Button, Group, Popover, Stack, Tabs, Text, ThemeIcon } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { ContextModalProps } from '@mantine/modals';
import {
  IconAccessPoint,
  IconAdjustments,
  IconAlertTriangle,
  IconBrush,
  IconClick,
  IconPlug,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { removeTrailingSlash } from 'next/dist/shared/lib/router/utils/remove-trailing-slash';
import { useState } from 'react';
import { useConfigContext } from '~/config/provider';
import { useConfigStore } from '~/config/store';
import { AppType } from '~/types/app';

import { DebouncedImage } from '../../../IconSelector/DebouncedImage';
import { useEditModeStore } from '../../Views/useEditModeStore';
import { AppearanceTab } from './Tabs/AppereanceTab/AppereanceTab';
import { BehaviourTab } from './Tabs/BehaviourTab/BehaviourTab';
import { GeneralTab } from './Tabs/GeneralTab/GeneralTab';
import { IntegrationTab } from './Tabs/IntegrationTab/IntegrationTab';
import { NetworkTab } from './Tabs/NetworkTab/NetworkTab';
import { EditAppModalTab } from './Tabs/type';

const appUrlRegex =
  '(https?://(?:www.|(?!www))\\[?[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\]?.[^\\s]{2,}|www.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^\\s]{2,}|https?://(?:www.|(?!www))\\[?[a-zA-Z0-9]+\\]?.[^\\s]{2,}|www.[a-zA-Z0-9]+.[^\\s]{2,})';

const appUrlWithAnyProtocolRegex =
  '([A-z]+://(?:www.|(?!www))\\[?[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\]?.[^\\s]{2,}|www.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^\\s]{2,}|[A-z]+://(?:www.|(?!www))\\[?[a-zA-Z0-9]+\\]?.[^\\s]{2,}|www.[a-zA-Z0-9]+.[^\\s]{2,})';

export const EditAppModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{ app: AppType; allowAppNamePropagation: boolean }>) => {
  const { t } = useTranslation(['layout/modals/add-app', 'common']);
  const { name: configName, config } = useConfigContext();
  const updateConfig = useConfigStore((store) => store.updateConfig);
  const { enabled: isEditMode } = useEditModeStore();
  const [allowAppNamePropagation, setAllowAppNamePropagation] = useState<boolean>(
    innerProps.allowAppNamePropagation
  );

  const form = useForm<AppType>({
    initialValues: innerProps.app,
    validate: {
      name: (name) => (!name ? t('validation.name') : null),
      url: (url) => {
        if (!url) {
          return t('validation.noUrl');
        }

        if (!url.match(appUrlRegex)) {
          return t('validation.invalidUrl');
        }

        return null;
      },
      appearance: {
        iconUrl: (url: string) => {
          if (url.length < 1) {
            return t('validation.noIconUrl');
          }

          return null;
        },
      },
      behaviour: {
        externalUrl: (url: string) => {
          if (url === undefined || url.length < 1) {
            return t('validation.noExternalUri');
          }

          if (
            !url.match(appUrlWithAnyProtocolRegex) &&
            !url.startsWith('[homarr_base]') &&
            !url.startsWith('[homarr_protocol]://')
          ) {
            return t('validation.invalidExternalUri');
          }

          return null;
        },
      },
    },
    validateInputOnChange: true,
  });

  const onSubmit = (values: AppType) => {
    if (!configName) {
      return;
    }

    values.url = removeTrailingSlash(values.url);

    void updateConfig(
      configName,
      (previousConfig) => ({
        ...previousConfig,
        apps: [
          ...previousConfig.apps.filter((x) => x.id !== values.id),
          {
            ...values,
          },
        ],
      }),
      true,
      !isEditMode
    );

    // also close the parent modal
    context.closeAll();
    umami.track('Add app', { name: values.name });
  };

  const [activeTab, setActiveTab] = useState<EditAppModalTab>('general');

  const closeModal = () => {
    context.closeModal(id);
  };

  const validationErrors = Object.keys(form.errors);

  const ValidationErrorIndicator = ({ keys }: { keys: string[] }) => {
    const relevantErrors = validationErrors.filter((x) => keys.includes(x));

    return (
      <ThemeIcon
        opacity={relevantErrors.length === 0 ? 0 : 1}
        color="red"
        size={18}
        variant="light"
      >
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
        <DebouncedImage src={form.values.appearance.iconUrl} width={120} height={120} />

        <Text align="center" weight="bold" size="lg" mt="md">
          {form.values.name ?? 'New App'}
        </Text>
      </Stack>

      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack
          justify="space-between"
          style={{
            minHeight: 300,
          }}
        >
          <Tabs
            value={activeTab}
            onTabChange={(tab) => setActiveTab(tab as EditAppModalTab)}
            defaultValue="general"
            radius="md"
          >
            <Tabs.List grow>
              <Tabs.Tab
                rightSection={<ValidationErrorIndicator keys={['name', 'url']} />}
                icon={<IconAdjustments size={14} />}
                value="general"
              >
                {t('tabs.general')}
              </Tabs.Tab>
              <Tabs.Tab
                rightSection={<ValidationErrorIndicator keys={['behaviour.externalUrl']} />}
                icon={<IconClick size={14} />}
                value="behaviour"
              >
                {t('tabs.behaviour')}
              </Tabs.Tab>
              <Tabs.Tab
                rightSection={<ValidationErrorIndicator keys={[]} />}
                icon={<IconAccessPoint size={14} />}
                value="network"
              >
                {t('tabs.network')}
              </Tabs.Tab>
              <Tabs.Tab
                rightSection={<ValidationErrorIndicator keys={['appearance.iconUrl']} />}
                icon={<IconBrush size={14} />}
                value="appearance"
              >
                {t('tabs.appearance')}
              </Tabs.Tab>
              <Tabs.Tab
                rightSection={<ValidationErrorIndicator keys={[]} />}
                icon={<IconPlug size={14} />}
                value="integration"
              >
                {t('tabs.integration')}
              </Tabs.Tab>
            </Tabs.List>

            <GeneralTab form={form} openTab={(targetTab) => setActiveTab(targetTab)} />
            <BehaviourTab form={form} />
            <NetworkTab form={form} />
            <AppearanceTab
              form={form}
              disallowAppNamePropagation={() => setAllowAppNamePropagation(false)}
              allowAppNamePropagation={allowAppNamePropagation}
            />
            <IntegrationTab form={form} />
          </Tabs>

          <Group noWrap position="right" mt="md">
            <Button onClick={closeModal} px={50} variant="light" color="gray">
              {t('common:cancel')}
            </Button>
            <SaveButton formIsValid={form.isValid()} />
          </Group>
        </Stack>
      </form>
    </>
  );
};

const SaveButton = ({ formIsValid }: { formIsValid: boolean }) => {
  const [opened, { close, open }] = useDisclosure(false);
  const { t } = useTranslation(['layout/modals/add-app', 'common']);

  return (
    <Popover opened={opened && !formIsValid} width={300} withArrow withinPortal>
      <Popover.Target>
        <div onMouseEnter={open} onMouseLeave={close}>
          <Button disabled={!formIsValid} px={50} type="submit">
            {t('common:save')}
          </Button>
        </div>
      </Popover.Target>
      <Popover.Dropdown sx={{ pointerEvents: 'none' }}>{t('validation.popover')}</Popover.Dropdown>
    </Popover>
  );
};
