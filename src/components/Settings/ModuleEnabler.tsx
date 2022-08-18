import { Checkbox, SimpleGrid, Stack, Title } from '@mantine/core';
import { t } from 'i18next';
import * as Modules from '../../modules';
import { useConfig } from '../../tools/state';

export default function ModuleEnabler(props: any) {
  const { config, setConfig } = useConfig();
  const modules = Object.values(Modules).map((module) => module);
  return (
    <Stack>
      <Title order={4}>{t('settings.tabs.common.settings.moduleEnabler.title')}</Title>
      <SimpleGrid cols={3} spacing="xs">
        {modules.map((module) => (
          <Checkbox
            key={module.title}
            size="md"
            checked={config.modules?.[module.title]?.enabled ?? false}
            label={`${module.title}`}
            onChange={(e) => {
              setConfig({
                ...config,
                modules: {
                  ...config.modules,
                  [module.title]: {
                    ...config.modules?.[module.title],
                    enabled: e.currentTarget.checked,
                  },
                },
              });
            }}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
