import { Checkbox, SimpleGrid, Stack, Title } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import * as Modules from '../../modules';
import { useConfig } from '../../tools/state';

export default function ModuleEnabler(props: any) {
  const { config, setConfig } = useConfig();
  const { t } = useTranslation('settings/general/module-enabler');
  const modules = Object.values(Modules).map((module) => module);
  return (
    <Stack>
      <Title order={4}>{t('title')}</Title>
      <SimpleGrid cols={3} spacing="xs">
        {modules.map((module) => {
          const { t: translationModules } = useTranslation(module.translationNamespace);
          return (
            <Checkbox
              key={module.title}
              size="md"
              checked={config.modules?.[module.title]?.enabled ?? false}
              label={translationModules(module.title, {
                defaultValue: 'UNKNOWN MODULE NAME',
              })}
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
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
