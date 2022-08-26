import { Checkbox, HoverCard, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import * as Modules from '../../modules';
import { IModule } from '../../modules/ModuleTypes';
import { useConfig } from '../../tools/state';

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
  const { config, setConfig } = useConfig();
  const { t } = useTranslation(`modules/${module.id}`);

  return (
    <HoverCard withArrow withinPortal width={200} shadow="md" openDelay={200}>
      <HoverCard.Target>
        <Checkbox
          key={module.id}
          size="md"
          checked={config.modules?.[module.id]?.enabled ?? false}
          label={t('descriptor.name', {
            defaultValue: 'Unknown',
          })}
          onChange={(e) => {
            setConfig({
              ...config,
              modules: {
                ...config.modules,
                [module.id]: {
                  ...config.modules?.[module.id],
                  enabled: e.currentTarget.checked,
                },
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
