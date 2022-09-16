import {
  GetConfigDocument,
  GetConfigQuery,
  GetConfigQueryVariables,
  useGetConfigQuery,
  useUpdateConfigMutation,
} from '@homarr/graphql';
import { Checkbox, HoverCard, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import * as Modules from '../../modules';
import { IModule } from '../../modules/ModuleTypes';

export default function ModuleEnabler(props: any) {
  const { t } = useTranslation('settings/general/module-enabler');
  const modules = Object.values(Modules).map((module) => module);
  return (
    <Stack>
      <Title order={4}>{t('title')}</Title>
      <SimpleGrid cols={3} spacing="sm">
        {modules.map((module) => (
          <ModuleToggle key={module.id} module={module} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}

const ModuleToggle = ({ module }: { module: IModule }) => {
  const { t } = useTranslation(`modules/${module.id}`);

  const { data } = useGetConfigQuery({ variables: { configName: 'default' } });
  const [updateConfig, { loading }] = useUpdateConfigMutation({
    update(cache, { data }) {
      if (data) {
        cache.writeQuery<GetConfigQuery, GetConfigQueryVariables>({
          data: {
            config: data.updateConfig,
          },
          query: GetConfigDocument,
          variables: { configName: 'default' },
        });
      }
    },
    optimisticResponse({ body }) {
      return { updateConfig: JSON.parse(body) };
    },
  });

  const modules = data?.config.modules || {};

  return (
    <HoverCard withArrow withinPortal width={200} shadow="md" openDelay={200}>
      <HoverCard.Target>
        <Checkbox
          key={module.id}
          size="md"
          checked={modules[module.dataKey]?.enabled ?? false}
          label={t('descriptor.name', {
            defaultValue: 'Unknown',
          })}
          onChange={(e) => {
            updateConfig({
              variables: {
                configName: 'default',
                body: JSON.stringify({
                  ...data!.config,
                  modules: {
                    ...data!.config.modules,
                    [module.id]: {
                      ...modules[module.dataKey],
                      enabled: e.currentTarget.checked,
                    },
                  },
                }),
              },
            });
          }}
        />
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Title order={4}>{t('descriptor.name')}</Title>
        <Text size="sm">{t('descriptor.description')}</Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
};
