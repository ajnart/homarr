import { Button, Group, Stack, TextInput, useMantineTheme } from '@mantine/core';
import { UseFormReturnType, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { QueryKey, useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { getCookie } from 'cookies-next';
import { produce } from 'immer';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { IntegrationTab } from '~/components/Dashboard/Modals/EditAppModal/Tabs/IntegrationTab/IntegrationTab';
import { AppType } from '~/types/app';
import { IntegrationTypeMap } from '~/types/config';
import { api } from '~/utils/api';

const defaultAppValues: AppType = {
  id: uuidv4(),
  name: 'Your app',
  url: 'https://homarr.dev',
  appearance: {
		iconUrl: '/imgs/logo/logo.png',
		appNameStatus: 'normal',
		positionAppName: '-moz-initial',
		lineClampAppName: 2
	},
  network: {
    enabledStatusChecker: true,
    statusCodes: ['200', '301', '302', '304', '307', '308'],
    okStatus: [200, 301, 302, 304, 307, 308],
  },
  behaviour: {
    isOpeningNewTab: true,
    externalUrl: '',
  },

  area: {
    type: 'wrapper',
    properties: {
      id: 'default',
    },
  },
  shape: {},
  integration: {
    id: uuidv4(),
    url: '',
    type: undefined,
    properties: [],
    name: 'New integration',
  },
};

export function AddIntegrationPanel({
  globalForm,
  queryKey,
  integrations,
  setIntegrations,
}: {
  globalForm: UseFormReturnType<any>;
  queryKey: QueryKey;
  integrations: IntegrationTypeMap | undefined;
  setIntegrations: React.Dispatch<React.SetStateAction<IntegrationTypeMap | undefined>>;
}) {
  const { t } = useTranslation(['board/integrations', 'common']);
  const queryClient = useQueryClient();
  const { primaryColor } = useMantineTheme();

  const form = useForm<AppType>({
    initialValues: defaultAppValues,
  });

  if (!integrations) {
    return null;
  }

  return (
    <form
      onSubmit={form.onSubmit(({ integration }) => {
        if (!integration.type || !integrations) return null;
        const newIntegrations = produce(integrations, (draft) => {
          integration.id = uuidv4();
          // console.log(integration.type);
          if (!integration.type) return;
          // If integration type is not in integrations, add it
          if (!draft[integration.type]) {
            draft[integration.type] = [];
          }
          draft[integration.type].push(integration);
        });
        // queryClient.setQueryData(queryKey, newIntegrations);
        form.reset();
        setIntegrations(newIntegrations);
        notifications.show({
          title: t('integration.Added'),
          message: t('integration.AddedDescription', { name: integration.name }),
          color: 'green',
        });
      })}
    >
      <Stack>
        <Group grow>
          <TextInput
            withAsterisk
            required
            label={'URL'}
            description={t('integration.urlDescription')}
            placeholder="http://localhost:3039"
            {...form.getInputProps('integration.url')}
          />
          <TextInput
            withAsterisk
            required
            label={t('integration.name')}
            description={t('integration.nameDescription')}
            placeholder="My integration"
            {...form.getInputProps('integration.name')}
          />
        </Group>
        <IntegrationTab form={form} />
        <Button type="submit" color={primaryColor} variant="light">
          {t('common:add')}
        </Button>
      </Stack>
    </form>
  );
}
